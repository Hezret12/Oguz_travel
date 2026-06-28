import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import { MaterialReactTable } from "material-react-table";
import { useMaterialReactTable } from "material-react-table";
import { useMemo, useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import { useEmployeeSearch } from "../../hooks/useEmployeeSearch";
import PageHeader from "../../components/PageHeader";
import FilterDrawer from "../../components/FilterDrawer";
import Pagination from "../../components/Pagination";
import { Box, FormControl, Select, MenuItem, Typography, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddEmployee from "./Contents/AddEmployee";


const Employee = () => {
  const [rowSelection, setRowSelection] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    department: "",
    position: "",
    office: "",
  });
  const [tempFilters, setTempFilters] = useState({
    department: "",
    position: "",
    office: "",
  });
  const [selectsOpen, setSelectsOpen] = useState({
    department: false,
    position: false,
    office: false,
  });
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  const { data: employees, isLoading, searchQuery, setSearchQuery } = useEmployeeSearch();

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (appliedFilters.department && emp.department !== appliedFilters.department) {
        return false;
      }
      if (appliedFilters.position && emp.position !== appliedFilters.position) {
        return false;
      }
      if (appliedFilters.office && emp.office !== appliedFilters.office) {
        return false;
      }
      return true;
    });
  }, [employees, appliedFilters]);

  const departmentOptions = useMemo(() => {
    const deps = employees.map(emp => emp.department).filter(Boolean);
    return Array.from(new Set(deps)).sort();
  }, [employees]);

  const positionOptions = useMemo(() => {
    const positions = employees.map(emp => emp.position).filter(Boolean);
    return Array.from(new Set(positions)).sort();
  }, [employees]);

  const officeOptions = useMemo(() => {
    const offices = employees.map(emp => emp.office).filter(Boolean);
    return Array.from(new Set(offices)).sort();
  }, [employees]);

  const handleOpenFilters = () => {
    setTempFilters({ ...appliedFilters });
    setIsFilterOpen(true);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters });
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    const emptyFilters = { department: "", position: "", office: "" };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const handleCancelFilters = () => {
    setTempFilters({ ...appliedFilters });
    setIsFilterOpen(false);
  };

  const columns = useMemo(
    () => [
      {
        id: "rowNumber",
        header: "№",
        size: 10,
        enableSorting: false,
        Cell: ({ row, table }) => {
          const { pageIndex, pageSize } = table.getState().pagination ?? { pageIndex: 0, pageSize: filteredEmployees.length };
          return (
            <Box sx={{ color: "text.secondary", fontWeight: 500 }}>
              {pageIndex * (pageSize || filteredEmployees.length) + row.index + 1}
            </Box>
          );
        },
      },
      {
        accessorFn: (row) => row.fullName,
        id: "fullName",
        header: t("employee.columns.fullName"),
        size: 180,
      },
      {
        accessorFn: (row) => row.phoneNumber,
        id: "phoneNumber",
        header: t("employee.columns.phoneNumber"),
        size: 150,
      },
      {
        accessorFn: (row) => row.gmail,
        id: "gmail",
        header: t("employee.columns.gmail"),
        size: 200,
      },
      {
        accessorFn: (row) => row.department,
        id: "department",
        header: t("employee.columns.department"),
        size: 150,
      },
      {
        accessorFn: (row) => row.position,
        id: "position",
        header: t("employee.columns.position"),
        size: 150,
      },
      {
        accessorFn: (row) => row.office,
        id: "office",
        header: t("employee.columns.office"),
        size: 130,
      },
      {
        id: "actions",
        header: t("employee.columns.actions"),
        size: 100,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            {/* Edit — nötr, icon only */}
            <Box
              component="button"
              onClick={(e) => {
                e.stopPropagation();
                console.log("TODO: edit", row.original);
              }}
              sx={(theme) => ({
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                borderRadius: "7px",
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                color: theme.palette.text.secondary,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
                "&:hover": {
                  backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.09)",
                  borderColor: theme.palette.text.secondary,
                  color: theme.palette.text.primary,
                  transform: "translateY(-1px)",
                },
                "&:active": { transform: "scale(0.95)" },
              })}
            >
              <EditIcon sx={{ fontSize: 14 }} />
            </Box>

            {/* Delete — kırmızı, icon only */}
            <Box
              component="button"
              onClick={(e) => {
                e.stopPropagation();
                console.log("TODO: delete", row.original);
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
    [t, filteredEmployees.length],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: filteredEmployees,
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
          {/* Sol taraf — ileride buraya ekleyebilirsiniz */}
          <Box />

          {/* Sağ taraf — Pagination */}
          <Pagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            pageSize={pageSize}
            totalRows={filteredEmployees.length}
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
    renderCreateRowDialogContent: ({ table }) => <AddEmployee table={table} />,
  });

  return (
    <>
      <PageHeader
        title={t("employee.title")}
        pageTitle={`${t("employee.title")} | Oguz Travel`}
        addButtonText={t("employee.add") ?? "Çalışan Ekle"}
        onAddClick={() => table.setCreatingRow(true)}
        filterButtonText={t("employee.filter") ?? "Filtrele"}
        onFilterClick={handleOpenFilters}
      />

      <FilterDrawer
        open={isFilterOpen}
        onClose={handleCancelFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onCancel={handleCancelFilters}
        title={t("employee.filter") ?? "Filtreler"}
      >
        <Stack spacing={2.5}>
          {/* Department Select */}
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}>
              {t("employee.columns.department") ?? "Departman"}
            </Typography>
            <Select
              value={tempFilters.department}
              onChange={(e) => setTempFilters(prev => ({ ...prev, department: e.target.value }))}
              open={selectsOpen.department}
              onOpen={() => setSelectsOpen(prev => ({ ...prev, department: true }))}
              onClose={() => setSelectsOpen(prev => ({ ...prev, department: false }))}
              IconComponent={selectsOpen.department ? KeyboardArrowUpIcon : KeyboardArrowDownIcon}
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
                }
              }}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: "12px",
                    marginTop: "4px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }
                }
              }}
            >
              <MenuItem value="">
                <em>{t("all") ?? "Tümü"}</em>
              </MenuItem>
              {departmentOptions.map((dep) => (
                <MenuItem key={dep} value={dep}>
                  {dep}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Position Select */}
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}>
              {t("employee.columns.position") ?? "Pozisyon"}
            </Typography>
            <Select
              value={tempFilters.position}
              onChange={(e) => setTempFilters(prev => ({ ...prev, position: e.target.value }))}
              open={selectsOpen.position}
              onOpen={() => setSelectsOpen(prev => ({ ...prev, position: true }))}
              onClose={() => setSelectsOpen(prev => ({ ...prev, position: false }))}
              IconComponent={selectsOpen.position ? KeyboardArrowUpIcon : KeyboardArrowDownIcon}
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
                }
              }}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: "12px",
                    marginTop: "4px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }
                }
              }}
            >
              <MenuItem value="">
                <em>{t("all") ?? "Tümü"}</em>
              </MenuItem>
              {positionOptions.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Office Select */}
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}>
              {t("employee.columns.office") ?? "Ofis"}
            </Typography>
            <Select
              value={tempFilters.office}
              onChange={(e) => setTempFilters(prev => ({ ...prev, office: e.target.value }))}
              open={selectsOpen.office}
              onOpen={() => setSelectsOpen(prev => ({ ...prev, office: true }))}
              onClose={() => setSelectsOpen(prev => ({ ...prev, office: false }))}
              IconComponent={selectsOpen.office ? KeyboardArrowUpIcon : KeyboardArrowDownIcon}
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
                }
              }}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: "12px",
                    marginTop: "4px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }
                }
              }}
            >
              <MenuItem value="">
                <em>{t("all") ?? "Tümü"}</em>
              </MenuItem>
              {officeOptions.map((off) => (
                <MenuItem key={off} value={off}>
                  {off}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </FilterDrawer>

      <MaterialReactTable table={table} />
    </>
  );
};

export default Employee;
