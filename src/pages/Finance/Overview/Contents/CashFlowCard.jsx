import { useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, LegendRow, ViewToggle } from "./SectionCard";
import { DeltaBadge } from "./KpiGrid";
import {
  changePercent,
  chartSx,
  formatAmount,
  formatCompactAmount,
  tickLabelStyle,
  useSeriesColors,
} from "../functions/analyticsFormat";

const numCell = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

// One figure in the summary strip. `danger`: a negative value is bad news
// (net flow), so it turns red.
const Stat = ({ label, value, currency, change, upIsGood, sign, strong, danger }) => (
  <Box sx={{ minWidth: 0, py: 0.5 }}>
    <Typography noWrap sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
      {label}
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
      <Typography
        noWrap
        sx={{
          fontSize: strong ? "1.2rem" : "1.05rem",
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: danger && value < 0 ? "error.main" : "text.primary",
        }}
      >
        {sign && value > 0 ? sign : ""}
        {formatAmount(value, currency)}
      </Typography>
      {change !== undefined && <DeltaBadge change={change} upIsGood={upIsGood} />}
    </Box>
  </Box>
);

// Money actually received and paid out, and the till balance it leaves.
const CashFlowCard = ({ cashFlow, currency, granularity }) => {
  const { t } = useLocale();
  const colors = useSeriesColors();
  const [view, setView] = useState("chart");

  const cur = cashFlow.current[currency];
  const prev = cashFlow.previous[currency];
  const series = cashFlow.series;
  const labels = series.map((p) => p.label);
  const hasData = cur.inflow > 0 || cur.outflow > 0;
  const label = (key) => t(`finance.analytics.cash.${key}`);

  return (
    <SectionCard
      title={label("title")}
      subtitle={`${label("subtitle")} · ${t(`finance.analytics.trend.by.${granularity}`)}`}
      action={
        <ViewToggle
          value={view}
          onChange={setView}
          chartLabel={t("finance.analytics.trend.chart")}
          tableLabel={t("finance.analytics.trend.table")}
        />
      }
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" },
          columnGap: 3,
          rowGap: 1.5,
          px: 2,
          py: 1.25,
          borderRadius: "10px",
          backgroundColor: "action.hover",
          "& > *:not(:first-of-type)": { md: { pl: 3, borderLeft: "1px solid", borderColor: "divider" } },
        }}
      >
        <Stat label={label("opening")} value={cur.opening} currency={currency} />
        <Stat
          label={label("inflow")}
          value={cur.inflow}
          currency={currency}
          sign="+"
          change={changePercent(cur.inflow, prev.inflow)}
          upIsGood
        />
        <Stat
          label={label("outflow")}
          value={-cur.outflow}
          currency={currency}
          change={changePercent(cur.outflow, prev.outflow)}
          upIsGood={false}
        />
        <Stat
          label={label("net")}
          value={cur.net}
          currency={currency}
          sign="+"
          change={changePercent(cur.net, prev.net)}
          upIsGood
          danger
        />
        <Stat label={label("closing")} value={cur.closing} currency={currency} strong />
      </Box>

      {!hasData ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : view === "chart" ? (
        <>
          <LegendRow
            items={[
              { label: label("inflow"), color: colors.inflow, shape: "bar" },
              { label: label("outflow"), color: colors.outflow, shape: "bar" },
            ]}
          />
          <Box sx={{ mx: -1 }}>
            <BarChart
              height={260}
              hideLegend
              skipAnimation
              borderRadius={4}
              grid={{ horizontal: true }}
              xAxis={[{ scaleType: "band", data: labels, tickLabelStyle, categoryGapRatio: 0.35, barGapRatio: 0.15 }]}
              yAxis={[{ width: 60, valueFormatter: (v) => formatCompactAmount(v, currency), tickLabelStyle }]}
              series={[
                {
                  id: "inflow",
                  label: label("inflow"),
                  data: series.map((p) => p[currency].inflow),
                  color: colors.inflow,
                  valueFormatter: (v) => formatAmount(v, currency),
                },
                {
                  id: "outflow",
                  label: label("outflow"),
                  data: series.map((p) => p[currency].outflow),
                  color: colors.outflow,
                  valueFormatter: (v) => formatAmount(v, currency),
                },
              ]}
              sx={chartSx}
            />
          </Box>

          {/* Different scale from the bars, so it gets its own chart. */}
          <Box>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "text.secondary" }}>
              {label("balanceTitle")}
            </Typography>
            <Box sx={{ mx: -1 }}>
              <LineChart
                height={170}
                hideLegend
                skipAnimation
                grid={{ horizontal: true }}
                xAxis={[{ scaleType: "point", data: labels, tickLabelStyle }]}
                yAxis={[{ width: 60, valueFormatter: (v) => formatCompactAmount(v, currency), tickLabelStyle }]}
                series={[
                  {
                    id: "balance",
                    label: label("closing"),
                    data: series.map((p) => p[currency].balance),
                    color: colors.balance,
                    curve: "monotoneX",
                    showMark: series.length <= 14,
                    valueFormatter: (v) => formatAmount(v, currency),
                  },
                ]}
                sx={chartSx}
              />
            </Box>
          </Box>
        </>
      ) : (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t("finance.analytics.trend.date")}</TableCell>
                <TableCell sx={numCell}>{label("inflow")}</TableCell>
                <TableCell sx={numCell}>{label("outflow")}</TableCell>
                <TableCell sx={numCell}>{label("net")}</TableCell>
                <TableCell sx={numCell}>{label("closing")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {series.map((p) => {
                const row = p[currency];
                return (
                  <TableRow key={p.date} hover>
                    <TableCell>{p.label}</TableCell>
                    <TableCell sx={numCell}>{formatAmount(row.inflow, currency)}</TableCell>
                    <TableCell sx={numCell}>{formatAmount(row.outflow, currency)}</TableCell>
                    <TableCell sx={{ ...numCell, fontWeight: 700, color: row.net < 0 ? "error.main" : "text.primary" }}>
                      {formatAmount(row.net, currency)}
                    </TableCell>
                    <TableCell sx={numCell}>{formatAmount(row.balance, currency)}</TableCell>
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

export default CashFlowCard;
