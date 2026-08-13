import { useCallback, useMemo, useState, forwardRef, useImperativeHandle } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Chip } from "@mui/material";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { getCountriesApi } from "../../../api/queries/getters";
import { deleteCountryApi } from "../../../api/queries/delete";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import DeleteDialog from "../../../components/DeleteDialog";
import CreateCountryModal from "./CreateCountryModal";
import EditCountryModal from "./EditCountryModal";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";

export const CountriesTable = forwardRef((props, ref) => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  const [page, setPage] = useState(1);
  const [limit, setPageSize] = useState(40);
  const [searchQuery, setSearch] = useState("");

  const params = useMemo(
    () => ({
      page,
      limit,
      search: searchQuery || undefined,
    }),
    [page, limit, searchQuery]
  );

  const {
    data: countriesData = [],
    isLoading,
    isFetching,
    refetch,
    totalItems = 0,
  } = usePagginationGet({
    apiFn: getCountriesApi,
    key: ["countries", params],
    params,
  });

  const { mutate: deleteCountry, isPending: isDeleting } = useDelete({
    deleteFn: deleteCountryApi,
    queryKey: "countries",
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteCountry(item.guid),
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
        id: "code",
        header: t("columns.code"),
        size: 80,
        accessorFn: (row) => row.code || "-",
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue()}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, borderRadius: "6px" }}
          />
        ),
      },
      {
        id: "nameTm",
        header: t("columns.countryNameTm"),
        size: 180,
        accessorFn: (row) => row.name?.tk,
      },
      {
        id: "nameRu",
        header: t("columns.countryNameRu"),
        size: 180,
        accessorFn: (row) => row.name?.ru,
      },
      {
        id: "nameEn",
        header: t("columns.countryNameEn"),
        size: 180,
        accessorFn: (row) => row.name?.en,
      },
      {
        id: "custom_fields_count",
        header: t("customFields.title"),
        size: 180,
        accessorFn: (row) =>
          Array.isArray(row.custom_fields)
            ? `${row.custom_fields.length} meýdança`
            : "0 meýdança",
        Cell: ({ row }) => {
          const fields = row.original.custom_fields;
          const count = Array.isArray(fields) ? fields.length : 0;
          return (
            <Chip
              label={`${count} meýdança`}
              size="small"
              color={count > 0 ? "secondary" : "default"}
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
  }, [page, limit, t, handleDeleteClick]);

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: countriesData,
    state: {
      isLoading,
      showSkeletons: isLoading,
    },
    enablePagination: false,
    renderCreateRowDialogContent: ({ table }) => (
      <CreateCountryModal
        open={Boolean(table.getState().creatingRow)}
        onClose={() => table.setCreatingRow(null)}
        onRefresh={refetch}
      />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <EditCountryModal
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
        <GlobalSearchInput
          value={searchQuery}
          onChange={setSearch}
          placeholder={t("search")}
          onRefetch={refetch}
          isFetching={isFetching}
        />
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
        title={t("visaIntake.deleteCountryTitle")}
        description={t("deleteConfirm.employee")}
      />
    </Box>
  );
});

CountriesTable.displayName = "CountriesTable";

export default CountriesTable;

