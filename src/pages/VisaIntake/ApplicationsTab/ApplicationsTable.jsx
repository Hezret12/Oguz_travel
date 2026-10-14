import {
  useCallback,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  startTransition,
} from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Alert,
  Box,
  Button,
  Chip,
  Badge,
} from "@mui/material";
import { Funnel, Globe, RotateCw } from "lucide-react";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useDateFormat } from "../../../functions/generalHelpers";
import {
  getAllReceivingsApi,
  getAllEmployeeApi,
  getCountriesApi,
  getCountryVisaFieldsApi,
} from "../../../api/queries/getters";
import { fetchAllPaginatedData } from "../../../functions/excelExportHelper";
import { deleteReceivingApi } from "../../../api/queries/delete";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import StatusChip from "../../../components/StatusChip";
import TableEmptyState from "../../../components/TableEmptyState";
import { sortVisaFields, isNotesField } from "../../../functions/visaCountryFieldConfigs";
import { VISA_STATUS_CONFIG } from "../../../functions/statusChipConfigs";
import VisaIntakeModal from "./VisaIntakeModal";
import CountrySelect from "./Contents/CountrySelect";
import ExportExcelButton from "../../../components/ExportExcelButton";
import DateRangeExcelExportModal from "../../../components/Dialog/DateRangeExcelExportModal";
import { exportVisaIntakeExcel } from "../functions/exportVisaIntakeExcel";

// Excel export filters on the application date (backend: start_date / end_date).
const EXPORT_RANGES = [
  {
    key: "application",
    titleKey: "visaIntake.fields.applicationDate",
    startParamKey: "start_date",
    endParamKey: "end_date",
    defaultPreset: "thisMonth",
  },
];
// The receivings endpoint returns up to 500 rows per request.
const EXPORT_PAGE_SIZE = 500;

// Field keys that already have a dedicated column, so they're never rendered
// again as a dynamic country field.
const STANDARD_KEYS = new Set([
  "index_number",
  "client_guid",
  "client",
  "passport_number",
  "dateOfBirth",
  "accepted_opr_guid",
  "operator_guid",
  "operator",
  "office",
  "application_date",
  "status",
  "note",
  "notes",
  "actions",
]);

// Past this many columns the table renders them virtually (see `isVirtualized`).
const VIRTUALIZE_FROM_COLUMNS = 20;

const parseCustomFieldValues = (raw) => {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof raw === "object" ? raw : {};
};

const isEmptyValue = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0);

const firstFilled = (...values) => values.find((v) => !isEmptyValue(v));

export const ApplicationsTable = forwardRef(
  (
    {
      queryParams = {},
      searchQuery = "",
      setSearch,
      openDrawer,
      country = null,
      onCountryChange,
      isFilterActive = false,
      page = 1,
      setPage,
    },
    ref,
  ) => {
    const { t, selectedLang } = useLocale();
    const { formatChange } = useDateFormat();
    const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);

    // The picker hands back the full country object, so its custom_fields are
    // available even when it isn't in any cached list page.
    const selectedCountry = country;
    const activeCountryGuid = country?.guid || "";

    // Labels may arrive as a plain string (field_label / labelTm) or as a
    // { tk, ru, en } object — selectedLang alone returns undefined for strings.
    const resolveLabel = useCallback(
      (label) => {
        if (!label) return "";
        if (typeof label === "string") return label;
        if (typeof label === "object") {
          return selectedLang(label) || label.tk || label.ru || label.en || "";
        }
        return String(label);
      },
      [selectedLang],
    );

    const resolveFieldLabel = useCallback(
      (field) => resolveLabel(field?.field_label || field?.label),
      [resolveLabel],
    );

    // Never hand a raw object/array to a cell — React throws on it.
    const toDisplayText = useCallback(
      (value) => {
        if (isEmptyValue(value)) return "-";
        if (Array.isArray(value)) {
          return (
            value
              .filter((v) => !isEmptyValue(v))
              .map((v) => (typeof v === "object" ? resolveLabel(v) : String(v)))
              .join(", ") || "-"
          );
        }
        if (typeof value === "boolean") return value ? "✓" : "-";
        if (typeof value === "object") return resolveLabel(value) || "-";
        return String(value);
      },
      [resolveLabel],
    );

    const getOfficeLabel = useCallback(
      (office) =>
        selectedLang(office?.shortName) || selectedLang(office?.fullName) || "",
      [selectedLang],
    );

    const {
      data: rawCountryFields = [],
      isSuccess: countryFieldsLoaded,
      isError: isFieldsError,
      isFetching: isFieldsFetching,
      refetch: refetchFields,
    } = useGet({
      apiFn: () =>
        activeCountryGuid
          ? getCountryVisaFieldsApi(activeCountryGuid)
          : Promise.resolve([]),
      key: ["countryVisaFields", activeCountryGuid],
      options: { enabled: Boolean(activeCountryGuid) },
    });

    // The picker's copy of custom_fields is only a stand-in until the fresh
    // (mutation-invalidated) field list arrives — an empty fresh list is a
    // real answer, not a reason to fall back to a possibly stale one.
    const sortedFields = useMemo(() => {
      const apiList = countryFieldsLoaded
        ? rawCountryFields
        : selectedCountry?.custom_fields || [];
      return sortVisaFields(Array.isArray(apiList) ? apiList : []);
    }, [countryFieldsLoaded, rawCountryFields, selectedCountry]);

    // The operator's name comes with the record itself; this list fills in a
    // missing name and the office of a record saved without one, and covers every
    // employee who can take an application so a short page doesn't miss any.
    const employeeParams = useMemo(() => ({ page: 1, limit: 500 }), []);
    const { data: employees = [] } = useGet({
      apiFn: getAllEmployeeApi,
      key: "employees",
      params: employeeParams,
    });

    const employeeMap = useMemo(() => {
      const map = new Map();
      const list = Array.isArray(employees) ? employees : [];
      list.forEach((emp) => {
        if (emp.guid) {
          map.set(emp.guid, {
            fullName: emp.fullName,
            office: getOfficeLabel(emp.office),
          });
        }
      });
      return map;
    }, [employees, getOfficeLabel]);

    const params = useMemo(
      () => ({
        country_guid: activeCountryGuid || undefined,
        ...queryParams,
      }),
      [activeCountryGuid, queryParams],
    );

    const {
      data: rawApplicationsData = [],
      isLoading,
      isFetching,
      isError: isApplicationsError,
      refetch,
      totalItems = 0,
      pageCount = 1,
    } = usePagginationGet({
      apiFn: getAllReceivingsApi,
      key: "receivings",
      params,
      options: {
        enabled: Boolean(activeCountryGuid),
        // Keep the previous page only while paging/filtering inside the same
        // country. Across countries the old rows don't match the new columns
        // (and could be opened for edit with the wrong field set), so show
        // the loading skeleton instead.
        placeholderData: (previousData, previousQuery) =>
          previousQuery?.queryKey?.[1]?.country_guid === activeCountryGuid
            ? previousData
            : undefined,
      },
    });

    // Normalize once per data/lookup change so column accessors stay plain
    // lookups, and so a new `data` reference re-renders rows whenever the
    // employee lookup or language changes.
    const applicationsData = useMemo(() => {
      if (!activeCountryGuid || !Array.isArray(rawApplicationsData)) return [];
      return rawApplicationsData.map((row) => {
        const oprGuid = row.accepted_opr_guid || row.operator_guid;
        // The record's own operator name comes first (create/update answers
        // carry it through the Sequelize include); the employee list fills in
        // the list endpoint's null.
        const known = (oprGuid && employeeMap.get(oprGuid)) || null;
        const fullName =
          row.operator_fullName || row.operator?.fullName || known?.fullName || "";
        // The office the application was taken in; one saved without it shows
        // its operator's office.
        const ownOffice = row.office_fullName || row.office_shortName;
        const office =
          (ownOffice ? toDisplayText(ownOffice) : "") ||
          getOfficeLabel(row.office) ||
          known?.office ||
          getOfficeLabel(row.operator?.office);

        return {
          ...row,
          custom_field_values: parseCustomFieldValues(row.custom_field_values),
          __operator: fullName ? { fullName } : null,
          __office: office || "",
        };
      });
    }, [activeCountryGuid, rawApplicationsData, employeeMap, getOfficeLabel, toDisplayText]);

    const handleCountrySelect = useCallback(
      (newCountry) => {
        startTransition(() => {
          onCountryChange?.(newCountry);
          setPage?.(1);
        });
      },
      [onCountryChange, setPage],
    );

    const { mutate: deleteReceiving, isPending: isDeleting } = useDelete({
      deleteFn: deleteReceivingApi,
      queryKey: "receivings",
      idKey: "guid",
      isPaginated: true,
    });

    const deleteDialog = useDeleteDialog({
      onConfirm: (item) => deleteReceiving(item.guid),
    });
    // Only `open` belongs in the column deps; the dialog object itself changes
    // every time it opens or closes, which would rebuild every column with it.
    const handleDeleteClick = deleteDialog.open;

    // Export covers every country: one sheet each, built from that country's
    // own fields, so the country list (with fields) is loaded once per export.
    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportFn = useCallback(
      async (items, opts) => {
        const countries = await fetchAllPaginatedData(getCountriesApi, {}, null, 100);
        return exportVisaIntakeExcel(items, { ...opts, countries, resolveLabel });
      },
      [resolveLabel],
    );

    // Columns Definition
    const columns = useMemo(() => {
      const cols = [
        {
          accessorKey: "index_number",
          id: "index_number",
          header: "№",
          size: 50,
          enableSorting: false,
        },
      ];

      const fieldMap = new Map();
      if (Array.isArray(sortedFields)) {
        sortedFields.forEach((f) => {
          const key = f.fieldKey || f.field_key || f.guid;
          if (key) fieldMap.set(key, f);
        });
      }

      // 1. Application Date
      const appDateField = fieldMap.get("application_date");
      const appDateLabel =
        resolveFieldLabel(appDateField) || t("visaIntake.fields.applicationDate");

      cols.push({
        id: "application_date",
        header: appDateLabel,
        size: 100,
        accessorFn: (row) =>
          row.application_date ?? row.custom_field_values?.application_date,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      });

      // 2. Office
      cols.push({
        id: "office",
        header: t("columns.office"),
        size: 110,
        accessorFn: (row) => row.__office || "-",
      });

      // 3. Operator
      const acceptedOprField = fieldMap.get("accepted_opr_guid");
      const acceptedOprLabel =
        resolveFieldLabel(acceptedOprField) || t("visaIntake.fields.operator");

      cols.push({
        id: "accepted_opr_guid",
        header: acceptedOprLabel,
        size: 180,
        accessorFn: (row) => row.__operator?.fullName || "-",
      });

      // 4. Client
      const clientField = fieldMap.get("client_guid");
      const clientLabel =
        resolveFieldLabel(clientField) || t("columns.client");

      // Every cell goes through `toDisplayText`: the list endpoint sends plain
      // strings today, but a name that ever arrives as a { tk, ru, en } object
      // would be handed straight to React and throw.
      cols.push({
        id: "client",
        header: clientLabel,
        size: 220,
        accessorFn: (row) => toDisplayText(row.client?.fullName || row.client_name),
      });

      // 5. Client Details (Passport, Date of Birth)
      cols.push({
        id: "passport_number",
        header: t("columns.passportNumber"),
        size: 110,
        accessorFn: (row) =>
          toDisplayText(row.passport_number || row.client?.passport_number),
      });

      cols.push({
        id: "dateOfBirth",
        header: t("columns.dateOfBirth"),
        size: 110,
        accessorFn: (row) =>
          row.dateOfBirth ||
          row.client?.dateOfBirth ||
          row.custom_field_values?.dateOfBirth,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      });

      // 6. Status
      cols.push({
        id: "status",
        header: t("columns.visaStatus"),
        size: 130,
        accessorFn: (row) => row.status,
        Cell: ({ cell }) => (
          <StatusChip status={cell.getValue()} config={VISA_STATUS_CONFIG} />
        ),
      });

      // 7. Dynamic Fields (All dynamic country-specific fields in order)
      const usedKeys = new Set(STANDARD_KEYS);

      sortedFields.forEach((field) => {
        const fieldKey = field.fieldKey || field.field_key || field.guid;
        // Skip standard keys and duplicates — a repeated column id breaks MRT.
        // A field with no key at all is skipped too: the backend stores
        // custom_field_values by `field_key`, so a made-up id could never match
        // a stored value and the column would always be empty.
        if (!fieldKey || usedKeys.has(fieldKey) || isNotesField(field)) return;
        usedKeys.add(fieldKey);

        const headerLabel = resolveFieldLabel(field) || fieldKey;
        const getValue = (row) => row.custom_field_values?.[fieldKey];

        if (field.fieldType === "date") {
          cols.push({
            id: fieldKey,
            header: headerLabel,
            size: 130,
            accessorFn: getValue,
            Cell: ({ cell }) =>
              formatChange(cell.getValue(), { dateOnly: true }),
          });
        } else if (field.fieldType === "select") {
          // The form stores the option *value*; show its label instead.
          const optionLabels = new Map(
            (Array.isArray(field.options) ? field.options : []).map((opt) =>
              opt !== null && typeof opt === "object"
                ? [String(opt.value), resolveLabel(opt.label) || String(opt.value)]
                : [String(opt), String(opt)],
            ),
          );

          cols.push({
            id: fieldKey,
            header: headerLabel,
            size: 140,
            accessorFn: (row) => {
              const value = getValue(row);
              if (isEmptyValue(value)) return "-";
              const values = Array.isArray(value) ? value : [value];
              return values
                .map((v) => optionLabels.get(String(v)) ?? toDisplayText(v))
                .join(", ");
            },
            Cell: ({ cell }) => {
              const val = cell.getValue();
              if (val === "-") return "-";
              return (
                <Chip
                  label={val}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600, borderRadius: "6px" }}
                />
              );
            },
          });
        } else {
          cols.push({
            id: fieldKey,
            header: headerLabel,
            size: 150,
            accessorFn: (row) => toDisplayText(getValue(row)),
          });
        }
      });

      // 8. Note (ALWAYS after all dynamic fields, at the end before actions)
      const noteField = fieldMap.get("note") || sortedFields.find(isNotesField);
      const noteLabel = resolveFieldLabel(noteField) || t("columns.note");

      cols.push({
        id: "note",
        header: noteLabel,
        size: 160,
        accessorFn: (row) =>
          toDisplayText(
            firstFilled(
              row.note,
              row.notes,
              row.custom_field_values?.note,
              row.custom_field_values?.notes,
            ),
          ),
      });
      cols.push({
        id: "actions",
        header: t("columns.actions"),
        size: 100,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ColumnActionButtons
              row={row}
              table={table}
              onDelete={handleDeleteClick}
            />
          </Box>
        ),
      });

      return cols;
    }, [
      sortedFields,
      resolveLabel,
      resolveFieldLabel,
      toDisplayText,
      t,
      formatChange,
      handleDeleteClick,
    ]);

    // MRT only recomputes column order when the column *count* changes, so
    // switching between two countries with the same number of fields would
    // append the new country's columns after "note". Drive it explicitly.
    const columnOrder = useMemo(() => columns.map((c) => c.id), [columns]);

    // A country may define up to ~30 fields, which with the standard columns is
    // close to 40 across 40 rows. Virtualising those pays off, but it costs on
    // the narrow countries, and MRT decides it with a hook inside its own table
    // component — flipping the flag in place would change that component's hook
    // count and crash, so the table is remounted by `key` when it flips.
    const isVirtualized = columns.length > VIRTUALIZE_FROM_COLUMNS;

    const table = useMaterialReactTable({
      ...defaultMrtOptions,
      // Avoids nesting MRT's own create/edit <Dialog> around the one this
      // page's Add/Edit modal already renders — see Translate/index.jsx for
      // the full rationale.
      createDisplayMode: "custom",
      editDisplayMode: "custom",
      // No memoMode: "rows" — MRT's row memo only compares the row object, so
      // rows kept stale cells whenever columns changed with the same data
      // (country switch, late employee lookup). With 20 rows/page it bought
      // nothing measurable.
      getRowId: (row, index) => row.guid ?? String(index),
      autoResetPageIndex: false,
      muiTablePaperProps: {
        sx: (theme) => ({
          display: "flex",
          flexDirection: "column",
          width: "100%",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
          boxShadow: "none",
          borderRadius: "12px",
          overflow: "hidden",
          height: "calc(100vh - 238px)",
        }),
      },
      enableColumnPinning: true,
      enableColumnVirtualization: isVirtualized,
      initialState: {
        columnPinning: {
          left: ["index_number"],
          right: ["actions"],
        },
      },
      columns,
      data: applicationsData,
      state: {
        columnOrder,
        isLoading: Boolean(activeCountryGuid && isLoading),
        showSkeletons: Boolean(activeCountryGuid && isLoading),
      },
      enablePagination: false,
      enableBottomToolbar: Boolean(activeCountryGuid),
      // A failed request must not read as "no applications": the service answers
      // with HTTP 500 on failure (ResponseInterceptor copies the body status),
      // so the error is the one thing worth showing here.
      renderEmptyRowsFallback: () => {
        if (activeCountryGuid && isApplicationsError) {
          return (
            <Box sx={{ p: 2 }}>
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    startIcon={<RotateCw size={14} />}
                  >
                    {t("errorBoundary.retry")}
                  </Button>
                }
              >
                {t("errorOccurred")}
              </Alert>
            </Box>
          );
        }
        return !activeCountryGuid ? (
          <TableEmptyState
            icon={Globe}
            title={t("visaIntake.selectCountryPrompt")}
            description={t("visaIntake.selectCountryDescription")}
          />
        ) : (
          <TableEmptyState />
        );
      },
      renderBottomToolbarCustomActions: () => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            px: 2,
            py: 0.75,
          }}
        >
          <Box />
          <Pagination
            pageIndex={page - 1}
            pageCount={pageCount}
            totalRows={totalItems}
            onPageChange={(newIndex) => setPage?.(newIndex + 1)}
          />
        </Box>
      ),
      renderTopToolbarCustomActions: () => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
            p: 0.5,
          }}
        >
          <GlobalSearchInput
            value={searchQuery}
            onChange={setSearch}
            placeholder={t("search")}
            onRefetch={refetch}
            isFetching={isFetching}
          />
          <Badge color="primary" variant="dot" invisible={!isFilterActive}>
            <Button
              variant="outlined"
              startIcon={<Funnel size={16} style={{ opacity: 0.8 }} />}
              onClick={openDrawer}
              sx={{
                height: "40px",
                px: 2.5,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                letterSpacing: "0.1px",
                borderColor: isFilterActive ? "primary.main" : "divider",
                color: isFilterActive ? "primary.main" : "text.primary",
                backgroundColor: (theme) =>
                  isFilterActive
                    ? theme.palette.mode === "dark"
                      ? "rgba(20, 184, 166, 0.12)"
                      : "rgba(14, 133, 132, 0.08)"
                    : theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.04)"
                    : "rgba(0, 0, 0, 0.02)",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 2px 8px rgba(0, 0, 0, 0.32)"
                    : "0 1px 4px rgba(0, 0, 0, 0.04)",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.05)",
                  borderColor: isFilterActive
                    ? "primary.light"
                    : (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.20)"
                          : "rgba(0, 0, 0, 0.18)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {t("filter")}
            </Button>
          </Badge>

          <CountrySelect
            value={selectedCountry}
            onChange={handleCountrySelect}
          />

          <ExportExcelButton onClick={() => setIsExportOpen(true)} />
        </Box>
      ),
    });

    useImperativeHandle(
      ref,
      () => ({
        openCreateModal: () => table.setCreatingRow(true),
      }),
      [table],
    );

    const editingRow = table.getState().editingRow;

    return (
      <>
        {Boolean(table.getState().creatingRow) && (
          <VisaIntakeModal
            table={table}
            onRefresh={refetch}
            countryGuid={activeCountryGuid}
          />
        )}

        {/* The record's own country wins — editing it with another country's
            field set would rewrite its custom_field_values. */}
        {Boolean(editingRow) && (
          <VisaIntakeModal
            table={table}
            row={editingRow}
            onRefresh={refetch}
            countryGuid={editingRow.original?.country_guid || activeCountryGuid}
          />
        )}

        {/* Without the field list the country's own columns are missing, and the
            rows underneath look empty rather than broken. */}
        {isFieldsError && (
          <Alert
            severity="warning"
            sx={{ mb: 1.5 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => refetchFields()}
                disabled={isFieldsFetching}
                startIcon={<RotateCw size={14} />}
              >
                {t("errorBoundary.retry")}
              </Button>
            }
          >
            {t("visaIntake.fieldsLoadError")}
          </Alert>
        )}

        <MaterialReactTable key={isVirtualized ? "virtual" : "plain"} table={table} />

        {isExportOpen && (
          <DateRangeExcelExportModal
            open={isExportOpen}
            close={() => setIsExportOpen(false)}
            apiFn={getAllReceivingsApi}
            exportFn={exportFn}
            title={`${t("visaIntake.title")} ${t("common.exportReportSuffix")}`}
            fileName="Wiza_arzalary"
            ranges={EXPORT_RANGES}
            pageSize={EXPORT_PAGE_SIZE}
          />
        )}

        <DeleteDialog
          open={deleteDialog.isOpen}
          onClose={deleteDialog.close}
          onConfirm={deleteDialog.confirm}
          loading={isDeleting}
          title={t("visaIntake.deleteApplicationTitle")}
          description={t("visaIntake.deleteApplicationDescription")}
        />
      </>
    );
  },
);

ApplicationsTable.displayName = "ApplicationsTable";

export default ApplicationsTable;
