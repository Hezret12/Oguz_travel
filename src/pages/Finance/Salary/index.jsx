import { useMemo, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { CheckCheck, Lock, LockOpen, MapPinHouse } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import { useDateFormat } from "../../../functions/generalHelpers";
import PageHeader from "../../../components/PageHeader";
import Pagination from "../../../components/Pagination";
import TableEmptyState from "../../../components/TableEmptyState";
import TableErrorState from "../../../components/TableErrorState";
import StatusChip from "../../../components/StatusChip";
import { SALARY_PAID_STATUS_CONFIG } from "../../../functions/statusChipConfigs";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import ExportExcelButton from "../../../components/ExportExcelButton";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useGet } from "../../../hooks/CRUD/useGet";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useTableFilters } from "../../../hooks/usePageFilters";
import { useAuth } from "../../../context/useAuth";
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
import SalaryMonthPicker from "./Contents/SalaryMonthPicker";
import SalaryGenerateState from "./Contents/SalaryGenerateState";
import EditableCell from "./Contents/EditableCell";
import EditSalaryModal from "./EditSalaryModal";
import AddSalaryModal from "./AddSalaryModal";
import {
  BONUS_CURRENCY,
  formatMoney,
  formatMonthTk,
  getBonusCurrency,
  isSalaryPaid,
  isPercentRow,
  toNumber,
} from "./functions/salaryUtils";
import { exportSalaryExcel } from "./functions/exportSalaryExcel";

// Headers are centred across the table; the numbers themselves stay
// right-aligned so digits line up.
const RIGHT = {
  muiTableHeadCellProps: { align: "center" },
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
  const { user } = useAuth();
  // normalizeUser keeps the office's multilingual fullName object.
  const officeName =
    typeof user?.office === "string" ? user.office : selectedLang(user?.office) || "";
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);

  const {
    applied,
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
  const monthLabel = formatMonthTk(month);

  const listParams = useMemo(() => ({ ...queryParams, include_previous: true }), [queryParams]);

  const {
    data: salariesData,
    isLoading,
    isFetching,
    isError,
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

  // Page filters without paging: the table footer totals cover the whole
  // filtered month, and the Excel export loads every page with them.
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
  // An unstarted month shows only the "start month" card — no empty table
  // with headers, totals row and scrollbar.
  const isMonthEmpty = !isLoading && !searchQuery && totalItems === 0;
  // An admin without an office sees every office but cannot lock one.
  const canLock = monthStatus?.month === month && monthStatus?.can_lock !== false;

  // --- mutations -----------------------------------------------------------
  // useUpdate / useDelete wrap each invalidateQueries entry as [entry].
  const { mutate: deleteSalary, isPending: isDeleting } = useDelete({
    deleteFn: deleteSalaryApi,
    queryKey: "salaries",
    idKey: "guid",
    isPaginated: true,
    // A deleted row's employee becomes addable again.
    invalidateQueries: ["salarySummary", "salaryMissingEmployees"],
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
  });

  // Locking also marks every unpaid row of the month as paid on the server.
  const { mutate: lockMonth, isPending: isLocking } = useCreate({
    apiFn: lockSalaryMonthApi,
    key: "salaryMonthStatus",
    isPaginated: true,
    invalidateQueries: ["salaries", "salarySummary"],
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteSalary(item.guid),
  });
  const openDeleteDialog = deleteDialog.open;

  const handleMonthChange = useCallback(
    (nextMonth) => setFilter("month", nextMonth),
    [setFilter],
  );

  // The server limits generation to the caller's office and active employees.
  const handleGenerate = useCallback(() => {
    generateMonth({ month });
  }, [generateMonth, month]);

  const handleMarkPaid = useCallback(
    (guids) => markPaid({ guids }),
    [markPaid],
  );

  // GlobalExcelExportModal confirms, loads every page and hands the rows over.
  const handleExport = useCallback(
    (items) => exportSalaryExcel(items, { monthLabel, officeName, selectedLang, t }),
    [monthLabel, officeName, selectedLang, t],
  );

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
    (field, { integer = false, currencyOf } = {}) => ({
      Cell: ({ row }) => (
        <EditableCell
          value={row.original[field]}
          previous={row.original.previous?.[field]}
          rowIndex={row.index}
          field={field}
          integer={integer}
          readOnly={isLocked}
          align={integer ? "center" : "right"}
          currency={currencyOf?.(row.original)}
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

  const columns = useMemo(
    () => [
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
          <Typography variant="body2" noWrap title={row.original.employee?.fullName || ""}>
            {row.original.employee?.fullName || "-"}
          </Typography>
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
        size: 130,
        ...RIGHT,
        // A percent bonus is derived from sales × %, so it is edited in the
        // modal; only fixed bonuses are edited inline. The bonus currency is
        // picked in the modal too.
        Cell: (props) => {
          const { row } = props;
          if (!isPercentRow(row.original)) {
            return editable("bonus", { currencyOf: getBonusCurrency }).Cell(props);
          }
          const currency = getBonusCurrency(row.original);
          return (
            <Tooltip title={t("salary.bonusPercent")} arrow placement="top">
              <Box sx={{ textAlign: "right", lineHeight: 1.2 }}>
                <Box component="span" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {formatMoney(row.original.bonus, { currency })}
                </Box>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                  {t("salary.percentOf", {
                    sales: formatMoney(row.original.sales_amount, { dashZero: false, currency }),
                    percent: toNumber(row.original.bonus_percent),
                  })}
                </Typography>
              </Box>
            </Tooltip>
          );
        },
        // `bonus` sums TMT bonuses; USD bonuses come as `bonus_usd`.
        Footer: () => {
          const bonusUsd = toNumber(summary?.bonus_usd);
          if (!bonusUsd) return <FooterValue value={formatMoney(summary?.bonus)} />;
          return (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <FooterValue value={formatMoney(summary?.bonus)} />
              <FooterValue value={formatMoney(bonusUsd, { currency: BONUS_CURRENCY.USD })} />
            </Box>
          );
        },
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
        Cell: ({ row }) => (
          <StatusChip
            status={isSalaryPaid(row.original)}
            config={SALARY_PAID_STATUS_CONFIG}
          />
        ),
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
        size: 120,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table: mrtTable }) => {
          if (isLocked) return <Lock size={15} style={{ opacity: 0.4 }} />;
          const fullyPaid = isSalaryPaid(row.original);
          return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <Tooltip title={fullyPaid ? t("salary.alreadyPaid") : t("salary.markPaid")} arrow>
                <span>
                  <IconButton
                    size="small"
                    disabled={fullyPaid || isMarkingPaid}
                    onClick={() => handleMarkPaid([row.original.guid])}
                    sx={(theme) => ({
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      color: "#059669",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        borderColor: "#059669",
                        transform: "translateY(-1px)",
                      },
                      "&:active": { transform: "scale(0.95)" },
                      "&.Mui-disabled": {
                        border: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.action.disabled,
                      },
                      ...theme.applyStyles("dark", {
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#34d399",
                        "&:hover": {
                          borderColor: "#34d399",
                        },
                      }),
                    })}
                  >
                    <CheckCheck size={15} strokeWidth={2} />
                  </IconButton>
                </span>
              </Tooltip>
              <ColumnActionButtons
                row={row}
                table={mrtTable}
                onDelete={() => openDeleteDialog(row.original)}
              />
            </Box>
          );
        },
      },
    ],
    [
      t,
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
        left: ["index_number", "employee"],
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

    // Default for columns that set no head alignment of their own.
    muiTableHeadCellProps: { align: "center" },

    muiTableFooterCellProps: {
      sx: { backgroundColor: "background.paper", py: 1 },
    },

    renderEmptyRowsFallback: () => {
      if (isLoading || isFetching) return null;
      if (isError) return <TableErrorState onRetry={refetch} isRetrying={isFetching} />;
      return <TableEmptyState onResetFilters={resetFilters} />;
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
        // An unstarted month uses "start month" instead; a locked one is read-only.
        onAddClick={isLocked || totalItems === 0 ? undefined : () => table.setCreatingRow(true)}
      >
        {officeName && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              height: 40,
              px: 1.5,
              borderRadius: "10px",
              border: "1px solid",
              borderColor: "divider",
              color: "text.secondary",
              whiteSpace: "nowrap",
            }}
          >
            <MapPinHouse size={16} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {officeName}
            </Typography>
          </Box>
        )}

        <SalaryMonthPicker value={month} onChange={handleMonthChange} />

        <Tooltip title={isLocked ? t("salary.lockedHint") : t("salary.lockHint")} arrow>
          {/* span: a disabled button fires no events, so the tooltip needs a wrapper */}
          <Box component="span" sx={{ display: "inline-flex" }}>
            <Button
              variant={isLocked ? "contained" : "outlined"}
              color={isLocked ? "warning" : "inherit"}
              disableElevation
              disabled={isLocking || !canLock}
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
          </Box>
        </Tooltip>

        <ExportExcelButton
          apiFn={getAllSalariesApi}
          queryParams={summaryParams}
          totalItems={totalItems}
          customExportFn={handleExport}
          disabled={salaries.length === 0}
          label={t("salary.exportExcel")}
        />
      </PageHeader>

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("salary.deleteConfirm")}
      />

      {Boolean(table.getState().editingRow) && (
        <EditSalaryModal table={table} row={table.getState().editingRow} />
      )}

      {Boolean(table.getState().creatingRow) && (
        <AddSalaryModal table={table} month={month} monthLabel={monthLabel} />
      )}

      {isMonthEmpty ? (
        <Box
          sx={{
            height: "calc(100vh - 190px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflowY: "auto",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "12px",
            backgroundColor: "background.paper",
          }}
        >
          <SalaryGenerateState
            monthLabel={monthLabel}
            locked={isLocked}
            isCurrentMonth={month === dayjs().format("YYYY-MM")}
            isPending={isGenerating}
            onGenerate={handleGenerate}
          />
        </Box>
      ) : (
        <MaterialReactTable table={table} />
      )}
    </Box>
  );
};

export default Salary;
