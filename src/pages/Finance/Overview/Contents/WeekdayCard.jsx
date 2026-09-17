import { useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, ViewToggle } from "./SectionCard";
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

// Sales by weekday — helps plan who is at the desk when.
const WeekdayCard = ({ weekdays, currency }) => {
  const { t } = useLocale();
  const colors = useSeriesColors();
  const [view, setView] = useState("chart");

  const dayName = (day) => t(`finance.analytics.weekdays.${day}`);
  const hasData = weekdays.some((d) => d[currency] > 0);
  const busiest = [...weekdays].sort((a, b) => b[currency] - a[currency])[0];
  const quietest = [...weekdays].sort((a, b) => a[currency] - b[currency])[0];

  return (
    <SectionCard
      title={t("finance.analytics.weekday.title")}
      subtitle={t("finance.analytics.weekday.subtitle")}
      action={
        <ViewToggle
          value={view}
          onChange={setView}
          chartLabel={t("finance.analytics.trend.chart")}
          tableLabel={t("finance.analytics.trend.table")}
        />
      }
    >
      {!hasData ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
              {t("finance.analytics.weekday.busiest")}:{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                {dayName(busiest.day)} · {formatAmount(busiest[currency], currency)}
              </Box>
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
              {t("finance.analytics.weekday.quietest")}:{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                {dayName(quietest.day)}
              </Box>
            </Typography>
          </Box>

          {view === "chart" ? (
            <Box sx={{ mx: -1 }}>
              <BarChart
                height={340}
                hideLegend
                skipAnimation
                borderRadius={2}
                grid={{ horizontal: true }}
                xAxis={[
                  {
                    ...xAxisBase,
                    scaleType: "band",
                    data: weekdays.map((d) => dayName(d.day)),
                    categoryGapRatio: 0.5,
                    // Grey bars; only the busiest day carries the accent.
                    colorMap: {
                      type: "ordinal",
                      values: weekdays.map((d) => dayName(d.day)),
                      colors: weekdays.map((d) => (d.day === busiest.day ? colors.highlight : colors.cost)),
                    },
                    tickLabelStyle,
                  },
                ]}
                yAxis={[{ ...yAxisBase, valueFormatter: (v) => formatCompactAmount(v, currency), tickLabelStyle }]}
                series={[
                  {
                    id: "revenue",
                    label: t("finance.analytics.kpi.revenue"),
                    data: weekdays.map((d) => d[currency]),
                    color: colors.revenue,
                    valueFormatter: (v, { dataIndex }) =>
                      `${formatAmount(v, currency)} · ${t("finance.analytics.salesCount", { count: weekdays[dataIndex]?.count ?? 0 })}`,
                  },
                ]}
                sx={chartSx()}
            slotProps={tooltipSlotProps}
              />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small" sx={tableSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("finance.analytics.weekday.day")}</TableCell>
                    <TableCell sx={numCell}>{t("finance.analytics.categories.count")}</TableCell>
                    <TableCell sx={numCell}>{t("finance.analytics.kpi.revenue")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weekdays.map((d) => (
                    <TableRow key={d.day} hover>
                      <TableCell>{dayName(d.day)}</TableCell>
                      <TableCell sx={numCell}>{d.count}</TableCell>
                      <TableCell sx={{ ...numCell, fontWeight: 600 }}>{formatAmount(d[currency], currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </SectionCard>
  );
};

export default WeekdayCard;
