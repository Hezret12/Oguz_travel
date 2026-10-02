import { Box, Paper, Tooltip, Typography } from "@mui/material";
import { useLocale } from "../../../hooks/useLocale";
import { changePercent, formatAmount } from "../../Finance/Overview/functions/analyticsFormat";
import { Delta } from "./ChartParts";

// One headline figure: value in the selected currency, the other currency and
// a note underneath, change vs the previous period.
const KpiCell = ({ label, value, previous, currency, otherValue, otherCurrency, note, upIsGood, compareLabel }) => {
  const { t } = useLocale();
  const change = changePercent(value, previous);

  return (
    <Box sx={{ minWidth: 0, p: 2.5, backgroundColor: "background.paper" }}>
      <Typography noWrap sx={{ fontSize: "0.8rem", fontWeight: 500, color: "text.secondary" }}>
        {label}
      </Typography>

      <Typography
        noWrap
        sx={{
          mt: 1,
          fontSize: "1.65rem",
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          color: value < 0 ? "error.main" : "text.primary",
        }}
      >
        {formatAmount(value, currency)}
      </Typography>

      <Tooltip title={`${t("finance.analytics.vsPrevious")}: ${formatAmount(previous, currency)}`} arrow placement="top-start">
        <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 0.75, minHeight: 20, minWidth: 0, cursor: "default" }}>
          <Delta change={change} upIsGood={upIsGood} />
          <Typography noWrap sx={{ fontSize: "0.72rem", color: "text.secondary", minWidth: 0 }}>
            {compareLabel}
          </Typography>
        </Box>
      </Tooltip>

      {/* The other currency is listed, never added: there is no exchange rate. */}
      <Typography
        noWrap
        sx={{ mt: 1.25, fontSize: "0.78rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}
      >
        {[formatAmount(otherValue, otherCurrency), note].filter(Boolean).join(" · ")}
      </Typography>
    </Box>
  );
};

// The period's headline figures in one hairline-divided strip.
const KpiStrip = ({ cells, currency, compareLabel }) => {
  const otherCurrency = currency === "USD" ? "TMT" : "USD";

  return (
    <Paper
      elevation={0}
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0,1fr)",
          sm: "repeat(2, minmax(0,1fr))",
          lg: `repeat(${cells.length}, minmax(0,1fr))`,
        },
        // 1px gaps over the divider colour draw the hairlines between cells.
        gap: "1px",
        backgroundColor: "divider",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "none",
        // An odd last cell spans the row on the two-column layout.
        "& > :last-of-type": { gridColumn: { sm: cells.length % 2 ? "1 / -1" : "auto", lg: "auto" } },
      }}
    >
      {cells.map((c) => (
        <KpiCell
          key={c.key}
          label={c.label}
          value={c.figure[currency].value}
          previous={c.figure[currency].previous}
          currency={currency}
          otherValue={c.figure[otherCurrency].value}
          otherCurrency={otherCurrency}
          note={c.note}
          upIsGood={c.upIsGood}
          compareLabel={compareLabel}
        />
      ))}
    </Paper>
  );
};

export default KpiStrip;
