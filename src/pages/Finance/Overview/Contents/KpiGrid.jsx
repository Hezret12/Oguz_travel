import { Box, Tooltip, Typography } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { useLocale } from "../../../../hooks/useLocale";
import {
  changePercent,
  chartSx,
  formatAmount,
  formatPercent,
  percentOf,
  tooltipSlotProps,
  useSeriesColors,
} from "../functions/analyticsFormat";

// `upIsGood: false` for costs, where growth is bad news.
const KPI_DEFS = [
  { key: "revenue", upIsGood: true },
  { key: "cost", upIsGood: false },
  { key: "grossProfit", upIsGood: true },
  { key: "expenses", upIsGood: false },
  { key: "netProfit", upIsGood: true },
  { key: "receivable", upIsGood: false },
];

// Change vs the previous period as plain text: arrow + number (never colour alone).
export const DeltaBadge = ({ change, upIsGood }) => {
  const { t } = useLocale();
  if (change === null || !Number.isFinite(change)) return null;

  const flat = Math.abs(change) < 0.05;
  const up = change > 0;
  const color = flat ? "text.secondary" : up === upIsGood ? "success.main" : "error.main";
  const arrow = flat ? "→" : up ? "↑" : "↓";

  return (
    <Tooltip title={t("finance.analytics.vsPrevious")} arrow placement="top">
      <Typography
        component="span"
        sx={{
          color,
          fontSize: "0.75rem",
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
          cursor: "default",
        }}
      >
        {arrow} {formatPercent(Math.abs(change))}
      </Typography>
    </Tooltip>
  );
};

const KpiCell = ({ label, value, currency, hint, change, upIsGood, negative, points, labels, color }) => (
  <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: "flex", flexDirection: "column", minWidth: 0, backgroundColor: "background.paper" }}>
    <Typography noWrap sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
      {label}
    </Typography>
    <Typography
      noWrap
      sx={{
        mt: 0.75,
        fontSize: "1.45rem",
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        fontVariantNumeric: "tabular-nums",
        color: negative ? "error.main" : "text.primary",
      }}
    >
      {formatAmount(value, currency)}
    </Typography>
    <Box sx={{ mt: 0.5, display: "flex", alignItems: "baseline", gap: 0.75, minWidth: 0, minHeight: 18 }}>
      <DeltaBadge change={change} upIsGood={upIsGood} />
      <Typography noWrap sx={{ fontSize: "0.72rem", color: "text.secondary", minWidth: 0 }}>
        {hint}
      </Typography>
    </Box>
    <Box sx={{ mt: 1.25, mx: -0.25 }}>
      <SparkLineChart
        data={points}
        height={28}
        curve="linear"
        color={color}
        showTooltip
        showHighlight
        margin={{ top: 3, bottom: 3, left: 2, right: 2 }}
        xAxis={{ scaleType: "point", data: labels }}
        valueFormatter={(v) => formatAmount(v, currency)}
        slotProps={tooltipSlotProps}
        sx={chartSx()}
      />
    </Box>
  </Box>
);

// Headline figures for the period, each with its in-period trend.
const KpiGrid = ({ totals, trend, currency }) => {
  const { t } = useLocale();
  const colors = useSeriesColors();
  const current = totals.current[currency];
  const previous = totals.previous[currency];
  const labels = trend.map((p) => p.label);

  const hints = {
    revenue: t("finance.analytics.salesCount", { count: current.salesCount }),
    cost: t("finance.analytics.costHint"),
    grossProfit: t("finance.analytics.margin", {
      value: formatPercent(percentOf(current.grossProfit, current.revenue)),
    }),
    expenses: t("finance.analytics.salariesIncluded"),
    netProfit: t("finance.analytics.afterExpenses"),
    receivable: t("finance.analytics.collectionRate", {
      value: formatPercent(percentOf(current.collected, current.revenue), 0),
    }),
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
          lg: "repeat(6, minmax(0, 1fr))",
        },
        // 1px gaps over a divider-coloured background draw the hairlines.
        gap: "1px",
        backgroundColor: "divider",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {KPI_DEFS.map(({ key, upIsGood }) => (
        <KpiCell
          key={key}
          label={t(`finance.analytics.kpi.${key}`)}
          value={current[key]}
          currency={currency}
          hint={hints[key]}
          change={changePercent(current[key], previous[key])}
          upIsGood={upIsGood}
          negative={key === "netProfit" && current[key] < 0}
          points={trend.map((p) => p[currency][key] ?? 0)}
          labels={labels}
          color={colors.spark}
        />
      ))}
    </Box>
  );
};

export default KpiGrid;
