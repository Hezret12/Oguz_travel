import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo, useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import { Box, Chip } from "@mui/material";
import StackedCell from "../../components/inputs/StackCell";
import { useDateFormat } from "../../functions/generalHelpers";
import AddTranslateModal from "./AddTranslateModal";
import EditTranslateModal from "./EditTranslateModal";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import { usePageFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { getAllTranslationsApi } from "../../api/queries/getters";
import {
  translateFilterActions,
  translateFilterSelectors,
} from "../../store/slices/filters/translateFilterSlice";
import FilterDrawer from "../../components/FilterDrawer";
import TranslateFilter from "./Contents/TranslateFilter";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import PaymentStatusCell from "../../components/PaymentStatusCell";

const TranslatePage = () => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();
  const [rowSelection, setRowSelection] = useState({});

  const {
    applied,
    draft,
    isDrawerOpen,
    openDrawer,
    setDraftFilter,
    setFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
    searchQuery,
    setSearch,
    page,
    limit,
    setPage,
    setPageSize,
    setSort,
    selectsOpen,
    openSelect,
    closeSelect,
    queryParams,
  } = usePageFilters({
    actions: translateFilterActions,
    selectors: translateFilterSelectors,
  });

  const {
    data: translationsData,
    isLoading,
    isFetching,
    refetch,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllTranslationsApi,
    key: "translations",
    params: queryParams,
  });

  const translations = useMemo(() => translationsData?.data ?? translationsData ?? [], [translationsData]);

  const activeFilters = useMemo(
    () =>
      Object.entries(applied).filter(
        // eslint-disable-next-line no-unused-vars
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    [applied],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "index_number",
        id: "index_number",
        header: "#",
        size: 50,
        enableSorting: false,
      },
      {
        accessorKey: "received_day",
        id: "received_day",
        header: t("columns.receivedDay") || "Alnan güni",
        size: 100,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "received_time",
        id: "received_time",
        header: t("columns.receivedTime") || "Alnan wagty",
        size: 90,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "client",
        header: t("columns.client"),
        size: 200,
        accessorFn: (row) => row.client?.fullName ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.client?.fullName}
            secondary={row.original.client?.phone_number}
          />
        ),
      },
      {
        id: "translator",
        accessorFn: (row) => row.translator?.fullName,
        header: t("columns.translator") || "Terjimeçi",
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.source_to_target,
        id: "source_to_target",
        header: t("columns.direction") || "Ugur",
        size: 120,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.page_count,
        id: "page_count",
        header: t("columns.pageCount") || "Sahypa",
        size: 80,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.completed_page_count,
        id: "completed_page_count",
        header: t("columns.completedPageCount") || "Tabşyrylan sahypa sany",
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.price,
        id: "price",
        header: t("columns.price") || "Baha",
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ cell }) => {
          const val = Number(cell.getValue() || 0);
          return `${val.toFixed(2)} TMT`;
        },
      },
      {
        id: "is_paid",
        accessorFn: (row) => {
          const val = row.is_paid;
          if (val === 0 || val === "0") {
            return t("paymentRefunded") || "Gaýtaryldy";
          }
          if (row.paidPercentage !== undefined) return row.paidPercentage;
          if (val === true || val === "true" || val === 1 || val === "1") return 100;
          return 0;
        },
        header: t("columns.paymentStatus"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const val = row.original.is_paid;
          if (val === 0 || val === "0") {
            return (
              <Chip
                label={t("paymentRefunded")}
                size="small"
                sx={{
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  color: "#d97706",
                  fontWeight: 600,
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  height: "24px",
                }}
              />
            );
          }
          const percent = row.original.paidPercentage ?? (
            val === true || val === "true" || val === 1 || val === "1"
              ? 100
              : 0
          );
          return <PaymentStatusCell percent={percent} />;
        },
      },
      {
        accessorKey: "completed_day",
        id: "completed_day",
        header: t("columns.completedDay") || "Tabşyrylan güni",
        size: 100,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "completed_time",
        id: "completed_time",
        header: t("columns.completedTime") || "Tabşyrylan wagty",
        size: 90,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "status",
        accessorFn: (row) => {
          const statusVal = row.status !== undefined ? row.status : row.status_guid;
          if (statusVal === true || statusVal === "true" || statusVal === 1 || statusVal === "1") {
            return t("statusUrgent") || "Gyssagly";
          }
          if (statusVal === false || statusVal === "false") {
            return t("statusNormal") || "Adaty";
          }
          if (statusVal === 0 || statusVal === "0") {
            return t("paymentRefunded") || "Gaýtaryldy";
          }
          return row.status?.name_tk || "";
        },
        header: t("columns.status") || "Ýagdaýy",
        size: 120,
        Cell: ({ row }) => {
          const statusVal = row.original.status !== undefined ? row.original.status : row.original.status_guid;
          if (statusVal === true || statusVal === "true" || statusVal === 1 || statusVal === "1") {
            return (
              <Chip
                label={t("statusUrgent") || "Gyssagly"}
                size="small"
                sx={{
                  backgroundColor: "rgba(239, 68, 68, 0.12)",
                  color: "#ef4444",
                  fontWeight: 600,
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  height: "24px",
                }}
              />
            );
          }
          if (statusVal === false || statusVal === "false") {
            return (
              <Chip
                label={t("statusNormal") || "Adaty"}
                size="small"
                sx={{
                  backgroundColor: "rgba(59, 130, 246, 0.12)",
                  color: "#2563eb",
                  fontWeight: 600,
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  height: "24px",
                }}
              />
            );
          }
          if (statusVal === 0 || statusVal === "0") {
            return (
              <Chip
                label={t("paymentRefunded") || "Gaýtaryldy"}
                size="small"
                sx={{
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  color: "#d97706",
                  fontWeight: 600,
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  height: "24px",
                }}
              />
            );
          }
          const statusObj = row.original.status;
          const label = typeof statusObj === "object"
            ? (selectedLang(statusObj?.name_ru, statusObj?.name_en, statusObj?.name_tk) || statusObj?.name_ru || "")
            : String(statusObj || "");
          if (!label) return null;
          return (
            <Chip
              label={label}
              size="small"
              sx={{
                backgroundColor: "rgba(107, 114, 128, 0.12)",
                color: "#4b5563",
                fontWeight: 600,
                borderRadius: "6px",
                fontSize: "0.75rem",
                border: "1px solid rgba(107, 114, 128, 0.3)",
                height: "24px",
              }}
            />
          );
        },
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.correction_status,
        id: "correction_status",
        header: t("columns.correctionStatus") || "Düzeliş ýagdaýy",
        size: 120,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "operator",
        header: t("columns.operator"),
        size: 150,
        accessorFn: (row) => row.operator?.fullName,
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.operator?.fullName}
            secondary={selectedLang(
              row?.original?.operator?.office?.fullName
            )}
          />
        ),
      },
      {
        accessorFn: (row) => row.note,
        id: "note",
        header: t("columns.note"),
        size: 100,
      },
      {
        id: "actions",
        header: t("columns.actions") ?? "Actions",
        size: 110,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            showPayment={true}
          />
        ),
      },
    ],
    [t, selectedLang, formatChange],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    enableColumnPinning: true,
    columns,
    data: translations || [],
    initialState: {
      columnPinning: {
        left: ["index_number"],
        right: ["actions"],
      },
    },
    state: {
      rowSelection,
      isLoading: false,
      showLoadingOverlay: isLoading || isFetching,
      showSkeletons: false,
      showProgressBars: false,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    muiTableBodyProps: {
      sx: (theme) => ({
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.secondary,
        opacity: isLoading || isFetching ? 0 : 1,
        pointerEvents: isLoading || isFetching ? "none" : "auto",
        transition: "opacity 0.15s ease",
      }),
    },
    getRowId: (row) => row.guid,
    onRowSelectionChange: setRowSelection,

    // Server-side options
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount,
    rowCount: totalItems,

    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(table.getState().pagination)
          : updater;
      if (next.pageIndex !== undefined) setPage(next.pageIndex + 1);
      if (next.pageSize !== undefined) setPageSize(next.pageSize);
    },

    onSortingChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(table.getState().sorting)
          : updater;
      if (next && next.length > 0) {
        setSort(next[0].id, next[0].desc ? "desc" : "asc");
      } else {
        setSort("", "asc");
      }
    },

    renderEmptyRowsFallback: () => {
      if (isLoading || isFetching) return null;
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 4,
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          {t("noData")}
        </Box>
      );
    },

    renderCreateRowDialogContent: ({ table }) => <AddTranslateModal table={table} />,
    renderEditRowDialogContent: ({ table, row }) => (
      <EditTranslateModal table={table} row={row} queryParams={queryParams} />
    ),

    renderTopToolbarCustomActions: () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
          mt: 0.5,
        }}
      >
        <GlobalSearchInput
          value={searchQuery}
          onChange={setSearch}
          placeholder={t("search")}
          disabled={isLoading}
          onRefetch={refetch}
          isFetching={isFetching}
        />

        {activeFilters.map(([key, value]) => (
          <Chip
            key={key}
            label={`${t(`columns.${key}`, key)}: ${value}`}
            onDelete={() => setFilter(key, "")}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              borderRadius: "8px",
              height: "32px",
              fontWeight: 500,
              "& .MuiChip-deleteIcon": {
                color: "primary.main",
                transition: "all 0.15s ease",
              },
            }}
          />
        ))}
      </Box>
    ),

    renderBottomToolbar: ({ table: mrtTable }) => {
      const { pageIndex } = mrtTable.getState().pagination;
      return (
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
          <Box />
          <Pagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            pageSize={limit}
            totalRows={totalItems}
            onPageChange={(newIndex) => setPage(newIndex + 1)}
          />
        </Box>
      );
    },
  });

  return (
    <>
      <PageHeader
        title={t("translation") || "Terjime"}
        pageTitle={`${t("translation") || "Terjime"} | Oguz Travel`}
        addButtonText={t("addTranslation") || "Terjime goşmak"}
        filterButtonText={t("filter") || "Filter"}
        onAddClick={() => table.setCreatingRow(true)}
        onFilterClick={openDrawer}
      />

      <FilterDrawer
        open={isDrawerOpen}
        onClose={cancelFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        onCancel={cancelFilters}
      >
        <TranslateFilter
          filters={draft}
          selectsOpen={selectsOpen}
          onFilterChange={setDraftFilter}
          onSelectOpen={openSelect}
          onSelectClose={closeSelect}
        />
      </FilterDrawer>

      <MaterialReactTable table={table} />
    </>
  );
};

export default TranslatePage;
