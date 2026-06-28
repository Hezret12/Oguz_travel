import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useMemo, useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import { useUserSearch } from "../../hooks/useUserSearch";
import PageHeader from "../../components/PageHeader";
import FilterDrawer from "../../components/FilterDrawer";
import Pagination from "../../components/Pagination";
import AddUserModal from "./AddUserModal/AddUserModal";
import { Box, FormControl, Select, MenuItem, Typography, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const Users = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  const {
    users,
    searchQuery,
    setSearchQuery,
    isLoading,
    addUser,
    updateUser,
    deleteUser,
  } = useUserSearch();

  const [rowSelection, setRowSelection] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    status: "", 
  });
  const [tempFilters, setTempFilters] = useState({
    status: "",
  });
  const [selectsOpen, setSelectsOpen] = useState({
    status: false,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (appliedFilters.status === "active" && !u.isActive) return false;
      if (appliedFilters.status === "inactive" && u.isActive) return false;
      return true;
    });
  }, [users, appliedFilters]);

  const handleOpenFilters = () => {
    setTempFilters({ ...appliedFilters });
    setIsFilterOpen(true);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters });
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    const emptyFilters = { status: "" };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const handleCancelFilters = () => {
    setTempFilters({ ...appliedFilters });
    setIsFilterOpen(false);
  };

  const handleAddUserClick = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEditUserClick = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDeleteUserClick = (userId) => {
    if (window.confirm(t("users.deleteConfirm") ?? "Are you sure you want to delete this user?")) {
      deleteUser(userId);
    }
  };

  const handleSaveUser = (userData) => {
    if (selectedUser) {
      updateUser(userData);
    } else {
      addUser(userData);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "rowNumber",
        header: "№",
        size: 50,
        enableSorting: false,
        Cell: ({ row, table }) => {
          const { pageIndex, pageSize } = table.getState().pagination ?? {
            pageIndex: 0,
            pageSize: filteredUsers.length,
          };
          return (
            <Box sx={{ color: "text.secondary", fontWeight: 500 }}>
              {pageIndex * (pageSize || filteredUsers.length) + row.index + 1}
            </Box>
          );
        },
      },
      {
        accessorFn: (row) => row.fullName,
        id: "fullName",
        header: t("users.columns.fullName") ?? "Full Name",
        size: 180,
      },
      {
        accessorFn: (row) => row.phoneNumber,
        id: "phoneNumber",
        header: t("users.columns.phoneNumber") ?? "Phone Number",
        size: 150,
        Cell: ({ cell }) => `+993 ${cell.getValue()}`,
      },
      {
        accessorFn: (row) => row.isActive,
        id: "isActive",
        header: t("users.columns.status") ?? "Status",
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
                backgroundColor: isActive ? "rgba(22, 163, 74, 0.1)" : "rgba(239, 68, 68, 0.1)",
                color: isActive ? "#16a34a" : "#ef4444",
              }}
            >
              {isActive ? t("users.statusActiveLabel") ?? "Active" : t("users.statusInactiveLabel") ?? "Inactive"}
            </Box>
          );
        },
      },
      {
        accessorFn: (row) => row.permissions?.length || 0,
        id: "permissions",
        header: t("users.columns.permissions") ?? "Permissions",
        size: 150,
        Cell: ({ cell }) => (
          <Box sx={{ fontWeight: 500 }}>
            {cell.getValue()} {t("users.permissionsCount") ?? "Selected"}
          </Box>
        ),
      },
      {
        id: "actions",
        header: t("users.columns.actions") ?? "Actions",
        size: 100,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            {/* Edit — Neutral Icon */}
            <Box
              component="button"
              onClick={(e) => {
                e.stopPropagation();
                handleEditUserClick(row.original);
              }}
              sx={(theme) => ({
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                borderRadius: "7px",
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor:
                  theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                color: theme.palette.text.secondary,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.09)",
                  borderColor: theme.palette.text.secondary,
                  color: theme.palette.text.primary,
                  transform: "translateY(-1px)",
                },
                "&:active": { transform: "scale(0.95)" },
              })}
            >
              <EditIcon sx={{ fontSize: 14 }} />
            </Box>

            {/* Delete — Red Icon */}
            <Box
              component="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteUserClick(row.original.id);
              }}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                borderRadius: "7px",
                border: "1px solid rgba(239,68,68,0.35)",
                backgroundColor: "rgba(239,68,68,0.07)",
                color: "#ef4444",
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
                "&:hover": {
                  backgroundColor: "rgba(239,68,68,0.15)",
                  borderColor: "#ef4444",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.25)",
                },
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
            </Box>
          </Box>
        ),
      },
    ],
    [t, filteredUsers.length]
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: filteredUsers,
    state: {
      ...defaultMrtOptions.state,
      rowSelection,
      isLoading,
    },
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    renderTopToolbarCustomActions: () => (
      <GlobalSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t("search") ?? "Ara..."}
        disabled={isLoading}
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
            totalRows={filteredUsers.length}
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
  });

  return (
    <>
      <PageHeader
        title={t("users.title") ?? "Kullanıcılar"}
        pageTitle={`${t("users.title") ?? "Kullanıcılar"} | Oguz Travel`}
        addButtonText={t("users.add") ?? "Kullanıcı Ekle"}
        onAddClick={handleAddUserClick}
        filterButtonText={t("users.filter") ?? "Filtrele"}
        onFilterClick={handleOpenFilters}
      />

      <FilterDrawer
        open={isFilterOpen}
        onClose={handleCancelFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onCancel={handleCancelFilters}
        title={t("users.filter") ?? "Filtreler"}
      >
        <Stack spacing={2.5}>
          {/* Status Select */}
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}>
              {t("users.columns.status") ?? "Durum"}
            </Typography>
            <Select
              value={tempFilters.status}
              onChange={(e) => setTempFilters({ status: e.target.value })}
              open={selectsOpen.status}
              onOpen={() => setSelectsOpen({ status: true })}
              onClose={() => setSelectsOpen({ status: false })}
              IconComponent={selectsOpen.status ? KeyboardArrowUpIcon : KeyboardArrowDownIcon}
              displayEmpty
              sx={{
                borderRadius: "10px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "divider",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              }}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: "12px",
                    marginTop: "4px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  },
                },
              }}
            >
              <MenuItem value="">
                <em>{t("all") ?? "Tümü"}</em>
              </MenuItem>
              <MenuItem value="active">{t("users.statusActiveLabel") ?? "Active"}</MenuItem>
              <MenuItem value="inactive">{t("users.statusInactiveLabel") ?? "Inactive"}</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </FilterDrawer>

      <MaterialReactTable table={table} />

       <AddUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </>
  );
};

export default Users;
