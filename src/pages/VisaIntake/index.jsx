import { useState, useMemo, useRef } from "react";
import { Box, Paper, Button, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useLocale } from "../../hooks/useLocale";
import CustomTabs from "../../components/CustomTabs";
import FilterDrawer from "../../components/FilterDrawer";
import { usePageFilters } from "../../hooks/usePageFilters";
import {
  visaIntakeFilterActions,
  visaIntakeFilterSelectors,
} from "../../store/slices/filters/visaIntakeFilterSlice";
import VisaIntakeFilter from "./ApplicationsTab/Contents/VisaIntakeFilter";
import ApplicationsTable from "./ApplicationsTab/ApplicationsTable";
import CountriesTable from "./CountriesTab/CountriesTable";
import CustomFieldsTable from "./CustomFieldsTab/CustomFieldsTable";

export const VisaIntake = () => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [activeTab, setActiveTab] = useState("applications");
  const activeTabRef = useRef(null);

  const {
    applied: filterApplied,
    draft: filterDraft,
    queryParams,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    setDraftFilter,
    applyFilters,
    resetFilters,
    searchQuery,
    setSearch,
    selectsOpen,
    openSelect,
    closeSelect,
  } = usePageFilters({
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

  const addButtonText = useMemo(() => {
    if (activeTab === "countries") return t("visaIntake.createCountry");
    if (activeTab === "custom_fields") return t("customFields.addTitle");
    return t("visaIntake.addApplication");
  }, [activeTab, t]);

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
        />

        {/* RIGHT SIDE: Add Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{ borderRadius: "8px", fontWeight: 600, px: 2.5, height: "40px" }}
        >
          {addButtonText}
        </Button>
      </Paper>

      {activeTab === "applications" && (
        <ApplicationsTable
          ref={activeTabRef}
          queryParams={queryParams}
          searchQuery={searchQuery}
          setSearch={setSearch}
          openDrawer={openDrawer}
          isFilterActive={isFilterActive}
        />
      )}

      {activeTab === "countries" && <CountriesTable ref={activeTabRef} />}

      {activeTab === "custom_fields" && <CustomFieldsTable ref={activeTabRef} />}

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
    </Box>
  );
};

export default VisaIntake;
