import { useState } from "react";
import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useLocale } from "../../../hooks/useLocale";
import SectionCard, { ChartGradients, EmptyState, LegendRow, ViewToggle } from "../../Finance/Overview/Contents/SectionCard";
import { DeltaBadge } from "../../Finance/Overview/Contents/KpiGrid";
import {
  chartSx,
  formatAmount,
  formatCompactAmount,
  tableSx,
  tickLabelStyle,
  tooltipSlotProps,
  useSeriesColors,
  xAxisBase,
  yAxisBase,
} from "../../Finance/Overview/functions/analyticsFormat";

const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const GRADIENT = "dashboard-service-gradient";
const axisLabelStyle = { ...tickLabelStyle, fontSize: 12 };
const countFormat = (v) => Math.round(Number(v) || 0).toLocaleString("en-US");

const Stat = ({ label, value, change, upIsGood, danger }) => (
  <Box sx={{ minWidth: 0, p: 1.5, borderRadius: "10px", border: "1px solid", borderColor: "divider" }}>
    <Typography noWrap sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
      {label}
    </Typography>
    <Box sx={{ mt: 0.5, display: "flex", alignItems: "baseline", columnGap: 1, flexWrap: "wrap", minWidth: 0 }}>
      <Typography
        noWrap
        sx={{
          fontSize: "1.15rem",
          fontWeight: 700,
          lineHeight: 1.3,
          fontVariantNumeric: "tabular-nums",
          color: danger ? "error.main" : "text.primary",
        }}
      >
        {value}
      </Typography>
      {change !== undefined && <DeltaBadge change={change} upIsGood={upIsGood} />}
    </Box>
  </Box>
);

// Pick a service (or all): its totals vs the previous period and a sale /
// previous-sale / profit chart, in one currency.
const ServiceAnalyticsCard = ({ services, selected, onSelect, analytics, currency, loading }) => {
  const { t } = useLocale();
  const colors = useSeriesColors();
  const [view, setView] = useState("chart");
  const money = (v) => formatAmount(v, currency);
  const { chart } = analytics;
  const hasData = chart.some((p) => p.sale || p.profit || p.prevSale);

  const legend = [
    { label: t("dashboard.sales"), color: colors.revenue, shape: "line" },
    { label: t("dashboard.previousPeriod"), color: colors.outflow, shape: "line", dashed: true },
    { label: t("dashboard.profit"), color: colors.profit, shape: "line" },
  ];

  const pickers = [{ value: "", label: t("dashboard.allServices") }, ...services];

  return (
    <SectionCard
      title={t("dashboard.modulesTitle")}
      subtitle={t("dashboard.modulesSubtitle")}
      action={
        <>
          {view === "chart" && hasData && (
            <Box sx={{ display: { xs: "none", md: "block" }, mr: 1.5 }}>
              <LegendRow items={legend} />
            </Box>
          )}
          <ViewToggle
            value={view}
            onChange={setView}
            chartLabel={t("finance.analytics.trend.chart")}
            tableLabel={t("finance.analytics.trend.table")}
          />
        </>
      }
    >
      {/* Service picker: one row, scrolls sideways when there are many */}
      <Box sx={{ display: "flex", gap: 0.75, overflowX: "auto", pb: 0.5, mt: -0.5 }}>
        {pickers.map((s) => {
          const active = s.value === selected;
          return (
            <Chip
              key={s.value || "all"}
              label={s.label}
              clickable
              onClick={() => onSelect(s.value)}
              color={active ? "primary" : "default"}
              variant={active ? "filled" : "outlined"}
              sx={{
                flexShrink: 0,
                height: 30,
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: 600,
                ...(active ? {} : { color: "text.secondary", borderColor: "divider" }),
              }}
            />
          );
        })}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          opacity: loading ? 0.6 : 1,
          transition: "opacity .2s ease",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(5, minmax(0,1fr))" },
            gap: 1.5,
          }}
        >
          <Stat label={t("dashboard.sales")} value={money(analytics.sale)} change={analytics.saleChange} upIsGood />
          <Stat
            label={t("dashboard.profit")}
            value={money(analytics.profit)}
            change={analytics.profitChange}
            upIsGood
            danger={analytics.profit < 0}
          />
          <Stat label={t("dashboard.receivable")} value={money(analytics.credit)} />
          <Stat label={t("dashboard.salesCount")} value={countFormat(analytics.count)} />
          <Stat label={t("dashboard.refunds")} value={countFormat(analytics.refunds)} />
        </Box>

        {!hasData ? (
          <EmptyState>{t("finance.analytics.noData")}</EmptyState>
        ) : view === "chart" ? (
          <>
            <Box sx={{ display: { xs: "block", md: "none" } }}>
              <LegendRow items={legend} />
            </Box>
            <Box sx={{ mx: -1 }}>
              <ChartGradients gradients={[{ id: GRADIENT, color: colors.revenue, opacity: 0.2 }]} />
              <LineChart
                height={300}
                hideLegend
                skipAnimation
                margin={{ top: 12, right: 24, bottom: 4, left: 0 }}
                grid={{ horizontal: true }}
                xAxis={[{ ...xAxisBase, scaleType: "point", data: chart.map((p) => p.label), tickLabelStyle: axisLabelStyle }]}
                yAxis={[
                  {
                    ...yAxisBase,
                    width: 60,
                    tickNumber: 5,
                    valueFormatter: (v) => formatCompactAmount(v, currency),
                    tickLabelStyle: axisLabelStyle,
                  },
                ]}
                series={[
                  {
                    id: "sale",
                    label: t("dashboard.sales"),
                    data: chart.map((p) => p.sale),
                    color: colors.revenue,
                    area: true,
                    curve: "monotoneX",
                    showMark: false,
                    valueFormatter: money,
                  },
                  {
                    id: "prevSale",
                    label: t("dashboard.previousPeriod"),
                    data: chart.map((p) => p.prevSale),
                    color: colors.outflow,
                    curve: "monotoneX",
                    showMark: false,
                    valueFormatter: money,
                  },
                  {
                    id: "profit",
                    label: t("dashboard.profit"),
                    data: chart.map((p) => p.profit),
                    color: colors.profit,
                    curve: "monotoneX",
                    showMark: false,
                    valueFormatter: money,
                  },
                ]}
                sx={chartSx({ sale: GRADIENT }, ["prevSale"])}
                slotProps={tooltipSlotProps}
              />
            </Box>
          </>
        ) : (
          <TableContainer sx={{ maxHeight: 360 }}>
            <Table size="small" stickyHeader sx={tableSx}>
              <TableHead>
                <TableRow>
                  <TableCell>{t("finance.analytics.trend.date")}</TableCell>
                  <TableCell sx={num}>{t("dashboard.sales")}</TableCell>
                  <TableCell sx={num}>{t("dashboard.previousPeriod")}</TableCell>
                  <TableCell sx={num}>{t("dashboard.profit")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chart.map((p) => (
                  <TableRow key={p.label} hover>
                    <TableCell>{p.label}</TableCell>
                    <TableCell sx={{ ...num, fontWeight: 600 }}>{money(p.sale)}</TableCell>
                    <TableCell sx={{ ...num, color: "text.secondary" }}>{money(p.prevSale)}</TableCell>
                    <TableCell sx={{ ...num, fontWeight: 600, color: p.profit < 0 ? "error.main" : "text.primary" }}>
                      {money(p.profit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </SectionCard>
  );
};

export default ServiceAnalyticsCard;
