import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../hooks/useLocale";
import PageHeader from "../../components/PageHeader";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import Pagination from "../../components/Pagination";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useClientSearch } from "../../hooks/useClientSearch";
import { useDispatch } from "react-redux";
import { openAddClientModal } from "../../store/slices/modalSlice";

const formatDate = (value) => {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  return `${day}.${month}.${year}`;
};

const Clients = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const dispatch = useDispatch();
  const [rowSelection, setRowSelection] = useState({});

  const { clients, isLoading, searchQuery, setSearchQuery } = useClientSearch();

  const columns = useMemo(
    () => [
      {
        id: "rowNumber",
        header: "#",
        size: 10,
        enableSorting: false,
        Cell: ({ row, table }) => {
          const { pageIndex, pageSize } = table.getState().pagination ?? {
            pageIndex: 0,
            pageSize: clients.length,
          };

          return (
            <Box sx={{ color: "text.secondary", fontWeight: 500 }}>
              {pageIndex * (pageSize || clients.length) + row.index + 1}
            </Box>
          );
        },
      },
      {
        accessorFn: (row) => row.fullName,
        id: "fullName",
        header: t("clients.columns.fullName") ?? "Full Name",
        size: 180,
      },
      {
        accessorFn: (row) => row.phoneNumber,
        id: "phoneNumber",
        header: t("clients.columns.phoneNumber") ?? "Phone Number",
        size: 150,
        Cell: ({ cell }) => `+993 ${cell.getValue()}`,
      },
      {
        accessorFn: (row) => row.dateOfBirth,
        id: "dateOfBirth",
        header: t("clients.columns.dateOfBirth") ?? "Date of Birth",
        size: 150,
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        accessorFn: (row) => row.passportNumber,
        id: "passportNumber",
        header: t("clients.columns.passportNumber") ?? "Passport Number",
        size: 150,
      },
      {
        accessorFn: (row) => row.passportExpiryDate,
        id: "passportExpiryDate",
        header: t("clients.columns.passportExpiryDate") ?? "Passport Expiry Date",
        size: 160,
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        accessorFn: (row) => row.passportCountryOfIssue,
        id: "passportCountryOfIssue",
        header: t("clients.columns.passportCountryOfIssue") ?? "Passport Country of Issue",
        size: 180,
      },
      {
        accessorFn: (row) => row.gender,
        id: "gender",
        header: t("clients.columns.gender") ?? "Gender",
        size: 120,
        Cell: ({ cell }) => (
          <Box sx={{ fontWeight: 500 }}>
            {cell.getValue() === "Women"
              ? t("clients.genderWomen") ?? "Women"
              : t("clients.genderMen") ?? "Men"}
          </Box>
        ),
      },
      {
        id: "actions",
        header: t("clients.columns.actions") ?? "Actions",
        size: 100,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Box
              component="button"
              onClick={(e) => {
                e.stopPropagation();
                console.log("TODO: edit client", row.original);
              }}
              sx={(theme) => ({
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                borderRadius: "7px",
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                color: theme.palette.text.secondary,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
                "&:hover": {
                  backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.09)",
                  borderColor: theme.palette.text.secondary,
                  color: theme.palette.text.primary,
                  transform: "translateY(-1px)",
                },
                "&:active": { transform: "scale(0.95)" },
              })}
            >
              <EditIcon sx={{ fontSize: 14 }} />
            </Box>

            <Box
              component="button"
              onClick={(e) => {
                e.stopPropagation();
                console.log("TODO: delete client", row.original);
              }}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                borderRadius: "7px",
                border: "1px solid rgba(239,68,68,0.35)",
                backgroundColor: "rgba(239,68,68,0.07)",
                color: "#ef4444",
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
                "&:hover": {
                  backgroundColor: "rgba(239,68,68,0.15)",
                  borderColor: "#ef4444",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.25)",
                },
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
            </Box>
          </Box>
        ),
      },
    ],
    [clients.length, t]
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: clients,
    state: {
      ...defaultMrtOptions.state,
      rowSelection,
      isLoading,
    },
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    renderTopToolbarCustomActions: () => (
      <GlobalSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t("search") ?? "Search..."}
        disabled={isLoading}
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
            totalRows={clients.length}
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
        title={t("clients.title") ?? "Clients"}
        pageTitle={`${t("clients.title") ?? "Clients"} | Oguz Travel`}
        addButtonText={t("clients.add") ?? "Add Client"}
        onAddClick={() => dispatch(openAddClientModal())}
      />

      <MaterialReactTable table={table} />
    </>
  );
};

export default Clients;
