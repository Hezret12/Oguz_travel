import { useState } from "react";
import { Box, Chip, Grid, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import { CalendarDays, CalendarRange, MapPinHouse } from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "../../../components/PageHeader";
import { useLocale } from "../../../hooks/useLocale";
import { useAuth } from "../../../context/useAuth";
import KpiGrid from "./Contents/KpiGrid";
import CategoryCard from "./Contents/CategoryCard";
import CashFlowCard from "./Contents/CashFlowCard";
import FlowBreakdownCard from "./Contents/FlowBreakdownCard";
import OperatorCard from "./Contents/OperatorCard";
import { CURRENCIES, segmentedSx, useOfficeAnalytics } from "./functions/analyticsFormat";
import { CUSTOM_PERIOD, PERIODS, isValidCustomRange } from "./functions/officeAnalyticsMock";
import DateRangePopover from "./Contents/DateRangePopover";

const STORAGE_KEY = "finance_overview_prefs";

const readPrefs = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const writePrefs = (prefs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Preferences are a convenience only.
  }
};

const MetaItem = ({ icon: Icon, children }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary", minWidth: 0 }}>
    <Icon size={15} />
    <Typography noWrap sx={{ fontSize: "0.85rem", color: "text.primary", fontWeight: 500 }}>
      {children}
    </Typography>
  </Box>
);

// Finance report for the signed-in user's office. USD and TMT are reported
// separately (never converted); the currency switch picks which one the
// charts and tables show.
const FinanceOverview = () => {
  const { t, selectedLang } = useLocale();
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(() => {
    const saved = readPrefs();
    const customRange = isValidCustomRange(saved.customRange) ? saved.customRange : null;
    return {
      period:
        PERIODS.includes(saved.period) || (saved.period === CUSTOM_PERIOD && customRange)
          ? saved.period
          : "thisMonth",
      customRange,
      currency: CURRENCIES.includes(saved.currency) ? saved.currency : "USD",
    };
  });
  const { period, currency, customRange } = prefs;
  const [rangeAnchor, setRangeAnchor] = useState(null);

  const updatePrefs = (patch) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    writePrefs(next);
  };

  const applyCustomRange = (nextRange) => {
    updatePrefs({ period: CUSTOM_PERIOD, customRange: nextRange });
    setRangeAnchor(null);
  };

  const { data, isDemo } = useOfficeAnalytics(period, customRange);

  const officeName =
    (typeof user?.office === "string" ? user.office : selectedLang(user?.office)) ||
    selectedLang(data.office.name);
  const range = `${dayjs(data.period.start).format("DD.MM.YYYY")} – ${dayjs(data.period.end).format("DD.MM.YYYY")}`;

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
          <MetaItem icon={CalendarDays}>{range}</MetaItem>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <ToggleButtonGroup
            exclusive
            value={period}
            onChange={(_e, next) => next && updatePrefs({ period: next })}
            sx={segmentedSx}
          >
            {PERIODS.map((p) => (
              <ToggleButton key={p} value={p}>
                {t(`finance.analytics.periods.${p}`)}
              </ToggleButton>
            ))}
            {/* Opens the picker instead of switching; the period only
                becomes "custom" once a valid range is applied. */}
            <ToggleButton
              value={CUSTOM_PERIOD}
              onClick={(e) => {
                e.preventDefault();
                setRangeAnchor(e.currentTarget);
              }}
              sx={{ gap: 0.75 }}
            >
              <CalendarRange size={15} />
              {period === CUSTOM_PERIOD && customRange
                ? `${dayjs(customRange.start).format("DD.MM")} – ${dayjs(customRange.end).format("DD.MM.YY")}`
                : t("finance.analytics.periods.custom")}
            </ToggleButton>
          </ToggleButtonGroup>

          {rangeAnchor && (
            <DateRangePopover
              anchorEl={rangeAnchor}
              value={customRange}
              onApply={applyCustomRange}
              onClose={() => setRangeAnchor(null)}
            />
          )}

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

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <FlowBreakdownCard direction="in" items={data.cashFlow.inflow} currency={currency} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <FlowBreakdownCard direction="out" items={data.cashFlow.outflow} currency={currency} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <CategoryCard categories={data.categories} currency={currency} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <OperatorCard operators={data.operators} currency={currency} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinanceOverview;
