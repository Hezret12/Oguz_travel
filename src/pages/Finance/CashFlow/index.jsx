import { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Chip, ToggleButton, ToggleButtonGroup, Tooltip, Typography, alpha } from "@mui/material";
import { ArrowDownLeft, ArrowUpRight, Lock } from "lucide-react";

import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import TableErrorState from "../../../components/TableErrorState";
import { useLocale } from "../../../hooks/useLocale";
import { useAuth } from "../../../context/useAuth";
import PageHeader from "../../../components/PageHeader";
import Pagination from "../../../components/Pagination";
import { useDateFormat } from "../../../functions/generalHelpers";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { deleteTotalCalculationApi } from "../../../api/queries/delete";
import { useTableFilters, useDrawerFilters } from "../../../hooks/usePageFilters";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { getAllTotalCalculationsApi } from "../../../api/queries/getters";
import {
  cashFlowFilterActions,
  cashFlowFilterSelectors,
} from "../../../store/slices/filters/cashFlowFilterSlice";
import FilterDrawer from "../../../components/FilterDrawer";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import CashFlowFilter from "./Contents/CashFlowFilter";
import CashFlowSummary from "./Contents/CashFlowSummary";
import CashFlowExportModal from "./Contents/CashFlowExportModal";
import ExportExcelButton from "../../../components/ExportExcelButton";
import AddCashTransactionModal from "./AddCashTransactionModal";
import EditCashTransactionModal from "./EditCashTransactionModal";
import { isCashRow, rowAmounts } from "./functions/cashFlowHelpers";
import { segmentedSx } from "../Overview/functions/analyticsFormat";

const GREEN = "#16a34a";
const RED = "#dc2626";

// Tab value → `source` query param
const SOURCE_TABS = [
  { value: "", labelKey: "finance.cashBook.tabs.all" },
  { value: "MANUAL,EXCEL", labelKey: "finance.cashBook.tabs.kassa" },
  { value: "PROJECT", labelKey: "finance.cashBook.tabs.project" },
];

// Every row is money in or out — a visa or ticket sale is Girdeji, the
// month's salary is Çykdajy; the line under it says where the row came from.
const KIND_STYLE = {
  income: { color: GREEN, Icon: ArrowDownLeft, labelKey: "finance.income" },
  expense: { color: RED, Icon: ArrowUpRight, labelKey: "finance.expense" },
};

const Muted = ({ children }) => (
  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
    {children}
  </Typography>
);

const NUM_SX = {
  fontSize: "13px",
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

const fmtNumber = (val) =>
  Math.abs(Number(val || 0)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const EmptyAmount = () => (
  <Typography component="span" sx={{ ...NUM_SX, fontWeight: 400, color: "text.disabled" }}>
    —
  </Typography>
);

// Signed amount in a currency column: green "+" money in, red "−" money out.
const SignedAmount = ({ value }) => {
  if (value === null || value === undefined) return <EmptyAmount />;
  const income = value >= 0;
  return (
    <Typography component="span" sx={{ ...NUM_SX, color: income ? GREEN : RED }}>
      {income ? "+" : "−"}
      {fmtNumber(value)}
    </Typography>
  );
};

// A row's profit, its currency code in small muted type after it — one line
// per currency for a visa that has a profit in both.
const ProfitAmount = ({ profits }) => {
  if (!profits.length) return <EmptyAmount />;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.3 }}>
      {profits.map((profit) => (
        <Typography
          key={profit.currency}
          component="span"
          sx={{ ...NUM_SX, color: profit.value < 0 ? RED : "text.primary" }}
        >
          {profit.value < 0 && "−"}
          {fmtNumber(profit.value)}
          <Box component="span" sx={{ ml: 0.5, fontSize: "10.5px", fontWeight: 600, color: "text.secondary" }}>
            {profit.currency}
          </Box>
        </Typography>
      ))}
    </Box>
  );
};

const AMOUNT_COLUMN = {
  size: 120,
  muiTableHeadCellProps: { align: "right" },
  muiTableBodyCellProps: { align: "right" },
};

const CashFlowFilterDrawer = () => {
  const {
    draft,
    isDrawerOpen,
    closeDrawer,
    setDraftFilter,
    applyFilters,
    resetFilters,
    selectsOpen,
    openSelect,
    closeSelect,
  } = useDrawerFilters({
    actions: cashFlowFilterActions,
    selectors: cashFlowFilterSelectors,
  });

  return (
    <FilterDrawer
      open={isDrawerOpen}
      onClose={closeDrawer}
      onApply={applyFilters}
      onReset={resetFilters}
      showFooter
    >
      <CashFlowFilter
        draft={draft}
        setDraftFilter={setDraftFilter}
        selectsOpen={selectsOpen}
        openSelect={openSelect}
        closeSelect={closeSelect}
      />
    </FilterDrawer>
  );
};

// Users whose own office was already put in the filter this session. After that the filter is
// theirs: clearing it, or picking another office, is not undone when they come back to the page.
const officeDefaultedFor = new Set();

const CashFlow = () => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);
  const { formatChange } = useDateFormat();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const {
    applied,
    openDrawer,
    setFilter,
    searchQuery,
    setSearch,
    page,
    setPage,
    limit,
    queryParams,
  } = useTableFilters({
    actions: cashFlowFilterActions,
    selectors: cashFlowFilterSelectors,
  });

  // The page opens on the signed-in user's own office. Until that filter is in place the list
  // is not requested, so the first thing shown is never every office's rows.
  const { user } = useAuth();
  const ownOfficeGuid = user?.office_guid || null;
  const userKey = user?.guid || null;
  const isOfficeDefaultPending =
    Boolean(ownOfficeGuid) && !officeDefaultedFor.has(userKey) && !applied?.office_guid;

  useEffect(() => {
    if (!ownOfficeGuid || officeDefaultedFor.has(userKey)) return;
    officeDefaultedFor.add(userKey);
    if (!applied?.office_guid) setFilter("office_guid", ownOfficeGuid);
  }, [ownOfficeGuid, userKey, applied?.office_guid, setFilter]);

  const {
    data: rows,
    meta,
    isLoading,
    isFetching,
    isError,
    refetch,
    totalItems,
    pageCount,
  } = usePagginationGet({
    apiFn: getAllTotalCalculationsApi,
    key: "totalCalculations",
    params: queryParams,
    // Refetched on every visit: sales and payments booked on other pages change this list, so
    // what the cache kept from the last visit is shown only until the fresh rows arrive.
    options: { enabled: !isOfficeDefaultPending, refetchOnMount: "always" },
  });

  const serverTotals = meta?.totals;
  const totals = useMemo(() => (Array.isArray(serverTotals) ? serverTotals : []), [serverTotals]);
  const activeSource = applied?.source ?? "";

  const { mutate: deleteTransaction, isPending: isDeleting } = useDelete({
    deleteFn: deleteTotalCalculationApi,
    queryKey: "totalCalculations",
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteTransaction(item.guid),
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "datetime",
        header: t("finance.cashBook.date"),
        size: 120,
        Cell: ({ cell }) => {
          const [date, time] = String(formatChange(cell.getValue()) || "").split(" ");
          return (
            <Box sx={{ lineHeight: 1.25 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>{date || "—"}</Typography>
              {time && <Typography sx={{ fontSize: "11.5px", color: "text.secondary" }}>{time}</Typography>}
            </Box>
          );
        },
      },
      {
        id: "kind",
        header: t("finance.cashBook.direction"),
        size: 130,
        Cell: ({ row }) => {
          const { color, Icon, labelKey } = KIND_STYLE[rowAmounts(row.original).kind];
          const source = row.original.source;
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "8px",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  color,
                  bgcolor: alpha(color, 0.12),
                }}
              >
                <Icon size={16} />
              </Box>
              <Box sx={{ lineHeight: 1.2, minWidth: 0 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color }}>{t(labelKey)}</Typography>
                <Typography sx={{ fontSize: "11px", color: "text.secondary" }}>
                  {t(`finance.cashBook.source.${source || "PROJECT"}`)}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        id: "category",
        header: t("category"),
        size: 150,
        Cell: ({ row }) => {
          // A cash-ledger row saved without a category reads "Other".
          const cat = row.original.category;
          const label =
            (cat ? selectedLang(cat.name) || cat.name?.tk || cat.name?.en || "" : "") ||
            (isCashRow(row.original) ? t("finance.cashBook.otherCategory") : "");
          if (!label) return <Muted>—</Muted>;
          return (
            <Chip
              label={label}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: "12px", borderRadius: "6px", borderColor: "divider", bgcolor: "action.hover" }}
            />
          );
        },
      },
      {
        accessorKey: "description",
        header: t("finance.cashBook.description"),
        size: 260,
        muiTableBodyCellProps: { align: "left" },
        Cell: ({ cell }) => {
          const text = cell.getValue();
          if (!text) return <Muted>—</Muted>;
          return (
            <Tooltip title={text} placement="top-start" enterDelay={400}>
              <Typography
                sx={{
                  fontSize: "13px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  maxWidth: 320,
                }}
              >
                {text}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        id: "parties",
        header: t("finance.cashBook.parties"),
        size: 190,
        Cell: ({ row }) => {
          const { giver, receiver, receiver_operator: opr } = row.original;
          if (!giver && !receiver) return opr?.fullName ? <Typography sx={{ fontSize: "13px" }}>{opr.fullName}</Typography> : <Muted>—</Muted>;
          return (
            <Box sx={{ lineHeight: 1.3 }}>
              <Typography sx={{ fontSize: "13px" }}>
                {giver || "—"}
                <Box component="span" sx={{ color: "text.secondary", mx: 0.75 }}>→</Box>
                {receiver || "—"}
              </Typography>
              {opr?.fullName && (
                <Typography sx={{ fontSize: "11.5px", color: "text.secondary" }}>{opr.fullName}</Typography>
              )}
            </Box>
          );
        },
      },
      {
        id: "office",
        header: t("finance.officeCash.office"),
        size: 140,
        Cell: ({ row }) => {
          const off = row.original.office;
          const name = off ? selectedLang(off.shortName) || selectedLang(off.fullName) : row.original.company;
          return name ? <Typography sx={{ fontSize: "13px" }}>{name}</Typography> : <Muted>—</Muted>;
        },
      },
      // TMT and USD never share a column, so neither is ever summed into the
      // other; a visa priced in both fills both.
      {
        id: "amount_tmt",
        header: "TMT",
        ...AMOUNT_COLUMN,
        Cell: ({ row }) => <SignedAmount value={rowAmounts(row.original).amounts.TMT} />,
      },
      {
        id: "amount_usd",
        header: "USD",
        ...AMOUNT_COLUMN,
        Cell: ({ row }) => <SignedAmount value={rowAmounts(row.original).amounts.USD} />,
      },
      {
        id: "profit",
        header: t("finance.profit"),
        ...AMOUNT_COLUMN,
        Cell: ({ row }) => <ProfitAmount profits={rowAmounts(row.original).profits} />,
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 90,
        Cell: ({ row, table: mrtTable }) =>
          row.original.is_manual ? (
            <ColumnActionButtons row={row} table={mrtTable} onDelete={deleteDialog.open} />
          ) : (
            <Tooltip title={t("finance.cashBook.projectLocked")}>
              <Box sx={{ display: "inline-flex", color: "text.disabled" }}>
                <Lock size={16} />
              </Box>
            </Tooltip>
          ),
      },
    ],
    [t, selectedLang, formatChange, deleteDialog.open],
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
    // Add uses its own modal state; edit goes through table.setEditingRow via
    // ColumnActionButtons — "custom" stops MRT from wrapping our own <Dialog>.
    editDisplayMode: "custom",
    columns,
    data: rows,
    getRowId: (row) => row.guid,
    manualPagination: true,
    manualFiltering: true,
    pageCount,
    rowCount: totalItems,
    state: {
      isLoading,
      showProgressBars: isFetching,
      pagination: { pageIndex: page - 1, pageSize: limit },
    },
    defaultColumn: {
      muiTableHeadCellProps: { align: "left" },
      muiTableBodyCellProps: { align: "left" },
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        boxShadow: `inset 3px 0 0 ${KIND_STYLE[rowAmounts(row.original).kind].color}`,
        "&:hover td": { bgcolor: "action.hover" },
      },
    }),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 0.5, flexWrap: "wrap", width: "100%" }}>
        {/* Same quiet segmented control as the Finance overview switches */}
        <ToggleButtonGroup
          exclusive
          value={activeSource}
          onChange={(_, v) => v !== null && setFilter("source", v)}
          sx={[
            segmentedSx,
            {
              border: "1px solid",
              borderColor: "divider",
              "& .MuiToggleButton-root": { height: 30, px: 2, fontSize: "13px", fontWeight: 500 },
              "& .MuiToggleButton-root.Mui-selected": { fontWeight: 600 },
            },
          ]}
        >
          {SOURCE_TABS.map(({ value, labelKey }) => (
            <ToggleButton key={value || "all"} value={value}>
              {t(labelKey)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Box sx={{ width: { xs: "100%", sm: 300 }, ml: { sm: "auto" } }}>
          <GlobalSearchInput
            value={searchQuery}
            onChange={setSearch}
            placeholder={t("search")}
            onRefetch={refetch}
            isFetching={isFetching}
          />
        </Box>
      </Box>
    ),
    renderBottomToolbar: () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          gap: 2,
          flexWrap: "wrap",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", columnGap: 2, rowGap: 0.75, flexWrap: "wrap", minWidth: 0 }}>
          <Typography sx={{ fontSize: "13px", color: "text.secondary", whiteSpace: "nowrap" }}>
            {t("finance.cashBook.operations", { count: totalItems })}
          </Typography>
        </Box>
        <Pagination
          pageIndex={page - 1}
          pageCount={pageCount}
          totalRows={totalItems}
          onPageChange={(i) => setPage(i + 1)}
        />
      </Box>
    ),
  });

  return (
    <>
      <PageHeader
        title={t("sidebar.cashFlow")}
        pageTitle={`${t("sidebar.cashFlow")} | Oguz Travel`}
        addButtonText={t("finance.addTransaction")}
        onAddClick={() => setIsAddModalOpen(true)}
        filterButtonText={t("filter")}
        onFilterClick={openDrawer}
      >
        <CashFlowSummary
          totals={totals}
          isLoading={isLoading}
          isProjectTab={activeSource === "PROJECT"}
          note={activeSource === "" ? t("finance.cashBook.allTabNote") : undefined}
        />
        <ExportExcelButton onClick={() => setIsExportOpen(true)} />
      </PageHeader>

      <MaterialReactTable table={table} />

      {Boolean(table.getState().editingRow) && (
        <EditCashTransactionModal table={table} row={table.getState().editingRow} />
      )}

      <AddCashTransactionModal open={isAddModalOpen} close={() => setIsAddModalOpen(false)} />
      {isExportOpen && (
        <CashFlowExportModal
          open={isExportOpen}
          close={() => setIsExportOpen(false)}
          apiFn={getAllTotalCalculationsApi}
          queryParams={queryParams}
          isProjectTab={activeSource === "PROJECT"}
          sourceLabel={activeSource ? t(SOURCE_TABS.find((tab) => tab.value === activeSource)?.labelKey) : ""}
        />
      )}

      <CashFlowFilterDrawer />

      <DeleteDialog
        open={deleteDialog.isOpen}
        isLoading={isDeleting}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        title={t("finance.deleteTransaction")}
        description={t("finance.deleteConfirm")}
      />
    </>
  );
};

export default CashFlow;
