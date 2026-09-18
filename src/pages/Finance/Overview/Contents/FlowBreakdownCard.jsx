import { useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, ShareBar, ViewToggle } from "./SectionCard";
import {
  chartSx,
  formatAmount,
  formatCompactAmount,
  formatPercent,
  percentOf,
  tableSx,
  tickLabelStyle,
  tooltipSlotProps,
  useSeriesColors,
  xAxisBase,
  yAxisBase,
} from "../functions/analyticsFormat";

const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

// Where money came from (`direction="in"`) or went to (`"out"`), per category.
// `items`: [{ key, name, group, USD, TMT }].
//
// USD and TMT are never added or converted: ranking, bars and % use the
// selected currency. The table also lists the other currency, so items that
// only moved the other currency are not hidden.
const FlowBreakdownCard = ({ direction, items, currency }) => {
  const { t, selectedLang } = useLocale();
  const colors = useSeriesColors();
  const [view, setView] = useState("chart");
  const other = currency === "USD" ? "TMT" : "USD";
  const color = direction === "in" ? colors.inflow : colors.outflow;

  const rows = items
    .filter((i) => i[currency] > 0 || i[other] > 0)
    .sort((a, b) => b[currency] - a[currency] || b[other] - a[other]);
  const chartRows = rows.filter((i) => i[currency] > 0);
  const total = rows.reduce((sum, i) => sum + (i[currency] || 0), 0);
  const otherTotal = rows.reduce((sum, i) => sum + (i[other] || 0), 0);

  // The exchange row is its own group; do not repeat its name.
  const groupLabel = (group) => (group === "exchange" ? "—" : t(`finance.analytics.flow.groups.${group}`));

  return (
    <SectionCard
      title={t(`finance.analytics.flow.${direction}Title`)}
      subtitle={t(`finance.analytics.flow.${direction}Subtitle`)}
      action={
        <>
          <Box sx={{ textAlign: "right", mr: 1 }}>
            <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", lineHeight: 1.3 }}>
              {t("finance.analytics.total")}
            </Typography>
            <Typography sx={{ ...num, fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3 }}>
              {formatAmount(total, currency)}
            </Typography>
          </Box>
          <ViewToggle
            value={view}
            onChange={setView}
            chartLabel={t("finance.analytics.trend.chart")}
            tableLabel={t("finance.analytics.trend.table")}
          />
        </>
      }
    >
      {rows.length === 0 ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : view === "chart" ? (
        chartRows.length === 0 ? (
          <EmptyState>{t("finance.analytics.noData")}</EmptyState>
        ) : (
          <Box sx={{ mx: -1 }}>
            <BarChart
              layout="horizontal"
              height={chartRows.length * 40 + 40}
              hideLegend
              skipAnimation
              borderRadius={4}
              margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
              grid={{ vertical: true }}
              yAxis={[
                {
                  ...yAxisBase,
                  scaleType: "band",
                  data: chartRows.map((i) => selectedLang(i.name)),
                  width: 150,
                  categoryGapRatio: 0.35,
                  tickLabelStyle: { ...tickLabelStyle, fontSize: 12 },
                },
              ]}
              xAxis={[{ ...xAxisBase, valueFormatter: (v) => formatCompactAmount(v, currency), tickLabelStyle }]}
              series={[
                {
                  id: direction,
                  label: t("finance.analytics.flow.amount"),
                  data: chartRows.map((i) => i[currency]),
                  color,
                  valueFormatter: (v) => `${formatAmount(v, currency)} · ${formatPercent(percentOf(v, total), 0)}`,
                },
              ]}
              sx={chartSx()}
              slotProps={tooltipSlotProps}
            />
          </Box>
        )
      ) : (
        <TableContainer>
          <Table size="small" sx={tableSx}>
            <TableHead>
              <TableRow>
                <TableCell>{t("finance.analytics.flow.item")}</TableCell>
                <TableCell>{t("finance.analytics.flow.group")}</TableCell>
                <TableCell sx={num}>{currency}</TableCell>
                <TableCell sx={num}>{other}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((i) => {
                const share = percentOf(i[currency], total);
                return (
                  <TableRow key={i.key} hover>
                    <TableCell sx={{ minWidth: 160 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                        <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          {selectedLang(i.name)}
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                          {i[currency] > 0 ? formatPercent(share, 0) : "—"}
                        </Typography>
                      </Box>
                      <ShareBar value={share} color={color} />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>{groupLabel(i.group)}</TableCell>
                    <TableCell sx={{ ...num, fontWeight: 600, color: i[currency] > 0 ? "text.primary" : "text.disabled" }}>
                      {i[currency] > 0 ? formatAmount(i[currency], currency) : "—"}
                    </TableCell>
                    <TableCell sx={{ ...num, color: i[other] > 0 ? "text.secondary" : "text.disabled" }}>
                      {i[other] > 0 ? formatAmount(i[other], other) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>{t("finance.analytics.total")}</TableCell>
                <TableCell sx={num}>{formatAmount(total, currency)}</TableCell>
                <TableCell sx={num}>{formatAmount(otherTotal, other)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
};

export default FlowBreakdownCard;
