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

// Categorical slots of the validated reference palette, stepped per mode.
// Meaning is fixed across the page: money in / sales = blue, money out /
// cost = orange, profit = aqua. The till balance (its own single-series
// chart) uses violet.
export const useSeriesColors = () => {
  const { palette } = useTheme();
  const base =
    palette.mode === "dark"
      ? { revenue: "#3987e5", cost: "#d95926", profit: "#199e70", balance: "#9085e9" }
      : { revenue: "#2a78d6", cost: "#eb6834", profit: "#1baf7a", balance: "#4a3aa7" };
  return { ...base, inflow: base.revenue, outflow: base.cost };
};

// Shared look for x-charts: recessive grid and axis text in text tokens.
export const chartSx = (theme) => ({
  "& .MuiLineElement-root": { strokeWidth: 2 },
  "& .MuiChartsGrid-line": { stroke: theme.palette.divider, strokeDasharray: "3 3" },
  "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": { stroke: theme.palette.divider },
  "& .MuiChartsAxis-tickLabel": { fill: theme.palette.text.secondary },
});

export const tickLabelStyle = { fontSize: 11 };

// Demo data today; replace the body with a useGet on
// /total-calculations/get-office-analytics once the endpoint exists.
export const useOfficeAnalytics = (period) => {
  const data = useMemo(() => getOfficeAnalyticsMock(period), [period]);
  return { data, isLoading: false, isDemo: true };
};
