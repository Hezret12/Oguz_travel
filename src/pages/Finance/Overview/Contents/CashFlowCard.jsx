import { useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, LegendRow, ViewToggle } from "./SectionCard";
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
} from "../functions/analyticsFormat";

const numCell = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

// The main chart on the page, so its axis labels read a step larger.
const axisLabelStyle = { ...tickLabelStyle, fontSize: 12 };

// Money actually received and paid out, and the till balance it leaves.
const CashFlowCard = ({ cashFlow, currency, granularity }) => {
  const { t } = useLocale();
  const colors = useSeriesColors();
  const [view, setView] = useState("chart");

  const cur = cashFlow.current[currency];
  const series = cashFlow.series;
  const labels = series.map((p) => p.label);
  const hasData = cur.inflow > 0 || cur.outflow > 0;
  const label = (key) => t(`finance.analytics.cash.${key}`);
  const legendItems = [
    { label: label("inflow"), color: colors.inflow, shape: "bar" },
    { label: label("outflow"), color: colors.outflow, shape: "bar" },
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
            <BarChart
              height={380}
              hideLegend
              skipAnimation
              borderRadius={4}
              margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
              grid={{ horizontal: true }}
              xAxis={[{ ...xAxisBase, scaleType: "band", data: labels, tickLabelStyle: axisLabelStyle, categoryGapRatio: 0.4, barGapRatio: 0.12 }]}
              yAxis={[
                {
                  ...yAxisBase,
                  tickNumber: 6,
                  valueFormatter: (v) => formatCompactAmount(v, currency),
                  tickLabelStyle: axisLabelStyle,
                },
              ]}
              series={[
                {
                  id: "inflow",
                  label: label("inflow"),
                  data: series.map((p) => p[currency].inflow),
                  color: colors.inflow,
                  valueFormatter: (v) => formatAmount(v, currency),
                },
                {
                  id: "outflow",
                  label: label("outflow"),
                  data: series.map((p) => p[currency].outflow),
                  color: colors.outflow,
                  valueFormatter: (v) => formatAmount(v, currency),
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
                    <TableCell sx={numCell}>{formatAmount(row.inflow, currency)}</TableCell>
                    <TableCell sx={numCell}>{formatAmount(row.outflow, currency)}</TableCell>
                    <TableCell sx={{ ...numCell, fontWeight: 700, color: row.net < 0 ? "error.main" : "text.primary" }}>
                      {formatAmount(row.net, currency)}
                    </TableCell>
                    <TableCell sx={numCell}>{formatAmount(row.balance, currency)}</TableCell>
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
