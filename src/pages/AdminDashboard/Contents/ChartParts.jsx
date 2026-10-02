import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { formatAmount, formatPercent } from "../../Finance/Overview/functions/analyticsFormat";
import { BOTH_CURRENCIES } from "../../Finance/Overview/functions/dashboardData";

// Change vs the previous period: arrow + percentage in a quiet pill, green when
// the move is good for the business and red when it is not (cost ↑ reads red).
export const Delta = ({ change, upIsGood }) => {
  if (change === null || change === undefined || !Number.isFinite(change)) return null;
  const flat = Math.abs(change) < 0.05;
  const up = change > 0;
  const tone = flat ? null : up === upIsGood ? "success" : "error";
  const Arrow = flat ? ArrowRight : up ? ArrowUpRight : ArrowDownRight;

  return (
    <Box
      component="span"
      sx={(theme) => ({
        display: "inline-flex",
        alignItems: "center",
        gap: 0.25,
        height: 20,
        pl: 0.4,
        pr: 0.75,
        borderRadius: "6px",
        fontSize: "0.72rem",
        fontWeight: 600,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
        color: tone ? theme.palette[tone].main : theme.palette.text.secondary,
        backgroundColor: tone
          ? alpha(theme.palette[tone].main, theme.palette.mode === "dark" ? 0.16 : 0.1)
          : theme.palette.action.hover,
      })}
    >
      <Arrow size={13} strokeWidth={2.25} />
      {formatPercent(Math.abs(change))}
    </Box>
  );
};

// Legend entry that also carries the series total. The swatch mirrors the
// mark — a stroke for lines (dashed for a previous period), a square for
// bars — so identity is never colour alone. Without `color` it is a plain stat.
export const LegendStat = ({ color, shape = "line", dashed, label, value, change, upIsGood, hint }) => (
  <Box sx={{ minWidth: 0 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      {color &&
        (shape === "bar" ? (
          <Box sx={{ width: 9, height: 9, borderRadius: "2px", backgroundColor: color, flexShrink: 0 }} />
        ) : (
          <Box sx={{ width: 14, borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}`, opacity: dashed ? 0.6 : 1 }} />
        ))}
      <Typography noWrap sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
        {label}
      </Typography>
    </Box>
    <Box sx={{ mt: 0.4, display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
      <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
        {value}
      </Typography>
      {change !== undefined && <Delta change={change} upIsGood={upIsGood} />}
      {hint && (
        <Typography component="span" sx={{ fontSize: "0.72rem", color: "text.secondary", whiteSpace: "nowrap" }}>
          {hint}
        </Typography>
      )}
    </Box>
  </Box>
);

// A row of LegendStats above a chart.
export const StatRow = ({ children }) => (
  <Box sx={{ display: "flex", gap: { xs: 2.5, sm: 4 }, flexWrap: "wrap" }}>{children}</Box>
);

// TMT and USD as two panels, side by side from `md` up (or always stacked):
// amounts in two currencies never share an axis or a sum. `children` renders
// one panel for the currency it is given.
export const CurrencyPanels = ({ children, stacked = false }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "minmax(0,1fr)", md: stacked ? "minmax(0,1fr)" : "repeat(2, minmax(0,1fr))" },
      gap: 3,
    }}
  >
    {BOTH_CURRENCIES.map((currency) => (
      <Box key={currency} sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <CurrencyTag currency={currency} />
        {children(currency)}
      </Box>
    ))}
  </Box>
);

// Small neutral tag naming a panel's currency.
export const CurrencyTag = ({ currency }) => (
  <Typography
    component="span"
    sx={{
      alignSelf: "flex-start",
      px: 0.875,
      py: 0.25,
      borderRadius: "6px",
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.04em",
      lineHeight: 1.4,
      color: "text.secondary",
      backgroundColor: "action.hover",
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    {currency}
  </Typography>
);

// One amount per currency, one per line, for table cells. A currency with
// nothing booked reads as a muted dash. `color(value)` may colour a line.
export const AmountLines = ({ values, color, weight = 600 }) => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.25 }}>
    {BOTH_CURRENCIES.map((currency) => {
      const value = values?.[currency] ?? 0;
      return (
        <Typography
          key={currency}
          component="span"
          sx={{
            fontSize: "inherit",
            fontWeight: value ? weight : 400,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
            color: value ? color?.(value) ?? "inherit" : "text.disabled",
          }}
        >
          {value ? formatAmount(value, currency) : `— ${currency}`}
        </Typography>
      );
    })}
  </Box>
);
