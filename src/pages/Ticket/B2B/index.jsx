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
import StackedCell from "../../../components/inputs/StackCell";
import {
  colSize,
  ordNumColSize,
  price,
  route,
} from "../../../utils/helperConstant";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import AddB2BTicketDialog from "./AddB2BTicketDialog";
import EditB2BDialog from "./EditB2BDialog";
import StatusChip from "../../../components/StatusChip";
import OperatorsCell from "../../../components/OperatorsCell";
import ClientCell from "../../../components/ClientCell";

import {
  SALE_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from "../../../functions/statusChipConfigs";
import { useTableFilters, useDrawerFilters } from "../../../hooks/usePageFilters";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useGet } from "../../../hooks/CRUD/useGet";
import {
  b2bFilterActions,
  b2bFilterSelectors,
} from "../../../store/slices/filters/b2bFilterSlice";
import FilterDrawer from "../../../components/FilterDrawer";
import B2BFilter from "./Contents/B2BFilter";
import {
  getAllB2BApi,
  getAllEmployeeApi,
  getAllStatusApi,
} from "../../../api/queries/getters";
import DeleteDialog from "../../../components/DeleteDialog";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { deleteB2BApi } from "../../../api/queries/delete";
import PaymentStatusCell from "../../../components/PaymentStatusCell";
import { useDateFormat, formatDate } from "../../../functions/generalHelpers";
import { PaymentManagementModal } from "../../../components/Dialog/PaymentManagementModal";
import ExportExcelButton from "../../../components/ExportExcelButton";
import { exportB2BExcel } from "./functions/exportB2BExcel";


const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  TMT: "m",
  RUB: "₽",
};

const B2BFilterDrawer = () => {
  const {
    draft,
    isDrawerOpen,
    closeDrawer,
    setDraftFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
    selectsOpen,
    openSelect,
    closeSelect,
  } = useDrawerFilters({
    actions: b2bFilterActions,
    selectors: b2bFilterSelectors,
  });

  return (
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
      <B2BFilter
        filters={draft}
        selectsOpen={selectsOpen}
        onFilterChange={setDraftFilter}
        onSelectOpen={openSelect}
        onSelectClose={closeSelect}
      />
    </FilterDrawer>
  );
};

const B2B = () => {
  const { t, selectedLang } = useLocale();
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = getDefaultMRTOptions();
  const [rowSelection, setRowSelection] = useState({});
  const [paymentModalRow, setPaymentModalRow] = useState(null);

  const {
    openDrawer,
    searchQuery,
    setSearch,
    page,
    limit,
    setPage,
    setPageSize,
    setSort,
    queryParams,
  } = useTableFilters({
    actions: b2bFilterActions,
    selectors: b2bFilterSelectors,
  });

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
      if (key === "travel_type") {
        return `${t("columns.tripType")}: ${String(value) === "1" ? t("tripTypeRoundTrip") : t("tripTypeOneWay")}`;
      }
      if (key === "is_paid") {
        return `${t("columns.paymentStatus")}: ${value === "true" ? t("paymentPaid") : t("paymentCredit")}`;
      }
      if (key === "start_date") {
        return `${t("columns.startDate")}: ${formatChange(value, { dateOnly: true })}`;
      }
      if (key === "end_date") {
        return `${t("columns.endDate")}: ${formatChange(value, { dateOnly: true })}`;
      }
      if (key === "datetime") {
        return `${t("columns.dateTime")}: ${formatChange(value, { dateOnly: true })}`;
      }
      if (key === "flight_date") {
        return `${t("columns.flightDate")}: ${formatChange(value, { dateOnly: true })}`;
      }
      return `${t(`columns.${key}`, key)}: ${value}`;
    },
    [t, selectedLang, statusById, employeeById, formatChange],
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

  const {
    data: b2bData,
    isLoading,
    isFetching,
    refetch,
    pageCount,
    totalItems,
  } = usePagginationGet({
    apiFn: getAllB2BApi,
    key: "b2b",
    params: queryParams,
  });

  const { mutate: deleteB2BMutate, isPending: isDeleting } = useDelete({
    deleteFn: deleteB2BApi,
    queryKey: "b2b",
    idKey: "guid",
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (ticket) => deleteB2BMutate(ticket.guid),
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
        size: ordNumColSize,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        accessorFn: (row) => row.datetime,
        id: "datetime",
        header: t("columns.dateTime"),
        size: 90,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          if (!val) return "";
          const dateOnly = val.split("T")[0];
          return formatDate(dateOnly);
        },
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) =>
          `${row.assignment_operator?.fullName ?? ""} ${row.receiver_operator?.fullName ?? ""}`.trim(),
        id: "operators",
        header: t("columns.operators"),
        size: 200,
        Cell: ({ row }) => (
          <OperatorsCell
            assignmentOperator={row.original?.assignment_operator}
            receiverOperator={row.original?.receiver_operator}
          />
        ),
      },
      {
        accessorFn: (row) => row.client?.fullName,
        id: "client",
        header: t("columns.client"),
        size: 220,
        Cell: ({ row }) => <ClientCell client={row.original?.client} />,
      },
      {
        accessorFn: (row) => getStatusKey(row),
        id: "status",
        header: t("columns.status"),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <StatusChip
            status={getStatusKey(row.original)}
            config={SALE_STATUS_CONFIG}
          />
        ),
        size: 90,
      },
      {
        accessorFn: (row) => row.is_paid,
        id: "is_paid",
        header: t("columns.paymentStatus"),
        size: 90,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => (
          <StatusChip
            status={cell.getValue()}
            config={PAYMENT_STATUS_CONFIG}
            size="small"
          />
        ),
      },
      {
        accessorFn: (row) => {
          const pct = row.paidPercentage ?? row.payment_percent;
          return typeof pct === "string" ? parseFloat(pct) : pct;
        },
        id: "paidPercentage",
        header: t("columns.paymentPercentage"),
        size: 110,
        Cell: ({ row }) => (
          <PaymentStatusCell percent={row.original.paidPercentage} />
        ),
      },
      {
        accessorFn: (row) => row.net_price,
        id: "netFare",
        header: t("columns.netFare"),
        size: price,
        Cell: ({ row, cell }) => {
          const currencyCode = row.original.currency || "USD";
          const symbol = CURRENCY_SYMBOLS[currencyCode] || "$";
          return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(cell.getValue() ?? 0))} ${symbol}`;
        },
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        accessorFn: (row) => row.sale_price,
        id: "sale_price",
        header: t("columns.saleFare"),
        size: price,
        Cell: ({ row, cell }) => {
          const currencyCode = row.original.currency || "USD";
          const symbol = CURRENCY_SYMBOLS[currencyCode] || "$";
          return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(cell.getValue() ?? 0))} ${symbol}`;
        },
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        accessorFn: (row) => row.profit,
        id: "profit",
        header: t("columns.profit"),
        size: 100,
        Cell: ({ row, cell }) => {
          const profit = Number(cell.getValue() ?? 0);
          const currencyCode = row.original.currency || "USD";
          const symbol = CURRENCY_SYMBOLS[currencyCode] || "$";
          return (
            <Box
              sx={{
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                color:
                  profit > 0
                    ? "#16a34a"
                    : profit < 0
                      ? "#ef4444"
                      : "text.secondary",
              }}
            >
              {profit > 0 ? "+" : ""}
              {profit < 0 ? "-" : ""}
              {new Intl.NumberFormat("en-US", {
                maximumFractionDigits: 0,
              }).format(Math.abs(profit))}
              {symbol}
            </Box>
          );
        },
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
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
        accessorFn: (row) => row.airline,
        id: "airline",
        header: t("columns.airline"),
        size: 160,
      },
      {
        accessorFn: (row) => row.route,
        id: "route",
        header: t("columns.route"),
        size: route,
        muiTableHeadCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.class,
        id: "class",
        header: t("columns.cabinClass"),
        size: colSize,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => {
          if (row.travel_type !== undefined) {
            return String(row.travel_type) === "1"
              ? t("tripTypeRoundTrip")
              : t("tripTypeOneWay");
          }
          return row.tripType;
        },
        id: "tripType",
        header: t("columns.tripType"),
        size: colSize,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.flight_date,
        id: "flight_date",
        header: t("columns.flightDate"),
        size: 120,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          if (!val) return "";
          const dateOnly = val.split("T")[0];
          return formatDate(dateOnly);
        },
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        accessorFn: (row) => row.agent?.name,
        id: "agent",
        header: t("columns.agent"),
        size: 100,
        Cell: ({ row }) => {
          return (
            <StackedCell
              primary={row?.original?.agent?.name}
              secondary={row?.original?.agent?.phone_number}
            />
          );
        },
      },
      {
        accessorFn: (row) => row.note,
        id: "note",
        header: t("columns.note"),
        size: colSize,
        muiTableHeadCellProps: { align: "center" },
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
            showPayment={true}
            onPaymentClick={(r) => setPaymentModalRow(r)}
            onDelete={handleDeleteClick}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
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
    enableColumnPinning: true,
    initialState: {
      columnPinning: {
        left: ["index_number"],
        right: ["actions"],
      },
    },
    columns,
    data: b2bData,
    renderCreateRowDialogContent: ({ table }) => (
      <AddB2BTicketDialog table={table} />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <EditB2BDialog table={table} row={row} />
    ),
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
    // enableSorting: true,
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
    <Box>
      <PageHeader
        title={t("b2b.title")}
        pageTitle={`${t("b2b.title")} | Oguz Travel`}
        addButtonText={t("b2b.addTicket")}
        filterButtonText={t("filter")}
        onAddClick={() => table.setCreatingRow(true)}
        onFilterClick={openDrawer}
      >
        <ExportExcelButton
          apiFn={getAllB2BApi}
          queryParams={queryParams}
          totalItems={totalItems}
          fileName="B2B_Hasabaty"
          sheetName="B2B"
          customExportFn={exportB2BExcel}
        />
      </PageHeader>

      <B2BFilterDrawer />

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
      />

      {Boolean(paymentModalRow) && (
        <PaymentManagementModal
          open={Boolean(paymentModalRow)}
          onClose={(hasChanged) => {
            setPaymentModalRow(null);
            if (hasChanged) {
              refetch();
            }
          }}
          row={paymentModalRow}
        />
      )}

      <MaterialReactTable table={table} />
    </Box>
  );
};

export default B2B;
