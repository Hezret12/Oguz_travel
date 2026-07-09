import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo, useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import { Box } from "@mui/material";
import StackedCell from "../../components/inputs/StackCell";
import { useDateFormat } from "../../functions/generalHelpers";

const initialData = [
  {
    id: "AG1/O7-24",
    date: "2024-10-21",
    fullName: "ROZYKULOV DOVLET",
    tel: "+99361890318",
    passportNumber: "A0840437",
    dob: "1994-08-31",
    agent: null,
    agentTel: null,
    hyzmat: "KONSULTASIA",
    otelBron: null,
    terjime: null,
    copyScan: null,
    photo: null,
    jemiTmt: 50,
    jemiUsd: null,
  },
  {
    id: "AG1/O7-25",
    date: "2024-10-21",
    fullName: "HOJAMBERDIYEVA TAVUS",
    tel: "+99363825583",
    passportNumber: "A2586045",
    dob: "1983-07-31",
    agent: null,
    agentTel: null,
    hyzmat: "KONSULTASIA",
    otelBron: null,
    terjime: "1 SAHYPA",
    copyScan: "SROCNY",
    photo: null,
    jemiTmt: 100,
    jemiUsd: null,
  },
  {
    id: "row-2647",
    date: "2026-06-08",
    fullName: "RUSLAN",
    tel: null,
    passportNumber: null,
    dob: null,
    agent: null,
    agentTel: null,
    hyzmat: null,
    otelBron: null,
    terjime: null,
    copyScan: null,
    photo: null,
    jemiTmt: 50,
    jemiUsd: null,
  },
  {
    id: "row-2648",
    date: "2026-06-09",
    fullName: "MURADOVA YAVAR",
    tel: null,
    passportNumber: "A2365741",
    dob: "1954-02-10",
    agent: null,
    agentTel: null,
    hyzmat: null,
    otelBron: null,
    terjime: null,
    copyScan: null,
    photo: null,
    jemiTmt: 300,
    jemiUsd: null,
  },
];

const Visa = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();
  const [rowSelection, setRowSelection] = useState({});

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
        id: "client",
        header: t("columns.client"), 
        size: 200,
        accessorFn: (row) => row.fullName ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.fullName}
            secondary={row.original.tel}
          />
        ),
      },
      {
        accessorKey: "passportNumber", 
        header: t("columns.passportNumber") ?? "Passport №",
        size: 130,
      },
      {
        accessorKey: "dob",
        header: t("columns.dateOfBirth"),
        size: 110,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
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
        accessorKey: "hyzmat",
        header: t("columns.service") ?? "Hyzmat",
        size: 140,
      },
      {
        accessorKey: "otelBron",
        header: t("columns.hotelBron") ?? "Otel Bron",
        size: 110,
      },
      {
        accessorKey: "terjime",
        header: t("columns.translation") ?? "Terjime",
        size: 110,
      },
      {
        id: "totalCollected",
        header: t("columns.total") ?? "Jemi",
        size: 150,
        accessorFn: (row) => row.jemiUsd ?? 0,
        Cell: ({ row }) => (
          <StackedCell
            primary={`${Number(row.original.jemiTmt ?? 0).toFixed(2)} TMT`} 
            secondary={`$${Number(row.original.jemiUsd ?? 0).toFixed(2)}`} 
          />
        ),
      },
    ],
    [t, formatChange],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: initialData,
    state: {
      ...defaultMrtOptions.state,
      rowSelection,
    },
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    // renderTopToolbarCustomActions: () => (
    //   <GlobalSearchInput
    //     value={searchQuery}
    //     onChange={setSearchQuery}
    //     placeholder={t("search") ?? "Ara..."}
    //     disabled={isLoading}
    //   />
    // ),
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
            // totalRows={filteredUsers.length}
            onPageChange={(newIndex) => table.setPageIndex(newIndex)}
          />
        </Box>
      );
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: row.getToggleSelectedHandler(),
      sx: (theme) => ({
        cursor: "pointer",
        backgroundColor: row.getIsSelected()
          ? theme.palette.mode === "dark"
            ? "rgba(0, 114, 229, 0.2) !important"
            : "rgba(0, 114, 229, 0.1) !important"
          : "inherit",
        "&:hover": {
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.04)",
        },
      }),
    }),
    muiTablePaperProps: {
      sx: () => ({
        ...defaultMrtOptions.muiTablePaperProps?.sx,
      }),
    },
  });

  return (
    <>
      <PageHeader
        title={t("pages.users.title")}
        pageTitle={`${t("pages.users.title")} | Oguz Travel`}
        addButtonText={t("pages.users.add")}
        // onAddClick={handleAddUserClick}
        filterButtonText={t("pages.users.filter")}
      />

      <MaterialReactTable table={table} />
    </>
  );
};

export default Visa;