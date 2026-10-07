import { useMemo } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { Building } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import { useLocale } from "../../../hooks/useLocale";
import PeriodRangeFilter from "../Overview/Contents/PeriodRangeFilter";
import RefreshControl from "../Overview/Contents/RefreshControl";
import { CURRENCIES } from "../Overview/functions/analyticsFormat";
import { useAnalyticsPrefs } from "../Overview/functions/useAnalyticsPrefs";
import OfficesSummary from "./Contents/OfficesSummary";
import OfficesChart from "./Contents/OfficesChart";
import OfficesTable from "./Contents/OfficesTable";
import OfficesOutCard from "./Contents/OfficesOutCard";
import { useOfficesFinance } from "./functions/officesFinance";
import { EMPTY_CARDS, combineQueries, toDashboardParams, useDashboardCards } from "../Overview/functions/dashboardData";

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
  const { period, customRange } = prefs;

  const offices = useOfficesFinance(period, customRange);
  const { data } = offices;

  // The headline cards: the same figures as the admin dashboard's, but for every office (no
  // office is asked for), with each one's change against the previous period.
  const cardParams = useMemo(() => toDashboardParams({ period, customRange }), [period, customRange]);
  const cardsQuery = useDashboardCards(cardParams);
  const cards = cardsQuery.data ?? EMPTY_CARDS;

  // One refresh button and one "updated" time for the whole page.
  const cardsStatus = combineQueries([cardsQuery]);
  const isLoading = offices.isLoading || cardsStatus.isLoading;
  const isFetching = offices.isFetching || cardsStatus.isFetching;
  const isError = offices.isError || cardsStatus.isError;
  const updatedAt = Math.min(offices.updatedAt, cardsStatus.updatedAt);
  const refetch = () => Promise.all([offices.refetch(), cardsStatus.refetch()]);

  // The page has no currency switch. Where one currency has to lead (the table's default sort
  // and its share bar), it is the first one the period has any sales in.
  const currency = CURRENCIES.find((c) => data.totals.inflow[c] > 0) ?? prefs.currency;

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
          <RefreshControl updatedAt={updatedAt} isFetching={isFetching} onRefresh={refetch} />
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
          <OfficesSummary cards={cards} />
          <OfficesChart rows={data.rows} />
          <OfficesOutCard rows={data.rows} totals={data.totals} currency={currency} />
          {/* Keyed by the leading currency: its default sort follows it when the period changes. */}
          <OfficesTable key={currency} rows={data.rows} totals={data.totals} currency={currency} />
        </Box>
      )}
    </Box>
  );
};

export default FinanceOffices;
