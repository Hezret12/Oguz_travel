import { useMemo, useState, useCallback } from "react";
import dayjs from "dayjs";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Chip } from "@mui/material";
import StatusChip from "../../components/StatusChip";
import { CAFETERIA_TYPE_CONFIG } from "../../functions/statusChipConfigs";
import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../hooks/useLocale";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import TableEmptyState from "../../components/TableEmptyState";
import StackedCell from "../../components/inputs/StackCell";
import { useDateFormat } from "../../functions/generalHelpers";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import DeleteDialog from "../../components/DeleteDialog";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";
import { deleteCafeteriaTransactionApi } from "../../api/queries/delete";
import { useTableFilters, useDrawerFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { getAllCafeteriaTransactionsApi } from "../../api/queries/getters";
import {
  cafeteriaFilterActions,
  cafeteriaFilterSelectors,
} from "../../store/slices/filters/cafeteriaFilterSlice";
import FilterDrawer from "../../components/FilterDrawer";
import CafeteriaFilter from "./Contents/CafeteriaFilter";
import CafeteriaHeaderStats from "./Contents/CafeteriaHeaderStats";
import AddCafeteriaModal from "./AddCafeteriaModal";
import EditCafeteriaModal from "./EditCafeteriaModal";
import GlobalSearchInput from "../../components/GlobalSearchInput";

const CafeteriaFilterDrawer = () => {
  const {
    draft,
    isDrawerOpen,
    selectsOpen,
    setDraftFilter,
    openSelect,
    closeSelect,
    applyFilters,
    cancelFilters,
    resetFilters,
  } = useDrawerFilters({
    actions: cafeteriaFilterActions,
    selectors: cafeteriaFilterSelectors,
  });

  return (
    <FilterDrawer
      open={isDrawerOpen}
      onClose={cancelFilters}
      onApply={applyFilters}
      onReset={resetFilters}
      onCancel={cancelFilters}
    >
      <CafeteriaFilter
        filters={draft}
        selectsOpen={selectsOpen}
        onFilterChange={setDraftFilter}
        onSelectOpen={openSelect}
        onSelectClose={closeSelect}
      />
    </FilterDrawer>
  );
};

const Cafeteria = () => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();
  const [rowSelection, setRowSelection] = useState({});

  const {
    applied,
    openDrawer,
    setFilter,
    resetFilters,
    searchQuery,
    setSearch,
    page,
    limit,
    setPage,
    setPageSize,
    setSort,
    queryParams,
  } = useTableFilters({
    actions: cafeteriaFilterActions,
    selectors: cafeteriaFilterSelectors,
  });

  const {
    data: transactionsData,
    isLoading,
    isFetching,
    refetch,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllCafeteriaTransactionsApi,
    key: "cafeteriaTransactions",
    params: queryParams,
  });

  const transactions = useMemo(
    () => (Array.isArray(transactionsData) ? transactionsData : []),
    [transactionsData]
  );

  const { mutate: deleteTransaction, isPending: isDeleting } = useDelete({
    deleteFn: deleteCafeteriaTransactionApi,
    queryKey: ["cafeteriaTransactions", queryParams],
    idKey: "guid",
    isPaginated: true,
    invalidateQueries: [["cafeteria-summary"]],
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteTransaction(item.guid || item.id),
  });

  const handleDeleteClick = (item) => deleteDialog.open(item);

  const activeFilters = useMemo(
    () =>
      Object.entries(applied).filter(
        ([key, value]) =>
          key !== "search" &&
          value !== undefined &&
          value !== null &&
          value !== ""
      ),
    [applied]
  );

  const getFilterChipLabel = useCallback(
    (key, value) => {
      let fieldTitle = t(`columns.${key}`, key);
      if (key === "start_date") {
        fieldTitle = t("columns.startDate") || t("columns.start_date") || "Başlangyç senesi";
      } else if (key === "end_date") {
        fieldTitle = t("columns.endDate") || t("columns.end_date") || "Ahyrky senesi";
      } else if (key === "type") {
        fieldTitle = t("cafeteria.type") || "Görnüşi";
      }

      let displayVal = value;
      if (key === "type") {
        displayVal =
          value === true ||
          value === "true" ||
          value === 1 ||
          value === "INCOME"
            ? t("cafeteria.types.income")
            : t("cafeteria.types.expense");
      } else if (key === "start_date" || key === "end_date") {
        displayVal = dayjs(value).isValid()
          ? dayjs(value).format("DD.MM.YYYY")
          : value;
      }

      return `${fieldTitle}: ${displayVal}`;
    },
    [t]
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
        accessorKey: "date",
        id: "date",
        header: t("cafeteria.date"),
        size: 110,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorFn: (row) => row.type,
        id: "type",
        header: t("cafeteria.type"),
        size: 110,
        Cell: ({ row }) => (
          <StatusChip
            status={row.original.type === true || String(row.original.type) === "true" ? "TRUE" : "FALSE"}
            config={CAFETERIA_TYPE_CONFIG}
          />
        ),
      },
      {
        accessorKey: "description",
        id: "description",
        header: t("cafeteria.description"),
        size: 220,
      },
      {
        accessorKey: "amount",
        id: "amount",
        header: t("cafeteria.amount"),
        size: 140,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ cell, row }) => {
          const val = Number(cell.getValue() || 0);
          const isIncome =
            row.original?.type === true ||
            row.original?.type === 1 ||
            String(row.original?.type) === "true" ||
            row.original?.type === "INCOME";
          const formatted = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(val);

          return (
            <Box
              sx={{
                fontWeight: 700,
                color: isIncome ? "success.main" : "error.main",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {isIncome ? "+" : "-"}
              {formatted} {row.original?.currency || "TMT"}
            </Box>
          );
        },
      },
      {
        id: "createdBy",
        header: t("columns.employee"),
        size: 180,
        accessorFn: (row) => row.createdBy?.fullName,
        Cell: ({ row }) => {
          const creator = row.original.createdBy;
          return (
            <StackedCell
              primary={creator?.fullName}
              secondary={selectedLang(creator?.office?.shortName)}
            />
          );
        },
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 100,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table: mrtTable }) => (
          <ColumnActionButtons
            row={row}
            table={mrtTable}
            onDelete={() => handleDeleteClick(row.original)}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, selectedLang, formatChange, page, limit, handleDeleteClick]
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    // MRT's default "modal" display mode wraps renderCreateRowDialogContent /
    // renderEditRowDialogContent in its own <Dialog>, on top of the <Dialog>
    // AddCafeteriaModal/EditCafeteriaModal already render themselves — nesting
    // two full Dialog/backdrop/focus-trap stacks. "custom" skips MRT's wrapper;
    // we mount the modals ourselves below, gated on creatingRow/editingRow.
    createDisplayMode: "custom",
    editDisplayMode: "custom",
    columns,
    data: transactions || [],
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
    initialState: {
      columnPinning: {
        left: ["index_number"],
        right: ["actions"],
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
    getRowId: (row) => row.guid || row.id,
    onRowSelectionChange: setRowSelection,

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
          })}
        >
          <Box />
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        minHeight: 0,
      }}
    >
      <PageHeader
        title={t("cafeteria.title")}
        pageTitle={`${t("cafeteria.title")} | Oguz Travel`}
        addButtonText={t("cafeteria.addTransaction")}
        filterButtonText={t("filter")}
        onAddClick={() => table.setCreatingRow(true)}
        onFilterClick={openDrawer}
      >
        <CafeteriaHeaderStats queryParams={queryParams} />
      </PageHeader>

      <CafeteriaFilterDrawer />

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("deleteDialog.description")}
      />

      {Boolean(table.getState().creatingRow) && (
        <AddCafeteriaModal table={table} />
      )}

      {Boolean(table.getState().editingRow) && (
        <EditCafeteriaModal table={table} row={table.getState().editingRow} />
      )}

      <MaterialReactTable table={table} />
    </Box>
  );
};

export default Cafeteria;
