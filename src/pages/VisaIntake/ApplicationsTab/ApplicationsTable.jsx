import { useCallback, useMemo, useState, forwardRef, useImperativeHandle } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Button, Chip, Badge } from "@mui/material";
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

export const ApplicationsTable = forwardRef(({
  queryParams = {},
  searchQuery = "",
  setSearch,
  openDrawer,
  refetchKey,
  countryGuid,
  isFilterActive = false,
}, ref) => {
  const { t, selectedLang } = useLocale();
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = getDefaultMRTOptions();

  const [page, setPage] = useState(1);
  const [limit, setPageSize] = useState(40);

  const { data: rawVisaFields = [] } = useGet({
    apiFn: () =>
      countryGuid ? getCountryVisaFieldsApi(countryGuid) : Promise.resolve([]),
    key: ["countryVisaFields", countryGuid],
    options: { enabled: Boolean(countryGuid) },
  });

  const sortedFields = useMemo(() => {
    return sortVisaFields(rawVisaFields);
  }, [rawVisaFields]);

  const params = useMemo(
    () => ({
      page,
      limit,
      country_guid: countryGuid || undefined,
      ...queryParams,
    }),
    [page, limit, countryGuid, queryParams]
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
    [deleteDialog]
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
      sortedFields.forEach((field) => {
        const fieldKey = field.fieldKey;
        const headerLabel = selectedLang(field.labelTm) || field.labelTm || fieldKey;

        if (fieldKey === "client_guid") {
          cols.push({
            id: "client_guid",
            header: headerLabel,
            size: 180,
            accessorFn: (row) =>
              row.client?.fullName || row.client_name || row.client_guid || "-",
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
        } else if (fieldKey === "operator_guid") {
          cols.push({
            id: "operator_guid",
            header: headerLabel,
            size: 160,
            accessorFn: (row) =>
              row.operator?.fullName || row.operator_name || "-",
          });
        } else if (fieldKey === "operator2_guid") {
          cols.push({
            id: "operator2_guid",
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
            accessorFn: (row) => row[fieldKey],
            Cell: ({ cell }) =>
              formatChange(cell.getValue(), { dateOnly: true }),
          });
        } else if (field.fieldType === "select") {
          cols.push({
            id: fieldKey,
            header: headerLabel,
            size: 140,
            accessorFn: (row) => row[fieldKey] || "-",
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
            accessorFn: (row) => row[fieldKey] ?? "-",
          });
        }
      });
    } else {
      cols.push(
        {
          id: "client_name",
          header: t("columns.client"),
          size: 180,
          accessorFn: (row) =>
            row.client?.fullName || row.client_name || row.client_guid || "-",
        },
        {
          id: "passport_number",
          header: t("columns.passportNumber"),
          size: 140,
          accessorFn: (row) =>
            row.passport_number || row.client?.passport_number || "-",
        },
        {
          id: "application_date",
          header: t("visaIntake.fields.applicationDate"),
          size: 130,
          accessorFn: (row) => row.application_date || row.createdAt,
          Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        },
        {
          id: "operator_name",
          header: t("columns.operator"),
          size: 160,
          accessorFn: (row) =>
            row.operator?.fullName || row.operator_name || "-",
        },
        {
          id: "visa_category",
          header: t("visaIntake.fields.visaCategory"),
          size: 140,
          accessorFn: (row) => row.visa_category || "-",
          Cell: ({ cell }) => (
            <Chip
              label={cell.getValue()}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: "6px" }}
            />
          ),
        }
      );
    }

    cols.push({
      id: "is_processed",
      header: t("visaIntake.fields.isProcessed"),
      size: 120,
      accessorFn: (row) => (row.is_processed ? "TRUE" : "FALSE"),
      Cell: ({ cell }) => (
        <StatusChip status={cell.getValue()} config={PROCESSED_STATUS_CONFIG} />
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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
        countryGuid={countryGuid}
      />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <VisaIntakeModal
        table={table}
        row={row}
        onRefresh={refetch}
        countryGuid={countryGuid}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
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
});

ApplicationsTable.displayName = "ApplicationsTable";

export default ApplicationsTable;

