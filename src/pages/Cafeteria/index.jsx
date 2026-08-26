import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Chip } from "@mui/material";
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
import { usePageFilters } from "../../hooks/usePageFilters";
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

const Cafeteria = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();
  const [rowSelection, setRowSelection] = useState({});

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
    () => transactionsData?.data ?? transactionsData ?? [],
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
        // eslint-disable-next-line no-unused-vars
        ([_, value]) => value !== undefined && value !== null && value !== ""
      ),
    [applied]
  );

  const columns = useMemo(
    () => [
      {
        accessorFn: "index",
        id: "index",
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
        accessorKey: "description",
        id: "description",
        header: t("cafeteria.description"),
        size: 260,
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
              {formatted} TMT
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
          const creator = row.original.createdBy
          return (
            <StackedCell
              primary={creator?.fullName}
              secondary={creator?.phone_number}
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
    [t, formatChange, page, limit]
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
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
        left: ["index"],
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

    renderCreateRowDialogContent: ({ table: mrtTable }) => (
      <AddCafeteriaModal table={mrtTable} />
    ),
    renderEditRowDialogContent: ({ table: mrtTable, row }) => (
      <EditCafeteriaModal table={mrtTable} row={row} />
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

        {activeFilters.map(([key, value]) => {
          let displayVal = value;
          if (key === "type") {
            displayVal =
              value === true ||
                value === "true" ||
                value === 1 ||
                value === "INCOME"
                ? t("cafeteria.types.income")
                : t("cafeteria.types.expense");
          }
          return (
            <Chip
              key={key}
              label={`${t(`columns.${key}`, key)}: ${displayVal}`}
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
          );
        })}
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

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("deleteDialog.description")}
      />

      <MaterialReactTable table={table} />
    </Box>
  );
};

export default Cafeteria;
