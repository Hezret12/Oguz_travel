import { useMemo, useState, useCallback } from "react";
import { Box, Chip } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useLocale } from "../../hooks/useLocale";
import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import PageHeader from "../../components/PageHeader";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import Pagination from "../../components/Pagination";
import TableEmptyState from "../../components/TableEmptyState";
import StackedCell from "../../components/inputs/StackCell";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import OperatorsCell from "../../components/OperatorsCell";
import ClientCell from "../../components/ClientCell";
import FilterDrawer from "../../components/FilterDrawer";
import DeleteDialog from "../../components/DeleteDialog";
import { useTableFilters, useDrawerFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { useGet } from "../../hooks/CRUD/useGet";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";
import {
  getAllReferralLettersApi,
  getAllEmployeeApi,
} from "../../api/queries/getters";
import { deleteReferralLetterApi } from "../../api/queries/delete";
import {
  referralLetterFilterActions,
  referralLetterFilterSelectors,
} from "../../store/slices/filters/referralLetterFilterSlice";
import ReferralLetterFilter from "./Contents/ReferralLetterFilter";
import AddReferralLetterModal from "./AddReferralLetterModal";
import EditReferralLetterModal from "./EditReferralLetterModal";
import ExportExcelButton from "../../components/ExportExcelButton";
import { exportReferralLetterExcel } from "./functions/exportReferralLetterExcel";
import { useDateFormat } from "../../functions/generalHelpers";

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  TMT: "m",
  RUB: "₽",
};

const ReferralLetterFilterDrawer = () => {
  const {
    draft,
    isDrawerOpen,
    closeDrawer,
    setDraftFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
    selectsOpen,
    openSelect,
    closeSelect,
  } = useDrawerFilters({
    actions: referralLetterFilterActions,
    selectors: referralLetterFilterSelectors,
  });

  return (
    <FilterDrawer
      open={isDrawerOpen}
      onClose={cancelFilters}
      onApply={() => {
        applyFilters();
        closeDrawer();
      }}
      onReset={resetFilters}
      onCancel={cancelFilters}
    >
      <ReferralLetterFilter
        filters={draft}
        selectsOpen={selectsOpen}
        onFilterChange={setDraftFilter}
        onSelectOpen={openSelect}
        onSelectClose={closeSelect}
      />
    </FilterDrawer>
  );
};

const ReferalLetter = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();
  const [rowSelection, setRowSelection] = useState({});

  const {
    applied,
    openDrawer,
    searchQuery,
    setSearch,
    setFilter,
    page,
    limit,
    setPage,
    setPageSize,
    setSort,
    queryParams,
    resetFilters,
  } = useTableFilters({
    actions: referralLetterFilterActions,
    selectors: referralLetterFilterSelectors,
  });

  const {
    data: referralLetters,
    isLoading,
    isFetching,
    refetch,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllReferralLettersApi,
    key: "referralLetters",
    params: queryParams,
  });

  const { mutate: deleteReferralLetter, isPending: isDeleting } = useDelete({
    deleteFn: deleteReferralLetterApi,
    queryKey: "referralLetters",
    idKey: "guid",
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteReferralLetter(item.guid),
  });

  const handleDeleteClick = useCallback(
    (item) => deleteDialog.open(item),
    [deleteDialog],
  );

  // Fetch employees for filter chip labels
  const { data: employeeList } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const employeeById = useMemo(
    () =>
      Object.fromEntries((employeeList || []).map((e) => [e.guid || e.id, e])),
    [employeeList],
  );

  const activeFilters = useMemo(
    () =>
      Object.entries(applied).filter(
        ([key, value]) =>
          key !== "search" &&
          value !== "" &&
          value !== null &&
          value !== undefined,
      ),
    [applied],
  );

  const getFilterLabel = useCallback(
    (key, value) => {
      if (key === "received_opr_guid") {
        return `${t("columns.operator")}: ${employeeById[value]?.fullName || value}`;
      }
      if (key === "start_departure_date") {
        return `${t("columns.startDepartureDate")}: ${formatChange(value, { dateOnly: true })}`;
      }
      if (key === "end_departure_date") {
        return `${t("columns.endDepartureDate")}: ${formatChange(value, { dateOnly: true })}`;
      }
      if (key === "start_return_date") {
        return `${t("columns.startReturnDate")}: ${formatChange(value, { dateOnly: true })}`;
      }
      if (key === "end_return_date") {
        return `${t("columns.endReturnDate")}: ${formatChange(value, { dateOnly: true })}`;
      }
      if (key === "start_contract_date") {
        return `${t("columns.startContractDate")}: ${formatChange(value, { dateOnly: true })}`;
      }
      if (key === "end_contract_date") {
        return `${t("columns.endContractDate")}: ${formatChange(value, { dateOnly: true })}`;
      }
      return `${t(`columns.${key}`, key)}: ${value}`;
    },
    [t, employeeById, formatChange],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "index_number",
        id: "index_number",
        header: "№",
        size: 60,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        id: "operator",
        header: t("outbound.operator"),
        size: 200,
        accessorFn: (row) => row.refferaloperator?.fullName ?? "",
        Cell: ({ row }) => (
          <OperatorsCell assignmentOperator={row.original.refferaloperator} />
        ),
      },
      {
        header: t("columns.client"),
        id: "fullName",
        size: 220,
        accessorFn: (row) => row.client?.fullName ?? "",
        Cell: ({ row }) => <ClientCell client={row.original.client} />,
      },
      {
        accessorFn: (row) => row.client?.gender ?? "",
        id: "gender",
        header: t("columns.gender"),
        size: 80,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return val === "Male"
            ? t("clients.genderMen")
            : val === "Female"
              ? t("clients.genderWomen")
              : val;
        },
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.client?.dateOfBirth ?? "",
        id: "dateOfBirth",
        header: t("columns.dateOfBirth"),
        size: 110,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.client?.passport_number ?? "",
        id: "passport_number",
        header: t("columns.passportNumber"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "destination_country",
        id: "destination_country",
        header: t("columns.destinationCountry"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.bgn_departure ?? row.tranzit ?? "",
        id: "bgn_departure",
        header: t("columns.bgnDeparture"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "travel_document_number",
        id: "travel_document_number",
        header: t("columns.syhNo"),
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "departure_date",
        id: "departure_date",
        header: t("columns.departureDate"),
        size: 100,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "return_date",
        id: "return_date",
        header: t("columns.returnDate"),
        size: 100,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "price",
        id: "price",
        header: t("price"),
        size: 130,
        Cell: ({ row, cell }) => {
          const amount = cell.getValue();
          const currency = row.original.currency || "TMT";
          const symbol = CURRENCY_SYMBOLS[currency] || currency;
          return `${Number(amount || 0).toFixed(2)} ${symbol}`;
        },
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        accessorKey: "contract_number",
        id: "contract_number",
        header: t("columns.contract_number"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "contract_date",
        id: "contract_date",
        header: t("columns.contractDate"),
        size: 90,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        id: "agent",
        header: t("columns.agent"),
        size: 170,
        accessorFn: (row) => row.agent?.name ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.agent?.name}
            secondary={row.original.agent?.phone_number}
          />
        ),
      },
      {
        accessorKey: "note",
        id: "note",
        header: t("columns.note"),
        size: 200,
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 110,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            onDelete={() => handleDeleteClick(row.original)}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, formatChange],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    enableColumnPinning: true,
    initialState: {
      columnPinning: {
        left: ["index_number"],
        right: ["actions"],
      },
    },
    columns,
    data: referralLetters || [],
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
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.secondary,
        opacity: isLoading || isFetching ? 0 : 1,
        pointerEvents: isLoading || isFetching ? "none" : "auto",
        transition: "opacity 0.15s ease",
      }),
    },
    getRowId: (row) => row.guid,
    onRowSelectionChange: setRowSelection,

    // Server-side
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
      return <TableEmptyState onResetFilters={resetFilters} />;
    },
    renderCreateRowDialogContent: ({ table }) => (
      <AddReferralLetterModal table={table} />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <EditReferralLetterModal table={table} row={row} />
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
            label={getFilterLabel(key, value)}
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

    muiTableBodyRowProps: ({ row }) => ({
      onClick: row.getToggleSelectedHandler(),
      sx: (theme) => ({
        cursor: "pointer",
        backgroundColor: row.getIsSelected()
          ? theme.palette.mode === "dark"
            ? "rgba(0, 114, 229, 0.2) !important"
            : "rgba(0, 114, 229, 0.1) !important"
          : "inherit",
        "&:hover": {
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.04)",
        },
      }),
    }),
  });

  const handleExportExcel = useCallback(
    (items, options) =>
      exportReferralLetterExcel(items, { ...options, queryParams }),
    [queryParams]
  );

  return (
    <>
      <PageHeader
        title={t("referralLetter.title")}
        pageTitle={`${t("referralLetter.title")} | Oguz Travel`}
        addButtonText={t("referralLetter.add")}
        filterButtonText={t("filter")}
        onAddClick={() => table.setCreatingRow(true)}
        onFilterClick={openDrawer}
      >
        <ExportExcelButton
          apiFn={getAllReferralLettersApi}
          queryParams={queryParams}
          totalItems={totalItems}
          fileName="Yollanma_Hatlary_Hasabaty"
          sheetName="Ýollanma Hatlary"
          customExportFn={handleExportExcel}
        />
      </PageHeader>

      <ReferralLetterFilterDrawer />

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("deleteDialog.description")}
      />

      <MaterialReactTable table={table} />
    </>
  );
};

export default ReferalLetter;
