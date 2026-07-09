import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import { MaterialReactTable } from "material-react-table";
import { useMaterialReactTable } from "material-react-table";
import { useMemo, useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import { Box, Chip } from "@mui/material";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import AddEmployee from "./Contents/AddEmployee";
import EditEmployee from "./Contents/EditEmployee";
import { usePageFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { getEmployees } from "../../api/queries/getters";
import {
  employeeFilterActions,
  employeeFilterSelectors,
} from "../../store/slices/filters/employeeFilterSlice";
import FilterDrawer from "../../components/FilterDrawer";
import EmployeeFilter from "./Contents/EmployeeFilter";

const DEPARTMENT_OPTIONS = [
  "Engineering",
  "Management",
  "Sales",
  "HR",
  "Finance",
  "Marketing",
  "IT",
];

const OFFICE_OPTIONS = ["Ashgabat", "Istanbul", "Ankara"];

const POSITION_OPTIONS = [
  "Software Engineer",
  "Project Manager",
  "Sales Director",
  "HR Specialist",
  "Accountant",
  "Marketing Specialist",
  "System Administrator",
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
];

const Employee = () => {
  const [rowSelection, setRowSelection] = useState({});
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  const {
    applied,
    draft,
    queryParams,
    isDrawerOpen,
    openDrawer,
    // closeDrawer,
    setDraftFilter,
    setFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
    searchQuery,
    setSearch,
    page,
    pageSize,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    setSort,
    selectsOpen,
    openSelect,
    closeSelect,
  } = usePageFilters({
    actions: employeeFilterActions,
    selectors: employeeFilterSelectors,
  });

  const {
    data: employeesData,
    isLoading,
    isFetching,
    pageCount,
  } = usePagginationGet({
    apiFn: getEmployees,
    key: "employees",
    params: queryParams,
  });

  const columns = useMemo(
    () => [
      {
        id: "rowNumber",
        header: "№",
        size: 10,
        enableSorting: false,
        Cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
      },
      {
        accessorFn: (row) => row.fullName,
        id: "fullName",
        header: t("columns.fullName"),
        size: 180,
      },
      {
        accessorFn: (row) => row.phoneNumber,
        id: "phoneNumber",
        header: t("columns.phoneNumber"),
        size: 150,
      },
      {
        accessorFn: (row) => row.gmail,
        id: "gmail",
        header: t("columns.gmail"),
        size: 200,
      },
      {
        accessorFn: (row) => row.department,
        id: "department",
        header: t("columns.department"),
        size: 150,
      },
      {
        accessorFn: (row) => row.position,
        id: "position",
        header: t("columns.position"),
        size: 150,
      },
      {
        accessorFn: (row) => row.office,
        id: "office",
        header: t("columns.office"),
        size: 130,
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
    [t, page, pageSize],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: employeesData,
    state: {
      ...defaultMrtOptions.state,
      rowSelection,
      isLoading: isLoading || isFetching,
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
      sorting: sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : [],
    },
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,

    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableSorting: true,
    pageCount: pageCount,

    onPaginationChange: (updater) => {
      const nextPagination =
        typeof updater === "function"
          ? updater(table.getState().pagination)
          : updater;
      if (nextPagination.pageIndex !== undefined) {
        setPage(nextPagination.pageIndex + 1);
      }
      if (nextPagination.pageSize !== undefined) {
        setPageSize(nextPagination.pageSize);
      }
    },

    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function"
          ? updater(table.getState().sorting)
          : updater;
      if (nextSorting && nextSorting.length > 0) {
        setSort(nextSorting[0].id, nextSorting[0].desc ? "desc" : "asc");
      } else {
        setSort("", "asc");
      }
    },

    renderTopToolbarCustomActions: () => {
      const activeFilters = Object.entries(applied).filter(
        ([key, value]) => key !== "search" && value !== "" && value !== null && value !== undefined
      );

      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mt: 0.5 }}>
          <GlobalSearchInput
            value={searchQuery}
            onChange={setSearch}
            placeholder={t("search") ?? "Ara..."}
            disabled={isLoading}
          />
          {activeFilters.map(([key, value]) => (
            <Chip
              key={key}
              label={`${t(`columns.${key}`)}: ${value}`}
              onDelete={() => setFilter(key, "")}
              color="primary"
              variant="outlined"
              size="small"
              sx={{
                borderRadius: "8px",
                height: "32px",
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: 500,
                "& .MuiChip-deleteIcon": {
                  color: "primary.main",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    color: "primary.dark",
                  },
                },
              }}
            />
          ))}
        </Box>
      );
    },

    renderBottomToolbar: ({ table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
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
    renderEditRowDialogContent: ({ table, row }) => (
      <EditEmployee table={table} row={row} />
    ),
  });

  return (
    <>
      <PageHeader
        title={t("pages.employee.title")}
        pageTitle={`${t("pages.employee.title")} | Oguz Travel`}
        addButtonText={t("pages.employee.add")}
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
        title={t("filter")}
      >
        <EmployeeFilter
          filters={draft}
          selectsOpen={selectsOpen}
          departmentOptions={DEPARTMENT_OPTIONS}
          positionOptions={POSITION_OPTIONS}
          officeOptions={OFFICE_OPTIONS}
          allText={t("all")}
          labels={{
            department: t("columns.department"),
            position: t("columns.position"),
            office: t("columns.office"),
          }}
          onFilterChange={setDraftFilter}
          onSelectOpen={openSelect}
          onSelectClose={closeSelect}
        />
      </FilterDrawer>

      <MaterialReactTable table={table} />
    </>
  );
};

export default Employee;
