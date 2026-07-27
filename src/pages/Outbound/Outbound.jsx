import { useState } from "react";
import { Tab, Tabs } from "@mui/material";
import { useLocale } from "../../hooks/useLocale";
import { usePageFilters } from "../../hooks/usePageFilters";
import PageHeader from "../../components/PageHeader";
import FilterDrawer from "../../components/FilterDrawer";
import OutboundFilter from "./Contents/OutboundFilter";
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
              sx={{minWidth: 130}}
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

      {(() => {
        const tabProps = {
          queryParams,
          searchQuery,
          setSearch,
          setFilter,
          activeFilters,
          page,
          limit,
          setPage,
          setPageSize,
          isAddOpen,
          onCloseAdd: () => setIsAddOpen(false),
        };
        return (
          <>
            {activeTab === "hotel" && <HotelTab {...tabProps} />}
            {activeTab === "airway" && <AirwayTab {...tabProps} />}
            {activeTab === "railway" && <RailwayTab {...tabProps} />}
            {activeTab === "tour" && <TourTab {...tabProps} />}
            {activeTab === "transfer" && <TransferTab {...tabProps} />}
            {activeTab === "package" && <PackageTab {...tabProps} />}
          </>
        );
      })()}
    </>
  );
};

export default OutboundPage;
