import { memo, useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useLocale } from "../../../hooks/useLocale";
import SectionCard, { EmptyState, ShareBar, ViewToggle } from "../../Finance/Overview/Contents/SectionCard";
import {
  formatPercent,
  percentOf,
  scrollTableSx,
  tableSx,
  useDashboardColors,
  useSliceColors,
} from "../../Finance/Overview/functions/analyticsFormat";
import { BOTH_CURRENCIES, assignSliceSlots, currenciesWith } from "../../Finance/Overview/functions/dashboardData";
import { AmountLines, CurrencyPanels } from "./ChartParts";
import DonutBreakdown from "./DonutBreakdown";

const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

// The currencies an operator sold in: one who sold only in USD gets no empty TMT lines.
const rowCurrencies = (figures) => BOTH_CURRENCIES.filter((c) => figures[c].revenue || figures[c].profit);

// Operator ranking, as a donut per currency of each operator's share of sales
// or as a table ordered by sales count (currency-free) with sales and profit
// in each currency. It opens on whichever shows the whole list. Only the currencies with sales are shown,
// so a USD-only service has no empty TMT lines. `scope` (e.g. the selected
// service's name) is added to the subtitle when the list is narrowed.
const OperatorCard = ({ operators, scope }) => {
  const { t } = useLocale();
  const colors = useDashboardColors();
  const { slots } = useSliceColors();
  // null until the user picks a view; until then the card opens on the one that fits (below).
  const [pickedView, setView] = useState(null);
  const subtitle = t("finance.analytics.operators.subtitle");

  const rows = operators
    .filter((o) => BOTH_CURRENCIES.some((c) => o[c].revenue > 0))
    .sort((a, b) => b.count - a.count);
  const currencies = currenciesWith(rows, "revenue");
  const totalCount = rows.reduce((sum, o) => sum + o.count, 0);
  const pick = (o, field) => Object.fromEntries(BOTH_CURRENCIES.map((c) => [c, o[c][field]]));
  const slotOf = assignSliceSlots(rows, currencies, slots.length, (o) => o.guid);
  // A donut names as many operators as it has colours. While every operator
  // fits, it is the clearer picture; past that most of it would be one grey
  // "other" slice, so the card opens on the ranked table instead. The toggle
  // still switches, and the user's own choice then stays.
  const fitsDonut = currencies.every((c) => rows.filter((o) => o[c].revenue > 0).length <= slots.length);
  const view = pickedView ?? (fitsDonut ? "chart" : "table");
  const chartLabels = {
    profit: t("finance.analytics.categories.profit"),
    margin: t("finance.analytics.categories.margin"),
    other: t("finance.analytics.flow.other"),
    total: t("finance.analytics.total"),
    topShown: (count) => t("dashboard.topShown", { count }),
    showAll: (count) => t("dashboard.showAll", { count }),
  };
  const showTable = () => setView("table");

  return (
    <SectionCard
      title={t("finance.analytics.operators.title")}
      subtitle={scope ? `${scope} · ${subtitle}` : subtitle}
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
        <CurrencyPanels currencies={currencies}>
          {(currency) => (
            <DonutBreakdown
              rows={rows.map((o) => ({ ...o, key: o.guid, label: o.fullName }))}
              currency={currency}
              slotOf={slotOf}
              labels={chartLabels}
              meta={(o) => t("dashboard.salesN", { count: o.count })}
              onShowAll={showTable}
            />
          )}
        </CurrencyPanels>
      ) : (
        <TableContainer sx={scrollTableSx}>
          <Table size="small" stickyHeader sx={tableSx}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 32 }}>№</TableCell>
                <TableCell>{t("finance.analytics.operators.operator")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.categories.count")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.kpi.revenue")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.categories.profit")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((o, index) => {
                const share = percentOf(o.count, totalCount);
                const own = rowCurrencies(o);
                return (
                  <TableRow key={o.guid} hover>
                    <TableCell sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>{index + 1}</TableCell>
                    <TableCell sx={{ minWidth: 170 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                        <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                          {o.fullName}
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                          {formatPercent(share, 0)}
                        </Typography>
                      </Box>
                      <ShareBar value={share} color={colors.sale} />
                    </TableCell>
                    <TableCell sx={num}>{o.count}</TableCell>
                    <TableCell sx={num}>
                      <AmountLines values={pick(o, "revenue")} currencies={own} />
                    </TableCell>
                    <TableCell sx={num}>
                      <AmountLines values={pick(o, "profit")} weight={700} currencies={own} />
                    </TableCell>
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

export default memo(OperatorCard);
