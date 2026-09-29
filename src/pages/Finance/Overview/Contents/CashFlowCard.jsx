import { useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
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
const GRADIENTS = { inflow: "cashflow-in-gradient", outflow: "cashflow-out-gradient" };

// Sales and their cost over the period: two soft lines, one axis, one
// currency. The table adds profit and the running profit (`balance`).
const CashFlowCard = ({ buckets, currency, granularity }) => {
  const { t } = useLocale();
  const colors = useFlowColors();
  const [view, setView] = useState("chart");

  const hasData = buckets.some((b) => b.revenue > 0 || b.cost > 0);
  const label = (key) => t(`finance.analytics.cash.${key}`);
  const money = (v) => formatAmount(v, currency);

  const legendItems = [
    { label: label("inflow"), color: colors.inflow, shape: "line" },
    { label: label("outflow"), color: colors.outflow, shape: "line" },
  ];

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
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <LegendRow items={legendItems} />
          </Box>
          <Box sx={{ mx: -1 }}>
            <ChartGradients
              gradients={[
                { id: GRADIENTS.inflow, color: colors.inflow, opacity: 0.2 },
                { id: GRADIENTS.outflow, color: colors.outflow, opacity: 0.12 },
              ]}
            />
            <LineChart
              height={340}
              hideLegend
              skipAnimation
              margin={{ top: 12, right: 24, bottom: 4, left: 0 }}
              grid={{ horizontal: true }}
              xAxis={[{ ...xAxisBase, scaleType: "point", data: buckets.map((b) => b.label), tickLabelStyle: axisLabelStyle }]}
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
                  id: "inflow",
                  label: label("inflow"),
                  data: buckets.map((b) => b.revenue),
                  color: colors.inflow,
                  area: true,
                  curve: "monotoneX",
                  showMark: false,
                  valueFormatter: money,
                },
                {
                  id: "outflow",
                  label: label("outflow"),
                  data: buckets.map((b) => b.cost),
                  color: colors.outflow,
                  area: true,
                  curve: "monotoneX",
                  showMark: false,
                  valueFormatter: money,
                },
              ]}
              sx={chartSx(GRADIENTS)}
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
              {buckets.map((b) => (
                <TableRow key={b.key} hover>
                  <TableCell>{b.label}</TableCell>
                  <TableCell sx={numCell}>{money(b.revenue)}</TableCell>
                  <TableCell sx={numCell}>{money(b.cost)}</TableCell>
                  <TableCell sx={{ ...numCell, fontWeight: 700, color: b.profit < 0 ? "error.main" : "text.primary" }}>
                    {money(b.profit)}
                  </TableCell>
                  <TableCell sx={numCell}>{money(b.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
};

export default CashFlowCard;
