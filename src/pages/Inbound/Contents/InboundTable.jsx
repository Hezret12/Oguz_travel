import { useEffect, useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Chip } from "@mui/material";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useDateFormat } from "../../../functions/generalHelpers";
import Pagination from "../../../components/Pagination";
import TableEmptyState from "../../../components/TableEmptyState";
import TableErrorState from "../../../components/TableErrorState";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import InboundSummary from "./InboundSummary";
import { INBOUND_QUERY_KEYS, INBOUND_SUMMARY_KEY } from "../constants";

const FILTER_LABEL_KEYS = {
  start_date: "columns.startDate",
  end_date: "columns.endDate",
};

/**
 * The table every Inbound tab shares: server pagination, search, filter chips,
 * delete and the add/edit dialogs. A tab only supplies its data columns, API
 * functions and modals. `renderHeader(onAdd)` lets the page draw its header
 * with an Add button wired to this table's create dialog.
 */
const InboundTable = ({
  tab,
  apiFn,
  deleteFn,
  columns: dataColumns,
  AddModal,
  EditModal,
  renderHeader,
  filters,
}) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);
  const queryKey = INBOUND_QUERY_KEYS[tab];

  const {
    applied,
    queryParams,
    searchQuery,
    setSearch,
    setFilter,
    resetFilters,
    page,
    limit,
    setPage,
    setPageSize,
  } = filters;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn,
    key: queryKey,
    params: queryParams,
  });

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // Deleting the last row of the last page would otherwise leave an empty page.
  useEffect(() => {
    if (!isFetching && pageCount >= 1 && page > pageCount) setPage(pageCount);
  }, [isFetching, pageCount, page, setPage]);

  const { mutate: deleteRow, isPending: isDeleting } = useDelete({
    deleteFn,
    queryKey,
    idKey: "guid",
    isPaginated: true,
    invalidateQueries: [INBOUND_SUMMARY_KEY],
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteRow(item.guid),
  });
  const handleDeleteClick = deleteDialog.open;

  const activeFilters = useMemo(
    () =>
      Object.entries(applied || {}).filter(
        ([key, value]) =>
          key !== "search" && value !== undefined && value !== null && value !== "",
      ),
    [applied],
  );

  const columns = useMemo(
    () => [
      {
        id: "row_number",
        header: "T/b",
        size: 60,
        accessorFn: (_row, index) => (page - 1) * limit + index + 1,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      ...dataColumns,
      {
        id: "actions",
        header: t("columns.actions"),
        size: 90,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table: mrtTable }) => (
          <ColumnActionButtons
            row={row}
            table={mrtTable}
            onDelete={handleDeleteClick}
          />
        ),
      },
    ],
    [dataColumns, t, page, limit, handleDeleteClick],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    createDisplayMode: "custom",
    editDisplayMode: "custom",
    enableColumnPinning: true,
    columns,
    data: rows,
    state: {
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
        left: ["row_number"],
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
    getRowId: (row) => row.guid,

    manualPagination: true,
    manualFiltering: true,
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

    renderEmptyRowsFallback: () => {
      if (isLoading || isFetching) return null;
      if (isError) return <TableErrorState onRetry={refetch} isRetrying={isFetching} />;
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
          placeholder={t(`inbound.searchPlaceholder.${tab}`)}
          disabled={isLoading}
          onRefetch={refetch}
          isFetching={isFetching}
        />

        {activeFilters.map(([key, value]) => (
          <Chip
            key={key}
            label={`${t(FILTER_LABEL_KEYS[key] || key)}: ${formatChange(value, { dateOnly: true })}`}
            onDelete={() => setFilter(key, "")}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              borderRadius: "8px",
              height: "32px",
              fontWeight: 500,
            }}
          />
        ))}

        <InboundSummary tab={tab} queryParams={queryParams} />
      </Box>
    ),

    renderBottomToolbar: () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: 2,
          py: 0.75,
          minHeight: "52px",
          borderTop: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Pagination
          pageIndex={page - 1}
          pageCount={pageCount}
          totalRows={totalItems}
          onPageChange={(newIndex) => setPage(newIndex + 1)}
        />
      </Box>
    ),
  });

  const editingRow = table.getState().editingRow;

  return (
    <>
      {renderHeader(() => table.setCreatingRow(true))}

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("deleteDialog.description")}
      />

      {Boolean(table.getState().creatingRow) && <AddModal table={table} />}

      {Boolean(editingRow) && <EditModal table={table} row={editingRow} />}

      <MaterialReactTable table={table} />
    </>
  );
};

export default InboundTable;
