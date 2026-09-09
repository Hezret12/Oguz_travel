import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo, useState, useCallback } from "react";
import { useLocale } from "../../hooks/useLocale";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import TableEmptyState from "../../components/TableEmptyState";
import { Box, Chip, Typography } from "@mui/material";
import StackedCell from "../../components/inputs/StackCell";
import { useDateFormat } from "../../functions/generalHelpers";
import AddTranslateModal from "./AddTranslateModal";
import EditTranslateModal from "./EditTranslateModal";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import { usePageFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { useGet } from "../../hooks/CRUD/useGet";
import {
  getAllTranslationsApi,
  getAllEmployeeApi,
  getAllTranslatorsApi,
} from "../../api/queries/getters";
import {
  translateFilterActions,
  translateFilterSelectors,
} from "../../store/slices/filters/translateFilterSlice";
import FilterDrawer from "../../components/FilterDrawer";
import TranslateFilter from "./Contents/TranslateFilter";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import PaymentStatusCell from "../../components/PaymentStatusCell";
import StatusChip from "../../components/StatusChip";
import {
  TRANSLATION_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from "../../functions/statusChipConfigs";
import { nameColSize } from "../../utils/helperConstant";
import DeleteDialog from "../../components/DeleteDialog";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { deleteTranslationApi } from "../../api/queries/delete";
import { PaymentManagementModal } from "../../components/Dialog/PaymentManagementModal";
import ExportExcelButton from "../../components/ExportExcelButton";
import { exportTranslateExcel } from "./functions/exportTranslateExcel";
import dayjs from "dayjs";

const FILTER_LABEL_KEYS = {
  opr_guid: "columns.operator",
  translator_guid: "columns.translator",
  start_received_day: "columns.startReceivedDay",
  end_received_day: "columns.endReceivedDay",
  received_time: "columns.receivedTime",
  start_completed_day: "columns.startCompletedDay",
  end_completed_day: "columns.endCompletedDay",
  completed_time: "columns.completedTime",
};

const TranslatePage = () => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);
  const { formatChange } = useDateFormat();
  const [rowSelection, setRowSelection] = useState({});
  const [paymentModalRow, setPaymentModalRow] = useState(null);

  const {
    applied,
    draft,
    isDrawerOpen,
    openDrawer,
    setDraftFilter,
    setFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
    searchQuery,
    setSearch,
    page,
    limit,
    setPage,
    setPageSize,
    setSort,
    selectsOpen,
    openSelect,
    closeSelect,
    queryParams,
  } = usePageFilters({
    actions: translateFilterActions,
    selectors: translateFilterSelectors,
  });

  const {
    data: translations = [],
    isLoading,
    isFetching,
    refetch,
    pageCount,
    totalItems,
    totalPrice = 0,
    totalExpense = 0,
    totalProfit = 0,
    meta,
  } = usePagginationGet({
    apiFn: getAllTranslationsApi,
    key: "translations",
    params: queryParams,
  });

  // Auxiliary data for filter chip labels
  const { data: employees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const { data: translators = [] } = useGet({
    apiFn: getAllTranslatorsApi,
    key: "translators",
  });

  const employeeMap = useMemo(
    () => new Map(employees.map((e) => [e.guid, e.fullName])),
    [employees]
  );

  const translatorMap = useMemo(
    () => new Map(translators.map((tr) => [tr.guid, tr.fullName])),
    [translators]
  );

  const getFilterChipLabel = useCallback(
    (key, value) => {
      const translationKey = FILTER_LABEL_KEYS[key] || `columns.${key}`;
      const fieldTitle = t(translationKey);
      let displayVal = value;

      if (key === "opr_guid") {
        displayVal = employeeMap.get(value) || value;
      } else if (key === "translator_guid") {
        displayVal = translatorMap.get(value) || value;
      } else if (
        key === "start_received_day" ||
        key === "end_received_day" ||
        key === "start_completed_day" ||
        key === "end_completed_day" ||
        key === "received_day" ||
        key === "completed_day"
      ) {
        displayVal = dayjs(value).isValid()
          ? dayjs(value).format("DD.MM.YYYY")
          : value;
      }

      return `${fieldTitle}: ${displayVal}`;
    },
    [t, employeeMap, translatorMap]
  );

  const activeFilters = useMemo(
    () =>
      Object.entries(applied).filter(
        ([key, value]) =>
          key !== "search" &&
          value !== undefined &&
          value !== null &&
          value !== "",
      ),
    [applied],
  );

  const { mutate: deleteTranslation, isPending: isDeleting } = useDelete({
    deleteFn: deleteTranslationApi,
    queryKey: "translations",
    idKey: "guid",
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteTranslation(item.guid),
  });

  const handleDeleteClick = useCallback(
    (item) => deleteDialog.open(item),
    [deleteDialog],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "index_number",
        id: "index_number",
        header: "#",
        size: 50,
        enableSorting: false,
      },
      {
        accessorKey: "received_day",
        id: "received_day",
        header: t("columns.receivedDay"),
        size: 100,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "received_time",
        id: "received_time",
        header: t("columns.receivedTime"),
        size: 90,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "operator",
        header: t("columns.operator"),
        size: 200,
        accessorFn: (row) => row.operator?.fullName,
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.operator?.fullName}
            secondary={selectedLang(
              row?.original?.operator?.office?.fullName
            )}
          />
        ),
      },
      {
        id: "client",
        header: t("columns.client"),
        size: nameColSize,
        accessorFn: (row) => row.client?.fullName ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.client?.fullName}
            secondary={row.original.client?.phone_number}
          />
        ),
      },
      {
        id: "translator",
        accessorFn: (row) => row.translator?.fullName,
        header: t("columns.translator"),
        size: 170,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.page_count,
        id: "page_count",
        header: t("columns.pageCount"),
        size: 80,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.completed_page_count,
        id: "completed_page_count",
        header: t("columns.completedPageCount"),
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.price,
        id: "price",
        header: t("columns.price"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ cell }) => {
          const val = Number(cell.getValue() || 0);
          return `${val.toFixed(2)} TMT`;
        },
      },
      {
        accessorFn: (row) => row.profit,
        id: "profit",
        header: t("columns.profit"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ cell }) => {
          const profit = Number(cell.getValue() || 0);
          return (
            <Box
              sx={{
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                color:
                  profit > 0
                    ? "#16a34a"
                    : profit < 0
                      ? "#ef4444"
                      : "text.secondary",
              }}
            >
              {profit > 0 ? "+" : ""}
              {profit.toFixed(2)} TMT
            </Box>
          );
        },
      },
      {
        accessorFn: (row) => row.is_paid,
        id: "is_paid",
        header: t("columns.paymentStatus"),
        size: 90,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => (
          <StatusChip
            status={cell.getValue()}
            config={PAYMENT_STATUS_CONFIG}
            size="small"
          />
        ),
      },
      {
        id: "payment_status",
        header: t("columns.paymentPercentage"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          return <PaymentStatusCell percent={row?.original.paidPercentage} />;
        },
      },
      {
        accessorFn: (row) => (row.status !== undefined ? row.status : row.status_guid),
        id: "status",
        header: t("columns.status"),
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const statusVal = row.original.status !== undefined ? row.original.status : row.original.status_guid;
          return (
            <StatusChip
              status={statusVal}
              config={TRANSLATION_STATUS_CONFIG}
            />
          );
        },
      },
      {
        accessorFn: (row) => row.source_to_target,
        id: "source_to_target",
        header: t("columns.direction"),
        size: 140,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "completed_day",
        id: "completed_day",
        header: t("columns.completedDay"),
        size: 100,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "completed_time",
        id: "completed_time",
        header: t("columns.completedTime"),
        size: 90,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.correction_status,
        id: "correction_status",
        header: t("columns.correctionStatus"),
        size: 120,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.note,
        id: "note",
        header: t("columns.note"),
        size: 150,
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 110,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            showPayment={true}
            onPaymentClick={(r) => setPaymentModalRow(r)}
            onDelete={() => handleDeleteClick(row.original)}
          />
        ),
      },
    ],
    [t, selectedLang, formatChange, handleDeleteClick],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    enableColumnPinning: true,
    columns,
    data: translations || [],
    initialState: {
      columnPinning: {
        left: ["index_number"],
        right: ["actions"],
      },
    },
    state: {
      rowSelection,
      isLoading: false,
      showLoadingOverlay: isLoading || isFetching,
      showSkeletons: false,
      showProgressBars: false,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    muiTableBodyProps: {
      sx: (theme) => ({
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.secondary,
        opacity: isLoading || isFetching ? 0 : 1,
        pointerEvents: isLoading || isFetching ? "none" : "auto",
        transition: "opacity 0.15s ease",
      }),
    },
    getRowId: (row) => row.guid,
    onRowSelectionChange: setRowSelection,

    // Server-side options
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount,
    rowCount: totalItems,

    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(table.getState().pagination)
          : updater;
      if (next.pageIndex !== undefined) setPage(next.pageIndex + 1);
      if (next.pageSize !== undefined) setPageSize(next.pageSize);
    },

    onSortingChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(table.getState().sorting)
          : updater;
      if (next && next.length > 0) {
        setSort(next[0].id, next[0].desc ? "desc" : "asc");
      } else {
        setSort("", "asc");
      }
    },

    renderEmptyRowsFallback: () => {
      if (isLoading || isFetching) return null;
      return <TableEmptyState onResetFilters={resetFilters} />;
    },

    renderCreateRowDialogContent: ({ table }) => <AddTranslateModal table={table} />,
    renderEditRowDialogContent: ({ table, row }) => (
      <EditTranslateModal table={table} row={row} queryParams={queryParams} />
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
          onChange={setSearch}
          placeholder={t("search")}
          disabled={isLoading}
          onRefetch={refetch}
          isFetching={isFetching}
        />

        {activeFilters.map(([key, value]) => (
          <Chip
            key={key}
            label={getFilterChipLabel(key, value)}
            onDelete={() => setFilter(key, "")}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              borderRadius: "8px",
              height: "32px",
              fontWeight: 500,
              "& .MuiChip-deleteIcon": {
                color: "primary.main",
                transition: "all 0.15s ease",
              },
            }}
          />
        ))}
      </Box>
    ),

    renderBottomToolbar: ({ table: mrtTable }) => {
      const { pageIndex } = mrtTable.getState().pagination;
      return (
        <Box
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 0.75,
            minHeight: "52px",
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            gap: 2,
            flexWrap: "wrap",
          })}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: "8px",
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.04)"
                  : "rgba(0, 0, 0, 0.03)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {(Number(totalExpense) > 0 || Number(totalPrice) === 0) && (
              <>
                {Number(totalPrice) > 0 && (
                  <Box
                    component="span"
                    sx={{
                      width: "1px",
                      height: "14px",
                      backgroundColor: "divider",
                      mx: 0.5,
                    }}
                  />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.825rem",
                    color: "text.secondary",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                  }}
                >
                  {t("columns.totalPrice")}:
                  <Box
                    component="span"
                    sx={{
                      color: "text.primary",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(Number(totalExpense))}{" "}
                    TMT
                  </Box>
                </Typography>
              </>
            )}

            {(Number(totalProfit) !== 0 || meta?.totalProfit != null) && (
              <>
                <Box
                  component="span"
                  sx={{
                    width: "1px",
                    height: "14px",
                    backgroundColor: "divider",
                    mx: 0.5,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.825rem",
                    color: "text.secondary",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                  }}
                >
                  {t("columns.totalProfit")}:
                  <Box
                    component="span"
                    sx={{
                      color:
                        Number(totalProfit || meta?.totalProfit || 0) >= 0
                          ? "#16a34a"
                          : "#ef4444",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {Number(totalProfit || meta?.totalProfit || 0) > 0 ? "+" : ""}
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(Number(totalProfit || meta?.totalProfit || 0))}{" "}
                    TMT
                  </Box>
                </Typography>
              </>
            )}
          </Box>
          <Pagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            pageSize={limit}
            totalRows={totalItems}
            onPageChange={(newIndex) => setPage(newIndex + 1)}
          />
        </Box>
      );
    },
  });

  return (
    <>
      <PageHeader
        title={t("sidebar.translation")}
        pageTitle={`${t("sidebar.translation")} | Oguz Travel`}
        addButtonText={t("addTranslation")}
        filterButtonText={t("filter")}
        onAddClick={() => table.setCreatingRow(true)}
        onFilterClick={openDrawer}
      >
        <ExportExcelButton
          apiFn={getAllTranslationsApi}
          queryParams={queryParams}
          totalItems={totalItems}
          fileName="Terjime_Hasabaty"
          sheetName="Terjime"
          customExportFn={exportTranslateExcel}
        />
      </PageHeader>

      <FilterDrawer
        open={isDrawerOpen}
        onClose={cancelFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        onCancel={cancelFilters}
      >
        <TranslateFilter
          filters={draft}
          selectsOpen={selectsOpen}
          onFilterChange={setDraftFilter}
          onSelectOpen={openSelect}
          onSelectClose={closeSelect}
        />
      </FilterDrawer>

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
      />

      {Boolean(paymentModalRow) && (
        <PaymentManagementModal
          open={Boolean(paymentModalRow)}
          onClose={(hasChanged) => {
            setPaymentModalRow(null);
            if (hasChanged) {
              refetch();
            }
          }}
          row={paymentModalRow}
        />
      )}

      <MaterialReactTable table={table} />
    </>
  );
};

export default TranslatePage;
