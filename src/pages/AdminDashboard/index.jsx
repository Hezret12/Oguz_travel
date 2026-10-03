import { useMemo } from "react";
import { Alert, Box, Grid, IconButton, MenuItem, Skeleton, TextField, Tooltip, Typography } from "@mui/material";
import { BanknoteArrowDown, BanknoteArrowUp, HandCoins, MapPinHouse, PiggyBank, RefreshCw } from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "../../components/PageHeader";
import BaseFareLabel from "../../components/BaseFareLabel";
import { useLocale } from "../../hooks/useLocale";
import { useAuth } from "../../context/useAuth";
import { useGet } from "../../hooks/CRUD/useGet";
import { getAllCategoriesApi, getAllOfficeApi } from "../../api/queries/getters";
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

// Empty `{ TMT, USD }` stand-ins while the per-currency queries load.
const bothOf = (empty) => Object.fromEntries(BOTH_CURRENCIES.map((currency) => [currency, empty]));
const EMPTY_BY_CURRENCY = {
  analytics: bothOf(EMPTY_CATEGORY_ANALYTICS),
  payment: bothOf(EMPTY_PAYMENT),
  moneyOut: bothOf(EMPTY_MONEY_OUT),
};

// Sales, cost, profit, receivables and salaries for the period, by service
// and by operator, in TMT and USD at once — never added, no currency picker. Who may open the dashboard ("*" or "/") sees every office
// and can narrow it to one; everyone else sees their own office only.
const AdminDashboard = () => {
  const { t, selectedLang } = useLocale();
  const { user } = useAuth();

  const permissions = user?.permissions;
  const canSeeAllOffices = !Array.isArray(permissions) || permissions.includes("*") || permissions.includes("/");

  // `service` is the category picked for the trend and operators ("" = all).
  const [prefs, updatePrefs] = useAnalyticsPrefs(STORAGE_KEY, { service: "", office: "" });
  const { period, customRange, service, office } = prefs;
  const officeGuid = canSeeAllOffices ? office || null : user?.office_guid || null;

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
  // The saved prefs arrive before the option lists load; until the stored guid
  // is among the options the selects show "all" instead of an unknown value.
  const officeValue = officeOptions.some((o) => o.value === office) ? office : "";
  const serviceValue = serviceName ? service : "";
  const ownOfficeName = typeof user?.office === "string" ? user.office : selectedLang(user?.office);
  const selectService = (next) => updatePrefs({ service: next });

  const cards = cardsQuery.data ?? EMPTY_CARDS;
  const buckets = chartQuery.data ?? [];
  const granularity = dashboardGranularity(period, customRange);
  const kpis = [
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

      {/* One filter row scopes everything below it: the office on the left,
          the period and the refresh on the right, every control one height. */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap", mt: -1 }}>
        {canSeeAllOffices ? (
          <TextField
            select
            size="small"
            value={officeValue}
            onChange={(e) => updatePrefs({ office: e.target.value })}
            sx={{
              width: 210,
              "& .MuiInputBase-root": {
                height: CONTROL_HEIGHT,
                fontSize: "0.85rem",
                fontWeight: 600,
                borderRadius: "10px",
                backgroundColor: "background.paper",
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <Box component="span" sx={{ display: "flex", mr: 1, color: "text.secondary", flexShrink: 0 }}>
                    <MapPinHouse size={16} />
                  </Box>
                ),
              },
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
        ) : (
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
              visibility: ownOfficeName ? "visible" : "hidden",
            }}
          >
            <MapPinHouse size={16} style={{ flexShrink: 0 }} />
            <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 600, color: "text.primary" }}>
              {ownOfficeName}
            </Typography>
          </Box>
        )}

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
          <KpiStrip cells={kpis} compareLabel={t(`finance.analytics.vsPeriod.${period}`)} />

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex", flexDirection: "column" }}>
              <TrendCard
                analytics={analyticsQuery.data ?? EMPTY_BY_CURRENCY.analytics}
                granularity={granularity}
                services={serviceOptions}
                service={serviceValue}
                onServiceChange={selectService}
                loading={isServiceFetching}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", flexDirection: "column" }}>
              <PaymentStatusCard
                payment={statusQuery.data ?? EMPTY_BY_CURRENCY.payment}
                receivable={{ TMT: cards.receivable.TMT.value, USD: cards.receivable.USD.value }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex", flexDirection: "column" }}>
              <IncomeExpenseCard
                buckets={buckets}
                moneyOut={moneyOutQuery.data ?? EMPTY_BY_CURRENCY.moneyOut}
                granularity={granularity}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", flexDirection: "column" }}>
              <VolumeCard buckets={buckets} granularity={granularity} />
            </Grid>
          </Grid>

          {showOffices && <OfficesRankCard offices={officesQuery.data ?? []} />}

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }} sx={{ display: "flex", flexDirection: "column" }}>
              <CategoryCard
                categories={categoriesQuery.data ?? []}
                selectedKey={service}
                onSelect={selectService}
              />
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
              <OperatorCard operators={operatorsQuery.data ?? []} scope={serviceName} />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;
