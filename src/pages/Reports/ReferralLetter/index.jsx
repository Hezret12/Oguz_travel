import { useMemo, useState } from "react";
import { Alert, Badge, Box, Button, Chip, Paper, Typography } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Funnel, Package, RotateCw, ScanSearch } from "lucide-react";
import dayjs from "dayjs";
import AddButton from "../../../components/AddButton";
import ExportExcelButton from "../../../components/ExportExcelButton";
import LetterStockExportModal from "./LetterStock/LetterStockExportModal";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useLocale } from "../../../hooks/useLocale";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useDateFormat } from "../../../functions/generalHelpers";
import AddLetterStockModal from "./LetterStock/AddLetterStockModal";
import EditLetterStockModal from "./LetterStock/EditLetterStockModal";
import StockSharesPanel from "./StockShares/StockSharesPanel";
import SerialLookupModal from "./SerialLookup/SerialLookupModal";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useTableFilters, useDrawerFilters } from "../../../hooks/usePageFilters";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import {
  letterStockFilterActions,
  letterStockFilterSelectors,
} from "../../../store/slices/filters/letterStockFilterSlice";
import FilterDrawer from "../../../components/FilterDrawer";
import LetterStockFilter from "./Contents/LetterStockFilter";
import { getAllReportsApi } from "../../../api/queries/getters";
import { deleteReportApi } from "../../../api/queries/delete";
import { formatYhNumber } from "../../../functions/yhNumber";

const DATE_FILTER_KEYS = ["start_date", "end_date"];

const LetterStockFilterDrawer = () => {
  const { isDrawerOpen, draft, setDraftFilter, applyFilters, cancelFilters, resetFilters } =
    useDrawerFilters({
      actions: letterStockFilterActions,
      selectors: letterStockFilterSelectors,
    });

  return (
    <FilterDrawer
      open={isDrawerOpen}
      onClose={cancelFilters}
      onApply={applyFilters}
      onReset={resetFilters}
      onCancel={cancelFilters}
    >
      <LetterStockFilter filters={draft} onFilterChange={setDraftFilter} />
    </FilterDrawer>
  );
};

const ReferralLetterPage = () => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  const {
    applied,
    queryParams,
    searchQuery,
    setSearch,
    setFilter,
    openDrawer,
    page,
    limit,
    setPage,
  } = useTableFilters({
    actions: letterStockFilterActions,
    selectors: letterStockFilterSelectors,
  });

  const activeDateFilters = DATE_FILTER_KEYS.filter((key) => applied?.[key]);
  const isFilterActive = activeDateFilters.length > 0;

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
  // Only `open` is used in the columns; the whole dialog object changes on every
  // open/close and would rebuild them for nothing.
  const openStockDeleteDialog = stockDeleteDialog.open;

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
        Cell: ({ row }) => formatYhNumber(row.original?.start_yh_number),
      },
      {
        accessorKey: "end_yh_number",
        id: "endNo",
        header: t("referralLetter.endNo"),
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => formatYhNumber(row.original?.end_yh_number),
      },
      {
        accessorKey: "total_letter",
        id: "count",
        header: t("referralLetter.totalCount"),
        size: 150,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <strong>
            {row.original?.total_letter || 0} {t("referralLetter.letterUnit")}
          </strong>
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
            onDelete={openStockDeleteDialog}
          />
        ),
      },
    ],
    [formatChange, t, openStockDeleteDialog],
  );

  const stockTable = useMaterialReactTable({
    ...defaultMrtOptions,
    createDisplayMode: "custom",
    editDisplayMode: "custom",
    columns: stockColumns,
    data: stockList,
    enableColumnPinning: false,
    enableExpanding: true,
    renderDetailPanel: ({ row }) => <StockSharesPanel stock={row.original} />,
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
        <Badge color="primary" variant="dot" invisible={!isFilterActive}>
          <Button
            variant="outlined"
            startIcon={<Funnel size={16} style={{ opacity: 0.8 }} />}
            onClick={(e) => {
              e.currentTarget.blur();
              openDrawer();
            }}
            sx={{
              height: "40px",
              px: 2.5,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "14px",
              whiteSpace: "nowrap",
              borderColor: isFilterActive ? "primary.main" : "divider",
              color: isFilterActive ? "primary.main" : "text.primary",
              backgroundColor: "action.hover",
              "&:hover": { borderColor: "primary.main", backgroundColor: "action.selected" },
            }}
          >
            {t("filter")}
          </Button>
        </Badge>
        {activeDateFilters.map((key) => (
          <Chip
            key={key}
            label={`${t(key === "start_date" ? "columns.startDate" : "columns.endDate")}: ${dayjs(applied[key]).format("DD.MM.YYYY")}`}
            onDelete={() => setFilter(key, "")}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ borderRadius: "8px", height: "32px", fontWeight: 500 }}
          />
        ))}
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
          borderColor: "divider",
          backgroundColor: "background.paper",
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
                backgroundColor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
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
          <Button
            variant="outlined"
            startIcon={<ScanSearch size={16} />}
            onClick={() => setIsLookupOpen(true)}
            sx={{
              height: "40px",
              px: 2,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {t("referralLetter.lookup.button")}
          </Button>
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
        />
      )}

      {isLookupOpen && (
        <SerialLookupModal
          open={isLookupOpen}
          close={() => setIsLookupOpen(false)}
        />
      )}

      <LetterStockFilterDrawer />

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
