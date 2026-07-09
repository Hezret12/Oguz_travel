import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
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
import { Box } from "@mui/material";
import ColumnActionButtons from "../../components/ColumnActionButtons";

const Users = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo(
    () => [
      {
        id: "rowNumber",
        header: "№",
        size: 50,
      },
      {
        accessorFn: (row) => row.fullName,
        id: "fullName",
        header: t("columns.fullName") ?? "Full Name",
        size: 180,
      },
      {
        accessorFn: (row) => row.phoneNumber,
        id: "phoneNumber",
        header: t("columns.phoneNumber") ?? "Phone Number",
        size: 150,
        Cell: ({ cell }) => `+993 ${cell.getValue()}`,
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
                ? (t("pages.users.statusActiveLabel") ?? "Active")
                : (t("pages.users.statusInactiveLabel") ?? "Inactive")}
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
            {cell.getValue()} {t("pages.users.permissionsCount") ?? "Selected"}
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
          <ColumnActionButtons row={row} table={table} />
        ),
      },
    ],
    [t],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: [],
    state: {
      ...defaultMrtOptions.state,
      rowSelection,
    },
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    renderTopToolbarCustomActions: () => (
      <GlobalSearchInput
      // value={searchQuery}
      // onChange={setSearchQuery}
      // placeholder={t("search") ?? "Ara..."}
      // disabled={isLoading}
      />
    ),
    renderBottomToolbar: ({ table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      const pageCount = table.getPageCount();
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
            pageSize={pageSize}
            // totalRows={filteredUsers.length}
            onPageChange={(newIndex) => table.setPageIndex(newIndex)}
          />
        </Box>
      );
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: row.getToggleSelectedHandler(),
      sx: (theme) => ({
        cursor: "pointer",
        backgroundColor: row.getIsSelected()
          ? theme.palette.mode === "dark"
            ? "rgba(0, 114, 229, 0.2) !important"
            : "rgba(0, 114, 229, 0.1) !important"
          : "inherit",
        "&:hover": {
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.04)",
        },
      }),
    }),
    muiTablePaperProps: {
      sx: () => ({
        ...defaultMrtOptions.muiTablePaperProps?.sx,
      }),
    },
    renderCreateRowDialogContent: ({ table }) => <AddUserModal table={table} />,
    renderEditRowDialogContent: ({ table, row }) => (
      <EditUserModal table={table} row={row} />
    ),
  });

  return (
    <>
      <PageHeader
        title={t("pages.users.title")}
        pageTitle={`${t("pages.users.title")} | Oguz Travel`}
        addButtonText={t("pages.users.add")}
        onAddClick={() => table.setCreatingRow(true)}
        filterButtonText={t("pages.users.filter")}
        // onFilterClick={handleOpenFilters}
      />

      <MaterialReactTable table={table} />
    </>
  );
};

export default Users;
