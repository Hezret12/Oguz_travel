import { useMemo, useCallback, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Button, Checkbox, IconButton, Tooltip, Typography } from "@mui/material";
import { CheckCheck, Lock, LockOpen, UserPlus } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import { useDateFormat } from "../../../functions/generalHelpers";
import PageHeader from "../../../components/PageHeader";
import Pagination from "../../../components/Pagination";
import TableEmptyState from "../../../components/TableEmptyState";
import StackedCell from "../../../components/inputs/StackCell";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import PaymentStatusCell from "../../../components/PaymentStatusCell";
import DeleteDialog from "../../../components/DeleteDialog";
import FilterDrawer from "../../../components/FilterDrawer";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import ExportExcelButton from "../../../components/ExportExcelButton";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useGet } from "../../../hooks/CRUD/useGet";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useTableFilters, useDrawerFilters } from "../../../hooks/usePageFilters";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import {
  getAllSalariesApi,
  getSalaryMonthStatusApi,
  getSalarySummaryApi,
} from "../../../api/queries/getters";
import { generateSalaryMonthApi, markSalaryPaidApi } from "../../../api/queries/post";
import { lockSalaryMonthApi, updateSalaryApi } from "../../../api/queries/patch";
import { deleteSalaryApi } from "../../../api/queries/delete";
import {
  salaryFilterActions,
  salaryFilterSelectors,
} from "../../../store/slices/filters/salaryFilterSlice";
import SalaryFilter from "./Contents/SalaryFilter";
import SalaryMonthPicker from "./Contents/SalaryMonthPicker";
import SalaryGenerateState from "./Contents/SalaryGenerateState";
import EditableCell from "./Contents/EditableCell";
import AddSalaryModal from "./AddSalaryModal";
import EditSalaryModal from "./EditSalaryModal";
import { formatMoney, getPaidPercent, toNumber } from "./functions/salaryUtils";
import { exportSalaryExcel } from "./functions/exportSalaryExcel";

const SalaryFilterDrawer = () => {
  const {
    draft,
    isDrawerOpen,
    setDraftFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
  } = useDrawerFilters({
    actions: salaryFilterActions,
    selectors: salaryFilterSelectors,
  });

  return (
    <FilterDrawer
      open={isDrawerOpen}
      onClose={cancelFilters}
      onApply={applyFilters}
      onReset={resetFilters}
      onCancel={cancelFilters}
    >
      <SalaryFilter filters={draft} onFilterChange={setDraftFilter} />
    </FilterDrawer>
  );
};

const RIGHT = {
  muiTableHeadCellProps: { align: "right" },
  muiTableBodyCellProps: { align: "right" },
  muiTableFooterCellProps: { align: "right" },
};

// JEMI / BERMELI are server-computed: shaded so they read as "not editable".
const COMPUTED = {
  ...RIGHT,
  muiTableBodyCellProps: { align: "right", sx: { backgroundColor: "action.hover" } },
};

const FooterValue = ({ value }) => (
  <Typography
    component="span"
    sx={{ fontWeight: 800, fontSize: "0.85rem", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
  >
    {value}
  </Typography>
);

const Salary = () => {
  const { t, selectedLang } = useLocale();
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = getDefaultMRTOptions();
  const [rowSelection, setRowSelection] = useState({});
  const [isExporting, setIsExporting] = useState(false);

  const {
    applied,
    openDrawer,
    setFilter,
    resetFilters,
    searchQuery,
    setSearch,
    page,
    limit,
    setPage,
    setPageSize,
    queryParams,
  } = useTableFilters({
    actions: salaryFilterActions,
    selectors: salaryFilterSelectors,
  });

  const month = applied.month;
  const monthLabel = dayjs(`${month}-01`).format("MM.YYYY");

  // Selection belongs to one month/page; drop it when either changes.
  const selectionScope = `${month}|${applied.office_guid}|${page}`;
  const [prevSelectionScope, setPrevSelectionScope] = useState(selectionScope);
  if (selectionScope !== prevSelectionScope) {
    setPrevSelectionScope(selectionScope);
    setRowSelection({});
  }

  const listParams = useMemo(() => ({ ...queryParams, include_previous: true }), [queryParams]);

  const {
    data: salariesData,
    isLoading,
    isFetching,
    refetch,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllSalariesApi,
    key: "salaries",
    params: listParams,
  });

  const salaries = useMemo(
    () => (Array.isArray(salariesData) ? salariesData : []),
    [salariesData],
  );

  // Totals for the whole filtered month (not just the current page) — the
  // Excel sheet's bottom row.
  const summaryParams = useMemo(() => {
    const rest = { ...queryParams };
    delete rest.page;
    delete rest.limit;
    return rest;
  }, [queryParams]);

  const { data: summary } = useGet({
    apiFn: getSalarySummaryApi,
    key: "salarySummary",
    params: summaryParams,
  });

  const { data: monthStatus } = useGet({
    apiFn: getSalaryMonthStatusApi,
    key: "salaryMonthStatus",
    params: { month },
  });
  const isLocked = Boolean(monthStatus?.is_locked);

  // --- mutations -----------------------------------------------------------
  // useUpdate / useDelete wrap each invalidateQueries entry as [entry].
  const { mutate: deleteSalary, isPending: isDeleting } = useDelete({
    deleteFn: deleteSalaryApi,
    queryKey: "salaries",
    idKey: "guid",
    isPaginated: true,
    invalidateQueries: ["salarySummary"],
  });

  const { mutateAsync: updateSalaryAsync } = useUpdate({
    apiFn: updateSalaryApi,
    key: "salaries",
    idKey: "guid",
    invalidateQueries: ["salarySummary"],
    showSuccessMessage: false,
  });

  const { mutate: generateMonth, isPending: isGenerating } = useCreate({
    apiFn: generateSalaryMonthApi,
    key: "salaries",
    isPaginated: true,
    invalidateQueries: ["salarySummary"],
  });

  const { mutate: markPaid, isPending: isMarkingPaid } = useCreate({
    apiFn: markSalaryPaidApi,
    key: "salaries",
    isPaginated: true,
    invalidateQueries: ["salarySummary"],
    onSuccess: () => setRowSelection({}),
  });

  const { mutate: lockMonth, isPending: isLocking } = useCreate({
    apiFn: lockSalaryMonthApi,
    key: "salaryMonthStatus",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteSalary(item.guid),
  });
  const openDeleteDialog = deleteDialog.open;

  const handleMonthChange = useCallback(
    (nextMonth) => setFilter("month", nextMonth),
    [setFilter],
  );

  const handleGenerate = useCallback(() => {
    generateMonth({ month, ...(applied.office_guid && { office_guid: applied.office_guid }) });
  }, [generateMonth, month, applied.office_guid]);

  const handleMarkPaid = useCallback(
    (guids) => markPaid({ guids }),
    [markPaid],
  );

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportSalaryExcel({ params: summaryParams, monthLabel, selectedLang, t });
    } catch (error) {
      console.error(error);
      toast.error(t("salary.exportFailed"));
    } finally {
      setIsExporting(false);
    }
  };

  // Inline edit → PATCH only the changed field; the server recomputes JEMI /
  // BERMELI and useUpdate merges the returned row into the cache.
  const saveCell = useCallback(
    (row, field, value) => {
      const payload = { guid: row.guid, [field]: value };
      if (field === "work_days") {
        if (value < 1 || value > 31) {
          toast.error(t("salary.invalidDays"));
          return Promise.reject(new Error("invalid"));
        }
        // Shortening the month clamps the worked days along with it.
        if (toNumber(row.worked_days) > value) payload.worked_days = value;
      }
      if (field === "worked_days" && value > toNumber(row.work_days)) {
        toast.error(t("salary.validation.workedDaysExceed"));
        return Promise.reject(new Error("invalid"));
      }
      return updateSalaryAsync(payload);
    },
    [t, updateSalaryAsync],
  );

  const editable = useCallback(
    (field, { integer = false } = {}) => ({
      Cell: ({ row }) => (
        <EditableCell
          value={row.original[field]}
          previous={row.original.previous?.[field]}
          rowIndex={row.index}
          field={field}
          integer={integer}
          readOnly={isLocked}
          align={integer ? "center" : "right"}
          onCommit={(value) => saveCell(row.original, field, value)}
        />
      ),
    }),
    [isLocked, saveCell],
  );

  const footerMoney = useCallback(
    (key) => () => <FooterValue value={formatMoney(summary?.[key])} />,
    [summary],
  );

  const selectedGuids = Object.keys(rowSelection).filter((k) => rowSelection[k]);
  const pageGuids = useMemo(() => salaries.map((r) => r.guid), [salaries]);
  const allPageSelected = pageGuids.length > 0 && pageGuids.every((g) => rowSelection[g]);
  const somePageSelected = !allPageSelected && pageGuids.some((g) => rowSelection[g]);

  const toggleRow = useCallback(
    (guid) => setRowSelection((prev) => ({ ...prev, [guid]: !prev[guid] })),
    [],
  );
  const toggleAllRows = useCallback(
    () =>
      setRowSelection(
        allPageSelected ? {} : Object.fromEntries(pageGuids.map((g) => [g, true])),
      ),
    [allPageSelected, pageGuids],
  );

  const columns = useMemo(
    () => [
      // Own selection column: MRT 3's built-in one passes the `inputProps`
      // prop MUI 9 checkboxes no longer accept, which leaks onto the DOM.
      ...(isLocked
        ? []
        : [
            {
              id: "select",
              header: "",
              size: 44,
              muiTableHeadCellProps: { align: "center" },
              muiTableBodyCellProps: { align: "center" },
              Header: () => (
                <Checkbox
                  size="small"
                  checked={allPageSelected}
                  indeterminate={somePageSelected}
                  onChange={toggleAllRows}
                  slotProps={{ input: { "aria-label": t("all") } }}
                />
              ),
              Cell: ({ row }) => (
                <Checkbox
                  size="small"
                  checked={Boolean(rowSelection[row.original.guid])}
                  onChange={() => toggleRow(row.original.guid)}
                  slotProps={{ input: { "aria-label": row.original.employee?.fullName || "" } }}
                />
              ),
            },
          ]),
      {
        id: "index_number",
        header: "№",
        size: 50,
        Cell: ({ row }) => (page - 1) * limit + row.index + 1,
        Footer: () => <FooterValue value={summary?.count ?? 0} />,
      },
      {
        id: "employee",
        header: t("salary.employee"),
        size: 230,
        accessorFn: (row) => row.employee?.fullName,
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.employee?.fullName}
            secondary={selectedLang(row.original.employee?.office?.shortName)}
          />
        ),
        Footer: () => (
          <Typography component="span" sx={{ fontWeight: 700, fontSize: "0.8rem", color: "text.secondary" }}>
            {t("salary.employeesCount")}
          </Typography>
        ),
      },
      {
        id: "card_amount",
        header: t("salary.cardAmount"),
        size: 120,
        ...RIGHT,
        ...editable("card_amount"),
        Footer: footerMoney("card_amount"),
      },
      {
        id: "base_salary",
        header: t("salary.baseSalary"),
        size: 120,
        ...RIGHT,
        ...editable("base_salary"),
        Footer: footerMoney("base_salary"),
      },
      {
        id: "work_days",
        header: t("salary.workDays"),
        size: 80,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        ...editable("work_days", { integer: true }),
      },
      {
        id: "worked_days",
        header: t("salary.workedDays"),
        size: 80,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: ({ row }) => ({
          align: "center",
          sx: {
            color:
              toNumber(row.original.worked_days) < toNumber(row.original.work_days)
                ? "warning.main"
                : undefined,
          },
        }),
        ...editable("worked_days", { integer: true }),
      },
      {
        id: "advance",
        header: t("salary.advance"),
        size: 110,
        ...RIGHT,
        ...editable("advance"),
        Footer: footerMoney("advance"),
      },
      {
        id: "cafeteria_credit",
        header: t("salary.cafeteriaCredit"),
        size: 115,
        ...RIGHT,
        ...editable("cafeteria_credit"),
        Footer: footerMoney("cafeteria_credit"),
      },
      {
        id: "loan",
        header: t("salary.loan"),
        size: 100,
        ...RIGHT,
        ...editable("loan"),
        Footer: footerMoney("loan"),
      },
      {
        id: "bonus",
        header: t("salary.bonus"),
        size: 100,
        ...RIGHT,
        ...editable("bonus"),
        Footer: footerMoney("bonus"),
      },
      {
        id: "total_amount",
        header: t("salary.total"),
        size: 120,
        ...COMPUTED,
        Cell: ({ row }) => (
          <Box component="span" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {formatMoney(row.original.total_amount)}
          </Box>
        ),
        Footer: footerMoney("total_amount"),
      },
      {
        id: "payable_amount",
        header: t("salary.payable"),
        size: 120,
        ...COMPUTED,
        Cell: ({ row }) => (
          <Box
            component="span"
            sx={{
              fontWeight: 800,
              fontVariantNumeric: "tabular-nums",
              color: toNumber(row.original.payable_amount) < 0 ? "error.main" : "primary.main",
            }}
          >
            {formatMoney(row.original.payable_amount)}
          </Box>
        ),
        Footer: footerMoney("payable_amount"),
      },
      {
        id: "paid_amount",
        header: t("salary.paidAmount"),
        size: 120,
        ...RIGHT,
        ...editable("paid_amount"),
        Footer: footerMoney("paid_amount"),
      },
      {
        id: "paid_date",
        header: t("salary.paidDate"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) =>
          row.original.paid_date
            ? formatChange(row.original.paid_date, { dateOnly: true })
            : "-",
      },
      {
        id: "paid_status",
        header: t("salary.paidStatus"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const percent = getPaidPercent(row.original.paid_amount, row.original.payable_amount);
          return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
              <PaymentStatusCell percent={percent} />
              {!isLocked && percent < 100 && (
                <Tooltip title={t("salary.markPaid")} arrow>
                  <span>
                    <IconButton
                      size="small"
                      color="success"
                      disabled={isMarkingPaid}
                      onClick={() => handleMarkPaid([row.original.guid])}
                    >
                      <CheckCheck size={16} />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
          );
        },
      },
      {
        accessorKey: "note",
        id: "note",
        header: t("salary.note"),
        size: 170,
        Cell: ({ cell }) => (
          <Typography variant="body2" noWrap title={cell.getValue() || ""} sx={{ maxWidth: 160 }}>
            {cell.getValue() || ""}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table: mrtTable }) =>
          isLocked ? (
            <Lock size={15} style={{ opacity: 0.4 }} />
          ) : (
            <ColumnActionButtons
              row={row}
              table={mrtTable}
              onDelete={() => openDeleteDialog(row.original)}
            />
          ),
      },
    ],
    [
      t,
      selectedLang,
      formatChange,
      page,
      limit,
      summary,
      footerMoney,
      editable,
      isLocked,
      isMarkingPaid,
      handleMarkPaid,
      openDeleteDialog,
      rowSelection,
      toggleRow,
      allPageSelected,
      somePageSelected,
      toggleAllRows,
    ],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    // Same reason as Cafeteria: the modals render their own <Dialog>.
    createDisplayMode: "custom",
    editDisplayMode: "custom",
    columns,
    data: salaries,
    enableSorting: false,
    enableStickyFooter: true,
    getRowId: (row) => row.guid,
    state: {
      isLoading: false,
      showLoadingOverlay: isLoading || (isFetching && salaries.length === 0),
      showSkeletons: false,
      showProgressBars: isFetching && salaries.length > 0,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    initialState: {
      density: "compact",
      columnPinning: {
        left: ["select", "index_number", "employee"],
        right: ["actions"],
      },
    },
    manualPagination: true,
    manualFiltering: true,
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

    muiTableFooterCellProps: {
      sx: { backgroundColor: "background.paper", py: 1 },
    },

    renderEmptyRowsFallback: () => {
      if (isLoading || isFetching) return null;
      if (searchQuery) return <TableEmptyState onResetFilters={resetFilters} />;
      return (
        <SalaryGenerateState
          monthLabel={monthLabel}
          locked={isLocked}
          isPending={isGenerating}
          onGenerate={handleGenerate}
        />
      );
    },

    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mt: 0.5 }}>
        <GlobalSearchInput
          value={searchQuery}
          onChange={setSearch}
          placeholder={t("search")}
          disabled={isLoading}
          onRefetch={refetch}
          isFetching={isFetching}
        />

        {selectedGuids.length > 0 && !isLocked && (
          <Button
            variant="contained"
            color="success"
            disableElevation
            startIcon={<CheckCheck size={16} />}
            disabled={isMarkingPaid}
            onClick={() => handleMarkPaid(selectedGuids)}
            sx={{ height: 40, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
          >
            {t("salary.markSelectedPaid", { count: selectedGuids.length })}
          </Button>
        )}

        {salaries.length > 0 && !isLocked && (
          <Tooltip title={t("salary.generateMissing")} arrow>
            <span>
              <IconButton
                onClick={handleGenerate}
                disabled={isGenerating}
                sx={{ border: "1px solid", borderColor: "divider", borderRadius: "10px", width: 40, height: 40 }}
              >
                <UserPlus size={18} />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {salaries.length > 0 && !isLocked && (
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", lg: "block" } }}>
            {t("salary.inlineHint")}
          </Typography>
        )}
      </Box>
    ),

    renderBottomToolbar: ({ table: mrtTable }) => {
      const { pageIndex } = mrtTable.getState().pagination;
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
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
      <PageHeader
        title={t("salary.title")}
        pageTitle={`${t("salary.title")} | Oguz Travel`}
        addButtonText={t("salary.add")}
        filterButtonText={t("filter")}
        onAddClick={isLocked ? undefined : () => table.setCreatingRow(true)}
        onFilterClick={openDrawer}
      >
        <SalaryMonthPicker value={month} onChange={handleMonthChange} />

        <Tooltip title={isLocked ? t("salary.lockedHint") : ""} arrow>
          <Button
            variant={isLocked ? "contained" : "outlined"}
            color={isLocked ? "warning" : "inherit"}
            disableElevation
            disabled={isLocking || monthStatus?.month !== month}
            startIcon={isLocked ? <Lock size={16} /> : <LockOpen size={16} />}
            onClick={(e) => {
              e.currentTarget.blur();
              lockMonth({ month, is_locked: !isLocked });
            }}
            sx={{
              height: 40,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              whiteSpace: "nowrap",
              ...(!isLocked && { borderColor: "divider" }),
            }}
          >
            {isLocked ? `${t("salary.locked")} · ${t("salary.unlock")}` : t("salary.lock")}
          </Button>
        </Tooltip>

        <ExportExcelButton
          onClick={handleExport}
          disabled={isExporting || salaries.length === 0}
          label={t("salary.exportExcel")}
        />
      </PageHeader>

      <SalaryFilterDrawer />

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("salary.deleteConfirm")}
      />

      {Boolean(table.getState().creatingRow) && (
        <AddSalaryModal table={table} defaultMonth={month} />
      )}

      {Boolean(table.getState().editingRow) && (
        <EditSalaryModal table={table} row={table.getState().editingRow} />
      )}

      <MaterialReactTable table={table} />
    </Box>
  );
};

export default Salary;
