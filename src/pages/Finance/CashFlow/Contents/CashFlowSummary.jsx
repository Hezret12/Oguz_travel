import { memo } from "react";
import { Box, Skeleton, Tooltip, Typography } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import { fmtCompact, fmtMoney } from "../functions/cashFlowHelpers";

const CURRENCY_ORDER = ["USD", "TMT", "EUR"];
const GREEN = "#16a34a";
const RED = "#dc2626";

const Stat = ({ label, value, currency, color, sign = "" }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "text.secondary", mb: 0.25 }}>
      {label}
    </Typography>
    <Tooltip title={`${sign}${fmtMoney(Math.abs(value), currency)}`} placement="bottom-start">
      <Typography
        sx={{
          fontSize: { xs: "16px", md: "19px" },
          fontWeight: 750,
          color,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {sign}
        {fmtCompact(Math.abs(value), currency)}
      </Typography>
    </Tooltip>
  </Box>
);

// One card per currency. USD / TMT / EUR are never converted into each other.
const CashFlowSummary = ({ totals = [], isLoading, isProjectTab }) => {
  const { t } = useLocale();

  const sorted = [...totals].sort(
    (a, b) =>
      (CURRENCY_ORDER.indexOf(a.currency) + 1 || 99) - (CURRENCY_ORDER.indexOf(b.currency) + 1 || 99),
  );

  const labels = isProjectTab
    ? { income: t("finance.totalSale"), expense: t("finance.totalCost"), balance: t("finance.netProfit") }
    : { income: t("finance.income"), expense: t("finance.expense"), balance: t("finance.cashBook.balance") };

  if (isLoading && !totals.length) {
    return (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 2 }}>
        {[0, 1].map((i) => (
          <Skeleton key={i} variant="rounded" height={98} sx={{ borderRadius: "12px" }} />
        ))}
      </Box>
    );
  }

  if (!sorted.length) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: sorted.length > 1 ? "1fr 1fr" : "1fr",
          xl: `repeat(${Math.min(sorted.length, 3)}, 1fr)`,
        },
        gap: 2,
        mb: 2,
      }}
    >
      {sorted.map((c) => {
        const balance = Number(c.income) - Number(c.expense);
        return (
          <Box
            key={c.currency}
            sx={{
              p: 2,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 1.25 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "15px", letterSpacing: "0.3px" }}>
                {c.currency}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>
                {t("finance.cashBook.operations", { count: c.count })}
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1.5 }}>
              <Stat label={labels.income} value={c.income} currency={c.currency} color={GREEN} sign="+" />
              <Stat label={labels.expense} value={c.expense} currency={c.currency} color={RED} sign="-" />
              <Stat
                label={labels.balance}
                value={balance}
                currency={c.currency}
                color={balance >= 0 ? GREEN : RED}
                sign={balance >= 0 ? "+" : "-"}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default memo(CashFlowSummary);
