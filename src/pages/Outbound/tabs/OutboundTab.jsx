import { useMemo, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useLocale } from "../../../hooks/useLocale";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import DeleteDialog from "../../../components/DeleteDialog";
import StackedCell from "../../../components/inputs/StackCell";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import { getAllOutboundApi, deleteOutboundApi } from "../../../api/queries/outboundApi";
import AddOutboundModal from "../dialogs/AddOutboundModal";
import EditOutboundModal from "../dialogs/EditOutboundModal";

const OutboundTab = ({ activeTab, queryParams, page, limit, setPage, setPageSize }) => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  // Combine queryParams with the type param
  const mergedParams = useMemo(() => {
    return {
      ...queryParams,
      type: activeTab,
      page,
      limit,
    };
  }, [queryParams, activeTab, page, limit]);

  // Fetch Outbound Data
  const {
    data: outboundData = [],
    isLoading,
    isFetching,
    refetch,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllOutboundApi,
    key: ["outbound", activeTab],
    params: mergedParams,
  });

  const listData = useMemo(() => outboundData || [], [outboundData]);

  // Delete Mutation
  const { mutate: deleteOutbound, isPending: isDeleting } = useDelete({
    deleteFn: deleteOutboundApi,
    queryKey: ["outbound", activeTab],
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteOutbound(item.guid),
  });

  const handleDeleteClick = useCallback(
    (item) => deleteDialog.open(item),
    [deleteDialog],
  );

  // Define Columns
  const columns = useMemo(() => {
    // 1. Shared / Common Columns
    const baseColumns = [
      {
        accessorKey: "index_number",
        id: "index_number",
        header: "#",
        size: 60,
      },
      {
        accessorKey: "request_date",
        id: "request_date",
        header: t("outbound.requestDate") || "Arza senesi",
        size: 110,
        Cell: ({ cell }) => cell.getValue() || "",
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
                ? selectedLang(row.original.operator.office.shortName) ||
                  selectedLang(row.original.operator.office.fullName)
                : ""
            }
          />
        ),
      },
      {
        accessorKey: "client_name",
        id: "client_name",
        header: t("outbound.clientName") || "Müşderiniň ady",
        size: 160,
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
                ? selectedLang(row.original.prepared_by_employee.office.shortName) ||
                  selectedLang(row.original.prepared_by_employee.office.fullName)
                : ""
            }
          />
        ),
      },
    ];

    // 2. Tab Specific Columns
    const tabSpecificCols = [];

    if (activeTab === "hotel") {
      tabSpecificCols.push(
        {
          accessorKey: "destinationCountry",
          id: "destinationCountry",
          header: t("outbound.destinationCountry") || "Ugur ýurdy",
          size: 130,
        },
        {
          accessorKey: "hotelName",
          id: "hotelName",
          header: t("outbound.hotelName") || "Otel ady",
          size: 150,
        },
        {
          accessorKey: "roomType",
          id: "roomType",
          header: t("outbound.roomType") || "Otag görnüşi",
          size: 120,
        },
        {
          accessorKey: "mealPlan",
          id: "mealPlan",
          header: t("outbound.mealPlan") || "Iýmit",
          size: 90,
        },
        {
          accessorKey: "guestCount",
          id: "guestCount",
          header: t("outbound.guestCount") || "Myhman sany",
          size: 100,
        }
      );
    } else if (activeTab === "airway") {
      tabSpecificCols.push(
        {
          accessorKey: "ticketNumber",
          id: "ticketNumber",
          header: t("outbound.ticketNumber") || "Bilet №",
          size: 140,
        },
        {
          accessorKey: "ticketType",
          id: "ticketType",
          header: t("outbound.ticketType") || "Bilet görnüşi",
          size: 120,
        },
        {
          accessorKey: "destinationCountry",
          id: "destinationCountry",
          header: t("outbound.destinationCountry") || "Ugur ýurdy",
          size: 130,
        },
        {
          accessorKey: "route",
          id: "route",
          header: t("outbound.route") || "Ugur",
          size: 120,
        },
        {
          accessorKey: "quantity",
          id: "quantity",
          header: t("outbound.quantity") || "Sany",
          size: 90,
        }
      );
    } else if (activeTab === "railway") {
      tabSpecificCols.push(
        {
          accessorKey: "ticketNumber",
          id: "ticketNumber",
          header: t("outbound.ticketNumber") || "Bilet №",
          size: 140,
        },
        {
          accessorKey: "ticketType",
          id: "ticketType",
          header: t("outbound.ticketType") || "Bilet görnüşi",
          size: 120,
        },
        {
          accessorKey: "destinationCountry",
          id: "destinationCountry",
          header: t("outbound.destinationCountry") || "Ugur ýurdy",
          size: 130,
        },
        {
          accessorKey: "route",
          id: "route",
          header: t("outbound.route") || "Ugur",
          size: 120,
        },
        {
          accessorKey: "quantity",
          id: "quantity",
          header: t("outbound.quantity") || "Sany",
          size: 90,
        },
        {
          accessorKey: "trainType",
          id: "trainType",
          header: t("outbound.trainType") || "Otly görnüşi",
          size: 120,
        }
      );
    } else if (activeTab === "tour") {
      tabSpecificCols.push(
        {
          accessorKey: "destinationCountry",
          id: "destinationCountry",
          header: t("outbound.destinationCountry") || "Ugur ýurdy",
          size: 130,
        },
        {
          accessorKey: "tourName",
          id: "tourName",
          header: t("outbound.tourName") || "Tur ady",
          size: 150,
        },
        {
          accessorKey: "guestCount",
          id: "guestCount",
          header: t("outbound.guestCount") || "Myhman sany",
          size: 100,
        }
      );
    } else if (activeTab === "transfer") {
      tabSpecificCols.push(
        {
          accessorKey: "destinationCountry",
          id: "destinationCountry",
          header: t("outbound.destinationCountry") || "Ugur ýurdy",
          size: 130,
        },
        {
          accessorKey: "transferType",
          id: "transferType",
          header: t("outbound.transferType") || "Transfer görnüşi",
          size: 120,
        },
        {
          accessorKey: "route",
          id: "route",
          header: t("outbound.route") || "Ugur",
          size: 120,
        },
        {
          accessorKey: "carType",
          id: "carType",
          header: t("outbound.carType") || "Maşyn görnüşi",
          size: 120,
        },
        {
          accessorKey: "guestCount",
          id: "guestCount",
          header: t("outbound.guestCount") || "Myhman sany",
          size: 100,
        }
      );
    } else if (activeTab === "package") {
      tabSpecificCols.push({
        accessorKey: "destinationCountry",
        id: "destinationCountry",
        header: t("outbound.destinationCountry") || "Ugur ýurdy",
        size: 150,
      });
    }

    // 3. Pricing & Source Columns
    const pricingColumns = [
      {
        accessorKey: "cost",
        id: "cost",
        header: t("outbound.cost") || "Alnan baha",
        size: 110,
        Cell: ({ cell }) => `${Number(cell.getValue() || 0).toFixed(2)} TMT`,
      },
      {
        accessorKey: "price",
        id: "price",
        header: t("outbound.price") || "Satuw baha",
        size: 110,
        Cell: ({ cell }) => `${Number(cell.getValue() || 0).toFixed(2)} TMT`,
      },
      {
        accessorKey: "profit",
        id: "profit",
        header: t("outbound.profit") || "Peýda",
        size: 110,
        Cell: ({ cell }) => `${Number(cell.getValue() || 0).toFixed(2)} TMT`,
      },
      {
        accessorKey: "source",
        id: "source",
        header: activeTab === "package" ? t("outbound.partner") || "Hyzmatdaş" : t("outbound.source") || "Ulgam",
        size: 120,
      },
      {
        id: "actions",
        header: t("columns.actions") ?? "Amallar",
        size: 120,
        enableSorting: false,
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            onDelete={handleDeleteClick}
          />
        ),
      },
    ];

    return [...baseColumns, ...tabSpecificCols, ...pricingColumns];
  }, [activeTab, t, selectedLang, handleDeleteClick]);

  // MaterialReactTable Configuration
  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: listData,
    enableRowActions: false,
    enableEditing: true,
    enableCreatingRow: true,
    state: {
      isLoading,
      showSkeletons: isLoading && isFetching,
    },
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
    renderCreateRowDialogContent: ({ table }) => (
      <AddOutboundModal table={table} activeTab={activeTab} />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <EditOutboundModal table={table} row={row} activeTab={activeTab} />
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
      <MaterialReactTable table={table} />
    </>
  );
};

export default OutboundTab;
