import { useMemo, useState, useCallback } from "react";
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
import { getAllDepartmentApi } from "../../../api/queries/getters";
import { deleteDepartmentApi } from "../../../api/queries/delete";
import AddDepartmentModal from "./AddDepartmentModal";
import EditDepartmentModal from "./EditDepartmentModal";

const DepartmentPage = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: departmentsData = [],
    isLoading,
    isFetching,
    refetch,
  } = useGet({
    apiFn: getAllDepartmentApi,
    key: "department",
  });

  const { mutate: deleteDepartment, isPending: isDeleting } = useDelete({
    deleteFn: deleteDepartmentApi,
    queryKey: "department",
    idKey: "guid",
    isPaginated: false,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteDepartment(item.guid),
  });

  const handleDeleteClick = useCallback(
    (item) => deleteDialog.open(item),
    [deleteDialog],
  );

  // Client-side search filtering across all language fields
  const filteredData = useMemo(() => {
    if (!Array.isArray(departmentsData)) return [];
    if (!searchQuery.trim()) return departmentsData;
    const q = searchQuery.toLowerCase();
    return departmentsData.filter((item) => {
      const tk = item.name?.tk?.toLowerCase() || "";
      const ru = item.name?.ru?.toLowerCase() || "";
      const en = item.name?.en?.toLowerCase() || "";
      return tk.includes(q) || ru.includes(q) || en.includes(q);
    });
  }, [departmentsData, searchQuery]);

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
        header: t("professionalTranslation.department.nameTk"),
        size: 240,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorFn: (row) => row.name?.ru,
        id: "name_ru",
        header: t("professionalTranslation.department.nameRu"),
        size: 240,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorFn: (row) => row.name?.en,
        id: "name_en",
        header: t("professionalTranslation.department.nameEn"),
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
          />
        ),
      },
    ],
    [t, handleDeleteClick],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    // Avoids nesting MRT's own create/edit <Dialog> around the one
    // AddDepartmentModal/EditDepartmentModal already render — see
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
        title={t("professionalTranslation.department.title")}
        pageTitle={`${t("professionalTranslation.department.title")} | Oguz Travel`}
        addButtonText={t("professionalTranslation.department.addDepartment")}
        onAddClick={() => table.setCreatingRow(true)}
      />

      {Boolean(table.getState().creatingRow) && (
        <AddDepartmentModal table={table} />
      )}

      {Boolean(table.getState().editingRow) && (
        <EditDepartmentModal table={table} row={table.getState().editingRow} />
      )}

      {/* Clean Professional MaterialReactTable with 3-Language Columns */}
      <MaterialReactTable table={table} />

      {/* Standard Delete Dialog */}
      <DeleteDialog
        open={deleteDialog.isOpen}
        isLoading={isDeleting}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        description={t("professionalTranslation.department.deleteConfirm")}
      />
    </Box>
  );
};

export default DepartmentPage;
