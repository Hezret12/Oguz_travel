import { useCallback, useMemo, useState, forwardRef, useImperativeHandle, memo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Chip, MenuItem, Select, FormControl, InputLabel, Tooltip } from "@mui/material";
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
import { ChevronDown } from "lucide-react";

const OptionsCell = memo(({ options }) => {
  if (!Array.isArray(options) || options.length === 0) return "";

  const maxVisible = 3;
  const visible = options.slice(0, maxVisible);
  const remaining = options.length - maxVisible;

  const tooltipContent = (
    <Box sx={{ p: 0.5, maxWidth: 300 }}>
      <Box
        sx={{
          fontSize: "0.72rem",
          fontWeight: 650,
          color: "text.secondary",
          mb: 0.75,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {options.length} Seçenek
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
        {options.map((opt, idx) => (
          <Chip
            key={idx}
            label={opt}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.72rem",
              fontWeight: 500,
              borderRadius: "5px",
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "#F1F5F9",
              border: (theme) =>
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.12)"
                  : "1px solid #E2E8F0",
              color: "text.primary",
            }}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <Tooltip
      title={tooltipContent}
      arrow
      placement="top"
      enterDelay={150}
      leaveTouchDelay={3000}
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.6,
          maxWidth: "100%",
          overflow: "hidden",
          whiteSpace: "nowrap",
          verticalAlign: "middle",
          cursor: "pointer",
        }}
      >
        {visible.map((opt, idx) => (
          <Chip
            key={idx}
            label={opt}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              borderRadius: "5px",
              maxWidth: 95,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.06)"
                  : "#F1F5F9",
              border: (theme) =>
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid #E2E8F0",
              color: "text.primary",
              "& .MuiChip-label": {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                px: 1,
              },
            }}
          />
        ))}
        {remaining > 0 && (
          <Chip
            label={`+${remaining}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              fontWeight: 700,
              borderRadius: "5px",
              flexShrink: 0,
              px: 0.25,
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
});

OptionsCell.displayName = "OptionsCell";

export const CustomFieldsTable = forwardRef((props, ref) => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  const [page, setPage] = useState(1);
  const [limit, setPageSize] = useState(40);
  const [searchQuery, setSearch] = useState("");
  const [fieldTypeFilter, setFieldTypeFilter] = useState("");
  const [isFieldTypeSelectOpen, setIsFieldTypeSelectOpen] = useState(false);

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
        accessorKey: "index_number",
        id: "index_number",
        header: "№",
        size: 50,
        enableSorting: false,
      },
      {
        id: "labelTm",
        header: t("customFields.labelTm"),
        size: 180,
        accessorFn: (row) => row.field_label?.tk,
      },
      {
        id: "labelRu",
        header: t("customFields.labelRu"),
        size: 180,
        accessorFn: (row) => row.field_label?.ru,
      },
      {
        id: "labelEn",
        header: t("customFields.labelEn"),
        size: 180,
        accessorFn: (row) => row.field_label?.en,
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
        size: 220,
        accessorFn: (row) =>
          Array.isArray(row.options) ? row.options.join(", ") : "",
        Cell: ({ row }) => <OptionsCell options={row.original.options} />,
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
  }, [t, handleDeleteClick]);

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    muiTablePaperProps: {
      sx: () => ({
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
    data: fieldsData,
    state: {
      isLoading,
      showSkeletons: isLoading,
    },
    enablePagination: false,
    enableBottomToolbar: false,
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
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="field-type-filter-label">
            {t("customFields.fieldType")}
          </InputLabel>
          <Select
            labelId="field-type-filter-label"
            value={fieldTypeFilter}
            label={t("customFields.fieldType")}
            onChange={(e) => setFieldTypeFilter(e.target.value)}
            open={isFieldTypeSelectOpen}
            onOpen={() => setIsFieldTypeSelectOpen(true)}
            onClose={() => setIsFieldTypeSelectOpen(false)}
            IconComponent={() => (
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "absolute",
                  right: 12,
                  top: "calc(50% - 9px)",
                  color: "text.secondary",
                  pointerEvents: "none",
                  transform: isFieldTypeSelectOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease",
                }}
              >
                <ChevronDown size={18} />
              </Box>
            )}
            MenuProps={{
              slotProps: {
                paper: {
                  sx: {
                    borderRadius: "12px",
                    marginTop: "6px",
                    maxHeight: 300,
                  },
                },
              },
            }}
            sx={{ borderRadius: "8px", height: "40px" }}
          >
            <MenuItem value="">{t("all")}</MenuItem>
            <MenuItem value="text">{t("customFields.typeText")}</MenuItem>
            <MenuItem value="number">{t("customFields.typeNumber")}</MenuItem>
            <MenuItem value="date">{t("customFields.typeDate")}</MenuItem>
            <MenuItem value="select">{t("customFields.typeSelect")}</MenuItem>
          </Select>
        </FormControl>
      </Box>
    ),
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

