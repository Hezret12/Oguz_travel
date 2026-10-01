import { useMemo, useState } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, Tooltip, Typography, alpha } from "@mui/material";
import { ArrowDownLeft, ArrowUpRight, Info } from "lucide-react";

import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import TableErrorState from "../../../components/TableErrorState";
import { useLocale } from "../../../hooks/useLocale";
import PageHeader from "../../../components/PageHeader";
import Pagination from "../../../components/Pagination";
import { useDateFormat } from "../../../functions/generalHelpers";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import FilterDrawer from "../../../components/FilterDrawer";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import { useGet } from "../../../hooks/CRUD/useGet";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useTableFilters, useDrawerFilters } from "../../../hooks/usePageFilters";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { deleteTotalCalculationApi } from "../../../api/queries/delete";
import { getAllTotalCalculationsApi, getOfficeBalancesApi } from "../../../api/queries/getters";
import {
  officeCashFilterActions,
  officeCashFilterSelectors,
} from "../../../store/slices/filters/officeCashFilterSlice";
import { cashAmount, fmtMoney } from "../CashFlow/functions/cashFlowHelpers";
import OfficeBalanceCards from "./Contents/OfficeBalanceCards";
import OfficeCashFilter from "./Contents/OfficeCashFilter";
import AddOfficeTransactionModal from "./AddOfficeTransactionModal";
import EditOfficeTransactionModal from "./EditOfficeTransactionModal";
import { OFFICE_CASH_SOURCES, currenciesOf, sumTotals } from "./functions/officeCashHelpers";

const GREEN = "#16a34a";
const RED = "#dc2626";

const OfficeCashFilterDrawer = () => {
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
  } = useDrawerFilters({ actions: officeCashFilterActions, selectors: officeCashFilterSelectors });

  return (
    <FilterDrawer open={isDrawerOpen} onClose={closeDrawer} onApply={applyFilters} onReset={resetFilters} showFooter>
      <OfficeCashFilter
        draft={draft}
        setDraftFilter={setDraftFilter}
        selectsOpen={selectsOpen}
        openSelect={openSelect}
        closeSelect={closeSelect}
      />
    </FilterDrawer>
  );
};

// Every office's cash balance, and the income / expense transactions booked
// to it: an amount in one currency with a description.
const OfficeCash = () => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);
  const { formatChange } = useDateFormat();
  // null = closed; otherwise the office to preselect ("" = none).
  const [addForOffice, setAddForOffice] = useState(null);

  const { applied, openDrawer, setFilter, searchQuery, setSearch, page, setPage, limit, queryParams } =
    useTableFilters({ actions: officeCashFilterActions, selectors: officeCashFilterSelectors });

  const selectedOffice = applied?.office_guid ?? "";

  const listParams = useMemo(
    () => ({
      ...queryParams,
      source: OFFICE_CASH_SOURCES,
      // Without a picked office, still only rows that belong to some office.
      ...(queryParams.office_guid ? {} : { has_office: true }),
    }),
    [queryParams],
  );

  const {
    data: balancesData,
    isLoading: isBalancesLoading,
    refetch: refetchBalances,
  } = useGet({ apiFn: getOfficeBalancesApi, key: "officeBalances" });

  const offices = useMemo(() => (Array.isArray(balancesData) ? balancesData : []), [balancesData]);
  const allTotals = useMemo(() => sumTotals(offices), [offices]);
  const currencies = useMemo(() => currenciesOf(offices), [offices]);

  const { data: rows, isLoading, isFetching, isError, refetch, totalItems, pageCount } = usePagginationGet({
    apiFn: getAllTotalCalculationsApi,
    key: "totalCalculations",
    params: listParams,
  });

  const { mutate: deleteTransaction, isPending: isDeleting } = useDelete({
    deleteFn: deleteTotalCalculationApi,
    queryKey: "totalCalculations",
    idKey: "guid",
    isPaginated: true,
    invalidateQueries: ["officeBalances"],
  });

  const deleteDialog = useDeleteDialog({ onConfirm: (item) => deleteTransaction(item.guid) });

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
        size: 120,
        Cell: ({ row }) => {
          const income = row.original.type === "INCOME";
          const color = income ? GREEN : RED;
          const Icon = income ? ArrowDownLeft : ArrowUpRight;
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
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color }}>
                {t(income ? "finance.income" : "finance.expense")}
              </Typography>
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
          const name = off ? selectedLang(off.shortName) || selectedLang(off.fullName) : "";
          return <Typography sx={{ fontSize: "13px", color: name ? "text.primary" : "text.secondary" }}>{name || "—"}</Typography>;
        },
      },
      {
        accessorKey: "description",
        header: t("finance.cashBook.description"),
        size: 320,
        Cell: ({ cell }) => {
          const text = cell.getValue();
          if (!text) return <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>—</Typography>;
          return (
            <Tooltip title={text} placement="top-start" enterDelay={400}>
              <Typography
                sx={{
                  fontSize: "13px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  maxWidth: 420,
                }}
              >
                {text}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        id: "amount",
        header: t("finance.amount"),
        size: 140,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ row }) => {
          const r = row.original;
          const income = r.type === "INCOME";
          return (
            <Typography
              sx={{
                fontSize: "13.5px",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
                color: income ? GREEN : RED,
              }}
            >
              {income ? "+" : "-"}
              {fmtMoney(cashAmount(r), r.currency || "USD")}
            </Typography>
          );
        },
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 90,
        Cell: ({ row, table: mrtTable }) => (
          <ColumnActionButtons row={row} table={mrtTable} onDelete={deleteDialog.open} />
        ),
      },
    ],
    [t, selectedLang, formatChange, deleteDialog.open],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    renderEmptyRowsFallback: () =>
      isError ? <TableErrorState onRetry={refetch} isRetrying={isFetching} /> : defaultMrtOptions.renderEmptyRowsFallback(),
    // Add uses its own modal state (it can preselect an office); edit goes
    // through table.setEditingRow via ColumnActionButtons.
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
      // The office column only says something when every office is listed.
      columnVisibility: { office: !selectedOffice },
    },
    defaultColumn: {
      muiTableHeadCellProps: { align: "left" },
      muiTableBodyCellProps: { align: "left" },
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        boxShadow: `inset 3px 0 0 ${row.original.type === "INCOME" ? GREEN : RED}`,
        "&:hover td": { bgcolor: "action.hover" },
      },
    }),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 0.5, width: "100%" }}>
        <Box sx={{ width: { xs: "100%", sm: 300 }, ml: { sm: "auto" } }}>
          <GlobalSearchInput
            value={searchQuery}
            onChange={setSearch}
            placeholder={t("search")}
            onRefetch={() => {
              refetch();
              refetchBalances();
            }}
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
        <Typography sx={{ fontSize: "13px", color: "text.secondary", whiteSpace: "nowrap" }}>
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
        title={t("finance.officeCash.title")}
        pageTitle={`${t("finance.officeCash.title")} | Oguz Travel`}
        addButtonText={t("finance.addTransaction")}
        onAddClick={() => setAddForOffice(selectedOffice)}
        filterButtonText={t("filter")}
        onFilterClick={openDrawer}
      >
        <Tooltip title={t("finance.officeCash.balanceHint")} placement="bottom" arrow>
          <Box sx={{ display: { xs: "none", md: "inline-flex" }, color: "text.secondary", cursor: "help" }}>
            <Info size={16} />
          </Box>
        </Tooltip>
      </PageHeader>

      <OfficeBalanceCards
        offices={offices}
        allTotals={allTotals}
        currencies={currencies}
        selectedGuid={selectedOffice}
        onSelect={(guid) => setFilter("office_guid", guid)}
        onAdd={setAddForOffice}
        isLoading={isBalancesLoading}
      />

      <MaterialReactTable table={table} />

      {Boolean(table.getState().editingRow) && (
        <EditOfficeTransactionModal table={table} row={table.getState().editingRow} />
      )}

      <AddOfficeTransactionModal
        open={addForOffice !== null}
        officeGuid={addForOffice ?? ""}
        close={() => setAddForOffice(null)}
      />

      <OfficeCashFilterDrawer />

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

export default OfficeCash;
