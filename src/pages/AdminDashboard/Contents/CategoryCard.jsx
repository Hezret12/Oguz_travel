import { memo, useState } from "react";
import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography } from "@mui/material";
import { useLocale } from "../../../hooks/useLocale";
import BaseFareLabel from "../../../components/BaseFareLabel";
import SectionCard, { EmptyState, LegendRow, ShareBar, ViewToggle } from "../../Finance/Overview/Contents/SectionCard";
import {
  formatAmount,
  formatPercent,
  percentOf,
  scrollTableSx,
  stickyFooterSx,
  tableSx,
  useDashboardColors,
} from "../../Finance/Overview/functions/analyticsFormat";
import { BOTH_CURRENCIES, currenciesWith } from "../../Finance/Overview/functions/dashboardData";
import { AmountLines, CurrencyPanels } from "./ChartParts";
import ColumnBreakdown from "./ColumnBreakdown";

const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const ZERO = { revenue: 0, cost: 0, profit: 0 };

// The currencies a row has anything booked in: a service sold only in TMT
// gets no empty USD lines.
const rowCurrencies = (figures) =>
  BOTH_CURRENCIES.filter((c) => figures[c].revenue || figures[c].cost || figures[c].profit);

// Margin per currency, one per line.
const MarginLines = ({ figures, currencies = BOTH_CURRENCIES }) => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.25 }}>
    {currencies.map((c) => (
      <Typography key={c} component="span" sx={{ fontSize: "inherit", fontWeight: "inherit", color: figures[c].revenue ? "inherit" : "text.disabled" }}>
        {figures[c].revenue ? formatPercent(percentOf(figures[c].profit, figures[c].revenue)) : "—"}
      </Typography>
    ))}
  </Box>
);

// Sales count, sales, base fare, profit and margin per service. Opens on the
// chart: per currency, a sales and a profit column for each of the biggest services. In the table
// the count is currency-free and orders the rows; amounts are per currency.
// With `onSelect`, a table row picks that service (click again to clear).
const CategoryCard = ({ categories, selectedKey, onSelect }) => {
  const { t, selectedLang } = useLocale();
  const colors = useDashboardColors();
  const [view, setView] = useState("chart");

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
  const currencies = currenciesWith(rows, "revenue");
  const chartLabels = {
    revenue: t("finance.analytics.kpi.revenue"),
    profit: t("finance.analytics.categories.profit"),
    margin: t("finance.analytics.categories.margin"),
    noData: t("finance.analytics.noData"),
    topShown: (count) => t("dashboard.topShown", { count }),
    shareOfTotal: (value) => t("dashboard.shareOfSales", { value }),
    showAll: (count) => t("dashboard.showAll", { count }),
  };
  const chartSeries = [
    { id: "revenue", label: chartLabels.revenue, color: colors.sale, value: (row, currency) => row[currency].revenue },
    {
      id: "profit",
      label: chartLabels.profit,
      color: colors.profit,
      value: (row, currency) => row[currency].profit,
      tooltip: (value, row, currency) =>
        `${formatAmount(value, currency)} · ${chartLabels.margin} ${formatPercent(percentOf(value, row?.[currency].revenue))}`,
    },
  ];
  const showTable = () => setView("table");
  const selected = selectedKey ? rows.find((c) => c.key === selectedKey) : null;
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
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap", minHeight: 24 }}>
            <LegendRow
              items={[
                { label: chartLabels.revenue, color: colors.sale, shape: "bar" },
                { label: chartLabels.profit, color: colors.profit, shape: "bar" },
              ]}
            />
            {/* The picked service, named: it is what the trend and the operators are narrowed to */}
            {selected && onSelect && (
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={selectedLang(selected.name)}
                onDelete={() => onSelect("")}
                sx={{ fontWeight: 600, borderRadius: "8px" }}
              />
            )}
          </Box>
          <CurrencyPanels currencies={currencies}>
            {(currency) => (
              <ColumnBreakdown
                rows={rows.map((c) => ({ ...c, label: selectedLang(c.name) }))}
                currency={currency}
                series={chartSeries}
                labels={chartLabels}
                selectedKey={selectedKey}
                onSelect={onSelect}
                onShowAll={showTable}
              />
            )}
          </CurrencyPanels>
        </>
      ) : (
        <TableContainer sx={scrollTableSx}>
          <Table size="small" stickyHeader sx={[tableSx, stickyFooterSx]}>
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
                const own = rowCurrencies(c);
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
                      <AmountLines values={pick(c, "revenue")} currencies={own} />
                    </TableCell>
                    <TableCell sx={{ ...num, color: "text.secondary" }}>
                      <AmountLines values={pick(c, "cost")} weight={400} currencies={own} />
                    </TableCell>
                    <TableCell sx={num}>
                      <AmountLines values={pick(c, "profit")} weight={700} currencies={own} />
                    </TableCell>
                    <TableCell sx={num}>
                      <MarginLines figures={c} currencies={own} />
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
                  <AmountLines values={pick(total, "revenue")} weight={800} currencies={currencies} />
                </TableCell>
                <TableCell sx={num}>
                  <AmountLines values={pick(total, "cost")} weight={800} currencies={currencies} />
                </TableCell>
                <TableCell sx={num}>
                  <AmountLines values={pick(total, "profit")} weight={800} currencies={currencies} />
                </TableCell>
                <TableCell sx={num}>
                  <MarginLines figures={total} currencies={currencies} />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
};

export default memo(CategoryCard);
