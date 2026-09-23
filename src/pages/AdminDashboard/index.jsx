import { useMemo } from "react";
import {
  Alert,
  Box,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Skeleton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { HandCoins, PiggyBank, Receipt, RefreshCw, TrendingUp } from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "../../components/PageHeader";
import { useLocale } from "../../hooks/useLocale";
import { useGet } from "../../hooks/CRUD/useGet";
import { getAllOfficeApi } from "../../api/queries/getters";
import { KpiCard } from "../Finance/Overview/Contents/KpiGrid";
import PeriodRangeFilter from "../Finance/Overview/Contents/PeriodRangeFilter";
import { CURRENCIES, KPI_TONES, segmentedSx } from "../Finance/Overview/functions/analyticsFormat";
import { useAnalyticsPrefs } from "../Finance/Overview/functions/useAnalyticsPrefs";
import { aggregateSales, resolveRange, useSalesRows } from "./functions/salesDashboard";
import { MOCK_OFFICES } from "./functions/salesMock";
import SalesTrendCard from "./Contents/SalesTrendCard";
import PaymentStatusCard from "./Contents/PaymentStatusCard";
import ModulesSection from "./Contents/ModulesSection";

const STORAGE_KEY = "admin_dashboard_prefs";

const countFormat = (v) => Math.round(Number(v) || 0).toLocaleString("en-US");

// Sales across every module (B2B, THY, outbound, visa, translation, referral
// letters, cafe) for the selected period, office and currency.
const AdminDashboard = () => {
  const { t, selectedLang } = useLocale();
  const mode = useTheme().palette.mode === "dark" ? "dark" : "light";

  const [prefs, updatePrefs] = useAnalyticsPrefs(STORAGE_KEY, { office: "" });
  const { period, customRange, currency, office } = prefs;

  const rangeStart = customRange?.start;
  const rangeEnd = customRange?.end;
  const range = useMemo(
    () => resolveRange(period, rangeStart && rangeEnd ? { start: rangeStart, end: rangeEnd } : null),
    [period, rangeStart, rangeEnd],
  );

  const { rows, isLoading, isFetching, isError, refetch, updatedAt, isDemo } = useSalesRows(range);

  const { data: officesData } = useGet({ apiFn: getAllOfficeApi, key: "all-offices-filter" });
  const officeOptions = useMemo(
    () =>
      (isDemo ? MOCK_OFFICES : Array.isArray(officesData) ? officesData : []).map((o) => ({
        value: o.guid,
        label: selectedLang(o.shortName) || selectedLang(o.fullName) || "—",
      })),
    [isDemo, officesData, selectedLang],
  );

  const otherCurrency = currency === "USD" ? "TMT" : "USD";
  const data = useMemo(
    () => aggregateSales(rows, { range, currency, officeGuid: office }),
    [rows, range, currency, office],
  );
  const other = useMemo(
    () => aggregateSales(rows, { range, currency: otherCurrency, officeGuid: office }),
    [rows, range, otherCurrency, office],
  );

  const labels = data.buckets.map((b) => b.label);
  const compareLabel = t(`finance.analytics.vsPeriod.${period}`);
  const kpis = [
    // Card order matches the validated KPI tone order (orange, teal, amber, blue).
    {
      key: "count",
      label: t("dashboard.salesCount"),
      icon: Receipt,
      tone: "outflow",
      value: data.current.count,
      previous: data.previous.count,
      points: data.buckets.map((b) => b.count),
      format: countFormat,
      upIsGood: true,
    },
    {
      key: "revenue",
      label: t("dashboard.sales"),
      icon: TrendingUp,
      tone: "inflow",
      value: data.current.revenue,
      previous: data.previous.revenue,
      points: data.buckets.map((b) => b.revenue),
      otherValue: other.current.revenue,
      upIsGood: true,
    },
    {
      key: "receivable",
      label: t("dashboard.receivable"),
      icon: HandCoins,
      tone: "credit",
      value: data.current.receivable,
      previous: data.previous.receivable,
      points: data.buckets.map((b) => b.receivable),
      otherValue: other.current.receivable,
      upIsGood: false,
    },
    {
      key: "profit",
      label: t("dashboard.profit"),
      icon: PiggyBank,
      tone: "profit",
      value: data.current.profit,
      previous: data.previous.profit,
      points: data.buckets.map((b) => b.profit),
      otherValue: other.current.profit,
      upIsGood: true,
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
      <PageHeader title={t("sidebar.adminDashboard")} pageTitle={`${t("sidebar.adminDashboard")} | Oguz Travel`}>
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

          <Tooltip title={t("finance.analytics.noConversion")} arrow>
            <ToggleButtonGroup
              exclusive
              value={currency}
              onChange={(_e, next) => next && updatePrefs({ currency: next })}
              sx={segmentedSx}
            >
              {CURRENCIES.map((c) => (
                <ToggleButton key={c} value={c}>
                  {c}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Tooltip>

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

      {isLoading && rows.length === 0 ? (
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

          <ModulesSection modules={data.modules} currency={currency} labels={labels} compareLabel={compareLabel} />

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex", flexDirection: "column" }}>
              <SalesTrendCard buckets={data.buckets} currency={currency} granularity={range.granularity} />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", flexDirection: "column" }}>
              <PaymentStatusCard payment={data.payment} receivable={data.current.receivable} currency={currency} />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;
