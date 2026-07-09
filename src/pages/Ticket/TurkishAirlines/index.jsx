import { useMemo, useState } from "react";
import { Box, Chip } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useLocale } from "../../../hooks/useLocale";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import PageHeader from "../../../components/PageHeader";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import AddTurkishAirlinesContent from "./CRUD/addTurkishAirlinesContent";
import { useDateFormat } from "../../../functions/generalHelpers";
import StackedCell from "../../../components/inputs/StackCell";

const initialData = [
  {
    id: "ta-1",
    date: "2026-06-15",
    operator: "ATABAY",
    ofis: "LB",
    op2: "POLAT",
    op2Ofis: "AYLAR",
    agent: "MERDAN",
    agentTel: "+99365932397",
    name: "MERDAN",
    surname: "BABAJANOV",
    yolagcyTel: "+99363375482",
    dob: "2001-07-23",
    milesSmiles: "TK4471829",
    passportId: "A2088696",
    pcoi: "TURKMENISTAN",
    pdoe: "2028-04-25",
    status: "SALE",
    pnr: "VZ636D",
    ticketNumber: "2352212890995",
    route: "ASB-IST-ECN",
    flightClass: "LY",
    flightDate: "2026-07-10",
    total: 850,
    baseFare: 620,
    aydylanBaha: 850,
    accepted: 850,
    changeAmount: 0,
    kassir: "Lbdan",
    bellik: "",
  },
  {
    id: "ta-2",
    date: "2026-06-16",
    operator: "AYLAR",
    ofis: "AYLAR",
    op2: "",
    op2Ofis: "",
    agent: "BEGENCH",
    agentTel: "",
    name: "SERDAR",
    surname: "ANNAGULIYEV",
    yolagcyTel: "+99361234567",
    dob: "1990-02-11",
    milesSmiles: "",
    passportId: "B1122334",
    pcoi: "TC",
    pdoe: "2027-09-01",
    status: "REISSUE",
    pnr: "V7GN8C",
    ticketNumber: "2352212891112",
    route: "ECN-IST-ASB",
    flightClass: "YH",
    flightDate: "2026-07-14",
    total: 1200,
    baseFare: 950,
    aydylanBaha: 1200,
    accepted: 1000,
    changeAmount: 0,
    kassir: "AYLAR",
    bellik: "VIP client, priority seating",
  },
  {
    id: "ta-3",
    date: "2026-06-18",
    operator: "ATABAY",
    ofis: "LB",
    op2: "AYLAR",
    op2Ofis: "LB",
    agent: "",
    agentTel: "",
    name: "MERYEM",
    surname: "HUDAEVA",
    yolagcyTel: "+99362998877",
    dob: "1995-11-30",
    milesSmiles: "TK9982341",
    passportId: "C5566778",
    pcoi: "TURKMENISTAN",
    pdoe: "2026-12-15",
    status: "REFUND",
    pnr: "TA3234",
    ticketNumber: "2352212893321",
    route: "ASB-IST-ASB",
    flightClass: "OO",
    flightDate: "2026-06-20",
    total: 700,
    baseFare: 500,
    aydylanBaha: 700,
    accepted: 700,
    changeAmount: -700,
    kassir: "Lbdan",
    bellik: "Refunded due to schedule change",
  },
  {
    id: "ta-4",
    date: "2026-06-20",
    operator: "POLAT",
    ofis: "AYLAR",
    op2: "",
    op2Ofis: "",
    agent: "",
    agentTel: "",
    name: "AYNA",
    surname: "MAMMEDOVA",
    yolagcyTel: "+99365443322",
    dob: "1988-05-04",
    milesSmiles: "",
    passportId: "D7788990",
    pcoi: "KKTC",
    pdoe: "2029-01-20",
    status: "VOID",
    pnr: "TA9981",
    ticketNumber: "2352212894456",
    route: "IST-ANK",
    flightClass: "L",
    flightDate: "2026-06-25",
    total: 0,
    baseFare: 0,
    aydylanBaha: 0,
    accepted: 0,
    changeAmount: 0,
    kassir: "AYLAR",
    bellik: "Ticket cancelled by client",
  },
];

const TurkishAirlines = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();
  const [searchQuery, setSearchQuery] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const filteredData = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (!normalizedQuery) return initialData;
    return initialData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [searchQuery]);

  const statusColors = {
    SALE: { dot: "#16a34a", text: "#15803d", bg: "#dcfce7" },
    REISSUE: { dot: "#2563eb", text: "#1d4ed8", bg: "#dbeafe" },
    REFUND: { dot: "#ea580c", text: "#c2410c", bg: "#ffedd5" },
    VOID: { dot: "#6b7280", text: "#374151", bg: "#f3f4f6" },
  };

  const columns = useMemo(
    () => [
      {
        id: "rowNumber",
        header: "#",
        size: 50,
        enableSorting: false,
        Cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "date",
        header: t("columns.issueDate"),
        size: 100,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        id: "operator",
        header: t("columns.operator") ?? "Operator",
        size: 150,
        accessorFn: (row) => row.operator ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.operator}
            secondary={row.original.ofis}
          />
        ),
      },
      {
        id: "op2",
        header: t("columns.operatorTwo"),
        size: 150,
        accessorFn: (row) => row.op2 ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.op2}
            secondary={row.original.op2Ofis}
          />
        ),
      },
      {
        id: "agent",
        header: t("columns.agent") ?? "Agent",
        size: 150,
        accessorFn: (row) => row.agent ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.agent}
            secondary={row.original.agentTel}
          />
        ),
      },
      {
        id: "fullName",
        header: t("columns.client"),
        size: 200,
        accessorFn: (row) => `${row.name ?? ""} ${row.surname ?? ""}`.trim(),
        Cell: ({ row }) => (
          <StackedCell
            primary={`${row.original.name ?? ""} ${row.original.surname ?? ""}`.trim()}
            secondary={row.original.yolagcyTel}
          />
        ),
      },
      {
        accessorKey: "dob",
        header: t("columns.dateOfBirth"),
        size: 110,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      // {
      //   accessorKey: "milesSmiles",
      //   header: t("columns.milesSmiles"),
      //   size: 130,
      // },
      {
        accessorKey: "passportId",
        header: t("columns.passportNumber"),
        size: 130,
      },
      {
        accessorKey: "pcoi",
        header: t("columns.passportCountryOfIssue"),
        size: 130,
      },
      {
        accessorKey: "pdoe",
        header: t("columns.passportExpiryDate"),
        size: 110,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "status",
        header: t("columns.status") ?? "Status",
        size: 130,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          const colors = statusColors[value] ?? statusColors.VOID;
          return (
            <Chip
              size="small"
              label={value}
              sx={{
                fontWeight: 700,
                color: colors.text,
                bgcolor: colors.bg,
                "& .MuiChip-label": {
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                },
              }}
              icon={
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: colors.dot,
                    ml: 1,
                  }}
                />
              }
            />
          );
        },
      },
      {
        accessorKey: "pnr",
        header: "PNR",
        size: 110,
      },
      {
        accessorKey: "ticketNumber",
        header: t("columns.ticketNumber") ?? "Ticket #",
        size: 160,
      },
      {
        accessorKey: "route",
        header: t("columns.route") ?? "Route",
        size: 140,
      },
      {
        accessorKey: "flightClass",
        header: t("columns.class") ?? "Class",
        size: 90,
      },
      {
        accessorKey: "flightDate",
        header: t("columns.flightDate") ?? "Flight Date",
        size: 120,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "baseFare",
        header: t("columns.baseFare"),
        size: 110,
        Cell: ({ cell }) => `$${Number(cell.getValue() ?? 0).toFixed(2)}`,
      },
      {
        id: "totalCollected",
        header: t("columns.total") ?? "Total ($)",
        size: 120,
        accessorFn: (row) => row.total ?? 0,
        Cell: ({ row }) => (
          <StackedCell
            primary={`$${Number(row.original.aydylanBaha ?? 0).toFixed(2)}`}
            secondary={`$${Number(row.original.total ?? 0).toFixed(2)}`}
          />
        ),
      },
      {
        accessorKey: "accepted",
        header: t("columns.accepted") ?? "Accepted",
        size: 110,
        Cell: ({ cell }) => `$${Number(cell.getValue() ?? 0).toFixed(2)}`,
      },
      {
        accessorKey: "changeAmount",
        header: t("columns.changeAmount"),
        size: 110,
        Cell: ({ cell }) => `$${Number(cell.getValue() ?? 0).toFixed(2)}`,
      },
      {
        accessorKey: "kassir",
        header: t("columns.cashier"),
        size: 110,
      },
      {
        accessorKey: "bellik",
        header: t("columns.note"),
        size: 200,
      },
    ],
    [t, formatChange],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: filteredData,
    state: { ...defaultMrtOptions.state, rowSelection },
    onRowSelectionChange: setRowSelection,
    renderTopToolbarCustomActions: () => (
      <GlobalSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t("search") ?? "Search..."}
      />
    ),
    renderBottomToolbar: ({ table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      const pageCount = table.getPageCount();

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
            totalRows={filteredData.length}
            onPageChange={(newIndex) => table.setPageIndex(newIndex)}
          />
        </Box>
      );
    },
    muiTablePaperProps: {
      sx: () => ({
        ...defaultMrtOptions.muiTablePaperProps?.sx,
      }),
    },
  });

  return (
    <>
      <PageHeader
        title={t("pages.ticket.turkish.title") ?? "Turkish Airlines"}
        pageTitle={`${t("pages.ticket.turkish.title") ?? "Turkish Airlines"} | Oguz Travel`}
        onAddClick={() => {
          setEditingTicket(null);
          setCreateOpen(true);
        }}
      />

      <MaterialReactTable table={table} />

      <AddTurkishAirlinesContent
        open={createOpen}
        ticket={editingTicket}
        onClose={() => {
          setCreateOpen(false);
          setEditingTicket(null);
        }}
        // onSave={(values) => {
        //   if (editingTicket) {
        //     updateTicket(editingTicket.id, values);
        //   } else {
        //     addTicket(values);
        //   }
        // }}
      />
    </>
  );
};

export default TurkishAirlines;
