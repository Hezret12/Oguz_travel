import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { useLocale } from "../../hooks/useLocale";
import { useTableFilters, useDrawerFilters } from "../../hooks/usePageFilters";
import PageHeader from "../../components/PageHeader";
import FilterDrawer from "../../components/FilterDrawer";
import ExportExcelButton from "../../components/ExportExcelButton";
import { tabStyles } from "../Users/shared/modalStyles";
import {
  inboundFilterActions,
  inboundFilterSelectors,
} from "../../store/slices/filters/inboundFilterSlice";
import { INBOUND_TABS } from "./constants";
import InboundFilter from "./Contents/InboundFilter";
import InboundExportModal from "./Contents/InboundExportModal";
import ExpectedTab from "./tabs/Expected";
import ArrivalsTab from "./tabs/Arrivals";
import InvitationsTab from "./tabs/Invitations";

const TAB_COMPONENTS = {
  expected: ExpectedTab,
  arrivals: ArrivalsTab,
  invitations: InvitationsTab,
};

const InboundFilterDrawer = ({ activeTab }) => {
  const {
    draft,
    isDrawerOpen,
    setDraftFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
  } = useDrawerFilters({
    actions: inboundFilterActions,
    selectors: inboundFilterSelectors,
  });

  return (
    <FilterDrawer
      open={isDrawerOpen}
      onClose={cancelFilters}
      onApply={applyFilters}
      onReset={resetFilters}
      onCancel={cancelFilters}
    >
      <InboundFilter
        activeTab={activeTab}
        filters={draft}
        onFilterChange={setDraftFilter}
      />
    </FilterDrawer>
  );
};

const InboundPage = () => {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState(INBOUND_TABS[0].key);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const filters = useTableFilters({
    actions: inboundFilterActions,
    selectors: inboundFilterSelectors,
  });
  const { openDrawer, setPage, setSearch, searchQuery, queryParams } = filters;

  // The date range carries over between tabs, but a search does not: a tourist's
  // name typed on one tab would only leave the next tab looking empty.
  const handleTabChange = (_, value) => {
    setActiveTab(value);
    if (searchQuery) setSearch("");
    else setPage(1);
  };

  // Drawn by the active tab's table, which owns the create dialog the Add button opens.
  const renderHeader = (onAdd) => (
    <PageHeader
      title={t("inbound.title")}
      pageTitle={`${t("inbound.title")} | Oguz Travel`}
      addButtonText={t(`inbound.${activeTab}.add`)}
      filterButtonText={t("filter")}
      onAddClick={onAdd}
      onFilterClick={openDrawer}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ ...tabStyles, mr: 1 }}
      >
        {INBOUND_TABS.map((tab) => (
          <Tab
            key={tab.key}
            value={tab.key}
            label={t(tab.labelKey)}
            sx={{ minWidth: 130 }}
          />
        ))}
      </Tabs>
      <ExportExcelButton onClick={() => setIsExportOpen(true)} />
    </PageHeader>
  );

  const ActiveTab = TAB_COMPONENTS[activeTab];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        minHeight: 0,
      }}
    >
      {isExportOpen && (
        <InboundExportModal
          open={isExportOpen}
          close={() => setIsExportOpen(false)}
          queryParams={queryParams}
        />
      )}

      <InboundFilterDrawer activeTab={activeTab} />

      <ActiveTab key={activeTab} filters={filters} renderHeader={renderHeader} />
    </Box>
  );
};

export default InboundPage;
