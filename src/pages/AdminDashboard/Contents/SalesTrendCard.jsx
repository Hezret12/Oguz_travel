import { useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useLocale } from "../../../hooks/useLocale";
import SectionCard, { ChartGradients, EmptyState, LegendRow, ViewToggle } from "../../Finance/Overview/Contents/SectionCard";
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
} from "../../Finance/Overview/functions/analyticsFormat";

const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const GRADIENT = "dashboard-sales-gradient";
const axisLabelStyle = { ...tickLabelStyle, fontSize: 12 };

// Sales and profit per day / week / month: one currency, one axis.
const SalesTrendCard = ({ buckets, currency, granularity }) => {
  const { t } = useLocale();
  const colors = useFlowColors();
  const [view, setView] = useState("chart");
  const money = (v) => formatAmount(v, currency);
  const hasData = buckets.some((b) => b.revenue || b.profit);

  const legend = [
    { label: t("dashboard.sales"), color: colors.inflow, shape: "line" },
    { label: t("dashboard.profit"), color: colors.neutral, shape: "line" },
  ];

  return (
    <SectionCard
      title={t("dashboard.trendTitle")}
      subtitle={t(`finance.analytics.trend.by.${granularity}`)}
      action={
        <>
          {view === "chart" && hasData && (
            <Box sx={{ display: { xs: "none", sm: "block" }, mr: 1.5 }}>
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
      {!hasData ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : view === "chart" ? (
        <Box sx={{ mx: -1 }}>
          <ChartGradients gradients={[{ id: GRADIENT, color: colors.inflow, opacity: 0.22 }]} />
          <LineChart
            height={320}
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
                id: "revenue",
                label: t("dashboard.sales"),
                data: buckets.map((b) => b.revenue),
                color: colors.inflow,
                area: true,
                curve: "monotoneX",
                showMark: false,
                valueFormatter: money,
              },
              {
                id: "profit",
                label: t("dashboard.profit"),
                data: buckets.map((b) => b.profit),
                color: colors.neutral,
                curve: "monotoneX",
                showMark: false,
                valueFormatter: money,
              },
            ]}
            sx={chartSx({ revenue: GRADIENT })}
            slotProps={tooltipSlotProps}
          />
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 380 }}>
          <Table size="small" stickyHeader sx={tableSx}>
            <TableHead>
              <TableRow>
                <TableCell>{t("finance.analytics.trend.date")}</TableCell>
                <TableCell sx={num}>{t("dashboard.salesCount")}</TableCell>
                <TableCell sx={num}>{t("dashboard.sales")}</TableCell>
                <TableCell sx={num}>{t("dashboard.profit")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buckets.map((b) => (
                <TableRow key={b.key} hover>
                  <TableCell>{b.label}</TableCell>
                  <TableCell sx={num}>{b.count}</TableCell>
                  <TableCell sx={num}>{money(b.revenue)}</TableCell>
                  <TableCell sx={{ ...num, fontWeight: 600, color: b.profit < 0 ? "error.main" : "text.primary" }}>
                    {money(b.profit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
};

export default SalesTrendCard;
