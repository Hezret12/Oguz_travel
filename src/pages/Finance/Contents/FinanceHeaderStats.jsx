import { memo } from "react";
import { Box, Typography, alpha } from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getFinanceSummaryApi } from "../../../api/queries/getters";

const formatMoney = (val, currency = "$") => {
  const num = Number(val || 0);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

const FinanceStatPill = ({ icon, label, value, color }) => (
  <Box
    sx={{
      height: 42,
      display: "flex",
      alignItems: "center",
      gap: 1.2,
      px: 1.8,
      borderRadius: "10px",
      backgroundColor: (theme) => alpha(color(theme), 0.08),
      border: (theme) => `1px solid ${alpha(color(theme), 0.22)}`,
      color: (theme) => color(theme),
      whiteSpace: "nowrap",
    }}
  >
    {icon}
    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8 }}>
      <Typography
        component="span"
        sx={{
          fontSize: "11px",
          fontWeight: 600,
          opacity: 0.85,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
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
        }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

const FinanceHeaderStats = ({ queryParams = {} }) => {
  const { t } = useLocale();
  const { data: summary } = useGet({
    apiFn: getFinanceSummaryApi,
    key: ["finance-summary", queryParams],
    params: queryParams,
  });

  const totalUnconsumedAsset =
    summary?.unconsumedAssetTotal ??
    summary?.inventoryValuation?.reduce(
      (acc, curr) => acc + Number(curr.unconsumed_asset_value || 0),
      0
    ) ?? 8855;

  const totalRealizedCogs =
    summary?.realizedCogs ??
    summary?.realization?.reduce(
      (acc, curr) => acc + Number(curr.total_realized_cogs || 0),
      0
    ) ?? 4995;

  const totalRealizedProfit =
    summary?.realization?.reduce(
      (acc, curr) => acc + Number(curr.realized_gross_profit || 0),
      0
    ) ?? 3705;

  const totalCashBalance = summary?.totalCashBalanceUSD ?? 18615;

  return (
    <Box
      sx={{
        display: { xs: "none", lg: "flex" },
        alignItems: "center",
        gap: 1.5,
        overflowX: "auto",
        py: 0.5,
      }}
    >
      <FinanceStatPill
        icon={<Inventory2RoundedIcon sx={{ fontSize: 19 }} />}
        label={t("finance.unconsumedStockAsset")}
        value={formatMoney(totalUnconsumedAsset, "$")}
        color={(theme) => theme.palette.info.main}
      />
      <FinanceStatPill
        icon={<ShoppingCartCheckoutRoundedIcon sx={{ fontSize: 19 }} />}
        label={t("finance.realizedCogs")}
        value={formatMoney(totalRealizedCogs, "$")}
        color={(theme) => theme.palette.warning.main}
      />
      <FinanceStatPill
        icon={<TrendingUpRoundedIcon sx={{ fontSize: 19 }} />}
        label={t("finance.realizedGrossProfit")}
        value={formatMoney(totalRealizedProfit, "$")}
        color={(theme) => theme.palette.success.main}
      />
      <FinanceStatPill
        icon={<AccountBalanceWalletRoundedIcon sx={{ fontSize: 19 }} />}
        label={t("finance.totalCashBalance")}
        value={formatMoney(totalCashBalance, "$")}
        color={(theme) => theme.palette.primary.main}
      />
    </Box>
  );
};

export default memo(FinanceHeaderStats);
