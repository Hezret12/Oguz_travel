import { useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useLocale } from "../../../hooks/useLocale";
import BaseFareLabel from "../../../components/BaseFareLabel";
import SectionCard, { EmptyState, LegendRow, ShareBar, ViewToggle } from "../../Finance/Overview/Contents/SectionCard";
import {
  chartSx,
  formatAmount,
  formatCompactAmount,
  formatPercent,
  percentOf,
  tableSx,
  tickLabelStyle,
  tooltipSlotProps,
  useDashboardColors,
  xAxisBase,
  yAxisBase,
} from "../../Finance/Overview/functions/analyticsFormat";
import { BOTH_CURRENCIES } from "../../Finance/Overview/functions/dashboardData";
import { AmountLines, CurrencyPanels } from "./ChartParts";

const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const ZERO = { revenue: 0, cost: 0, profit: 0 };

// One currency's sales and profit per service, as horizontal bars.
const CategoryChart = ({ rows, currency }) => {
  const { t, selectedLang } = useLocale();
  const colors = useDashboardColors();
  const bars = rows.filter((c) => c[currency].revenue > 0).sort((a, b) => b[currency].revenue - a[currency].revenue);

  if (bars.length === 0) return <EmptyState>{t("finance.analytics.noData")}</EmptyState>;

  return (
    <Box sx={{ mx: -1 }}>
      <BarChart
        layout="horizontal"
        height={bars.length * 46 + 50}
        hideLegend
        skipAnimation
        borderRadius={4}
        grid={{ vertical: true }}
        yAxis={[
          {
            ...yAxisBase,
            scaleType: "band",
            data: bars.map((c) => selectedLang(c.name)),
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
            data: bars.map((c) => c[currency].revenue),
            color: colors.sale,
            valueFormatter: (v) => formatAmount(v, currency),
          },
          {
            id: "profit",
            label: t("finance.analytics.categories.profit"),
            data: bars.map((c) => c[currency].profit),
            color: colors.profit,
            valueFormatter: (v, { dataIndex }) =>
              `${formatAmount(v, currency)} · ${t("finance.analytics.categories.margin")} ${formatPercent(
                percentOf(v, bars[dataIndex]?.[currency].revenue),
              )}`,
          },
        ]}
        sx={chartSx()}
        slotProps={tooltipSlotProps}
      />
    </Box>
  );
};

// Margin per currency, one per line.
const MarginLines = ({ figures }) => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.25 }}>
    {BOTH_CURRENCIES.map((c) => (
      <Typography key={c} component="span" sx={{ fontSize: "inherit", fontWeight: "inherit", color: figures[c].revenue ? "inherit" : "text.disabled" }}>
        {figures[c].revenue ? formatPercent(percentOf(figures[c].profit, figures[c].revenue)) : "—"}
      </Typography>
    ))}
  </Box>
);

// Sales count, sales, base fare, profit and margin per service. The count is
// currency-free and orders the rows; every amount is listed per currency.
// With `onSelect`, a table row picks that service (click again to clear).
const CategoryCard = ({ categories, selectedKey, onSelect }) => {
  const { t, selectedLang } = useLocale();
  const colors = useDashboardColors();
  const [view, setView] = useState("table");

  const rows = categories
    .filter((c) => BOTH_CURRENCIES.some((cur) => c[cur].revenue > 0))
    .sort((a, b) => b.count - a.count);
  const totalCount = rows.reduce((sum, c) => sum + c.count, 0);
  const total = Object.fromEntries(
    BOTH_CURRENCIES.map((cur) => [
      cur,
      rows.reduce(
        (acc, c) => ({
          revenue: acc.revenue + c[cur].revenue,
          cost: acc.cost + c[cur].cost,
          profit: acc.profit + c[cur].profit,
        }),
        ZERO,
      ),
    ]),
  );
  const pick = (figures, field) => Object.fromEntries(BOTH_CURRENCIES.map((cur) => [cur, figures[cur][field]]));

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
              { label: t("finance.analytics.kpi.revenue"), color: colors.sale, shape: "bar" },
              { label: t("finance.analytics.categories.profit"), color: colors.profit, shape: "bar" },
            ]}
          />
          <CurrencyPanels stacked>{(currency) => <CategoryChart rows={rows} currency={currency} />}</CurrencyPanels>
        </>
      ) : (
        <TableContainer>
          <Table size="small" sx={tableSx}>
            <TableHead>
              <TableRow>
                <TableCell>{t("finance.analytics.categories.service")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.categories.count")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.kpi.revenue")}</TableCell>
                <TableCell sx={num}><BaseFareLabel /></TableCell>
                <TableCell sx={num}>{t("finance.analytics.categories.profit")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.categories.margin")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((c) => {
                const share = percentOf(c.count, totalCount);
                return (
                  <TableRow
                    key={c.key}
                    hover
                    selected={Boolean(onSelect) && c.key === selectedKey}
                    onClick={onSelect ? () => onSelect(c.key === selectedKey ? "" : c.key) : undefined}
                    sx={onSelect ? { cursor: "pointer" } : undefined}
                  >
                    <TableCell sx={{ minWidth: 150 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }} noWrap>
                          {selectedLang(c.name)}
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                          {formatPercent(share, 0)}
                        </Typography>
                      </Box>
                      <ShareBar value={share} color={colors.sale} />
                    </TableCell>
                    <TableCell sx={num}>{c.count}</TableCell>
                    <TableCell sx={num}>
                      <AmountLines values={pick(c, "revenue")} />
                    </TableCell>
                    <TableCell sx={{ ...num, color: "text.secondary" }}>
                      <AmountLines values={pick(c, "cost")} weight={400} />
                    </TableCell>
                    <TableCell sx={num}>
                      <AmountLines values={pick(c, "profit")} weight={700} />
                    </TableCell>
                    <TableCell sx={num}>
                      <MarginLines figures={c} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow sx={{ "& td": { fontWeight: 800, color: "text.primary", fontSize: "0.85rem", borderBottom: 0 } }}>
                <TableCell>{t("finance.analytics.total")}</TableCell>
                <TableCell sx={num}>{totalCount}</TableCell>
                <TableCell sx={num}>
                  <AmountLines values={pick(total, "revenue")} weight={800} />
                </TableCell>
                <TableCell sx={num}>
                  <AmountLines values={pick(total, "cost")} weight={800} />
                </TableCell>
                <TableCell sx={num}>
                  <AmountLines values={pick(total, "profit")} weight={800} />
                </TableCell>
                <TableCell sx={num}>
                  <MarginLines figures={total} />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
};

export default CategoryCard;
