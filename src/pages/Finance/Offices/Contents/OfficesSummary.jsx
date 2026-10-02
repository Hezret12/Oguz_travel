import { Box, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { BanknoteArrowDown, BanknoteArrowUp, HandCoins, PiggyBank } from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";
import BaseFareLabel from "../../../../components/BaseFareLabel";
import { KPI_TONES, formatAmount } from "../../Overview/functions/analyticsFormat";

const amountSx = { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

const Tile = ({ icon: Icon, color, label, children, footer }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
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
        sx={(theme) => ({
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          backgroundColor: alpha(color, theme.palette.mode === "dark" ? 0.16 : 0.1),
        })}
      >
        <Icon size={18} strokeWidth={2} />
      </Box>
      <Typography noWrap sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.secondary", minWidth: 0 }}>
        {label}
      </Typography>
    </Box>
    <Box sx={{ mt: 1.75, minWidth: 0 }}>{children}</Box>
    {footer && (
      <Typography noWrap sx={{ mt: 1, fontSize: "0.75rem", color: "text.secondary", minWidth: 0 }}>
        {footer}
      </Typography>
    )}
  </Box>
);

// USD large, TMT beside it; the two are never added.
const DualAmount = ({ value }) => (
  <Box sx={{ display: "flex", alignItems: "baseline", columnGap: 1.25, flexWrap: "wrap", minWidth: 0 }}>
    <Typography
      noWrap
      sx={{
        ...amountSx,
        fontSize: "1.75rem",
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        color: value.USD < 0 ? "error.main" : "text.primary",
      }}
    >
      {formatAmount(value.USD, "USD")}
    </Typography>
    <Typography
      noWrap
      sx={{ ...amountSx, fontSize: "1rem", fontWeight: 600, color: value.TMT < 0 ? "error.main" : "text.secondary" }}
    >
      {formatAmount(value.TMT, "TMT")}
    </Typography>
  </Box>
);

// Headline totals across every office, plus the office with the most money out.
const OfficesSummary = ({ rows, totals }) => {
  const { t } = useLocale();
  const mode = useTheme().palette.mode === "dark" ? "dark" : "light";
  const count = t("finance.offices.officeCount", { count: rows.length });

  // USD decides, TMT breaks ties; an office with no expense at all is not "top".
  const topExpense = [...rows]
    .filter((r) => r.outflow.USD > 0 || r.outflow.TMT > 0)
    .sort((a, b) => b.outflow.USD - a.outflow.USD || b.outflow.TMT - a.outflow.TMT)[0];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))",
        },
        gap: 2,
      }}
    >
      <Tile icon={BanknoteArrowDown} color={KPI_TONES.inflow[mode]} label={t("finance.analytics.kpi.moneyIn")} footer={count}>
        <DualAmount value={totals.inflow} />
      </Tile>
      <Tile icon={BanknoteArrowUp} color={KPI_TONES.outflow[mode]} label={<BaseFareLabel />} footer={count}>
        <DualAmount value={totals.outflow} />
      </Tile>
      <Tile
        icon={PiggyBank}
        color={KPI_TONES.profit[mode]}
        label={t("finance.analytics.kpi.profit")}
        footer={t("finance.offices.profitHint")}
      >
        <DualAmount value={totals.profit} />
      </Tile>
      <Tile icon={HandCoins} color={KPI_TONES.outflow[mode]} label={t("finance.offices.topExpenseOffice")}>
        {topExpense ? (
          <>
            <Typography noWrap sx={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em" }}>
              {topExpense.name}
            </Typography>
            <Typography noWrap sx={{ ...amountSx, mt: 0.5, fontSize: "0.85rem", fontWeight: 600, color: "text.secondary" }}>
              {formatAmount(topExpense.outflow.USD, "USD")} · {formatAmount(topExpense.outflow.TMT, "TMT")}
            </Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "text.disabled" }}>—</Typography>
        )}
      </Tile>
    </Box>
  );
};

export default OfficesSummary;
