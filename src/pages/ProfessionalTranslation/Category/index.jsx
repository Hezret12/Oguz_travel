import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import PageHeader from "../../../components/PageHeader";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useGet } from "../../../hooks/CRUD/useGet";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { getAllCategoriesApi } from "../../../api/queries/getters";
import { deleteCategoryApi } from "../../../api/queries/delete";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";

// Categories the DB triggers write every synced sale into (B2B, visa, …).
// The backend refuses to delete them; the page doesn't offer it either.
const SYSTEM_CATEGORY_PREFIX = "e1000000-0000-0000-0000-";
const isSystemCategory = (guid) => String(guid || "").startsWith(SYSTEM_CATEGORY_PREFIX);

const CategoryPage = () => {
  const { t } = useLocale();
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: categoriesData = [],
    isLoading,
    isFetching,
    refetch,
  } = useGet({
    apiFn: getAllCategoriesApi,
    key: "categories",
  });

  const { mutate: deleteCategory, isPending: isDeleting } = useDelete({
    deleteFn: deleteCategoryApi,
    queryKey: "categories",
    idKey: "guid",
    isPaginated: false,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteCategory(item.guid),
  });

  // `open` never changes, so the columns memo that uses this handler is no
  // longer rebuilt every time the delete dialog opens or closes.
  const handleDeleteClick = deleteDialog.open;

  // Client-side search filtering across all language fields
  const filteredData = useMemo(() => {
    if (!Array.isArray(categoriesData)) return [];
    if (!searchQuery.trim()) return categoriesData;
    const q = searchQuery.toLowerCase();
    return categoriesData.filter((item) => {
      const tk = item.name?.tk?.toLowerCase() || "";
      const ru = item.name?.ru?.toLowerCase() || "";
      const en = item.name?.en?.toLowerCase() || "";
      return tk.includes(q) || ru.includes(q) || en.includes(q);
    });
  }, [categoriesData, searchQuery]);

  const columns = useMemo(
    () => [
      {
        id: "index",
        header: "№",
        size: 60,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.index + 1,
      },
      {
        accessorFn: (row) => row.name?.tk,
        id: "name_tk",
        header: t("professionalTranslation.category.nameTk"),
        size: 240,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorFn: (row) => row.name?.ru,
        id: "name_ru",
        header: t("professionalTranslation.category.nameRu"),
        size: 240,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorFn: (row) => row.name?.en,
        id: "name_en",
        header: t("professionalTranslation.category.nameEn"),
        size: 240,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 100,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            onDelete={handleDeleteClick}
            showDelete={!isSystemCategory(row.original.guid)}
          />
        ),
      },
    ],
    [t, handleDeleteClick],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    // Avoids nesting MRT's own create/edit <Dialog> around the one
    // AddCategoryModal/EditCategoryModal already render — see
    // Translate/index.jsx for the full rationale.
    createDisplayMode: "custom",
    editDisplayMode: "custom",
    defaultColumn: {
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
    },
    columns,
    data: filteredData,
    state: {
      isLoading: isLoading || isFetching,
    },
    getRowId: (row) => row.guid,
    renderTopToolbarCustomActions: () => (
      <Box sx={{ width: { xs: "100%", sm: 320 }, py: 0.5 }}>
        <GlobalSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("search")}
          onRefetch={refetch}
          isFetching={isFetching}
        />
      </Box>
    ),
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Standard Page Header with Primary Add Button */}
      <PageHeader
        title={t("professionalTranslation.category.title")}
        pageTitle={`${t("professionalTranslation.category.title")} | Oguz Travel`}
        addButtonText={t("professionalTranslation.category.addCategory")}
        onAddClick={() => table.setCreatingRow(true)}
      />

      {Boolean(table.getState().creatingRow) && (
        <AddCategoryModal table={table} />
      )}

      {Boolean(table.getState().editingRow) && (
        <EditCategoryModal table={table} row={table.getState().editingRow} />
      )}

      {/* Clean Professional MaterialReactTable with 3-Language Columns */}
      <MaterialReactTable table={table} />

      {/* Standard Delete Dialog */}
      <DeleteDialog
        open={deleteDialog.isOpen}
        isLoading={isDeleting}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        description={t("professionalTranslation.category.deleteConfirm")}
      />
    </Box>
  );
};

export default CategoryPage;
