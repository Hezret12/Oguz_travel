import { useState } from "react";
import {
  Box,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useLocale } from "../../../hooks/useLocale";
import SectionCard, { ChartGradients, EmptyState, ViewToggle } from "../../Finance/Overview/Contents/SectionCard";
import {
  chartSx,
  formatAmount,
  formatCompactAmount,
  tableSx,
  tickLabelStyle,
  tooltipSlotProps,
  useDashboardColors,
  xAxisBase,
  yAxisBase,
} from "../../Finance/Overview/functions/analyticsFormat";
import { BOTH_CURRENCIES } from "../../Finance/Overview/functions/dashboardData";
import { CurrencyPanels, LegendStat, StatRow } from "./ChartParts";

const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const GRADIENT = "dashboard-trend-sale";
const axisLabelStyle = { ...tickLabelStyle, fontSize: 11.5 };

const hasSales = (analytics) => analytics.chart.some((p) => p.sale || p.profit);

// One currency's sales and profit over the period.
const TrendPanel = ({ analytics, currency, view }) => {
  const { t } = useLocale();
  const colors = useDashboardColors();
  const money = (v) => formatAmount(v, currency);
  const { chart } = analytics;
  const hasData = hasSales(analytics);

  return (
    <>
      <StatRow>
        <LegendStat
          color={colors.sale}
          label={t("dashboard.sales")}
          value={money(analytics.sale)}
          change={analytics.saleChange}
          upIsGood
        />
        <LegendStat
          color={colors.profit}
          label={t("dashboard.profit")}
          value={money(analytics.profit)}
          change={analytics.profitChange}
          upIsGood
        />
      </StatRow>

      {!hasData ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : view === "chart" ? (
        <Box sx={{ mx: -1 }}>
          <ChartGradients gradients={[{ id: `${GRADIENT}-${currency}`, color: colors.sale, opacity: 0.16 }]} />
          <LineChart
            height={240}
            hideLegend
            skipAnimation
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
            grid={{ horizontal: true }}
            axisHighlight={{ x: "line" }}
            xAxis={[{ ...xAxisBase, scaleType: "point", data: chart.map((p) => p.label), tickLabelStyle: axisLabelStyle }]}
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
                id: "sale",
                label: t("dashboard.sales"),
                data: chart.map((p) => p.sale),
                color: colors.sale,
                area: true,
                curve: "monotoneX",
                showMark: false,
                valueFormatter: money,
              },
              {
                id: "profit",
                label: t("dashboard.profit"),
                data: chart.map((p) => p.profit),
                color: colors.profit,
                curve: "monotoneX",
                showMark: false,
                valueFormatter: money,
              },
            ]}
            sx={[
              chartSx({ sale: `${GRADIENT}-${currency}` }),
              (theme) => ({
                "& .MuiLineChart-line": { strokeWidth: 2 },
                "& .MuiChartsAxisHighlight-root": { stroke: theme.palette.text.secondary, strokeOpacity: 0.35 },
              }),
            ]}
            slotProps={tooltipSlotProps}
          />
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 300 }}>
          <Table size="small" stickyHeader sx={tableSx}>
            <TableHead>
              <TableRow>
                <TableCell>{t("finance.analytics.trend.date")}</TableCell>
                <TableCell sx={num}>{t("dashboard.sales")}</TableCell>
                <TableCell sx={num}>{t("dashboard.profit")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chart.map((p) => (
                <TableRow key={p.key} hover>
                  <TableCell>{p.label}</TableCell>
                  <TableCell sx={{ ...num, fontWeight: 600 }}>{money(p.sale)}</TableCell>
                  <TableCell sx={{ ...num, color: p.profit < 0 ? "error.main" : "text.primary" }}>
                    {money(p.profit)}
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

// Sales and profit over the period for every service or a picked one — a
// panel per currency, each on its own axis. A currency with no sales in the
// period (a USD-only service) gets no panel.
const TrendCard = ({ analytics, granularity, services, service, onServiceChange, loading }) => {
  const { t } = useLocale();
  const [view, setView] = useState("chart");
  const currencies = BOTH_CURRENCIES.filter((currency) => hasSales(analytics[currency]));

  return (
    <SectionCard
      title={t("dashboard.trendTitle")}
      subtitle={t(`finance.analytics.trend.by.${granularity}`)}
      action={
        <>
          <TextField
            select
            size="small"
            value={service}
            onChange={(e) => onServiceChange(e.target.value)}
            sx={{
              width: { xs: 150, sm: 190 },
              "& .MuiInputBase-root": { height: 32, fontSize: "0.8rem", borderRadius: "8px" },
            }}
            slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { maxHeight: 360 } } } } } }}
          >
            <MenuItem value="" sx={{ fontSize: "0.85rem" }}>
              {t("dashboard.allServices")}
            </MenuItem>
            {services.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: "0.85rem" }}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
          <ViewToggle
            value={view}
            onChange={setView}
            chartLabel={t("finance.analytics.trend.chart")}
            tableLabel={t("finance.analytics.trend.table")}
          />
        </>
      }
    >
      <Box sx={{ opacity: loading ? 0.6 : 1, transition: "opacity .2s ease" }}>
        <CurrencyPanels currencies={currencies.length ? currencies : BOTH_CURRENCIES}>
          {(currency) => <TrendPanel analytics={analytics[currency]} currency={currency} view={view} />}
        </CurrencyPanels>
      </Box>
    </SectionCard>
  );
};

export default TrendCard;
