import { useMemo, useState } from "react";
import { Alert, Box, Button, Paper, useTheme, Typography } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Package, RotateCw } from "lucide-react";
import AddButton from "../../../components/AddButton";
import ExportExcelButton from "../../../components/ExportExcelButton";
import LetterStockExportModal from "./Contents/LetterStockExportModal";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useLocale } from "../../../hooks/useLocale";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useDateFormat } from "../../../functions/generalHelpers";
import AddLetterStockModal from "./AddLetterStockModal";
import EditLetterStockModal from "./EditLetterStockModal";
import StockSharesPanel from "./StockSharesPanel";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useTableFilters } from "../../../hooks/usePageFilters";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import {
  referralLetterFilterActions,
  referralLetterFilterSelectors,
} from "../../../store/slices/filters/referralLetterFilterSlice";
import { getAllReportsApi } from "../../../api/queries/getters";
import { deleteReportApi } from "../../../api/queries/delete";

const ReferralLetterPage = () => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = getDefaultMRTOptions();
  const [isExportOpen, setIsExportOpen] = useState(false);

  const {
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
    data: stockList = [],
    totalItems: stockTotal = 0,
    pageCount: stockPageCount = 1,
    isLoading: isStockLoading,
    isFetching: isStockFetching,
    isError: isStockError,
    refetch: refetchStock,
    responseBody: stockResponseBody,
  } = usePagginationGet({
    apiFn: getAllReportsApi,
    key: "reports",
    params: queryParams,
  });

  const totalStockCount = stockResponseBody?.total_report_count ?? null;

  const { mutate: deleteStock, isPending: isDeletingStock } = useDelete({
    deleteFn: deleteReportApi,
    queryKey: "reports",
    idKey: "guid",
    isPaginated: true,
  });

  const stockDeleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteStock(item.guid || item.id),
  });

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

  // Stock Table Instance
  const stockTable = useMaterialReactTable({
    ...defaultMrtOptions,
    // Avoids nesting MRT's own create/edit <Dialog> around the one
    // AddLetterStockModal/EditLetterStockModal already render — see
    // Translate/index.jsx for the full rationale.
    createDisplayMode: "custom",
    editDisplayMode: "custom",
    columns: stockColumns,
    data: stockList,
    enableColumnPinning: false,
    enableExpanding: true,
    renderDetailPanel: ({ row }) => <StockSharesPanel stock={row.original} />,
    // The detail row gets the body row props too; keep it free of the row hover tint and let
    // StockSharesPanel set its own spacing instead of MRT's 1rem cell padding.
    // An expanded stock row is tinted so it reads as the header of the panel below it.
    muiTableBodyRowProps: (props) => {
      if (props.isDetailPanel) {
        return {
          sx: {
            backgroundColor: "background.paper",
            "&:hover": { backgroundColor: "transparent !important" },
          },
        };
      }
      const base = defaultMrtOptions.muiTableBodyRowProps(props);
      if (!props.row.getIsExpanded()) return base;
      return {
        ...base,
        sx: (tTheme) => ({
          ...base.sx(tTheme),
          "& > td": { backgroundColor: tTheme.palette.action.selected },
        }),
      };
    },
    muiDetailPanelProps: {
      sx: { px: 0, py: 0, backgroundColor: "background.paper" },
    },
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
    // Only the first load uses `isLoading`: MRT drops every detail panel while it is set,
    // which would collapse the expanded stocks on each search/refetch.
    state: {
      isLoading: isStockLoading,
      showProgressBars: isStockFetching && !isStockLoading,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    manualPagination: true,
    pageCount: stockPageCount,
    rowCount: stockTotal,
    renderEmptyRowsFallback: () =>
      isStockError ? (
        <Box sx={{ p: 2 }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => refetchStock()}
                disabled={isStockFetching}
                startIcon={<RotateCw size={14} />}
              >
                {t("errorBoundary.retry")}
              </Button>
            }
          >
            {t("errorOccurred")}
          </Alert>
        </Box>
      ) : (
        defaultMrtOptions.renderEmptyRowsFallback()
      ),
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
  });

  const handleAddClick = () => {
    stockTable.setCreatingRow(true);
  };

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
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t("referralLetter.stockTab")}
          </Typography>

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

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <ExportExcelButton
            onClick={() => setIsExportOpen(true)}
            disabled={isStockLoading || stockTotal === 0}
          />
          <AddButton onClick={handleAddClick}>
            {t("referralLetter.addStock")}
          </AddButton>
        </Box>
      </Paper>

      {isExportOpen && (
        <LetterStockExportModal
          open={isExportOpen}
          close={() => setIsExportOpen(false)}
          queryParams={queryParams}
          stockCount={stockTotal}
          // `total_report_count` is for all batches, so it only previews an unfiltered export.
          letterCount={queryParams?.search ? null : totalStockCount}
        />
      )}

      {Boolean(stockTable.getState().creatingRow) && (
        <AddLetterStockModal table={stockTable} />
      )}
      {Boolean(stockTable.getState().editingRow) && (
        <EditLetterStockModal
          table={stockTable}
          row={stockTable.getState().editingRow}
        />
      )}

      <MaterialReactTable table={stockTable} />

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
