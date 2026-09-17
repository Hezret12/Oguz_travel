import { useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, LegendRow, ShareBar, ViewToggle } from "./SectionCard";
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

// Sales, cost, profit and margin per ledger category, in one currency.
const CategoryCard = ({ categories, currency }) => {
  const { t, selectedLang } = useLocale();
  const colors = useSeriesColors();
  const [view, setView] = useState("table");

  const rows = categories
    .filter((c) => c[currency].revenue > 0)
    .sort((a, b) => b[currency].revenue - a[currency].revenue);

  const total = rows.reduce(
    (acc, c) => ({
      count: acc.count + c.count,
      revenue: acc.revenue + c[currency].revenue,
      cost: acc.cost + c[currency].cost,
      profit: acc.profit + c[currency].profit,
    }),
    { count: 0, revenue: 0, cost: 0, profit: 0 },
  );

  return (
    <SectionCard
      title={t("finance.analytics.categories.title")}
      subtitle={t("finance.analytics.categories.subtitle")}
      action={
        <ViewToggle
          value={view}
          onChange={setView}
          chartLabel={t("finance.analytics.trend.chart")}
          tableLabel={t("finance.analytics.trend.table")}
        />
      }
    >
      {rows.length === 0 ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : view === "chart" ? (
        <>
          <LegendRow
            items={[
              { label: t("finance.analytics.kpi.revenue"), color: colors.revenue, shape: "bar" },
              { label: t("finance.analytics.categories.profit"), color: colors.profit, shape: "bar" },
            ]}
          />
          <Box sx={{ mx: -1 }}>
            <BarChart
              layout="horizontal"
              height={rows.length * 46 + 50}
              hideLegend
              skipAnimation
              borderRadius={2}
              grid={{ vertical: true }}
              yAxis={[
                {
                  ...yAxisBase,
                  scaleType: "band",
                  data: rows.map((c) => selectedLang(c.name)),
                  width: 130,
                  categoryGapRatio: 0.3,
                  barGapRatio: 0.15,
                  tickLabelStyle: { ...tickLabelStyle, fontSize: 12 },
                },
              ]}
              xAxis={[{ ...xAxisBase, valueFormatter: (v) => formatCompactAmount(v, currency), tickLabelStyle }]}
              series={[
                {
                  id: "revenue",
                  label: t("finance.analytics.kpi.revenue"),
                  data: rows.map((c) => c[currency].revenue),
                  color: colors.revenue,
                  valueFormatter: (v) => formatAmount(v, currency),
                },
                {
                  id: "profit",
                  label: t("finance.analytics.categories.profit"),
                  data: rows.map((c) => c[currency].profit),
                  color: colors.profit,
                  valueFormatter: (v, { dataIndex }) =>
                    `${formatAmount(v, currency)} · ${t("finance.analytics.categories.margin")} ${formatPercent(
                      percentOf(v, rows[dataIndex]?.[currency].revenue),
                    )}`,
                },
              ]}
              sx={chartSx()}
            slotProps={tooltipSlotProps}
            />
          </Box>
        </>
      ) : (
        <TableContainer>
          <Table size="small" sx={tableSx}>
            <TableHead>
              <TableRow>
                <TableCell>{t("finance.analytics.categories.service")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.categories.count")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.kpi.revenue")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.kpi.cost")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.categories.profit")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.categories.margin")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((c) => {
                const m = c[currency];
                const share = percentOf(m.revenue, total.revenue);
                return (
                  <TableRow key={c.key} hover>
                    <TableCell sx={{ minWidth: 150 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }} noWrap>
                          {selectedLang(c.name)}
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                          {formatPercent(share, 0)}
                        </Typography>
                      </Box>
                      <ShareBar value={share} color={colors.revenue} />
                    </TableCell>
                    <TableCell sx={num}>{c.count}</TableCell>
                    <TableCell sx={{ ...num, fontWeight: 600 }}>{formatAmount(m.revenue, currency)}</TableCell>
                    <TableCell sx={{ ...num, color: "text.secondary" }}>{formatAmount(m.cost, currency)}</TableCell>
                    <TableCell sx={{ ...num, fontWeight: 700 }}>{formatAmount(m.profit, currency)}</TableCell>
                    <TableCell sx={num}>{formatPercent(percentOf(m.profit, m.revenue))}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow sx={{ "& td": { fontWeight: 800, color: "text.primary", fontSize: "0.85rem", borderBottom: 0 } }}>
                <TableCell>{t("finance.analytics.total")}</TableCell>
                <TableCell sx={num}>{total.count}</TableCell>
                <TableCell sx={num}>{formatAmount(total.revenue, currency)}</TableCell>
                <TableCell sx={num}>{formatAmount(total.cost, currency)}</TableCell>
                <TableCell sx={num}>{formatAmount(total.profit, currency)}</TableCell>
                <TableCell sx={num}>{formatPercent(percentOf(total.profit, total.revenue))}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
};

export default CategoryCard;
