import { useState } from "react";
import { Box, Chip, Tab, Tabs } from "@mui/material";
import { useLocale } from "../../hooks/useLocale";
import { usePageFilters } from "../../hooks/usePageFilters";
import PageHeader from "../../components/PageHeader";
import FilterDrawer from "../../components/FilterDrawer";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import OutboundFilter from "./dialogs/OutboundFilter";
import { OUTBOUND_TABS } from "./constants";
import { tabStyles } from "../Users/shared/modalStyles";
import {
  outboundFilterActions,
  outboundFilterSelectors,
} from "../../store/slices/filters/outboundFilterSlice";

import HotelTab from "./tabs/Hotel";
import AirwayTab from "./tabs/Airway";
import RailwayTab from "./tabs/Railway";
import TourTab from "./tabs/Tour";
import TransferTab from "./tabs/Transfer";
import PackageTab from "./tabs/Package";

const OutboundPage = () => {
  const { t } = useLocale();

  // Tab State
  const [activeTab, setActiveTab] = useState("hotel");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Filters State
  const {
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

  const activeFilters = Object.entries(queryParams || {}).filter(
    ([key, value]) => value !== undefined && value !== "" && key !== "page" && key !== "limit" && key !== "search"
  );

  return (
    <>
      <PageHeader
        title={t("outbound.title") || "Outbound satuwlar"}
        pageTitle={`${t("outbound.title") || "Outbound"} | Oguz Travel`}
        addButtonText={t("outbound.addSale") || "Goş"}
        filterButtonText={t("filter")}
        onAddClick={() => setIsAddOpen(true)}
        onFilterClick={openDrawer}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            setPage(1);
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

      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <GlobalSearchInput
          value={searchQuery}
          onChange={setSearch}
          placeholder={t("search")}
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
            }}
          />
        ))}
      </Box>

      {activeTab === "hotel" && (
        <HotelTab queryParams={queryParams} page={page} limit={limit} setPage={setPage} setPageSize={setPageSize} isAddOpen={isAddOpen} onCloseAdd={() => setIsAddOpen(false)} />
      )}
      {activeTab === "airway" && (
        <AirwayTab queryParams={queryParams} page={page} limit={limit} setPage={setPage} setPageSize={setPageSize} isAddOpen={isAddOpen} onCloseAdd={() => setIsAddOpen(false)} />
      )}
      {activeTab === "railway" && (
        <RailwayTab queryParams={queryParams} page={page} limit={limit} setPage={setPage} setPageSize={setPageSize} isAddOpen={isAddOpen} onCloseAdd={() => setIsAddOpen(false)} />
      )}
      {activeTab === "tour" && (
        <TourTab queryParams={queryParams} page={page} limit={limit} setPage={setPage} setPageSize={setPageSize} isAddOpen={isAddOpen} onCloseAdd={() => setIsAddOpen(false)} />
      )}
      {activeTab === "transfer" && (
        <TransferTab queryParams={queryParams} page={page} limit={limit} setPage={setPage} setPageSize={setPageSize} isAddOpen={isAddOpen} onCloseAdd={() => setIsAddOpen(false)} />
      )}
      {activeTab === "package" && (
        <PackageTab queryParams={queryParams} page={page} limit={limit} setPage={setPage} setPageSize={setPageSize} isAddOpen={isAddOpen} onCloseAdd={() => setIsAddOpen(false)} />
      )}
    </>
  );
};

export default OutboundPage;
