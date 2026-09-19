import { useState } from "react";
import { Box, Chip, CircularProgress, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import { Building, CalendarDays, CalendarRange } from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "../../../components/PageHeader";
import { useLocale } from "../../../hooks/useLocale";
import DateRangePopover from "../Overview/Contents/DateRangePopover";
import { CURRENCIES, segmentedSx } from "../Overview/functions/analyticsFormat";
import { CUSTOM_PERIOD, PERIODS, isValidCustomRange } from "../Overview/functions/officeAnalyticsMock";
import OfficesSummary from "./Contents/OfficesSummary";
import OfficesChart from "./Contents/OfficesChart";
import OfficesTable from "./Contents/OfficesTable";
import { useOfficesFinance } from "./functions/officesFinance";

const STORAGE_KEY = "finance_offices_prefs";

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

// Every office's money in, money out and profit for a period, one total per
// office, in USD and TMT side by side (never converted).
const FinanceOffices = () => {
  const { t } = useLocale();
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
  const { period, customRange, currency } = prefs;
  const [rangeAnchor, setRangeAnchor] = useState(null);

  const updatePrefs = (patch) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    writePrefs(next);
  };

  const { data, isLoading, isDemo } = useOfficesFinance(period, customRange);
  const range = `${dayjs(data.period.start).format("DD.MM.YYYY")} – ${dayjs(data.period.end).format("DD.MM.YYYY")}`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pb: 4 }}>
      <PageHeader title={t("finance.offices.title")} pageTitle={`${t("finance.offices.title")} | Oguz Travel`}>
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
          <MetaItem icon={Building}>{t("finance.offices.officeCount", { count: data.rows.length })}</MetaItem>
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
              onApply={(nextRange) => {
                updatePrefs({ period: CUSTOM_PERIOD, customRange: nextRange });
                setRangeAnchor(null);
              }}
              onClose={() => setRangeAnchor(null)}
            />
          )}

          {/* Currency for the chart; the summary and table show both */}
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

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          <OfficesSummary rows={data.rows} totals={data.totals} />
          <OfficesChart rows={data.rows} currency={currency} />
          <OfficesTable rows={data.rows} totals={data.totals} />
        </>
      )}
    </Box>
  );
};

export default FinanceOffices;
