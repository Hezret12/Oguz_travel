import { useMemo } from "react";
import { Alert, Box, Grid, IconButton, MenuItem, Skeleton, TextField, Tooltip, Typography } from "@mui/material";
import { MapPinHouse, RefreshCw } from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "../../components/PageHeader";
import { useLocale } from "../../hooks/useLocale";
import { useAuth } from "../../context/useAuth";
import { useGet } from "../../hooks/CRUD/useGet";
import { getAllCategoriesApi, getAllOfficeApi } from "../../api/queries/getters";
import PeriodRangeFilter from "../Finance/Overview/Contents/PeriodRangeFilter";
import CurrencySwitch from "../Finance/Overview/Contents/CurrencySwitch";
import { formatPercent, percentOf } from "../Finance/Overview/functions/analyticsFormat";
import { useAnalyticsPrefs } from "../Finance/Overview/functions/useAnalyticsPrefs";
import {
  EMPTY_CARDS,
  EMPTY_CATEGORY_ANALYTICS,
  EMPTY_MONEY_OUT,
  EMPTY_PAYMENT,
  combineQueries,
  dashboardGranularity,
  toDashboardParams,
  useDashboardCards,
  useDashboardCategories,
  useDashboardCategoryAnalytics,
  useDashboardChart,
  useDashboardMoneyOut,
  useDashboardOffices,
  useDashboardOperators,
  useDashboardStatus,
} from "../Finance/Overview/functions/dashboardData";
import KpiStrip from "./Contents/KpiStrip";
import TrendCard from "./Contents/TrendCard";
import IncomeExpenseCard from "./Contents/IncomeExpenseCard";
import VolumeCard from "./Contents/VolumeCard";
import OfficesRankCard from "./Contents/OfficesRankCard";
import PaymentStatusCard from "./Contents/PaymentStatusCard";
import CategoryCard from "./Contents/CategoryCard";
import OperatorCard from "./Contents/OperatorCard";

const STORAGE_KEY = "admin_dashboard_prefs";
const CONTROL_HEIGHT = 38;

const listOf = (data) => (Array.isArray(data) ? data : []);

// Sales, cost, profit, receivables and salaries for the period, by service
// and by operator. Who may open the dashboard ("*" or "/") sees every office
// and can narrow it to one; everyone else sees their own office only.
const AdminDashboard = () => {
  const { t, selectedLang } = useLocale();
  const { user } = useAuth();

  const permissions = user?.permissions;
  const canSeeAllOffices = !Array.isArray(permissions) || permissions.includes("*") || permissions.includes("/");

  // `service` is the category picked for the trend and operators ("" = all).
  const [prefs, updatePrefs] = useAnalyticsPrefs(STORAGE_KEY, { service: "", office: "" });
  const { period, customRange, currency, service, office } = prefs;
  const officeGuid = canSeeAllOffices ? office || null : user?.office_guid || null;

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
  const serviceParams = useMemo(() => (service ? { ...params, category_guid: service } : params), [params, service]);
  // The office ranking covers every office, so it drops the office filter and
  // only shows (and loads) while the dashboard itself covers every office.
  const showOffices = canSeeAllOffices && !officeGuid;
  const officesParams = useMemo(() => {
    const rest = { ...params };
    delete rest.office_guid;
    return rest;
  }, [params]);

  const cardsQuery = useDashboardCards(params);
  const chartQuery = useDashboardChart(params);
  const moneyOutQuery = useDashboardMoneyOut(params);
  const statusQuery = useDashboardStatus(params);
  const categoriesQuery = useDashboardCategories(params);
  const analyticsQuery = useDashboardCategoryAnalytics(serviceParams);
  const operatorsQuery = useDashboardOperators(serviceParams);
  const officesQuery = useDashboardOffices(officesParams, { enabled: showOffices });
  const pageQueries = [cardsQuery, chartQuery, moneyOutQuery, statusQuery, categoriesQuery, ...(showOffices ? [officesQuery] : [])];
  const serviceQueries = [analyticsQuery, operatorsQuery];
  const { isLoading, isError, refetch, updatedAt } = combineQueries([...pageQueries, ...serviceQueries]);
  // Picking a service refetches only the trend and the operators, so only they dim.
  const isFetching = combineQueries(pageQueries).isFetching;
  const isServiceFetching = combineQueries(serviceQueries).isFetching;
  const hasData = Boolean(cardsQuery.data);

  const { data: categoriesData } = useGet({ apiFn: getAllCategoriesApi, key: "categories" });
  const { data: officesData } = useGet({
    apiFn: getAllOfficeApi,
    key: "all-offices-filter",
    options: { enabled: canSeeAllOffices },
  });
  const serviceOptions = useMemo(
    () => listOf(categoriesData).map((c) => ({ value: c.guid, label: selectedLang(c.name) || c.name?.tk || "—" })),
    [categoriesData, selectedLang],
  );
  const officeOptions = useMemo(
    () =>
      listOf(officesData).map((o) => ({
        value: o.guid,
        label: selectedLang(o.shortName) || selectedLang(o.fullName) || "—",
      })),
    [officesData, selectedLang],
  );
  const serviceName = serviceOptions.find((s) => s.value === service)?.label;
  const ownOfficeName = typeof user?.office === "string" ? user.office : selectedLang(user?.office);
  const selectService = (next) => updatePrefs({ service: next });

  const cards = cardsQuery.data ?? EMPTY_CARDS;
  const buckets = chartQuery.data ?? [];
  const granularity = dashboardGranularity(period, customRange);
  const revenue = cards.revenue[currency].value;
  const kpis = [
    {
      key: "revenue",
      label: t("dashboard.sales"),
      figure: cards.revenue,
      note: t("dashboard.salesN", { count: cards.count.value }),
      upIsGood: true,
    },
    { key: "cost", label: t("finance.analytics.kpi.cost"), figure: cards.cost, upIsGood: false },
    {
      key: "profit",
      label: t("dashboard.profit"),
      figure: cards.profit,
      note: revenue ? t("finance.analytics.margin", { value: formatPercent(percentOf(cards.profit[currency].value, revenue)) }) : null,
      upIsGood: true,
    },
    { key: "receivable", label: t("dashboard.receivable"), figure: cards.receivable, upIsGood: false },
    { key: "salary", label: t("finance.analytics.kpi.salary"), figure: cards.salary, upIsGood: false },
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
          {!canSeeAllOffices && ownOfficeName && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
              <MapPinHouse size={15} />
              <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 500, color: "text.primary" }}>
                {ownOfficeName}
              </Typography>
            </Box>
          )}
          {updatedAt > 0 && (
            <Typography noWrap sx={{ fontSize: "0.75rem" }}>
              {t("dashboard.updatedAt", { time: dayjs(updatedAt).format("HH:mm") })}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          {canSeeAllOffices && (
            <TextField
              select
              size="small"
              value={office}
              onChange={(e) => updatePrefs({ office: e.target.value })}
              sx={{
                width: 180,
                "& .MuiInputBase-root": { height: CONTROL_HEIGHT, fontSize: "0.8rem", fontWeight: 600, borderRadius: "10px" },
              }}
              slotProps={{
                input: { startAdornment: <MapPinHouse size={15} style={{ marginRight: 8, flexShrink: 0, opacity: 0.6 }} /> },
              }}
            >
              <MenuItem value="" sx={{ fontSize: "0.85rem" }}>
                {t("dashboard.allOffices")}
              </MenuItem>
              {officeOptions.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.85rem" }}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          <PeriodRangeFilter period={period} customRange={customRange} onChange={updatePrefs} />

          <CurrencySwitch value={currency} onChange={(next) => updatePrefs({ currency: next })} />

          <Tooltip title={t("dashboard.refresh")} arrow>
            <span>
              <IconButton
                onClick={refetch}
                disabled={isFetching}
                sx={{
                  width: CONTROL_HEIGHT,
                  height: CONTROL_HEIGHT,
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <RefreshCw size={16} style={{ animation: isFetching ? "dashSpin 1s linear infinite" : "none" }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {isError && <Alert severity="error">{t("dashboard.loadError")}</Alert>}

      {!hasData && isError ? null : isLoading && !hasData ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Skeleton variant="rounded" height={150} sx={{ borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: "12px" }} />
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
          <KpiStrip cells={kpis} currency={currency} compareLabel={t(`finance.analytics.vsPeriod.${period}`)} />

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex", flexDirection: "column" }}>
              <TrendCard
                analytics={analyticsQuery.data ?? EMPTY_CATEGORY_ANALYTICS}
                currency={currency}
                granularity={granularity}
                services={serviceOptions}
                service={service}
                onServiceChange={selectService}
                loading={isServiceFetching}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", flexDirection: "column" }}>
              <PaymentStatusCard
                payment={statusQuery.data ?? EMPTY_PAYMENT}
                receivable={cards.receivable[currency].value}
                currency={currency}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex", flexDirection: "column" }}>
              <IncomeExpenseCard
                buckets={buckets}
                moneyOut={moneyOutQuery.data ?? EMPTY_MONEY_OUT}
                currency={currency}
                granularity={granularity}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", flexDirection: "column" }}>
              <VolumeCard buckets={buckets} currency={currency} granularity={granularity} />
            </Grid>
          </Grid>

          {showOffices && <OfficesRankCard offices={officesQuery.data ?? []} currency={currency} />}

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 7 }} sx={{ display: "flex", flexDirection: "column" }}>
              <CategoryCard
                categories={categoriesQuery.data ?? []}
                currency={currency}
                selectedKey={service}
                onSelect={selectService}
              />
            </Grid>
            <Grid
              size={{ xs: 12, lg: 5 }}
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
