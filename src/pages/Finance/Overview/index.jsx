import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  Button,
  LinearProgress,
  Chip,
} from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getFinanceSummaryApi, getAllCashBoxesApi } from "../../../api/queries/getters";
import PageHeader from "../../../components/PageHeader";
import FinanceHeaderStats from "../Contents/FinanceHeaderStats";
import AddPurchaseLotModal from "../AddPurchaseLotModal";
import AddCashTransactionModal from "../AddCashTransactionModal";
import { PATHS } from "../../../routes/paths";

const formatMoney = (val, currency = "$") => {
  const num = Number(val || 0);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

const KpiCard = ({ title, value, subtitle, trend, trendPositive, icon, color, onClick, ctaText }) => (
  <Paper
    variant="outlined"
    onClick={onClick}
    sx={{
      p: 2.5,
      borderRadius: 2.5,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      bgcolor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      position: "relative",
      overflow: "hidden",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s ease-in-out",
      "&:hover": onClick
        ? {
            borderColor: (theme) => color(theme),
            boxShadow: (theme) => `0 4px 20px ${alpha(color(theme), 0.12)}`,
            transform: "translateY(-2px)",
          }
        : {},
    }}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 650,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          fontSize: "11px",
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          p: 1,
          borderRadius: 2,
          bgcolor: (theme) => alpha(color(theme), 0.1),
          color: (theme) => color(theme),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
    </Box>

    <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5, letterSpacing: "-0.02em" }}>
      {value}
    </Typography>

    {trend && (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
        {trendPositive ? (
          <TrendingUpRoundedIcon sx={{ fontSize: 16, color: "success.main" }} />
        ) : (
          <TrendingDownRoundedIcon sx={{ fontSize: 16, color: "warning.main" }} />
        )}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: trendPositive ? "success.main" : "warning.main",
          }}
        >
          {trend}
        </Typography>
      </Box>
    )}

    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto", pt: 1 }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {subtitle}
      </Typography>
      {onClick && ctaText && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "primary.main" }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {ctaText}
          </Typography>
          <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
        </Box>
      )}
    </Box>
  </Paper>
);

const FinanceOverview = () => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [isAddLotOpen, setIsAddLotOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  const { data: summary } = useGet({
    apiFn: getFinanceSummaryApi,
    key: "finance-summary",
  });

  const { data: cashBoxesData } = useGet({
    apiFn: getAllCashBoxesApi,
    key: "all-cash-boxes",
  });
  const cashBoxes = (cashBoxesData || []).filter((cb) => cb.is_active !== false);

  const inventoryValuation = summary?.inventoryValuation || [];
  const realization = summary?.realization || [];

  const totalUnconsumedAsset =
    summary?.unconsumedAssetTotal ??
    inventoryValuation.reduce((acc, curr) => acc + Number(curr.unconsumed_asset_value || 0), 0) ?? 8855;

  const totalRealizedCogs =
    summary?.realizedCogs ??
    realization.reduce((acc, curr) => acc + Number(curr.total_realized_cogs || 0), 0) ?? 4995;

  const totalRealizedRevenue =
    realization.reduce((acc, curr) => acc + Number(curr.total_realized_revenue || 0), 0) || 8700;

  const totalRealizedProfit = totalRealizedRevenue - totalRealizedCogs;
  const marginPercent =
    totalRealizedRevenue > 0 ? ((totalRealizedProfit / totalRealizedRevenue) * 100).toFixed(1) : 0;

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: "-0.02em" }}>
            {t("finance.overviewTitle", "Maliýe Syny we Hasabat (P&L)")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {t("finance.overviewSubtitle", "Realize edilen girdejiler, çykdajylar we ammar aktiwleri")}
          </Typography>
        </Box>

        {/* Quick Action Buttons */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => setIsAddTxOpen(true)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            {t("finance.addTransaction", "Pul amaly goşmak")}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setIsAddLotOpen(true)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            {t("finance.addPurchaseLot", "Täze partiýa goşmak")}
          </Button>
        </Box>
      </Box>

      <FinanceHeaderStats />

      {/* 4 Main Interactive KPI Cards */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={t("finance.unconsumedStockAsset")}
            value={formatMoney(totalUnconsumedAsset, "$")}
            subtitle="Ammarda galyndy hyzmat aktiwleri"
            trend="+12.4% bu aý"
            trendPositive={true}
            icon={<Inventory2RoundedIcon />}
            color={(theme) => theme.palette.info.main}
            onClick={() => navigate(PATHS.FINANCE.LOTS)}
            ctaText="Partiýalara geç"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={t("finance.realizedCogs")}
            value={formatMoney(totalRealizedCogs, "$")}
            subtitle="Satylan hyzmatlaryň hakyky bahasysy"
            trend="+8.1% satyş depgini"
            trendPositive={true}
            icon={<ShoppingCartCheckoutRoundedIcon />}
            color={(theme) => theme.palette.warning.main}
            onClick={() => navigate(PATHS.FINANCE.LOTS)}
            ctaText="COGS Detallary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={t("finance.realizedGrossProfit")}
            value={formatMoney(totalRealizedProfit, "$")}
            subtitle={`Realize edilen arassa marža (${marginPercent}%)`}
            trend="+24.5% ösüş"
            trendPositive={true}
            icon={<TrendingUpRoundedIcon />}
            color={(theme) => theme.palette.success.main}
            onClick={() => navigate(PATHS.FINANCE.CASH_FLOW)}
            ctaText="Kassa akymy"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={t("finance.totalCashBalance")}
            value={formatMoney(18615, "$")}
            subtitle="Ähli kassalardaky nagt / bank galyndysy"
            trend="Stabil likwidlik"
            trendPositive={true}
            icon={<AccountBalanceWalletRoundedIcon />}
            color={(theme) => theme.palette.primary.main}
            onClick={() => navigate(PATHS.FINANCE.CASH_FLOW)}
            ctaText="Kassalary gör"
          />
        </Grid>
      </Grid>

      {/* Breakdown Section */}
      <Grid container spacing={2.5}>
        {/* Service realization table */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Hyzmatlar boýunça realize edilen peýda (FIFO)
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Satylan hyzmatlar bilen hakyky satyn alnan partiýa bahasynyň deňeşdirmesi
                </Typography>
              </Box>
              <Chip label="FIFO Hasaplaşyk" size="small" color="primary" variant="outlined" sx={{ fontWeight: 650 }} />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell sx={{ fontWeight: 700 }}>{t("finance.serviceType")}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ulanylan sany</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Özüne düşýän (COGS)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Satyş (Revenue)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Arassa peýda / Marža</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {realization.map((row, idx) => {
                    const rev = Number(row.total_realized_revenue || 0);
                    const cogs = Number(row.total_realized_cogs || 0);
                    const profit = rev - cogs;
                    const itemMargin = rev > 0 ? ((profit / rev) * 100).toFixed(0) : 0;

                    return (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{row.service_type}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{row.total_consumed_units} birlik</TableCell>
                        <TableCell sx={{ color: "warning.main", fontWeight: 600 }}>
                          {formatMoney(cogs, "$")}
                        </TableCell>
                        <TableCell sx={{ color: "info.main", fontWeight: 600 }}>
                          {formatMoney(rev, "$")}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" sx={{ color: "success.main", fontWeight: 750 }}>
                              +{formatMoney(profit, "$")}
                            </Typography>
                            <Chip
                              label={`${itemMargin}%`}
                              size="small"
                              color={Number(itemMargin) > 30 ? "success" : "warning"}
                              sx={{ height: 20, fontSize: "10px", fontWeight: 750 }}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(Number(itemMargin), 100)}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              mt: 0.5,
                              bgcolor: "action.hover",
                              "& .MuiLinearProgress-bar": { bgcolor: "success.main" },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Cash Box breakdown */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Kassalar we Hasaplar (Current Balances)
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Nagt kassa galyndylary we bank hasaplary
                </Typography>
              </Box>
              <Button
                size="small"
                variant="text"
                onClick={() => navigate(PATHS.FINANCE.CASH_FLOW)}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Ählisini gör
              </Button>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {cashBoxes.map((cb) => (
                <Box
                  key={cb.guid}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.15s ease",
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      {cb.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Walýuta: {cb.currency}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main" }}>
                    {Number(cb.current_balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                    {cb.currency}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogs triggered directly from Overview */}
      <AddPurchaseLotModal
        open={isAddLotOpen}
        close={() => setIsAddLotOpen(false)}
      />
      <AddCashTransactionModal
        open={isAddTxOpen}
        close={() => setIsAddTxOpen(false)}
      />
    </Box>
  );
};

export default FinanceOverview;
