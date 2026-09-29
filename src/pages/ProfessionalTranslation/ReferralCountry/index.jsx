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
import { getAllReferralCountriesApi } from "../../../api/queries/getters";
import { deleteReferralCountryApi } from "../../../api/queries/delete";
import AddReferralCountryModal from "./AddReferralCountryModal";
import EditReferralCountryModal from "./EditReferralCountryModal";

// Countries a referral letter can be issued for; picked in the referral
// letter form and filter.
const ReferralCountryPage = () => {
  const { t } = useLocale();
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: countriesData = [],
    isLoading,
    isFetching,
    refetch,
  } = useGet({
    apiFn: getAllReferralCountriesApi,
    key: "referralCountries",
  });

  const { mutate: deleteCountry, isPending: isDeleting } = useDelete({
    deleteFn: deleteReferralCountryApi,
    queryKey: "referralCountries",
    idKey: "guid",
    isPaginated: false,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteCountry(item.guid),
  });

  const handleDeleteClick = deleteDialog.open;

  // The list is small, so it is loaded whole and searched here.
  const filteredData = useMemo(() => {
    if (!Array.isArray(countriesData)) return [];
    if (!searchQuery.trim()) return countriesData;
    const q = searchQuery.toLowerCase();
    return countriesData.filter((item) =>
      ["tk", "ru", "en"].some((l) => item.name?.[l]?.toLowerCase().includes(q)),
    );
  }, [countriesData, searchQuery]);

  const columns = useMemo(
    () => [
      {
        id: "index",
        header: "№",
        size: 60,
        enableSorting: false,
        Cell: ({ row }) => row.index + 1,
      },
      {
        accessorFn: (row) => row.name?.tk,
        id: "name_tk",
        header: t("professionalTranslation.referralCountry.nameTk"),
        size: 240,
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorFn: (row) => row.name?.ru,
        id: "name_ru",
        header: t("professionalTranslation.referralCountry.nameRu"),
        size: 240,
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorFn: (row) => row.name?.en,
        id: "name_en",
        header: t("professionalTranslation.referralCountry.nameEn"),
        size: 240,
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 100,
        enableSorting: false,
        Cell: ({ row, table }) => (
          <ColumnActionButtons row={row} table={table} onDelete={handleDeleteClick} />
        ),
      },
    ],
    [t, handleDeleteClick],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    // Avoids nesting MRT's own create/edit <Dialog> around the modals below —
    // see Translate/index.jsx for the full rationale.
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
      <PageHeader
        title={t("professionalTranslation.referralCountry.title")}
        pageTitle={`${t("professionalTranslation.referralCountry.title")} | Oguz Travel`}
        addButtonText={t("professionalTranslation.referralCountry.add")}
        onAddClick={() => table.setCreatingRow(true)}
      />

      {Boolean(table.getState().creatingRow) && (
        <AddReferralCountryModal table={table} />
      )}

      {Boolean(table.getState().editingRow) && (
        <EditReferralCountryModal table={table} row={table.getState().editingRow} />
      )}

      <MaterialReactTable table={table} />

      <DeleteDialog
        open={deleteDialog.isOpen}
        isLoading={isDeleting}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        description={t("professionalTranslation.referralCountry.deleteConfirm")}
      />
    </Box>
  );
};

export default ReferralCountryPage;
