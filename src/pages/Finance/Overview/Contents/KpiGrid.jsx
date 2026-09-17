import { Box, Grid, Paper, Tooltip, Typography, alpha } from "@mui/material";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";
import {
  changePercent,
  formatAmount,
  formatPercent,
  percentOf,
} from "../functions/analyticsFormat";

// `upIsGood: false` for costs, where growth is bad news.
const KPI_DEFS = [
  { key: "revenue", upIsGood: true },
  { key: "cost", upIsGood: false },
  { key: "grossProfit", upIsGood: true },
  { key: "expenses", upIsGood: false },
  { key: "netProfit", upIsGood: true },
  { key: "receivable", upIsGood: false },
];

// Change vs the previous period as a soft pill (icon + number, never colour alone).
export const DeltaBadge = ({ change, upIsGood }) => {
  const { t } = useLocale();
  if (change === null || !Number.isFinite(change)) return null;

  const flat = Math.abs(change) < 0.05;
  const up = change > 0;
  const tone = flat ? "neutral" : up === upIsGood ? "good" : "bad";
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;

  return (
    <Tooltip title={t("finance.analytics.vsPrevious")} arrow placement="top">
      <Box
        sx={(theme) => {
          const color =
            tone === "good"
              ? theme.palette.success.main
              : tone === "bad"
                ? theme.palette.error.main
                : theme.palette.text.secondary;
          return {
            display: "inline-flex",
            alignItems: "center",
            gap: 0.25,
            px: 0.75,
            py: 0.125,
            borderRadius: "6px",
            color,
            backgroundColor: alpha(color, 0.1),
            cursor: "default",
            flexShrink: 0,
          };
        }}
      >
        <Icon size={13} strokeWidth={2.5} />
        <Typography component="span" sx={{ fontSize: "0.72rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {formatPercent(Math.abs(change))}
        </Typography>
      </Box>
    </Tooltip>
  );
};

const KpiCard = ({ label, value, currency, hint, change, upIsGood, negative }) => (
  <Paper
    elevation={0}
    sx={{
      px: 2,
      py: 1.75,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 1,
      borderRadius: "14px",
      border: "1px solid",
      borderColor: "divider",
      backgroundColor: "background.paper",
    }}
  >
    <Typography noWrap sx={{ fontSize: "0.78rem", fontWeight: 500, color: "text.secondary" }}>
      {label}
    </Typography>
    <Typography
      noWrap
      sx={{
        fontSize: "1.45rem",
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        fontVariantNumeric: "tabular-nums",
        color: negative ? "error.main" : "text.primary",
      }}
    >
      {formatAmount(value, currency)}
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <DeltaBadge change={change} upIsGood={upIsGood} />
      <Typography noWrap sx={{ fontSize: "0.72rem", color: "text.secondary", minWidth: 0 }}>
        {hint}
      </Typography>
    </Box>
  </Paper>
);

const KpiGrid = ({ totals, currency }) => {
  const { t } = useLocale();
  const current = totals.current[currency];
  const previous = totals.previous[currency];

  const hints = {
    revenue: t("finance.analytics.salesCount", { count: current.salesCount }),
    cost: t("finance.analytics.costHint"),
    grossProfit: t("finance.analytics.margin", {
      value: formatPercent(percentOf(current.grossProfit, current.revenue)),
    }),
    expenses: t("finance.analytics.salariesIncluded"),
    netProfit: t("finance.analytics.afterExpenses"),
    receivable: t("finance.analytics.collectionRate", {
      value: formatPercent(percentOf(current.collected, current.revenue), 0),
    }),
  };

  return (
    <Grid container spacing={1.5}>
      {KPI_DEFS.map(({ key, upIsGood }) => (
        <Grid key={key} size={{ xs: 6, md: 4, xl: 2 }}>
          <KpiCard
            label={t(`finance.analytics.kpi.${key}`)}
            value={current[key]}
            currency={currency}
            hint={hints[key]}
            change={changePercent(current[key], previous[key])}
            upIsGood={upIsGood}
            negative={key === "netProfit" && current[key] < 0}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default KpiGrid;
