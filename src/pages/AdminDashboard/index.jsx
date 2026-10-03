import { useCallback, useMemo } from "react";
import { Alert, Box, Grid, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import { BanknoteArrowDown, BanknoteArrowUp, HandCoins, MapPinHouse, PiggyBank, RefreshCw } from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "../../components/PageHeader";
import BaseFareLabel from "../../components/BaseFareLabel";
import ComponentErrorBoundary from "../../components/ComponentErrorBoundary";
import { useLocale } from "../../hooks/useLocale";
import { useAuth } from "../../context/useAuth";
import { useGet } from "../../hooks/CRUD/useGet";
import { getAllCategoriesApi } from "../../api/queries/getters";
import PeriodRangeFilter from "../Finance/Overview/Contents/PeriodRangeFilter";
import { KPI_TONES, formatPercent, percentOf } from "../Finance/Overview/functions/analyticsFormat";
import { useAnalyticsPrefs } from "../Finance/Overview/functions/useAnalyticsPrefs";
import {
  BOTH_CURRENCIES,
  EMPTY_CARDS,
  EMPTY_CATEGORY_ANALYTICS,
  EMPTY_MONEY_OUT,
  EMPTY_PAYMENT,
  combineQueries,
  dashboardGranularity,
  toDashboardParams,
  useDashboardCards,
  useDashboardCategoriesByCurrency,
  useDashboardCategoryAnalyticsByCurrency,
  useDashboardChartByCurrency,
  useDashboardMoneyOutByCurrency,
  useDashboardOfficesByCurrency,
  useDashboardOperatorsByCurrency,
  useDashboardStatusByCurrency,
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

// One shared empty list, so a card waiting for data gets the same prop each render.
const EMPTY_LIST = [];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A guid remembered from an earlier visit, safe to send: well-formed, and —
// once the option list has loaded — still one of the options. A service
// deleted since, or a damaged saved value, reads as "all" instead of failing
// every request it is sent with.
const knownGuid = (guid, options, loaded) =>
  UUID.test(guid || "") && (!loaded || options.some((o) => o.value === guid)) ? guid : "";

// Empty `{ TMT, USD }` stand-ins while the per-currency queries load.
const bothOf = (empty) => Object.fromEntries(BOTH_CURRENCIES.map((currency) => [currency, empty]));
const EMPTY_BY_CURRENCY = {
  analytics: bothOf(EMPTY_CATEGORY_ANALYTICS),
  payment: bothOf(EMPTY_PAYMENT),
  moneyOut: bothOf(EMPTY_MONEY_OUT),
};

// Sales, cost, profit, receivables and salaries for the period, by service
// and by operator, in TMT and USD at once — never added, no currency picker. The office is not a choice: the
// dashboard reports the signed-in user's own office, and every office only
// for a user who belongs to none.
const AdminDashboard = () => {
  const { t, selectedLang } = useLocale();
  const { user } = useAuth();

  const permissions = user?.permissions;
  const canSeeAllOffices = !Array.isArray(permissions) || permissions.includes("*") || permissions.includes("/");

  // `service` is the category picked for the trend and operators ("" = all).
  const [prefs, updatePrefs] = useAnalyticsPrefs(STORAGE_KEY, { service: "" });
  const { period, customRange } = prefs;

  const { data: categoriesData, isSuccess: categoriesLoaded } = useGet({ apiFn: getAllCategoriesApi, key: "categories" });
  const serviceOptions = useMemo(
    () => listOf(categoriesData).map((c) => ({ value: c.guid, label: selectedLang(c.name) || c.name?.tk || "—" })),
    [categoriesData, selectedLang],
  );
  const service = knownGuid(prefs.service, serviceOptions, categoriesLoaded);
  // auth/me sends the office as a nested { guid, fullName, shortName }.
  const officeGuid = user?.office_guid || user?.office?.guid || null;

  const rangeStart = customRange?.start;
  const rangeEnd = customRange?.end;
  const params = useMemo(
    () =>
      toDashboardParams({
        period,
        customRange: rangeStart && rangeEnd ? { start: rangeStart, end: rangeEnd } : null,
        officeGuid,
      }),
    [period, rangeStart, rangeEnd, officeGuid],
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
  const chartQuery = useDashboardChartByCurrency(params);
  const moneyOutQuery = useDashboardMoneyOutByCurrency(params);
  const statusQuery = useDashboardStatusByCurrency(params);
  const categoriesQuery = useDashboardCategoriesByCurrency(params);
  const analyticsQuery = useDashboardCategoryAnalyticsByCurrency(serviceParams);
  const operatorsQuery = useDashboardOperatorsByCurrency(serviceParams);
  const officesQuery = useDashboardOfficesByCurrency(officesParams, { enabled: showOffices });
  const pageQueries = [cardsQuery, chartQuery, moneyOutQuery, statusQuery, categoriesQuery, ...(showOffices ? [officesQuery] : [])];
  const serviceQueries = [analyticsQuery, operatorsQuery];
  const { isLoading, isError, refetch, updatedAt } = combineQueries([...pageQueries, ...serviceQueries]);
  // Picking a service refetches only the trend and the operators, so only they dim.
  const isFetching = combineQueries(pageQueries).isFetching;
  const isServiceFetching = combineQueries(serviceQueries).isFetching;
  const hasData = Boolean(cardsQuery.data);

  const serviceName = serviceOptions.find((s) => s.value === service)?.label;
  // The saved prefs arrive before the option lists load; until the stored guid
  // is among the options the selects show "all" instead of an unknown value.
  const serviceValue = serviceName ? service : "";
  // normalizeUser reduces the office to its name: a string, or the
  // multilingual { tk, ru, en } object.
  const ownOfficeName = (typeof user?.office === "string" ? user.office : selectedLang(user?.office)) || "";
  // No office of their own: the report covers all of them.
  const officeLabel = officeGuid ? ownOfficeName || "—" : t("dashboard.allOffices");
  const selectService = useCallback((next) => updatePrefs({ service: next }), [updatePrefs]);

  const cards = cardsQuery.data ?? EMPTY_CARDS;
  const buckets = chartQuery.data ?? EMPTY_LIST;
  const granularity = dashboardGranularity(period, customRange);
  const receivable = useMemo(
    () => ({ TMT: cards.receivable.TMT.value, USD: cards.receivable.USD.value }),
    [cards],
  );
  // Memoised with the rest of the cards' props: the cards are memo()'d, so one
  // that gets the same props (e.g. while only the trend refetches) is skipped.
  const kpis = useMemo(() => [
    {
      key: "revenue",
      label: t("dashboard.sales"),
      icon: BanknoteArrowDown,
      tone: KPI_TONES.inflow,
      figure: cards.revenue,
      upIsGood: true,
    },
    {
      key: "cost",
      label: <BaseFareLabel />,
      icon: BanknoteArrowUp,
      tone: KPI_TONES.outflow,
      figure: cards.cost,
      upIsGood: false,
    },
    {
      key: "profit",
      label: t("dashboard.profit"),
      icon: PiggyBank,
      tone: KPI_TONES.profit,
      figure: cards.profit,
      hint: (currency) => {
        const revenue = cards.revenue[currency].value;
        return revenue
          ? t("finance.analytics.margin", { value: formatPercent(percentOf(cards.profit[currency].value, revenue)) })
          : null;
      },
      upIsGood: true,
    },
    {
      key: "receivable",
      label: t("dashboard.receivable"),
      icon: HandCoins,
      tone: KPI_TONES.credit,
      figure: cards.receivable,
      upIsGood: false,
    },
  ], [cards, t]);

  // A card that throws on data in a shape it did not expect shows this notice
  // in its own place; the rest of the dashboard stays up. A refetch clears it.
  const guard = (card) => (
    <ComponentErrorBoundary
      resetKey={updatedAt}
      title={t("errorBoundary.genericErrorTitle")}
      description={t("errorBoundary.genericErrorDesc")}
      retryLabel={t("errorBoundary.retry")}
    >
      {card}
    </ComponentErrorBoundary>
  );

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

      {/* One filter row scopes everything below it: the office (shown, not chosen) on the left,
          the period and the refresh on the right, every control one height. */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap", mt: -1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            height: CONTROL_HEIGHT,
            px: 1.5,
            minWidth: 0,
            borderRadius: "10px",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            color: "text.secondary",
          }}
        >
          <MapPinHouse size={16} style={{ flexShrink: 0 }} />
          <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 600, color: "text.primary" }}>
            {officeLabel}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <PeriodRangeFilter period={period} customRange={customRange} onChange={updatePrefs} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 1, ml: 0.25, borderLeft: "1px solid", borderColor: "divider" }}>
            {updatedAt > 0 && (
              <Typography noWrap sx={{ fontSize: "0.75rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                {t("dashboard.updatedAt", { time: dayjs(updatedAt).format("HH:mm") })}
              </Typography>
            )}
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
                    backgroundColor: "background.paper",
                    color: "text.secondary",
                    "&:hover": { borderColor: "primary.main", color: "primary.main", backgroundColor: "background.paper" },
                  }}
                >
                  <RefreshCw size={16} style={{ animation: isFetching ? "dashSpin 1s linear infinite" : "none" }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
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
          {guard(<KpiStrip cells={kpis} compareLabel={t(`finance.analytics.vsPeriod.${period}`)} />)}

          {/* The two time charts take the full width; the smaller cards share a row */}
          {guard(
            <TrendCard
              analytics={analyticsQuery.data ?? EMPTY_BY_CURRENCY.analytics}
              granularity={granularity}
              services={serviceOptions}
              service={serviceValue}
              onServiceChange={selectService}
              loading={isServiceFetching}
            />,
          )}

          {guard(
            <IncomeExpenseCard
              buckets={buckets}
              moneyOut={moneyOutQuery.data ?? EMPTY_BY_CURRENCY.moneyOut}
              granularity={granularity}
            />,
          )}

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 6 }} sx={{ display: "flex", flexDirection: "column" }}>
              {guard(
                <PaymentStatusCard payment={statusQuery.data ?? EMPTY_BY_CURRENCY.payment} receivable={receivable} />,
              )}
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }} sx={{ display: "flex", flexDirection: "column" }}>
              {guard(<VolumeCard buckets={buckets} granularity={granularity} />)}
            </Grid>
          </Grid>

          {showOffices && guard(<OfficesRankCard offices={officesQuery.data ?? EMPTY_LIST} />)}

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }} sx={{ display: "flex", flexDirection: "column" }}>
              {guard(
                <CategoryCard
                  categories={categoriesQuery.data ?? EMPTY_LIST}
                  selectedKey={service}
                  onSelect={selectService}
                />,
              )}
            </Grid>
            <Grid
              size={{ xs: 12 }}
              sx={{
                display: "flex",
                flexDirection: "column",
                opacity: isServiceFetching ? 0.6 : 1,
                transition: "opacity .2s ease",
              }}
            >
              {guard(<OperatorCard operators={operatorsQuery.data ?? EMPTY_LIST} scope={serviceName} />)}
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;
