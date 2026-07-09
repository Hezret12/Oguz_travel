import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../hooks/useLocale";
import PageHeader from "../../components/PageHeader";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import Pagination from "../../components/Pagination";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import AddClient from "./Contents/AddClient";
import EditClient from "./Contents/EditClient";

const formatDate = (value) => {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  return `${day}.${month}.${year}`;
};

const Clients = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo(
    () => [
      {
        id: "rowNumber",
        header: "#",
        size: 10,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.fullName,
        id: "fullName",
        header: t("columns.fullName"),
        size: 180,
      },
      {
        accessorFn: (row) => row.phoneNumber,
        id: "phoneNumber",
        header: t("columns.phoneNumber"),
        size: 150,
        Cell: ({ cell }) => `+993 ${cell.getValue()}`,
      },
      {
        accessorFn: (row) => row.dateOfBirth,
        id: "dateOfBirth",
        header: t("columns.dateOfBirth"),
        size: 150,
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        accessorFn: (row) => row.passportNumber,
        id: "passportNumber",
        header: t("columns.passportNumber"),
        size: 150,
      },
      {
        accessorFn: (row) => row.passportExpiryDate,
        id: "passportExpiryDate",
        header: t("columns.passportExpiryDate"),
        size: 160,
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        accessorFn: (row) => row.passportCountryOfIssue,
        id: "passportCountryOfIssue",
        header: t("columns.passportCountryOfIssue"),
        size: 180,
      },
      {
        accessorFn: (row) => row.gender,
        id: "gender",
        header: t("columns.gender"),
        size: 120,
        Cell: ({ cell }) => (
          <Box sx={{ fontWeight: 500 }}>
            {cell.getValue() === "Women"
              ? t("pages.clients.genderWomen")
              : t("pages.clients.genderMen")}
          </Box>
        ),
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 100,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <ColumnActionButtons row={row} table={table} />
        ),
      },
    ],
    [t],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: [],
    state: {
      ...defaultMrtOptions.state,
      rowSelection,
    },
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    renderTopToolbarCustomActions: () => (
      <GlobalSearchInput
      // value={searchQuery}
      // onChange={setSearchQuery}
      // placeholder={t("search") ?? "Search..."}
      // disabled={isLoading}
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
            // totalRows={clients.length}
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
    renderCreateRowDialogContent: ({ table }) => <AddClient table={table} />,
    renderEditRowDialogContent: ({ table, row }) => (
      <EditClient table={table} row={row} />
    ),
  });

  return (
    <>
      <PageHeader
        title={t("pages.clients.title")}
        pageTitle={`${t("pages.clients.title")} | Oguz Travel`}
        addButtonText={t("pages.clients.add")}
        onAddClick={() => table.setCreatingRow(true)}
      />

      <MaterialReactTable table={table} />
    </>
  );
};

export default Clients;
