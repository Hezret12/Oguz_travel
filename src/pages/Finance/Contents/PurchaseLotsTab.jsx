import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import HistoryEduRoundedIcon from "@mui/icons-material/HistoryEduRounded";
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
import { deletePurchaseLotApi } from "../../../api/queries/delete";
import { usePageFilters } from "../../../hooks/usePageFilters";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { getAllPurchaseLotsApi } from "../../../api/queries/getters";
import {
  financeLotFilterActions,
  financeLotFilterSelectors,
} from "../../../store/slices/filters/financeLotFilterSlice";
import FilterDrawer from "../../../components/FilterDrawer";
import FinanceLotFilter from "./FinanceLotFilter";
import AddPurchaseLotModal from "../AddPurchaseLotModal";
import EditPurchaseLotModal from "../EditPurchaseLotModal";
import LotConsumptionModal from "./LotConsumptionModal";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import StatusChip from "../../../components/StatusChip";
import {
  PURCHASE_LOT_STATUS_CONFIG,
  FINANCE_SERVICE_TYPE_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from "../../../functions/statusChipConfigs";

const PurchaseLotsTab = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();
  const [selectedLotForConsumption, setSelectedLotForConsumption] = useState(null);

  const {
    applied,
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
    actions: financeLotFilterActions,
    selectors: financeLotFilterSelectors,
  });

  const {
    data: lotsData,
    isLoading,
    isFetching,
    refetch,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllPurchaseLotsApi,
    key: "purchaseLots",
    params: queryParams,
  });

  const lots = useMemo(() => lotsData?.data ?? lotsData ?? [], [lotsData]);

  const { mutate: deleteLot, isPending: isDeleting } = useDelete({
    deleteFn: deletePurchaseLotApi,
    queryKey: ["purchaseLots", queryParams],
    idKey: "guid",
    isPaginated: true,
    invalidateQueries: [["finance-summary"]],
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteLot(item.guid || item.id),
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "lot_number",
        header: t("finance.lotNumber"),
        size: 200,
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.lot_number}
            secondary={row.original.name}
          />
        ),
      },
      {
        accessorKey: "supplier.name",
        header: t("finance.supplier"),
        size: 160,
        Cell: ({ cell, row }) => cell.getValue() || row.original.supplier_name || "—",
      },
      {
        accessorKey: "service_type",
        header: t("finance.serviceType"),
        size: 140,
        Cell: ({ cell }) => (
          <StatusChip
            status={cell.getValue()}
            config={FINANCE_SERVICE_TYPE_CONFIG}
            size="small"
          />
        ),
      },
      {
        id: "stock_consumption",
        header: t("finance.consumptionProgress"),
        size: 210,
        Cell: ({ row }) => {
          const total = Number(row.original.total_quantity || 0);
          const consumed = Number(row.original.consumed_quantity || 0);
          const remaining = total - consumed;
          const percentage = total > 0 ? (consumed / total) * 100 : 0;

          return (
            <Box sx={{ width: "100%", pr: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  {consumed} / {total} {t("finance.used")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 750,
                    color: remaining > 0 ? "success.main" : "text.disabled",
                  }}
                >
                  {remaining} {t("finance.left")}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "action.hover",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    bgcolor:
                      percentage >= 100
                        ? "text.disabled"
                        : percentage > 70
                        ? "warning.main"
                        : "primary.main",
                  },
                }}
              />
            </Box>
          );
        },
      },
      {
        accessorKey: "unit_cost",
        header: t("finance.unitCost"),
        size: 110,
        Cell: ({ row }) => `${row.original.unit_cost} ${row.original.currency}`,
      },
      {
        id: "unconsumed_value",
        header: t("finance.remainingValue"),
        size: 140,
        Cell: ({ row }) => {
          const remaining =
            (row.original.total_quantity || 0) - (row.original.consumed_quantity || 0);
          const val = remaining * Number(row.original.unit_cost || 0);
          return (
            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
              {val.toFixed(2)} {row.original.currency}
            </Typography>
          );
        },
      },
      {
        accessorKey: "payment_status",
        header: t("paymentStatus", "Töleg"),
        size: 120,
        Cell: ({ cell }) => (
          <StatusChip
            status={cell.getValue()}
            config={PAYMENT_STATUS_CONFIG}
            size="small"
          />
        ),
      },
      {
        accessorKey: "status",
        header: t("status"),
        size: 120,
        Cell: ({ cell }) => (
          <StatusChip
            status={cell.getValue()}
            config={PURCHASE_LOT_STATUS_CONFIG}
            size="small"
          />
        ),
      },
      {
        accessorKey: "purchase_date",
        header: t("finance.purchaseDate"),
        size: 120,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        id: "actions",
        header: t("actions"),
        size: 130,
        Cell: ({ row, table }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title={t("finance.viewConsumptions")}>
              <IconButton
                size="small"
                onClick={() => setSelectedLotForConsumption(row.original)}
                sx={{
                  color: "primary.main",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <HistoryEduRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <ColumnActionButtons
              row={row}
              table={table}
              onDelete={(item) => deleteDialog.open(item)}
              showPayment={false}
            />
          </Box>
        ),
      },
    ],
    [t, formatChange, deleteDialog]
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: lots,
    state: {
      isLoading,
      showProgressBars: isFetching,
    },
    renderEmptyRowsFallback: () => <TableEmptyState />,
    renderCreateRowDialogContent: ({ table }) => <AddPurchaseLotModal table={table} />,
    renderEditRowDialogContent: ({ table, row }) => (
      <EditPurchaseLotModal table={table} row={row} />
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
        <FinanceLotFilter
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

      {/* FIFO Consumption History Modal */}
      {selectedLotForConsumption && (
        <LotConsumptionModal
          open={Boolean(selectedLotForConsumption)}
          onClose={() => setSelectedLotForConsumption(null)}
          lot={selectedLotForConsumption}
        />
      )}
    </Box>
  );
};

export default PurchaseLotsTab;
