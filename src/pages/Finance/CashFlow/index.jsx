import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Typography, Chip, alpha } from "@mui/material";

import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import PageHeader from "../../../components/PageHeader";
import Pagination from "../../../components/Pagination";
import { useDateFormat } from "../../../functions/generalHelpers";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { deleteCashTransactionApi } from "../../../api/queries/delete";
import { usePageFilters } from "../../../hooks/usePageFilters";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { getAllCashTransactionsApi } from "../../../api/queries/getters";
import {
  cashFlowFilterActions,
  cashFlowFilterSelectors,
} from "../../../store/slices/filters/cashFlowFilterSlice";
import FilterDrawer from "../../../components/FilterDrawer";
import CashFlowFilter from "../Contents/CashFlowFilter";
import AddCashTransactionModal from "../AddCashTransactionModal";
import GlobalSearchInput from "../../../components/GlobalSearchInput";

/* ──────────────── Category chip color map ──────────────── */
const CATEGORY_COLORS = {
  LOT_PURCHASE: { bg: "#EDE9FE", color: "#7C3AED", label: "Supplier Payment" },
  CLIENT_SALE: { bg: "#DBEAFE", color: "#2563EB", label: "Tour Sale" },
  OFFICE_RENT: { bg: "#FEE2E2", color: "#DC2626", label: "Office Rent" },
  SALARY: { bg: "#FEF3C7", color: "#D97706", label: "Salary" },
  CAFETERIA: { bg: "#FFEDD5", color: "#EA580C", label: "Cafeteria" },
  MARKETING: { bg: "#FCE7F3", color: "#DB2777", label: "Marketing" },
  OVERHEAD: { bg: "#F1F5F9", color: "#475569", label: "Utilities" },
  SUPPLIER_PAYMENT: { bg: "#EDE9FE", color: "#7C3AED", label: "Supplier Payment" },
  FLIGHT_SALE: { bg: "#CCFBF1", color: "#0D9488", label: "Flight Sale" },
  TRANSFER_SALE: { bg: "#E0E7FF", color: "#4F46E5", label: "Transfer Sale" },
};

const getCategoryChip = (category) => {
  const cfg = CATEGORY_COLORS[category];
  if (!cfg) return { bg: "#F1F5F9", color: "#475569", label: category || "—" };
  return cfg;
};

/* ──────────────── Stat Pill (inline, compact) ──────────────── */
const StatPill = ({ label, value, color }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "baseline",
      gap: 0.8,
      px: 1.8,
      py: 0.8,
      borderRadius: "10px",
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
      whiteSpace: "nowrap",
    }}
  >
    <Typography
      component="span"
      sx={{ fontSize: "12px", fontWeight: 600, color: "text.secondary" }}
    >
      {label}
    </Typography>
    <Typography
      component="span"
      sx={{
        fontSize: "15px",
        fontWeight: 750,
        color,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {value}
    </Typography>
  </Box>
);

/* ──────────────── Format money helper ──────────────── */
const fmtMoney = (val) =>
  `$${Math.abs(Number(val || 0)).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

/* ──────────────── Main Component ──────────────── */
const CashFlow = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();

  const {
    draft,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    setDraftFilter,
    applyFilters,
    resetFilters,
    searchQuery,
    setSearch,
    page,
    setPage,
    selectsOpen,
    openSelect,
    closeSelect,
    queryParams,
  } = usePageFilters({
    actions: cashFlowFilterActions,
    selectors: cashFlowFilterSelectors,
  });

  const {
    data: transactionsData,
    isLoading,
    isFetching,
    refetch,
    totalItems,
    pageCount,
  } = usePagginationGet({
    apiFn: getAllCashTransactionsApi,
    key: "cashTransactions",
    params: queryParams,
  });

  const transactions = useMemo(() => {
    const raw = transactionsData?.data ?? transactionsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [transactionsData]);

  /* ──────── Compute summary totals ──────── */
  const { totalIncome, totalExpense, netAmount } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach((tx) => {
      const amt = Number(tx.amount || 0);
      if (tx.transaction_type === "INCOME" || tx.transaction_type === "CLIENT_PAYMENT") {
        inc += amt;
      } else {
        exp += amt;
      }
    });
    return { totalIncome: inc, totalExpense: exp, netAmount: inc - exp };
  }, [transactions]);

  const { mutate: deleteTransaction, isPending: isDeleting } = useDelete({
    deleteFn: deleteCashTransactionApi,
    queryKey: ["cashTransactions", queryParams],
    idKey: "guid",
    isPaginated: true,
    invalidateQueries: [["finance-summary"], ["all-cash-boxes"]],
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteTransaction(item.guid || item.id),
  });

  /* ──────────────── Table Columns ──────────────── */
  const columns = useMemo(
    () => [
      {
        accessorKey: "transaction_date",
        header: t("date", "Senesi"),
        size: 120,
        Cell: ({ cell }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "text.primary", fontSize: "13.5px" }}
          >
            {formatChange(cell.getValue(), { dateOnly: true })}
          </Typography>
        ),
      },
      {
        accessorKey: "transaction_type",
        header: t("finance.transactionType"),
        size: 100,
        Cell: ({ row }) => {
          const type = row.original.transaction_type;
          const isIncome = type === "INCOME" || type === "CLIENT_PAYMENT";
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: "13px",
                color: isIncome ? "success.main" : "error.main",
              }}
            >
              {isIncome ? "Income" : "Expense"}
            </Typography>
          );
        },
      },
      {
        accessorKey: "category",
        header: t("category", "Kategoriýa"),
        size: 160,
        Cell: ({ cell, row }) => {
          const cat = cell.getValue() || row.original.transaction_type;
          const cfg = getCategoryChip(cat);
          return (
            <Chip
              label={cfg.label}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "12px",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? alpha(cfg.color, 0.15)
                    : cfg.bg,
                color: cfg.color,
                borderRadius: "6px",
                height: 26,
                "& .MuiChip-label": { px: 1.2 },
              }}
            />
          );
        },
      },
      {
        accessorKey: "cash_box.name",
        header: t("finance.cashBox"),
        size: 170,
        Cell: ({ cell, row }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "text.primary", fontSize: "13.5px" }}
          >
            {cell.getValue() || row.original.cash_box_name || "—"}
          </Typography>
        ),
      },
      {
        accessorKey: "counterparty_name",
        header: t("finance.counterparty"),
        size: 170,
        Cell: ({ cell }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "text.primary", fontSize: "13.5px" }}
          >
            {cell.getValue() || "Internal"}
          </Typography>
        ),
      },
      {
        accessorKey: "amount",
        header: t("finance.amount"),
        size: 140,
        Cell: ({ row }) => {
          const type = row.original.transaction_type;
          const isIncome = type === "INCOME" || type === "CLIENT_PAYMENT";
          const amt = Number(row.original.amount || 0);
          const formatted = amt.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          });
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontSize: "13.5px",
                color: isIncome ? "#16a34a" : "#DC2626",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {isIncome ? "+" : "-"}${formatted}
            </Typography>
          );
        },
      },
      {
        accessorKey: "description",
        header: t("description", "Düşündiriş"),
        size: 220,
        Cell: ({ cell }) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 400,
              color: "text.secondary",
              fontSize: "13px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 200,
            }}
          >
            {cell.getValue() || "—"}
          </Typography>
        ),
      },
      {
        id: "recorded_by",
        header: t("finance.recordedBy", "Recorded by"),
        size: 110,
        Cell: () => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "text.secondary", fontSize: "13px" }}
          >
            Finance
          </Typography>
        ),
      },
      {
        id: "actions",
        header: t("actions"),
        size: 80,
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            onDelete={(item) => deleteDialog.open(item)}
            showPayment={false}
          />
        ),
      },
    ],
    [t, formatChange, deleteDialog]
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: transactions,
    state: {
      isLoading,
      showProgressBars: isFetching,
    },
    muiTableBodyRowProps: ({ row }) => {
      const type = row.original?.transaction_type;
      const isIncome = type === "INCOME" || type === "CLIENT_PAYMENT";
      const indicatorColor = isIncome ? "#16a34a" : "#dc2626";

      return {
        sx: (theme) => ({
          cursor: "pointer",
          borderLeft: `3.5px solid ${indicatorColor}`,
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.03) !important",
          },
        }),
      };
    },
    renderTopToolbarCustomActions: () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 0.5,
        }}
      >
        <GlobalSearchInput
          value={searchQuery}
          onChange={setSearch}
          placeholder={t("finance.searchTransactions", "Search transactions...")}
          onRefetch={refetch}
          isFetching={isFetching}
          disabled={isLoading}
        />
      </Box>
    ),
    renderBottomToolbar: () => (
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
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
          Jemi: <strong>{totalItems || 0}</strong>
        </Typography>
        <Pagination
          pageIndex={page - 1}
          pageCount={pageCount || 1}
          totalRows={totalItems}
          onPageChange={(newIndex) => setPage(newIndex + 1)}
        />
      </Box>
    ),
    renderCreateRowDialogContent: ({ table }) => (
      <AddCashTransactionModal table={table} />
    ),
  });

  return (
    <>
      <PageHeader
        title={t("finance.cashFlowTitle")}
        onFilterClick={openDrawer}
        filterButtonText={t("filters", "Filters")}
        onAddClick={() => table.setCreatingRow(true)}
        addButtonText={t("finance.addTransaction")}
      >
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <StatPill label="Income" value={fmtMoney(totalIncome)} color="#16a34a" />
          <StatPill label="Expense" value={fmtMoney(totalExpense)} color="#DC2626" />
          <StatPill
            label="Net"
            value={`${netAmount < 0 ? "-" : ""}${fmtMoney(Math.abs(netAmount))}`}
            color={netAmount >= 0 ? "#16a34a" : "#DC2626"}
          />
        </Box>
      </PageHeader>

      <MaterialReactTable table={table} />

      <FilterDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        onApply={applyFilters}
        onReset={resetFilters}
      >
        <CashFlowFilter
          draft={draft}
          setDraftFilter={setDraftFilter}
          selectsOpen={selectsOpen}
          openSelect={openSelect}
          closeSelect={closeSelect}
        />
      </FilterDrawer>

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        loading={isDeleting}
      />
    </>
  );
};

export default CashFlow;
