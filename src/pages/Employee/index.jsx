import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import { MaterialReactTable } from "material-react-table";
import { useMaterialReactTable } from "material-react-table";
import { useMemo, useState, useCallback } from "react";
import { useLocale } from "../../hooks/useLocale";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import { Box, Chip, Tooltip } from "@mui/material";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import AddEmployee from "./Contents/AddEmployee";
import EditEmployee from "./Contents/EditEmployee";
import { useTableFilters, useDrawerFilters } from "../../hooks/usePageFilters";
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
import { usePagginationGet } from "../../hooks/usePagginationGet";
import DeleteDialog from "../../components/DeleteDialog";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { deleteEmployee } from "../../api/queries/delete";
import { actions } from "../../utils/helperConstant";

const EmployeeFilterDrawer = () => {
  const {
    draft,
    isDrawerOpen,
    setDraftFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
    selectsOpen,
    openSelect,
    closeSelect,
  } = useDrawerFilters({
    actions: employeeFilterActions,
    selectors: employeeFilterSelectors,
  });

  return (
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
  );
};

const Employee = () => {
  const [rowSelection, setRowSelection] = useState({});
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  const {
    applied,
    openDrawer,
    searchQuery,
    setSearch,
    setFilter,
    page,
    limit,
    setPage,
    setPageSize,
    setSort,
    queryParams,
  } = useTableFilters({
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
        accessorFn: (row) => {
          if (Array.isArray(row.positions) && row.positions.length > 0) {
            return row.positions.map((p) => selectedLang(p.name)).join(", ");
          }
          if (Array.isArray(row.position) && row.position.length > 0) {
            return row.position.map((p) => selectedLang(p.name)).join(", ");
          }
          return selectedLang(row.position?.name) || "-";
        },
        id: "position",
        header: t("columns.position"),
        size: 180,
        Cell: ({ row }) => {
          const raw = row.original;
          const posList = Array.isArray(raw.positions)
            ? raw.positions
            : Array.isArray(raw.position)
            ? raw.position
            : raw.position
            ? [raw.position]
            : [];

          if (posList.length === 0) return "-";
          if (posList.length === 1) {
            return selectedLang(posList[0]?.name) || "-";
          }

          const allPositionNames = posList
            .map((p) => selectedLang(p?.name))
            .filter(Boolean)
            .join(", ");
          const visibleList = posList.slice(0, 2);
          const remainingCount = posList.length - 2;

          return (
            <Tooltip title={allPositionNames} arrow placement="top">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  maxWidth: "100%",
                  overflow: "hidden",
                }}
              >
                {visibleList.map((p, idx) => (
                  <Chip
                    key={p.guid || idx}
                    size="small"
                    label={selectedLang(p?.name)}
                    sx={{
                      height: "22px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      borderRadius: "6px",
                      maxWidth: remainingCount > 0 ? "110px" : "150px",
                      "& .MuiChip-label": {
                        px: 0.75,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    }}
                  />
                ))}
                {remainingCount > 0 && (
                  <Chip
                    size="small"
                    label={`+${remainingCount}`}
                    sx={{
                      height: "22px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      borderRadius: "6px",
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(20, 184, 166, 0.2)"
                          : "rgba(14, 133, 132, 0.12)",
                      color: "primary.main",
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          );
        },
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
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedLang, t],
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
          const labelKey = key.endsWith("_guid")
            ? key.replace("_guid", "")
            : key;
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

      <EmployeeFilterDrawer />

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("employee.deleteConfirm")}
      />

      <MaterialReactTable table={table} />
    </>
  );
};

export default Employee;
