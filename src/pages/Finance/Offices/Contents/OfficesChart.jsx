import { useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, LegendRow } from "../../Overview/Contents/SectionCard";
import {
  CURRENCIES,
  chartSx,
  formatAmount,
  formatCompactAmount,
  segmentedSx,
  tickLabelStyle,
  tooltipSlotProps,
  useSeriesColors,
  xAxisBase,
  yAxisBase,
} from "../../Overview/functions/analyticsFormat";

const compactSegmentedSx = {
  ...segmentedSx,
  "& .MuiToggleButton-root": { ...segmentedSx["& .MuiToggleButton-root"], height: 28, px: 1.25 },
};

// Money in, money out and profit side by side for every office. One axis
// can only hold one currency, so the card has its own USD / TMT switch.
const OfficesChart = ({ rows }) => {
  const { t } = useLocale();
  const colors = useSeriesColors();
  const [currency, setCurrency] = useState("USD");

  const sorted = [...rows].sort((a, b) => b.inflow[currency] - a.inflow[currency]);
  const hasData = sorted.some((r) => r.inflow[currency] || r.outflow[currency]);
  const legend = [
    { label: t("finance.analytics.cash.inflow"), color: colors.inflow, shape: "bar" },
    { label: t("finance.analytics.cash.outflow"), color: colors.outflow, shape: "bar" },
    { label: t("finance.analytics.kpi.profit"), color: colors.profit, shape: "bar" },
  ];
  const money = (v) => formatAmount(v, currency);

  return (
    <SectionCard
      title={t("finance.offices.chartTitle")}
      subtitle={t("finance.offices.chartSubtitle")}
      action={
        <>
          <Box sx={{ display: { xs: "none", md: "block" }, mr: 1.5 }}>
            <LegendRow items={legend} />
          </Box>
          <ToggleButtonGroup
            exclusive
            value={currency}
            onChange={(_e, next) => next && setCurrency(next)}
            sx={compactSegmentedSx}
          >
            {CURRENCIES.map((c) => (
              <ToggleButton key={c} value={c}>
                {c}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </>
      }
    >
      {!hasData ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : (
        <>
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <LegendRow items={legend} />
          </Box>
          <Box sx={{ mx: -1 }}>
            <BarChart
              layout="horizontal"
              height={Math.max(260, sorted.length * 64 + 40)}
              hideLegend
              skipAnimation
              borderRadius={4}
              margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
              grid={{ vertical: true }}
              yAxis={[
                {
                  ...yAxisBase,
                  scaleType: "band",
                  data: sorted.map((r) => r.name),
                  width: 120,
                  categoryGapRatio: 0.3,
                  barGapRatio: 0.12,
                  tickLabelStyle: { ...tickLabelStyle, fontSize: 12, fontWeight: 600 },
                },
              ]}
              xAxis={[{ ...xAxisBase, valueFormatter: (v) => formatCompactAmount(v, currency), tickLabelStyle }]}
              series={[
                {
                  id: "inflow",
                  label: t("finance.analytics.cash.inflow"),
                  data: sorted.map((r) => r.inflow[currency]),
                  color: colors.inflow,
                  valueFormatter: money,
                },
                {
                  id: "outflow",
                  label: t("finance.analytics.cash.outflow"),
                  data: sorted.map((r) => r.outflow[currency]),
                  color: colors.outflow,
                  valueFormatter: money,
                },
                {
                  id: "profit",
                  label: t("finance.analytics.kpi.profit"),
                  data: sorted.map((r) => r.profit[currency]),
                  color: colors.profit,
                  valueFormatter: money,
                },
              ]}
              sx={chartSx()}
              slotProps={tooltipSlotProps}
            />
          </Box>
        </>
      )}
    </SectionCard>
  );
};

export default OfficesChart;
