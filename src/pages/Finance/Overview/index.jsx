import { useState } from "react";
import { Box, Chip, Grid, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import { Building2, CalendarDays, FlaskConical } from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "../../../components/PageHeader";
import { useLocale } from "../../../hooks/useLocale";
import { useAuth } from "../../../context/useAuth";
import KpiGrid from "./Contents/KpiGrid";
import TrendCard from "./Contents/TrendCard";
import CategoryCard from "./Contents/CategoryCard";
import CashFlowCard from "./Contents/CashFlowCard";
import FlowBreakdownCard from "./Contents/FlowBreakdownCard";
import WeekdayCard from "./Contents/WeekdayCard";
import OperatorCard from "./Contents/OperatorCard";
import ReceivablesCard from "./Contents/ReceivablesCard";
import { GroupTitle } from "./Contents/SectionCard";
import { CURRENCIES, useOfficeAnalytics, useSeriesColors } from "./functions/analyticsFormat";
import { PERIODS } from "./functions/officeAnalyticsMock";

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

// Segmented control look shared by the period and currency switches.
const segmentedSx = {
  p: 0.375,
  gap: 0.375,
  borderRadius: "10px",
  backgroundColor: "action.hover",
  "& .MuiToggleButtonGroup-grouped": {
    border: 0,
    borderRadius: "8px !important",
    m: 0,
  },
  "& .MuiToggleButton-root": {
    height: 32,
    px: 1.5,
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
    color: "text.secondary",
    "&.Mui-selected, &.Mui-selected:hover": {
      color: "text.primary",
      backgroundColor: "background.paper",
      boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
    },
  },
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
    return {
      period: PERIODS.includes(saved.period) ? saved.period : "thisMonth",
      currency: CURRENCIES.includes(saved.currency) ? saved.currency : "USD",
    };
  });
  const { period, currency } = prefs;

  const updatePrefs = (patch) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    writePrefs(next);
  };

  const { data, isDemo } = useOfficeAnalytics(period);
  const colors = useSeriesColors();

  const officeName =
    (typeof user?.office === "string" ? user.office : selectedLang(user?.office)) ||
    selectedLang(data.office.name);
  const range = `${dayjs(data.period.start).format("DD.MM.YYYY")} – ${dayjs(data.period.end).format("DD.MM.YYYY")}`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 4 }}>
      <PageHeader title={t("finance.overviewTitle")} pageTitle={`${t("finance.overviewTitle")} | Oguz Travel`}>
        {isDemo && (
          <Tooltip title={t("finance.analytics.demoHint")} arrow>
            <Chip
              icon={<FlaskConical size={13} />}
              label={t("finance.analytics.demo")}
              size="small"
              sx={{ fontWeight: 600, color: "warning.main", backgroundColor: "action.hover", "& .MuiChip-icon": { color: "warning.main" } }}
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
          <MetaItem icon={Building2}>{officeName}</MetaItem>
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
          </ToggleButtonGroup>

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

      <KpiGrid totals={data.totals} currency={currency} />

      <GroupTitle>{t("finance.analytics.groups.cash")}</GroupTitle>
      <CashFlowCard cashFlow={data.cashFlow} currency={currency} granularity={data.period.granularity} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <FlowBreakdownCard
            title={t("finance.analytics.flow.inTitle")}
            subtitle={t("finance.analytics.flow.inSubtitle")}
            items={data.cashFlow.inflow}
            currency={currency}
            color={colors.inflow}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <FlowBreakdownCard
            title={t("finance.analytics.flow.outTitle")}
            subtitle={t("finance.analytics.flow.outSubtitle")}
            items={data.cashFlow.outflow}
            currency={currency}
            color={colors.outflow}
          />
        </Grid>
      </Grid>

      <GroupTitle>{t("finance.analytics.groups.sales")}</GroupTitle>
      <TrendCard trend={data.trend} currency={currency} granularity={data.period.granularity} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <CategoryCard categories={data.categories} currency={currency} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <WeekdayCard weekdays={data.weekdays} currency={currency} />
        </Grid>
      </Grid>

      <GroupTitle>{t("finance.analytics.groups.people")}</GroupTitle>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <OperatorCard operators={data.operators} currency={currency} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <ReceivablesCard receivables={data.receivables} currency={currency} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinanceOverview;
