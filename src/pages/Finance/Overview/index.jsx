import { useMemo } from "react";
import { Alert, Box, Grid, Skeleton, Typography } from "@mui/material";
import { MapPinHouse } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import { useLocale } from "../../../hooks/useLocale";
import { useAuth } from "../../../context/useAuth";
import KpiGrid from "./Contents/KpiGrid";
import CategoryCard from "./Contents/CategoryCard";
import CashFlowCard from "./Contents/CashFlowCard";
import MoneyFlowCard from "./Contents/MoneyFlowCard";
import OperatorCard from "./Contents/OperatorCard";
import {
  EMPTY_CARDS,
  combineQueries,
  dashboardGranularity,
  toDashboardParams,
  useDashboardCards,
  useDashboardCategories,
  useDashboardChart,
  useDashboardOperators,
} from "./functions/dashboardData";
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

// Finance report for the signed-in user's office, in USD: sales, cost of sales,
// credit and profit, by service and by operator.
const FinanceOverview = () => {
  const { t, selectedLang } = useLocale();
  const { user } = useAuth();
  const [prefs, updatePrefs] = useAnalyticsPrefs(STORAGE_KEY);
  const { period, currency, customRange } = prefs;

  const officeGuid = user?.office_guid || null;
  const rangeStart = customRange?.start;
  const rangeEnd = customRange?.end;
  const params = useMemo(
    () =>
      toDashboardParams({
        period,
        customRange: rangeStart && rangeEnd ? { start: rangeStart, end: rangeEnd } : null,
        officeGuid,
        currency,
      }),
    [period, rangeStart, rangeEnd, officeGuid, currency],
  );

  const cardsQuery = useDashboardCards(params);
  const chartQuery = useDashboardChart(params);
  const categoriesQuery = useDashboardCategories(params);
  const operatorsQuery = useDashboardOperators(params);
  const { isLoading, isFetching, isError } = combineQueries([cardsQuery, chartQuery, categoriesQuery, operatorsQuery]);
  const hasData = Boolean(cardsQuery.data);

  const cards = cardsQuery.data ?? EMPTY_CARDS;
  const buckets = chartQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const granularity = dashboardGranularity(period);

  const officeName = typeof user?.office === "string" ? user.office : selectedLang(user?.office);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pb: 4 }}>
      <PageHeader title={t("finance.overviewTitle")} pageTitle={`${t("finance.overviewTitle")} | Oguz Travel`} />

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
          {officeName && <MetaItem icon={MapPinHouse}>{officeName}</MetaItem>}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <PeriodRangeFilter period={period} customRange={customRange} onChange={updatePrefs} />
        </Box>
      </Box>

      {isError && <Alert severity="error">{t("dashboard.loadError")}</Alert>}

      {!hasData && isError ? null : isLoading && !hasData ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={190} sx={{ borderRadius: "14px" }} />
          ))}
          <Skeleton variant="rounded" height={380} sx={{ borderRadius: "12px", gridColumn: "1 / -1" }} />
        </Box>
      ) : (
        // A refetch keeps the current render, slightly dimmed — no skeleton flash.
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            opacity: isFetching ? 0.6 : 1,
            transition: "opacity .2s ease",
          }}
        >
          <KpiGrid cards={cards} buckets={buckets} currency={currency} period={period} />

          <CashFlowCard buckets={buckets} currency={currency} granularity={granularity} />

          <MoneyFlowCard categories={categories} currency={currency} />

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 6 }} sx={{ display: "flex", flexDirection: "column" }}>
              <CategoryCard categories={categories} currency={currency} />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }} sx={{ display: "flex", flexDirection: "column" }}>
              <OperatorCard operators={operatorsQuery.data ?? []} currency={currency} />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default FinanceOverview;
