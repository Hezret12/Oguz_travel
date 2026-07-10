import { useMemo, useState, useCallback } from "react";
import { Box, Chip } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../hooks/useLocale";
import PageHeader from "../../components/PageHeader";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import Pagination from "../../components/Pagination";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import AddClient from "./Contents/AddClient";
import EditClient from "./Contents/EditClient";
import ClientFilter from "./Contents/ClientFilter";
import { usePageFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import {
  clientFilterActions,
  clientFilterSelectors,
} from "../../store/slices/filters/clientFilterSlice";
import FilterDrawer from "../../components/FilterDrawer";
import { getClientsApi } from "../../api/queries/getters";
import DeleteDialog from "../../components/DeleteDialog";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { deleteClient } from "../../api/queries/delete";
import { actions } from "../../utils/helperConstant";

const formatDate = (value) => {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  return `${day}.${month}.${year}`;
};

const Clients = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
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
    actions: clientFilterActions,
    selectors: clientFilterSelectors,
  });

  const {
    data: clientsData,
    isLoading,
    isFetching,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn: getClientsApi,
    key: "clients",
    params: queryParams,
  });

  const { mutate: deleteClientMutate, isPending: isDeleting } = useDelete({
    deleteFn: deleteClient,
    queryKey: ["clients", queryParams],
    idKey: "client_guid",
    apiName: "client_guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (client) => deleteClientMutate(client.client_guid),
  });

  const handleDeleteClick = useCallback(
    (client) => deleteDialog.open(client),
    [deleteDialog],
  );

  const getFilterChipLabel = useCallback(
    (key, value) => {
      if (key === "gender") {
        const label =
          value === "Women"
            ? t("pages.clients.genderWomen")
            : value === "Men"
              ? t("pages.clients.genderMen")
              : value;
        return `${t(`columns.${key}`)}: ${label}`;
      }
      if (key === "dateOfBirth") {
        return `${t(`columns.${key}`)}: ${formatDate(value)}`;
      }
      return `${t(`columns.${key}`)}: ${value}`;
    },
    [t],
  );

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.index_number,
        id: "index_number",
        header: "№",
        size: 10,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.fullName,
        id: "fullName",
        header: t("columns.fullName"),
        size: 180,
      },
      {
        accessorFn: (row) => row.phone_number,
        id: "phone_number",
        header: t("columns.phoneNumber"),
        size: 150,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value ? `+993 ${value}` : "";
        },
      },
      {
        accessorFn: (row) => row.dateOfBirth,
        id: "dateOfBirth",
        header: t("columns.dateOfBirth"),
        size: 150,
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        accessorFn: (row) => row.passport_number,
        id: "passport_number",
        header: t("columns.passportNumber"),
        size: 150,
      },
      {
        accessorFn: (row) => row.passportExpiryDate,
        id: "passportExpiryDate",
        header: t("columns.passportExpiryDate"),
        size: 160,
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        accessorFn: (row) => row.passportCountryOfIssue,
        id: "passportCountryOfIssue",
        header: t("columns.passportCountryOfIssue"),
        size: 180,
      },
      {
        accessorFn: (row) => row.gender,
        id: "gender",
        header: t("columns.gender"),
        size: 120,
        Cell: ({ cell }) => (
          <Box sx={{ fontWeight: 500 }}>
            {cell.getValue() === "Women"
              ? t("pages.clients.genderWomen")
              : t("pages.clients.genderMen")}
          </Box>
        ),
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: actions,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            onDelete={handleDeleteClick}
          />
        ),
      },
    ],
    [t, handleDeleteClick],
  );

  const activeFilters = useMemo(
    () =>
      Object.entries(applied).filter(
        ([key, value]) =>
          key !== "search" &&
          value !== "" &&
          value !== null &&
          value !== undefined,
      ),
    [applied],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: clientsData,

    state: {
      ...defaultMrtOptions.state,
      rowSelection,
      isLoading: isLoading || isFetching,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },

    getRowId: (row) => row.client_guid,
    onRowSelectionChange: setRowSelection,

    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableSorting: true,
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

    renderBottomToolbar: ({ table }) => {
      const { pageIndex } = table.getState().pagination;
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
          })}
        >
          <Box />
          <Pagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            totalRows={totalItems}
            onPageChange={(newIndex) => setPage(newIndex + 1)}
          />
        </Box>
      );
    },

    muiTablePaperProps: {
      sx: () => ({
        ...defaultMrtOptions.muiTablePaperProps?.sx,
      }),
    },
    renderCreateRowDialogContent: ({ table }) => <AddClient table={table} />,
    renderEditRowDialogContent: ({ table, row }) => (
      <EditClient table={table} row={row} />
    ),
  });

  return (
    <>
      <PageHeader
        title={t("pages.clients.title")}
        pageTitle={`${t("pages.clients.title")} | Oguz Travel`}
        addButtonText={t("pages.clients.add")}
        onAddClick={() => table.setCreatingRow(true)}
        filterButtonText={t("filter")}
        onFilterClick={openDrawer}
      />

      <FilterDrawer
        open={isDrawerOpen}
        onClose={cancelFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        onCancel={cancelFilters}
      >
        <ClientFilter
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

      <MaterialReactTable table={table} />
    </>
  );
};

export default Clients;
