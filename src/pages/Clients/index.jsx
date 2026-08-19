import { useMemo, useState, useCallback } from "react";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { FileUp } from "lucide-react";
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
import ClientFilter from "./Contents/ClientFilter";
import ClientDocumentModal from "../../components/Dialog/ClientDocumentModal";
import { usePageFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import {
  clientFilterActions,
  clientFilterSelectors,
} from "../../store/slices/filters/clientFilterSlice";
import FilterDrawer from "../../components/FilterDrawer";
import { getAllClientsApi } from "../../api/queries/getters";
import DeleteDialog from "../../components/DeleteDialog";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { deleteClient } from "../../api/queries/delete";

const formatDate = (value) => {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  return `${day}.${month}.${year}`;
};

const Clients = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const [rowSelection, setRowSelection] = useState({});
  const [selectedDocClient, setSelectedDocClient] = useState(null);

  const {
    applied,
    draft,
    isDrawerOpen,
    openDrawer,
    setDraftFilter,
    setFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
    searchQuery,
    setSearch,
    page,
    limit,
    setPage,
    setPageSize,
    setSort,
    selectsOpen,
    openSelect,
    closeSelect,
    queryParams,
  } = usePageFilters({
    actions: clientFilterActions,
    selectors: clientFilterSelectors,
  });

  const {
    data: clientsData,
    isLoading,
    isFetching,
    refetch,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllClientsApi,
    key: "clients",
    params: queryParams,
  });

  const { mutate: deleteClientMutate, isPending: isDeleting } = useDelete({
    deleteFn: deleteClient,
    queryKey: "clients",
    idKey: "guid",
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (client) => deleteClientMutate(client.guid),
  });

  const handleDeleteClick = useCallback(
    (client) => deleteDialog.open(client),
    [deleteDialog],
  );

  const getFilterChipLabel = useCallback(
    (key, value) => {
      if (key === "gender") {
        const label =
          value === "Female" || value === "Women"
            ? t("clients.genderWomen")
            : value === "Male" || value === "Men"
              ? t("clients.genderMen")
              : value;
        return `${t(`columns.${key}`)}: ${label}`;
      }
      if (
        key === "dateOfBirth" ||
        key === "passportIssueDate" ||
        key === "passportExpiryDate"
      ) {
        return `${t(`columns.${key}`)}: ${formatDate(value)}`;
      }
      return `${t(`columns.${key}`)}: ${value}`;
    },
    [t],
  );

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.index_number,
        id: "index_number",
        header: "№",
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
        accessorFn: (row) => row.phone_number,
        id: "phone_number",
        header: t("columns.phoneNumber"),
        size: 150,
      },
      {
        accessorFn: (row) => row.dateOfBirth,
        id: "dateOfBirth",
        header: t("columns.dateOfBirth"),
        size: 150,
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        accessorFn: (row) => row.passport_number,
        id: "passport_number",
        header: t("columns.passportNumber"),
        size: 150,
      },
      {
        accessorFn: (row) => row.passportIssueDate || row.passport_issue_date,
        id: "passportIssueDate",
        header: t("columns.passportIssueDate"),
        size: 160,
        Cell: ({ cell }) => formatDate(cell.getValue()),
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
        Cell: ({ cell }) => {
          const val = cell.getValue();
          if (!val) return "-";
          return (
            <Box sx={{ fontWeight: 500 }}>
              {val === "Female" || val === "Women"
                ? t("clients.genderWomen")
                : val === "Male" || val === "Men"
                  ? t("clients.genderMen")
                  : val}
            </Box>
          );
        },
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 115,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        Cell: ({ row, table }) => {
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Tooltip title={t("clients.documents")} arrow>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur();
                    setSelectedDocClient(row.original);
                  }}
                  size="small"
                  aria-label={t("clients.documents")}
                  sx={(theme) => ({
                    borderRadius: "7px",
                    border:
                      theme.palette.mode === "dark"
                        ? "1px solid rgba(99, 102, 241, 0.35)"
                        : "1px solid rgba(79, 70, 229, 0.30)",
                    background:
                      theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(79, 70, 229, 0.08) 100%)"
                        : "linear-gradient(135deg, rgba(99, 102, 241, 0.14) 0%, rgba(79, 70, 229, 0.06) 100%)",
                    color: theme.palette.mode === "dark" ? "#818cf8" : "#4f46e5",
                    transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background:
                        theme.palette.mode === "dark"
                          ? "linear-gradient(135deg, rgba(99, 102, 241, 0.28) 0%, rgba(79, 70, 229, 0.18) 100%)"
                          : "linear-gradient(135deg, rgba(99, 102, 241, 0.24) 0%, rgba(79, 70, 229, 0.14) 100%)",
                      borderColor:
                        theme.palette.mode === "dark" ? "#818cf8" : "#6366f1",
                      transform: "translateY(-1.5px)",
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 3px 12px rgba(99, 102, 241, 0.35)"
                          : "0 3px 10px rgba(79, 70, 229, 0.25)",
                    },
                    "&:active": { transform: "scale(0.94)" },
                  })}
                >
                  <FileUp size={15} strokeWidth={2.2} />
                </IconButton>
              </Tooltip>

              <ColumnActionButtons
                row={row}
                table={table}
                onDelete={handleDeleteClick}
              />
            </Box>
          );
        },
      },
    ],
    [t, handleDeleteClick],
  );

  const activeFilters = useMemo(
    () =>
      Object.entries(applied).filter(
        ([key, value]) =>
          key !== "search" &&
          value !== "" &&
          value !== null &&
          value !== undefined,
      ),
    [applied],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: clientsData,

    state: {
      rowSelection,
      isLoading: isLoading || isFetching,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },

    getRowId: (row) => row.guid,
    onRowSelectionChange: setRowSelection,

    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount,
    rowCount: totalItems,

    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(table.getState().pagination)
          : updater;
      if (next.pageIndex !== undefined) setPage(next.pageIndex + 1);
      if (next.pageSize !== undefined) setPageSize(next.pageSize);
    },

    onSortingChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(table.getState().sorting)
          : updater;
      if (next && next.length > 0) {
        setSort(next[0].id, next[0].desc ? "desc" : "asc");
      } else {
        setSort("", "asc");
      }
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

        {activeFilters.map(([key, value]) => (
          <Chip
            key={key}
            label={getFilterChipLabel(key, value)}
            onDelete={() => setFilter(key, "")}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              borderRadius: "8px",
              height: "32px",
              fontWeight: 500,
              "& .MuiChip-deleteIcon": {
                color: "primary.main",
                transition: "all 0.15s ease",
              },
            }}
          />
        ))}
      </Box>
    ),

    renderBottomToolbar: ({ table }) => {
      const { pageIndex } = table.getState().pagination;
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
          })}
        >
          <Box />
          <Pagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            totalRows={totalItems}
            onPageChange={(newIndex) => setPage(newIndex + 1)}
          />
        </Box>
      );
    },
    renderCreateRowDialogContent: ({ table }) => <AddClient table={table} />,
    renderEditRowDialogContent: ({ table, row }) => (
      <EditClient table={table} row={row} queryParams={queryParams} />
    ),
  });

  return (
    <>
      <PageHeader
        title={t("clients.title")}
        pageTitle={`${t("clients.title")} | Oguz Travel`}
        addButtonText={t("addClient")}
        onAddClick={() => table.setCreatingRow(true)}
        filterButtonText={t("filter")}
        onFilterClick={openDrawer}
      />

      <FilterDrawer
        open={isDrawerOpen}
        onClose={cancelFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        onCancel={cancelFilters}
      >
        <ClientFilter
          filters={draft}
          selectsOpen={selectsOpen}
          onFilterChange={setDraftFilter}
          onSelectOpen={openSelect}
          onSelectClose={closeSelect}
        />
      </FilterDrawer>

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("clients.deleteConfirm")}
      />

      <MaterialReactTable table={table} />

      {selectedDocClient && (
        <ClientDocumentModal
          open={Boolean(selectedDocClient)}
          onClose={() => setSelectedDocClient(null)}
          client={selectedDocClient}
          onRefresh={refetch}
        />
      )}
    </>
  );
};

export default Clients;
