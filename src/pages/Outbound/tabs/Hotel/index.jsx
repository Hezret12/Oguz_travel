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
import { getAllHotelsApi } from "../../../../api/queries/getters";
import { deleteHotelApi } from "../../../../api/queries/delete";
import StatusChip from "../../../../components/StatusChip";
import { PAYMENT_STATUS_CONFIG } from "../../../../functions/statusChipConfigs";
import AddHotelModal from "../../dialogs/Hotel/AddHotelModal";
import EditHotelModal from "../../dialogs/Hotel/EditHotelModal";

const HotelTab = ({ queryParams, page, limit, setPage, setPageSize, isAddOpen, onCloseAdd }) => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  const mergedParams = useMemo(() => ({ ...queryParams, page, limit }), [queryParams, page, limit]);

  const {
    data: hotelData = [],
    isLoading,
    isFetching,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllHotelsApi,
    key: ["outbound", "hotel"],
    params: mergedParams,
  });

  const listData = useMemo(() => hotelData || [], [hotelData]);

  const { mutate: deleteHotel, isPending: isDeleting } = useDelete({
    deleteFn: deleteHotelApi,
    queryKey: ["outbound", "hotel"],
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteHotel(item.guid),
  });

  const handleDeleteClick = useCallback(
    (item) => deleteDialog.open(item),
    [deleteDialog]
  );

  const columns = useMemo(
    () => [
      { accessorKey: "index_number", id: "index_number", header: "#", size: 60 },
      {
        id: "request_date",
        header: t("outbound.requestDate") || "Arza senesi",
        size: 110,
        accessorFn: (row) => row.application_date || row.request_date || "",
      },
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
      {
        id: "client_name",
        header: t("outbound.clientName") || "Müşderiniň ady",
        size: 160,
        accessorFn: (row) => row.client?.fullName || row.client_name || "",
      },
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
      {
        id: "destinationCountry",
        header: t("outbound.destinationCountry") || "Ugur ýurdy",
        size: 130,
        accessorFn: (row) => row.destination_country || row.destinationCountry || "",
      },
      {
        id: "hotelName",
        header: t("outbound.hotelName") || "Otel ady",
        size: 150,
        accessorFn: (row) => row.hotel_name || row.hotelName || "",
      },
      {
        id: "roomType",
        header: t("outbound.roomType") || "Otag görnüşi",
        size: 120,
        accessorFn: (row) => row.room_type || row.roomType || "",
      },
      {
        id: "mealPlan",
        header: t("outbound.mealPlan") || "Iýmit",
        size: 90,
        accessorFn: (row) => row.meal_plan || row.mealPlan || "",
      },
      {
        id: "guestCount",
        header: t("outbound.guestCount") || "Myhman sany",
        size: 100,
        accessorFn: (row) => row.guests_count ?? row.guestCount ?? 1,
      },
      {
        id: "net_fare",
        header: t("outbound.net_fare") || "Alnan baha",
        size: 110,
        accessorFn: (row) => row.cost ?? row.net_fare ?? 0,
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
      {
        id: "source",
        header: t("outbound.source") || "Ulgam",
        size: 120,
        accessorFn: (row) => row.system || row.source || "",
      },
      {
        id: "is_paid",
        header: t("outbound.paymentStatus") || "Töleg ýagdaýy",
        size: 110,
        accessorFn: (row) => (row.is_paid ? "TOLENDI" : "KREDIT"),
        Cell: ({ row }) => (
          <StatusChip
            status={row.original.is_paid ? "TOLENDI" : "KREDIT"}
            config={PAYMENT_STATUS_CONFIG}
          />
        ),
      },
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
    enableRowActions: false,
    enableEditing: true,
    enableCreatingRow: true,
    state: { isLoading, showSkeletons: isLoading && isFetching },
    rowCount: totalItems,
    manualPagination: true,
    onPaginationChange: (updater) => {
      const nextPagination = typeof updater === "function" ? updater({ pageIndex: page - 1, pageSize: limit }) : updater;
      setPage(nextPagination.pageIndex + 1);
      setPageSize(nextPagination.pageSize);
    },
    renderCreateRowDialogContent: ({ table }) => <AddHotelModal open={true} onClose={onCloseAdd} table={table} />,
    renderEditRowDialogContent: ({ table, row }) => <EditHotelModal table={table} row={row} />,
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
      {isAddOpen && <AddHotelModal open={isAddOpen} onClose={onCloseAdd} table={table} />}
      <MaterialReactTable table={table} />
    </>
  );
};

export default HotelTab;
