import { useMemo, useCallback } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useLocale } from "../../../../hooks/useLocale";
import { getDefaultMRTOptions } from "../../../../hooks/getDefaultMRTOptions";
import { usePagginationGet } from "../../../../hooks/usePagginationGet";
import { useDelete } from "../../../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../../../hooks/useDeleteDialog";
import DeleteDialog from "../../../../components/DeleteDialog";
import StackedCell from "../../../../components/inputs/StackCell";
import ColumnActionButtons from "../../../../components/ColumnActionButtons";
import { getAllToursApi } from "../../../../api/queries/getters";
import { deleteTourApi } from "../../../../api/queries/delete";
import { Box, Chip } from "@mui/material";
import GlobalSearchInput from "../../../../components/GlobalSearchInput";
import AddTourModal from "./AddTourModal";
import EditTourModal from "./EditTourModal";

const TourTab = ({
  queryParams,
  searchQuery,
  setSearch,
  setFilter,
  activeFilters,
  page,
  limit,
  setPage,
  setPageSize,
  isAddOpen,
  onCloseAdd,
}) => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  const mergedParams = useMemo(() => ({ ...queryParams, page, limit }), [queryParams, page, limit]);

  const {
    data: tourData = [],
    isLoading,
    isFetching,
    refetch,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllToursApi,
    key: ["outbound", "tour"],
    params: mergedParams,
  });

  const listData = useMemo(() => tourData || [], [tourData]);

  const { mutate: deleteTour, isPending: isDeleting } = useDelete({
    deleteFn: deleteTourApi,
    queryKey: ["outbound", "tour"],
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteTour(item.guid),
  });

  const handleDeleteClick = useCallback(
    (item) => deleteDialog.open(item),
    [deleteDialog]
  );

  const columns = useMemo(
    () => [
      { accessorKey: "index_number", id: "index_number", header: "#", size: 60 },
      { accessorKey: "request_date", id: "request_date", header: t("outbound.requestDate") || "Arza senesi", size: 110 },
      {
        id: "office",
        header: t("outbound.office") || "Ofis",
        size: 130,
        accessorFn: (row) => row.office?.shortName ?? "",
        Cell: ({ row }) => {
          const off = row.original.office;
          return off ? selectedLang(off.shortName) || selectedLang(off.fullName) || "" : "";
        },
      },
      {
        id: "operator",
        header: t("outbound.operator") || "Operator",
        size: 180,
        accessorFn: (row) => row.operator?.fullName ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.operator?.fullName}
            secondary={
              row.original.operator?.office
                ? selectedLang(row.original.operator.office.shortName) || selectedLang(row.original.operator.office.fullName)
                : ""
            }
          />
        ),
      },
      { accessorKey: "client_name", id: "client_name", header: t("outbound.clientName") || "Müşderiniň ady", size: 160 },
      {
        id: "prepared_by",
        header: t("outbound.preparedBy") || "Taýýarlan",
        size: 180,
        accessorFn: (row) => row.prepared_by_employee?.fullName ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.prepared_by_employee?.fullName || row.original.prepared_by}
            secondary={
              row.original.prepared_by_employee?.office
                ? selectedLang(row.original.prepared_by_employee.office.shortName) || selectedLang(row.original.prepared_by_employee.office.fullName)
                : ""
            }
          />
        ),
      },
      { accessorKey: "destinationCountry", id: "destinationCountry", header: t("outbound.destinationCountry") || "Ugur ýurdy", size: 130 },
      { accessorKey: "tourName", id: "tourName", header: t("outbound.tourName") || "Tur ady", size: 150 },
      { accessorKey: "guestCount", id: "guestCount", header: t("outbound.guestCount") || "Myhman sany", size: 100 },
      {
        accessorKey: "net_fare",
        id: "net_fare",
        header: t("outbound.net_fare") || "Alnan baha",
        size: 110,
        Cell: ({ row, cell }) => `${Number(cell.getValue() || 0).toFixed(2)} ${row.original.currency || "USD"}`,
      },
      {
        accessorKey: "price",
        id: "price",
        header: t("outbound.price") || "Satuw baha",
        size: 110,
        Cell: ({ row, cell }) => `${Number(cell.getValue() || 0).toFixed(2)} ${row.original.currency || "USD"}`,
      },
      {
        accessorKey: "profit",
        id: "profit",
        header: t("outbound.profit") || "Peýda",
        size: 110,
        Cell: ({ row, cell }) => `${Number(cell.getValue() || 0).toFixed(2)} ${row.original.currency || "USD"}`,
      },
      { accessorKey: "source", id: "source", header: t("outbound.source") || "Ulgam", size: 120 },
      {
        id: "actions",
        header: t("columns.actions") ?? "Amallar",
        size: 120,
        enableSorting: false,
        Cell: ({ row, table }) => <ColumnActionButtons row={row} table={table} onDelete={handleDeleteClick} showPayment={true} />,
      },
    ],
    [t, selectedLang, handleDeleteClick]
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: listData,
    state: { isLoading, showSkeletons: isLoading && isFetching },
    rowCount: totalItems,
    manualPagination: true,
    onPaginationChange: (updater) => {
      const nextPagination = typeof updater === "function" ? updater({ pageIndex: page - 1, pageSize: limit }) : updater;
      setPage(nextPagination.pageIndex + 1);
      setPageSize(nextPagination.pageSize);
    },
    renderTopToolbarCustomActions: () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
          mt: 0.5,
        }}
      >
        <GlobalSearchInput
          value={searchQuery}
          onChange={setSearch}
          placeholder={t("search")}
          disabled={isLoading}
          onRefetch={refetch}
          isFetching={isFetching}
        />

        {(activeFilters || []).map(([key, value]) => (
          <Chip
            key={key}
            label={`${t(`outbound.${key}`, key)}: ${value}`}
            onDelete={() => setFilter(key, "")}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              borderRadius: "8px",
              height: "32px",
              fontWeight: 500,
            }}
          />
        ))}
      </Box>
    ),
    renderCreateRowDialogContent: ({ table }) => <AddTourModal open={true} onClose={onCloseAdd} table={table} />,
    renderEditRowDialogContent: ({ table, row }) => <EditTourModal table={table} row={row} />,
  });

  return (
    <>
      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("deleteConfirm")}
      />
      {isAddOpen && <AddTourModal open={isAddOpen} onClose={onCloseAdd} table={table} />}
      <MaterialReactTable table={table} />
    </>
  );
};

export default TourTab;
