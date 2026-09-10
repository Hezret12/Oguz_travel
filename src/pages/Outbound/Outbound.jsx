import { useState } from "react";
import { Tab, Tabs } from "@mui/material";
import { useLocale } from "../../hooks/useLocale";
import { usePageFilters } from "../../hooks/usePageFilters";
import PageHeader from "../../components/PageHeader";
import FilterDrawer from "../../components/FilterDrawer";
import OutboundFilter from "./Contents/OutboundFilter";
import OutboundExportModal from "./Contents/OutboundExportModal";
import ExportExcelButton from "../../components/ExportExcelButton";
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
  const [isExportOpen, setIsExportOpen] = useState(false);

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
    selectsOpen,
    openSelect,
    closeSelect,
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
        title={t("outbound.title")}
        pageTitle={`${t("outbound.title") || "Outbound"} | Oguz Travel`}
        addButtonText={t("outbound.addSale")}
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
            mr: 1,
          }}
        >
          {OUTBOUND_TABS.map((tab) => (
            <Tab
              key={tab.key}
              value={tab.key}
              label={t(tab.labelKey) || tab.key}
              sx={{ minWidth: 130 }}
            />
          ))}
        </Tabs>
        <ExportExcelButton onClick={() => setIsExportOpen(true)} />
      </PageHeader>

      {isExportOpen && (
        <OutboundExportModal
          open={isExportOpen}
          close={() => setIsExportOpen(false)}
          queryParams={queryParams}
          activeTab={activeTab}
        />
      )}

      <FilterDrawer
        open={isDrawerOpen}
        onClose={cancelFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        onCancel={cancelFilters}
      >
        <OutboundFilter
          activeTab={activeTab}
          filters={draft}
          selectsOpen={selectsOpen}
          onFilterChange={setDraftFilter}
          onSelectOpen={openSelect}
          onSelectClose={closeSelect}
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
