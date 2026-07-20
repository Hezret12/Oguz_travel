import { useMemo, useState, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Chip, Tab, Tabs } from "@mui/material";
import { useLocale } from "../../hooks/useLocale";
import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import { usePageFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";
import PageHeader from "../../components/PageHeader";
import FilterDrawer from "../../components/FilterDrawer";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import Pagination from "../../components/Pagination";
import StackedCell from "../../components/inputs/StackCell";
import ColumnActionButtons from "../../components/ColumnActionButtons";
import DeleteDialog from "../../components/DeleteDialog";
import { getAllOutboundApi, deleteOutboundApi } from "../../api/queries/outboundApi";
import {
  outboundFilterActions,
  outboundFilterSelectors,
} from "../../store/slices/filters/outboundFilterSlice";
import OutboundFilter from "./dialogs/OutboundFilter";
import AddOutboundModal from "./dialogs/AddOutboundModal";
import EditOutboundModal from "./dialogs/EditOutboundModal";
import { OUTBOUND_TABS } from "./constants";
import { tabStyles } from "../Users/shared/modalStyles";

const OutboundPage = () => {
  const { t, selectedLang } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();

  // Tab State
  const [activeTab, setActiveTab] = useState("hotel");

  // Filters State
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
    queryParams,
  } = usePageFilters({
    actions: outboundFilterActions,
    selectors: outboundFilterSelectors,
  });

  // Combine queryParams with type param for active tab
  const mergedParams = useMemo(() => {
    return {
      ...queryParams,
      type: activeTab,
      page,
      limit,
    };
  }, [queryParams, activeTab, page, limit]);

  // Fetch Outbound Data
  const {
    data: outboundData = [],
    isLoading,
    isFetching,
    refetch,
    totalItems,
    pageCount,
  } = usePagginationGet({
    apiFn: getAllOutboundApi,
    key: ["outbound", activeTab],
    params: mergedParams,
  });

  const listData = useMemo(() => outboundData || [], [outboundData]);

  // Delete Mutation
  const { mutate: deleteOutbound, isPending: isDeleting } = useDelete({
    deleteFn: deleteOutboundApi,
    queryKey: ["outbound", activeTab],
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteOutbound(item.guid),
  });

  const handleDeleteClick = useCallback(
    (item) => deleteDialog.open(item),
    [deleteDialog],
  );

  const activeFilters = useMemo(
    () =>
      Object.entries(applied).filter(
        ([key, value]) =>
          key !== "search" && value !== undefined && value !== null && value !== "",
      ),
    [applied],
  );

  // Columns definition based on active tab
  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "index_number",
        id: "index_number",
        header: "#",
        size: 60,
      },
      {
        accessorKey: "request_date",
        id: "request_date",
        header: t("outbound.requestDate") || "Arza senesi",
        size: 110,
        Cell: ({ cell }) => cell.getValue() || "",
      },
      {
        id: "office",
        header: t("outbound.office") || "Ofis",
        size: 130,
        accessorFn: (row) => row.office?.shortName ?? "",
        Cell: ({ row }) => {
          const off = row.original.office;
          return off ? selectedLang(off.shortName) || selectedLang(off.fullName) || "" : "";
        },
      },
      {
        id: "operator",
        header: t("outbound.operator") || "Operator",
        size: 180,
        accessorFn: (row) => row.operator?.fullName ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.operator?.fullName}
            secondary={
              row.original.operator?.office
                ? selectedLang(row.original.operator.office.shortName) ||
                  selectedLang(row.original.operator.office.fullName)
                : ""
            }
          />
        ),
      },
      {
        accessorKey: "client_name",
        id: "client_name",
        header: t("outbound.clientName") || "Müşderiniň ady",
        size: 160,
      },
      {
        id: "prepared_by",
        header: t("outbound.preparedBy") || "Taýýarlan",
        size: 180,
        accessorFn: (row) => row.prepared_by_employee?.fullName ?? "",
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.prepared_by_employee?.fullName || row.original.prepared_by}
            secondary={
              row.original.prepared_by_employee?.office
                ? selectedLang(row.original.prepared_by_employee.office.shortName) ||
                  selectedLang(row.original.prepared_by_employee.office.fullName)
                : ""
            }
          />
        ),
      },
    ];

    const tabSpecificCols = [];

    if (activeTab === "hotel") {
      tabSpecificCols.push(
        {
          accessorKey: "destinationCountry",
          id: "destinationCountry",
          header: t("outbound.destinationCountry") || "Ugur ýurdy",
          size: 130,
        },
        {
          accessorKey: "hotelName",
          id: "hotelName",
          header: t("outbound.hotelName") || "Otel ady",
          size: 150,
        },
        {
          accessorKey: "roomType",
          id: "roomType",
          header: t("outbound.roomType") || "Otag görnüşi",
          size: 120,
        },
        {
          accessorKey: "mealPlan",
          id: "mealPlan",
          header: t("outbound.mealPlan") || "Iýmit",
          size: 90,
        },
        {
          accessorKey: "guestCount",
          id: "guestCount",
          header: t("outbound.guestCount") || "Myhman sany",
          size: 100,
        }
      );
    } else if (activeTab === "airway") {
      tabSpecificCols.push(
        {
          accessorKey: "ticketNumber",
          id: "ticketNumber",
          header: t("outbound.ticketNumber") || "Bilet №",
          size: 140,
        },
        {
          accessorKey: "ticketType",
          id: "ticketType",
          header: t("outbound.ticketType") || "Bilet görnüşi",
          size: 120,
        },
        {
          accessorKey: "destinationCountry",
          id: "destinationCountry",
          header: t("outbound.destinationCountry") || "Ugur ýurdy",
          size: 130,
        },
        {
          accessorKey: "route",
          id: "route",
          header: t("outbound.route") || "Ugur",
          size: 120,
        },
        {
          accessorKey: "quantity",
          id: "quantity",
          header: t("outbound.quantity") || "Sany",
          size: 90,
        }
      );
    } else if (activeTab === "railway") {
      tabSpecificCols.push(
        {
          accessorKey: "ticketNumber",
          id: "ticketNumber",
          header: t("outbound.ticketNumber") || "Bilet №",
          size: 140,
        },
        {
          accessorKey: "ticketType",
          id: "ticketType",
          header: t("outbound.ticketType") || "Bilet görnüşi",
          size: 120,
        },
        {
          accessorKey: "destinationCountry",
          id: "destinationCountry",
          header: t("outbound.destinationCountry") || "Ugur ýurdy",
          size: 130,
        },
        {
          accessorKey: "route",
          id: "route",
          header: t("outbound.route") || "Ugur",
          size: 120,
        },
        {
          accessorKey: "quantity",
          id: "quantity",
          header: t("outbound.quantity") || "Sany",
          size: 90,
        },
        {
          accessorKey: "trainType",
          id: "trainType",
          header: t("outbound.trainType") || "Otly görnüşi",
          size: 120,
        }
      );
    } else if (activeTab === "tour") {
      tabSpecificCols.push(
        {
          accessorKey: "destinationCountry",
          id: "destinationCountry",
          header: t("outbound.destinationCountry") || "Ugur ýurdy",
          size: 130,
        },
        {
          accessorKey: "tourName",
          id: "tourName",
          header: t("outbound.tourName") || "Tur ady",
          size: 150,
        },
        {
          accessorKey: "guestCount",
          id: "guestCount",
          header: t("outbound.guestCount") || "Myhman sany",
          size: 100,
        }
      );
    } else if (activeTab === "transfer") {
      tabSpecificCols.push(
        {
          accessorKey: "destinationCountry",
          id: "destinationCountry",
          header: t("outbound.destinationCountry") || "Ugur ýurdy",
          size: 130,
        },
        {
          accessorKey: "transferType",
          id: "transferType",
          header: t("outbound.transferType") || "Transfer görnüşi",
          size: 120,
        },
        {
          accessorKey: "route",
          id: "route",
          header: t("outbound.route") || "Ugur",
          size: 120,
        },
        {
          accessorKey: "carType",
          id: "carType",
          header: t("outbound.carType") || "Maşyn görnüşi",
          size: 120,
        },
        {
          accessorKey: "guestCount",
          id: "guestCount",
          header: t("outbound.guestCount") || "Myhman sany",
          size: 100,
        }
      );
    } else if (activeTab === "package") {
      tabSpecificCols.push({
        accessorKey: "destinationCountry",
        id: "destinationCountry",
        header: t("outbound.destinationCountry") || "Ugur ýurdy",
        size: 150,
      });
    }

    const pricingColumns = [
      {
        accessorKey: "cost",
        id: "cost",
        header: t("outbound.cost") || "Alnan baha",
        size: 110,
        Cell: ({ cell }) => `${Number(cell.getValue() || 0).toFixed(2)} TMT`,
      },
      {
        accessorKey: "price",
        id: "price",
        header: t("outbound.price") || "Satuw baha",
        size: 110,
        Cell: ({ cell }) => `${Number(cell.getValue() || 0).toFixed(2)} TMT`,
      },
      {
        accessorKey: "profit",
        id: "profit",
        header: t("outbound.profit") || "Peýda",
        size: 110,
        Cell: ({ cell }) => `${Number(cell.getValue() || 0).toFixed(2)} TMT`,
      },
      {
        accessorKey: "source",
        id: "source",
        header: activeTab === "package" ? t("outbound.partner") || "Hyzmatdaş" : t("outbound.source") || "Ulgam",
        size: 120,
      },
      {
        id: "actions",
        header: t("columns.actions") ?? "Amallar",
        size: 120,
        enableSorting: false,
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            onDelete={handleDeleteClick}
          />
        ),
      },
    ];

    return [...baseColumns, ...tabSpecificCols, ...pricingColumns];
  }, [activeTab, t, selectedLang, handleDeleteClick]);

  // MaterialReactTable Configuration
  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: listData,
    enableRowActions: false,
    enableEditing: true,
    enableCreatingRow: true,
    state: {
      isLoading: false,
      showLoadingOverlay: isLoading || isFetching,
      showSkeletons: false,
      showProgressBars: false,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    muiTableBodyProps: {
      sx: (theme) => ({
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.secondary,
        opacity: isLoading || isFetching ? 0 : 1,
        pointerEvents: isLoading || isFetching ? "none" : "auto",
        transition: "opacity 0.15s ease",
      }),
    },
    getRowId: (row) => row.guid,
    rowCount: totalItems,
    manualPagination: true,
    onPaginationChange: (updater) => {
      const nextPagination =
        typeof updater === "function"
          ? updater(table.getState().pagination)
          : updater;
      setPage(nextPagination.pageIndex + 1);
      setPageSize(nextPagination.pageSize);
    },
    renderEmptyRowsFallback: () => {
      if (isLoading || isFetching) return null;
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 4,
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          {t("noData")}
        </Box>
      );
    },
    renderCreateRowDialogContent: ({ table }) => (
      <AddOutboundModal table={table} activeTab={activeTab} />
    ),
    renderEditRowDialogContent: ({ table, row }) => (
      <EditOutboundModal table={table} row={row} activeTab={activeTab} />
    ),
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
            label={`${t(`outbound.${key}`, key)}: ${value}`}
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
        title={t("outbound.title") || "Outbound satuwlar"}
        pageTitle={`${t("outbound.title") || "Outbound"} | Oguz Travel`}
        addButtonText={t("outbound.addSale") || "Goş"}
        filterButtonText={t("filter")}
        onAddClick={() => table.setCreatingRow(true)}
        onFilterClick={openDrawer}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            setPage(1); // Reset page to 1 on tab change
          }}
          sx={{
            ...tabStyles,
            mr: 2,
          }}
        >
          {OUTBOUND_TABS.map((tab) => (
            <Tab
              key={tab.key}
              value={tab.key}
              label={t(tab.labelKey) || tab.key}
            />
          ))}
        </Tabs>
      </PageHeader>

      <FilterDrawer
        open={isDrawerOpen}
        onClose={cancelFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        onCancel={cancelFilters}
      >
        <OutboundFilter
          filters={draft}
          selectsOpen={queryParams}
          onFilterChange={setDraftFilter}
        />
      </FilterDrawer>

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("deleteConfirm")}
      />

      <MaterialReactTable table={table} />
    </>
  );
};

export default OutboundPage;
