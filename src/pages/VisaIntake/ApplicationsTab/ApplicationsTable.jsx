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
  Autocomplete,
  TextField,
  Typography,
} from "@mui/material";
import { Funnel, ChevronDown, Globe } from "lucide-react";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useDateFormat } from "../../../functions/generalHelpers";
import {
  getAllReceivingsApi,
  getCountriesApi,
  getAllEmployeeApi,
  getCountryVisaFieldsApi,
} from "../../../api/queries/getters";
import { deleteReceivingApi } from "../../../api/queries/delete";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import StackedCell from "../../../components/inputs/StackCell";
import TableEmptyState from "../../../components/TableEmptyState";
import { sortVisaFields, isNotesField } from "../../../functions/visaCountryFieldConfigs";
import VisaIntakeModal from "./VisaIntakeModal";

const SelectCountryPrompt = ({ t }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 10,
      px: 3,
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "primary.main",
        color: "primary.contrastText",
        opacity: 0.85,
        boxShadow: "0 8px 24px rgba(21, 101, 192, 0.25)",
      }}
    >
      <Globe size={38} />
    </Box>
    <Box sx={{ textAlign: "center", maxWidth: 440 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t("visaIntake.selectCountryPrompt", "Ýurt saýlaň")}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t(
          "visaIntake.selectCountryDescription",
          "Arzalary görmek üçin ýokardan ýurt saýlaň",
        )}
      </Typography>
    </Box>
  </Box>
);

export const ApplicationsTable = forwardRef(
  (
    {
      queryParams = {},
      searchQuery = "",
      setSearch,
      openDrawer,
      countryGuid,
      onCountryChange,
      isFilterActive = false,
      page = 1,
      limit = 20,
      setPage,
      setPageSize,
    },
    ref,
  ) => {
    const { t, selectedLang } = useLocale();
    const { formatChange } = useDateFormat();
    const defaultMrtOptions = getDefaultMRTOptions();

    const activeCountryGuid = countryGuid || "";

    const countryParams = useMemo(() => ({ page: 1, limit: 100 }), []);
    const { data: countriesData = [] } = usePagginationGet({
      apiFn: getCountriesApi,
      key: "countries",
      params: countryParams,
    });

    const countryOptions = useMemo(() => {
      const list = Array.isArray(countriesData) ? countriesData : [];
      return list.map((c) => {
        const label =
          (typeof c.name === "string" ? c.name : null) ||
          selectedLang(c.name) ||
          c.name?.tk ||
          c.name?.ru ||
          c.name?.en ||
          c.nameTm ||
          c.code ||
          "";
        return {
          guid: c.guid,
          code: c.code,
          label: c.code ? `${label} (${c.code})` : label,
        };
      });
    }, [countriesData, selectedLang]);

    const selectedCountry = useMemo(() => {
      const list = Array.isArray(countriesData) ? countriesData : [];
      return list.find((c) => c.guid === activeCountryGuid) || null;
    }, [countriesData, activeCountryGuid]);

    const { data: rawCountryFields = [] } = useGet({
      apiFn: () =>
        activeCountryGuid
          ? getCountryVisaFieldsApi(activeCountryGuid)
          : Promise.resolve([]),
      key: ["countryVisaFields", activeCountryGuid],
      options: { enabled: Boolean(activeCountryGuid) },
    });

    const sortedFields = useMemo(() => {
      const apiList =
        Array.isArray(rawCountryFields) && rawCountryFields.length > 0
          ? rawCountryFields
          : selectedCountry?.custom_fields || [];
      return sortVisaFields(apiList);
    }, [rawCountryFields, selectedCountry]);

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
          const officeShort = emp.office?.shortName
            ? selectedLang(emp.office.shortName) ||
              selectedLang(emp.office.fullName) ||
              ""
            : emp.office?.fullName
              ? selectedLang(emp.office.fullName)
              : "";
          map.set(emp.guid, {
            fullName: emp.fullName,
            office: officeShort,
          });
        }
      });
      return map;
    }, [employees, selectedLang]);

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
      options: { enabled: Boolean(activeCountryGuid) },
    });

    const applicationsData = useMemo(() => {
      if (!activeCountryGuid) return [];
      return Array.isArray(rawApplicationsData) ? rawApplicationsData : [];
    }, [activeCountryGuid, rawApplicationsData]);

    const handleCountrySelect = useCallback(
      (_, newValue) => {
        const newGuid = newValue ? newValue.guid : "";
        startTransition(() => {
          onCountryChange?.(newGuid);
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
        selectedLang(clientField?.label) || t("columns.client");

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
        selectedLang(acceptedOprField?.label) ||
        t("visaIntake.fields.operator", "Tabşyryjy (Operator)");

      cols.push({
        id: "accepted_opr_guid",
        header: acceptedOprLabel,
        size: 200,
        accessorFn: (row) =>
          employeeMap.get(row.accepted_opr_guid || row.operator_guid)?.fullName || "-",
        Cell: ({ row }) => {
          const oprGuid = row?.original?.accepted_opr_guid || row?.original?.operator_guid;
          const emp = oprGuid ? employeeMap.get(oprGuid) : null;
          if (!emp?.fullName) return "-";
          return <StackedCell primary={emp.fullName} secondary={emp.office} />;
        },
      });

      // 4. Application Date
      const appDateField = fieldMap.get("application_date");
      const appDateLabel =
        selectedLang(appDateField?.label) ||
        t("visaIntake.fields.applicationDate");

      cols.push({
        id: "application_date",
        header: appDateLabel,
        size: 100,
        accessorFn: (row) =>
          row.application_date ?? row.custom_field_values?.application_date,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      });

      // 5. Dynamic Fields (All dynamic country-specific fields in order)
      const standardKeys = new Set([
        "index_number",
        "client_guid",
        "client",
        "passport_number",
        "dateOfBirth",
        "accepted_opr_guid",
        "operator_guid",
        "operator",
        "application_date",
        "note",
        "notes",
        "actions",
      ]);

      if (sortedFields && sortedFields.length > 0) {
        sortedFields.forEach((field, index) => {
          const fieldKey =
            field.fieldKey || field.field_key || field.guid || `col_${index}`;
          if (!standardKeys.has(fieldKey) && !isNotesField(field)) {
            const headerLabel = selectedLang(field.label) || fieldKey;

            const getCustomFieldValue = (row) => {
              if (!row) return undefined;
              let cfv = row.custom_field_values;
              if (typeof cfv === "string") {
                try {
                  cfv = JSON.parse(cfv);
                } catch {
                  cfv = {};
                }
              }
              return cfv?.[fieldKey];
            };

            if (field.fieldType === "date") {
              cols.push({
                id: fieldKey,
                header: headerLabel,
                size: 130,
                accessorFn: (row) => getCustomFieldValue(row),
                Cell: ({ cell }) =>
                  formatChange(cell.getValue(), { dateOnly: true }),
              });
            } else if (field.fieldType === "select") {
              cols.push({
                id: fieldKey,
                header: headerLabel,
                size: 140,
                accessorFn: (row) => getCustomFieldValue(row) ?? "-",
                Cell: ({ cell }) => {
                  const val = cell.getValue();
                  if (!val || val === "-") return "-";
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
                accessorFn: (row) => getCustomFieldValue(row) ?? "-",
              });
            }
          }
        });
      }

      // 6. Note (ALWAYS after all dynamic fields, at the end before actions)
      const noteField = fieldMap.get("note") || sortedFields.find(isNotesField);
      const noteLabel =
        selectedLang(noteField?.label) || t("columns.note");

      cols.push({
        id: "note",
        header: noteLabel,
        size: 160,
        accessorFn: (row) =>
          row.note ??
          row.notes ??
          row.custom_field_values?.note ??
          row.custom_field_values?.notes ??
          "-",
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
      employeeMap,
      selectedLang,
      t,
      formatChange,
      handleDeleteClick,
    ]);

    const table = useMaterialReactTable({
      ...defaultMrtOptions,
      // Avoids nesting MRT's own create/edit <Dialog> around the one this
      // page's Add/Edit modal already renders — see Translate/index.jsx for
      // the full rationale.
      createDisplayMode: "custom",
      editDisplayMode: "custom",
      memoMode: "rows",
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
        isLoading: Boolean(activeCountryGuid && isLoading),
        showSkeletons: Boolean(activeCountryGuid && isLoading),
      },
      enablePagination: false,
      enableBottomToolbar: Boolean(activeCountryGuid),
      renderEmptyRowsFallback: () =>
        !activeCountryGuid ? (
          <SelectCountryPrompt t={t} />
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
            pageSize={limit}
            totalRows={totalItems}
            onPageChange={(newIndex) => setPage?.(newIndex + 1)}
            setPageSize={setPageSize}
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

          <Autocomplete
            size="small"
            popupIcon={<ChevronDown size={18} />}
            options={countryOptions}
            getOptionLabel={(option) => option.label || ""}
            value={
              countryOptions.find((c) => c.guid === activeCountryGuid) || null
            }
            onChange={handleCountrySelect}
            isOptionEqualToValue={(option, val) =>
              option.guid === (val?.guid ?? val)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t(
                  "visaIntake.selectCountryPlaceholder",
                  "Ýurt saýlaň...",
                )}
                sx={{
                  width: 220,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "40px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "#ffffff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.12)"
                          : "#E2E8F0",
                    },
                  },
                }}
              />
            )}
          />
        </Box>
      ),
    });

    useImperativeHandle(ref, () => ({
      openCreateModal: () => table.setCreatingRow(true),
    }));

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

        {Boolean(editingRow) && (
          <VisaIntakeModal
            table={table}
            row={editingRow}
            onRefresh={refetch}
            countryGuid={activeCountryGuid || editingRow.original?.country_guid}
          />
        )}

        <MaterialReactTable table={table} />

        <DeleteDialog
          open={deleteDialog.isOpen}
          onClose={deleteDialog.close}
          onConfirm={deleteDialog.confirm}
          loading={isDeleting}
          title={t("visaIntake.deleteApplicationTitle")}
          description={t("deleteConfirm.employee")}
        />
      </>
    );
  },
);

ApplicationsTable.displayName = "ApplicationsTable";

export default ApplicationsTable;
