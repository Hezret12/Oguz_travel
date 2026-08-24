import { memo } from "react";
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

const StatPill = ({ icon, label, value, color, prefix = "" }) => (
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
        {prefix}
        {value}{" "}
        <Typography
          component="span"
          sx={{
            fontSize: "10.5px",
            fontWeight: 600,
            opacity: 0.8,
          }}
        >
          TMT
        </Typography>
      </Typography>
    </Box>
  </Box>
);

const CafeteriaHeaderStats = ({ queryParams = {} }) => {
  const { t } = useLocale();

  const { data: summaryData } = useGet({
    apiFn: getCafeteriaSummaryApi,
    key: ["cafeteria-summary", queryParams],
    params: queryParams,
  });

  const totalIncome = Number(
    summaryData?.totalIncome ?? summaryData?.data?.totalIncome ?? 0
  );
  const totalExpense = Number(
    summaryData?.totalExpense ?? summaryData?.data?.totalExpense ?? 0
  );
  const balance = Number(
    summaryData?.balance ??
      summaryData?.data?.balance ??
      totalIncome - totalExpense
  );

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
        value={formatMoney(totalIncome)}
        color={(theme) => theme.palette.success.main}
        prefix="+"
      />

      <StatPill
        icon={<TrendingDownRoundedIcon sx={{ fontSize: 18 }} />}
        label={t("cafeteria.expense")}
        value={formatMoney(totalExpense)}
        color={(theme) => theme.palette.error.main}
        prefix="-"
      />

      <StatPill
        icon={<AccountBalanceWalletRoundedIcon sx={{ fontSize: 18 }} />}
        label={t("cafeteria.balance")}
        value={formatMoney(Math.abs(balance))}
        color={(theme) =>
          balance >= 0 ? theme.palette.success.main : theme.palette.error.main
        }
        prefix={balance < 0 ? "-" : balance > 0 ? "+" : ""}
      />
    </Box>
  );
};

export default memo(CafeteriaHeaderStats);
