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
import { getAllOfficeApi } from "../../../api/queries/getters";
import { deleteOfficeApi } from "../../../api/queries/delete";
import AddOfficeModal from "./AddOfficeModal";
import EditOfficeModal from "./EditOfficeModal";

const OfficePage = () => {
  const { t } = useLocale();
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: officesData = [],
    isLoading,
    isFetching,
    refetch,
  } = useGet({
    apiFn: getAllOfficeApi,
    key: "office",
  });

  const { mutate: deleteOffice, isPending: isDeleting } = useDelete({
    deleteFn: deleteOfficeApi,
    queryKey: "office",
    idKey: "guid",
    isPaginated: false,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteOffice(item.guid),
  });

  // `open` never changes, so the columns memo that uses this handler is no
  // longer rebuilt every time the delete dialog opens or closes.
  const handleDeleteClick = deleteDialog.open;

  // Client-side search filtering across all language fields
  const filteredData = useMemo(() => {
    if (!Array.isArray(officesData)) return [];
    if (!searchQuery.trim()) return officesData;
    const q = searchQuery.toLowerCase();
    return officesData.filter((item) => {
      const fullTk = item.fullName?.tk?.toLowerCase() || "";
      const fullRu = item.fullName?.ru?.toLowerCase() || "";
      const fullEn = item.fullName?.en?.toLowerCase() || "";
      const shortTk = item.shortName?.tk?.toLowerCase() || "";
      const shortRu = item.shortName?.ru?.toLowerCase() || "";
      const shortEn = item.shortName?.en?.toLowerCase() || "";
      return (
        fullTk.includes(q) ||
        fullRu.includes(q) ||
        fullEn.includes(q) ||
        shortTk.includes(q) ||
        shortRu.includes(q) ||
        shortEn.includes(q)
      );
    });
  }, [officesData, searchQuery]);

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
        accessorFn: (row) => row.fullName?.tk,
        id: "fullName_tk",
        header: t("professionalTranslation.office.fullNameTk"),
        size: 180,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorFn: (row) => row.fullName?.ru,
        id: "fullName_ru",
        header: t("professionalTranslation.office.fullNameRu"),
        size: 180,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorFn: (row) => row.fullName?.en,
        id: "fullName_en",
        header: t("professionalTranslation.office.fullNameEn"),
        size: 180,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorFn: (row) => row.shortName?.tk,
        id: "shortName_tk",
        header: t("professionalTranslation.office.shortNameTk"),
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorFn: (row) => row.shortName?.ru,
        id: "shortName_ru",
        header: t("professionalTranslation.office.shortNameRu"),
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorFn: (row) => row.shortName?.en,
        id: "shortName_en",
        header: t("professionalTranslation.office.shortNameEn"),
        size: 130,
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
    // AddOfficeModal/EditOfficeModal already render — see Translate/index.jsx
    // for the full rationale.
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
        title={t("professionalTranslation.office.title")}
        pageTitle={`${t("professionalTranslation.office.title")} | Oguz Travel`}
        addButtonText={t("professionalTranslation.office.addOffice")}
        onAddClick={() => table.setCreatingRow(true)}
      />

      {Boolean(table.getState().creatingRow) && (
        <AddOfficeModal table={table} />
      )}

      {Boolean(table.getState().editingRow) && (
        <EditOfficeModal table={table} row={table.getState().editingRow} />
      )}

      {/* Clean Professional MaterialReactTable with Center-Aligned Columns */}
      <MaterialReactTable table={table} />

      {/* Standard Delete Dialog */}
      <DeleteDialog
        open={deleteDialog.isOpen}
        isLoading={isDeleting}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        description={t("professionalTranslation.office.deleteConfirm")}
      />
    </Box>
  );
};

export default OfficePage;
