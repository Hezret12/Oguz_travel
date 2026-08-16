import {
  useCallback,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
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
import FilterListIcon from "@mui/icons-material/FilterList";
import { ChevronDown, Globe } from "lucide-react";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useDateFormat } from "../../../functions/generalHelpers";
import {
  getAllReceivingsApi,
  getCountryVisaFieldsApi,
  getCountriesApi,
  getAllEmployeeApi,
} from "../../../api/queries/getters";
import { deleteReceivingApi } from "../../../api/queries/delete";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import StackedCell from "../../../components/inputs/StackCell";
import TableEmptyState from "../../../components/TableEmptyState";
import { sortVisaFields } from "../../../functions/visaCountryFieldConfigs";
import VisaIntakeModal from "./VisaIntakeModal";

const SelectCountryPrompt = ({ t }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 1.5,
      p: 4,
      minHeight: "calc(100vh - 360px)",
      textAlign: "center",
    }}
  >
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "primary.main",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(45, 212, 191, 0.1)"
            : "rgba(14, 133, 132, 0.08)",
      }}
    >
      <Globe size={32} />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
      {t("visaIntake.selectCountryPrompt")}
    </Typography>
    <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 400 }}>
      {t("visaIntake.selectCountryDescription")}
    </Typography>
  </Box>
);

export const ApplicationsTable = forwardRef(
  (
    {
      queryParams = {},
      searchQuery = "",
      setSearch,
      openDrawer,
      refetchKey,
      countryGuid,
      isFilterActive = false,
    },
    ref,
  ) => {
    const { t, selectedLang } = useLocale();
    const { formatChange } = useDateFormat();
    const defaultMrtOptions = getDefaultMRTOptions();

    const [page, setPage] = useState(1);
    const [limit] = useState(40);
    const [selectedCountryGuid, setSelectedCountryGuid] = useState(
      countryGuid || "",
    );

    const activeCountryGuid = countryGuid || selectedCountryGuid;

    const countryParams = useMemo(() => ({ page: 1, limit: 100 }), []);
    const { data: countriesData = [] } = usePagginationGet({
      apiFn: getCountriesApi,
      key: "countriesList",
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

    const { data: rawVisaFields = [] } = useGet({
      apiFn: () =>
        activeCountryGuid
          ? getCountryVisaFieldsApi(activeCountryGuid)
          : Promise.resolve([]),
      key: ["countryVisaFields", activeCountryGuid],
      options: { enabled: Boolean(activeCountryGuid) },
    });

    const sortedFields = useMemo(() => {
      return sortVisaFields(rawVisaFields);
    }, [rawVisaFields]);

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
        page,
        limit,
        search: searchQuery || undefined,
        country_guid: activeCountryGuid || undefined,
        ...queryParams,
      }),
      [page, limit, searchQuery, activeCountryGuid, queryParams],
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
      key: ["receivings", params, refetchKey],
      params,
      options: { enabled: Boolean(activeCountryGuid) },
    });

    const applicationsData = useMemo(() => {
      if (!activeCountryGuid) return [];
      return Array.isArray(rawApplicationsData) ? rawApplicationsData : [];
    }, [activeCountryGuid, rawApplicationsData]);

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
      const appDateField = fieldMap.get("application_date");
      const appDateLabel =
        (appDateField && selectedLang(appDateField.labelTm)) ||
        (appDateField && typeof appDateField.labelTm === "string"
          ? appDateField.labelTm
          : null) ||
        t("visaIntake.fields.applicationDate");

      cols.push({
        id: "application_date",
        header: appDateLabel,
        size: 140,
        accessorFn: (row) =>
          row.application_date ?? row.custom_field_values?.application_date,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      });

      const acceptedOprField = fieldMap.get("accepted_opr_guid");
      const acceptedOprLabel =
        (acceptedOprField && selectedLang(acceptedOprField.labelTm)) ||
        (acceptedOprField && typeof acceptedOprField.labelTm === "string"
          ? acceptedOprField.labelTm
          : null);

      cols.push({
        id: "accepted_opr_guid",
        header: acceptedOprLabel,
        size: 170,
        accessorFn: (row) =>
          row.operator?.fullName ||
          row.accepted_operator?.fullName ||
          row.operator_name ||
          "-",
        Cell: ({ row }) => {
          const oprGuid = row?.original?.accepted_opr_guid;
          const empFromMap = oprGuid ? employeeMap.get(oprGuid) : null;
          const emp =
            row?.original?.operator || row?.original?.accepted_operator;
          const fullName =
            emp?.fullName ||
            empFromMap?.fullName ||
            row?.original?.operator_name;
          const officeShort = emp?.office?.shortName
            ? selectedLang(emp.office.shortName) || ""
            : emp?.office?.fullName
              ? selectedLang(emp.office.fullName)
              : empFromMap?.office || "";
          if (!fullName) return "-";
          return <StackedCell primary={fullName} secondary={officeShort} />;
        },
      });

      const receivedOprField = fieldMap.get("received_opr_guid");
      const receivedOprLabel =
        (receivedOprField && selectedLang(receivedOprField.labelTm)) ||
        (receivedOprField && typeof receivedOprField.labelTm === "string"
          ? receivedOprField.labelTm
          : null) ||
        "Kabul ediji (Operator)";

      cols.push({
        id: "received_opr_guid",
        header: receivedOprLabel,
        size: 170,
        accessorFn: (row) =>
          row.operator2?.fullName ||
          row.receiver_operator?.fullName ||
          row.received_operator?.fullName ||
          "-",
        Cell: ({ row }) => {
          const oprGuid = row?.original?.received_opr_guid;
          const empFromMap = oprGuid ? employeeMap.get(oprGuid) : null;
          const emp = row?.original?.received_operator;
          const fullName = emp?.fullName || empFromMap?.fullName;
          const officeShort = emp?.office?.shortName
            ? selectedLang(emp.office.shortName) ||
              selectedLang(emp.office.fullName) ||
              ""
            : emp?.office?.fullName
              ? selectedLang(emp.office.fullName)
              : empFromMap?.office || "";
          if (!fullName) return "-";
          return <StackedCell primary={fullName} secondary={officeShort} />;
        },
      });

      const clientField = fieldMap.get("client_guid") || fieldMap.get("client");
      const clientLabel =
        (clientField && selectedLang(clientField.labelTm)) ||
        (clientField && typeof clientField.labelTm === "string"
          ? clientField.labelTm
          : null) ||
        t("columns.client");

      cols.push({
        id: "client",
        header: clientLabel,
        size: 180,
        accessorFn: (row) => row.client?.fullName,
      });

      cols.push({
        id: "passport_number",
        header: t("columns.passportNumber"),
        size: 140,
        accessorFn: (row) => row.passport_number,
      });
      cols.push({
        id: "dateOfBirth",
        header: t("columns.dateOfBirth"),
        size: 130,
        accessorFn: (row) =>
          row.dateOfBirth ||
          row.client?.dateOfBirth ||
          row.birth_date ||
          row.custom_field_values?.dateOfBirth ||
          row.custom_field_values?.birth_date,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      });

      const standardKeys = new Set([
        "index_number",
        "application_date",
        "accepted_opr_guid",
        "received_opr_guid",
        "client_guid",
        "client",
        "client_name",
        "passport_number",
        "dateOfBirth",
        "birth_date",
        "note",
        "notes",
        "is_processed",
        "actions",
      ]);

      if (sortedFields && sortedFields.length > 0) {
        sortedFields.forEach((field, index) => {
          const fieldKey =
            field.fieldKey || field.field_key || field.guid || `col_${index}`;
          if (!standardKeys.has(fieldKey)) {
            const headerLabel =
              selectedLang(field.labelTm) ||
              (typeof field.labelTm === "string" ? field.labelTm : null) ||
              fieldKey;

            if (field.fieldType === "date") {
              cols.push({
                id: fieldKey,
                header: headerLabel,
                size: 130,
                accessorFn: (row) =>
                  row[fieldKey] ?? row.custom_field_values?.[fieldKey],
                Cell: ({ cell }) =>
                  formatChange(cell.getValue(), { dateOnly: true }),
              });
            } else if (field.fieldType === "select") {
              cols.push({
                id: fieldKey,
                header: headerLabel,
                size: 140,
                accessorFn: (row) =>
                  row[fieldKey] ?? row.custom_field_values?.[fieldKey] ?? "-",
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
                accessorFn: (row) =>
                  row[fieldKey] ?? row.custom_field_values?.[fieldKey] ?? "-",
              });
            }
          }
        });
      }
      const noteField = fieldMap.get("note");
      const noteLabel =
        (noteField && selectedLang(noteField.labelTm)) ||
        (noteField && typeof noteField.labelTm === "string"
          ? noteField.labelTm
          : null) ||
        t("visaIntake.fields.notes", "Bellikler");

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

    const [prevSearch, setPrevSearch] = useState(searchQuery);
    const [prevCountry, setPrevCountry] = useState(activeCountryGuid);
    if (searchQuery !== prevSearch || activeCountryGuid !== prevCountry) {
      setPrevSearch(searchQuery);
      setPrevCountry(activeCountryGuid);
      setPage(1);
    }

    const table = useMaterialReactTable({
      ...defaultMrtOptions,
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
      enableBottomToolbar: pageCount > 1,
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
            onPageChange={(newIndex) => setPage(newIndex + 1)}
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
              variant={isFilterActive ? "contained" : "outlined"}
              startIcon={<FilterListIcon />}
              onClick={openDrawer}
              sx={{ borderRadius: "8px", fontWeight: 600, height: "40px" }}
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
            onChange={(_, newValue) => {
              setSelectedCountryGuid(newValue ? newValue.guid : "");
              setPage(1);
            }}
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
      renderCreateRowDialogContent: ({ table }) => (
        <VisaIntakeModal
          table={table}
          onRefresh={refetch}
          countryGuid={activeCountryGuid}
        />
      ),
      renderEditRowDialogContent: ({ table, row }) => (
        <VisaIntakeModal
          table={table}
          row={row}
          onRefresh={refetch}
          countryGuid={activeCountryGuid || row.original?.country_guid}
        />
      ),
    });

    useImperativeHandle(ref, () => ({
      openCreateModal: () => table.setCreatingRow(true),
    }));

    return (
      <>
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
