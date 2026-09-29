import { Box, Chip, Grid, Tooltip, Typography } from "@mui/material";
import { MapPinHouse } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import { useLocale } from "../../../hooks/useLocale";
import { useAuth } from "../../../context/useAuth";
import KpiGrid from "./Contents/KpiGrid";
import CategoryCard from "./Contents/CategoryCard";
import CashFlowCard from "./Contents/CashFlowCard";
import MoneyFlowCard from "./Contents/MoneyFlowCard";
import OperatorCard from "./Contents/OperatorCard";
import { useOfficeAnalytics } from "./functions/analyticsFormat";
import { useAnalyticsPrefs } from "./functions/useAnalyticsPrefs";
import PeriodRangeFilter from "./Contents/PeriodRangeFilter";

const STORAGE_KEY = "finance_overview_prefs";

const MetaItem = ({ icon: Icon, children }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary", minWidth: 0 }}>
    <Icon size={15} />
    <Typography noWrap sx={{ fontSize: "0.85rem", color: "text.primary", fontWeight: 500 }}>
      {children}
    </Typography>
  </Box>
);

// Finance report for the signed-in user's office, in USD.
const FinanceOverview = () => {
  const { t, selectedLang } = useLocale();
  const { user } = useAuth();
  const [prefs, updatePrefs] = useAnalyticsPrefs(STORAGE_KEY);
  const { period, currency, customRange } = prefs;

  const { data, isDemo } = useOfficeAnalytics(period, customRange);

  const officeName =
    (typeof user?.office === "string" ? user.office : selectedLang(user?.office)) ||
    selectedLang(data.office.name);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pb: 4 }}>
      <PageHeader title={t("finance.overviewTitle")} pageTitle={`${t("finance.overviewTitle")} | Oguz Travel`}>
        {isDemo && (
          <Tooltip title={t("finance.analytics.demoHint")} arrow>
            <Chip
              label={t("finance.analytics.demo")}
              size="small"
              variant="outlined"
              sx={{ height: 24, fontSize: "0.72rem", fontWeight: 500, color: "text.secondary", borderColor: "divider" }}
            />
          </Tooltip>
        )}
      </PageHeader>

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
          <MetaItem icon={MapPinHouse}>{officeName}</MetaItem>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <PeriodRangeFilter period={period} customRange={customRange} onChange={updatePrefs} />
        </Box>
      </Box>

      <KpiGrid
        totals={data.totals}
        trend={data.trend}
        cashFlow={data.cashFlow}
        currency={currency}
        period={data.period.key}
      />

      <CashFlowCard cashFlow={data.cashFlow} currency={currency} granularity={data.period.granularity} />

      <MoneyFlowCard cashFlow={data.cashFlow} currency={currency} />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ display: "flex", flexDirection: "column" }}>
          <CategoryCard categories={data.categories} currency={currency} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ display: "flex", flexDirection: "column" }}>
          <OperatorCard operators={data.operators} currency={currency} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinanceOverview;
