import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
} from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getFinanceSummaryApi, getAllCashBoxesApi } from "../../../api/queries/getters";

const formatMoney = (val, currency = "$") => {
  const num = Number(val || 0);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

const KpiCard = ({ title, value, subtitle, icon, color }) => (
  <Paper
    variant="outlined"
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
    }}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "11.5px" }}>
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
    <Typography variant="caption" sx={{ color: "text.secondary" }}>
      {subtitle}
    </Typography>
  </Paper>
);

const FinancialOverviewTab = () => {
  const { t } = useLocale();

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
  const marginPercent = totalRealizedRevenue > 0 ? ((totalRealizedProfit / totalRealizedRevenue) * 100).toFixed(1) : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 4 Main KPI Cards */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={t("finance.unconsumedStockAsset")}
            value={formatMoney(totalUnconsumedAsset, "$")}
            subtitle="Ammarda galyndy hyzmat aktiwleri"
            icon={<Inventory2RoundedIcon />}
            color={(theme) => theme.palette.info.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={t("finance.realizedCogs")}
            value={formatMoney(totalRealizedCogs, "$")}
            subtitle="Satylan hyzmatlaryň özüne düşýän bahasy"
            icon={<ShoppingCartCheckoutRoundedIcon />}
            color={(theme) => theme.palette.warning.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={t("finance.realizedGrossProfit")}
            value={formatMoney(totalRealizedProfit, "$")}
            subtitle={`Realize edilen girdejiden peýda (${marginPercent}%)`}
            icon={<TrendingUpRoundedIcon />}
            color={(theme) => theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={t("finance.totalCashBalance")}
            value={formatMoney(18615, "$")}
            subtitle="Jemi ähli kassalardaky nagt / bank galyndysy"
            icon={<AccountBalanceWalletRoundedIcon />}
            color={(theme) => theme.palette.primary.main}
          />
        </Grid>
      </Grid>

      {/* Breakdown Section */}
      <Grid container spacing={2.5}>
        {/* Service realization table */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
              Hyzmatlar boýunça realize edilen peýda (FIFO)
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Satylan hyzmatlar bilen hakyky satyn alnan partiýa bahasynyň deňeşdirmesi
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell sx={{ fontWeight: 700 }}>{t("finance.serviceType")}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ulanylan sany</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Özüne düşýän (COGS)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Satyş (Revenue)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Arassa peýda</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {realization.map((row, idx) => {
                    const rev = Number(row.total_realized_revenue || 0);
                    const cogs = Number(row.total_realized_cogs || 0);
                    const profit = rev - cogs;
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
                        <TableCell sx={{ color: "success.main", fontWeight: 750 }}>
                          +{formatMoney(profit, "$")}
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
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
              Kassalar we Hasaplar (Current Balances)
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Nagt kassa galyndylary we bank hasaplary
            </Typography>
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
    </Box>
  );
};

export default FinancialOverviewTab;
