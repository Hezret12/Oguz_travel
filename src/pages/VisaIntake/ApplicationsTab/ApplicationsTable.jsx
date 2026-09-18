import {
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  startTransition,
} from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  Chip,
  Badge,
} from "@mui/material";
import { Funnel, Globe } from "lucide-react";
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
  getCountryVisaFieldsApi,
} from "../../../api/queries/getters";
import { deleteReceivingApi } from "../../../api/queries/delete";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import StackedCell from "../../../components/inputs/StackCell";
import StatusChip from "../../../components/StatusChip";
import TableEmptyState from "../../../components/TableEmptyState";
import { sortVisaFields, isNotesField } from "../../../functions/visaCountryFieldConfigs";
import { VISA_STATUS_CONFIG } from "../../../functions/statusChipConfigs";
import VisaIntakeModal from "./VisaIntakeModal";
import CountrySelect from "./Contents/CountrySelect";

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
  "application_date",
  "status",
  "note",
  "notes",
  "actions",
]);

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
    const defaultMrtOptions = getDefaultMRTOptions();

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

    const { data: rawCountryFields = [], isSuccess: countryFieldsLoaded } =
      useGet({
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

    const employeeParams = useMemo(() => ({ page: 1, limit: 100 }), []);
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
        const operator = row.operator?.fullName
          ? {
              fullName: row.operator.fullName,
              office: getOfficeLabel(row.operator.office),
            }
          : (oprGuid && employeeMap.get(oprGuid)) || null;

        return {
          ...row,
          custom_field_values: parseCustomFieldValues(row.custom_field_values),
          __operator: operator,
        };
      });
    }, [activeCountryGuid, rawApplicationsData, employeeMap, getOfficeLabel]);

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

    const handleDeleteClick = useCallback(
      (item) => deleteDialog.open(item),
      [deleteDialog],
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

      // 1. Client
      const clientField = fieldMap.get("client_guid");
      const clientLabel =
        resolveFieldLabel(clientField) || t("columns.client");

      cols.push({
        id: "client",
        header: clientLabel,
        size: 220,
        accessorFn: (row) => row.client?.fullName || row.client_name || "-",
      });

      // 2. Client Details (Passport, Date of Birth)
      cols.push({
        id: "passport_number",
        header: t("columns.passportNumber"),
        size: 110,
        accessorFn: (row) => row.passport_number || row.client?.passport_number || "-",
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

      // 3. Operator
      const acceptedOprField = fieldMap.get("accepted_opr_guid");
      const acceptedOprLabel =
        resolveFieldLabel(acceptedOprField) || t("visaIntake.fields.operator");

      cols.push({
        id: "accepted_opr_guid",
        header: acceptedOprLabel,
        size: 200,
        accessorFn: (row) => row.__operator?.fullName || "-",
        Cell: ({ row }) => {
          const emp = row.original.__operator;
          if (!emp?.fullName) return "-";
          return <StackedCell primary={emp.fullName} secondary={emp.office} />;
        },
      });

      // 4. Application Date
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

      // 5. Status
      cols.push({
        id: "status",
        header: t("columns.visaStatus"),
        size: 130,
        accessorFn: (row) => row.status,
        Cell: ({ cell }) => (
          <StatusChip status={cell.getValue()} config={VISA_STATUS_CONFIG} />
        ),
      });

      // 6. Dynamic Fields (All dynamic country-specific fields in order)
      const usedKeys = new Set(STANDARD_KEYS);

      sortedFields.forEach((field, index) => {
        const fieldKey =
          field.fieldKey || field.field_key || field.guid || `col_${index}`;
        // Skip standard keys and duplicates — a repeated column id breaks MRT.
        if (usedKeys.has(fieldKey) || isNotesField(field)) return;
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

      // 7. Note (ALWAYS after all dynamic fields, at the end before actions)
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
      renderEmptyRowsFallback: () =>
        !activeCountryGuid ? (
          <TableEmptyState
            icon={Globe}
            title={t("visaIntake.selectCountryPrompt")}
            description={t("visaIntake.selectCountryDescription")}
          />
        ) : (
          <TableEmptyState />
        ),
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

        <MaterialReactTable table={table} />

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
