import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo, useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import TableEmptyState from "../../components/TableEmptyState";
import { Box, Chip } from "@mui/material";
import StackedCell from "../../components/inputs/StackCell";
import { useDateFormat } from "../../functions/generalHelpers";
import AddVisaModal from "./AddVisaModal";
import EditVisaModal from "./EditVisaModal";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import DeleteDialog from "../../components/DeleteDialog";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";
import { deleteVisaApi } from "../../api/queries/delete";
import { usePageFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { getAllVisasApi } from "../../api/queries/getters";
import {
  visaFilterActions,
  visaFilterSelectors,
} from "../../store/slices/filters/visaFilterSlice";
import FilterDrawer from "../../components/FilterDrawer";
import VisaFilter from "./Contents/VisaFilter";
import GlobalSearchInput from "../../components/GlobalSearchInput";

const Visa = () => {
  const { t, selectedLang } = useLocale();
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
    actions: visaFilterActions,
    selectors: visaFilterSelectors,
  });

  const {
    data: visasData,
    isLoading,
    isFetching,
    refetch,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllVisasApi,
    key: "visaApplications",
    params: queryParams,
  });

  const visas = useMemo(() => visasData?.data ?? visasData ?? [], [visasData]);

  const { mutate: deleteVisa, isPending: isDeleting } = useDelete({
    deleteFn: deleteVisaApi,
    queryKey: ["visaApplications", queryParams],
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteVisa(item.guid),
  });

  const handleDeleteClick = (item) => deleteDialog.open(item);

  const activeFilters = useMemo(
    () =>
      Object.entries(applied).filter(
        // eslint-disable-next-line no-unused-vars
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    [applied],
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
        accessorKey: "datetime",
        id: "date_time",
        header: t("columns.issueDate"),
        size: 100,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorFn: (row) => row.receiver_operator?.fullName,
        id: "receiver_operator",
        header: t("columns.operatorTwo"),
        size: 200,
        Cell: ({ row }) => {
          return (
            <StackedCell
              primary={row?.original?.receiver_operator?.fullName}
              secondary={selectedLang(
                row?.original?.receiver_operator?.office?.fullName,
              )}
            />
          );
        },
      },
      {
        id: "client",
        header: t("columns.client"),
        size: 200,
        accessorFn: (row) => row.client?.fullName ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.client?.fullName}
            secondary={row.original.client?.phone_number}
          />
        ),
      },
      {
        id: "passportNumber",
        accessorFn: (row) => row.client?.passport_number,
        header: t("columns.passportNumber"),
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "dob",
        accessorFn: (row) => row.client?.dateOfBirth,
        header: t("columns.dateOfBirth"),
        size: 100,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.price_tmt,
        id: "price_tmt",
        header: t("columns.total_tmt"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ cell }) => {
          const val = Number(cell.getValue() || 0);
          return val.toFixed(2);
        },
      },
      {
        accessorFn: (row) => row.price_usd,
        id: "price_usd",
        header: t("columns.total_usd"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ cell }) => {
          const val = Number(cell.getValue() || 0);
          return val.toFixed(2);
        },
      },
      {
        id: "agent",
        header: t("columns.agent"),
        size: 150,
        accessorFn: (row) => row.agent?.name,
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.agent?.name}
            secondary={row.original.agent?.phone_number}
          />
        ),
      },
      {
        accessorFn: (row) => row.note,
        id: "note",
        header: t("columns.note"),
        size: 80,
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
            onDelete={() => handleDeleteClick(row.original)}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: visas || [],
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

    renderCreateRowDialogContent: ({ table }) => <AddVisaModal table={table} />,
    renderEditRowDialogContent: ({ table, row }) => (
      <EditVisaModal table={table} row={row} />
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
            label={`${t(`columns.${key}`, key)}: ${value}`}
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
    <>
      <PageHeader
        title={t("sidebar.visaApplications")}
        pageTitle={`${t("sidebar.visaApplications")} | Oguz Travel`}
        addButtonText={t("addVisa")}
        filterButtonText={t("filter")}
        onAddClick={() => table.setCreatingRow(true)}
        onFilterClick={openDrawer}
      />

      <FilterDrawer
        open={isDrawerOpen}
        onClose={cancelFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        onCancel={cancelFilters}
      >
        <VisaFilter
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
    </>
  );
};

export default Visa;
