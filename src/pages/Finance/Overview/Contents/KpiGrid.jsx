import { Box, Tooltip, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BanknoteArrowDown,
  BanknoteArrowUp,
  HandCoins,
  PiggyBank,
} from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";
import {
  changePercent,
  chartSx,
  formatAmount,
  formatPercent,
  tooltipSlotProps,
} from "../functions/analyticsFormat";
import { ChartGradients } from "./SectionCard";

// One hue per card (each card is a single series, named by its label, so hue
// is never the only cue). Green/red stay reserved for the good/bad change
// pill. Validated in card order with the dataviz palette checker on the
// theme's paper surfaces #ffffff / #12131A: adjacent CVD, normal-vision and
// 3:1 contrast all pass; the light teal is the brand accent, kept as is.
const KPI_TONES = {
  outflow: { light: "#EB6834", dark: "#D95926" }, // orange
  inflow: { light: "#0E8584", dark: "#13A89A" }, // brand teal
  credit: { light: "#B7791F", dark: "#C98500" }, // amber — money still owed
  profit: { light: "#2A78D6", dark: "#3987E5" }, // blue
};

// `upIsGood: false` where growth is bad news (spending, unpaid credit).
const KPI_DEFS = [
  { key: "moneyOut", upIsGood: false, icon: BanknoteArrowUp, tone: "outflow" },
  { key: "moneyIn", upIsGood: true, icon: BanknoteArrowDown, tone: "inflow" },
  { key: "credit", upIsGood: false, icon: HandCoins, tone: "credit" },
  { key: "profit", upIsGood: true, icon: PiggyBank, tone: "profit" },
];

// Current value, previous-period value and in-period series for each card.
const getKpiData = (key, { totals, trend, cashFlow }, currency) => {
  const series = cashFlow.series;
  switch (key) {
    case "moneyOut":
      return {
        value: cashFlow.current[currency].outflow,
        previous: cashFlow.previous[currency].outflow,
        points: series.map((p) => p[currency].outflow),
        labels: series.map((p) => p.label),
      };
    case "moneyIn":
      return {
        value: cashFlow.current[currency].inflow,
        previous: cashFlow.previous[currency].inflow,
        points: series.map((p) => p[currency].inflow),
        labels: series.map((p) => p.label),
      };
    case "credit":
      return {
        value: totals.current[currency].receivable,
        previous: totals.previous[currency].receivable,
        points: trend.map((p) => p[currency].receivable ?? 0),
        labels: trend.map((p) => p.label),
      };
    default:
      return {
        value: totals.current[currency].netProfit,
        previous: totals.previous[currency].netProfit,
        points: trend.map((p) => p[currency].netProfit ?? 0),
        labels: trend.map((p) => p.label),
      };
  }
};

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

// Tinted pill: arrow icon + percentage, green when the move is good for the
// business and red when it isn't (so "money out ↑" reads red).
const ChangePill = ({ change, upIsGood }) => {
  if (change === null || !Number.isFinite(change)) return null;

  const flat = Math.abs(change) < 0.05;
  const up = change > 0;
  const tone = flat ? null : up === upIsGood ? "success" : "error";
  const Arrow = flat ? ArrowRight : up ? ArrowUpRight : ArrowDownRight;

  return (
    <Box
      component="span"
      sx={(theme) => ({
        display: "inline-flex",
        alignItems: "center",
        gap: 0.25,
        flexShrink: 0,
        height: 22,
        pl: 0.5,
        pr: 0.75,
        borderRadius: "6px",
        fontSize: "0.75rem",
        fontWeight: 600,
        fontVariantNumeric: "tabular-nums",
        color: tone ? theme.palette[tone].main : theme.palette.text.secondary,
        backgroundColor: tone
          ? alpha(theme.palette[tone].main, theme.palette.mode === "dark" ? 0.16 : 0.1)
          : theme.palette.action.hover,
      })}
    >
      <Arrow size={14} strokeWidth={2.25} />
      {formatPercent(Math.abs(change))}
    </Box>
  );
};

const KpiCard = ({ id, label, icon: Icon, color, value, previous, points, labels, upIsGood, currency, compareLabel }) => {
  const { t } = useLocale();
  const change = changePercent(value, previous);
  const diff = value - previous;
  const gradientId = `kpi-spark-${id}`;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        p: 2.25,
        pb: 1.25,
        borderRadius: "14px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        transition: "border-color 150ms ease",
        "&:hover": { borderColor: alpha(color, 0.45) },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
        <Box
          aria-hidden
          sx={(theme) => ({
            flexShrink: 0,
            width: 34,
            height: 34,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            backgroundColor: alpha(color, theme.palette.mode === "dark" ? 0.16 : 0.1),
          })}
        >
          <Icon size={18} strokeWidth={2} />
        </Box>
        <Typography noWrap sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.secondary", minWidth: 0 }}>
          {label}
        </Typography>
      </Box>

      <Typography
        noWrap
        sx={{
          mt: 1.75,
          fontSize: "1.75rem",
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          color: value < 0 ? "error.main" : "text.primary",
        }}
      >
        {formatAmount(value, currency)}
      </Typography>

      <Tooltip
        title={`${t("finance.analytics.vsPrevious")}: ${formatAmount(previous, currency)}`}
        arrow
        placement="top-start"
      >
        <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 0.75, minWidth: 0, minHeight: 22, cursor: "default" }}>
          <ChangePill change={change} upIsGood={upIsGood} />
          {Number.isFinite(diff) && diff !== 0 && (
            <Typography
              noWrap
              sx={{ flexShrink: 0, fontSize: "0.75rem", fontWeight: 600, color: "text.primary", fontVariantNumeric: "tabular-nums" }}
            >
              {diff > 0 ? "+" : ""}
              {formatAmount(diff, currency)}
            </Typography>
          )}
          <Typography noWrap sx={{ fontSize: "0.75rem", color: "text.secondary", minWidth: 0 }}>
            {compareLabel}
          </Typography>
        </Box>
      </Tooltip>

      <Box sx={{ mt: 1.5, mx: -0.5 }}>
        <ChartGradients gradients={[{ id: gradientId, color, opacity: 0.2 }]} />
        <SparkLineChart
          data={points}
          height={56}
          area
          curve="linear"
          color={color}
          showTooltip
          showHighlight
          margin={{ top: 4, bottom: 2, left: 4, right: 4 }}
          xAxis={{ scaleType: "point", data: labels }}
          valueFormatter={(v) => formatAmount(v, currency)}
          slotProps={tooltipSlotProps}
          sx={chartSx({ "*": gradientId })}
        />
      </Box>
    </Box>
  );
};

// Headline cash figures for the period, each compared with the previous
// period and drawn as its in-period trend.
const KpiGrid = ({ totals, trend, cashFlow, currency, period }) => {
  const { t } = useLocale();
  const mode = useTheme().palette.mode === "dark" ? "dark" : "light";
  const compareLabel = t(`finance.analytics.vsPeriod.${period}`);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))",
        },
        gap: 2,
      }}
    >
      {KPI_DEFS.map(({ key, upIsGood, icon, tone }) => (
        <KpiCard
          key={key}
          id={key}
          label={t(`finance.analytics.kpi.${key}`)}
          icon={icon}
          color={KPI_TONES[tone][mode]}
          upIsGood={upIsGood}
          currency={currency}
          compareLabel={compareLabel}
          {...getKpiData(key, { totals, trend, cashFlow }, currency)}
        />
      ))}
    </Box>
  );
};

export default KpiGrid;
