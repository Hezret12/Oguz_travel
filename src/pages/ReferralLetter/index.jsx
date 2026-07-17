import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo, useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import { Box, IconButton } from "@mui/material";
import StackedCell from "../../components/inputs/StackCell";
import { useDateFormat } from "../../functions/generalHelpers";
import AddReferralLetterModal from "./AddReferralLetterModal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteDialog from "../../components/DeleteDialog";
import toast from "react-hot-toast";

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  TMT: "m",
  RUB: "₽",
};

const initialData = [
  {
    id: 1,
    client_guid: "mock-client-guid",
    application_number: "AG1/O7-24",
    received_opr_guid: "mock-received-opr-guid",
    operator: "Operator 1",
    ofis: "Ashgabat",
    agent: {
      name: "Agent 1",
      phone_number: "+99361234567",
    },
    name: "ROZYKULOV",
    surname: "DOVLET",
    yolagcyTel: "+99361890318",
    gender: "Male",
    dateOfBirth: "1994-08-31",
    passportNumber: "A0840437",
    destination_country: "Türkiye",
    tranzit: "",
    travel_document_number: "SYH-001",
    syhHighlighted: false,
    departure_date: "2024-10-21",
    return_date: "2024-10-28",
    price: 50,
    currency: "USD",
    is_paid: true,
    contract_number: "S001",
    contract_date: "2024-10-20",
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
  const [editItem, setEditItem] = useState(null);
  
  // Delete Dialog State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleEditClick = (item) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    setData((prev) => prev.filter((item) => item.id !== deleteId));
    setDeleteOpen(false);
    setDeleteId(null);
    toast.success(t("pages.referralLetter.deleteSuccess", "Referral deleted successfully!"));
  };

  const handleSave = (values) => {
    if (editItem) {
      setData((prev) =>
        prev.map((item) => (item.id === editItem.id ? { ...item, ...values } : item))
      );
    } else {
      setData((prev) => [{ id: Date.now(), ...values }, ...prev]);
    }
  };

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
        accessorFn: (row) => row.agent?.name ?? row.agent ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.agent?.name ?? row.original.agent}
            secondary={row.original.agent?.phone_number ?? row.original.agentTel}
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
        size: 90,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return val === "Male"
            ? t("pages.clients.genderMen", "Erkek")
            : val === "Female"
            ? t("pages.clients.genderWomen", "Aýal")
            : val;
        },
      },
      {
        accessorKey: "dateOfBirth",
        header: t("columns.dateOfBirth"),
        size: 110,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "passportNumber",
        header: t("columns.passportNumber") ?? "Passport №",
        size: 110,
      },
      {
        accessorKey: "destination_country",
        header: t("columns.destinationCountry"),
        size: 110,
      },
      {
        accessorKey: "tranzit",
        header: t("columns.transit"),
        size: 90,
      },
      {
        accessorKey: "travel_document_number",
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
        accessorKey: "departure_date",
        header: t("columns.departureDate") ?? "Gidýän wagty",
        size: 120,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "return_date",
        header: t("columns.returnDate") ?? "Gelýän wagty",
        size: 120,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "price",
        header: t("price"),
        size: 130,
        Cell: ({ row, cell }) => {
          const amount = cell.getValue();
          const currency = row.original.currency || "USD";
          const symbol = CURRENCY_SYMBOLS[currency] || currency;
          return `${symbol}${Number(amount ?? 0).toFixed(2)}`;
        },
      },
      {
        accessorKey: "is_paid",
        header: t("columns.paymentStatus"),
        size: 120,
        Cell: ({ cell }) => {
          const isPaid = cell.getValue();
          return (
            <Box
              component="span"
              sx={{
                display: "inline-block",
                px: 1.5,
                py: 0.5,
                borderRadius: "12px",
                fontSize: "0.75rem",
                fontWeight: 700,
                backgroundColor: isPaid
                  ? "rgba(76, 175, 80, 0.12)"
                  : "rgba(244, 67, 54, 0.12)",
                color: isPaid ? "#4caf50" : "#f44336",
              }}
            >
              {isPaid
                ? t("pages.ticket.payment.paid", "Tolendi")
                : t("pages.ticket.payment.credit", "Kredit")}
            </Box>
          );
        },
      },
      {
        accessorKey: "contract_number",
        header: t("columns.contractNo") ?? "şertnama №",
        size: 110,
      },
      {
        accessorKey: "contract_date",
        header: t("columns.contractDate"),
        size: 120,
        Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true }),
      },
      {
        accessorKey: "note",
        header: t("columns.note"),
        size: 200,
      },
      {
        id: "actions",
        header: t("columns.actions") ?? "Actions",
        size: 110,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(row.original);
              }}
              color="primary"
              size="small"
              sx={(theme) => ({
                borderRadius: "7px",
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                color: theme.palette.text.secondary,
                transition: "all 0.15s ease",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(0,0,0,0.09)",
                  borderColor: theme.palette.text.secondary,
                  color: theme.palette.text.primary,
                  transform: "translateY(-1px)",
                },
                "&:active": { transform: "scale(0.95)" },
              })}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row.original.id);
              }}
              color="error"
              size="small"
              sx={{
                borderRadius: "7px",
                border: "1px solid rgba(239,68,68,0.35)",
                backgroundColor: "rgba(239,68,68,0.07)",
                color: "#ef4444",
                transition: "all 0.15s ease",
                "&:hover": {
                  backgroundColor: "rgba(239,68,68,0.15)",
                  borderColor: "#ef4444",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.25)",
                },
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ),
      },
    ],
    [t, formatChange],
  );

  const handleAddClick = () => {
    setEditItem(null);
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
        onAddClick={handleAddClick}
      />

      <MaterialReactTable table={table} />

      <AddReferralLetterModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        editItem={editItem}
        onSave={handleSave}
      />

      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        description={t("pages.referralLetter.deleteConfirm", "Are you sure you want to delete this referral letter?")}
      />
    </>
  );
};

export default ReferalLetter;
