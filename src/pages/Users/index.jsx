import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import TableErrorState from "../../components/TableErrorState";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo, useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import AddUserModal from "./AddUser/AddUserModal";
import EditUserModal from "./EditUser/EditUserModal";
import { Box, Chip, IconButton } from "@mui/material";
import { User } from "lucide-react";
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
import { useAuth } from "../../context/useAuth";
import { resolveUserRole } from "../../utils/auth";
import UserProfileModal from "./UserProfileModal";

const Users = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || Boolean(user?.user_is_admin);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const { t } = useLocale();
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);

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
    isError,
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
    queryKey: "users",
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (user) => deleteUserMutate(user.guid),
  });

  // `open` never changes, so the columns memo that uses this handler is no
  // longer rebuilt every time the delete dialog opens or closes.
  const handleDeleteClick = deleteDialog.open;

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
        accessorFn: (row) => resolveUserRole(row) === "admin",
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
        header: t("columns.status"),
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
                ? (t("users.statusActiveLabel"))
                : (t("users.statusInactiveLabel"))}
            </Box>
          );
        },
      },
      {
        accessorFn: (row) => row.permissions?.length || 0,
        id: "permissions",
        header: t("columns.permissions"),
        size: 150,
        Cell: ({ cell }) => (
          <Box sx={{ fontWeight: 500 }}>
            {cell.getValue()} {t("users.permissionsCount")}
          </Box>
        ),
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: isAdmin ? 135 : 100,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            {isAdmin && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  e.currentTarget.blur();
                  setSelectedProfileUser(row.original);
                }}
                size="small"
                title={t("profile.profileView")}
                sx={(theme) => ({
                  borderRadius: "7px",
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(20, 184, 166, 0.12)"
                      : "rgba(14, 133, 132, 0.08)",
                  color: theme.palette.mode === "dark" ? "#14B8A6" : "#0E8584",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(20, 184, 166, 0.22)"
                        : "rgba(14, 133, 132, 0.18)",
                    borderColor: theme.palette.mode === "dark" ? "#14B8A6" : "#0E8584",
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "scale(0.95)" },
                })}
              >
                <User size={15} />
              </IconButton>
            )}

            <ColumnActionButtons
              row={row}
              table={table}
              onDelete={handleDeleteClick}
            />
          </Box>
        ),
      },
    ],
    [t, handleDeleteClick, isAdmin],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    // A failed request must not read as "no records".
    renderEmptyRowsFallback: () =>
      isError ? (
        <TableErrorState onRetry={refetch} isRetrying={isFetching} />
      ) : (
        defaultMrtOptions.renderEmptyRowsFallback()
      ),
    // Avoids nesting MRT's own create/edit <Dialog> around the one
    // AddUserModal/EditUserModal already render — see Translate/index.jsx
    // for the full rationale.
    createDisplayMode: "custom",
    editDisplayMode: "custom",
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
  });

  return (
    <>
      <PageHeader
        title={t("users.title")}
        pageTitle={`${t("users.title")} | Oguz Travel`}
        addButtonText={t("users.add")}
        onAddClick={() => table.setCreatingRow(true)}
      />

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("users.deleteConfirm")}
      />

      {isAdmin && (
        <UserProfileModal
          open={Boolean(selectedProfileUser)}
          close={() => setSelectedProfileUser(null)}
          user={selectedProfileUser}
        />
      )}

      {Boolean(table.getState().creatingRow) && (
        <AddUserModal table={table} />
      )}

      {Boolean(table.getState().editingRow) && (
        <EditUserModal table={table} row={table.getState().editingRow} />
      )}

      <MaterialReactTable table={table} />
    </>
  );
};

export default Users;
