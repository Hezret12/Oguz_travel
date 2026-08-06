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
import EditLetterStockModal from "./EditLetterStockModal";
import EditReferralReportModal from "./EditReferralReportModal";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import {
  getAllReportsApi,
  getAllReportSharesApi,
} from "../../../api/queries/getters";
import {
  deleteReportApi,
  deleteReportShareApi,
} from "../../../api/queries/delete";

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

  // 1. Fetch Reports (Hat Stoky) from API /api/v1/report/get-all-reports
  const stockParams = useMemo(() => {
    const params = { page, limit };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    return params;
  }, [page, limit, searchQuery]);

  const {
    data: rawStockData,
    totalItems: stockTotal = 0,
    isLoading: isStockLoading,
  } = usePagginationGet({
    apiFn: getAllReportsApi,
    key: ["reports", stockParams],
    params: stockParams,
  });

  // Extract array for Stock List
  const stockList = useMemo(() => {
    let list = rawStockData;
    if (!Array.isArray(list)) {
      if (Array.isArray(list?.data)) list = list.data;
      else if (Array.isArray(list?.data?.data)) list = list.data.data;
      else return [];
    }
    return list;
  }, [rawStockData]);

  // 2. Fetch Report Shares (Ýüzlenme Hasabaty) from API /api/v1/report-share/get-all-report-shares
  const reportParams = useMemo(() => {
    const params = { page, limit };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    return params;
  }, [page, limit, searchQuery]);

  const {
    data: rawReportData,
    totalItems: reportTotal = 0,
    isLoading: isReportLoading,
  } = usePagginationGet({
    apiFn: getAllReportSharesApi,
    key: ["reportShares", reportParams],
    params: reportParams,
  });

  // Extract array for Report List
  const reportList = useMemo(() => {
    let list = rawReportData;
    if (!Array.isArray(list)) {
      if (Array.isArray(list?.data)) list = list.data;
      else if (Array.isArray(list?.data?.data)) list = list.data.data;
      else return [];
    }
    return list;
  }, [rawReportData]);

  // Delete hooks
  const { mutate: deleteStock } = useDelete({
    deleteFn: deleteReportApi,
    queryKey: "reports",
    idKey: "guid",
    isPaginated: true,
  });

  const { mutate: deleteReportShare } = useDelete({
    deleteFn: deleteReportShareApi,
    queryKey: "reportShares",
    idKey: "guid",
    isPaginated: true,
  });

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

  // MRT Columns for Report Shares Tab (Ýüzlenme Hasabaty)
  const reportsColumns = useMemo(
    () => [
      {
        accessorKey: "index_number",
        id: "index_number",
        header: "#",
        size: 60,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "datetime",
        id: "datetime",
        header: "Sene",
        size: 120,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "assignment_opr",
        id: "submittedBy",
        header: "Tabşyran",
        size: 180,
        Cell: ({ row }) =>
          row.original?.assignment_opr?.fullName ||
          `${row.original?.assignment_opr?.firstName || ""} ${row.original?.assignment_opr?.lastName || ""}`.trim() ||
          row.original?.submittedBy ||
          "—",
      },
      {
        accessorKey: "receiver_opr",
        id: "receivedBy",
        header: "Kabul eden",
        size: 180,
        Cell: ({ row }) =>
          row.original?.receiver_opr?.fullName ||
          `${row.original?.receiver_opr?.firstName || ""} ${row.original?.receiver_opr?.lastName || ""}`.trim() ||
          row.original?.receivedBy ||
          "—",
      },
      {
        accessorKey: "start_yh_number",
        id: "startNo",
        header: "ÝH №-den",
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.original?.start_yh_number || row.original?.startNo || "—",
      },
      {
        accessorKey: "end_yh_number",
        id: "endNo",
        header: "ÝH № çenli",
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.original?.end_yh_number || row.original?.endNo || "—",
      },
      {
        accessorKey: "total_count",
        id: "quantity",
        header: "Mukdary",
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => <strong>{row.original?.total_count || row.original?.quantity || 0} sany</strong>,
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status",
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => {
          const val = cell.getValue();
          let statusKey = val;
          if (val === 1) statusKey = "SATYLDY";
          else if (val === 2) statusKey = "ZYÝAN ÝETEN";
          else if (val === 3) statusKey = "ÝITIRILEN";

          return (
            <StatusChip
              status={statusKey}
              config={REFERRAL_REPORT_STATUS_CONFIG}
              size="small"
            />
          );
        },
      },
      {
        accessorKey: "note",
        id: "note",
        header: "Bellik",
        size: 180,
        Cell: ({ cell }) => cell.getValue() || "—",
      },
    ],
    [formatChange]
  );

  // MRT Columns for Stock Tab (Hat Stoky)
  const stockColumns = useMemo(
    () => [
      {
        accessorKey: "index_number",
        id: "index_number",
        header: "#",
        size: 60,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "name",
        id: "batchName",
        header: "Partiýanyň ady",
        size: 220,
        Cell: ({ row }) => row.original?.name || row.original?.batchName || "—",
      },
      {
        accessorKey: "start_yh_number",
        id: "startNo",
        header: "Başlangyç ÝH №",
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.original?.start_yh_number || row.original?.startNo || "—",
      },
      {
        accessorKey: "end_yh_number",
        id: "endNo",
        header: "Soňky ÝH №",
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.original?.end_yh_number || row.original?.endNo || "—",
      },
      {
        accessorKey: "total_letter",
        id: "count",
        header: "Umumy mukdary",
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <strong>{row.original?.total_letter || row.original?.count || 0} sany hat</strong>
        ),
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
    data: reportList,
    state: {
      isLoading: isReportLoading,
    },
    enableStickyHeader: true,
    muiTableContainerProps: {
      sx: {
        flexGrow: 1,
        minHeight: 0,
        overflowY: "auto",
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "14px",
        border: "1px solid",
        borderColor: (theme) =>
          theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#E2E8F0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      },
    },
    renderEditRowDialogContent: ({ table, row }) => (
      <EditReferralReportModal table={table} row={row} />
    ),
    renderRowActions: ({ row, table }) => (
      <ColumnActionButtons
        row={row}
        table={table}
        onDelete={() => deleteReportShare(row.original.guid || row.original.id)}
      />
    ),
  });

  // Stock Table Instance
  const stockTable = useMaterialReactTable({
    ...defaultMrtOptions,
    columns: stockColumns,
    data: stockList,
    state: {
      isLoading: isStockLoading,
    },
    enableStickyHeader: true,
    muiTableContainerProps: {
      sx: {
        flexGrow: 1,
        minHeight: 0,
        overflowY: "auto",
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "14px",
        border: "1px solid",
        borderColor: (theme) =>
          theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#E2E8F0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      },
    },
    renderEditRowDialogContent: ({ table, row }) => (
      <EditLetterStockModal table={table} row={row} />
    ),
    renderRowActions: ({ row, table }) => (
      <ColumnActionButtons
        row={row}
        table={table}
        onDelete={() => deleteStock(row.original.guid || row.original.id)}
      />
    ),
  });

  const tabsConfig = useMemo(
    () => [
      {
        value: "reports",
        label: "Ýüzlenme hasabaty",
        icon: <FileSpreadsheet size={18} />,
        badge: reportTotal || reportList.length,
      },
      {
        value: "stock",
        label: "Hat stoky",
        icon: <FileBox size={18} />,
        badge: stockTotal || stockList.length,
      },
    ],
    [reportTotal, reportList.length, stockTotal, stockList.length]
  );

  const currentTotal = activeTab === "reports" ? reportTotal : stockTotal;

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

      {/* Table Container with Internal Scroll */}
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
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
      />

      {/* Modal 2: Add Referral Report */}
      <AddReferralReportModal
        open={isReportModalOpen}
        close={() => setIsReportModalOpen(false)}
      />
    </Box>
  );
};

export default ReferralLetterPage;
