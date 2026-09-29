import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import TableErrorState from "../../components/TableErrorState";
import { MaterialReactTable } from "material-react-table";
import { useMaterialReactTable } from "material-react-table";
import { useMemo, useState, useCallback } from "react";
import { useLocale } from "../../hooks/useLocale";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import { History } from "lucide-react";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import StatusChip from "../../components/StatusChip";
import { EMPLOYEE_ACTIVE_CONFIG } from "../../functions/statusChipConfigs";
import AddEmployee from "./Contents/AddEmployee";
import EditEmployee from "./Contents/EditEmployee";
import EmployeeLoanHistoryModal from "./Contents/EmployeeLoanHistoryModal";
import { formatMoney } from "../Finance/Salary/functions/salaryUtils";
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
  const [loanHistoryEmployee, setLoanHistoryEmployee] = useState(null);
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);

  const handleOpenLoanHistory = useCallback((emp) => {
    setLoanHistoryEmployee(emp);
  }, []);

  const handleCloseLoanHistory = useCallback(() => {
    setLoanHistoryEmployee(null);
  }, []);

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
    isError,
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

  // `open` never changes, so the columns memo that uses this handler is no
  // longer rebuilt every time the delete dialog opens or closes.
  const handleDeleteClick = deleteDialog.open;

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
        id: "loan",
        header: t("columns.loan"),
        size: 130,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ row }) => {
          const raw = row.original;
          const initial = Number(raw.empl_loan ?? raw.loan ?? 0);
          const deducted = Number(raw.salary_loans_total ?? 0);
          const remaining =
            raw.salary_loans_total !== undefined
              ? Math.round((initial - deducted) * 100) / 100
              : Number(raw.remaining_loan ?? Math.round((initial - deducted) * 100) / 100);

          if (initial === 0 && remaining === 0) {
            return (
              <Typography
                component="span"
                sx={{ color: "text.secondary", fontSize: "0.85rem" }}
              >
                -
              </Typography>
            );
          }

          if (remaining <= 0 && initial > 0) {
            return (
              <Tooltip
                title={`${t("employee.initialLoan")}: ${formatMoney(initial, { dashZero: false })} TMT • ${t("employee.totalLoanDeducted")}: ${formatMoney(deducted, { dashZero: false })} TMT`}
                arrow
                placement="top"
              >
                <Chip
                  size="small"
                  label={t("employee.fullyPaid")}
                  color="success"
                  variant="outlined"
                  sx={{
                    height: "22px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    borderRadius: "6px",
                  }}
                />
              </Tooltip>
            );
          }

          return (
            <Tooltip
              title={`${t("employee.initialLoan")}: ${formatMoney(initial, { dashZero: false })} TMT • ${t("employee.totalLoanDeducted")}: ${formatMoney(deducted, { dashZero: false })} TMT`}
              arrow
              placement="top"
            >
              <Box
                sx={{
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  cursor: "pointer",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    fontVariantNumeric: "tabular-nums",
                    color: "#d97706",
                  }}
                >
                  {formatMoney(remaining, { dashZero: false })} TMT
                </Typography>
                {deducted > 0 && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "0.7rem",
                      color: "text.secondary",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    -{formatMoney(deducted, { dashZero: false })}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "is_active",
        id: "is_active",
        header: t("columns.status"),
        size: 110,
        Cell: ({ row }) => (
          <StatusChip
            status={row.original.is_active === false ? "FALSE" : "TRUE"}
            config={EMPLOYEE_ACTIVE_CONFIG}
          />
        ),
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 135,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Tooltip title={t("employee.loanHistory")} arrow placement="top">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  e.currentTarget.blur();
                  handleOpenLoanHistory(row.original);
                }}
                size="small"
                sx={(theme) => ({
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  backgroundColor: "rgba(245, 158, 11, 0.06)",
                  color: "#d97706",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    borderColor: "#d97706",
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "scale(0.95)" },
                  ...theme.applyStyles("dark", {
                    border: "1px solid rgba(245, 158, 11, 0.35)",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    color: "#fbbf24",
                    "&:hover": {
                      backgroundColor: "rgba(245, 158, 11, 0.2)",
                      borderColor: "#fbbf24",
                    },
                  }),
                })}
              >
                <History size={15} />
              </IconButton>
            </Tooltip>

            <ColumnActionButtons
              row={row}
              table={table}
              onDelete={handleDeleteClick}
            />
          </Box>
        ),
      },
    ],
    [selectedLang, t, handleDeleteClick, handleOpenLoanHistory],
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
    // A failed request must not read as "no records".
    renderEmptyRowsFallback: () =>
      isError ? (
        <TableErrorState onRetry={refetch} isRetrying={isFetching} />
      ) : (
        defaultMrtOptions.renderEmptyRowsFallback()
      ),
    // Avoids nesting MRT's own create/edit <Dialog> around the one
    // AddEmployee/EditEmployee already render — see Translate/index.jsx.
    createDisplayMode: "custom",
    editDisplayMode: "custom",
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

      {Boolean(table.getState().creatingRow) && (
        <AddEmployee table={table} />
      )}

      {Boolean(table.getState().editingRow) && (
        <EditEmployee table={table} row={table.getState().editingRow} />
      )}

      {Boolean(loanHistoryEmployee) && (
        <EmployeeLoanHistoryModal
          open={Boolean(loanHistoryEmployee)}
          close={handleCloseLoanHistory}
          employee={loanHistoryEmployee}
          onEditEmployee={(emp) => {
            const mrtRow = table.getRow(emp.guid);
            if (mrtRow) {
              table.setEditingRow(mrtRow);
            }
          }}
        />
      )}

      <MaterialReactTable table={table} />
    </>
  );
};

export default Employee;
