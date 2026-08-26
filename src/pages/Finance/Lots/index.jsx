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
  Chip,
  Button,
  Paper,
  Collapse,
  Alert,
} from "@mui/material";
import HistoryEduRoundedIcon from "@mui/icons-material/HistoryEduRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

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
import { deletePurchaseLotApi } from "../../../api/queries/delete";
import { usePageFilters } from "../../../hooks/usePageFilters";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { getAllPurchaseLotsApi } from "../../../api/queries/getters";
import {
  financeLotFilterActions,
  financeLotFilterSelectors,
} from "../../../store/slices/filters/financeLotFilterSlice";
import FilterDrawer from "../../../components/FilterDrawer";
import FinanceLotFilter from "../Contents/FinanceLotFilter";
import FinanceHeaderStats from "../Contents/FinanceHeaderStats";
import AddPurchaseLotModal from "../AddPurchaseLotModal";
import EditPurchaseLotModal from "../EditPurchaseLotModal";
import LotConsumptionModal from "../Contents/LotConsumptionModal";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import StatusChip from "../../../components/StatusChip";
import {
  PURCHASE_LOT_STATUS_CONFIG,
  FINANCE_SERVICE_TYPE_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from "../../../functions/statusChipConfigs";

const PurchaseLots = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();
  const [selectedLotForConsumption, setSelectedLotForConsumption] = useState(null);
  const [showGuideBanner, setShowGuideBanner] = useState(true);
  const [quickFilter, setQuickFilter] = useState("ALL"); // ALL, ACTIVE, LOW_STOCK, EXPIRING, EXHAUSTED

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

  const rawLots = useMemo(() => lotsData?.data ?? lotsData ?? [], [lotsData]);

  // Client-side quick filter refinement
  const lots = useMemo(() => {
    if (!Array.isArray(rawLots)) return [];
    if (quickFilter === "ALL") return rawLots;

    const now = new Date();
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    return rawLots.filter((lot) => {
      const total = Number(lot.total_quantity || 0);
      const consumed = Number(lot.consumed_quantity || 0);
      const remaining = total - consumed;
      const expiry = lot.expiry_date ? new Date(lot.expiry_date) : null;

      if (quickFilter === "ACTIVE") return remaining > 0 && lot.status === "ACTIVE";
      if (quickFilter === "LOW_STOCK") return remaining > 0 && remaining / total <= 0.25;
      if (quickFilter === "EXPIRING") return expiry && expiry > now && expiry <= fourteenDaysFromNow;
      if (quickFilter === "EXHAUSTED") return remaining === 0 || lot.status === "EXHAUSTED";
      return true;
    });
  }, [rawLots, quickFilter]);

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
        size: 210,
        Cell: ({ row }) => {
          const total = Number(row.original.total_quantity || 0);
          const consumed = Number(row.original.consumed_quantity || 0);
          const remaining = total - consumed;
          const isLow = remaining > 0 && remaining / total <= 0.2;
          const isExhausted = remaining === 0;

          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box>
                <StackedCell
                  primary={row.original.lot_number}
                  secondary={row.original.name}
                />
              </Box>
              {isLow && (
                <Tooltip title="Stok gutaryp barýar (20%-den az galdy)">
                  <Chip
                    label="Low"
                    size="small"
                    color="warning"
                    sx={{ height: 20, fontSize: "10px", fontWeight: 750 }}
                  />
                </Tooltip>
              )}
              {isExhausted && (
                <Tooltip title="Partiýa doly ulanyldy">
                  <Chip
                    label="0 Galdy"
                    size="small"
                    sx={{ height: 20, fontSize: "10px", fontWeight: 700, bgcolor: "action.hover" }}
                  />
                </Tooltip>
              )}
            </Box>
          );
        },
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
        size: 220,
        Cell: ({ row }) => {
          const total = Number(row.original.total_quantity || 0);
          const consumed = Number(row.original.consumed_quantity || 0);
          const remaining = total - consumed;
          const percentage = total > 0 ? (consumed / total) * 100 : 0;
          const isCritical = remaining > 0 && remaining / total <= 0.15;

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
                    color: isCritical
                      ? "warning.main"
                      : remaining > 0
                      ? "success.main"
                      : "text.disabled",
                  }}
                >
                  {remaining} {t("finance.left")}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 7,
                  borderRadius: 4,
                  bgcolor: "action.hover",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    bgcolor:
                      percentage >= 100
                        ? "text.disabled"
                        : percentage >= 80
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
        size: 120,
        Cell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            {Number(row.original.unit_cost || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}{" "}
            {row.original.currency}
          </Typography>
        ),
      },
      {
        id: "unconsumed_value",
        header: t("finance.remainingValue"),
        size: 150,
        Cell: ({ row }) => {
          const remaining =
            (row.original.total_quantity || 0) - (row.original.consumed_quantity || 0);
          const val = remaining * Number(row.original.unit_cost || 0);
          return (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>
                {val.toLocaleString("en-US", { minimumFractionDigits: 2 })} {row.original.currency}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                {remaining} × {row.original.unit_cost}
              </Typography>
            </Box>
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
        accessorKey: "expiry_date",
        header: t("finance.expiryDate", "Möhleti"),
        size: 130,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          if (!val) return "—";
          const exp = new Date(val);
          const now = new Date();
          const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
          const isExpiringSoon = daysLeft > 0 && daysLeft <= 14;
          const isExpired = daysLeft <= 0;

          return (
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isExpired || isExpiringSoon ? 700 : 500,
                  color: isExpired ? "error.main" : isExpiringSoon ? "warning.main" : "text.secondary",
                }}
              >
                {formatChange(val, { dateOnly: true })}
              </Typography>
              {isExpiringSoon && (
                <Typography variant="caption" sx={{ color: "warning.main", fontWeight: 700 }}>
                  ({daysLeft} gün galdy)
                </Typography>
              )}
              {isExpired && (
                <Typography variant="caption" sx={{ color: "error.main", fontWeight: 700 }}>
                  (Möhleti geçdi)
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        id: "actions",
        header: t("actions"),
        size: 130,
        Cell: ({ row, table }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title={t("finance.viewConsumptions", "FIFO Ulanylyş taryhy")}>
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
          <Inventory2OutlinedIcon sx={{ fontSize: 48 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
          {t("finance.noLotsTitle", "Heniz partiýa goşulmady")}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 450 }}>
          {t(
            "finance.noLotsDesc",
            "Üpjün edijilerden satyn alnan lomaý wiza orunlaryny, otel allotmentlaryny we uçar bilet kotalaryny goşup, FIFO tertibinde awtomatiki hasaplaşyk ýörediň."
          )}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => table.setCreatingRow(true)}
          sx={{ mt: 1, borderRadius: 2, textTransform: "none", fontWeight: 700, px: 3 }}
        >
          {t("finance.addPurchaseLot")}
        </Button>
      </Paper>
    ),
    renderCreateRowDialogContent: ({ table }) => <AddPurchaseLotModal table={table} />,
    renderEditRowDialogContent: ({ table, row }) => (
      <EditPurchaseLotModal table={table} row={row} />
    ),
  });

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
      <PageHeader
        title={t("finance.purchaseLotsTitle")}
        subtitle={t("finance.purchaseLotsSubtitle")}
        buttonText={t("finance.addPurchaseLot")}
        onButtonClick={() => table.setCreatingRow(true)}
      >
        <FinanceHeaderStats queryParams={queryParams} />
      </PageHeader>

      {/* Onboarding Guide Banner */}
      <Collapse in={showGuideBanner}>
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon />}
          action={
            <IconButton size="small" onClick={() => setShowGuideBanner(false)}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          }
          sx={{ borderRadius: 2, bgcolor: "action.hover", border: "1px solid", borderColor: "divider" }}
        >
          <strong>FIFO Düzgüni:</strong> Müşderilere wiza ýa-da otel satylanda ilki satyn alnan partiýadaky orunlar awtomatiki harçlanýar. Partiadaky orunlaryň sarp edilişini görmek üçin <strong>📜 (Ulanylyş taryhy)</strong> düwmesine basyň.
        </Alert>
      </Collapse>

      {/* Search & Quick Filter Pills */}
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
            icon={<CheckCircleRoundedIcon fontSize="small" />}
            label="Stokda bar"
            clickable
            color={quickFilter === "ACTIVE" ? "success" : "default"}
            variant={quickFilter === "ACTIVE" ? "filled" : "outlined"}
            onClick={() => setQuickFilter("ACTIVE")}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            icon={<WarningAmberRoundedIcon fontSize="small" />}
            label="Tiz gutarýanlar (< 25%)"
            clickable
            color={quickFilter === "LOW_STOCK" ? "warning" : "default"}
            variant={quickFilter === "LOW_STOCK" ? "filled" : "outlined"}
            onClick={() => setQuickFilter("LOW_STOCK")}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            icon={<HourglassTopRoundedIcon fontSize="small" />}
            label="Möhleti golaýlaşanlar"
            clickable
            color={quickFilter === "EXPIRING" ? "warning" : "default"}
            variant={quickFilter === "EXPIRING" ? "filled" : "outlined"}
            onClick={() => setQuickFilter("EXPIRING")}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            icon={<ErrorOutlineRoundedIcon fontSize="small" />}
            label="Gutaranlar"
            clickable
            color={quickFilter === "EXHAUSTED" ? "default" : "default"}
            variant={quickFilter === "EXHAUSTED" ? "filled" : "outlined"}
            onClick={() => setQuickFilter("EXHAUSTED")}
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

export default PurchaseLots;
