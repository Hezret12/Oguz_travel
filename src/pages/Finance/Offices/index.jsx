import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { Building } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import { useLocale } from "../../../hooks/useLocale";
import PeriodRangeFilter from "../Overview/Contents/PeriodRangeFilter";
import { useAnalyticsPrefs } from "../Overview/functions/useAnalyticsPrefs";
import OfficesSummary from "./Contents/OfficesSummary";
import OfficesChart from "./Contents/OfficesChart";
import OfficesTable from "./Contents/OfficesTable";
import { useOfficesFinance } from "./functions/officesFinance";

const STORAGE_KEY = "finance_offices_prefs";

const MetaItem = ({ icon: Icon, children }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary", minWidth: 0 }}>
    <Icon size={15} />
    <Typography noWrap sx={{ fontSize: "0.85rem", color: "text.primary", fontWeight: 500 }}>
      {children}
    </Typography>
  </Box>
);

// Every office's sales, cost of sales and profit for a period, one total per
// office, in USD and TMT side by side (never converted).
const FinanceOffices = () => {
  const { t } = useLocale();
  const [prefs, updatePrefs] = useAnalyticsPrefs(STORAGE_KEY);
  const { period, customRange, currency } = prefs;

  const { data, isLoading, isFetching, isError } = useOfficesFinance(period, customRange);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pb: 4 }}>
      <PageHeader title={t("finance.offices.title")} pageTitle={`${t("finance.offices.title")} | Oguz Travel`} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mt: -1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, minWidth: 0, flexWrap: "wrap" }}>
          <MetaItem icon={Building}>{t("finance.offices.officeCount", { count: data.rows.length })}</MetaItem>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <PeriodRangeFilter period={period} customRange={customRange} onChange={updatePrefs} />
        </Box>
      </Box>

      {isError && <Alert severity="error">{t("dashboard.loadError")}</Alert>}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        // A refetch keeps the current render, slightly dimmed.
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            opacity: isFetching ? 0.6 : 1,
            transition: "opacity .2s ease",
          }}
        >
          <OfficesSummary rows={data.rows} totals={data.totals} />
          <OfficesChart rows={data.rows} currency={currency} />
          <OfficesTable rows={data.rows} totals={data.totals} />
        </Box>
      )}
    </Box>
  );
};

export default FinanceOffices;
