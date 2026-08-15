import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo, useState, useCallback } from "react";
import { useLocale } from "../../hooks/useLocale";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import AddUserModal from "./AddUser/AddUserModal";
import EditUserModal from "./EditUser/EditUserModal";
import { Box, Chip } from "@mui/material";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import { usePageFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import {
  usersFilterActions,
  usersFilterSelectors,
} from "../../store/slices/filters/usersFilterSlice";
import { getAllUsersApi } from "../../api/queries/getters";
import DeleteDialog from "../../components/DeleteDialog";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { deleteUser } from "../../api/queries/delete";

const Users = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  const [rowSelection, setRowSelection] = useState({});

  const {
    queryParams,
    searchQuery,
    setSearch,
    page,
    limit,
    setPage,
    setPageSize,
    setSort,
  } = usePageFilters({
    actions: usersFilterActions,
    selectors: usersFilterSelectors,
  });

  const {
    data: usersData = [],
    isLoading,
    isFetching,
    refetch,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllUsersApi,
    key: "users",
    params: queryParams,
  });

  const { mutate: deleteUserMutate, isPending: isDeleting } = useDelete({
    deleteFn: deleteUser,
    queryKey: ["users", queryParams],
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (user) => deleteUserMutate(user.guid),
  });

  const handleDeleteClick = useCallback(
    (user) => deleteDialog.open(user),
    [deleteDialog],
  );

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.index_number,
        id: "index_number",
        header: "№",
        size: 50,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row?.employee?.fullName,
        id: "fullName",
        header: t("columns.fullName"),
        size: 180,
      },
      {
        accessorFn: (row) => row?.phone_number,
        id: "phone_number",
        header: t("columns.phoneNumber"),
        size: 150,
      },
      {
        accessorFn: (row) => row.isAdmin,
        id: "isAdmin",
        header: t("columns.role"),
        size: 110,
        Cell: ({ cell }) => {
          const isAdmin = Boolean(cell.getValue());
          return (
            <Chip
              label={isAdmin ? "Admin" : "User"}
              size="small"
              sx={{
                height: "22px",
                fontSize: "0.725rem",
                fontWeight: 600,
                backgroundColor: isAdmin
                  ? "rgba(37, 99, 235, 0.12)"
                  : "rgba(107, 114, 128, 0.1)",
                color: isAdmin ? "primary.main" : "text.secondary",
                border: `1px solid ${isAdmin ? "rgba(37, 99, 235, 0.3)" : "rgba(107, 114, 128, 0.2)"}`,
              }}
            />
          );
        },
      },
      {
        accessorFn: (row) => row.isActive,
        id: "isActive",
        header: t("columns.status") ?? "Status",
        size: 120,
        Cell: ({ cell }) => {
          const isActive = cell.getValue();
          return (
            <Box
              sx={{
                display: "inline-flex",
                px: 1.5,
                py: 0.5,
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                backgroundColor: isActive
                  ? "rgba(22, 163, 74, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
                color: isActive ? "#16a34a" : "#ef4444",
              }}
            >
              {isActive
                ? (t("users.statusActiveLabel") ?? "Active")
                : (t("users.statusInactiveLabel") ?? "Inactive")}
            </Box>
          );
        },
      },
      {
        accessorFn: (row) => row.permissions?.length || 0,
        id: "permissions",
        header: t("columns.permissions") ?? "Permissions",
        size: 150,
        Cell: ({ cell }) => (
          <Box sx={{ fontWeight: 500 }}>
            {cell.getValue()} {t("users.permissionsCount") ?? "Selected"}
          </Box>
        ),
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 100,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
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

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: usersData,
    state: {
      rowSelection,
      isLoading: isLoading || isFetching,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    getRowId: (row) => row.guid,
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
          onRefetch={refetch}
          isFetching={isFetching}
        />
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
            backgroundColor: theme.palette.background.paper,
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
    muiTableBodyRowProps: ({ row }) => ({
      onClick: row.getToggleSelectedHandler(),
    }),
    renderCreateRowDialogContent: ({ table }) => <AddUserModal table={table} />,
    renderEditRowDialogContent: ({ table, row }) => (
      <EditUserModal table={table} row={row} />
    ),
  });

  return (
    <>
      <PageHeader
        title={t("users.title")}
        pageTitle={`${t("users.title")} | Oguz Travel`}
        addButtonText={t("users.add")}
        onAddClick={() => table.setCreatingRow(true)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("users.deleteConfirm")}
      />

      <MaterialReactTable table={table} />
    </>
  );
};

export default Users;
