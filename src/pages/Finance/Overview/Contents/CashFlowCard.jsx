import { useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { ChartGradients, EmptyState, LegendRow, ViewToggle } from "./SectionCard";
import {
  chartSx,
  formatAmount,
  formatCompactAmount,
  tableSx,
  tickLabelStyle,
  tooltipSlotProps,
  useFlowColors,
  xAxisBase,
  yAxisBase,
} from "../functions/analyticsFormat";

const numCell = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const axisLabelStyle = { ...tickLabelStyle, fontSize: 12 };
const GRADIENT_ID = "cashflow-balance-gradient";

// Both charts share the band axis, y-axis width and side margins, so each
// period's balance point sits exactly above its in/out bars. Two charts, two
// y-scales — never one plot with a second axis.
const MARGIN = { top: 8, right: 12, bottom: 4, left: 0 };
const Y_WIDTH = 60;

const Headline = ({ label, value, delta, deltaLabel }) => {
  const up = delta >= 0;
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2.5, flexWrap: "wrap" }}>
      <Box>
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: { xs: "1.75rem", md: "2.1rem" }, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.5px" }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pb: 0.6 }}>
        <Box
          sx={{
            display: "flex",
            color: up ? "success.main" : "error.main",
          }}
        >
          <Arrow size={16} strokeWidth={2.4} />
        </Box>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: up ? "success.main" : "error.main" }}>
          {delta >= 0 ? "+" : ""}
          {deltaLabel}
        </Typography>
      </Box>
    </Box>
  );
};

// Money actually received and paid out, and the till balance it leaves.
const CashFlowCard = ({ cashFlow, currency, granularity }) => {
  const { t } = useLocale();
  const colors = useFlowColors();
  const [view, setView] = useState("chart");

  const cur = cashFlow.current[currency];
  const series = cashFlow.series;
  const labels = series.map((p) => p.label);
  const hasData = cur.inflow > 0 || cur.outflow > 0;
  const label = (key) => t(`finance.analytics.cash.${key}`);
  const money = (v) => formatAmount(v, currency);

  const legendItems = [
    { label: label("inflow"), color: colors.inflow, shape: "bar" },
    { label: label("outflow"), color: colors.outflow, shape: "bar" },
    { label: label("closing"), color: colors.neutral, shape: "line" },
  ];
  const xAxis = { ...xAxisBase, scaleType: "band", data: labels, categoryGapRatio: 0.35, barGapRatio: 0 };

  return (
    <SectionCard
      title={label("title")}
      subtitle={`${label("subtitle")} · ${t(`finance.analytics.trend.by.${granularity}`)}`}
      action={
        <>
          {view === "chart" && hasData && (
            <Box sx={{ display: { xs: "none", sm: "block" }, mr: 1.5 }}>
              <LegendRow items={legendItems} />
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
      {!hasData ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : view === "chart" ? (
        <>
          <Headline
            label={label("closing")}
            value={money(cur.closing)}
            delta={cur.net}
            deltaLabel={`${money(cur.net)} · ${label("net").toLowerCase()}`}
          />
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <LegendRow items={legendItems} />
          </Box>

          <Box sx={{ mx: -1 }}>
            <ChartGradients gradients={[{ id: GRADIENT_ID, color: colors.neutral, opacity: 0.18 }]} />
            {/* Till balance over the period */}
            <LineChart
              height={150}
              hideLegend
              skipAnimation
              margin={MARGIN}
              grid={{ horizontal: true }}
              xAxis={[{ ...xAxis, position: "none" }]}
              yAxis={[
                {
                  ...yAxisBase,
                  width: Y_WIDTH,
                  tickNumber: 3,
                  valueFormatter: (v) => formatCompactAmount(v, currency),
                },
              ]}
              series={[
                {
                  id: "balance",
                  label: label("closing"),
                  data: series.map((p) => p[currency].balance),
                  color: colors.neutral,
                  area: true,
                  curve: "monotoneX",
                  showMark: false,
                  valueFormatter: money,
                },
              ]}
              sx={chartSx({ balance: GRADIENT_ID })}
              slotProps={tooltipSlotProps}
            />

            {/* Money in above the zero line, money out mirrored below it */}
            <BarChart
              height={230}
              hideLegend
              skipAnimation
              borderRadius={4}
              margin={MARGIN}
              grid={{ horizontal: true }}
              xAxis={[{ ...xAxis, tickLabelStyle: axisLabelStyle }]}
              yAxis={[
                {
                  ...yAxisBase,
                  width: Y_WIDTH,
                  tickNumber: 5,
                  valueFormatter: (v) => formatCompactAmount(Math.abs(v), currency),
                  tickLabelStyle: axisLabelStyle,
                },
              ]}
              series={[
                {
                  id: "inflow",
                  label: label("inflow"),
                  data: series.map((p) => p[currency].inflow),
                  color: colors.inflow,
                  stack: "flow",
                  stackOffset: "diverging",
                  valueFormatter: (v) => money(Math.abs(v ?? 0)),
                },
                {
                  id: "outflow",
                  label: label("outflow"),
                  data: series.map((p) => -p[currency].outflow),
                  color: colors.outflow,
                  stack: "flow",
                  stackOffset: "diverging",
                  valueFormatter: (v) => money(Math.abs(v ?? 0)),
                },
              ]}
              sx={chartSx()}
              slotProps={tooltipSlotProps}
            />
          </Box>
        </>
      ) : (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table size="small" sx={tableSx} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t("finance.analytics.trend.date")}</TableCell>
                <TableCell sx={numCell}>{label("inflow")}</TableCell>
                <TableCell sx={numCell}>{label("outflow")}</TableCell>
                <TableCell sx={numCell}>{label("net")}</TableCell>
                <TableCell sx={numCell}>{label("closing")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {series.map((p) => {
                const row = p[currency];
                return (
                  <TableRow key={p.date} hover>
                    <TableCell>{p.label}</TableCell>
                    <TableCell sx={numCell}>{money(row.inflow)}</TableCell>
                    <TableCell sx={numCell}>{money(row.outflow)}</TableCell>
                    <TableCell sx={{ ...numCell, fontWeight: 700, color: row.net < 0 ? "error.main" : "text.primary" }}>
                      {money(row.net)}
                    </TableCell>
                    <TableCell sx={numCell}>{money(row.balance)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
};

export default CashFlowCard;
