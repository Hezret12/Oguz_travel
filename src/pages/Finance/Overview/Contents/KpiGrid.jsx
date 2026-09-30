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
  KPI_TONES,
  tooltipSlotProps,
} from "../functions/analyticsFormat";
import { ChartGradients } from "./SectionCard";

// `key` names both the card figure and the chart bucket field (see dashboardData).
// `upIsGood: false` where growth is bad news (cost, unpaid credit).
const KPI_DEFS = [
  { key: "cost", upIsGood: false, icon: BanknoteArrowUp, tone: "outflow" },
  { key: "revenue", upIsGood: true, icon: BanknoteArrowDown, tone: "inflow" },
  { key: "receivable", upIsGood: false, icon: HandCoins, tone: "credit" },
  { key: "profit", upIsGood: true, icon: PiggyBank, tone: "profit" },
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

// Stat tile: value, change vs the previous period and an in-period sparkline.
// `format` renders the value (money by default); the other currency is optional.
export const KpiCard = ({
  id,
  label,
  icon: Icon,
  color,
  value,
  previous,
  points,
  labels,
  upIsGood,
  currency,
  otherValue,
  otherCurrency,
  compareLabel,
  format,
}) => {
  const { t } = useLocale();
  const fmt = format || ((v) => formatAmount(v, currency));
  const change = changePercent(value, previous);
  const diff = value - previous;
  const gradientId = `kpi-spark-${id}`;
  const hasSeries = Array.isArray(points) && points.some((p) => p != null);

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

      {/* The other currency sits beside the main figure; the two are never added. */}
      <Box sx={{ mt: 1.75, display: "flex", alignItems: "baseline", columnGap: 1.25, flexWrap: "wrap", minWidth: 0 }}>
        <Typography
          noWrap
          sx={{
            fontSize: "1.75rem",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
            color: value < 0 ? "error.main" : "text.primary",
          }}
        >
          {fmt(value)}
        </Typography>
        {otherCurrency && otherValue != null && (
          <Typography
            noWrap
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: otherValue < 0 ? "error.main" : "text.secondary",
            }}
          >
            {formatAmount(otherValue, otherCurrency)}
          </Typography>
        )}
      </Box>

      <Tooltip
        title={`${t("finance.analytics.vsPrevious")}: ${fmt(previous)}`}
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
              {fmt(diff)}
            </Typography>
          )}
          <Typography noWrap sx={{ fontSize: "0.75rem", color: "text.secondary", minWidth: 0 }}>
            {compareLabel}
          </Typography>
        </Box>
      </Tooltip>

      {/* Figures the API has no series for keep the space, so the cards line up. */}
      <Box sx={{ mt: 1.5, mx: -0.5, height: 56 }}>
        {hasSeries && (
          <>
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
              valueFormatter={(v) => fmt(v)}
              slotProps={tooltipSlotProps}
              sx={chartSx({ "*": gradientId })}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

// Headline figures for the period, each compared with the previous period and
// drawn as its in-period trend. `cards` holds both currencies; `buckets` (the
// chart series) only the selected one.
const KpiGrid = ({ cards, buckets, currency, period }) => {
  const { t } = useLocale();
  const mode = useTheme().palette.mode === "dark" ? "dark" : "light";
  const compareLabel = t(`finance.analytics.vsPeriod.${period}`);
  const otherCurrency = currency === "USD" ? "TMT" : "USD";
  const labels = buckets.map((b) => b.label);

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
          otherCurrency={otherCurrency}
          otherValue={cards[key][otherCurrency].value}
          value={cards[key][currency].value}
          previous={cards[key][currency].previous}
          points={buckets.map((b) => b[key])}
          labels={labels}
        />
      ))}
    </Box>
  );
};

export default KpiGrid;
