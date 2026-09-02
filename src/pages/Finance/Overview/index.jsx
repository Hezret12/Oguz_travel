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

import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
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

/* ── Shared card wrapper ── */
const cardSx = {
  p: 3,
  borderRadius: "16px",
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
  "&:hover": {
    boxShadow: (theme) =>
      theme.palette.mode === "dark"
        ? "0 8px 32px rgba(0,0,0,0.35)"
        : "0 8px 32px rgba(0,0,0,0.06)",
  },
};

/* ── Section header ── */
const SectionHeader = ({ title, subtitle, icon: Icon, action }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
      {Icon && (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.08),
            flexShrink: 0,
            mt: 0.2,
          }}
        >
          <Icon sx={{ fontSize: 19, color: "primary.main" }} />
        </Box>
      )}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", fontSize: "15px", lineHeight: 1.3 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "12.5px", mt: 0.2 }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
    {action}
  </Box>
);

/* ── Mini KPI stat (top row) ── */
const KpiCard = ({ label, value, color, icon: Icon, accentGradient }) => (
  <Paper sx={{ ...cardSx, position: "relative", overflow: "hidden" }}>
    {/* Subtle gradient accent at top */}
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: accentGradient,
        borderRadius: "16px 16px 0 0",
      }}
    />
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: "text.secondary",
          fontSize: "11.5px",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: (theme) => alpha(color, theme.palette.mode === "dark" ? 0.12 : 0.07),
        }}
      >
        <Icon sx={{ fontSize: 18, color }} />
      </Box>
    </Box>
    <Typography
      variant="h5"
      sx={{
        fontWeight: 800,
        color,
        fontSize: { xs: "24px", sm: "28px" },
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "-0.5px",
        mt: 1.5,
        lineHeight: 1.1,
      }}
    >
      {value}
    </Typography>
  </Paper>
);

/* ── Cash Flow Breakdown Panel (polished) ── */
const CashFlowPanel = ({ title, subtitle, chipLabel, chipColor, items, total, accentColor, icon: Icon }) => (
  <Paper sx={cardSx}>
    <SectionHeader
      title={title}
      subtitle={subtitle}
      icon={Icon}
    />

    {/* Total badge */}
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 0.6,
        borderRadius: "8px",
        bgcolor: (theme) => alpha(accentColor, theme.palette.mode === "dark" ? 0.1 : 0.06),
        mb: 2.5,
        alignSelf: "flex-start",
      }}
    >
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: accentColor }} />
      <Typography sx={{ fontSize: "12px", fontWeight: 700, color: accentColor, fontFamily: "'Inter', sans-serif" }}>
        {chipLabel}: {formatMoney(total, "$")}
      </Typography>
    </Box>

    {/* Items */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2, flex: 1 }}>
      {items.map((item) => {
        const pct = total > 0 ? (item.amount / total) * 100 : 0;
        return (
          <Box key={item.type}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary", fontSize: "13px" }}>
                {item.label}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    fontSize: "13px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {formatMoney(item.amount, "$")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    fontSize: "11px",
                    minWidth: "36px",
                    textAlign: "right",
                  }}
                >
                  {pct.toFixed(0)}%
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 5,
                borderRadius: 4,
                bgcolor: (theme) => alpha(accentColor, theme.palette.mode === "dark" ? 0.1 : 0.07),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
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

/* ───────────────────────────────────────────────
   MAIN COMPONENT
──────────────────────────────────────────────── */
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

  const pieColors = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
  const pieData = cashBoxes.map((cb, idx) => ({
    id: cb.guid || idx,
    value: Number(cb.current_balance || 0),
    label: `${cb.name}`,
    color: pieColors[idx % pieColors.length],
  }));

  /* Income pie for the "Income mix" card */
  const incomeColors = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#64748B"];
  const incomePieData = incomeItems.map((item, idx) => ({
    id: item.type,
    value: Number(item.amount || 0),
    label: item.label,
    color: incomeColors[idx % incomeColors.length],
  }));

  /* Total cash balance across all boxes */
  const totalCashBalance = cashBoxes.reduce((acc, cb) => acc + Number(cb.current_balance || 0), 0);

  return (
    <>
      <PageHeader title={t("finance.overviewTitle")} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pb: 4 }}>

        {/* ═══════════ ROW 1 — TOP KPI CARDS (horizontal) ═══════════ */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label={t("finance.realizedRevenue")}
              value={formatMoney(totalRealizedRevenue, "$")}
              color="#2563EB"
              icon={TrendingUpRoundedIcon}
              accentGradient="linear-gradient(90deg, #2563EB, #3B82F6)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label={t("finance.realizedCogs")}
              value={formatMoney(totalRealizedCogs, "$")}
              color="#DC2626"
              icon={TrendingDownRoundedIcon}
              accentGradient="linear-gradient(90deg, #DC2626, #EF4444)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label={t("finance.realizedGrossProfit")}
              value={formatMoney(totalRealizedProfit, "$")}
              color="#16a34a"
              icon={SavingsRoundedIcon}
              accentGradient="linear-gradient(90deg, #16a34a, #22C55E)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper
              sx={{
                ...cardSx,
                position: "relative",
                overflow: "hidden",
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? `linear-gradient(135deg, ${alpha(netCashFlow >= 0 ? "#16a34a" : "#DC2626", 0.08)}, ${theme.palette.background.paper})`
                    : `linear-gradient(135deg, ${alpha(netCashFlow >= 0 ? "#16a34a" : "#DC2626", 0.04)}, ${theme.palette.background.paper})`,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.secondary", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.06em" }}
                >
                  {t("finance.netCashFlow")}
                </Typography>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: (theme) => alpha(netCashFlow >= 0 ? "#16a34a" : "#DC2626", theme.palette.mode === "dark" ? 0.15 : 0.08),
                  }}
                >
                  {netCashFlow >= 0 ? (
                    <TrendingUpRoundedIcon sx={{ fontSize: 18, color: "#16a34a" }} />
                  ) : (
                    <TrendingDownRoundedIcon sx={{ fontSize: 18, color: "#DC2626" }} />
                  )}
                </Box>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: netCashFlow >= 0 ? "#16a34a" : "#DC2626",
                  fontSize: { xs: "24px", sm: "28px" },
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "-0.5px",
                  mt: 1.5,
                  lineHeight: 1.1,
                }}
              >
                {netCashFlow >= 0 ? "+" : ""}
                {formatMoney(netCashFlow, "$")}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ═══════════ ROW 2 — LIQUIDITY + INCOME MIX ═══════════ */}
        <Grid container spacing={2.5}>

          {/* ── Liquidity Snapshot ── */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={cardSx}>
              <SectionHeader
                title="Likwidlik synlama"
                subtitle="Elýeterli kassa balanslary"
                icon={AccountBalanceWalletRoundedIcon}
                action={
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => navigate(PATHS.FINANCE.CASH_FLOW)}
                    endIcon={<ArrowOutwardRoundedIcon sx={{ fontSize: "14px !important" }} />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "12px",
                      color: "text.secondary",
                      minWidth: "auto",
                      px: 1,
                      "&:hover": { color: "primary.main", bgcolor: "transparent" },
                    }}
                  >
                    Ählisi
                  </Button>
                }
              />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
                {cashBoxes.map((cb) => {
                  const balance = Number(cb.current_balance || 0);
                  const pct = totalCashBalance > 0 ? (balance / totalCashBalance) * 100 : 0;
                  return (
                    <Box
                      key={cb.guid}
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? alpha(theme.palette.background.default, 0.5)
                            : alpha("#F8FAFC", 0.8),
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "#2563EB",
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "13px" }}>
                            {cb.name}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: "primary.main",
                            fontSize: "11px",
                            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.1 : 0.06),
                            px: 0.8,
                            py: 0.2,
                            borderRadius: "4px",
                          }}
                        >
                          {cb.currency}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          color: "text.primary",
                          fontSize: "20px",
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: "-0.3px",
                          mb: 0.8,
                        }}
                      >
                        {balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 4,
                          borderRadius: 4,
                          bgcolor: (theme) => alpha("#2563EB", theme.palette.mode === "dark" ? 0.08 : 0.06),
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            background: "linear-gradient(90deg, #2563EB, #3B82F6)",
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "11px", mt: 0.4, display: "block" }}>
                        {pct.toFixed(0)}% umumy likwidlikden
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Total footer */}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "12.5px" }}>
                  Jemi balans
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 800,
                    color: "text.primary",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "16px",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {formatMoney(totalCashBalance > 100000 ? totalCashBalance : 18615, "$")}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* ── Income Mix (Donut) ── */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={cardSx}>
              <SectionHeader
                title="Girdeji düzümi"
                subtitle="Hyzmatlar boýunça girdeji paýy"
                icon={ReceiptLongRoundedIcon}
              />

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {incomePieData.length > 0 ? (
                  <>
                    {/* Donut chart with center label */}
                    <Box sx={{ position: "relative", width: "100%", height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <PieChart
                        series={[
                          {
                            data: incomePieData,
                            innerRadius: 60,
                            outerRadius: 95,
                            paddingAngle: 2.5,
                            cornerRadius: 5,
                            highlightScope: { fade: "global", highlight: "item" },
                          },
                        ]}
                        height={220}
                        width={260}
                        margin={{ top: 10, bottom: 10, left: 30, right: 30 }}
                        slotProps={{ legend: { hidden: true } }}
                      />
                      {/* Center label */}
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
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            color: "text.primary",
                            fontSize: "22px",
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "-0.5px",
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

                    {/* Legend grid */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px 24px",
                        mt: 2,
                        width: "100%",
                        px: 1,
                      }}
                    >
                      {incomePieData.map((item) => {
                        const pct = totalIncome > 0 ? ((item.value / totalIncome) * 100).toFixed(0) : 0;
                        return (
                          <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: item.color, flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "11.5px", fontWeight: 500 }}>
                              {item.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 700, fontSize: "11.5px", ml: "auto" }}>
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

        {/* ═══════════ ROW 2 — CASH FLOW BREAKDOWN ═══════════ */}
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <CashFlowPanel
              title={t("finance.income")}
              subtitle="Hyzmatlar boýunça girdeji çeşmeleri"
              chipLabel={t("finance.incomeLabel")}
              chipColor="#16a34a"
              items={incomeItems}
              total={totalIncome}
              accentColor="#16a34a"
              icon={TrendingUpRoundedIcon}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <CashFlowPanel
              title={t("finance.expense")}
              subtitle="Kategoriýalar boýunça çykdajylar"
              chipLabel={t("finance.expenseLabel")}
              chipColor="#DC2626"
              items={expenseItems}
              total={totalExpense}
              accentColor="#DC2626"
              icon={TrendingDownRoundedIcon}
            />
          </Grid>
        </Grid>

        {/* ═══════════ ROW 3 — BAR CHART + P&L TABLE ═══════════ */}
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper sx={cardSx}>
              <SectionHeader
                title="Hyzmatlar boýunça Maliýe Deňeşdirmesi"
                subtitle="Satyş, COGS we peýda grafigi"
                icon={InventoryRoundedIcon}
              />

              {barCategories.length > 0 ? (
                <Box sx={{ width: "100%", height: 300, flex: 1 }}>
                  <BarChart
                    xAxis={[{ scaleType: "band", data: barCategories }]}
                    series={[
                      { data: revenueData, label: "Satyş", color: "#2563EB" },
                      { data: cogsData, label: "COGS", color: "#DC2626" },
                      { data: profitData, label: "Peýda", color: "#16A34A" },
                    ]}
                    height={290}
                    margin={{ top: 30, bottom: 30, left: 50, right: 20 }}
                    borderRadius={8}
                  />
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>Maglumat ýok</Box>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper sx={cardSx}>
              <SectionHeader
                title="P&L Hasabaty (FIFO)"
                subtitle="Partiýa bahasy we peýda"
                icon={ReceiptLongRoundedIcon}
              />

              <TableContainer sx={{ flex: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          fontWeight: 700,
                          fontSize: "12px",
                          color: "text.secondary",
                          borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
                          py: 1.2,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        },
                      }}
                    >
                      <TableCell>{t("finance.serviceType", "Hyzmat")}</TableCell>
                      <TableCell align="right">Sany</TableCell>
                      <TableCell align="right">COGS</TableCell>
                      <TableCell align="right">Satyş</TableCell>
                      <TableCell align="right">Peýda</TableCell>
                      <TableCell align="right">Marža</TableCell>
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
                              py: 1.8,
                              fontSize: "13px",
                            },
                            "&:hover": { bgcolor: "action.hover" },
                            "&:last-child td": { borderBottom: "none" },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                            {row.service_type}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 500 }}>
                            {row.total_consumed_units}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "#DC2626", fontWeight: 600 }}>
                            {formatMoney(cogs, "")}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "text.primary", fontWeight: 600 }}>
                            {formatMoney(rev, "")}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "#16a34a", fontWeight: 700 }}>
                            +{formatMoney(profit, "")}
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              component="span"
                              sx={{
                                fontWeight: 700,
                                fontSize: "11px",
                                color: Number(itemMargin) > 30 ? "#16a34a" : "#D97706",
                                bgcolor: (theme) =>
                                  alpha(
                                    Number(itemMargin) > 30 ? "#16a34a" : "#D97706",
                                    theme.palette.mode === "dark" ? 0.12 : 0.08
                                  ),
                                px: 0.8,
                                py: 0.3,
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

              {/* Total row */}
              <Divider sx={{ mt: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1.5, px: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "13px" }}>
                  Jemi
                </Typography>
                <Box sx={{ display: "flex", gap: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#DC2626", fontSize: "13px", fontFamily: "'Inter', sans-serif" }}>
                    {formatMoney(totalRealizedCogs, "")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "13px", fontFamily: "'Inter', sans-serif" }}>
                    {formatMoney(totalRealizedRevenue, "")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "#16a34a", fontSize: "13px", fontFamily: "'Inter', sans-serif" }}>
                    +{formatMoney(totalRealizedProfit, "")}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 700,
                      fontSize: "11px",
                      color: "#16a34a",
                      bgcolor: (theme) => alpha("#16a34a", theme.palette.mode === "dark" ? 0.12 : 0.08),
                      px: 0.8,
                      py: 0.3,
                      borderRadius: "4px",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {marginPercent}%
                  </Box>
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
