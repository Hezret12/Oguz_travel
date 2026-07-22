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
import { getAllRailwaysApi } from "../../../../api/queries/getters";
import { deleteRailwayApi } from "../../../../api/queries/delete";
import AddRailwayModal from "../../dialogs/Railway/AddRailwayModal";
import EditRailwayModal from "../../dialogs/Railway/EditRailwayModal";

const RailwayTab = ({ queryParams, page, limit, setPage, setPageSize, isAddOpen, onCloseAdd }) => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  const mergedParams = useMemo(() => ({ ...queryParams, page, limit }), [queryParams, page, limit]);

  const {
    data: railwayData = [],
    isLoading,
    isFetching,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllRailwaysApi,
    key: ["outbound", "railway"],
    params: mergedParams,
  });

  const listData = useMemo(() => railwayData || [], [railwayData]);

  const { mutate: deleteRailway, isPending: isDeleting } = useDelete({
    deleteFn: deleteRailwayApi,
    queryKey: ["outbound", "railway"],
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteRailway(item.guid),
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
      { accessorKey: "ticketNumber", id: "ticketNumber", header: t("outbound.ticketNumber") || "Bilet №", size: 140 },
      { accessorKey: "ticketType", id: "ticketType", header: t("outbound.ticketType") || "Bilet görnüşi", size: 120 },
      { accessorKey: "destinationCountry", id: "destinationCountry", header: t("outbound.destinationCountry") || "Ugur ýurdy", size: 130 },
      { accessorKey: "route", id: "route", header: t("outbound.route") || "Ugur", size: 120 },
      { accessorKey: "trainType", id: "trainType", header: t("outbound.trainType") || "Otly görnüşi", size: 120 },
      { accessorKey: "quantity", id: "quantity", header: t("outbound.quantity") || "Sany", size: 90 },
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
    renderCreateRowDialogContent: ({ table }) => <AddRailwayModal open={true} onClose={onCloseAdd} table={table} />,
    renderEditRowDialogContent: ({ table, row }) => <EditRailwayModal table={table} row={row} />,
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
      {isAddOpen && <AddRailwayModal open={isAddOpen} onClose={onCloseAdd} table={table} />}
      <MaterialReactTable table={table} />
    </>
  );
};

export default RailwayTab;
