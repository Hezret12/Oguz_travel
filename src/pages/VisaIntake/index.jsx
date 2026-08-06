import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useCallback, useMemo, useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import { Autocomplete, Box, Chip, TextField } from "@mui/material";
import { useDateFormat } from "../../functions/generalHelpers";
import VisaIntakeModal from "./VisaIntakeModal";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import DeleteDialog from "../../components/DeleteDialog";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";
import { usePageFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import {
  getAllVisaIntakeApi,
  deleteVisaIntakeApi,
} from "../../api/queries/visaIntakeApi";
import {
  visaIntakeFilterActions,
  visaIntakeFilterSelectors,
} from "../../store/slices/filters/visaIntakeFilterSlice";
import FilterDrawer from "../../components/FilterDrawer";
import VisaIntakeFilter from "./Contents/VisaIntakeFilter";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import StackedCell from "../../components/inputs/StackCell";
import StatusChip from "../../components/StatusChip";
import {
  VISA_CATEGORY_CONFIG,
  PROCESSED_STATUS_CONFIG,
} from "../../functions/statusChipConfigs";
import {
  VISA_COUNTRY_CONFIGS,
  VISA_COUNTRY_OPTIONS,
  VISA_FIELD_DEFS,
} from "../../functions/visaCountryFieldConfigs";

// ─── localStorage key for persisting selected country ─────────────────────────
const STORAGE_KEY = "oguz_visa_intake_country";

const getInitialCountry = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VISA_COUNTRY_CONFIGS[saved]) return saved;
  } catch {
    /* ignore */
  }
  return "UZB";
};

// ─── Column builder: maps field keys → MRT column defs ────────────────────────
const buildColumnsForCountry = (countryKey, t, selectedLang, formatChange) => {
  const config = VISA_COUNTRY_CONFIGS[countryKey];
  if (!config) return [];

  const fieldColumns = config.fields.map((fieldKey) => {
    const def = VISA_FIELD_DEFS[fieldKey];
    if (!def) return null;

    const base = {
      id: fieldKey,
      header: t(def.labelKey) || fieldKey,
      size: fieldKey === "notes" || fieldKey === "booking_datetime" ? 180 : 130,
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
    };

    // Client Autocomplete Column
    if (def.type === "client_autocomplete" || fieldKey === "client_guid") {
      return {
        ...base,
        id: "client",
        header: t("columns.client") || "Müşderi",
        size: 200,
        accessorFn: (row) => row.client?.fullName ?? row.client_full_name ?? "",
        Cell: ({ row }) => {
          const clientObj = row.original.client;
          const primaryName = clientObj?.fullName || row.original.client_full_name;
          const secondaryInfo =
            clientObj?.phone_number || clientObj?.passport_number || row.original.passport_number;
          return (
            <StackedCell
              primary={primaryName}
              secondary={secondaryInfo}
            />
          );
        },
      };
    }

    // Relation / Autocomplete fields (e.g., operator, form_filled_by, etc.)
    if (def.type === "autocomplete") {
      return {
        ...base,
        size: 190,
        accessorFn: (row) => {
          const emp = row[fieldKey];
          if (typeof emp === "object" && emp !== null) {
            return emp.fullName ?? emp.shortName ?? emp.name ?? "";
          }
          return emp ?? "";
        },
        Cell: ({ row }) => {
          const emp = row.original[fieldKey];
          if (typeof emp === "object" && emp !== null) {
            const officeName = emp.office?.shortName
              ? selectedLang(emp.office.shortName) || selectedLang(emp.office.fullName)
              : selectedLang(emp.office?.fullName);
            return (
              <StackedCell
                primary={emp.fullName}
                secondary={officeName}
              />
            );
          }
          return emp || "-";
        },
      };
    }

    // Date fields
    if (def.type === "date") {
      return {
        ...base,
        accessorKey: fieldKey,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      };
    }

    // Visa category — StatusChip
    if (fieldKey === "visa_category") {
      return {
        ...base,
        accessorKey: fieldKey,
        Cell: ({ cell }) => (
          <StatusChip
            status={cell.getValue()}
            config={VISA_CATEGORY_CONFIG}
            size="small"
          />
        ),
      };
    }

    // Processed status (KOR/ROM) — StatusChip
    if (fieldKey === "is_processed") {
      return {
        ...base,
        accessorKey: fieldKey,
        Cell: ({ cell }) => (
          <StatusChip
            status={cell.getValue()}
            config={PROCESSED_STATUS_CONFIG}
            size="small"
          />
        ),
      };
    }

    return {
      ...base,
      accessorKey: fieldKey,
    };
  });

  return fieldColumns.filter(Boolean);
};

// ─── Page Component ───────────────────────────────────────────────────────────
const VisaIntakePage = () => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();
  const [rowSelection, setRowSelection] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(getInitialCountry);

  // Persist selected country
  const handleCountryChange = useCallback((_, newValue) => {
    const key = newValue?.value || "UZB";
    setSelectedCountry(key);
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      /* ignore */
    }
  }, []);

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
    actions: visaIntakeFilterActions,
    selectors: visaIntakeFilterSelectors,
  });

  const {
    data: intakeData,
    isLoading,
    isFetching,
    refetch,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllVisaIntakeApi,
    key: ["visa-intake", selectedCountry],
    params: { country: selectedCountry, ...queryParams },
  });

  const rows = useMemo(
    () => intakeData?.data ?? intakeData ?? [],
    [intakeData],
  );

  // Delete — note the different param names per AGENTS.md §1
  const { mutate: deleteIntake, isPending: isDeleting } = useDelete({
    deleteFn: deleteVisaIntakeApi,
    queryKey: ["visa-intake", selectedCountry],
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteIntake(item.guid),
  });

  const handleDeleteClick = (item) => deleteDialog.open(item);

  const activeFilters = useMemo(
    () =>
      Object.entries(applied).filter(
        // eslint-disable-next-line no-unused-vars
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    [applied],
  );

  // Dynamic columns based on selected country
  const columns = useMemo(() => {
    const indexCol = {
      accessorKey: "index_number",
      id: "index_number",
      header: "#",
      size: 50,
      enableSorting: false,
    };

    const actionsCol = {
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
    };

    const dynamicCols = buildColumnsForCountry(selectedCountry, t, selectedLang, formatChange);
    return [indexCol, ...dynamicCols, actionsCol];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, t, selectedLang, formatChange]);

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: rows || [],
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
    initialState: {
      columnPinning: {
        left: ["index_number"],
        right: ["actions"],
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

    renderCreateRowDialogContent: ({ table }) => (
      <VisaIntakeModal
        mode="add"
        table={table}
        country={selectedCountry}
      />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <VisaIntakeModal
        mode="edit"
        table={table}
        row={row}
        country={selectedCountry}
      />
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
        <Autocomplete
          size="small"
          disableClearable
          options={VISA_COUNTRY_OPTIONS}
          value={
            VISA_COUNTRY_OPTIONS.find((o) => o.value === selectedCountry) ||
            VISA_COUNTRY_OPTIONS[0]
          }
          onChange={handleCountryChange}
          getOptionLabel={(opt) => opt.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          sx={{ minWidth: 200 }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("visaIntake.selectCountry") || "Ýurt saýlaň"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
              }}
            />
          )}
        />

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
        title={t("visaIntake.title") || "Kabul ediji bölümi"}
        pageTitle={`${t("visaIntake.title") || "Kabul ediji bölümi"} | Oguz Travel`}
        addButtonText={t("visaIntake.addApplication") || "Arza goşmak"}
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
        <VisaIntakeFilter
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
        description={t("visaIntake.deleteConfirm") || "Siz hakykatdan hem bu arzany pozmak isleýärsiňizmi?"}
      />

      <MaterialReactTable table={table} />
    </>
  );
};

export default VisaIntakePage;
