import { useCallback, useMemo, useState, forwardRef, useImperativeHandle } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Chip, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { getCustomFieldsApi } from "../../../api/queries/getters";
import { deleteCustomFieldApi } from "../../../api/queries/delete";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import CreateCustomFieldModal from "./CreateCustomFieldModal";
import EditCustomFieldModal from "./EditCustomFieldModal";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";

export const CustomFieldsTable = forwardRef((props, ref) => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  const [page, setPage] = useState(1);
  const [limit, setPageSize] = useState(40);
  const [searchQuery, setSearch] = useState("");
  const [fieldTypeFilter, setFieldTypeFilter] = useState("");

  const params = useMemo(
    () => ({
      page,
      limit,
      field_type: fieldTypeFilter || undefined,
      option_search: searchQuery || undefined,
    }),
    [page, limit, fieldTypeFilter, searchQuery]
  );

  const {
    data: fieldsData = [],
    isLoading,
    isFetching,
    refetch,
    totalItems = 0,
  } = usePagginationGet({
    apiFn: getCustomFieldsApi,
    key: ["customFields", params],
    params,
  });

  const { mutate: deleteCustomField, isPending: isDeleting } = useDelete({
    deleteFn: deleteCustomFieldApi,
    queryKey: "customFields",
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteCustomField(item.guid),
  });

  const handleDeleteClick = useCallback(
    (item) => deleteDialog.open(item),
    [deleteDialog]
  );

  const columns = useMemo(() => {
    return [
      {
        accessorFn: (row, index) => (page - 1) * limit + index + 1,
        id: "index_number",
        header: "№",
        size: 50,
        enableSorting: false,
      },
      {
        id: "labelTm",
        header: t("customFields.labelTm"),
        size: 180,
        accessorFn: (row) => row.field_label?.tk || row.labelTm || "",
      },
      {
        id: "labelRu",
        header: t("customFields.labelRu"),
        size: 180,
        accessorFn: (row) => row.field_label?.ru || row.labelRu || "",
      },
      {
        id: "labelEn",
        header: t("customFields.labelEn"),
        size: 180,
        accessorFn: (row) => row.field_label?.en || row.labelEn || "",
      },
      {
        id: "field_type",
        header: t("customFields.fieldType"),
        size: 140,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        accessorFn: (row) => row.field_type || row.fieldType || "text",
        Cell: ({ cell }) => {
          const type = String(cell.getValue() || "text").toUpperCase();
          let color = "default";
          if (type === "TEXT") color = "primary";
          if (type === "NUMBER") color = "success";
          if (type === "DATE") color = "info";
          if (type === "SELECT") color = "warning";
          return (
            <Chip
              label={type}
              size="small"
              color={color}
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: "0.75rem", borderRadius: "6px" }}
            />
          );
        },
      },
      {
        id: "options",
        header: t("customFields.options"),
        size: 200,
        accessorFn: (row) =>
          Array.isArray(row.options) ? row.options.join(", ") : "-",
        Cell: ({ row }) => {
          const opts = row.original.options;
          if (!Array.isArray(opts) || opts.length === 0) return "-";
          return (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {opts.map((opt, idx) => (
                <Chip
                  key={idx}
                  label={opt}
                  size="small"
                  sx={{ height: 22, fontSize: "0.7rem", borderRadius: "4px" }}
                />
              ))}
            </Box>
          );
        },
      },
      {
        id: "sort_order",
        header: t("customFields.sortOrder"),
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        accessorFn: (row) => row.sort_order ?? 0,
      },
      {
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
            />
          </Box>
        ),
      },
    ];
  }, [page, limit, t, handleDeleteClick]);

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: fieldsData,
    state: {
      isLoading,
      showSkeletons: isLoading,
    },
    enablePagination: false,
    renderCreateRowDialogContent: ({ table }) => (
      <CreateCustomFieldModal
        open={Boolean(table.getState().creatingRow)}
        onClose={() => table.setCreatingRow(null)}
        onSave={() => refetch()}
      />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <EditCustomFieldModal
        table={table}
        row={row}
        onRefresh={refetch}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <GlobalSearchInput
            value={searchQuery}
            onChange={setSearch}
            placeholder={t("search")}
            onRefetch={refetch}
            isFetching={isFetching}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{t("customFields.fieldType")}</InputLabel>
            <Select
              value={fieldTypeFilter}
              label={t("customFields.fieldType")}
              onChange={(e) => setFieldTypeFilter(e.target.value)}
              sx={{ borderRadius: "8px" }}
            >
              <MenuItem value="">{t("all")}</MenuItem>
              <MenuItem value="text">{t("customFields.typeText")}</MenuItem>
              <MenuItem value="number">{t("customFields.typeNumber")}</MenuItem>
              <MenuItem value="date">{t("customFields.typeDate")}</MenuItem>
              <MenuItem value="select">{t("customFields.typeSelect")}</MenuItem>
            </Select>
          </FormControl>
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
        title={t("customFields.deleteTitle")}
        description={t("deleteConfirm.employee")}
      />
    </Box>
  );
});

CustomFieldsTable.displayName = "CustomFieldsTable";

export default CustomFieldsTable;

