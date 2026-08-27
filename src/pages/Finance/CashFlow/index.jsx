import { useMemo, useState } from "react";
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
import { deleteTotalCalculationApi } from "../../../api/queries/delete";
import { usePageFilters } from "../../../hooks/usePageFilters";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { getAllTotalCalculationsApi } from "../../../api/queries/getters";
import {
  cashFlowFilterActions,
  cashFlowFilterSelectors,
} from "../../../store/slices/filters/cashFlowFilterSlice";
import FilterDrawer from "../../../components/FilterDrawer";
import CashFlowFilter from "../Contents/CashFlowFilter";
import AddCashTransactionModal from "../AddCashTransactionModal";
import EditCashTransactionModal from "../EditCashTransactionModal";
import GlobalSearchInput from "../../../components/GlobalSearchInput";

const CATEGORY_LABELS = {
  B2B: "B2B Bilet",
  TURKISH_AIRLINES: "Türk Howa Ýollary",
  AIRWAY: "Awia Hyzmat",
  RAILWAY: "Demir Ýol",
  HOTEL: "Myhmanhana",
  TOUR: "Syýahat",
  TRANSFER: "Ulag / Geçirim",
  PACKAGE: "Bukja",
  VISA: "Wiza",
  TRANSLATION: "Terjime",
  CAFETERIA: "Kafeteriýa",
  OFFICE_RENT: "Ofis Kireýi",
  SALARY: "Aýlyk Haky",
  MARKETING: "Mahabat",
  OVERHEAD: "Beýleki Harajat",
};

const getCategoryDisplay = (cat) => {
  if (!cat) return "—";
  return CATEGORY_LABELS[cat] || cat;
};

const StatPill = ({ label, value, color, subtitle }) => (
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
      {label}:
    </Typography>
    <Typography
      component="span"
      sx={{
        fontSize: "14.5px",
        fontWeight: 750,
        color,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {value}
    </Typography>
    {subtitle && (
      <Typography
        component="span"
        sx={{ fontSize: "11px", color: "text.secondary", ml: 0.2 }}
      >
        ({subtitle})
      </Typography>
    )}
  </Box>
);

const fmtMoney = (val, currency = "$") => {
  const num = Number(val || 0);
  return `${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
};

const CashFlow = () => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    limit,
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
    data: calculationsResponse,
    isLoading,
    isFetching,
    refetch,
    totalItems,
    pageCount,
  } = usePagginationGet({
    apiFn: getAllTotalCalculationsApi,
    key: "totalCalculations",
    params: queryParams,
  });

  const calculations = useMemo(() => {
    const raw =
      calculationsResponse?.data?.data ??
      calculationsResponse?.data ??
      calculationsResponse ??
      [];
    return Array.isArray(raw) ? raw : [];
  }, [calculationsResponse]);

  // Aggregate totals from backend meta or calculate from current dataset
  const serverTotals = calculationsResponse?.meta?.totals || calculationsResponse?.data?.meta?.totals;

  const { totalSale, totalNet, totalProfit, totalCredit } = useMemo(() => {
    if (serverTotals) {
      return {
        totalSale: Number(serverTotals.totalSalePrice || 0),
        totalNet: Number(serverTotals.totalNetPrice || 0),
        totalProfit: Number(serverTotals.totalProfit || 0),
        totalCredit: Number(serverTotals.totalCreditPrice || 0),
      };
    }
    let sale = 0;
    let net = 0;
    let profit = 0;
    let credit = 0;
    calculations.forEach((item) => {
      sale += Number(item.sale_price || 0);
      net += Number(item.net_price || 0);
      profit += Number(item.profit || 0);
      credit += Number(item.credit_price || 0);
    });
    return {
      totalSale: sale,
      totalNet: net,
      totalProfit: profit,
      credit,
    };
  }, [serverTotals, calculations]);

  const { mutate: deleteTransaction } = useDelete({
    deleteFn: deleteTotalCalculationApi,
    queryKey: ["totalCalculations", queryParams],
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteTransaction(item.guid || item.id),
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "index_number",
        header: "№",
        size: 70,
        Cell: ({ cell, row }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.secondary", fontSize: "13px" }}
          >
            {cell.getValue() || row.index + 1}
          </Typography>
        ),
      },
      {
        accessorKey: "datetime",
        header: t("date", "Senesi"),
        size: 135,
        Cell: ({ cell }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "text.primary", fontSize: "13px" }}
          >
            {formatChange(cell.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: "category",
        header: t("category", "Kategoriýa"),
        size: 170,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return (
            <Chip
              label={getCategoryDisplay(val)}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 600,
                fontSize: "12px",
                borderRadius: "6px",
                borderColor: "divider",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
              }}
            />
          );
        },
      },
      {
        id: "receiver_operator",
        header: t("operator", "Jogapkär / Operator"),
        size: 160,
        Cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "text.primary", fontSize: "13px" }}
          >
            {row.original.receiver_operator?.fullName || "—"}
          </Typography>
        ),
      },
      {
        id: "office",
        header: t("office", "Ofis"),
        size: 140,
        Cell: ({ row }) => {
          const off = row.original.office;
          const name = off ? (selectedLang(off.shortName) || selectedLang(off.fullName) || off.name) : "—";
          return (
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "text.secondary", fontSize: "13px" }}
            >
              {name || "—"}
            </Typography>
          );
        },
      },
      {
        accessorKey: "sale_price",
        header: t("finance.salePrice", "Satyş bahasy"),
        size: 130,
        Cell: ({ cell, row }) => {
          const val = Number(cell.getValue() || 0);
          const curr = row.original.currency || "USD";
          if (val <= 0) {
            return (
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
                —
              </Typography>
            );
          }
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontSize: "13px",
                color: "#16a34a",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              +{fmtMoney(val, curr)}
            </Typography>
          );
        },
      },
      {
        accessorKey: "net_price",
        header: t("finance.netPrice", "Özüne düşýän / Harajat"),
        size: 140,
        Cell: ({ cell, row }) => {
          const val = Number(cell.getValue() || 0);
          const curr = row.original.currency || "USD";
          if (val <= 0) {
            return (
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
                —
              </Typography>
            );
          }
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontSize: "13px",
                color: "#DC2626",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              -{fmtMoney(val, curr)}
            </Typography>
          );
        },
      },
      {
        accessorKey: "profit",
        header: t("finance.profit", "Peýda"),
        size: 130,
        Cell: ({ cell, row }) => {
          const val = Number(cell.getValue() || 0);
          const curr = row.original.currency || "USD";
          if (val === 0) {
            return (
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
                —
              </Typography>
            );
          }
          const isPos = val > 0;
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontSize: "13px",
                color: isPos ? "#16a34a" : "#DC2626",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {isPos ? `+${fmtMoney(val, curr)}` : `-${fmtMoney(Math.abs(val), curr)}`}
            </Typography>
          );
        },
      },
      {
        accessorKey: "credit_price",
        header: t("finance.creditPrice", "Algy / Bergi"),
        size: 120,
        Cell: ({ cell, row }) => {
          const val = Number(cell.getValue() || 0);
          const curr = row.original.currency || "USD";
          if (val <= 0) {
            return (
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
                —
              </Typography>
            );
          }
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: "13px",
                color: "#2563EB",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {fmtMoney(val, curr)}
            </Typography>
          );
        },
      },
      {
        accessorKey: "is_manual",
        header: t("finance.type", "Görnüşi"),
        size: 110,
        Cell: ({ cell }) => {
          const isManual = Boolean(cell.getValue());
          return (
            <Chip
              label={isManual ? "Manual" : "Auto"}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "11px",
                height: "22px",
                bgcolor: (th) =>
                  isManual
                    ? alpha(th.palette.primary.main, 0.12)
                    : alpha(th.palette.text.secondary, 0.1),
                color: (th) =>
                  isManual ? th.palette.primary.main : th.palette.text.secondary,
              }}
            />
          );
        },
      },
      {
        id: "actions",
        header: t("actions"),
        size: 80,
        Cell: ({ row, table: mrtTable }) => (
          <ColumnActionButtons
            row={row}
            table={mrtTable}
            onDelete={(item) => deleteDialog.open(item)}
            showPayment={false}
          />
        ),
      },
    ],
    [t, selectedLang, formatChange, deleteDialog]
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: calculations,
    state: {
      isLoading,
      showProgressBars: isFetching,
    },
    renderCreateRowDialogContent: ({ table: mrtTable }) => (
      <AddCashTransactionModal table={mrtTable} />
    ),
    renderEditRowDialogContent: ({ table: mrtTable, row }) => (
      <EditCashTransactionModal table={mrtTable} row={row} />
    ),
    muiTableBodyRowProps: ({ row }) => {
      const profit = Number(row.original?.profit || 0);
      const isPos = profit >= 0;
      const indicatorColor = isPos ? "#16a34a" : "#dc2626";

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
          flexWrap: "wrap",
        }}
      >
        <GlobalSearchInput
          value={searchQuery}
          onChange={setSearch}
          placeholder={t("search", "Gözleg...")}
          onRefetch={refetch}
          isFetching={isFetching}
        />

        {/* Live Database Grand Total Pills */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <StatPill
            label={t("finance.totalSale", "Jemi Satyş")}
            value={`+${fmtMoney(totalSale)}`}
            color="#16a34a"
          />

          <StatPill
            label={t("finance.totalCost", "Jemi Harajat")}
            value={`-${fmtMoney(totalNet)}`}
            color="#DC2626"
          />

          <StatPill
            label={t("finance.netProfit", "Arassa Peýda")}
            value={
              totalProfit >= 0
                ? `+${fmtMoney(totalProfit)}`
                : `-${fmtMoney(Math.abs(totalProfit))}`
            }
            color={totalProfit >= 0 ? "#16a34a" : "#DC2626"}
            subtitle={
              totalSale > 0
                ? `${((totalProfit / totalSale) * 100).toFixed(1)}%`
                : null
            }
          />

          {totalCredit > 0 && (
            <StatPill
              label={t("finance.totalCredit", "Algy / Bergi")}
              value={fmtMoney(totalCredit)}
              color="#2563EB"
            />
          )}
        </Box>
      </Box>
    ),
  });

  return (
    <>
      <PageHeader
        title={t("sidebar.cashFlow", "Pul Akymy (Total Calculations)")}
        addButtonText={t("finance.addTransaction", "+ Pul amaly goşmak")}
        onAddClick={() => setIsAddModalOpen(true)}
        openDrawer={openDrawer}
        hasFilter
      />

      <Box sx={{ width: "100%", overflow: "hidden" }}>
        <MaterialReactTable table={table} />
        <Pagination
          totalItems={totalItems}
          page={page}
          limit={limit}
          setPage={setPage}
          setPageSize={setPageSize}
          pageCount={pageCount}
        />
      </Box>

      {/* Manual Transaction Dialogs */}
      <AddCashTransactionModal
        open={isAddModalOpen}
        close={() => setIsAddModalOpen(false)}
      />

      {/* Filter Drawer */}
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
        title={t("finance.deleteTransaction", "Pul amalyny pozmak")}
        description={t(
          "finance.deleteConfirm",
          "Bu pul amalyny pozmak isleýändigiňize ynanýarsyňyzmy? Bu amaly yzyna gaýtaryp bolmaýar."
        )}
      />
    </>
  );
};

export default CashFlow;
