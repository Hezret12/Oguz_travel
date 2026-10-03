import { useTheme } from "@mui/material";

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

// Money in vs. money out charts: teal = in, orange = out (same tones as the
// KPI cards), neutral ink for anything else. Validated with the dataviz
// checker on #ffffff / #12131A: teal↔orange passes CVD in both modes. Blue
// was rejected as a third hue — teal↔blue fails the normal-vision floor in
// light mode.
export const useFlowColors = () => {
  const { palette } = useTheme();
  const dark = palette.mode === "dark";
  return {
    inflow: dark ? KPI_TONES.inflow.dark : KPI_TONES.inflow.light,
    outflow: dark ? KPI_TONES.outflow.dark : KPI_TONES.outflow.light,
    neutral: dark ? "#CBD5E1" : "#334155",
    surface: palette.background.paper,
  };
};

// Dashboard series: sales, cost and profit, the dataviz reference categorical
// slots 1 (blue), 2 (orange) and 3 (aqua) — the same hue for the same measure
// on every chart. Validated all-pairs on #ffffff / #12131A: every hard gate
// passes in both modes; the light aqua sits under 3:1, so each chart ships a
// legend with values and a table view. A previous-period line is the same
// measure as sales, so it keeps the sales hue — dashed and faded.
// Money out stacks cost (orange), salaries (violet, slot 7) and kassa expenses
// (yellow, slot 4); validated in stack order beside sales. The light yellow
// sits under 3:1, so the stack keeps 2px surface gaps, a legend and a table.
export const useDashboardColors = () => {
  const { palette } = useTheme();
  const dark = palette.mode === "dark";
  return {
    sale: dark ? "#3987e5" : "#2a78d6",
    cost: dark ? "#d95926" : "#eb6834",
    profit: dark ? "#199e70" : "#1baf7a",
    salary: dark ? "#9085e9" : "#4a3aa7",
    expense: dark ? "#c98500" : "#eda100",
  };
};

// Slice colours for part-to-whole donuts, in fixed order (never cycled):
// the dataviz reference categorical slots 1–5, plus a neutral for "Other".
// Validated adjacent-pair on #ffffff / #12131A — all hard gates pass; in light
// mode aqua/yellow/magenta sit under 3:1, so every donut ships a visible
// legend with names and amounts.
const SLICE_COLORS = {
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"],
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181"],
};
export const useSliceColors = () => {
  const { palette } = useTheme();
  const dark = palette.mode === "dark";
  return { slots: dark ? SLICE_COLORS.dark : SLICE_COLORS.light, other: dark ? "#5B6678" : "#94A3B8" };
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
  expense: { light: "#64748B", dark: "#94A3B8" }, // slate — office running cost, not a sale
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
// A function so the selected pill can lift in dark mode: there
// background.paper is darker than the action.hover track and would read as a
// hole, not a raised tab.
export const segmentedSx = (theme) => ({
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
      ...theme.applyStyles("dark", {
        // Neutral lift; the dark action.selected is teal-tinted.
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
      }),
    },
  },
});

// A ranking table that may get long (a row per service, per operator): past
// this height it scrolls inside its card instead of stretching the page. Use
// with `stickyHeader` on the Table; `stickyFooterSx` keeps a totals row in view.
export const scrollTableSx = { maxHeight: 460, overflowY: "auto", scrollbarWidth: "thin" };
export const stickyFooterSx = {
  "& .MuiTableCell-footer": {
    position: "sticky",
    bottom: 0,
    zIndex: 2,
    backgroundColor: "background.paper",
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
