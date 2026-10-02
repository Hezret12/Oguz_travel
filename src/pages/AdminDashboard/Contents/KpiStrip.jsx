import { Box, Paper, Tooltip, Typography } from "@mui/material";
import { useLocale } from "../../../hooks/useLocale";
import { changePercent, formatAmount } from "../../Finance/Overview/functions/analyticsFormat";
import { BOTH_CURRENCIES } from "../../Finance/Overview/functions/dashboardData";
import { Delta } from "./ChartParts";

// One headline figure in both currencies, one line each with its change vs
// the previous period. The two are listed, never added: there is no exchange
// rate. `hint(currency)` adds a per-currency note (e.g. the margin).
const KpiCell = ({ label, figure, note, hint, upIsGood, compareLabel }) => {
  const { t } = useLocale();

  return (
    <Box sx={{ minWidth: 0, p: 2.5, backgroundColor: "background.paper" }}>
      <Typography noWrap sx={{ fontSize: "0.8rem", fontWeight: 500, color: "text.secondary" }}>
        {label}
      </Typography>

      <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
        {BOTH_CURRENCIES.map((currency) => {
          const { value, previous } = figure[currency];
          const extra = hint?.(currency);
          return (
            <Tooltip
              key={currency}
              title={`${t("finance.analytics.vsPrevious")}: ${formatAmount(previous, currency)}`}
              arrow
              placement="top-start"
            >
              <Box
                sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 1, rowGap: 0.25, minWidth: 0, cursor: "default" }}
              >
                <Typography
                  noWrap
                  sx={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                    color: value < 0 ? "error.main" : "text.primary",
                  }}
                >
                  {formatAmount(value, currency)}
                </Typography>
                <Delta change={changePercent(value, previous)} upIsGood={upIsGood} />
                {extra && (
                  <Typography noWrap sx={{ fontSize: "0.72rem", color: "text.secondary", minWidth: 0 }}>
                    {extra}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      <Typography noWrap sx={{ mt: 1.25, fontSize: "0.72rem", color: "text.secondary" }}>
        {[compareLabel, note].filter(Boolean).join(" · ")}
      </Typography>
    </Box>
  );
};

// The period's headline figures in one hairline-divided strip.
const KpiStrip = ({ cells, compareLabel }) => (
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
        figure={c.figure}
        note={c.note}
        hint={c.hint}
        upIsGood={c.upIsGood}
        compareLabel={compareLabel}
      />
    ))}
  </Paper>
);

export default KpiStrip;
