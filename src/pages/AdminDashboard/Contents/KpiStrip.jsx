import { memo } from "react";
import { Box, Tooltip, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useLocale } from "../../../hooks/useLocale";
import { changePercent, formatAmount } from "../../Finance/Overview/functions/analyticsFormat";
import { BOTH_CURRENCIES } from "../../Finance/Overview/functions/dashboardData";
import { Delta } from "./ChartParts";

// The bare number; the currency sits in its own column so the rows align.
const fmtNumber = (value) => {
  const num = Math.round(Number(value) || 0);
  return `${num < 0 ? "−" : ""}${Math.abs(num).toLocaleString("en-US")}`;
};

// One headline figure: an icon in the card's tone, then a row per currency —
// code, amount, change vs the previous period. The two are listed, never
// added: there is no exchange rate. The change pill's tooltip names what it
// compares against; `hint(currency)` adds to it (e.g. the margin).
const KpiCard = ({ label, icon: Icon, tone, figure, hint, upIsGood, compareLabel }) => {
  const { t } = useLocale();
  const { palette } = useTheme();
  const color = tone[palette.mode === "dark" ? "dark" : "light"];

  return (
    <Box
      sx={{
        minWidth: 0,
        p: 2.25,
        borderRadius: "14px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        transition: "border-color 150ms ease",
        "&:hover": { borderColor: alpha(color, 0.45) },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
        <Box
          aria-hidden
          sx={{
            flexShrink: 0,
            width: 34,
            height: 34,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            backgroundColor: alpha(color, palette.mode === "dark" ? 0.16 : 0.1),
          }}
        >
          <Icon size={18} strokeWidth={2} />
        </Box>
        <Typography noWrap sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.secondary", minWidth: 0 }}>
          {label}
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: "auto minmax(0,1fr) auto",
          alignItems: "center",
          columnGap: 1.25,
          rowGap: 1,
        }}
      >
        {BOTH_CURRENCIES.map((currency) => {
          const { value, previous } = figure[currency];
          const extra = hint?.(currency);
          return [
            <Typography
              key={`${currency}-code`}
              sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em", color: "text.secondary" }}
            >
              {currency}
            </Typography>,
            <Typography
              key={`${currency}-value`}
              noWrap
              sx={{
                fontSize: "1.35rem",
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
                color: value < 0 ? "error.main" : "text.primary",
              }}
            >
              {fmtNumber(value)}
            </Typography>,
            <Tooltip
              key={`${currency}-change`}
              arrow
              placement="top-end"
              title={[
                `${compareLabel} · ${t("finance.analytics.vsPrevious")}: ${formatAmount(previous, currency)}`,
                extra,
              ]
                .filter(Boolean)
                .join(" · ")}
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end", minWidth: 0, cursor: "default" }}>
                <Delta change={changePercent(value, previous)} upIsGood={upIsGood} />
              </Box>
            </Tooltip>,
          ];
        })}
      </Box>
    </Box>
  );
};

// The period's headline figures as a row of cards.
const KpiStrip = ({ cells, compareLabel }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "minmax(0,1fr)",
        sm: "repeat(2, minmax(0,1fr))",
        lg: `repeat(${cells.length}, minmax(0,1fr))`,
      },
      gap: 2,
    }}
  >
    {cells.map(({ key, ...cell }) => (
      <KpiCard key={key} {...cell} compareLabel={compareLabel} />
    ))}
  </Box>
);

export default memo(KpiStrip);
