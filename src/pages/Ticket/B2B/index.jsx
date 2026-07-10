import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useLocale } from "../../../hooks/useLocale";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import PageHeader from "../../../components/PageHeader";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import { useClientsQuery } from "../../../pages/Clients/hooks/useClientsQuery";
import { useB2BTickets } from "./useB2BTickets";
import StackedCell from "../../../components/inputs/StackCell";
import {
  colSize,
  nameColSize,
  orderNumber,
  price,
  route,
} from "../../../utils/helperConstant";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import AddB2BTicketDialog from "./AddB2BTicketDialog";

const formatDate = (value) => {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  return `${day}.${month}.${year}`;
};

const currency = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const B2B = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { data: clients = [] } = useClientsQuery();
  const { tickets } = useB2BTickets();
  const [searchQuery, setSearchQuery] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const clientById = useMemo(
    () => Object.fromEntries(clients.map((client) => [client.id, client])),
    [clients],
  );

  const filteredTickets = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return tickets.filter((ticket) => {
      const client = clientById[ticket.clientId];
      if (!normalizedQuery) return true;

      return [
        ticket.ticketNo,
        ticket.pnr,
        ticket.status,
        ticket.airline,
        ticket.route,
        ticket.office,
        ticket.operator,
        ticket.operatorTwo,
        ticket.agent,
        ticket.agentFullName,
        ticket.agentPhoneNumber,
        client?.fullName,
        client?.passportNumber,
        client?.phoneNumber,
        client?.clientId,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedQuery),
      );
    });
  }, [tickets, searchQuery, clientById]);

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.id,
        id: "id",
        header: "№",
        size: orderNumber,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        accessorFn: (row) => row.ticketNo,
        id: "ticketNo",
        header: t("columns.ticketNo"),
        size: 100,
      },
      {
        accessorFn: (row) => clientById[row.clientId]?.fullName ?? row.clientId,
        id: "client",
        header: t("columns.client", "Client"),
        size: nameColSize,
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.clientId}
            secondary={row.original.issueDate}
          />
        ),
      },
      {
        accessorFn: (row) => row.pnr,
        id: "pnr",
        header: "PNR",
        size: colSize,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: t("columns.status"),
        size: colSize,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.airline,
        id: "airline",
        header: t("columns.airline", "Airline"),
        size: 160,
      },
      {
        accessorFn: (row) => row.route,
        id: "route",
        header: t("columns.route", "Route"),
        size: route,
        muiTableHeadCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.cabinClass,
        id: "cabinClass",
        header: t("columns.cabinClass", "Class"),
        size: colSize,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.tripType,
        id: "tripType",
        header: t("columns.tripType", "Trip Type"),
        size: colSize,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.flightDate,
        id: "flightDate",
        header: t("columns.flightDate"),
        size: 120,
        Cell: ({ cell }) => formatDate(cell.getValue()),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.netFare,
        id: "netFare",
        header: t("columns.netFare"),
        size: price,
        Cell: ({ cell }) => currency.format(Number(cell.getValue() ?? 0)),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        accessorFn: (row) => row.saleFare,
        id: "saleFare",
        header: t("columns.saleFare"),
        size: price,
        Cell: ({ cell }) => currency.format(Number(cell.getValue() ?? 0)),
      },
      {
        accessorFn: (row) => row.profit,
        id: "profit",
        header: t("columns.profit", "Profit"),
        size: 100,
        Cell: ({ cell }) => {
          const profit = Number(cell.getValue() ?? 0);
          return (
            <Box
              sx={{
                fontWeight: 700,
                color: profit >= 0 ? "#16a34a" : "#ef4444",
              }}
            >
              {currency.format(profit)}
            </Box>
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
          <ColumnActionButtons
            row={row}
            table={table}
            // onDelete={handleDeleteClick}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    enableColumnPinning: true,
    initialState: {
      ...defaultMrtOptions.initialState,
      columnPinning: {
        left: ["id"],
        right: ["actions"],
      },
    },
    columns,
    data: filteredTickets,
    state: {
      ...defaultMrtOptions.state,
      rowSelection,
    },
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    renderTopToolbarCustomActions: () => (
      <GlobalSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t("search")}
      />
    ),
    renderBottomToolbar: ({ table: mrtTable }) => {
      const { pageIndex, pageSize } = mrtTable.getState().pagination;
      const pageCount = mrtTable.getPageCount();

      return (
        <Box
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 0.75,
            minHeight: "52px",
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Box />
          <Pagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            pageSize={pageSize}
            totalRows={filteredTickets.length}
            onPageChange={(newIndex) => mrtTable.setPageIndex(newIndex)}
          />
        </Box>
      );
    },
    renderCreateRowDialogContent: ({ table }) => (
      <AddB2BTicketDialog table={table} />
    ),
    // renderEditRowDialogContent: ({ table, row }) => (
    //   <EditEmployee table={table} row={row} />
    // ),
  });

  return (
    <Box>
      <PageHeader
        title={t("pages.ticket.b2b.title")}
        pageTitle={`${t("pages.ticket.b2b.title")} | Oguz Travel`}
        addButtonText={t("pages.ticket.b2b.addTicket")}
        filterButtonText={t("pages.ticket.filter", "Filter")}
        onAddClick={() => table.setCreatingRow(true)}
      />

      <MaterialReactTable table={table} />
    </Box>
  );
};

export default B2B;
