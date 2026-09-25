import { Fragment, memo } from "react";
import { Box, Skeleton, Tooltip, Typography, alpha } from "@mui/material";
import { ArrowDownLeft, ArrowUpRight, Info } from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";
import { fmtMoney } from "../functions/cashFlowHelpers";

const CURRENCIES = ["TMT", "USD"];

const fmtNumber = (val) =>
  Math.abs(Number(val || 0)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// "↙ Girdeji  TMT 81,600.00 · USD 12,400.00" — TMT and USD are never added together.
const TotalGroup = ({ label, icon: Icon, tone, items }) => {
  const { t } = useLocale();

  return (
    <Box
      sx={(theme) => ({
        height: 40,
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        borderRadius: "10px",
        whiteSpace: "nowrap",
        backgroundColor: alpha(theme.palette[tone].main, theme.palette.mode === "dark" ? 0.1 : 0.06),
        border: `1px solid ${alpha(theme.palette[tone].main, 0.22)}`,
      })}
    >
      <Box
        aria-hidden
        sx={(theme) => ({
          flexShrink: 0,
          width: 22,
          height: 22,
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.palette[tone].main,
          bgcolor: alpha(theme.palette[tone].main, theme.palette.mode === "dark" ? 0.16 : 0.1),
        })}
      >
        <Icon size={13} strokeWidth={2.25} />
      </Box>
      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "text.secondary", whiteSpace: "nowrap" }}>
        {label}
      </Typography>
      {items.map((it, i) => (
        <Fragment key={it.currency}>
          {i > 0 && (
            <Typography component="span" sx={{ color: "text.disabled", fontSize: "13px" }}>
              ·
            </Typography>
          )}
          <Tooltip
            title={`${fmtMoney(it.value, it.currency)} · ${t("finance.cashBook.operations", { count: it.count })}`}
            placement="top"
          >
            <Typography
              component="span"
              sx={{
                fontSize: "13px",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
                color: "text.primary",
                cursor: "default",
              }}
            >
              <Box component="span" sx={{ mr: 0.5, fontSize: "11px", fontWeight: 700, color: "text.secondary" }}>
                {it.currency}
              </Box>
              {fmtNumber(it.value)}
            </Typography>
          </Tooltip>
        </Fragment>
      ))}
    </Box>
  );
};

// Totals of everything the current tab + filters match (not just this page),
// shown as pills in the page header. Hidden on small screens, like the
// Cafeteria header stats, where they would crowd the header buttons.
const CashFlowSummary = ({ totals = [], isLoading, isProjectTab, note }) => {
  const { t } = useLocale();

  if (isLoading && !totals.length) {
    return (
      <Skeleton
        variant="rounded"
        width={460}
        height={40}
        sx={{ borderRadius: "10px", display: { xs: "none", md: "block" } }}
      />
    );
  }

  const byCurrency = CURRENCIES.map((currency) =>
    totals
      .filter((c) => c.currency === currency)
      .reduce(
        (acc, c) => ({
          currency,
          income: acc.income + Number(c.income || 0),
          expense: acc.expense + Number(c.expense || 0),
          count: acc.count + Number(c.count || 0),
        }),
        { currency, income: 0, expense: 0, count: 0 },
      ),
  );

  const metrics = [
    {
      key: "income",
      label: isProjectTab ? t("finance.totalSale") : t("finance.income"),
      icon: ArrowDownLeft,
      tone: "success",
    },
    {
      key: "expense",
      label: isProjectTab ? t("finance.totalCost") : t("finance.expense"),
      icon: ArrowUpRight,
      tone: "error",
    },
  ];

  return (
    <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1.2, minWidth: 0 }}>
      {metrics.map((m) => (
        <TotalGroup
          key={m.key}
          label={m.label}
          icon={m.icon}
          tone={m.tone}
          items={byCurrency.map((c) => ({ currency: c.currency, value: c[m.key], count: c.count }))}
        />
      ))}
      {note && (
        <Tooltip title={note} placement="top" arrow>
          <Box sx={{ display: "inline-flex", color: "text.secondary", cursor: "help" }}>
            <Info size={15} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default memo(CashFlowSummary);
