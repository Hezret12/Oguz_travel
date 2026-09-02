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
  Button,
  LinearProgress,
  alpha,
  Divider,
} from "@mui/material";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { PieChart } from "@mui/x-charts/PieChart";

import { useLocale } from "../../../hooks/useLocale";
import PageHeader from "../../../components/PageHeader";
import { PATHS } from "../../../routes/paths";
import { DEFAULT_FINANCE_SUMMARY, DEFAULT_CASH_BOXES } from "./mockData";

const EXPENSE_COLORS = ["#EF4444", "#F59E0B", "#8B5CF6", "#64748B", "#0EA5E9", "#10B981"];
const INCOME_COLORS = ["#3B82F6", "#0EA5E9", "#6366F1", "#8B5CF6", "#A855F7", "#94A3B8"];

const formatMoney = (val, currency = "$") => {
  const num = Number(val || 0);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

const formatCompact = (val) => {
  const num = Number(val || 0);
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
  return `$${num.toFixed(0)}`;
};

const cardSx = {
  p: 2.5,
  borderRadius: "12px",
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

const KpiCard = ({ label, value, change, changeType = "neutral" }) => {
  const changeColor =
    changeType === "up" ? "success.main" : changeType === "down" ? "error.main" : "text.secondary";

  return (
    <Paper sx={cardSx}>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          fontSize: "12.5px",
          fontWeight: 500,
          mb: 1.5,
          lineHeight: 1.3,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 700,
          color: "text.primary",
          fontSize: { xs: "20px", sm: "24px" },
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "-0.4px",
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
      {change && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
          {changeType === "up" && <TrendingUpRoundedIcon sx={{ fontSize: 14, color: changeColor }} />}
          {changeType === "down" && <TrendingDownRoundedIcon sx={{ fontSize: 14, color: changeColor }} />}
          <Typography variant="caption" sx={{ color: changeColor, fontWeight: 600, fontSize: "11.5px" }}>
            {change}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};


const CashFlowPanel = ({ title, items, total, accentColor }) => (
  <Paper sx={cardSx}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 2 }}>
      <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary", fontSize: "14px" }}>
        {title}
      </Typography>
      <Typography
        sx={{
          fontWeight: 700,
          color: accentColor,
          fontSize: "16px",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "-0.3px",
        }}
      >
        {formatMoney(total, "$")}
      </Typography>
    </Box>

    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8, flex: 1 }}>
      {items.map((item) => {
        const pct = total > 0 ? (item.amount / total) * 100 : 0;
        return (
          <Box key={item.type}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.4 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary", fontSize: "13px" }}>
                {item.label}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "11px", fontWeight: 500 }}>
                  {pct.toFixed(0)}%
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.primary", fontSize: "12.5px", fontFamily: "'Inter', sans-serif", minWidth: "80px", textAlign: "right" }}
                >
                  {formatMoney(item.amount, "$")}
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 3,
                borderRadius: 2,
                bgcolor: (theme) => {
                  const resolved = accentColor.startsWith("#") ? accentColor : theme.palette.success.main;
                  return alpha(resolved, theme.palette.mode === "dark" ? 0.08 : 0.06);
                },
                "& .MuiLinearProgress-bar": {
                  borderRadius: 2,
                  bgcolor: accentColor,
                },
              }}
            />
          </Box>
        );
      })}
    </Box>
  </Paper>
);

const FinanceOverview = () => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [outflowMode, setOutflowMode] = useState("donut");

  const summary = DEFAULT_FINANCE_SUMMARY;
  const cashBoxes = DEFAULT_CASH_BOXES;
  const realization = summary?.realization || [];

  const totalRealizedCogs =
    summary?.realizedCogs ??
    realization.reduce((acc, curr) => acc + Number(curr.total_realized_cogs || 0), 0) ?? 4995;

  const totalRealizedRevenue =
    realization.reduce((acc, curr) => acc + Number(curr.total_realized_revenue || 0), 0) || 8700;

  const totalRealizedProfit = totalRealizedRevenue - totalRealizedCogs;
  const marginPercent =
    totalRealizedRevenue > 0 ? ((totalRealizedProfit / totalRealizedRevenue) * 100).toFixed(1) : 0;

  const incomeItems = summary?.incomeByType || [];
  const expenseItems = summary?.expenseByType || [];

  const totalIncome = incomeItems.reduce((acc, item) => acc + Number(item.amount || 0), 0);
  const totalExpense = expenseItems.reduce((acc, item) => acc + Number(item.amount || 0), 0);
  const netCashFlow = totalIncome - totalExpense;

  const getServiceInfo = (type) => {
    if (type === "VISA_SLOT") {
      return {
        title: t("finance.visaQuota"),
        subtitle: "Visa Slot Allotment",
      };
    }
    if (type === "HOTEL_ALLOTMENT") {
      return {
        title: t("finance.hotelAllotment"),
        subtitle: "Hotel Room Allotment",
      };
    }
    return { title: type, subtitle: "" };
  };

  const getCategoryLabel = (item) => {
    if (!item) return "";
    const key = `finance.categories.${item.type}`;
    const localized = t(key);
    return localized !== key ? localized : item.label;
  };

  const localizedIncomeItems = incomeItems.map((item) => ({
    ...item,
    label: getCategoryLabel(item),
  }));

  const localizedExpenseItems = expenseItems.map((item) => ({
    ...item,
    label: getCategoryLabel(item),
  }));

  const sortedExpenseItems = [...localizedExpenseItems].sort(
    (a, b) => Number(b.amount || 0) - Number(a.amount || 0)
  );

  const expensePieData = sortedExpenseItems.map((item, idx) => ({
    id: item.type,
    value: Number(item.amount || 0),
    label: item.label,
    color: EXPENSE_COLORS[idx % EXPENSE_COLORS.length],
  }));

  const incomePieData = localizedIncomeItems.map((item, idx) => ({
    id: item.type,
    value: Number(item.amount || 0),
    label: item.label,
    color: INCOME_COLORS[idx % INCOME_COLORS.length],
  }));

  const totalCashBalance = cashBoxes.reduce((acc, cb) => acc + Number(cb.current_balance || 0), 0);

  return (
    <>
      <PageHeader title={t("finance.overviewTitle")} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pb: 4 }}>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label={t("finance.realizedRevenue")}
              value={formatMoney(totalRealizedRevenue, "$")}
              change={t("finance.fromServiceSales")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label={t("finance.realizedCogs")}
              value={formatMoney(totalRealizedCogs, "$")}
              change={t("finance.serviceCostPrice")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label={t("finance.realizedGrossProfit")}
              value={formatMoney(totalRealizedProfit, "$")}
              change={`${t("finance.margin")}: ${marginPercent}%`}
              changeType="up"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label={t("finance.netCashFlow")}
              value={`${netCashFlow >= 0 ? "+" : ""}${formatMoney(netCashFlow, "$")}`}
              change={`${t("finance.income")}: ${formatMoney(totalIncome, "")} — ${t("finance.expense")}: ${formatMoney(totalExpense, "")}`}
              changeType={netCashFlow >= 0 ? "up" : "down"}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={cardSx}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary", fontSize: "14px" }}>
                    {t("finance.cashAndAccounts")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "12px" }}>
                    {t("finance.availableBalances")}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => navigate(PATHS.FINANCE.CASH_FLOW)}
                  endIcon={<ArrowOutwardRoundedIcon sx={{ fontSize: "13px !important" }} />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "12px",
                    color: "text.secondary",
                    px: 1,
                    "&:hover": { color: "primary.main", bgcolor: "transparent" },
                  }}
                >
                  {t("all")}
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0, flex: 1 }}>
                {cashBoxes.map((cb, idx) => {
                  const balance = Number(cb.current_balance || 0);
                  const pct = totalCashBalance > 0 ? (balance / totalCashBalance) * 100 : 0;
                  return (
                    <Box key={cb.guid}>
                      <Box sx={{ py: 1.8, px: 0.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary", fontSize: "13px" }}>
                            {cb.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: "text.primary",
                              fontSize: "14px",
                              fontFamily: "'Inter', sans-serif",
                              letterSpacing: "-0.2px",
                            }}
                          >
                            {balance.toLocaleString("en-US", { minimumFractionDigits: 2 })} {cb.currency}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 3,
                            borderRadius: 2,
                            bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                ? alpha("#64748B", 0.12)
                                : alpha("#94A3B8", 0.15),
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 2,
                              bgcolor: "primary.main",
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "11px", mt: 0.3, display: "block" }}>
                          {pct.toFixed(0)}% {t("finance.ofTotal")}
                        </Typography>
                      </Box>
                      {idx < cashBoxes.length - 1 && <Divider />}
                    </Box>
                  );
                })}
              </Box>

              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", px: 0.5 }}>
                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "12.5px" }}>
                  {t("finance.totalBalance")}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "15px",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {formatMoney(totalCashBalance > 100000 ? totalCashBalance : 18615, "$")}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={cardSx}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary", fontSize: "14px" }}>
                    {t("finance.pnlReportFifo")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "12px" }}>
                    {t("finance.pnlReportSubtitle")}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 1,
                    py: 0.3,
                    borderRadius: "6px",
                    bgcolor: (theme) => alpha("#10B981", theme.palette.mode === "dark" ? 0.12 : 0.08),
                  }}
                >
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#10B981" }}>
                    {t("finance.margin")}: {marginPercent}%
                  </Typography>
                </Box>
              </Box>

              <TableContainer sx={{ flex: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          fontWeight: 600,
                          fontSize: "11px",
                          color: "text.secondary",
                          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                          py: 1,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        },
                      }}
                    >
                      <TableCell>{t("finance.service")}</TableCell>
                      <TableCell align="right">{t("finance.quantity")}</TableCell>
                      <TableCell align="right">{t("finance.cogs")}</TableCell>
                      <TableCell align="right">{t("finance.sales")}</TableCell>
                      <TableCell align="right">{t("finance.profit")}</TableCell>
                      <TableCell align="right">{t("finance.margin")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {realization.map((row, idx) => {
                      const rev = Number(row.total_realized_revenue || 0);
                      const cogs = Number(row.total_realized_cogs || 0);
                      const profit = rev - cogs;
                      const itemMargin = rev > 0 ? ((profit / rev) * 100).toFixed(0) : 0;
                      const info = getServiceInfo(row.service_type);

                      return (
                        <TableRow
                          key={idx}
                          sx={{
                            "& td": {
                              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                              py: 1.5,
                              fontSize: "12.5px",
                            },
                            "&:hover": { bgcolor: "action.hover" },
                            "&:last-child td": { borderBottom: "none" },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "13px" }}>
                              {info.title}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 500 }}>
                            {row.total_consumed_units}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "#EF4444", fontWeight: 600 }}>
                            {formatMoney(cogs, "$")}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "text.primary", fontWeight: 600 }}>
                            {formatMoney(rev, "$")}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "#10B981", fontWeight: 700 }}>
                            +{formatMoney(profit, "$")}
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              component="span"
                              sx={{
                                fontWeight: 700,
                                fontSize: "11px",
                                color: "#10B981",
                                bgcolor: (theme) => alpha("#10B981", theme.palette.mode === "dark" ? 0.12 : 0.08),
                                px: 0.8,
                                py: 0.25,
                                borderRadius: "4px",
                              }}
                            >
                              {itemMargin}%
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: "10px",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.default, 0.6)
                      : alpha("#F8FAFC", 0.9),
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "13px" }}>
                    {t("finance.totalRealization")}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "10px", display: "block" }}>
                        {t("finance.cogs")}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#EF4444", fontSize: "12.5px" }}>
                        {formatMoney(totalRealizedCogs, "$")}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "10px", display: "block" }}>
                        {t("finance.sales")}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "12.5px" }}>
                        {formatMoney(totalRealizedRevenue, "$")}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "10px", display: "block" }}>
                        {t("finance.netProfit")}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "#10B981", fontSize: "13px" }}>
                        +{formatMoney(totalRealizedProfit, "$")}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={cardSx}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary", fontSize: "14px" }}>
                  {t("finance.incomeMix")}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "12px" }}>
                  {t("finance.incomeMixSubtitle")}
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {incomePieData.length > 0 ? (
                  <>
                    <Box
                      sx={{
                        position: "relative",
                        width: 200,
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                      }}
                    >
                      <PieChart
                        hideLegend
                        slots={{ legend: () => null }}
                        slotProps={{ legend: { hidden: true } }}
                        series={[
                          {
                            data: incomePieData.map((item) => ({
                              id: item.id,
                              value: item.value,
                              color: item.color,
                              label: "",
                            })),
                            innerRadius: 58,
                            outerRadius: 88,
                            paddingAngle: 2,
                            cornerRadius: 4,
                            highlightScope: { fade: "global", highlight: "item" },
                          },
                        ]}
                        height={200}
                        width={200}
                        margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          textAlign: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: "text.primary",
                            fontSize: "20px",
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "-0.5px",
                            lineHeight: 1.1,
                          }}
                        >
                          {formatCompact(totalIncome)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: "11px",
                            fontWeight: 500,
                            display: "block",
                            mt: 0.3,
                          }}
                        >
                          {t("finance.totalIncome")}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", mt: 2, width: "100%", px: 0.5 }}>
                      {incomePieData.map((item) => {
                        const pct = totalIncome > 0 ? ((item.value / totalIncome) * 100).toFixed(0) : 0;
                        return (
                          <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "2px", bgcolor: item.color, flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "11px", fontWeight: 500, flex: 1 }}>
                              {item.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 600, fontSize: "11px" }}>
                              {pct}%
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </>
                ) : (
                  <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>{t("noData")}</Box>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={cardSx}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary", fontSize: "14px" }}>
                    {t("finance.cashOutflowBreakdown")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "12px" }}>
                    {t("finance.outflowSubtitle")}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "inline-flex",
                    p: "2.5px",
                    borderRadius: "8px",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.background.default, 0.8)
                        : alpha(theme.palette.divider, 0.25),
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => setOutflowMode("donut")}
                    sx={{
                      py: 0.3,
                      px: 1.2,
                      fontSize: "11px",
                      fontWeight: outflowMode === "donut" ? 700 : 500,
                      textTransform: "none",
                      minWidth: "auto",
                      borderRadius: "6px",
                      bgcolor: outflowMode === "donut" ? "background.paper" : "transparent",
                      color: outflowMode === "donut" ? "text.primary" : "text.secondary",
                      boxShadow: outflowMode === "donut" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                      "&:hover": {
                        bgcolor: outflowMode === "donut" ? "background.paper" : "transparent",
                      },
                    }}
                  >
                    {t("finance.donutView")}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setOutflowMode("bars")}
                    sx={{
                      py: 0.3,
                      px: 1.2,
                      fontSize: "11px",
                      fontWeight: outflowMode === "bars" ? 700 : 500,
                      textTransform: "none",
                      minWidth: "auto",
                      borderRadius: "6px",
                      bgcolor: outflowMode === "bars" ? "background.paper" : "transparent",
                      color: outflowMode === "bars" ? "text.primary" : "text.secondary",
                      boxShadow: outflowMode === "bars" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                      "&:hover": {
                        bgcolor: outflowMode === "bars" ? "background.paper" : "transparent",
                      },
                    }}
                  >
                    {t("finance.barsView")}
                  </Button>
                </Box>
              </Box>

              {outflowMode === "donut" ? (
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: 200,
                      height: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                    }}
                  >
                    <PieChart
                      hideLegend
                      slots={{ legend: () => null }}
                      slotProps={{ legend: { hidden: true } }}
                      series={[
                        {
                          data: expensePieData.map((item) => ({
                            id: item.id,
                            value: item.value,
                            color: item.color,
                            label: "",
                          })),
                          innerRadius: 58,
                          outerRadius: 88,
                          paddingAngle: 2,
                          cornerRadius: 4,
                          highlightScope: { fade: "global", highlight: "item" },
                        },
                      ]}
                      height={200}
                      width={200}
                      margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#EF4444",
                          fontSize: "20px",
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: "-0.5px",
                          lineHeight: 1.1,
                        }}
                      >
                        {formatCompact(totalExpense)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: "11px",
                          fontWeight: 500,
                          display: "block",
                          mt: 0.3,
                        }}
                      >
                        {t("finance.totalExpense")}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", mt: 2, width: "100%", px: 0.5 }}>
                    {expensePieData.map((item) => {
                      const pct = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(0) : 0;
                      return (
                        <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "2px", bgcolor: item.color, flexShrink: 0 }} />
                          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "11px", fontWeight: 500, flex: 1 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 600, fontSize: "11px" }}>
                            {pct}%
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1, justifyContent: "center" }}>
                  {sortedExpenseItems.map((item, idx) => {
                    const pct = totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0;
                    const color = EXPENSE_COLORS[idx % EXPENSE_COLORS.length];
                    return (
                      <Box key={item.type}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.4 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: color, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "12.5px" }}>
                              {item.label}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Typography
                              sx={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color,
                                bgcolor: (theme) => alpha(color, theme.palette.mode === "dark" ? 0.12 : 0.08),
                                px: 0.8,
                                py: 0.15,
                                borderRadius: "4px",
                              }}
                            >
                              {pct.toFixed(1)}%
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: "text.primary",
                                fontSize: "13px",
                                fontFamily: "'Inter', sans-serif",
                                minWidth: "85px",
                                textAlign: "right",
                              }}
                            >
                              {formatMoney(item.amount, "$")}
                            </Typography>
                          </Box>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            bgcolor: (theme) => alpha(color, theme.palette.mode === "dark" ? 0.08 : 0.06),
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 2,
                              bgcolor: color,
                            },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <CashFlowPanel
              title={t("finance.income")}
              items={localizedIncomeItems}
              total={totalIncome}
              accentColor="#22C55E"
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <CashFlowPanel
              title={t("finance.expense")}
              items={localizedExpenseItems}
              total={totalExpense}
              accentColor="#EF4444"
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default FinanceOverview;
