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

// Money actually received and paid out over the period: two soft lines,
// one axis, one currency.
const CashFlowCard = ({ cashFlow, currency, granularity }) => {
  const { t } = useLocale();
  const colors = useFlowColors();
  const [view, setView] = useState("chart");

  const cur = cashFlow.current[currency];
  const series = cashFlow.series;
  const hasData = cur.inflow > 0 || cur.outflow > 0;
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
              margin={{ top: 12, right: 12, bottom: 4, left: 0 }}
              grid={{ horizontal: true }}
              xAxis={[{ ...xAxisBase, scaleType: "point", data: series.map((p) => p.label), tickLabelStyle: axisLabelStyle }]}
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
                  data: series.map((p) => p[currency].inflow),
                  color: colors.inflow,
                  area: true,
                  curve: "monotoneX",
                  showMark: false,
                  valueFormatter: money,
                },
                {
                  id: "outflow",
                  label: label("outflow"),
                  data: series.map((p) => p[currency].outflow),
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
