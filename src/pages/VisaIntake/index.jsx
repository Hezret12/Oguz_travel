import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { forwardRef, useCallback, useMemo, useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import { Autocomplete, Box, Button, TextField, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDateFormat } from "../../functions/generalHelpers";
import VisaIntakeModal from "./VisaIntakeModal";
import CreateCountryModal from "./Contents/CreateCountryModal";
import EditCountryModal from "./Contents/EditCountryModal";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import DeleteDialog from "../../components/DeleteDialog";
import CustomTabs from "../../components/CustomTabs";
import { useGet } from "../../hooks/CRUD/useGet";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";
import { usePageFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { deleteVisaApi, deleteCountryApi } from "../../api/queries/delete";
import {
  getAllVisasApi,
  getCountriesApi,
  getCountryVisaFieldsApi,
} from "../../api/queries/getters";
import {
  visaIntakeFilterActions,
  visaIntakeFilterSelectors,
} from "../../store/slices/filters/visaIntakeFilterSlice";
import FilterDrawer from "../../components/FilterDrawer";
import VisaIntakeFilter from "./Contents/VisaIntakeFilter";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import StackedCell from "../../components/inputs/StackCell";
import StatusChip from "../../components/StatusChip";
import { PROCESSED_STATUS_CONFIG } from "../../functions/statusChipConfigs";

import {
  sortVisaFields,
  isNotesField,
  isOperatorField,
  isOperator2Field,
  isClientField,
  getVisaFieldLabel,
} from "../../functions/visaCountryFieldConfigs";

const CleanRoot = forwardRef(function CleanRoot(props, ref) {
  const domProps = { ...props };
  delete domProps.renderTags;
  delete domProps.ownerState;
  delete domProps.PaperProps;
  return <div ref={ref} {...domProps} />;
});

const VisaIntake = () => {
  const { t, currentLanguage, selectedLang } = useLocale();
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = getDefaultMRTOptions();

  const [activeTab, setActiveTab] = useState("applications");
  const [isCreateCountryOpen, setIsCreateCountryOpen] = useState(false);

  const { data: rawCountries = [], isLoading: countriesLoading, refetch: refetchCountries } = useGet({
    apiFn: getCountriesApi,
    key: "countries",
  });

  const countries = useMemo(
    () => (Array.isArray(rawCountries) ? rawCountries : []),
    [rawCountries]
  );

  const [selectedCountryGuid, setSelectedCountryGuid] = useState("");

  const currentCountry = useMemo(() => {
    if (selectedCountryGuid) {
      return countries.find((c) => c.guid === selectedCountryGuid) || countries[0];
    }
    return countries[0];
  }, [countries, selectedCountryGuid]);

  const activeCountryGuid = currentCountry?.guid || "";

  const { data: rawVisaFields = [], refetch: refetchVisaFields } = useGet({
    apiFn: () => (activeCountryGuid ? getCountryVisaFieldsApi(activeCountryGuid) : Promise.resolve([])),
    key: ["countryVisaFields", activeCountryGuid],
    options: { enabled: Boolean(activeCountryGuid) },
  });

  const visaFields = useMemo(
    () => sortVisaFields(Array.isArray(rawVisaFields) ? rawVisaFields : []),
    [rawVisaFields]
  );

  const {
    draft,
    queryParams,
    isDrawerOpen,
    openDrawer,
    setDraftFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
    searchQuery,
    setSearch,
    page,
    limit,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    setSort,
    selectsOpen,
    openSelect,
    closeSelect,
  } = usePageFilters({
    actions: visaIntakeFilterActions,
    selectors: visaIntakeFilterSelectors,
  });

  const mergedParams = useMemo(
    () => ({ ...queryParams, countryGuid: activeCountryGuid }),
    [queryParams, activeCountryGuid],
  );

  const {
    data: intakeData = [],
    isLoading: intakeLoading,
    isFetching: intakeFetching,
    refetch: refetchIntake,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllVisasApi,
    key: ["visa-intake", activeCountryGuid],
    params: mergedParams,
  });

  const { mutate: deleteIntake, isPending: isDeletingIntake } = useDelete({
    deleteFn: deleteVisaApi,
    queryKey: ["visa-intake", activeCountryGuid],
    idKey: "guid",
    isPaginated: true,
  });

  const intakeDeleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteIntake(item.guid),
  });

  const handleDeleteIntakeClick = useCallback(
    (item) => intakeDeleteDialog.open(item),
    [intakeDeleteDialog],
  );

  const { mutate: deleteCountry, isPending: isDeletingCountry } = useDelete({
    deleteFn: deleteCountryApi,
    queryKey: "countries",
    idKey: "guid",
    isPaginated: false,
  });

  const countryDeleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteCountry(item.guid),
  });

  const handleDeleteCountryClick = useCallback(
    (item) => countryDeleteDialog.open(item),
    [countryDeleteDialog],
  );

  const visaColumns = useMemo(() => {
    const indexCol = {
      accessorFn: (row) => row.index_number,
      id: "index_number",
      header: "№",
      size: 10,
      enableSorting: false,
    };

    const dateField = visaFields.find(
      (f) => f.fieldKey === "application_date" || f.fieldKey === "date"
    );
    const dateLabel = dateField
      ? selectedLang(dateField.labelTm) || dateField.labelTm
      : null;

    const dateCol = {
      id: "application_date",
      header: t("visaIntake.fields.applicationDate") || dateLabel || "Arza senesi",
      size: 140,
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
      accessorFn: (row) =>
        row.customFields?.application_date ??
        row.application_date ??
        row.created_at ??
        "",
      Cell: ({ cell }) => {
        const val = cell.getValue();
        return val ? formatChange(val, { dateOnly: true }) : "";
      },
    };

    const operatorCol = {
      id: "accepted_opr_guid",
      header: t("columns.operator"),
      size: 180,
      accessorFn: (row) => row.accepted_operator?.fullName ?? row.operator?.fullName ?? "",
      Cell: ({ row }) => {
        const op = row.original.accepted_operator || row.original.operator;
        const primaryName = op?.fullName || "";
        const secondaryInfo =
          selectedLang(op?.office?.shortName) ||
          op?.office?.shortName ||
          selectedLang(op?.office?.fullName) ||
          "";
        return <StackedCell primary={primaryName} secondary={secondaryInfo} />;
      },
    };

    const operator2Col = {
      id: "received_opr_guid",
      header: t("columns.operatorTwo"),
      size: 180,
      accessorFn: (row) => row.receiver_operator?.fullName ?? row.operator2?.fullName ?? "",
      Cell: ({ row }) => {
        const op2 = row.original.receiver_operator || row.original.operator2;
        const primaryName = op2?.fullName || "";
        const secondaryInfo =
          selectedLang(op2?.office?.shortName) ||
          op2?.office?.shortName ||
          selectedLang(op2?.office?.fullName) ||
          "";
        return <StackedCell primary={primaryName} secondary={secondaryInfo} />;
      },
    };

    const remainingFields = visaFields.filter((field) => {
      const key = field.fieldKey;
      return (
        key !== "application_date" &&
        key !== "date" &&
        key !== "note" &&
        !isNotesField(field) &&
        !isOperatorField(field) &&
        !isOperator2Field(field)
      );
    });

    const remainingCols = remainingFields.map((field) => {
      const fieldKey = field.fieldKey;
      const label =
        getVisaFieldLabel(field, currentLanguage) ||
        selectedLang(field.labelTm) ||
        field.labelTm ||
        fieldKey;

      if (fieldKey === "client_guid" || isClientField(field)) {
        return {
          id: "client",
          header: t("columns.client") || "Müşderi",
          size: 200,
          accessorFn: (row) => row.client?.fullName ?? row.client_full_name ?? "",
          Cell: ({ row }) => {
            const clientObj = row.original.client;
            const primaryName = clientObj?.fullName || row.original.client_full_name;
            const secondaryInfo =
              clientObj?.phone_number || clientObj?.passport_number || row.original.passport_number;
            return <StackedCell primary={primaryName} secondary={secondaryInfo} />;
          },
        };
      }

      if (fieldKey === "is_processed") {
        return {
          id: fieldKey,
          header: label,
          size: 140,
          muiTableHeadCellProps: { align: "center" },
          muiTableBodyCellProps: { align: "center" },
          accessorFn: (row) => row.customFields?.[fieldKey] ?? row[fieldKey] ?? "",
          Cell: ({ cell }) => {
            const val = cell.getValue();
            if (val === undefined || val === null || val === "") return "";
            return <StatusChip status={val} config={PROCESSED_STATUS_CONFIG} size="small" />;
          },
        };
      }

      return {
        id: fieldKey,
        header: label,
        size: 140,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        accessorFn: (row) => row.customFields?.[fieldKey] ?? row[fieldKey] ?? "",
        Cell: ({ cell }) => {
          const val = cell.getValue();
          if (field.fieldType === "date" && val) {
            return formatChange(val, { dateOnly: true });
          }
          return val ?? "";
        },
      };
    });

    const notesField = visaFields.find((f) => f.fieldKey === "note" || f.fieldKey === "notes" || isNotesField(f));
    const notesLabel = notesField ? getVisaFieldLabel(notesField, currentLanguage) : null;

    const notesColumn = {
      id: "note",
      header: t("columns.note") || notesLabel || "Bellik",
      size: 200,
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
      accessorFn: (row) =>
        row.note ??
        row.notes ??
        row.customFields?.note ??
        row.customFields?.notes ??
        row.customFields?.bellik ??
        row.customFields?.bellikler ??
        row.bellik ??
        row.bellikler ??
        "",
      Cell: ({ cell }) => cell.getValue() ?? "",
    };

    const actionsColumn = {
      id: "actions",
      header: t("columns.actions") || "Sazlamalar",
      size: 100,
      enableSorting: false,
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
      Cell: ({ row, table }) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ColumnActionButtons
            row={row}
            table={table}
            onDelete={handleDeleteIntakeClick}
          />
        </Box>
      ),
    };

    return [
      indexCol,
      dateCol,
      operatorCol,
      operator2Col,
      ...remainingCols,
      notesColumn,
      actionsColumn,
    ];
  }, [visaFields, t, currentLanguage, selectedLang, formatChange, handleDeleteIntakeClick]);

  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({
        label: selectedLang(c.nameTm) || c.nameTm,
        value: c.guid,
        countryObj: c,
      })),
    [countries, selectedLang],
  );

  const selectedCountryOption = useMemo(
    () => countryOptions.find((c) => c.value === activeCountryGuid) || countryOptions[0] || null,
    [countryOptions, activeCountryGuid],
  );

  const visaTable = useMaterialReactTable({
    ...defaultMrtOptions,
    columns: visaColumns,
    data: intakeData,
    enableColumnPinning: true,
    initialState: {
      ...defaultMrtOptions.initialState,
      columnPinning: {
        right: ["actions"],
      },
    },
    state: {
      isLoading: intakeLoading,
      showProgressBars: intakeFetching,
      sorting: sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : [],
    },
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function"
          ? updater(sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : [])
          : updater;
      if (nextSorting && nextSorting.length > 0) {
        setSort(nextSorting[0].id, nextSorting[0].desc ? "desc" : "asc");
      } else {
        setSort(null, null);
      }
    },
    renderCreateRowDialogContent: ({ table }) => (
      <VisaIntakeModal
        mode="add"
        table={table}
        country={selectedCountryOption?.label || ""}
        countryGuid={activeCountryGuid}
      />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <VisaIntakeModal
        mode="edit"
        table={table}
        row={row}
        country={selectedCountryOption?.label || ""}
        countryGuid={activeCountryGuid}
      />
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <GlobalSearchInput
          value={searchQuery}
          onChange={setSearch}
          placeholder={t("search")}
          onRefetch={refetchIntake}
          isFetching={intakeFetching}
        />

        <Autocomplete
          slots={{ root: CleanRoot }}
          options={countryOptions}
          value={selectedCountryOption}
          onChange={(_, val) => {
            if (val) {
              setSelectedCountryGuid(val.value);
            }
          }}
          getOptionLabel={(option) => option.label || ""}
          isOptionEqualToValue={(opt, val) => opt.value === val?.value}
          disableClearable
          size="small"
          sx={{ width: 200 }}
          renderInput={(params) => {
            const { slotProps: paramsSlotProps, ...textFieldProps } = params;
            return (
              <TextField
                {...textFieldProps}
                size="small"
                placeholder={t("visa.selectCountry") || "Ýurt saýlaň"}
                slotProps={paramsSlotProps}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "40px",
                  },
                }}
              />
            );
          }}
        />

        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateCountryOpen(true)}
          sx={{
            borderRadius: "10px",
            height: "40px",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("visaIntake.createCountry") || "Ýurt Goş"}
        </Button>
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
      <Pagination
        totalItems={totalItems}
        page={page}
        limit={limit}
        setPage={setPage}
        setPageSize={setPageSize}
      />
    ),
  });

  const countryColumns = useMemo(
    () => [
      {
        accessorFn: (_, index) => index + 1,
        id: "index_number",
        header: "№",
        size: 50,
      },
      {
        accessorKey: "nameTm",
        header: t("columns.countryNameTm") || "Ýurt ady (TM)",
        size: 180,
      },
      {
        accessorKey: "nameRu",
        header: t("columns.countryNameRu") || "Ýurt ady (RU)",
        size: 180,
      },
      {
        accessorKey: "nameEn",
        header: t("columns.countryNameEn") || "Ýurt ady (EN)",
        size: 180,
      },
      {
        id: "actions",
        header: t("columns.actions") || "Sazlamalar",
        size: 120,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<EditIcon style={{ fontSize: 16 }} />}
              onClick={() => table.setEditingRow(row)}
              sx={{ borderRadius: "8px", textTransform: "none", py: 0.5, px: 1.2, fontWeight: 600 }}
            >
              {t("edit") || "Özgert"}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon style={{ fontSize: 16 }} />}
              onClick={() => handleDeleteCountryClick(row.original)}
              sx={{ borderRadius: "8px", textTransform: "none", py: 0.5, px: 1.2, fontWeight: 600 }}
            >
              {t("delete") || "Pozny"}
            </Button>
          </Box>
        ),
      },
    ],
    [t, handleDeleteCountryClick],
  );

  const countryTable = useMaterialReactTable({
    ...defaultMrtOptions,
    enableTopToolbar: false,
    columns: countryColumns,
    data: countries,
    enableColumnPinning: true,
    initialState: {
      ...defaultMrtOptions.initialState,
      columnPinning: {
        right: ["actions"],
      },
    },
    state: {
      isLoading: countriesLoading,
    },
    renderCreateRowDialogContent: ({ table }) => (
      <CreateCountryModal
        open={true}
        onClose={() => table.setCreatingRow(null)}
        onRefresh={() => {
          refetchCountries();
          refetchVisaFields();
        }}
      />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <EditCountryModal
        table={table}
        row={row}
        onRefresh={() => {
          refetchCountries();
          refetchVisaFields();
        }}
      />
    ),
  });

  const tabOptions = useMemo(
    () => [
      { value: "applications", label: t("visaIntake.title") || "Wiza Arzalary" },
      { value: "countries", label: t("visaIntake.countriesManagement") || "Ýurtlar Sazlamalary" },
    ],
    [t],
  );

  return (
    <>
      <PageHeader
        pageTitle={`${t("visaIntake.title") || "Wiza Arzalary"} | Oguz Travel`}
      />

      <Paper
        sx={{
          mb: 2.5,
          p: 1.25,
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
        elevation={0}
      >
        <CustomTabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          tabs={tabOptions}
          variant="pills"
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {activeTab === "applications" && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<FilterListIcon />}
              onClick={openDrawer}
              sx={{
                borderRadius: "10px",
                height: "40px",
                px: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {t("filter") || "Filter"}
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={
              activeTab === "applications"
                ? () => visaTable.setCreatingRow(true)
                : () => countryTable.setCreatingRow(true)
            }
            sx={{
              borderRadius: "10px",
              height: "40px",
              px: 2.5,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
            }}
          >
            {activeTab === "applications"
              ? t("visaIntake.addApplication") || "Arza Goş"
              : t("visaIntake.createCountry") || "Täze Ýurt Goş"}
          </Button>
        </Box>
      </Paper>

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
        open={intakeDeleteDialog.isOpen}
        onClose={intakeDeleteDialog.close}
        onConfirm={intakeDeleteDialog.confirm}
        isLoading={isDeletingIntake}
      />

      <DeleteDialog
        open={countryDeleteDialog.isOpen}
        onClose={countryDeleteDialog.close}
        onConfirm={countryDeleteDialog.confirm}
        isLoading={isDeletingCountry}
      />

      {activeTab === "applications" && (
        <MaterialReactTable table={visaTable} />
      )}

      {activeTab === "countries" && (
        <MaterialReactTable table={countryTable} />
      )}

      {isCreateCountryOpen && (
        <CreateCountryModal
          open={isCreateCountryOpen}
          onClose={() => setIsCreateCountryOpen(false)}
          onRefresh={() => {
            refetchCountries();
            refetchVisaFields();
          }}
        />
      )}
    </>
  );
};

export default VisaIntake;
