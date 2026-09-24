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
import { getAllTranslatorsApi } from "../../../api/queries/getters";
import { deleteTranslatorApi } from "../../../api/queries/delete";
import { useDateFormat } from "../../../functions/generalHelpers";
import AddTranslatorModal from "./AddTranslatorModal";
import EditTranslatorModal from "./EditTranslatorModal";

const TranslatorPage = () => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: translatorsData = [],
    isLoading,
    isFetching,
    refetch,
  } = useGet({
    apiFn: getAllTranslatorsApi,
    key: "translators",
  });

  const { mutate: deleteTranslator, isPending: isDeleting } = useDelete({
    deleteFn: deleteTranslatorApi,
    queryKey: "translators",
    idKey: "guid",
    isPaginated: false,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteTranslator(item.guid),
  });

  // `open` never changes, so the columns memo that uses this handler is no
  // longer rebuilt every time the delete dialog opens or closes.
  const handleDeleteClick = deleteDialog.open;

  const filteredData = useMemo(() => {
    if (!Array.isArray(translatorsData)) return [];
    if (!searchQuery.trim()) return translatorsData;
    const q = searchQuery.toLowerCase();
    return translatorsData.filter((item) => {
      const name = item.fullName?.toLowerCase() || "";
      const num = String(item.index_number || "");
      return name.includes(q) || num.includes(q);
    });
  }, [translatorsData, searchQuery]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "index_number",
        id: "index_number",
        header: "№",
        size: 70,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell, row }) =>
          cell.getValue() ?? row.original?.index_number ?? row.index + 1,
      },
      {
        accessorFn: (row) => row.fullName,
        id: "fullName",
        header: t("professionalTranslation.translator.fullName"),
        size: 260,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        header: t("columns.createdAt"),
        size: 180,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => formatChange(cell.getValue()) || "-",
      },
      {
        accessorFn: (row) => row.updatedAt,
        id: "updatedAt",
        header: t("columns.updatedAt"),
        size: 180,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => formatChange(cell.getValue()) || "-",
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
    [t, formatChange, handleDeleteClick],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    // Avoids nesting MRT's own create/edit <Dialog> around the one
    // AddTranslatorModal/EditTranslatorModal already render — see
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
        title={t("professionalTranslation.translator.title")}
        pageTitle={`${t("professionalTranslation.translator.title")} | Oguz Travel`}
        addButtonText={t("professionalTranslation.translator.addTranslator")}
        onAddClick={() => table.setCreatingRow(true)}
      />

      {Boolean(table.getState().creatingRow) && (
        <AddTranslatorModal table={table} />
      )}

      {Boolean(table.getState().editingRow) && (
        <EditTranslatorModal table={table} row={table.getState().editingRow} />
      )}

      {/* Clean Professional MaterialReactTable */}
      <MaterialReactTable table={table} />

      {/* Standard Delete Dialog */}
      <DeleteDialog
        open={deleteDialog.isOpen}
        isLoading={isDeleting}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        description={t("professionalTranslation.translator.deleteConfirm")}
      />
    </Box>
  );
};

export default TranslatorPage;
