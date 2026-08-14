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
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
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
} from "../../../api/queries/getters";
import { deleteReceivingApi } from "../../../api/queries/delete";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import StackedCell from "../../../components/inputs/StackCell";
import StatusChip from "../../../components/StatusChip";
import { PROCESSED_STATUS_CONFIG } from "../../../functions/statusChipConfigs";
import { sortVisaFields } from "../../../functions/visaCountryFieldConfigs";
import VisaIntakeModal from "./VisaIntakeModal";

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
    const [limit, setPageSize] = useState(40);
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
      data: applicationsData = [],
      isLoading,
      isFetching,
      refetch,
      totalItems = 0,
    } = usePagginationGet({
      apiFn: getAllReceivingsApi,
      key: ["receivings", params, refetchKey],
      params,
    });

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

    const columns = useMemo(() => {
      const cols = [
        {
          accessorFn: (row, index) => (page - 1) * limit + index + 1,
          id: "index_number",
          header: "№",
          size: 50,
          enableSorting: false,
        },
      ];

      if (sortedFields && sortedFields.length > 0) {
        sortedFields.forEach((field, index) => {
          const fieldKey =
            field.fieldKey || field.field_key || field.guid || `col_${index}`;
          const headerLabel =
            selectedLang(field.labelTm) || field.labelTm || fieldKey;

          if (fieldKey === "client_guid") {
            cols.push({
              id: "client_guid",
              header: headerLabel,
              size: 180,
              accessorFn: (row) =>
                row.client?.fullName ||
                row.client_name ||
                row.client_guid ||
                "-",
              Cell: ({ row }) => (
                <StackedCell
                  primary={
                    row.original.client?.fullName ||
                    row.original.client_name ||
                    row.original.client_guid ||
                    "-"
                  }
                  secondary={
                    row.original.client?.passport_number ||
                    row.original.passport_number ||
                    ""
                  }
                />
              ),
            });
          } else if (
            fieldKey === "operator_guid" ||
            fieldKey === "accepted_opr_guid"
          ) {
            cols.push({
              id: fieldKey,
              header: headerLabel,
              size: 160,
              accessorFn: (row) =>
                row.operator?.fullName ||
                row.operator_fullName ||
                row.operator_name ||
                "-",
            });
          } else if (
            fieldKey === "operator2_guid" ||
            fieldKey === "received_opr_guid"
          ) {
            cols.push({
              id: fieldKey,
              header: headerLabel,
              size: 160,
              accessorFn: (row) =>
                row.operator2?.fullName || row.operator2_name || "-",
            });
          } else if (field.fieldType === "date") {
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
        });
      } else {
        cols.push(
          {
            id: "client_name",
            header: t("columns.client"),
            size: 180,
            accessorFn: (row) => row.client?.fullName,
          },
          {
            id: "passport_number",
            header: t("columns.passportNumber"),
            size: 140,
            accessorFn: (row) => row.client?.passport_number,
          },
          {
            id: "application_date",
            header: t("visaIntake.fields.applicationDate"),
            size: 130,
            accessorFn: (row) => row.application_date,
            Cell: ({ cell }) =>
              formatChange(cell.getValue(), { dateOnly: true }),
          },
          {
            id: "operator_name",
            header: t("columns.operator"),
            size: 160,
            accessorFn: (row) => row.operator?.fullName,
          },
          {
            id: "visa_category",
            header: t("visaIntake.fields.visaCategory"),
            size: 140,
            accessorFn: (row) => row.visa_category,
            Cell: ({ cell }) => (
              <Chip
                label={cell.getValue()}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, borderRadius: "6px" }}
              />
            ),
          },
        );
      }

      cols.push({
        id: "is_processed",
        header: t("visaIntake.fields.isProcessed"),
        size: 120,
        accessorFn: (row) => (row.is_processed ? "TRUE" : "FALSE"),
        Cell: ({ cell }) => (
          <StatusChip
            status={cell.getValue()}
            config={PROCESSED_STATUS_CONFIG}
          />
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
              showPayment={true}
            />
          </Box>
        ),
      });

      return cols;
    }, [
      page,
      limit,
      sortedFields,
      selectedLang,
      t,
      formatChange,
      handleDeleteClick,
    ]);

    const table = useMaterialReactTable({
      ...defaultMrtOptions,
      columns,
      data: applicationsData,
      state: {
        isLoading,
        showSkeletons: isLoading,
      },
      enablePagination: false,
      renderCreateRowDialogContent: ({ table }) => (
        <VisaIntakeModal
          open={Boolean(table.getState().creatingRow)}
          close={() => table.setCreatingRow(null)}
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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
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
                  placeholder={t("columns.country") || "Ýurt saýlaň..."}
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
        </Box>

        <MaterialReactTable table={table} />

        <Pagination
          totalItems={totalItems}
          page={page}
          limit={limit}
          setPage={setPage}
          setPageSize={setPageSize}
        />

        <DeleteDialog
          open={deleteDialog.isOpen}
          onClose={deleteDialog.close}
          onConfirm={deleteDialog.confirm}
          loading={isDeleting}
          title={t("visaIntake.deleteApplicationTitle")}
          description={t("deleteConfirm.employee")}
        />
      </Box>
    );
  },
);

ApplicationsTable.displayName = "ApplicationsTable";

export default ApplicationsTable;
