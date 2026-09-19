import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Button, Chip, Tab, Tabs, Tooltip, Typography, alpha } from "@mui/material";
import { ArrowDownLeft, ArrowUpRight, FileSpreadsheet, Lock, Zap } from "lucide-react";

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
import ImportKassaExcelModal from "./Contents/ImportKassaExcelModal";
import AddCashTransactionModal from "./AddCashTransactionModal";
import EditCashTransactionModal from "./EditCashTransactionModal";
import { cashAmount, fmtMoney, isCashRow } from "./functions/cashFlowHelpers";

const GREEN = "#16a34a";
const RED = "#dc2626";
const BLUE = "#2563eb";

// Tab value → `source` query param
const SOURCE_TABS = [
  { value: "", labelKey: "finance.cashBook.tabs.all" },
  { value: "MANUAL,EXCEL", labelKey: "finance.cashBook.tabs.kassa" },
  { value: "PROJECT", labelKey: "finance.cashBook.tabs.project" },
];

const rowKind = (row) => {
  if (!isCashRow(row)) return { color: BLUE, Icon: Zap, labelKey: "finance.cashBook.projectSale" };
  return row.type === "INCOME"
    ? { color: GREEN, Icon: ArrowDownLeft, labelKey: "finance.income" }
    : { color: RED, Icon: ArrowUpRight, labelKey: "finance.expense" };
};

const Muted = ({ children }) => (
  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
    {children}
  </Typography>
);

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

const CashFlow = () => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

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

  const {
    data: rows,
    meta,
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
          const { color, Icon, labelKey } = rowKind(row.original);
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
          const cat = row.original.category;
          const label = cat ? selectedLang(cat.name) || cat.name?.tk || cat.name?.en || "" : "";
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
        header: t("finance.cashBook.officeCompany"),
        size: 140,
        Cell: ({ row }) => {
          const off = row.original.office;
          const name = off ? selectedLang(off.shortName) || selectedLang(off.fullName) : row.original.company;
          return name ? <Typography sx={{ fontSize: "13px" }}>{name}</Typography> : <Muted>—</Muted>;
        },
      },
      {
        id: "amount",
        header: t("finance.amount"),
        size: 150,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ row }) => {
          const r = row.original;
          const cur = r.currency || "USD";
          const numSx = { fontSize: "13.5px", fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

          if (isCashRow(r)) {
            const income = r.type === "INCOME";
            return (
              <Typography sx={{ ...numSx, color: income ? GREEN : RED }}>
                {income ? "+" : "-"}
                {fmtMoney(cashAmount(r), cur)}
              </Typography>
            );
          }

          // Project row: sale, cost and profit in one cell
          const sale = Number(r.sale_price || 0);
          const net = Number(r.net_price || 0);
          const profit = Number(r.profit || 0);
          return (
            <Box sx={{ lineHeight: 1.25 }}>
              <Typography sx={{ ...numSx, color: GREEN }}>+{fmtMoney(sale, cur)}</Typography>
              <Typography sx={{ fontSize: "11.5px", color: "text.secondary", whiteSpace: "nowrap" }}>
                -{fmtMoney(net, cur)} ·{" "}
                <Box component="span" sx={{ color: profit >= 0 ? GREEN : RED, fontWeight: 600 }}>
                  {profit >= 0 ? "+" : "-"}
                  {fmtMoney(Math.abs(profit), cur)}
                </Box>
              </Typography>
            </Box>
          );
        },
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
        boxShadow: `inset 3px 0 0 ${rowKind(row.original).color}`,
        "&:hover td": { bgcolor: "action.hover" },
      },
    }),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 0.5, flexWrap: "wrap", width: "100%" }}>
        <Tabs
          value={activeSource}
          onChange={(_, v) => setFilter("source", v)}
          sx={{
            minHeight: 36,
            "& .MuiTab-root": { minHeight: 36, textTransform: "none", fontWeight: 600, px: 1.5 },
          }}
        >
          {SOURCE_TABS.map((tab) => (
            <Tab key={tab.value || "all"} value={tab.value} label={t(tab.labelKey)} />
          ))}
        </Tabs>
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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1, gap: 2 }}>
        <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
          {t("finance.cashBook.operations", { count: totalItems })}
        </Typography>
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
        <Button
          variant="outlined"
          startIcon={<FileSpreadsheet size={16} />}
          onClick={() => setIsImportOpen(true)}
          sx={{ height: 40, px: 2.5, borderRadius: "10px", textTransform: "none", fontWeight: 600, borderColor: "divider", color: "text.primary" }}
        >
          {t("finance.cashBook.importButton")}
        </Button>
      </PageHeader>

      <CashFlowSummary totals={totals} isLoading={isLoading} isProjectTab={activeSource === "PROJECT"} />

      {activeSource === "" && totals.length > 0 && (
        <Typography sx={{ fontSize: "12px", color: "text.secondary", mt: -1, mb: 1.5 }}>
          {t("finance.cashBook.allTabNote")}
        </Typography>
      )}

      <MaterialReactTable table={table} />

      {Boolean(table.getState().editingRow) && (
        <EditCashTransactionModal table={table} row={table.getState().editingRow} />
      )}

      <AddCashTransactionModal open={isAddModalOpen} close={() => setIsAddModalOpen(false)} />
      <ImportKassaExcelModal open={isImportOpen} close={() => setIsImportOpen(false)} />

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
