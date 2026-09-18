import { useMemo } from "react";
import { useTheme } from "@mui/material";
import { getOfficeAnalyticsMock } from "./officeAnalyticsMock";

export const CURRENCIES = ["USD", "TMT"];

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

// USD and TMT are shown separately and never converted.
export const formatAmount = (value, currency) => {
  const num = Math.round(Number(value) || 0);
  const text = numberFormatter.format(Math.abs(num));
  const sign = num < 0 ? "−" : "";
  return currency === "USD" ? `${sign}$${text}` : `${sign}${text} TMT`;
};

export const formatCompactAmount = (value, currency) => {
  const num = Number(value) || 0;
  const abs = Math.abs(num);
  const short =
    abs >= 1_000_000 ? `${(abs / 1_000_000).toFixed(1)}M` : abs >= 1000 ? `${Math.round(abs / 1000)}k` : String(Math.round(abs));
  const sign = num < 0 ? "−" : "";
  return currency === "USD" ? `${sign}$${short}` : `${sign}${short}`;
};

export const formatPercent = (value, digits = 1) =>
  `${(Number(value) || 0).toFixed(digits)}%`;

export const percentOf = (part, whole) => (whole ? (part / whole) * 100 : 0);

// Relative change; null when there is nothing to compare against.
export const changePercent = (current, previous) => {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
};

// One brand accent + a neutral, as finance dashboards do. Validated with the
// dataviz palette checker (all pairs pass CVD and normal-vision separation in
// both modes; the grey sits under 3:1, so every chart ships a legend, a table
// view and a dashed line for the grey series).
//   accent  = sales / money in
//   neutral = money out
//   ink     = profit
export const useSeriesColors = () => {
  const { palette } = useTheme();
  const dark = palette.mode === "dark";
  const accent = dark ? "#13A89A" : "#0E8584";
  const neutral = dark ? "#5B6678" : "#94A3B8";
  const ink = dark ? "#CBD5E1" : "#334155";
  return {
    revenue: accent,
    inflow: accent,
    outflow: neutral,
    profit: ink,
  };
};

// One hue per card (each card is a single series, named by its label, so hue
// is never the only cue). Green/red stay reserved for the good/bad change
// pill. Validated in card order with the dataviz palette checker on the
// theme's paper surfaces #ffffff / #12131A: adjacent CVD, normal-vision and
// 3:1 contrast all pass; the light teal is the brand accent, kept as is.
export const KPI_TONES = {
  outflow: { light: "#EB6834", dark: "#D95926" }, // orange
  inflow: { light: "#0E8584", dark: "#13A89A" }, // brand teal
  credit: { light: "#B7791F", dark: "#C98500" }, // amber — money still owed
  profit: { light: "#2A78D6", dark: "#3987E5" }, // blue
};

// Shared look for x-charts (v9 class names): no axis lines or ticks, a
// faint solid grid. `areas` maps a series id to a <ChartGradients> id ("*"
// targets every area); `dashed` lists series ids drawn dashed.
export const chartSx = (areas = {}, dashed = []) => (theme) => ({
  "& .MuiLineChart-line": { strokeWidth: 1.75 },
  // The theme divider is already a faint rgba; use it as is.
  "& .MuiChartsGrid-line": { stroke: theme.palette.divider, strokeDasharray: "none" },
  "& .MuiChartsAxis-tickLabel": { fill: theme.palette.text.secondary },
  // Soft hover band instead of the default flat grey.
  "& .MuiChartsAxisHighlight-root": {
    fill: theme.palette.text.primary,
    fillOpacity: theme.palette.mode === "dark" ? 0.06 : 0.035,
  },
  ...Object.fromEntries(
    Object.entries(areas).map(([seriesId, gradientId]) => [
      seriesId === "*" ? "& .MuiLineChart-area" : `& .MuiLineChart-area[data-series="${seriesId}"]`,
      { fill: `url(#${gradientId})` },
    ]),
  ),
  ...Object.fromEntries(
    dashed.map((seriesId) => [
      `& .MuiLineChart-line[data-series="${seriesId}"]`,
      { strokeDasharray: "5 4" },
    ]),
  ),
});

export const tickLabelStyle = { fontSize: 11 };

export const xAxisBase = { disableLine: true, disableTicks: true, tickLabelStyle };
export const yAxisBase = { disableLine: true, disableTicks: true, tickLabelStyle, width: 56 };

// Floating, soft tooltip that matches the cards.
export const tooltipSlotProps = {
  tooltip: {
    sx: (theme) => ({
      "& .MuiChartsTooltip-paper": {
        borderRadius: "10px",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 8px 24px rgba(0,0,0,0.5)"
            : "0 8px 24px rgba(15, 23, 42, 0.08)",
        backgroundImage: "none",
      },
      "& .MuiChartsTooltip-cell": { fontSize: "0.78rem", py: 0.5 },
      "& .MuiChartsTooltip-axisValueCell": { fontWeight: 700 },
    }),
  },
};

// Segmented control look shared by the period and currency switches.
export const segmentedSx = {
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

// Quiet table: light header, roomy rows, hairline separators.
export const tableSx = (theme) => ({
  "& .MuiTableCell-root": { borderColor: theme.palette.divider },
  "& .MuiTableCell-head": {
    fontSize: "0.72rem",
    fontWeight: 600,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    py: 1,
    whiteSpace: "nowrap",
  },
  "& .MuiTableCell-body": { fontSize: "0.85rem", py: 1.25 },
  "& .MuiTableBody-root .MuiTableRow-root:last-of-type .MuiTableCell-body": { borderBottom: 0 },
  "& .MuiTableRow-hover:hover": { backgroundColor: theme.palette.action.hover },
  "& .MuiTableCell-footer": {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: 0,
  },
  "& .MuiTableCell-root:first-of-type": { pl: 0 },
  "& .MuiTableCell-root:last-of-type": { pr: 0 },
});

// Demo data today; replace the body with a useGet on
// /total-calculations/get-office-analytics once the endpoint exists.
// `customRange` ({ start, end } as "YYYY-MM-DD") applies when period is "custom";
// the real request should send it as start_date / end_date.
export const useOfficeAnalytics = (period, customRange) => {
  const start = customRange?.start;
  const end = customRange?.end;
  const data = useMemo(
    () => getOfficeAnalyticsMock(period, undefined, start && end ? { start, end } : null),
    [period, start, end],
  );
  return { data, isLoading: false, isDemo: true };
};
