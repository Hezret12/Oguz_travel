import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import { MaterialReactTable } from "material-react-table";
import { useMaterialReactTable } from "material-react-table";
import { useMemo, useState, useCallback } from "react";
import { useLocale } from "../../hooks/useLocale";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import { Box, Chip } from "@mui/material";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import AddEmployee from "./Contents/AddEmployee";
import EditEmployee from "./Contents/EditEmployee";
import EmployeeCommentModal from "./Contents/EmployeeCommentModal";
import { usePageFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import {
  employeeFilterActions,
  employeeFilterSelectors,
} from "../../store/slices/filters/employeeFilterSlice";
import FilterDrawer from "../../components/FilterDrawer";
import EmployeeFilter from "./Contents/EmployeeFilter";
import {
  getAllEmployeeApi,
  getAllDepartmentApi,
  getAllPositionApi,
  getAllOfficeApi,
} from "../../api/queries/getters";
import { useGet } from "../../hooks/CRUD/useGet";
import DeleteDialog from "../../components/DeleteDialog";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { deleteEmployee } from "../../api/queries/delete";
import { actions } from "../../utils/helperConstant";

const Employee = () => {
  const [rowSelection, setRowSelection] = useState({});
  const [commentModalEmployee, setCommentModalEmployee] = useState(null);
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

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
    actions: employeeFilterActions,
    selectors: employeeFilterSelectors,
  });

  const { data: departments } = useGet({
    apiFn: getAllDepartmentApi,
    key: "department",
  });

  const { data: positions } = useGet({
    apiFn: getAllPositionApi,
    key: "position",
  });

  const { data: offices } = useGet({
    apiFn: getAllOfficeApi,
    key: "office",
  });

  const getFilterValueName = useCallback(
    (key, value) => {
      if (key === "department_guid") {
        const item = departments.find((d) => d.guid === value);
        return item ? selectedLang(item.name) : value;
      }
      if (key === "position_guid") {
        const item = positions.find((p) => p.guid === value);
        return item ? selectedLang(item.name) : value;
      }
      if (key === "office_guid") {
        const item = offices.find((o) => o.guid === value);
        return item ? selectedLang(item.fullName) : value;
      }
      return value;
    },
    [departments, positions, offices, selectedLang],
  );

  const {
    data: employeesData,
    isLoading,
    isFetching,
    refetch,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
    params: queryParams,
  });

  const { mutate: deleteEmployeeMutate, isPending: isDeleting } = useDelete({
    deleteFn: deleteEmployee,
    queryKey: ["employees", queryParams],
    idKey: "guid",
    apiName: "guid",
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (employee) => deleteEmployeeMutate(employee.guid),
  });

  const handleDeleteClick = useCallback(
    (employee) => deleteDialog.open(employee),
    [deleteDialog],
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
      },
      {
        accessorFn: (row) => row.gmail,
        id: "gmail",
        header: t("columns.gmail"),
        size: 200,
      },
      {
        accessorFn: (row) => selectedLang(row.department?.name),
        id: "department",
        header: t("columns.department"),
        size: 150,
      },
      {
        accessorFn: (row) => selectedLang(row.position?.name),
        id: "position",
        header: t("columns.position"),
        size: 150,
      },
      {
        accessorFn: (row) => selectedLang(row.office?.fullName),
        id: "office",
        header: t("columns.office"),
        size: 130,
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
            showComment={true}
            onCommentClick={(employeeData) => setCommentModalEmployee(employeeData)}
          />
        ),
      },
    ],
    [t],
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
    data: employeesData,

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
    // enableSorting: true,
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

        {activeFilters.map(([key, value]) => {
          const labelKey = key.endsWith("_guid") ? key.replace("_guid", "") : key;
          const displayValue = getFilterValueName(key, value);
          return (
            <Chip
              key={key}
              label={`${t(`columns.${labelKey}`, labelKey)}: ${displayValue}`}
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
    renderCreateRowDialogContent: ({ table }) => <AddEmployee table={table} />,
    renderEditRowDialogContent: ({ table, row }) => (
      <EditEmployee table={table} row={row} />
    ),
  });

  return (
    <>
      <PageHeader
        title={t("employee.title")}
        pageTitle={`${t("employee.title")} | Oguz Travel`}
        addButtonText={t("employee.add")}
        onAddClick={() => table.setCreatingRow(true)}
        filterButtonText={t("filter")}
        onFilterClick={openDrawer}
      />

      {/* Filter Drawer */}
      <FilterDrawer
        open={isDrawerOpen}
        onClose={cancelFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        onCancel={cancelFilters}
      >
        <EmployeeFilter
          filters={draft}
          selectsOpen={selectsOpen}
          onFilterChange={setDraftFilter}
          onSelectOpen={openSelect}
          onSelectClose={closeSelect}
        />
      </FilterDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("employee.deleteConfirm") || t("deleteConfirm.employee")}
      />

      <MaterialReactTable table={table} />

      {/* Employee Comment & Notification Modal */}
      {Boolean(commentModalEmployee) && (
        <EmployeeCommentModal
          open={Boolean(commentModalEmployee)}
          onClose={() => setCommentModalEmployee(null)}
          employee={commentModalEmployee}
        />
      )}
    </>
  );
};

export default Employee;
