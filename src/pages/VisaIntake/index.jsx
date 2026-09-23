import { useState, useMemo, useRef } from "react";
import { Box, Paper, Tooltip, useTheme } from "@mui/material";
import { useLocale } from "../../hooks/useLocale";
import AddButton from "../../components/AddButton";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import CustomTabs from "../../components/CustomTabs";
import ComponentErrorBoundary from "../../components/ComponentErrorBoundary";
import FilterDrawer from "../../components/FilterDrawer";
import { useTableFilters, useDrawerFilters } from "../../hooks/usePageFilters";
import {
  visaIntakeFilterActions,
  visaIntakeFilterSelectors,
} from "../../store/slices/filters/visaIntakeFilterSlice";
import VisaIntakeFilter from "./ApplicationsTab/Contents/VisaIntakeFilter";
import ApplicationsTable from "./ApplicationsTab/ApplicationsTable";
import CountriesTable from "./CountriesTab/CountriesTable";
import CustomFieldsTable from "./CustomFieldsTab/CustomFieldsTable";

const VisaIntakeFilterDrawer = () => {
  const {
    draft: filterDraft,
    isDrawerOpen,
    closeDrawer,
    setDraftFilter,
    applyFilters,
    resetFilters,
    selectsOpen,
    openSelect,
    closeSelect,
  } = useDrawerFilters({
    actions: visaIntakeFilterActions,
    selectors: visaIntakeFilterSelectors,
  });

  return (
    <FilterDrawer
      open={isDrawerOpen}
      onClose={closeDrawer}
      onApply={applyFilters}
      onReset={resetFilters}
    >
      <VisaIntakeFilter
        filters={filterDraft}
        selectsOpen={selectsOpen}
        onFilterChange={setDraftFilter}
        onSelectOpen={openSelect}
        onSelectClose={closeSelect}
      />
    </FilterDrawer>
  );
};

export const VisaIntake = () => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [activeTab, setActiveTab] = useState("applications");
  const activeTabRef = useRef(null);

  const {
    applied: filterApplied,
    queryParams,
    openDrawer,
    searchQuery,
    setSearch,
    page,
    setPage,
  } = useTableFilters({
    actions: visaIntakeFilterActions,
    selectors: visaIntakeFilterSelectors,
  });

  const isFilterActive = useMemo(() => {
    if (!filterApplied) return false;
    return Object.values(filterApplied).some((val) => Boolean(val));
  }, [filterApplied]);

  const tabOptions = useMemo(
    () => [
      { value: "applications", label: t("visaIntake.title") },
      { value: "countries", label: t("visaIntake.countriesManagement") },
      { value: "custom_fields", label: t("customFields.title") },
    ],
    [t],
  );

  const pageTitle = useMemo(() => {
    if (activeTab === "countries") {
      return `${t("visaIntake.countriesManagement")} | ${t("visaIntake.title")}`;
    }
    if (activeTab === "custom_fields") {
      return `${t("customFields.title")} | ${t("visaIntake.title")}`;
    }
    return t("visaIntake.title");
  }, [activeTab, t]);

  useDocumentTitle(pageTitle);

  const addButtonText = useMemo(() => {
    if (activeTab === "countries") return t("visaIntake.createCountry");
    if (activeTab === "custom_fields") return t("customFields.addTitle");
    return t("visaIntake.addApplication");
  }, [activeTab, t]);

  // Full country object (not just the guid): the searchable picker may not
  // have the selected country in its currently loaded page.
  const [selectedCountry, setSelectedCountry] = useState(null);

  const isAddDisabled = useMemo(() => {
    if (activeTab === "applications") {
      return !selectedCountry?.guid;
    }
    return false;
  }, [activeTab, selectedCountry]);

  const handleAddClick = () => {
    activeTabRef.current?.openCreateModal?.();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, p: 3 }}>
      {/* Top Header Bar: CustomTabs on LEFT, Add button on RIGHT */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          borderRadius: "14px",
          border: "1px solid",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {/* LEFT SIDE: CustomTabs */}
        <CustomTabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          tabs={tabOptions}
          variant="pills"
          color="blue"
          tabSx={{
            minWidth: { xs: 120, sm: 160, md: 180 },
            textAlign: "center",
          }}
        />

        {/* RIGHT SIDE: Add Button */}
        <Tooltip
          title={isAddDisabled ? t("visaIntake.selectCountryToAdd") : ""}
          arrow
          disableHoverListener={!isAddDisabled}
        >
          <span>
            <AddButton onClick={handleAddClick} disabled={isAddDisabled}>
              {addButtonText}
            </AddButton>
          </span>
        </Tooltip>
      </Paper>

      {/* These tabs render columns and inputs the backend defines, so a record
          in an unexpected shape can throw mid-render. Contained here, it costs
          the tab — not the whole app, which is what the router's boundary
          would do. Switching tabs or country clears it. */}
      <ComponentErrorBoundary
        resetKey={`${activeTab}:${selectedCountry?.guid || ""}`}
        title={t("errorBoundary.genericErrorTitle")}
        description={t("errorBoundary.genericErrorDesc")}
        retryLabel={t("errorBoundary.retry")}
      >
        {activeTab === "applications" && (
          <ApplicationsTable
            ref={activeTabRef}
            country={selectedCountry}
            onCountryChange={setSelectedCountry}
            queryParams={queryParams}
            searchQuery={searchQuery}
            setSearch={setSearch}
            openDrawer={openDrawer}
            isFilterActive={isFilterActive}
            page={page}
            setPage={setPage}
          />
        )}

        {activeTab === "countries" && <CountriesTable ref={activeTabRef} />}

        {activeTab === "custom_fields" && <CustomFieldsTable ref={activeTabRef} />}
      </ComponentErrorBoundary>

      <VisaIntakeFilterDrawer />
    </Box>
  );
};

export default VisaIntake;
