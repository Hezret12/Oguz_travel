import { useMemo } from "react";
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
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";

import { useLocale } from "../../../hooks/useLocale";
import PageHeader from "../../../components/PageHeader";
import { PATHS } from "../../../routes/paths";
import { DEFAULT_FINANCE_SUMMARY, DEFAULT_CASH_BOXES } from "./mockData";

/* ── Helpers ── */
const formatMoney = (val, currency = "$") => {
  const num = Number(val || 0);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

const formatCompact = (val) => {
  const num = Number(val || 0);
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
  return `$${num.toFixed(0)}`;
};

/* ── Shared card style ── */
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

/* ═══════════════════════════════════════════════
   KPI CARD — clean, minimal stat card
═══════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════
   CASH FLOW BREAKDOWN — minimal list
═══════════════════════════════════════════════ */
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
                bgcolor: (theme) => alpha(accentColor, theme.palette.mode === "dark" ? 0.08 : 0.06),
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

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const FinanceOverview = () => {
  const { t } = useLocale();
  const navigate = useNavigate();

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

  const incomeItems = useMemo(() => summary?.incomeByType || [], [summary?.incomeByType]);
  const expenseItems = useMemo(() => summary?.expenseByType || [], [summary?.expenseByType]);

  const totalIncome = useMemo(
    () => incomeItems.reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [incomeItems]
  );
  const totalExpense = useMemo(
    () => expenseItems.reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [expenseItems]
  );
  const netCashFlow = totalIncome - totalExpense;

  const barCategories = realization.map((r) => r.service_type || "Service");
  const revenueData = realization.map((r) => Number(r.total_realized_revenue || 0));
  const cogsData = realization.map((r) => Number(r.total_realized_cogs || 0));
  const profitData = realization.map(
    (r) => Number(r.total_realized_revenue || 0) - Number(r.total_realized_cogs || 0)
  );

  const incomeColors = ["#3B82F6", "#0EA5E9", "#6366F1", "#8B5CF6", "#A855F7", "#94A3B8"];
  const incomePieData = incomeItems.map((item, idx) => ({
    id: item.type,
    value: Number(item.amount || 0),
    label: item.label,
    color: incomeColors[idx % incomeColors.length],
  }));

  const totalCashBalance = cashBoxes.reduce((acc, cb) => acc + Number(cb.current_balance || 0), 0);

  return (
    <>
      <PageHeader title={t("finance.overviewTitle")} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pb: 4 }}>

        {/* ═══ ROW 1 — KPI METRICS ═══ */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label={t("finance.realizedRevenue")}
              value={formatMoney(totalRealizedRevenue, "$")}
              change="Hyzmat satyşyndan"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label={t("finance.realizedCogs")}
              value={formatMoney(totalRealizedCogs, "$")}
              change="Hyzmat özüne düşýän baha"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label={t("finance.realizedGrossProfit")}
              value={formatMoney(totalRealizedProfit, "$")}
              change={`Marža: ${marginPercent}%`}
              changeType="up"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label={t("finance.netCashFlow")}
              value={`${netCashFlow >= 0 ? "+" : ""}${formatMoney(netCashFlow, "$")}`}
              change={`Girdeji: ${formatMoney(totalIncome, "")} — Çykdajy: ${formatMoney(totalExpense, "")}`}
              changeType={netCashFlow >= 0 ? "up" : "down"}
            />
          </Grid>
        </Grid>

        {/* ═══ ROW 2 — ACCOUNTS + INCOME MIX ═══ */}
        <Grid container spacing={2}>

          {/* Liquidity / Accounts */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={cardSx}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary", fontSize: "14px" }}>
                    Kassalar we hasaplar
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "12px" }}>
                    Elýeterli kassa balanslary
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
                  Ählisi
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
                          {pct.toFixed(0)}% jemiden
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
                  Jemi balans
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

          {/* Income Mix Donut */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={cardSx}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary", fontSize: "14px" }}>
                  Girdeji düzümi
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "12px" }}>
                  Hyzmatlar boýunça girdeji paýy
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
                    <Box sx={{ position: "relative", width: "100%", height: 210, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <PieChart
                        series={[
                          {
                            data: incomePieData,
                            innerRadius: 58,
                            outerRadius: 88,
                            paddingAngle: 2,
                            cornerRadius: 3,
                            highlightScope: { fade: "global", highlight: "item" },
                          },
                        ]}
                        height={210}
                        width={240}
                        margin={{ top: 5, bottom: 5, left: 20, right: 20 }}
                        slotProps={{ legend: { hidden: true } }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            fontSize: "20px",
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "-0.4px",
                            lineHeight: 1,
                          }}
                        >
                          {formatCompact(totalIncome)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "10px", fontWeight: 500 }}>
                          jemi girdeji
                        </Typography>
                      </Box>
                    </Box>

                    {/* Legend */}
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
                  <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>Maglumat ýok</Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* ═══ ROW 3 — INCOME / EXPENSE BREAKDOWN ═══ */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <CashFlowPanel
              title={t("finance.income")}
              items={incomeItems}
              total={totalIncome}
              accentColor="success.main"
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <CashFlowPanel
              title={t("finance.expense")}
              items={expenseItems}
              total={totalExpense}
              accentColor="error.main"
            />
          </Grid>
        </Grid>

        {/* ═══ ROW 4 — CHART + P&L TABLE ═══ */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper sx={cardSx}>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary", fontSize: "14px" }}>
                  Hyzmatlar boýunça deňeşdirme
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "12px" }}>
                  Satyş, COGS we peýda
                </Typography>
              </Box>

              {barCategories.length > 0 ? (
                <Box sx={{ width: "100%", height: 280, flex: 1 }}>
                  <BarChart
                    xAxis={[{ scaleType: "band", data: barCategories }]}
                    series={[
                      { data: revenueData, label: "Satyş", color: "#3B82F6" },
                      { data: cogsData, label: "COGS", color: "#EF4444" },
                      { data: profitData, label: "Peýda", color: "#22C55E" },
                    ]}
                    height={270}
                    margin={{ top: 30, bottom: 30, left: 50, right: 20 }}
                    borderRadius={4}
                  />
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>Maglumat ýok</Box>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper sx={cardSx}>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary", fontSize: "14px" }}>
                  P&L hasabaty (FIFO)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "12px" }}>
                  Partiýa bahasy we peýda
                </Typography>
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
                      <TableCell>{t("finance.serviceType", "Hyzmat")}</TableCell>
                      <TableCell align="right">Sany</TableCell>
                      <TableCell align="right">COGS</TableCell>
                      <TableCell align="right">Satyş</TableCell>
                      <TableCell align="right">Peýda</TableCell>
                      <TableCell align="right">%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {realization.map((row, idx) => {
                      const rev = Number(row.total_realized_revenue || 0);
                      const cogs = Number(row.total_realized_cogs || 0);
                      const profit = rev - cogs;
                      const itemMargin = rev > 0 ? ((profit / rev) * 100).toFixed(0) : 0;

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
                          <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                            {row.service_type}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "text.secondary" }}>
                            {row.total_consumed_units}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "error.main", fontWeight: 600 }}>
                            {formatMoney(cogs, "")}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "text.primary", fontWeight: 600 }}>
                            {formatMoney(rev, "")}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "success.main", fontWeight: 600 }}>
                            +{formatMoney(profit, "")}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600, fontSize: "11.5px" }}>
                            {itemMargin}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ mt: 0.5 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", pt: 1.5, px: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "12.5px" }}>
                  Jemi
                </Typography>
                <Box sx={{ display: "flex", gap: 2.5, alignItems: "baseline" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "error.main", fontSize: "12.5px", fontFamily: "'Inter', sans-serif" }}>
                    {formatMoney(totalRealizedCogs, "")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "12.5px", fontFamily: "'Inter', sans-serif" }}>
                    {formatMoney(totalRealizedRevenue, "")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "success.main", fontSize: "12.5px", fontFamily: "'Inter', sans-serif" }}>
                    +{formatMoney(totalRealizedProfit, "")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "11.5px" }}>
                    {marginPercent}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default FinanceOverview;
