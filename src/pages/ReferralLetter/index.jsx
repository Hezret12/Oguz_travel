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
import AddReferralLetterModal from "./AddReferralLetterModal";

const initialData = [
  {
    id: 1,
    arzaNo: "AG1/O7-24",
    operator: "Operator 1",
    ofis: "Ashgabat",
    agent: "Agent 1",
    agentTel: "+99361234567",
    name: "ROZYKULOV",
    surname: "DOVLET",
    yolagcyTel: "+99361890318",
    gender: "Erkek",
    dateOfBirth: "1994-08-31",
    passportNumber: "A0840437",
    destinationCountry: "Türkiye",
    tranzit: "",
    syhNo: "SYH-001",
    syhHighlighted: false,
    departureDate: "2024-10-21",
    returnDate: "2024-10-28",
    price: 50,
    contractNo: "S001",
    contractDate: "2024-10-20",
    note: "",
  },
];
const ReferalLetter = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { formatChange } = useDateFormat();
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);

  const columns = useMemo(
    () => [
      {
        id: "rowNumber",
        header: "№",
        size: 60,
        enableSorting: false,
        Cell: ({ row }) => row.index + 1,
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
        accessorKey: "gender",
        header: t("columns.gender"),
        size: 80,
      },
      {
        accessorKey: "dateOfBirth",
        header: t("columns.dateOfBirth"),
        size: 110,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "passportNumber", // Passport №
        header: t("columns.passportNumber") ?? "Passport №",
        size: 110,
      },
      {
        accessorKey: "destinationCountry", // Gidýän ýurdy
        header: t("columns.destinationCountry"),
        size: 110,
      },
      {
        accessorKey: "tranzit", // Tranzit
        header: t("columns.transit"),
        size: 90,
      },
      {
        accessorKey: "syhNo", // S-ÝH №
        header: t("columns.syhNo") ?? "S-ÝH №",
        size: 100,
        Cell: ({ row, cell }) => {
          const value = cell.getValue();
          const isHighlighted = row.original.syhHighlighted;
          return (
            <Box
              component="span"
              sx={{
                display: "inline-block",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: isHighlighted ? "error.main" : "transparent",
                color: isHighlighted ? "error.contrastText" : "inherit",
                fontWeight: isHighlighted ? 700 : 400,
              }}
            >
              {value}
            </Box>
          );
        },
      },
      {
        accessorKey: "departureDate", // Gidýän wagty
        header: t("columns.departureDate") ?? "Gidýän wagty",
        size: 120,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "returnDate", // Gelýän wagty
        header: t("columns.returnDate") ?? "Gelýän wagty",
        size: 120,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "price", // Bahasy (TMT)
        header: t("price"),
        size: 130,
        Cell: ({ cell }) => `${Number(cell.getValue() ?? 0).toFixed(2)} TMT`,
      },
      {
        accessorKey: "sertnamaNo", // şertnama №
        header: t("columns.contractNo") ?? "şertnama №",
        size: 110,
      },
      {
        accessorKey: "sertnamaSene", // şertnama sene
        header: t("columns.contractDate"),
        size: 120,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "note",
        header: t("columns.note"),
        size: 200,
      },
    ],
    [t, formatChange],
  );

  const handleAddUserClick = () => {
    setModalOpen(true);
  };

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data,
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
        title={t("pages.referralLetter.title") ?? "Referral Letters"}
        pageTitle={`${t("pages.referralLetter.title") ?? "Referral Letters"} | Oguz Travel`}
        addButtonText={t("pages.referralLetter.add") ?? "Add Referral"}
        onAddClick={handleAddUserClick}
      />

      <MaterialReactTable table={table} />

      <AddReferralLetterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(values) => {
          setData((prev) => [{ id: Date.now(), ...values }, ...prev]);
          setModalOpen(false);
        }}
      />
    </>
  );
};

export default ReferalLetter;
