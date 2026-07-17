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
import StackedCell from "../../components/inputs/StackCell";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import FilterDrawer from "../../components/FilterDrawer";
import DeleteDialog from "../../components/DeleteDialog";
import { usePageFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";
import { getAllReferralLettersApi } from "../../api/queries/getters";
import { deleteReferralLetterApi } from "../../api/queries/delete";
import {
  referralLetterFilterActions,
  referralLetterFilterSelectors,
} from "../../store/slices/filters/referralLetterFilterSlice";
import ReferralLetterFilter from "./Contents/ReferralLetterFilter";
import AddReferralLetterModal from "./AddReferralLetterModal";
import EditReferralLetterModal from "./EditReferralLetterModal";
import { useDateFormat } from "../../functions/generalHelpers";

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  TMT: "m",
  RUB: "₽",
};

const ReferalLetter = () => {
  const { t } = useLocale();
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
    actions: referralLetterFilterActions,
    selectors: referralLetterFilterSelectors,
  });

  const {
    data: referralLetters,
    isLoading,
    isFetching,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllReferralLettersApi,
    key: "referralLetters",
    params: queryParams,
  });

  const { mutate: deleteReferralLetter, isPending: isDeleting } = useDelete({
    deleteFn: deleteReferralLetterApi,
    queryKey: ["referralLetters", queryParams],
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteReferralLetter(item.guid),
  });

  const handleDeleteClick = useCallback(
    (item) => deleteDialog.open(item),
    [deleteDialog],
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

  const columns = useMemo(
    () => [
      {
        id: "rowNumber",
        header: "№",
        size: 60,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.index + 1,
      },
      {
        id: "operator",
        header: t("columns.operator"),
        size: 160,
        accessorFn: (row) => row.operator ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.operator}
            secondary={row.original.ofis}
          />
        ),
      },
      {
        id: "agent",
        header: t("columns.agent"),
        size: 150,
        accessorFn: (row) => row.agent?.name,
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.agent?.name}
            secondary={row.original.agentTel}
          />
        ),
      },
      {
        id: "fullName",
        header: t("columns.client"),
        size: 200,
        accessorFn: (row) =>
          `${row.name ?? ""} ${row.surname ?? ""}`.trim(),
        Cell: ({ row }) => (
          <StackedCell
            primary={`${row.original.name ?? ""} ${row.original.surname ?? ""}`.trim()}
            secondary={row.original.yolagcyTel}
          />
        ),
      },
      {
        accessorKey: "gender",
        header: t("columns.gender"),
        size: 90,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return val === "Male"
            ? t("pages.clients.genderMen")
            : val === "Female"
              ? t("pages.clients.genderWomen")
              : val;
        },
      },
      {
        accessorKey: "dateOfBirth",
        header: t("columns.dateOfBirth"),
        size: 110,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "passportNumber",
        header: t("columns.passportNumber") ?? "Passport №",
        size: 110,
      },
      {
        accessorKey: "destination_country",
        header: t("columns.destinationCountry"),
        size: 110,
      },
      {
        accessorKey: "tranzit",
        header: t("columns.transit"),
        size: 90,
      },
      {
        accessorKey: "travel_document_number",
        header: t("columns.syhNo"),
        size: 100,
        Cell: ({ row, cell }) => {
          const value = cell.getValue();
          const isHighlighted = row.original.syhHighlighted;
          return (
            <Box
              component="span"
              sx={{
                display: "inline-block",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: isHighlighted ? "error.main" : "transparent",
                color: isHighlighted ? "error.contrastText" : "inherit",
                fontWeight: isHighlighted ? 700 : 400,
              }}
            >
              {value}
            </Box>
          );
        },
      },
      {
        accessorKey: "departure_date",
        header: t("columns.departureDate"),
        size: 120,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "return_date",
        header: t("columns.returnDate"),
        size: 120,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "price",
        header: t("price"),
        size: 130,
        Cell: ({ row, cell }) => {
          const amount = cell.getValue();
          const currency = row.original.currency || "USD";
          const symbol = CURRENCY_SYMBOLS[currency] || currency;
          return `${symbol}${Number(amount ?? 0).toFixed(2)}`;
        },
      },
      {
        accessorKey: "contract_number",
        header: t("columns.contractNo") ?? "şertnama №",
        size: 110,
      },
      {
        accessorKey: "contract_date",
        header: t("columns.contractDate"),
        size: 120,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "note",
        header: t("columns.note"),
        size: 200,
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
    columns,
    data: referralLetters,
    state: {
      ...defaultMrtOptions.state,
      rowSelection,
      isLoading: isLoading || isFetching,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
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

  return (
    <>
      <PageHeader
        title={t("referralLetter.title")}
        pageTitle={`${t("referralLetter.title")} | Oguz Travel`}
        addButtonText={t("referralLetter.add")}
        filterButtonText={t("filter")}
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
        <ReferralLetterFilter
          filters={draft}
          selectsOpen={selectsOpen}
          onFilterChange={setDraftFilter}
          onSelectOpen={openSelect}
          onSelectClose={closeSelect}
        />
      </FilterDrawer>

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("deleteConfirm")}
      />

      <MaterialReactTable table={table} />
    </>
  );
};

export default ReferalLetter;
