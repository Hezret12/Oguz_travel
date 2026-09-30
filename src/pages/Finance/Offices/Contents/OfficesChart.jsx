import { useLayoutEffect, useState } from "react";
import { Box, Tooltip, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { BarChart } from "@mui/x-charts/BarChart";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, LegendRow, ViewToggle } from "../../Overview/Contents/SectionCard";
import {
  chartSx,
  formatAmount,
  formatCompactAmount,
  formatPercent,
  percentOf,
  tickLabelStyle,
  tooltipSlotProps,
  useFlowColors,
  xAxisBase,
  yAxisBase,
} from "../../Overview/functions/analyticsFormat";

const Y_WIDTH = 64;
const BAR_W = 26; // target thickness of each of the three columns

// Three columns per office — money in, money out, profit — each with its
// value written on top. A loss drops below the zero line with a ▼ label.
const OfficesColumns = ({ offices, currency, colors }) => {
  const { t } = useLocale();
  const names = {
    inflow: t("finance.analytics.cash.inflow"),
    outflow: t("finance.analytics.cash.outflow"),
    profit: t("finance.analytics.kpi.profit"),
  };
  const theme = useTheme();
  const [el, setEl] = useState(null);
  const [width, setWidth] = useState(900);

  useLayoutEffect(() => {
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width) || 900));
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);

  // Slim columns: the band's leftover is air, not fatter bars.
  const band = Math.max(1, (width - Y_WIDTH - 24) / offices.length);
  const categoryGapRatio = Math.min(0.8, Math.max(0.25, 1 - (BAR_W * 3 + 8) / band));
  // Too many offices for readable labels → values move to the tooltip only.
  const showLabels = band >= 120;
  const money = (v) => formatAmount(v, currency);
  const compact = (v) => formatCompactAmount(v, currency);

  const inflow = offices.map((o) => o.inflow[currency]);
  const outflow = offices.map((o) => o.outflow[currency]);
  const profit = offices.map((o) => o.profit[currency]);
  const max = Math.max(...inflow, ...outflow, 1);
  const min = Math.min(0, ...profit);

  const label = (fmt) => (showLabels ? (item) => (item.value == null ? null : fmt(item.value)) : undefined);

  return (
    <Box ref={setEl} sx={{ mx: -1 }}>
      <BarChart
        height={380}
        hideLegend
        skipAnimation
        borderRadius={4}
        margin={{ top: 24, right: 12, bottom: 8, left: 0 }}
        grid={{ horizontal: true }}
        xAxis={[
          {
            ...xAxisBase,
            scaleType: "band",
            data: offices.map((o) => o.name),
            categoryGapRatio,
            barGapRatio: 0.1,
            tickLabelStyle: { ...tickLabelStyle, fontSize: 12.5, fontWeight: 600 },
          },
        ]}
        yAxis={[
          {
            ...yAxisBase,
            width: Y_WIDTH,
            tickNumber: 6,
            // Headroom above the tallest column (and below a loss) for labels
            max: max * 1.12,
            min: min < 0 ? min - max * 0.08 : 0,
            valueFormatter: compact,
            tickLabelStyle: { ...tickLabelStyle, fontSize: 12 },
          },
        ]}
        series={[
          {
            id: "inflow",
            label: names.inflow,
            data: inflow,
            color: colors.inflow,
            valueFormatter: money,
            barLabel: label(compact),
            barLabelPlacement: "outside",
          },
          {
            id: "outflow",
            label: names.outflow,
            data: outflow,
            color: colors.outflow,
            valueFormatter: money,
            barLabel: label(compact),
            barLabelPlacement: "outside",
          },
          {
            id: "profit",
            label: names.profit,
            data: profit,
            color: colors.neutral,
            valueFormatter: money,
            barLabel: label((v) => `${v >= 0 ? "▲" : "▼"} ${compact(v)}`),
            barLabelPlacement: "outside",
          },
        ]}
        sx={[
          chartSx(),
          { "& .MuiBarLabel-root": { fill: theme.palette.text.secondary, fontSize: 11.5, fontWeight: 600 } },
          // The profit value is the headline: darker and bolder
          { '& [data-series="profit"] .MuiBarLabel-root': { fill: theme.palette.text.primary, fontWeight: 700 } },
        ]}
        slotProps={tooltipSlotProps}
      />
    </Box>
  );
};

// One card per office — works for any number of offices. The bar splits the
// office's money in into what went out (orange) and what stayed as profit
// (teal); a loss-making office gets a full orange bar plus a red "loss" note.
const OfficeCard = ({ office, currency, rank, total, colors }) => {
  const { t } = useLocale();
  const inflow = office.inflow[currency];
  const outflow = office.outflow[currency];
  const profit = office.profit[currency];
  const change = office.profitChange?.[currency] ?? 0;
  const up = profit >= 0;
  const grew = change >= 0;
  const margin = percentOf(profit, inflow);
  const costShare = inflow > 0 ? Math.min(100, (outflow / inflow) * 100) : 100;
  const money = (v) => formatAmount(v, currency);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        minWidth: 0,
        transition: "border-color .15s ease",
        "&:hover": { borderColor: alpha(up ? colors.inflow : colors.outflow, 0.5) },
      }}
    >
      {/* Name + rank + share of all money in */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: "6px",
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "text.secondary",
            backgroundColor: "action.hover",
          }}
        >
          {rank}
        </Box>
        <Typography noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: "0.95rem" }}>
          {office.name}
        </Typography>
        <Tooltip title={t("finance.offices.shareOfIncome")} arrow>
          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", whiteSpace: "nowrap" }}>
            {formatPercent(percentOf(inflow, total), 0)}
          </Typography>
        </Tooltip>
      </Box>

      {/* Profit headline */}
      <Box>
        <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mb: 0.25 }}>
          {t("finance.analytics.kpi.profit")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: "1.35rem", fontWeight: 700, lineHeight: 1.2, color: up ? "text.primary" : "error.main" }}>
            {money(profit)}
          </Typography>
          {/* Profit change vs the previous period (from the API) */}
          <Tooltip title={t("finance.analytics.vsPrevious")} arrow>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.25,
                px: 0.75,
                py: 0.2,
                borderRadius: "6px",
                fontSize: "0.72rem",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                color: grew ? "success.main" : "error.main",
                backgroundColor: (theme) => alpha(grew ? theme.palette.success.main : theme.palette.error.main, 0.12),
              }}
            >
              {grew ? <ArrowUpRight size={12} strokeWidth={2.6} /> : <ArrowDownRight size={12} strokeWidth={2.6} />}
              {formatPercent(Math.abs(change), 1)}
            </Box>
          </Tooltip>
        </Box>
        <Typography sx={{ mt: 0.5, fontSize: "0.72rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
          {t("finance.analytics.margin", { value: formatPercent(margin, 1) })}
        </Typography>
      </Box>

      {/* Where the office's money in went: out vs. kept */}
      <Box>
        <Box sx={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: "2px", backgroundColor: "action.hover" }}>
          <Box sx={{ width: `${costShare}%`, backgroundColor: colors.outflow, transition: "width .4s ease" }} />
          {up && <Box sx={{ flex: 1, backgroundColor: colors.inflow }} />}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mt: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{t("finance.analytics.cash.inflow")}</Typography>
            <Typography noWrap sx={{ fontSize: "0.82rem", fontWeight: 600 }}>{money(inflow)}</Typography>
          </Box>
          <Box sx={{ minWidth: 0, textAlign: "right" }}>
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{t("finance.analytics.cash.outflow")}</Typography>
            <Typography noWrap sx={{ fontSize: "0.82rem", fontWeight: 600 }}>{money(outflow)}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Chart view (default) or one card per office.
const OfficesChart = ({ rows, currency }) => {
  const { t } = useLocale();
  const colors = useFlowColors();
  const [view, setView] = useState("chart");

  const offices = rows
    .filter((r) => r.inflow[currency] || r.outflow[currency])
    .sort((a, b) => b.profit[currency] - a.profit[currency]);
  const total = offices.reduce((s, r) => s + r.inflow[currency], 0);

  return (
    <SectionCard
      title={t("finance.offices.cardsTitle")}
      subtitle={t("finance.offices.cardsSubtitle")}
      action={
        <>
          <Box sx={{ display: { xs: "none", sm: "block" }, mr: 1.5 }}>
            <LegendRow
              items={
                view === "chart"
                  ? [
                      { label: t("finance.analytics.cash.inflow"), color: colors.inflow, shape: "bar" },
                      { label: t("finance.analytics.cash.outflow"), color: colors.outflow, shape: "bar" },
                      { label: t("finance.analytics.kpi.profit"), color: colors.neutral, shape: "bar" },
                    ]
                  : [
                      { label: t("finance.analytics.cash.outflow"), color: colors.outflow, shape: "bar" },
                      { label: t("finance.analytics.kpi.profit"), color: colors.inflow, shape: "bar" },
                    ]
              }
            />
          </Box>
          <ViewToggle
            value={view === "chart" ? "chart" : "table"}
            onChange={(v) => setView(v === "chart" ? "chart" : "cards")}
            chartLabel={t("finance.analytics.trend.chart")}
            tableLabel={t("finance.offices.cardsView")}
          />
        </>
      }
    >
      {offices.length === 0 ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : view === "chart" ? (
        <OfficesColumns offices={offices} currency={currency} colors={colors} />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 2 }}>
          {offices.map((office, i) => (
            <OfficeCard key={office.guid} office={office} currency={currency} rank={i + 1} total={total} colors={colors} />
          ))}
        </Box>
      )}
    </SectionCard>
  );
};

export default OfficesChart;
