import { memo, useMemo } from "react";
import { Box, Typography, alpha } from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getCafeteriaSummaryApi } from "../../../api/queries/getters";

const formatMoney = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// "+1,200.00" / "-300.00": the sign comes from the amount itself (negative
// amounts are allowed), `forceSign` also shows "+" on positive ones.
const signed = (amount, forceSign) => {
  const num = Number(amount || 0);
  const sign = num < 0 ? "-" : forceSign && num > 0 ? "+" : "";
  return `${sign}${formatMoney(Math.abs(num))}`;
};

// Params that don't change the totals (paging, sorting) are left out, so the
// summary isn't refetched on every page change.
const SUMMARY_KEYS = ["search", "start_date", "end_date", "type", "office_guid"];

const StatPill = ({ icon, label, amounts, color, forceSign = false }) => (
  <Box
    sx={{
      height: 40,
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: 1.5,
      borderRadius: "10px",
      backgroundColor: (theme) => alpha(color(theme), 0.08),
      border: (theme) => `1px solid ${alpha(color(theme), 0.22)}`,
      color: (theme) => color(theme),
      whiteSpace: "nowrap",
      transition: "background-color 0.2s ease, border-color 0.2s ease",
    }}
  >
    {icon}
    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
      <Typography
        component="span"
        sx={{
          fontSize: "11.5px",
          fontWeight: 600,
          opacity: 0.85,
          textTransform: "uppercase",
          letterSpacing: "0.02em",
        }}
      >
        {label}:
      </Typography>
      <Typography
        component="span"
        sx={{
          fontSize: "13.5px",
          fontWeight: 750,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "-0.01em",
        }}
      >
        {amounts.map(({ currency, amount }, i) => (
          <span key={currency}>
            {i > 0 && " · "}
            {signed(amount, forceSign)}{" "}
            <Typography
              component="span"
              sx={{
                fontSize: "10.5px",
                fontWeight: 600,
                opacity: 0.8,
              }}
            >
              {currency}
            </Typography>
          </span>
        ))}
      </Typography>
    </Box>
  </Box>
);

const CafeteriaHeaderStats = ({ queryParams = {} }) => {
  const { t } = useLocale();

  const summaryParams = useMemo(
    () =>
      Object.fromEntries(
        SUMMARY_KEYS.filter((k) => queryParams[k] !== undefined && queryParams[k] !== "").map((k) => [k, queryParams[k]]),
      ),
    [queryParams],
  );

  const { data: summaryData } = useGet({
    apiFn: getCafeteriaSummaryApi,
    key: ["cafeteria-summary", summaryParams],
    params: summaryParams,
  });

  // TMT always; other currencies only when they have movements. Never summed together.
  const currencies = useMemo(() => {
    const byCurrency = summaryData?.currencies || {
      TMT: { totalIncome: summaryData?.totalIncome, totalExpense: summaryData?.totalExpense, balance: summaryData?.balance },
    };
    return Object.entries(byCurrency)
      .map(([currency, v]) => ({
        currency,
        income: Number(v?.totalIncome ?? 0),
        expense: Number(v?.totalExpense ?? 0),
        balance: Number(v?.balance ?? Number(v?.totalIncome ?? 0) - Number(v?.totalExpense ?? 0)),
      }))
      .filter((c) => c.currency === "TMT" || c.income || c.expense);
  }, [summaryData]);

  const pick = (field) => currencies.map((c) => ({ currency: c.currency, amount: c[field] }));
  const tmtBalance = currencies.find((c) => c.currency === "TMT")?.balance ?? 0;

  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        alignItems: "center",
        gap: 1.2,
      }}
    >
      <StatPill
        icon={<TrendingUpRoundedIcon sx={{ fontSize: 18 }} />}
        label={t("cafeteria.income")}
        amounts={pick("income")}
        color={(theme) => theme.palette.success.main}
        forceSign
      />

      <StatPill
        icon={<TrendingDownRoundedIcon sx={{ fontSize: 18 }} />}
        label={t("cafeteria.expense")}
        // Money going out is shown with a minus, as before.
        amounts={pick("expense").map((x) => ({ ...x, amount: -x.amount }))}
        color={(theme) => theme.palette.error.main}
      />

      <StatPill
        icon={<AccountBalanceWalletRoundedIcon sx={{ fontSize: 18 }} />}
        label={t("cafeteria.balance")}
        amounts={pick("balance")}
        color={(theme) =>
          tmtBalance >= 0 ? theme.palette.success.main : theme.palette.error.main
        }
        forceSign
      />
    </Box>
  );
};

export default memo(CafeteriaHeaderStats);
