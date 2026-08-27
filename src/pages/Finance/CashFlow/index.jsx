import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Button,
  alpha,
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";

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

/* ──────────────── Summary Card ──────────────── */
const SummaryCard = ({ label, value, color }) => (
  <Paper
    variant="outlined"
    sx={{
      flex: 1,
      px: 2.5,
      py: 2,
      borderRadius: "12px",
      borderColor: "divider",
      bgcolor: "background.paper",
      minWidth: 180,
    }}
  >
    <Typography
      variant="body2"
      sx={{
        fontWeight: 500,
        color: "text.secondary",
        fontSize: "13px",
        mb: 0.5,
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="h5"
      sx={{
        fontWeight: 700,
        color,
        fontSize: { xs: "20px", sm: "24px" },
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "-0.5px",
      }}
    >
      {value}
    </Typography>
  </Paper>
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
    limit,
    setPage,
    setPageSize,
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
  } = usePagginationGet({
    apiFn: getAllCashTransactionsApi,
    key: "cashTransactions",
    params: queryParams,
  });

  const transactions = useMemo(
    () => {
      const raw = transactionsData?.data ?? transactionsData ?? [];
      return Array.isArray(raw) ? raw : [];
    },
    [transactionsData]
  );

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
    muiTablePaperProps: {
      sx: (theme) => ({
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 310px)",
        width: "100%",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        boxShadow: "none",
        borderRadius: "12px",
        overflow: "hidden",
      }),
    },
    renderEmptyRowsFallback: () => (
      <Paper
        variant="outlined"
        sx={{
          p: 6,
          my: 3,
          textAlign: "center",
          borderRadius: 3,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: "50%",
            bgcolor: "action.hover",
            color: "text.secondary",
          }}
        >
          <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 48 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
          {t("finance.noTransactionsTitle", "Heniz pul amaly ýazylmady")}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 450 }}>
          {t(
            "finance.noTransactionsDesc",
            "Kassalara gelen girdejileri, müşderi töleglerini, partiýa çykdajylaryny we ofis operasion harajatlaryny hasaba alyň."
          )}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => table.setCreatingRow(true)}
          sx={{ mt: 1, borderRadius: 2, textTransform: "none", fontWeight: 700, px: 3 }}
        >
          {t("finance.addTransaction")}
        </Button>
      </Paper>
    ),
    renderCreateRowDialogContent: ({ table }) => (
      <AddCashTransactionModal table={table} />
    ),
  });

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* ── Page Header ── */}
      <PageHeader
        title={t("finance.cashFlowTitle")}
        onFilterClick={openDrawer}
        filterButtonText={t("filters", "Filters")}
        onAddClick={() => table.setCreatingRow(true)}
        addButtonText={t("finance.addTransaction", "+ Record Transaction")}
      />

      {/* ── Search ── */}
      <GlobalSearchInput
        value={searchQuery}
        onChange={setSearch}
        placeholder={t("finance.searchTransactions", "Search transactions...")}
        onRefetch={refetch}
        isFetching={isFetching}
      />

      {/* ── Summary Cards ── */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        <SummaryCard
          label="Income"
          value={fmtMoney(totalIncome)}
          color="#16a34a"
        />
        <SummaryCard
          label="Expense"
          value={fmtMoney(totalExpense)}
          color="#DC2626"
        />
        <SummaryCard
          label="Net"
          value={`${netAmount < 0 ? "-" : ""}${fmtMoney(Math.abs(netAmount))}`}
          color={netAmount >= 0 ? "#16a34a" : "#DC2626"}
        />
      </Box>

      {/* ── Table ── */}
      <MaterialReactTable table={table} />

      {/* ── Pagination ── */}
      <Pagination
        totalItems={totalItems}
        page={page}
        limit={limit}
        setPage={setPage}
        setPageSize={setPageSize}
      />

      {/* ── Filter Drawer ── */}
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

      {/* ── Delete Confirmation ── */}
      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        loading={isDeleting}
      />
    </Box>
  );
};

export default CashFlow;
