import { useMemo, useState, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useLocale } from "../../../../hooks/useLocale";
import { getDefaultMRTOptions } from "../../../../hooks/getDefaultMRTOptions";
import { usePagginationGet } from "../../../../hooks/usePagginationGet";
import { useDelete } from "../../../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../../../hooks/useDeleteDialog";
import DeleteDialog from "../../../../components/DeleteDialog";
import StackedCell from "../../../../components/inputs/StackCell";
import ColumnActionButtons from "../../../../components/ColumnActionButtons";
import { getAllTransfersApi } from "../../../../api/queries/getters";
import { deleteTransferApi } from "../../../../api/queries/delete";
import PaymentStatusCell from "../../../../components/PaymentStatusCell";
import StatusChip from "../../../../components/StatusChip";
import { OUTBOUND_PAYMENT_STATUS_CONFIG } from "../../../../functions/statusChipConfigs";
import { useDateFormat } from "../../../../functions/generalHelpers";
import { Box, Chip } from "@mui/material";
import GlobalSearchInput from "../../../../components/GlobalSearchInput";
import AddTransferModal from "./AddTransferModal";
import EditTransferModal from "./EditTransferModal";
import { PaymentManagementModal } from "../../../../components/Dialog/PaymentManagementModal";

const TransferTab = ({
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
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = getDefaultMRTOptions();
  const [paymentModalRow, setPaymentModalRow] = useState(null);

  const mergedParams = useMemo(
    () => ({ ...queryParams, page, limit }),
    [queryParams, page, limit],
  );

  const {
    data: transferData = [],
    isLoading,
    isFetching,
    refetch,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllTransfersApi,
    key: ["outbound", "transfer"],
    params: mergedParams,
  });

  const listData = useMemo(() => transferData || [], [transferData]);

  const { mutate: deleteTransfer, isPending: isDeleting } = useDelete({
    deleteFn: deleteTransferApi,
    queryKey: ["outbound", "transfer"],
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteTransfer(item.guid),
  });

  const handleDeleteClick = useCallback(
    (item) => deleteDialog.open(item),
    [deleteDialog],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "index_number",
        id: "index_number",
        header: "#",
        size: 60,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        id: "application_date",
        header: t("outbound.requestDate"),
        size: 110,
        accessorFn: (row) => row?.application_date,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "client_name",
        header: t("outbound.clientName"),
        size: 220,
        accessorFn: (row) => row.client?.fullName || "",
      },
      {
        id: "operator",
        header: t("outbound.operator"),
        size: 220,
        accessorFn: (row) => row.operator?.fullName ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.operator?.fullName}
            secondary={selectedLang(
              row.original.operator?.office?.fullName ||
                row.original.operator?.office?.shortName,
            )}
          />
        ),
      },
      {
        id: "prepared_by",
        header: t("outbound.preparedBy"),
        size: 220,
        accessorFn: (row) => row.preparedOpr?.fullName ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.preparedOpr?.fullName}
            secondary={selectedLang(
              row?.original?.preparedOpr?.office?.fullName ||
                row?.original?.preparedOpr?.office?.shortName,
            )}
          />
        ),
      },
      {
        id: "net_fare",
        header: t("columns.netFare"),
        size: 120,
        accessorFn: (row) => row.net_fare ?? 0,
        Cell: ({ row, cell }) =>
          `${Number(cell.getValue() || 0).toFixed(2)} ${row.original.currency || "USD"}`,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        accessorKey: "price",
        id: "price",
        header: t("outbound.price"),
        size: 120,
        Cell: ({ row, cell }) =>
          `${Number(cell.getValue() || 0).toFixed(2)} ${row.original.currency || "USD"}`,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        id: "profit",
        header: t("outbound.profit"),
        size: 130,
        accessorFn: (row) => row.profit ?? ((row.price || 0) - (row.net_fare || 0)),
        Cell: ({ row, cell }) => {
          const profit = Number(cell.getValue() ?? 0);
          const currency = row.original.currency || "USD";
          return (
            <Box
              sx={{
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                color:
                  profit > 0
                    ? "#16a34a"
                    : profit < 0
                      ? "#ef4444"
                      : "text.secondary",
              }}
            >
              {profit > 0 ? "+" : ""}
              {profit.toFixed(2)} {currency}
            </Box>
          );
        },
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        id: "is_paid",
        header: t("columns.paymentStatus"),
        size: 120,
        accessorFn: (row) => row.is_paid,
        Cell: ({ cell }) => (
          <StatusChip
            status={cell.getValue()}
            config={OUTBOUND_PAYMENT_STATUS_CONFIG}
            size="small"
          />
        ),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => {
          const pct = row.paidPercentage;
          return typeof pct === "string" ? parseFloat(pct) : pct;
        },
        id: "paidPercentage",
        header: t("columns.paymentPercentage"),
        size: 80,
        Cell: ({ row }) => (
          <PaymentStatusCell percent={row.original.paidPercentage} />
        ),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "destination_country",
        header: t("outbound.destinationCountry"),
        size: 250,
        accessorFn: (row) => row.destination_country || "",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "transfer_type",
        header: t("outbound.transferType") || "Transfer görnüşi",
        size: 120,
        accessorFn: (row) => row.transfer_type || "",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "route",
        header: t("outbound.route") || "Ugur",
        size: 140,
        accessorFn: (row) => row.route || "",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "machine_type",
        header: t("outbound.carType") || "Maşyn görnüşi",
        size: 120,
        accessorFn: (row) => row.machine_type || "",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "guests_count",
        header: t("outbound.guestCount"),
        size: 70,
        accessorFn: (row) => row.guests_count,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "system",
        header: t("outbound.source"),
        size: 120,
        accessorFn: (row) => row.system,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "note",
        header: t("columns.note"),
        size: 140,
        accessorFn: (row) => row?.note || "",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 120,
        enableSorting: false,
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            onDelete={handleDeleteClick}
            showPayment={true}
            onPaymentClick={(r) => setPaymentModalRow(r)}
          />
        ),
      },
    ],
    [t, selectedLang, formatChange, handleDeleteClick],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    // The Add flow here is already driven by the parent's own isAddOpen state
    // (below), not table.setCreatingRow — renderCreateRowDialogContent was
    // dead code. Edit IS reached via ColumnActionButtons' table.setEditingRow,
    // so "custom" avoids MRT wrapping EditTransferModal's own <Dialog> in a
    // second one — see Translate/index.jsx for the full rationale.
    editDisplayMode: "custom",
    enableColumnPinning: true,
    columns,
    data: listData,
    initialState: {
      columnPinning: {
        left: ["index_number"],
        right: ["actions"],
      },
    },
    state: { isLoading, showSkeletons: isLoading && isFetching },
    rowCount: totalItems,
    manualPagination: true,
    onPaginationChange: (updater) => {
      const nextPagination =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize: limit })
          : updater;
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

        {(activeFilters || []).map(([key, value]) => {
          let displayVal = value;
          if (key === "is_paid") {
            const num = Number(value);
            displayVal = num === 1 ? "Tölendi" : num === 2 ? "Kredit" : num === 3 ? "Gaýtaryldy" : value;
          } else if (key === "start_date" || key === "end_date") {
            displayVal = formatChange(value, { dateOnly: true });
          }
          return (
            <Chip
              key={key}
              label={`${t(`outbound.${key}`, key)}: ${displayVal}`}
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
          );
        })}
      </Box>
    ),
  });

  return (
    <>
      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("outbound.deleteConfirm")}
      />
      {isAddOpen && (
        <AddTransferModal open={isAddOpen} onClose={onCloseAdd} table={table} />
      )}
      {Boolean(table.getState().editingRow) && (
        <EditTransferModal table={table} row={table.getState().editingRow} />
      )}
      {Boolean(paymentModalRow) && (
        <PaymentManagementModal
          open={Boolean(paymentModalRow)}
          onClose={() => {
            setPaymentModalRow(null);
            refetch();
          }}
          row={paymentModalRow}
        />
      )}
      <MaterialReactTable table={table} />
    </>
  );
};

export default TransferTab;
