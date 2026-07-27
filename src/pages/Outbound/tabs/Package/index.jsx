import { useMemo, useCallback } from "react";
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
import { getAllPackagesApi } from "../../../../api/queries/getters";
import { deletePackageApi } from "../../../../api/queries/delete";
import PaymentStatusCell from "../../../../components/PaymentStatusCell";
import { useDateFormat } from "../../../../functions/generalHelpers";
import { Box, Chip } from "@mui/material";
import GlobalSearchInput from "../../../../components/GlobalSearchInput";
import AddPackageModal from "./AddPackageModal";
import EditPackageModal from "./EditPackageModal";

const PackageTab = ({
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

  const mergedParams = useMemo(
    () => ({ ...queryParams, page, limit }),
    [queryParams, page, limit],
  );

  const {
    data: packageData = [],
    isLoading,
    isFetching,
    refetch,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllPackagesApi,
    key: ["outbound", "package"],
    params: mergedParams,
  });

  const listData = useMemo(() => packageData || [], [packageData]);

  const { mutate: deletePackage, isPending: isDeleting } = useDelete({
    deleteFn: deletePackageApi,
    queryKey: ["outbound", "package"],
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deletePackage(item.guid),
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
        size: 210,
        accessorFn: (row) => row.client?.fullName || "",
      },
      {
        id: "operator",
        header: t("columns.operator"),
        size: 200,
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
        header: t("columns.operatorTwo"),
        size: 200,
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
        accessorKey: "profit",
        id: "profit",
        header: t("outbound.profit"),
        size: 120,
        Cell: ({ row, cell }) =>
          `${Number(cell.getValue() || 0).toFixed(2)} ${row.original.currency || "USD"}`,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        accessorFn: (row) => {
          const pct = row.paidPercentage;
          return typeof pct === "string" ? parseFloat(pct) : pct;
        },
        id: "paidPercentage",
        header: t("columns.paymentStatus"),
        size: 110,
        Cell: ({ row }) => (
          <PaymentStatusCell percent={row.original.paidPercentage} />
        ),
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
        id: "partner",
        header: t("outbound.partner") || "Hyzmatdaş",
        size: 120,
        accessorFn: (row) => row.partner || "",
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
          />
        ),
      },
    ],
    [t, selectedLang, formatChange, handleDeleteClick],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
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
    renderCreateRowDialogContent: ({ table }) => (
      <AddPackageModal open={true} onClose={onCloseAdd} table={table} />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <EditPackageModal table={table} row={row} />
    ),
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
      {isAddOpen && (
        <AddPackageModal open={isAddOpen} onClose={onCloseAdd} table={table} />
      )}
      <MaterialReactTable table={table} />
    </>
  );
};

export default PackageTab;
