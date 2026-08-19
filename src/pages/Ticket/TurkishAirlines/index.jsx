import { useMemo, useState, useCallback } from "react";
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
import EditTurkishAirlinesContent from "./CRUD/editTurkishAirlinesContent";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import { useDateFormat } from "../../../functions/generalHelpers";
import StackedCell from "../../../components/inputs/StackCell";
import StatusChip from "../../../components/StatusChip";
import { SALE_STATUS_CONFIG } from "../../../functions/statusChipConfigs";
import { usePageFilters } from "../../../hooks/usePageFilters";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useGet } from "../../../hooks/CRUD/useGet";
import DeleteDialog from "../../../components/DeleteDialog";
import { PaymentManagementModal } from "../../../components/Dialog/PaymentManagementModal";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { deleteTurkishAirlinesApi } from "../../../api/queries/delete";
import {
  turkishAirlinesFilterActions,
  turkishAirlinesFilterSelectors,
} from "../../../store/slices/filters/turkishAirlinesFilterSlice";
import {
  getAllTurkishAirlinesApi,
  getAllStatusApi,
  getAllEmployeeApi,
  getAllOfficeApi,
} from "../../../api/queries/getters";
import PaymentStatusCell from "../../../components/PaymentStatusCell";

import FilterDrawer from "../../../components/FilterDrawer";
import TurkishAirlinesFilter from "./Contents/TurkishAirlinesFilter";

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  TMT: "m",
  RUB: "₽",
};

const TurkishAirlines = () => {
  const { t, selectedLang } = useLocale();
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = getDefaultMRTOptions();
  const [rowSelection, setRowSelection] = useState({});
  const [paymentModalRow, setPaymentModalRow] = useState(null);

  const {
    applied,
    draft,
    queryParams,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
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
  } = usePageFilters({
    actions: turkishAirlinesFilterActions,
    selectors: turkishAirlinesFilterSelectors,
  });

  // Fetch status list for display
  const { data: statusList } = useGet({
    apiFn: getAllStatusApi,
    key: "status",
  });

  const statusById = useMemo(
    () =>
      Object.fromEntries((statusList || []).map((s) => [s.guid || s.id, s])),
    [statusList],
  );

  // Fetch employees for filter chip labels
  const { data: employeeList } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const employeeById = useMemo(
    () =>
      Object.fromEntries((employeeList || []).map((e) => [e.guid || e.id, e])),
    [employeeList],
  );

  // Fetch offices for filter chip labels
  const { data: officeList } = useGet({
    apiFn: getAllOfficeApi,
    key: "offices",
  });

  const officeById = useMemo(
    () =>
      Object.fromEntries((officeList || []).map((o) => [o.guid || o.id, o])),
    [officeList],
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

  const getFilterLabel = useCallback(
    (key, value) => {
      if (key === "status_guid") {
        return `${t("columns.status")}: ${selectedLang(statusById[value]?.name) || value}`;
      }
      if (key === "assignment_opr_guid") {
        return `${t("columns.operator")}: ${employeeById[value]?.fullName || value}`;
      }
      if (key === "receiver_opr_guid") {
        return `${t("columns.operatorTwo")}: ${employeeById[value]?.fullName || value}`;
      }
      if (key === "office_guid") {
        return `${t("kassa")}: ${selectedLang(officeById[value]?.shortName) || selectedLang(officeById[value]?.fullName) || value}`;
      }
      if (key === "is_paid") {
        return `${t("columns.paymentStatus")}: ${value === "true" ? t("paymentPaid") : t("paymentCredit")}`;
      }
      if (key === "datetime") {
        return `${t("columns.dateTime")}: ${formatChange(value, { dateOnly: true })}`;
      }
      if (key === "flight_date") {
        return `${t("columns.flightDate")}: ${formatChange(value, { dateOnly: true })}`;
      }
      return `${t(`columns.${key}`, key)}: ${value}`;
    },
    [t, selectedLang, statusById, employeeById, officeById, formatChange],
  );

  const getStatusKey = useCallback(
    (row) => {
      if (row.tstatus?.name?.en) return row.tstatus.name.en;
      if (row.tstatus?.name && typeof row.tstatus.name === "string")
        return row.tstatus.name;
      if (row.status?.name?.en) return row.status.name.en;
      if (row.status?.name && typeof row.status.name === "string")
        return row.status.name;
      if (typeof row.status === "string") return row.status;

      const guid = row.status_guid;
      const statusObj = statusById[guid];
      if (statusObj?.name?.en) return statusObj.name.en;
      if (statusObj?.name && typeof statusObj.name === "string")
        return statusObj.name;

      return "";
    },
    [statusById],
  );

  // Paginated data fetching matching B2B
  const {
    data: turkishData,
    isLoading,
    isFetching,
    refetch,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllTurkishAirlinesApi,
    key: "turkish-airlines",
    params: queryParams,
  });

  const { mutate: deleteTurkishAirlinesMutate, isPending: isDeleting } =
    useDelete({
      deleteFn: deleteTurkishAirlinesApi,
      queryKey: "turkish-airlines",
      idKey: "guid",
    });

  const deleteDialog = useDeleteDialog({
    onConfirm: (ticket) => deleteTurkishAirlinesMutate(ticket.guid),
  });

  const handleDeleteClick = useCallback(
    (ticket) => deleteDialog.open(ticket),
    [deleteDialog],
  );

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.index_number,
        id: "index_number",
        header: "№",
        size: 50,
        enableSorting: false,
      },
      {
        accessorKey: "datetime",
        header: t("columns.issueDate"),
        size: 80,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          if (!val) return "";
          const dateOnly = val.split("T")[0];
          return formatChange(dateOnly, { dateOnly: true });
        },
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        id: "operator",
        header: t("columns.operator"),
        size: 220,
        accessorFn: (row) => row.ta_assignment_operator?.fullName ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.ta_assignment_operator?.fullName}
            secondary={selectedLang(
              row.original.ta_assignment_operator?.office?.fullName,
            )}
          />
        ),
      },
      {
        id: "op2",
        header: t("columns.operatorTwo"),
        size: 220,
        accessorFn: (row) => row.ta_receiver_operator?.fullName ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.ta_receiver_operator?.fullName}
            secondary={selectedLang(
              row.original.ta_receiver_operator?.office?.fullName,
            )}
          />
        ),
      },
      {
        id: "fullName",
        header: t("columns.client"),
        size: 220,
        accessorFn: (row) => row.client?.fullName ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.client?.fullName}
            secondary={row.original.client?.phone_number}
          />
        ),
      },
      {
        accessorFn: (row) => row.client?.dateOfBirth ?? "",
        id: "dob",
        header: t("columns.dateOfBirth"),
        size: 110,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return val ? formatChange(val.split("T")[0], { dateOnly: true }) : "";
        },
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.client?.passport_number ?? "",
        id: "passportId",
        header: t("columns.passportNumber"),
        size: 120,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.client?.passportCountryOfIssue ?? "",
        id: "pcoi",
        header: t("columns.passportCountryOfIssue"),
        size: 130,
      },
      {
        accessorFn: (row) => row.client?.passportExpiryDate ?? "",
        id: "pdoe",
        header: t("columns.passportExpiryDate"),
        size: 100,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return val ? formatChange(val.split("T")[0], { dateOnly: true }) : "";
        },
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => getStatusKey(row),
        id: "status",
        header: t("columns.status"),
        size: 80,
        Cell: ({ row }) => (
          <StatusChip
            status={getStatusKey(row.original)}
            config={SALE_STATUS_CONFIG}
          />
        ),
      },
      {
        id: "payment_status",
        header: t("columns.paymentStatus"),
        size: 110,
        Cell: ({ row }) => (
          <PaymentStatusCell percent={row.original.paidPercentage} />
        ),
      },
      {
        accessorKey: "base_fare",
        header: t("columns.baseFare"),
        size: 100,
        Cell: ({ row, cell }) => {
          const currencyCode = row.original.currency || "USD";
          const symbol = CURRENCY_SYMBOLS[currencyCode] || "$";
          return `${symbol}${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(cell.getValue() ?? 0))}`;
        },
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        id: "totalCollected",
        header: t("columns.total"),
        size: 100,
        accessorFn: (row) => row.total_price ?? 0,
        Cell: ({ row }) => {
          const currencyCode = row.original.currency || "USD";
          const symbol = CURRENCY_SYMBOLS[currencyCode] || "$";
          const quoted = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(Number(row.original.quoted_price ?? 0));
          const total = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(Number(row.original.total_price ?? 0));
          return (
            <StackedCell
              primary={`${symbol}${quoted}`}
              secondary={`${symbol}${total}`}
            />
          );
        },
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        accessorKey: "accepted_price",
        header: t("columns.accepted") ?? "Accepted",
        size: 90,
        Cell: ({ row, cell }) => {
          const currencyCode = row.original.currency || "USD";
          const symbol = CURRENCY_SYMBOLS[currencyCode] || "$";
          return `${symbol}${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(cell.getValue() ?? 0))}`;
        },
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        accessorKey: "returned_price",
        header: t("columns.changeAmount"),
        size: 90,
        Cell: ({ row, cell }) => {
          const currencyCode = row.original.currency || "USD";
          const symbol = CURRENCY_SYMBOLS[currencyCode] || "$";
          return `${symbol}${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(cell.getValue() ?? 0))}`;
        },
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        accessorKey: "pnr",
        header: "PNR",
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "ticket_number",
        header: t("columns.ticketNo"),
        size: 160,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "route",
        header: t("columns.route"),
        size: 180,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "class",
        header: t("columns.cabinClass"),
        size: 90,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorKey: "flight_date",
        header: t("columns.flightDate"),
        size: 120,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return val ? formatChange(val.split("T")[0], { dateOnly: true }) : "";
        },
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => selectedLang(row?.office?.shortName) ?? "",
        id: "office_guid",
        header: t("kassa"),
        size: 90,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        id: "agent",
        header: t("columns.agent"),
        size: 150,
        accessorFn: (row) => row.agent?.name ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.agent?.name}
            secondary={row.original.agent?.phone_number}
          />
        ),
      },
      {
        accessorKey: "note",
        header: t("columns.note"),
        size: 200,
      },
      {
        id: "actions",
        header: t("columns.actions") ?? "Actions",
        size: 100,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            showPayment={true}
            onPaymentClick={(r) => setPaymentModalRow(r)}
            onDelete={handleDeleteClick}
          />
        ),
      },
    ],
    [t, formatChange, getStatusKey, selectedLang, handleDeleteClick],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    enableColumnPinning: true,
    initialState: {
      columnPinning: {
        left: ["index_number"],
        right: ["actions"],
      },
    },
    columns,
    data: turkishData || [],
    state: {
      ...defaultMrtOptions.state,
      rowSelection,
      isLoading: isLoading || isFetching,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    onRowSelectionChange: setRowSelection,
    renderCreateRowDialogContent: ({ table }) => (
      <AddTurkishAirlinesContent table={table} />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <EditTurkishAirlinesContent table={table} row={row} />
    ),
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
          placeholder={t("search") ?? "Search..."}
          disabled={isLoading}
          onRefetch={refetch}
          isFetching={isFetching}
        />

        {activeFilters.map(([key, value]) => (
          <Chip
            key={key}
            label={getFilterLabel(key, value)}
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
    renderBottomToolbar: ({ table: mrtTable }) => {
      const { pageIndex } = mrtTable.getState().pagination;

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
            pageSize={limit}
            totalRows={totalItems}
            onPageChange={(newIndex) => setPage(newIndex + 1)}
          />
        </Box>
      );
    },
  });

  return (
    <>
      <PageHeader
        title={t("sidebar.ticketTurkishAirlines")}
        addButtonText={t("turkish.add")}
        filterButtonText={t("filter")}
        pageTitle={`${t("sidebar.ticketTurkishAirlines")} | Oguz Travel`}
        onAddClick={() => {
          table.setCreatingRow(true);
        }}
        onFilterClick={openDrawer}
      />

      <FilterDrawer
        open={isDrawerOpen}
        onClose={cancelFilters}
        onApply={() => {
          applyFilters();
          closeDrawer();
        }}
        onReset={resetFilters}
        onCancel={cancelFilters}
      >
        <TurkishAirlinesFilter
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
      />

      {Boolean(paymentModalRow) && (
        <PaymentManagementModal
          open={Boolean(paymentModalRow)}
          onClose={() => {
            setPaymentModalRow(null);
            refetch();
          }}
          row={paymentModalRow}
        />
      )}

      <MaterialReactTable table={table} />
    </>
  );
};

export default TurkishAirlines;
