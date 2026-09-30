import { useMemo } from "react";
import {
  Alert,
  Box,
  Grid,
  IconButton,
  MenuItem,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { HandCoins, PiggyBank, Receipt, RefreshCw, TrendingUp } from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "../../components/PageHeader";
import { useLocale } from "../../hooks/useLocale";
import { useGet } from "../../hooks/CRUD/useGet";
import { getAllCategoriesApi, getAllOfficeApi } from "../../api/queries/getters";
import { KpiCard } from "../Finance/Overview/Contents/KpiGrid";
import PeriodRangeFilter from "../Finance/Overview/Contents/PeriodRangeFilter";
import CategoryCard from "../Finance/Overview/Contents/CategoryCard";
import OperatorCard from "../Finance/Overview/Contents/OperatorCard";
import { KPI_TONES } from "../Finance/Overview/functions/analyticsFormat";
import { useAnalyticsPrefs } from "../Finance/Overview/functions/useAnalyticsPrefs";
import {
  EMPTY_CARDS,
  EMPTY_CATEGORY_ANALYTICS,
  EMPTY_PAYMENT,
  combineQueries,
  dashboardGranularity,
  toDashboardParams,
  useDashboardCards,
  useDashboardCategories,
  useDashboardCategoryAnalytics,
  useDashboardChart,
  useDashboardOperators,
  useDashboardStatus,
} from "../Finance/Overview/functions/dashboardData";
import SalesTrendCard from "./Contents/SalesTrendCard";
import PaymentStatusCard from "./Contents/PaymentStatusCard";
import ServiceAnalyticsCard from "./Contents/ServiceAnalyticsCard";

const STORAGE_KEY = "admin_dashboard_prefs";

const countFormat = (v) => Math.round(Number(v) || 0).toLocaleString("en-US");

// Sales across every module (B2B, THY, outbound, visa, translation, referral
// letters, cafe) for the selected period, office and currency.
const AdminDashboard = () => {
  const { t, selectedLang } = useLocale();
  const mode = useTheme().palette.mode === "dark" ? "dark" : "light";

  // `service` is the category picked for the per-service view ("" = all).
  const [prefs, updatePrefs] = useAnalyticsPrefs(STORAGE_KEY, { office: "", service: "" });
  const { period, customRange, currency, office, service } = prefs;

  const rangeStart = customRange?.start;
  const rangeEnd = customRange?.end;
  const params = useMemo(
    () =>
      toDashboardParams({
        period,
        customRange: rangeStart && rangeEnd ? { start: rangeStart, end: rangeEnd } : null,
        officeGuid: office,
        currency,
      }),
    [period, rangeStart, rangeEnd, office, currency],
  );

  // The per-service view and the operator ranking follow the picked service.
  const serviceParams = useMemo(() => (service ? { ...params, category_guid: service } : params), [params, service]);

  const cardsQuery = useDashboardCards(params);
  const chartQuery = useDashboardChart(params);
  const statusQuery = useDashboardStatus(params);
  const categoriesQuery = useDashboardCategories(params);
  const analyticsQuery = useDashboardCategoryAnalytics(serviceParams);
  const operatorsQuery = useDashboardOperators(serviceParams);
  const pageQueries = [cardsQuery, chartQuery, statusQuery, categoriesQuery];
  const serviceQueries = [analyticsQuery, operatorsQuery];
  const { isLoading, isError, refetch, updatedAt } = combineQueries([...pageQueries, ...serviceQueries]);
  // Picking a service refetches only its two blocks, so only they dim.
  const isFetching = combineQueries(pageQueries).isFetching;
  const isServiceFetching = combineQueries(serviceQueries).isFetching;
  const hasData = Boolean(cardsQuery.data);

  const { data: categoriesData } = useGet({ apiFn: getAllCategoriesApi, key: "categories" });
  const serviceOptions = useMemo(
    () =>
      (Array.isArray(categoriesData) ? categoriesData : []).map((c) => ({
        value: c.guid,
        label: selectedLang(c.name) || c.name?.tk || "—",
      })),
    [categoriesData, selectedLang],
  );
  const serviceName = serviceOptions.find((s) => s.value === service)?.label;
  const selectService = (next) => updatePrefs({ service: next });

  const { data: officesData } = useGet({ apiFn: getAllOfficeApi, key: "all-offices-filter" });
  const officeOptions = useMemo(
    () =>
      (Array.isArray(officesData) ? officesData : []).map((o) => ({
        value: o.guid,
        label: selectedLang(o.shortName) || selectedLang(o.fullName) || "—",
      })),
    [officesData, selectedLang],
  );

  const otherCurrency = currency === "USD" ? "TMT" : "USD";
  // The cards carry both currencies; the chart and lists come in `currency`.
  const cards = cardsQuery.data ?? EMPTY_CARDS;
  const buckets = chartQuery.data ?? [];
  const granularity = dashboardGranularity(period);

  const labels = buckets.map((b) => b.label);
  const compareLabel = t(`finance.analytics.vsPeriod.${period}`);
  const money = (key) => ({
    ...cards[key][currency],
    otherValue: cards[key][otherCurrency].value,
    points: buckets.map((b) => b[key]),
  });
  const kpis = [
    // Card order matches the validated KPI tone order (orange, teal, amber, blue).
    {
      key: "count",
      label: t("dashboard.salesCount"),
      icon: Receipt,
      tone: "outflow",
      ...cards.count,
      points: buckets.map((b) => b.count),
      format: countFormat,
      upIsGood: true,
    },
    { key: "revenue", label: t("dashboard.sales"), icon: TrendingUp, tone: "inflow", ...money("revenue"), upIsGood: true },
    {
      key: "receivable",
      label: t("dashboard.receivable"),
      icon: HandCoins,
      tone: "credit",
      ...money("receivable"),
      upIsGood: false,
    },
    { key: "profit", label: t("dashboard.profit"), icon: PiggyBank, tone: "profit", ...money("profit"), upIsGood: true },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        pb: 4,
        "@keyframes dashSpin": { to: { transform: "rotate(360deg)" } },
      }}
    >
      <PageHeader title={t("sidebar.adminDashboard")} pageTitle={`${t("sidebar.adminDashboard")} | Oguz Travel`} />

      {/* One filter row scopes everything below it */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mt: -1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "text.secondary", minWidth: 0 }}>
          {updatedAt > 0 && (
            <Typography noWrap sx={{ fontSize: "0.75rem" }}>
              {t("dashboard.updatedAt", { time: dayjs(updatedAt).format("HH:mm") })}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <PeriodRangeFilter period={period} customRange={customRange} onChange={updatePrefs} />

          <TextField
            select
            size="small"
            value={office}
            onChange={(e) => updatePrefs({ office: e.target.value })}
            sx={{ minWidth: 170, "& .MuiOutlinedInput-root": { height: 38, borderRadius: "10px", fontSize: "0.85rem" } }}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="">{t("dashboard.allOffices")}</MenuItem>
            {officeOptions.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <Tooltip title={t("dashboard.refresh")} arrow>
            <span>
              <IconButton
                onClick={refetch}
                disabled={isFetching}
                sx={{ width: 38, height: 38, borderRadius: "10px", border: "1px solid", borderColor: "divider" }}
              >
                <RefreshCw
                  size={16}
                  style={{ animation: isFetching ? "dashSpin 1s linear infinite" : "none" }}
                />
              </IconButton>
            </span>
          </Tooltip>
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2, minmax(0,1fr))", lg: "repeat(4, minmax(0,1fr))" },
              gap: 2,
            }}
          >
            {kpis.map((k) => (
              <KpiCard
                key={k.key}
                id={`dash-${k.key}`}
                label={k.label}
                icon={k.icon}
                color={KPI_TONES[k.tone][mode]}
                value={k.value}
                previous={k.previous}
                points={k.points}
                labels={labels}
                upIsGood={k.upIsGood}
                currency={currency}
                otherCurrency={k.otherValue != null ? otherCurrency : null}
                otherValue={k.otherValue}
                compareLabel={compareLabel}
                format={k.format}
              />
            ))}
          </Box>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex", flexDirection: "column" }}>
              <SalesTrendCard buckets={buckets} currency={currency} granularity={granularity} />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", flexDirection: "column" }}>
              <PaymentStatusCard
                payment={statusQuery.data ?? EMPTY_PAYMENT}
                receivable={cards.receivable[currency].value}
                currency={currency}
              />
            </Grid>
          </Grid>

          <ServiceAnalyticsCard
            services={serviceOptions}
            selected={service}
            onSelect={selectService}
            analytics={analyticsQuery.data ?? EMPTY_CATEGORY_ANALYTICS}
            currency={currency}
            loading={isServiceFetching}
          />

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 6 }} sx={{ display: "flex", flexDirection: "column" }}>
              <CategoryCard
                categories={categoriesQuery.data ?? []}
                currency={currency}
                selectedKey={service}
                onSelect={selectService}
              />
            </Grid>
            <Grid
              size={{ xs: 12, lg: 6 }}
              sx={{
                display: "flex",
                flexDirection: "column",
                opacity: isServiceFetching ? 0.6 : 1,
                transition: "opacity .2s ease",
              }}
            >
              <OperatorCard operators={operatorsQuery.data ?? []} currency={currency} scope={serviceName} />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;
