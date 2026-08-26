import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Typography, Chip } from "@mui/material";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import Pagination from "../../../components/Pagination";
import TableEmptyState from "../../../components/TableEmptyState";
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
import CashFlowFilter from "./CashFlowFilter";
import AddCashTransactionModal from "../AddCashTransactionModal";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import StatusChip from "../../../components/StatusChip";
import { FINANCE_TRANSACTION_TYPE_CONFIG } from "../../../functions/statusChipConfigs";

const CashFlowTab = () => {
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
    () => transactionsData?.data ?? transactionsData ?? [],
    [transactionsData]
  );

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
        size: 180,
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
        size: 150,
        Cell: ({ cell, row }) => (
          <Chip
            label={cell.getValue() || row.original.cash_box_name || "Kassa"}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        ),
      },
      {
        accessorKey: "counterparty_name",
        header: t("finance.counterparty"),
        size: 180,
        Cell: ({ cell, row }) => (
          <StackedCell
            primary={cell.getValue() || "—"}
            secondary={row.original.related_lot_number ? `Lot: ${row.original.related_lot_number}` : (row.original.category || "")}
          />
        ),
      },
      {
        accessorKey: "amount",
        header: t("finance.amount"),
        size: 140,
        Cell: ({ row }) => {
          const isIncome =
            row.original.transaction_type === "INCOME" ||
            row.original.transaction_type === "CLIENT_PAYMENT";
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 750,
                color: isIncome ? "success.main" : "error.main",
              }}
            >
              {isIncome ? "+" : "-"}
              {Number(row.original.amount || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}{" "}
              {row.original.currency}
            </Typography>
          );
        },
      },
      {
        accessorKey: "converted_amount_tmt",
        header: t("finance.convertedAmount"),
        size: 140,
        Cell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
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
        Cell: ({ cell }) => cell.getValue() || "CASH",
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
    renderEmptyRowsFallback: () => <TableEmptyState />,
    renderCreateRowDialogContent: ({ table }) => (
      <AddCashTransactionModal table={table} />
    ),
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
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

export default CashFlowTab;
