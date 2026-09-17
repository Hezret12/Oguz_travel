import { useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, LegendRow, ViewToggle } from "./SectionCard";
import {
  chartSx,
  formatAmount,
  formatCompactAmount,
  tickLabelStyle,
  useSeriesColors,
} from "../functions/analyticsFormat";

const SERIES = ["revenue", "cost", "profit"];

const numCell = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

// Sales, cost and profit over time (sales ledger view).
const TrendCard = ({ trend, currency, granularity }) => {
  const { t } = useLocale();
  const colors = useSeriesColors();
  const [view, setView] = useState("chart");

  const hasData = trend.some((p) => p[currency].revenue || p[currency].cost);
  const seriesLabel = (key) => t(`finance.analytics.trend.${key}`);

  return (
    <SectionCard
      title={t("finance.analytics.trend.title")}
      subtitle={t(`finance.analytics.trend.by.${granularity}`)}
      action={
        <ViewToggle
          value={view}
          onChange={setView}
          chartLabel={t("finance.analytics.trend.chart")}
          tableLabel={t("finance.analytics.trend.table")}
        />
      }
    >
      <LegendRow items={SERIES.map((key) => ({ label: seriesLabel(key), color: colors[key] }))} />

      {!hasData ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : view === "chart" ? (
        <Box sx={{ mx: -1 }}>
          <LineChart
            height={300}
            hideLegend
            skipAnimation
            grid={{ horizontal: true }}
            xAxis={[{ scaleType: "point", data: trend.map((p) => p.label), tickLabelStyle }]}
            yAxis={[{ width: 60, valueFormatter: (v) => formatCompactAmount(v, currency), tickLabelStyle }]}
            series={SERIES.map((key) => ({
              id: key,
              label: seriesLabel(key),
              data: trend.map((p) => p[currency][key]),
              color: colors[key],
              curve: "monotoneX",
              showMark: trend.length <= 14,
              valueFormatter: (v) => formatAmount(v, currency),
            }))}
            sx={chartSx}
          />
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 316 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t("finance.analytics.trend.date")}</TableCell>
                {SERIES.map((key) => (
                  <TableCell key={key} sx={numCell}>{seriesLabel(key)}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {trend.map((p) => (
                <TableRow key={p.date} hover>
                  <TableCell>{p.label}</TableCell>
                  {SERIES.map((key) => (
                    <TableCell key={key} sx={numCell}>{formatAmount(p[currency][key], currency)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
};

export default TrendCard;
