import { useState, useMemo, useCallback } from "react";
import { Box, Paper, Button, useTheme, Badge, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Funnel } from "lucide-react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { FileBox, FileSpreadsheet, Package } from "lucide-react";
import CustomTabs from "../../../components/CustomTabs";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import StatusChip from "../../../components/StatusChip";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import FilterDrawer from "../../../components/FilterDrawer";
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
import ReferralLetterFilter from "./Contents/ReferralLetterFilter";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useTableFilters, useDrawerFilters } from "../../../hooks/usePageFilters";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import {
  referralLetterFilterActions,
  referralLetterFilterSelectors,
} from "../../../store/slices/filters/referralLetterFilterSlice";
import {
  getAllReportsApi,
  getAllReportSharesApi,
} from "../../../api/queries/getters";
import {
  deleteReportApi,
  deleteReportShareApi,
} from "../../../api/queries/delete";

const ReferralLetterReportFilterDrawer = () => {
  const {
    draft,
    isDrawerOpen,
    closeDrawer,
    setDraftFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
    selectsOpen,
    openSelect,
    closeSelect,
  } = useDrawerFilters({
    actions: referralLetterFilterActions,
    selectors: referralLetterFilterSelectors,
  });

  return (
    <FilterDrawer
      open={isDrawerOpen}
      onClose={cancelFilters}
      onApply={() => {
        applyFilters();
        closeDrawer();
      }}
      onReset={resetFilters}
      onCancel={cancelFilters}
    >
      <ReferralLetterFilter
        filters={draft}
        selectsOpen={selectsOpen}
        onFilterChange={setDraftFilter}
        onSelectOpen={openSelect}
        onSelectClose={closeSelect}
      />
    </FilterDrawer>
  );
};

const ReferralLetterPage = () => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = getDefaultMRTOptions();

  const [activeTab, setActiveTab] = useState("reports");

  const {
    applied,
    openDrawer,
    queryParams,
    searchQuery,
    setSearch,
    page,
    limit,
    setPage,
  } = useTableFilters({
    actions: referralLetterFilterActions,
    selectors: referralLetterFilterSelectors,
  });

  const {
    data: reportList = [],
    totalItems: reportTotal = 0,
    pageCount: reportPageCount = 1,
    isLoading: isReportLoading,
    isFetching: isReportFetching,
    refetch: refetchReports,
    responseBody: reportResponseBody,
  } = usePagginationGet({
    apiFn: getAllReportSharesApi,
    key: "reportShares",
    params: queryParams,
  });

  const {
    data: stockList = [],
    totalItems: stockTotal = 0,
    pageCount: stockPageCount = 1,
    isLoading: isStockLoading,
    isFetching: isStockFetching,
    refetch: refetchStock,
    responseBody: stockResponseBody,
  } = usePagginationGet({
    apiFn: getAllReportsApi,
    key: "reports",
    params: queryParams,
  });

  const totalStockCount =
    reportResponseBody?.total_report_count ??
    stockResponseBody?.total_report_count ??
    null;

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
    setSearch("");
    setPage(1);
  }, [setSearch, setPage]);

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
      },
      {
        accessorKey: "datetime",
        id: "datetime",
        header: t("columns.date"),
        size: 130,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "reportAS_operator",
        id: "submittedBy",
        header: t("referralLetter.submittedBy"),
        size: 180,
        Cell: ({ row }) => row.original?.reportAS_operator?.fullName || "",
      },
      {
        accessorKey: "received_by",
        id: "received_by",
        header: t("referralLetter.receivedBy"),
        size: 180,
      },
      {
        accessorKey: "start_yh_number",
        id: "startNo",
        header: t("referralLetter.startNo"),
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.original?.start_yh_number || "",
      },
      {
        accessorKey: "end_yh_number",
        id: "endNo",
        header: t("referralLetter.endNo"),
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.original?.end_yh_number || "",
      },
      {
        accessorKey: "total_count",
        id: "quantity",
        header: t("referralLetter.quantity"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <strong>{row.original?.total_count || 0} sany</strong>
        ),
      },
      {
        accessorKey: "status",
        id: "status",
        header: t("columns.status"),
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
        header: t("columns.note"),
        size: 180,
        Cell: ({ cell }) => cell.getValue() || "",
      },
      {
        id: "actions",
        header: t("columns.actions"),
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
    [t, formatChange, reportDeleteDialog],
  );

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
      },
      {
        accessorKey: "name",
        id: "batchName",
        header: t("referralLetter.batchName"),
        size: 220,
        Cell: ({ row }) => row.original?.name || "",
      },
      {
        accessorKey: "start_yh_number",
        id: "startNo",
        header: t("referralLetter.startNo"),
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.original?.start_yh_number || "",
      },
      {
        accessorKey: "end_yh_number",
        id: "endNo",
        header: t("referralLetter.endNo"),
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.original?.end_yh_number || "",
      },
      {
        accessorKey: "total_letter",
        id: "count",
        header: t("referralLetter.totalCount"),
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <strong>{row.original?.total_letter || 0} sany hat</strong>
        ),
      },
      {
        accessorKey: "createdAt",
        id: "createdAt",
        header: t("columns.date"),
        size: 130,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "note",
        id: "note",
        header: t("columns.note"),
        size: 180,
        Cell: ({ cell }) => cell.getValue() || "",
      },
      {
        id: "actions",
        header: t("columns.actions"),
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
    [formatChange, t, stockDeleteDialog],
  );

  // Reports Table Instance
  const reportsTable = useMaterialReactTable({
    ...defaultMrtOptions,
    columns: reportsColumns,
    data: reportList,
    enableColumnPinning: false,
    muiTablePaperProps: {
      sx: (tTheme) => ({
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 250px)",
        width: "100%",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: tTheme.palette.background.paper,
        boxShadow: "none",
        borderRadius: "12px",
        overflow: "hidden",
      }),
    },
    initialState: {
      density: "compact",
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
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
    renderTopToolbarCustomActions: () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
          mt: 0.5,
        }}
      >
        <GlobalSearchInput
          value={searchQuery}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder={t("search")}
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
    enableColumnPinning: false,
    muiTablePaperProps: {
      sx: (tTheme) => ({
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 250px)",
        width: "100%",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: tTheme.palette.background.paper,
        boxShadow: "none",
        borderRadius: "12px",
        overflow: "hidden",
      }),
    },
    initialState: {
      density: "compact",
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
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
    renderTopToolbarCustomActions: () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
          mt: 0.5,
        }}
      >
        <GlobalSearchInput
          value={searchQuery}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder={t("search")}
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
        badge: totalStockCount ?? (stockTotal || stockList.length),
      },
    ],
    [t, reportTotal, reportList.length, totalStockCount, stockTotal, stockList.length],
  );

  const activeFiltersCount = useMemo(() => {
    return Object.entries(applied).filter(
      ([key, value]) =>
        key !== "search" &&
        value !== undefined &&
        value !== null &&
        value !== "",
    ).length;
  }, [applied]);

  const handleAddClick = () => {
    if (activeTab === "stock") {
      stockTable.setCreatingRow(true);
    } else {
      reportsTable.setCreatingRow(true);
    }
  };

  const addButtonText = useMemo(() => {
    return activeTab === "stock"
      ? t("referralLetter.addStock")
      : t("referralLetter.addReport");
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
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

          {totalStockCount !== null && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                height: 48,
                borderRadius: "12px",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.04)"
                    : "#F1F5F9",
                border: "1px solid",
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "#E2E8F0",
                transition: "all 0.15s ease",
              }}
            >
              <Package size={17} style={{ opacity: 0.75 }} />
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.825rem",
                  color: "text.secondary",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                {t("referralLetter.totalStock")}:
                <Box
                  component="span"
                  sx={{
                    color: "text.primary",
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {totalStockCount} {t("referralLetter.letterUnit")}
                </Box>
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {activeTab === "reports" && (
            <Badge badgeContent={activeFiltersCount} color="primary">
              <Button
                variant="outlined"
                startIcon={<Funnel size={16} style={{ opacity: 0.8 }} />}
                onClick={openDrawer}
                sx={{
                  height: "40px",
                  px: 2.5,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  letterSpacing: "0.1px",
                  borderColor: "divider",
                  color: "text.primary",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(0, 0, 0, 0.02)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 2px 8px rgba(0, 0, 0, 0.32)"
                      : "0 1px 4px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.05)",
                    borderColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.20)"
                        : "rgba(0, 0, 0, 0.18)",
                    color: "text.primary",
                    transform: "translateY(-1px)",
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? "0 4px 14px rgba(0, 0, 0, 0.45)"
                        : "0 4px 12px rgba(0, 0, 0, 0.08)",
                  },
                }}
              >
                {t("filter")}
              </Button>
            </Badge>
          )}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ borderRadius: "8px", fontWeight: 600, px: 2.5, height: "40px" }}
          >
            {addButtonText}
          </Button>
        </Box>
      </Paper>

      {activeTab === "reports" ? (
        <MaterialReactTable table={reportsTable} />
      ) : (
        <MaterialReactTable table={stockTable} />
      )}

      <ReferralLetterReportFilterDrawer />

      <DeleteDialog
        open={reportDeleteDialog.isOpen}
        onClose={reportDeleteDialog.close}
        onConfirm={reportDeleteDialog.confirm}
        isLoading={isDeletingReport}
        description={t("referralLetter.deleteReportConfirm")}
      />

      <DeleteDialog
        open={stockDeleteDialog.isOpen}
        onClose={stockDeleteDialog.close}
        onConfirm={stockDeleteDialog.confirm}
        isLoading={isDeletingStock}
        description={t("referralLetter.deleteStockConfirm")}
      />
    </Box>
  );
};

export default ReferralLetterPage;
