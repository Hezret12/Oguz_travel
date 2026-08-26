import { useMemo, useState } from "react";
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
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";

import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import PageHeader from "../../../components/PageHeader";
import Pagination from "../../../components/Pagination";
import StackedCell from "../../../components/inputs/StackCell";
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
import FinanceHeaderStats from "../Contents/FinanceHeaderStats";
import AddCashTransactionModal from "../AddCashTransactionModal";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import StatusChip from "../../../components/StatusChip";
import { FINANCE_TRANSACTION_TYPE_CONFIG } from "../../../functions/statusChipConfigs";

const CashFlow = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();
  const [quickFilter, setQuickFilter] = useState("ALL"); // ALL, INCOME, EXPENSE, SUPPLIER, CLIENT

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

  const rawTransactions = useMemo(
    () => transactionsData?.data ?? transactionsData ?? [],
    [transactionsData]
  );

  const transactions = useMemo(() => {
    if (!Array.isArray(rawTransactions)) return [];
    if (quickFilter === "ALL") return rawTransactions;
    if (quickFilter === "INCOME") {
      return rawTransactions.filter(
        (t) => t.transaction_type === "INCOME" || t.transaction_type === "CLIENT_PAYMENT"
      );
    }
    if (quickFilter === "EXPENSE") {
      return rawTransactions.filter(
        (t) => t.transaction_type === "EXPENSE" || t.transaction_type === "SUPPLIER_PAYMENT"
      );
    }
    if (quickFilter === "SUPPLIER") {
      return rawTransactions.filter((t) => t.transaction_type === "SUPPLIER_PAYMENT");
    }
    if (quickFilter === "CLIENT") {
      return rawTransactions.filter((t) => t.transaction_type === "CLIENT_PAYMENT");
    }
    return rawTransactions;
  }, [rawTransactions, quickFilter]);

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

  const columns = useMemo(
    () => [
      {
        accessorKey: "transaction_number",
        header: t("finance.transactionNumber"),
        size: 190,
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.transaction_number}
            secondary={row.original.description || "—"}
          />
        ),
      },
      {
        accessorKey: "transaction_type",
        header: t("finance.transactionType"),
        size: 160,
        Cell: ({ cell }) => (
          <StatusChip
            status={cell.getValue()}
            config={FINANCE_TRANSACTION_TYPE_CONFIG}
            size="small"
          />
        ),
      },
      {
        accessorKey: "cash_box.name",
        header: t("finance.cashBox"),
        size: 160,
        Cell: ({ cell, row }) => (
          <Chip
            label={cell.getValue() || row.original.cash_box_name || "Kassa"}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 650, borderRadius: 1.5 }}
          />
        ),
      },
      {
        accessorKey: "counterparty_name",
        header: t("finance.counterparty"),
        size: 190,
        Cell: ({ cell, row }) => (
          <StackedCell
            primary={cell.getValue() || "—"}
            secondary={
              row.original.related_lot_number
                ? `Lot: ${row.original.related_lot_number}`
                : row.original.category || ""
            }
          />
        ),
      },
      {
        accessorKey: "amount",
        header: t("finance.amount"),
        size: 160,
        Cell: ({ row }) => {
          const isIncome =
            row.original.transaction_type === "INCOME" ||
            row.original.transaction_type === "CLIENT_PAYMENT";
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  p: 0.5,
                  borderRadius: "50%",
                  bgcolor: isIncome ? "success.50" : "error.50",
                  color: isIncome ? "success.main" : "error.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isIncome ? (
                  <TrendingUpRoundedIcon sx={{ fontSize: 16 }} />
                ) : (
                  <TrendingDownRoundedIcon sx={{ fontSize: 16 }} />
                )}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  fontSize: "13.5px",
                  color: isIncome ? "success.main" : "error.main",
                }}
              >
                {isIncome ? "+" : "-"}
                {Number(row.original.amount || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
                {row.original.currency}
              </Typography>
            </Box>
          );
        },
      },
      {
        accessorKey: "converted_amount_tmt",
        header: t("finance.convertedAmount"),
        size: 150,
        Cell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 650, color: "text.secondary" }}>
            {Number(row.original.converted_amount_tmt || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}{" "}
            TMT
          </Typography>
        ),
      },
      {
        accessorKey: "payment_method",
        header: t("finance.paymentMethod"),
        size: 120,
        Cell: ({ cell }) => (
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
            {cell.getValue() || "CASH"}
          </Typography>
        ),
      },
      {
        accessorKey: "transaction_date",
        header: t("date", "Senesi"),
        size: 130,
        Cell: ({ cell }) => formatChange(cell.getValue()),
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
      <PageHeader
        title={t("finance.cashFlowTitle")}
        subtitle={t("finance.cashFlowSubtitle")}
        buttonText={t("finance.addTransaction")}
        onButtonClick={() => table.setCreatingRow(true)}
      >
        <FinanceHeaderStats queryParams={queryParams} />
      </PageHeader>

      {/* Search & Quick Filters */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <GlobalSearchInput
          value={searchQuery}
          onChange={setSearch}
          placeholder={t("search")}
          onRefetch={refetch}
          isFetching={isFetching}
          onFilterClick={openDrawer}
        />

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label="Ählisi"
            clickable
            color={quickFilter === "ALL" ? "primary" : "default"}
            variant={quickFilter === "ALL" ? "filled" : "outlined"}
            onClick={() => setQuickFilter("ALL")}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            icon={<TrendingUpRoundedIcon fontSize="small" />}
            label="Girdeji (Money In)"
            clickable
            color={quickFilter === "INCOME" ? "success" : "default"}
            variant={quickFilter === "INCOME" ? "filled" : "outlined"}
            onClick={() => setQuickFilter("INCOME")}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            icon={<TrendingDownRoundedIcon fontSize="small" />}
            label="Çykdajy (Money Out)"
            clickable
            color={quickFilter === "EXPENSE" ? "error" : "default"}
            variant={quickFilter === "EXPENSE" ? "filled" : "outlined"}
            onClick={() => setQuickFilter("EXPENSE")}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            icon={<SwapHorizRoundedIcon fontSize="small" />}
            label="Üpjün ediji tölegleri"
            clickable
            color={quickFilter === "SUPPLIER" ? "warning" : "default"}
            variant={quickFilter === "SUPPLIER" ? "filled" : "outlined"}
            onClick={() => setQuickFilter("SUPPLIER")}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>

      <MaterialReactTable table={table} />

      <Pagination
        totalItems={totalItems}
        page={page}
        limit={limit}
        setPage={setPage}
        setPageSize={setPageSize}
      />

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
    </Box>
  );
};

export default CashFlow;
