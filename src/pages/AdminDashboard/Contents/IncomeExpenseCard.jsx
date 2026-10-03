import { useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useLocale } from "../../../hooks/useLocale";
import BaseFareLabel from "../../../components/BaseFareLabel";
import { BASE_FARE_TEXT } from "../../../functions/baseFare";
import SectionCard, { EmptyState, ViewToggle } from "../../Finance/Overview/Contents/SectionCard";
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
import { CurrencyPanels } from "./ChartParts";

const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const axisLabelStyle = { ...tickLabelStyle, fontSize: 11.5 };
const OUT_GROUPS = ["cost", "salary", "expense"];
const NO_OUT = { cost: 0, salary: 0, expense: 0 };

const valueSx = { fontSize: "1.05rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

// One term of "money in − money out = net": a label (with the colour of its
// bars in the chart, when it has any) over its amount.
const Term = ({ label, value, color, valueColor, hint }) => (
  <Box sx={{ minWidth: 0 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      {color && <Box sx={{ width: 9, height: 9, borderRadius: "2px", backgroundColor: color, flexShrink: 0 }} />}
      <Typography noWrap sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
        {label}
      </Typography>
    </Box>
    <Typography sx={{ ...valueSx, mt: 0.4, color: valueColor ?? "text.primary" }}>{value}</Typography>
    {hint && <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>{hint}</Typography>}
  </Box>
);

const Operator = ({ children }) => (
  <Typography sx={{ fontSize: "1.1rem", fontWeight: 500, color: "text.disabled", alignSelf: "center", pt: 2 }}>
    {children}
  </Typography>
);

// One currency's money in vs money out, read top to bottom: the sum (in − out
// = net), the two as bars per period, then what the money out was made of.
const MoneyPanel = ({ buckets, moneyOut, currency, view }) => {
  const { t } = useLocale();
  const colors = useDashboardColors();
  const money = (v) => formatAmount(v, currency);

  const groupLabel = {
    cost: BASE_FARE_TEXT,
    salary: t("finance.analytics.flow.groups.salary"),
    expense: t("finance.analytics.flow.groups.expense"),
  };
  const rows = buckets.map((b) => {
    const revenue = b[currency].revenue;
    const out = moneyOut.byPeriod.get(String(b.key)) ?? NO_OUT;
    const outTotal = out.cost + out.salary + out.expense;
    return { key: b.key, label: b.label, revenue, ...out, outTotal, net: revenue - outTotal };
  });

  const revenue = rows.reduce((sum, r) => sum + r.revenue, 0);
  const { totals } = moneyOut;
  const outTotal = totals.cost + totals.salary + totals.expense;
  const net = revenue - outTotal;
  const hasData = revenue > 0 || outTotal > 0;
  // Money out is one colour everywhere on the card: its bars and its parts.
  const outColor = colors.cost;
  const outParts = OUT_GROUPS.filter((g) => totals[g] > 0);

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr)",
          columnGap: 1.5,
          alignItems: "start",
        }}
      >
        <Term label={t("finance.income")} value={money(revenue)} color={colors.sale} />
        <Operator>−</Operator>
        <Term label={t("finance.expense")} value={money(outTotal)} color={outColor} />
        <Operator>=</Operator>
        <Term
          label={t("dashboard.netResult")}
          value={money(net)}
          valueColor={net < 0 ? "error.main" : "success.main"}
          hint={revenue ? t("finance.analytics.margin", { value: formatPercent(percentOf(net, revenue)) }) : null}
        />
      </Box>

      {!hasData ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : view === "chart" ? (
        <Box sx={{ mx: -1 }}>
          <BarChart
            height={230}
            hideLegend
            skipAnimation
            borderRadius={4}
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
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
                width: 52,
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
                valueFormatter: money,
              },
              {
                id: "out",
                label: t("finance.expense"),
                data: rows.map((r) => r.outTotal),
                color: outColor,
                valueFormatter: money,
              },
            ]}
            sx={chartSx()}
            slotProps={tooltipSlotProps}
          />

          {/* What the money out was made of; a part with nothing in it is left out */}
          {outParts.length > 0 && (
            <Box sx={{ mx: 1, mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography sx={{ mb: 1, fontSize: "0.75rem", fontWeight: 600, color: "text.secondary" }}>
                {t("dashboard.outBreakdown")}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto minmax(40px,1fr) auto 36px",
                  columnGap: 1.5,
                  rowGap: 0.9,
                  alignItems: "center",
                  fontSize: "0.8rem",
                }}
              >
                {outParts.map((g) => {
                  const share = percentOf(totals[g], outTotal);
                  return [
                    <Typography key={`${g}-label`} noWrap sx={{ fontSize: "inherit", fontWeight: 500 }}>
                      {g === "cost" ? <BaseFareLabel /> : groupLabel[g]}
                    </Typography>,
                    <Box key={`${g}-bar`} sx={{ height: 6, borderRadius: 3, backgroundColor: "action.hover", overflow: "hidden" }}>
                      <Box sx={{ width: `${Math.max(1.5, share)}%`, height: "100%", borderRadius: 3, backgroundColor: outColor }} />
                    </Box>,
                    <Typography key={`${g}-value`} sx={{ fontSize: "inherit", fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", textAlign: "right" }}>
                      {money(totals[g])}
                    </Typography>,
                    <Typography key={`${g}-share`} sx={{ fontSize: "0.72rem", color: "text.secondary", fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                      {formatPercent(share, 0)}
                    </Typography>,
                  ];
                })}
              </Box>
            </Box>
          )}
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
                    {g === "cost" ? <BaseFareLabel /> : groupLabel[g]}
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
    </>
  );
};

// Money in vs money out per day / month. Money in is the period's sales; money
// out is the cost of those sales, salaries and kassa expenses together — one
// bar beside the money in, with its make-up listed under the chart. The table
// keeps every group per period. A panel per currency: side by side as charts,
// one under the other as (wider) tables.
const IncomeExpenseCard = ({ buckets, moneyOut, granularity }) => {
  const { t } = useLocale();
  const [view, setView] = useState("chart");

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
      <CurrencyPanels stacked={view === "table"}>
        {(currency) => <MoneyPanel buckets={buckets} moneyOut={moneyOut[currency]} currency={currency} view={view} />}
      </CurrencyPanels>
    </SectionCard>
  );
};

export default IncomeExpenseCard;
