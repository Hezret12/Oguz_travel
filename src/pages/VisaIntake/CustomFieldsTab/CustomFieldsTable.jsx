import { useMemo, useState, forwardRef, useImperativeHandle, memo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Alert, Box, Button, Chip, MenuItem, Select, FormControl, InputLabel, Tooltip } from "@mui/material";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useDebounce } from "../../../hooks/useDebounce";
import { getCustomFieldsApi } from "../../../api/queries/getters";
import { deleteCustomFieldApi } from "../../../api/queries/delete";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import CreateCustomFieldModal from "./CreateCustomFieldModal";
import EditCustomFieldModal from "./EditCustomFieldModal";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import { ChevronDown, RotateCw } from "lucide-react";

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
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);

  const [page, setPage] = useState(1);
  const [limit, setPageSize] = useState(20);
  const [searchQuery, setSearch] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [fieldTypeFilter, setFieldTypeFilter] = useState("");
  const [isFieldTypeSelectOpen, setIsFieldTypeSelectOpen] = useState(false);

  const params = useMemo(
    () => ({
      page,
      limit,
      field_type: fieldTypeFilter || undefined,
      search: debouncedSearch || undefined,
      option_search: debouncedSearch || undefined,
    }),
    [page, limit, fieldTypeFilter, debouncedSearch]
  );

  const {
    data: fieldsData = [],
    isLoading,
    isFetching,
    refetch,
    isError,
    totalItems = 0,
    pageCount = 1,
  } = usePagginationGet({
    apiFn: getCustomFieldsApi,
    key: "customFields",
    params,
  });

  const [prevSearch, setPrevSearch] = useState(debouncedSearch);
  const [prevFilter, setPrevFilter] = useState(fieldTypeFilter);
  if (debouncedSearch !== prevSearch || fieldTypeFilter !== prevFilter) {
    setPrevSearch(debouncedSearch);
    setPrevFilter(fieldTypeFilter);
    setPage(1);
  }

  const { mutate: deleteCustomField, isPending: isDeleting } = useDelete({
    deleteFn: deleteCustomFieldApi,
    queryKey: "customFields",
    idKey: "guid",
    isPaginated: true,
    invalidateQueries: ["countries", "countryOptions", "countryVisaFields", "receivings"],
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteCustomField(item.guid),
  });

  // Only `open` belongs in the column deps; the dialog object itself changes
  // every time it opens or closes, which would rebuild every column with it.
  const handleDeleteClick = deleteDialog.open;

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
        id: "fieldKey",
        header: t("customFields.fieldKey"),
        size: 150,
        accessorFn: (row) => row.fieldKey || row.field_key,
      },
      {
        id: "labelTm",
        header: t("customFields.labelTm"),
        size: 160,
        accessorFn: (row) => row.field_label?.tk
      },
      {
        id: "labelRu",
        header: t("customFields.labelRu"),
        size: 160,
        accessorFn: (row) => row.field_label?.ru
      },
      {
        id: "labelEn",
        header: t("customFields.labelEn"),
        size: 160,
        accessorFn: (row) => row.field_label?.en,
      },
      {
        id: "fieldType",
        header: t("customFields.fieldType"),
        size: 120,
        accessorFn: (row) => row.fieldType || row.field_type,
        Cell: ({ cell }) => {
          const type = cell.getValue();
          const colorMap = {
            text: "primary",
            number: "secondary",
            date: "warning",
            select: "success",
          };
          return (
            <Chip
              label={type}
              size="small"
              color={colorMap[type] || "default"}
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: "6px" }}
            />
          );
        },
      },
      {
        id: "options",
        header: t("customFields.options"),
        size: 200,
        accessorFn: (row) => row.options,
        Cell: ({ cell }) => <OptionsCell options={cell.getValue()} />,
      },
      {
        id: "isRequired",
        header: t("customFields.isRequired"),
        size: 100,
        accessorFn: (row) =>
          row.isRequired || row.is_required ? "Hawa" : "Ýok",
        Cell: ({ cell }) => {
          const isReq = cell.getValue() === "Hawa";
          return (
            <Chip
              label={cell.getValue()}
              size="small"
              color={isReq ? "error" : "default"}
              sx={{ fontWeight: 600, borderRadius: "6px" }}
            />
          );
        },
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
    renderEmptyRowsFallback: () =>
      isError ? (
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
      ) : (
        defaultMrtOptions.renderEmptyRowsFallback()
      ),
    // Avoids nesting MRT's own create/edit <Dialog> around the one
    // CreateCustomFieldModal/EditCustomFieldModal already render — see
    // Translate/index.jsx for the full rationale.
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
    columns,
    data: fieldsData,
    state: {
      isLoading,
      showSkeletons: isLoading,
    },
    enablePagination: false,
    enableBottomToolbar: true,
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
  });

  useImperativeHandle(ref, () => ({
    openCreateModal: () => table.setCreatingRow(true),
  }));

  return (
    <>
      <CreateCustomFieldModal
        open={Boolean(table.getState().creatingRow)}
        onClose={() => table.setCreatingRow(null)}
        onSave={() => refetch()}
      />

      {Boolean(table.getState().editingRow) && (
        <EditCustomFieldModal
          table={table}
          row={table.getState().editingRow}
          onRefresh={refetch}
        />
      )}

      <MaterialReactTable table={table} />

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        loading={isDeleting}
        title={t("customFields.deleteTitle")}
        description={t("deleteConfirm.employee")}
      />
    </>
  );
});

CustomFieldsTable.displayName = "CustomFieldsTable";

export default CustomFieldsTable;
