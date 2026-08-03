import { useState, useMemo, useCallback } from "react";
import { Box, Paper } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { FileBox, FileSpreadsheet } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import CustomTabs from "../../../components/CustomTabs";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import StatusChip from "../../../components/StatusChip";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import { useLocale } from "../../../hooks/useLocale";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useDateFormat } from "../../../functions/generalHelpers";
import { REFERRAL_REPORT_STATUS_CONFIG } from "../../../functions/statusChipConfigs";
import AddLetterStockModal from "./AddLetterStockModal";
import AddReferralReportModal from "./AddReferralReportModal";


const ReferralLetterPage = () => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = getDefaultMRTOptions();

  // Tab State: 'stock' | 'reports'
  const [activeTab, setActiveTab] = useState("reports");

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal States
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Mock State for Stock & Report Lists
  const [stockList, setStockList] = useState([
    {
      id: "1",
      index_number: 1,
      batchName: "2024-nji ýyl hats",
      startNo: "0332365",
      endNo: "0332384",
      count: 20,
      createdAt: "2026-08-03T00:00:00.000Z",
    },
  ]);

  const [reportList, setReportList] = useState([
    {
      id: "1",
      index_number: 1,
      date: "2026-08-03T00:00:00.000Z",
      quantity: 50,
      submittedBy: "AZAT AKMAMMEDOV",
      receivedBy: "NASIBA",
      startNo: "0354825",
      endNo: "0354974",
      status: "Satis yapildi",
    },
    {
      id: "2",
      index_number: 2,
      date: "2026-08-02T00:00:00.000Z",
      quantity: 30,
      submittedBy: "AZAT AKMAMMEDOV",
      receivedBy: "DOVRAN",
      startNo: "0354795",
      endNo: "0354824",
      status: "Töleg edildi",
    },
  ]);

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
  }, []);

  const handleOpenActiveModal = useCallback(() => {
    if (activeTab === "stock") {
      setIsStockModalOpen(true);
    } else {
      setIsReportModalOpen(true);
    }
  }, [activeTab]);

  const handleAddStock = useCallback((newStock) => {
    setStockList((prev) => [
      {
        id: String(Date.now()),
        index_number: prev.length + 1,
        createdAt: new Date().toISOString(),
        ...newStock,
      },
      ...prev,
    ]);
  }, []);

  const handleAddReport = useCallback((newReport) => {
    setReportList((prev) => [
      {
        id: String(Date.now()),
        index_number: prev.length + 1,
        date: newReport.date || new Date().toISOString(),
        ...newReport,
      },
      ...prev,
    ]);
  }, []);

  const handleDeleteStock = useCallback((id) => {
    setStockList((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleDeleteReport = useCallback((id) => {
    setReportList((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Filtered Stock List based on search
  const filteredStockList = useMemo(() => {
    if (!searchQuery.trim()) return stockList;
    const q = searchQuery.toLowerCase();
    return stockList.filter(
      (item) =>
        item.batchName?.toLowerCase().includes(q) ||
        item.startNo?.includes(q) ||
        item.endNo?.includes(q)
    );
  }, [stockList, searchQuery]);

  // Filtered Report List based on search
  const filteredReportList = useMemo(() => {
    if (!searchQuery.trim()) return reportList;
    const q = searchQuery.toLowerCase();
    return reportList.filter(
      (item) =>
        item.submittedBy?.toLowerCase().includes(q) ||
        item.receivedBy?.toLowerCase().includes(q) ||
        item.startNo?.includes(q) ||
        item.endNo?.includes(q) ||
        item.status?.toLowerCase().includes(q)
    );
  }, [reportList, searchQuery]);

  // MRT Columns for Reports Tab
  const reportsColumns = useMemo(
    () => [
      {
        accessorKey: "index_number",
        id: "index_number",
        header: "#",
        size: 60,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "date",
        id: "date",
        header: "Sene",
        size: 120,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "submittedBy",
        id: "submittedBy",
        header: "Tabşyran",
        size: 180,
      },
      {
        accessorKey: "receivedBy",
        id: "receivedBy",
        header: "Kabul eden",
        size: 180,
      },
      {
        accessorKey: "startNo",
        id: "startNo",
        header: "ÝH №-den",
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "endNo",
        id: "endNo",
        header: "ÝH № çenli",
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "quantity",
        id: "quantity",
        header: "Mukdary",
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => <strong>{cell.getValue()} sany</strong>,
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status",
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => (
          <StatusChip
            status={cell.getValue()}
            config={REFERRAL_REPORT_STATUS_CONFIG}
            size="small"
          />
        ),
      },
    ],
    [formatChange]
  );

  // MRT Columns for Stock Tab
  const stockColumns = useMemo(
    () => [
      {
        accessorKey: "index_number",
        id: "index_number",
        header: "#",
        size: 60,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "batchName",
        id: "batchName",
        header: "Partiýanyň ady",
        size: 220,
      },
      {
        accessorKey: "startNo",
        id: "startNo",
        header: "Başlangyç ÝH №",
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "endNo",
        id: "endNo",
        header: "Soňky ÝH №",
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "count",
        id: "count",
        header: "Umumy mukdary",
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => <strong>{cell.getValue()} sany hat</strong>,
      },
      {
        accessorKey: "createdAt",
        id: "createdAt",
        header: "Sene",
        size: 130,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
    ],
    [formatChange]
  );

  // Reports Table Instance
  const reportsTable = useMaterialReactTable({
    ...defaultMrtOptions,
    columns: reportsColumns,
    data: filteredReportList,
    renderRowActions: ({ row, table }) => (
      <ColumnActionButtons
        row={row}
        table={table}
        onDelete={() => handleDeleteReport(row.original.id)}
      />
    ),
  });

  // Stock Table Instance
  const stockTable = useMaterialReactTable({
    ...defaultMrtOptions,
    columns: stockColumns,
    data: filteredStockList,
    renderRowActions: ({ row, table }) => (
      <ColumnActionButtons
        row={row}
        table={table}
        onDelete={() => handleDeleteStock(row.original.id)}
      />
    ),
  });

  const tabsConfig = useMemo(
    () => [
      {
        value: "reports",
        label: "Ýüzlenme hasabaty",
        icon: <FileSpreadsheet size={18} />,
        badge: filteredReportList.length,
      },
      {
        value: "stock",
        label: "Hat stoky",
        icon: <FileBox size={18} />,
        badge: filteredStockList.length,
      },
    ],
    [filteredReportList.length, filteredStockList.length]
  );

  const currentTotal =
    activeTab === "reports"
      ? filteredReportList.length
      : filteredStockList.length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: 1.75,
        overflow: "hidden",
      }}
    >
      {/* Page Header */}
      <PageHeader
        title={t("sidebar.referalLetters") || "Ýüzlenme hatlary"}
        pageTitle="Ýüzlenme Hatlary Hasabaty | Oguz Travel"
        addButtonText={
          activeTab === "stock" ? "Täze hat stoky goşmak" : "Täze hasabat goşmak"
        }
        onAddClick={handleOpenActiveModal}
      />

      {/* Top Filter & CustomTabs Header Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          borderRadius: "14px",
          border: "1px solid",
          borderColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.08)"
              : "#E2E8F0",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ flexGrow: 1, maxWidth: { md: 450 } }}>
          <GlobalSearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
          />
        </Box>

        <CustomTabs
          value={activeTab}
          onChange={handleTabChange}
          tabs={tabsConfig}
        />
      </Paper>

      {/* Table Container */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {activeTab === "reports" ? (
          <MaterialReactTable table={reportsTable} />
        ) : (
          <MaterialReactTable table={stockTable} />
        )}
      </Box>

      {/* Pagination Footer */}
      {currentTotal > 0 && (
        <Pagination
          totalItems={currentTotal}
          page={page}
          limit={limit}
          setPage={setPage}
          setPageSize={setLimit}
        />
      )}

      {/* Modal 1: Add Letter Stock */}
      <AddLetterStockModal
        open={isStockModalOpen}
        close={() => setIsStockModalOpen(false)}
        onSubmitSuccess={handleAddStock}
      />

      {/* Modal 2: Add Referral Report */}
      <AddReferralReportModal
        open={isReportModalOpen}
        close={() => setIsReportModalOpen(false)}
        onSubmitSuccess={handleAddReport}
      />
    </Box>
  );
};

export default ReferralLetterPage;
