import { useState, useMemo, useCallback } from "react";
import { Box, Paper, Button, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { FileBox, FileSpreadsheet } from "lucide-react";
import CustomTabs from "../../../components/CustomTabs";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import StatusChip from "../../../components/StatusChip";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
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
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = getDefaultMRTOptions();

  // Tab State: 'reports' | 'stock'
  const [activeTab, setActiveTab] = useState("reports");

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // 1. Fetch Report Shares (Ýüzlenme Hasabaty)
  const reportParams = useMemo(() => {
    const params = { page, limit };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    return params;
  }, [page, limit, searchQuery]);

  const {
    data: rawReportData,
    totalItems: reportTotal = 0,
    pageCount: reportPageCount = 1,
    isLoading: isReportLoading,
    isFetching: isReportFetching,
    refetch: refetchReports,
  } = usePagginationGet({
    apiFn: getAllReportSharesApi,
    key: ["reportShares", reportParams],
    params: reportParams,
  });

  const reportList = useMemo(() => {
    let list = rawReportData;
    if (!Array.isArray(list)) {
      if (Array.isArray(list?.data)) list = list.data;
      else if (Array.isArray(list?.data?.data)) list = list.data.data;
      else return [];
    }
    return list;
  }, [rawReportData]);

  // 2. Fetch Letter Stock (Hat Stoky)
  const stockParams = useMemo(() => {
    const params = { page, limit };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    return params;
  }, [page, limit, searchQuery]);

  const {
    data: rawStockData,
    totalItems: stockTotal = 0,
    pageCount: stockPageCount = 1,
    isLoading: isStockLoading,
    isFetching: isStockFetching,
    refetch: refetchStock,
  } = usePagginationGet({
    apiFn: getAllReportsApi,
    key: ["reports", stockParams],
    params: stockParams,
  });

  const stockList = useMemo(() => {
    let list = rawStockData;
    if (!Array.isArray(list)) {
      if (Array.isArray(list?.data)) list = list.data;
      else if (Array.isArray(list?.data?.data)) list = list.data.data;
      else return [];
    }
    return list;
  }, [rawStockData]);

  // Delete hooks
  const { mutate: deleteStock, isPending: isDeletingStock } = useDelete({
    deleteFn: deleteReportApi,
    queryKey: "reports",
    idKey: "guid",
    isPaginated: true,
  });

  const { mutate: deleteReportShare, isPending: isDeletingReport } = useDelete({
    deleteFn: deleteReportShareApi,
    queryKey: "reportShares",
    idKey: "guid",
    isPaginated: true,
  });

  const stockDeleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteStock(item.guid || item.id),
  });

  const reportDeleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteReportShare(item.guid || item.id),
  });

  const handleTabChange = useCallback((_, newValue) => {
    setActiveTab(newValue);
    setSearchQuery("");
    setPage(1);
  }, []);

  // Columns for Report Shares Tab (Ýüzlenme Hasabaty)
  const reportsColumns = useMemo(
    () => [
      {
        accessorKey: "index_number",
        id: "index_number",
        header: "#",
        size: 60,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (page - 1) * limit + row.index + 1,
      },
      {
        accessorKey: "datetime",
        id: "datetime",
        header: t("columns.date") || "Sene",
        size: 130,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "assignment_opr",
        id: "submittedBy",
        header: t("referralLetter.submittedBy") || "Tabşyran (Operator)",
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
        header: t("referralLetter.receivedBy") || "Kabul eden (Operator)",
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
        header: t("referralLetter.startNo") || "ÝH №-den",
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.original?.start_yh_number || row.original?.startNo || "—",
      },
      {
        accessorKey: "end_yh_number",
        id: "endNo",
        header: t("referralLetter.endNo") || "ÝH № çenli",
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.original?.end_yh_number || row.original?.endNo || "—",
      },
      {
        accessorKey: "total_count",
        id: "quantity",
        header: t("referralLetter.quantity") || "Mukdary",
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => <strong>{row.original?.total_count || row.original?.quantity || 0} sany</strong>,
      },
      {
        accessorKey: "status",
        id: "status",
        header: t("columns.status") || "Status",
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
        header: t("columns.note") || "Bellik",
        size: 180,
        Cell: ({ cell }) => cell.getValue() || "—",
      },
      {
        id: "actions",
        header: t("columns.actions") || "Hereketler",
        size: 90,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            onDelete={(rowObj) => reportDeleteDialog.open(rowObj)}
          />
        ),
      },
    ],
    [formatChange, page, limit, t, reportDeleteDialog]
  );

  // Columns for Stock Tab (Hat Stoky)
  const stockColumns = useMemo(
    () => [
      {
        accessorKey: "index_number",
        id: "index_number",
        header: "#",
        size: 60,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (page - 1) * limit + row.index + 1,
      },
      {
        accessorKey: "name",
        id: "batchName",
        header: t("referralLetter.batchName") || "Partiýanyň ady",
        size: 220,
        Cell: ({ row }) => row.original?.name || row.original?.batchName || "—",
      },
      {
        accessorKey: "start_yh_number",
        id: "startNo",
        header: t("referralLetter.startNo") || "Başlangyç ÝH №",
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.original?.start_yh_number || row.original?.startNo || "—",
      },
      {
        accessorKey: "end_yh_number",
        id: "endNo",
        header: t("referralLetter.endNo") || "Soňky ÝH №",
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.original?.end_yh_number || row.original?.endNo || "—",
      },
      {
        accessorKey: "total_letter",
        id: "count",
        header: t("referralLetter.totalCount") || "Umumy mukdary",
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
        header: t("columns.date") || "Sene",
        size: 130,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "actions",
        header: t("columns.actions") || "Hereketler",
        size: 90,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            onDelete={(rowObj) => stockDeleteDialog.open(rowObj)}
          />
        ),
      },
    ],
    [formatChange, page, limit, t, stockDeleteDialog]
  );

  // Reports Table Instance
  const reportsTable = useMaterialReactTable({
    ...defaultMrtOptions,
    columns: reportsColumns,
    data: reportList,
    state: {
      isLoading: isReportLoading || isReportFetching,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    manualPagination: true,
    pageCount: reportPageCount,
    rowCount: reportTotal,
    enableColumnPinning: true,
    initialState: {
      columnPinning: {
        left: ["index_number"],
        right: ["actions"],
      },
    },
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mt: 0.5 }}>
        <GlobalSearchInput
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setPage(1);
          }}
          placeholder={t("search") || "Gözleg..."}
          disabled={isReportLoading}
          onRefetch={refetchReports}
          isFetching={isReportFetching}
        />
      </Box>
    ),
    renderBottomToolbar: ({ table }) => {
      const { pageIndex } = table.getState().pagination;
      return (
        <Box
          sx={(tTheme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 0.75,
            minHeight: "52px",
            borderTop: `1px solid ${tTheme.palette.divider}`,
            backgroundColor: tTheme.palette.background.paper,
          })}
        >
          <Box />
          <Pagination
            pageIndex={pageIndex}
            pageCount={reportPageCount}
            pageSize={limit}
            totalRows={reportTotal}
            onPageChange={(newIndex) => setPage(newIndex + 1)}
          />
        </Box>
      );
    },
    renderCreateRowDialogContent: ({ table }) => (
      <AddReferralReportModal table={table} />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <EditReferralReportModal table={table} row={row} />
    ),
  });

  // Stock Table Instance
  const stockTable = useMaterialReactTable({
    ...defaultMrtOptions,
    columns: stockColumns,
    data: stockList,
    state: {
      isLoading: isStockLoading || isStockFetching,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    manualPagination: true,
    pageCount: stockPageCount,
    rowCount: stockTotal,
    enableColumnPinning: true,
    initialState: {
      columnPinning: {
        left: ["index_number"],
        right: ["actions"],
      },
    },
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mt: 0.5 }}>
        <GlobalSearchInput
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setPage(1);
          }}
          placeholder={t("search") || "Gözleg..."}
          disabled={isStockLoading}
          onRefetch={refetchStock}
          isFetching={isStockFetching}
        />
      </Box>
    ),
    renderBottomToolbar: ({ table }) => {
      const { pageIndex } = table.getState().pagination;
      return (
        <Box
          sx={(tTheme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 0.75,
            minHeight: "52px",
            borderTop: `1px solid ${tTheme.palette.divider}`,
            backgroundColor: tTheme.palette.background.paper,
          })}
        >
          <Box />
          <Pagination
            pageIndex={pageIndex}
            pageCount={stockPageCount}
            pageSize={limit}
            totalRows={stockTotal}
            onPageChange={(newIndex) => setPage(newIndex + 1)}
          />
        </Box>
      );
    },
    renderCreateRowDialogContent: ({ table }) => (
      <AddLetterStockModal table={table} />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <EditLetterStockModal table={table} row={row} />
    ),
  });

  const tabsConfig = useMemo(
    () => [
      {
        value: "reports",
        label: t("referralLetter.reportsTab"),
        icon: <FileSpreadsheet size={18} />,
        badge: reportTotal || reportList.length,
      },
      {
        value: "stock",
        label: t("referralLetter.stockTab"),
        icon: <FileBox size={18} />,
        badge: stockTotal || stockList.length,
      },
    ],
    [t, reportTotal, reportList.length, stockTotal, stockList.length]
  );

  const handleAddClick = () => {
    if (activeTab === "stock") {
      stockTable.setCreatingRow(true);
    } else {
      reportsTable.setCreatingRow(true);
    }
  };

  const addButtonText = useMemo(() => {
    return activeTab === "stock"
      ? (t("referralLetter.addStock"))
      : (t("referralLetter.addReport"));
  }, [activeTab, t]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          borderRadius: "14px",
          border: "1px solid",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {/* LEFT SIDE: CustomTabs with Blue Theme */}
        <CustomTabs
          value={activeTab}
          onChange={handleTabChange}
          tabs={tabsConfig}
          variant="pills"
          color="blue"
          tabSx={{
            minWidth: { xs: 130, sm: 160, md: 180 },
            textAlign: "center",
          }}
        />

        {/* RIGHT SIDE: Add Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{ borderRadius: "8px", fontWeight: 600, px: 2.5, height: "40px" }}
        >
          {addButtonText}
        </Button>
      </Paper>

      {/* Table Section */}
      {activeTab === "reports" ? (
        <MaterialReactTable table={reportsTable} />
      ) : (
        <MaterialReactTable table={stockTable} />
      )}

      {/* Delete Dialogs */}
      <DeleteDialog
        open={reportDeleteDialog.isOpen}
        onClose={reportDeleteDialog.close}
        onConfirm={reportDeleteDialog.confirm}
        isLoading={isDeletingReport}
        description={t("referralLetter.deleteReportConfirm") || "Bu hasabaty pozmak isleýärsiňizmi?"}
      />

      <DeleteDialog
        open={stockDeleteDialog.isOpen}
        onClose={stockDeleteDialog.close}
        onConfirm={stockDeleteDialog.confirm}
        isLoading={isDeletingStock}
        description={t("referralLetter.deleteStockConfirm") || "Bu hat stokyny pozmak isleýärsiňizmi?"}
      />
    </Box>
  );
};

export default ReferralLetterPage;
