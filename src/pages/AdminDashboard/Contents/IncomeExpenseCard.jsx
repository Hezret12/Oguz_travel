import { useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useLocale } from "../../../hooks/useLocale";
import SectionCard, { EmptyState, ViewToggle } from "../../Finance/Overview/Contents/SectionCard";
import {
  chartSx,
  changePercent,
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
import { LegendStat, StatRow } from "./ChartParts";

const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const axisLabelStyle = { ...tickLabelStyle, fontSize: 11.5 };
const OUT_GROUPS = ["cost", "salary", "expense"];
const NO_OUT = { cost: 0, salary: 0, expense: 0 };

// Money in vs money out per day / month. Money in is the period's sales; money
// out stacks the cost of those sales, salaries and kassa expenses, so the
// reader sees both how much went out and where it went. Net result on top.
const IncomeExpenseCard = ({ buckets, moneyOut, currency, granularity }) => {
  const { t } = useLocale();
  const colors = useDashboardColors();
  const [view, setView] = useState("chart");
  const money = (v) => formatAmount(v, currency);

  const groupLabel = {
    cost: t("finance.analytics.kpi.cost"),
    salary: t("finance.analytics.flow.groups.salary"),
    expense: t("finance.analytics.flow.groups.expense"),
  };
  const rows = buckets.map((b) => {
    const out = moneyOut.byPeriod.get(String(b.key)) ?? NO_OUT;
    const outTotal = out.cost + out.salary + out.expense;
    return { key: b.key, label: b.label, revenue: b.revenue, ...out, outTotal, net: b.revenue - outTotal };
  });

  const revenue = rows.reduce((sum, r) => sum + r.revenue, 0);
  const { totals, previous } = moneyOut;
  const outTotal = totals.cost + totals.salary + totals.expense;
  const outPrevious = previous.cost + previous.salary + previous.expense;
  const net = revenue - outTotal;
  const hasData = revenue > 0 || outTotal > 0;

  const outSeries = OUT_GROUPS.map((g) => ({
    id: g,
    label: groupLabel[g],
    data: rows.map((r) => r[g]),
    color: colors[g],
    stack: "out",
    valueFormatter: money,
  }));

  return (
    <SectionCard
      title={t("dashboard.moneyTitle")}
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
      <StatRow>
        <LegendStat color={colors.sale} shape="bar" label={t("finance.income")} value={money(revenue)} />
        <LegendStat
          label={t("dashboard.outTotal")}
          value={money(outTotal)}
          change={changePercent(outTotal, outPrevious)}
          upIsGood={false}
        />
        <LegendStat
          label={t("dashboard.netResult")}
          value={money(net)}
          hint={revenue ? t("finance.analytics.margin", { value: formatPercent(percentOf(net, revenue)) }) : null}
        />
      </StatRow>

      {/* Where the money went: one entry per stacked group, with its share */}
      <StatRow>
        {OUT_GROUPS.map((g) => (
          <LegendStat
            key={g}
            color={colors[g]}
            shape="bar"
            label={groupLabel[g]}
            value={money(totals[g])}
            hint={outTotal ? formatPercent(percentOf(totals[g], outTotal), 0) : null}
          />
        ))}
      </StatRow>

      {!hasData ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : view === "chart" ? (
        <Box sx={{ mx: -1 }}>
          <BarChart
            height={300}
            hideLegend
            skipAnimation
            borderRadius={4}
            margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
            grid={{ horizontal: true }}
            xAxis={[
              {
                ...xAxisBase,
                scaleType: "band",
                data: rows.map((r) => r.label),
                // Wide bands for a year of months, tight ones for a month of days.
                categoryGapRatio: rows.length > 16 ? 0.3 : 0.42,
                barGapRatio: 0.14,
                tickLabelStyle: axisLabelStyle,
              },
            ]}
            yAxis={[
              {
                ...yAxisBase,
                width: 56,
                tickNumber: 4,
                valueFormatter: (v) => formatCompactAmount(v, currency),
                tickLabelStyle: axisLabelStyle,
              },
            ]}
            series={[
              {
                id: "revenue",
                label: t("finance.income"),
                data: rows.map((r) => r.revenue),
                color: colors.sale,
                stack: "in",
                valueFormatter: money,
              },
              ...outSeries,
            ]}
            sx={[
              chartSx(),
              // A 2px surface gap between stacked segments keeps them apart.
              (theme) => ({ "& .MuiBarElement-root": { stroke: theme.palette.background.paper, strokeWidth: 1.5 } }),
            ]}
            slotProps={tooltipSlotProps}
          />
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 340 }}>
          <Table size="small" stickyHeader sx={tableSx}>
            <TableHead>
              <TableRow>
                <TableCell>{t("finance.analytics.trend.date")}</TableCell>
                <TableCell sx={num}>{t("finance.income")}</TableCell>
                {OUT_GROUPS.map((g) => (
                  <TableCell key={g} sx={num}>
                    {groupLabel[g]}
                  </TableCell>
                ))}
                <TableCell sx={num}>{t("dashboard.netResult")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.key} hover>
                  <TableCell>{r.label}</TableCell>
                  <TableCell sx={{ ...num, fontWeight: 600 }}>{money(r.revenue)}</TableCell>
                  {OUT_GROUPS.map((g) => (
                    <TableCell key={g} sx={{ ...num, color: "text.secondary" }}>
                      {money(r[g])}
                    </TableCell>
                  ))}
                  <TableCell sx={{ ...num, fontWeight: 600, color: r.net < 0 ? "error.main" : "text.primary" }}>
                    {money(r.net)}
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

export default IncomeExpenseCard;
