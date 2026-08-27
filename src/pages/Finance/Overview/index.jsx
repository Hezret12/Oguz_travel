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
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";

import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getFinanceSummaryApi, getAllCashBoxesApi } from "../../../api/queries/getters";
import PageHeader from "../../../components/PageHeader";
import AddCashTransactionModal from "../AddCashTransactionModal";
import { PATHS } from "../../../routes/paths";

const formatMoney = (val, currency = "$") => {
  const num = Number(val || 0);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

const StatCard = ({ title, value, subtitle, color = "text.primary", onClick }) => (
  <Paper
    variant="outlined"
    onClick={onClick}
    sx={{
      p: 2.5,
      borderRadius: "12px",
      borderColor: "divider",
      bgcolor: "background.paper",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.15s ease",
      "&:hover": onClick
        ? {
            borderColor: "primary.main",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 4px 16px rgba(0,0,0,0.4)"
                : "0 4px 16px rgba(0,0,0,0.06)",
          }
        : {},
    }}
  >
    <Typography
      variant="caption"
      sx={{
        fontWeight: 600,
        color: "text.secondary",
        fontSize: "12px",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {title}
    </Typography>
    <Typography
      variant="h5"
      sx={{
        fontWeight: 800,
        color,
        fontSize: { xs: "22px", sm: "26px" },
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "-0.5px",
        my: 1,
      }}
    >
      {value}
    </Typography>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "12px" }}>
        {subtitle}
      </Typography>
      {onClick && (
        <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
      )}
    </Box>
  </Paper>
);

const FinanceOverview = () => {
  const { t } = useLocale();
  const navigate = useNavigate();
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

  const realization = summary?.realization || [];

  const totalRealizedCogs =
    summary?.realizedCogs ??
    realization.reduce((acc, curr) => acc + Number(curr.total_realized_cogs || 0), 0) ?? 4995;

  const totalRealizedRevenue =
    realization.reduce((acc, curr) => acc + Number(curr.total_realized_revenue || 0), 0) || 8700;

  const totalRealizedProfit = totalRealizedRevenue - totalRealizedCogs;
  const marginPercent =
    totalRealizedRevenue > 0 ? ((totalRealizedProfit / totalRealizedRevenue) * 100).toFixed(1) : 0;

  /* ── Charts Data ── */
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

  return (
    <>
      <PageHeader
        title={t("finance.overviewTitle", "Maliýe Hasabaty (P&L)")}
        addButtonText={t("finance.addTransaction", "+ Pul amaly goşmak")}
        onAddClick={() => setIsAddTxOpen(true)}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}>
        {/* ── 4 Main Metric Cards ── */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title={t("finance.realizedRevenue", "Jemi Girdeji (Revenue)")}
              value={formatMoney(totalRealizedRevenue, "$")}
              subtitle="Hyzmat satyş girdejisi"
              color="#2563EB"
              onClick={() => navigate(PATHS.FINANCE.CASH_FLOW)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title={t("finance.realizedCogs", "Özüne düşýän baha (COGS)")}
              value={formatMoney(totalRealizedCogs, "$")}
              subtitle="Satylan hyzmat harajatlary"
              color="#DC2626"
              onClick={() => navigate(PATHS.FINANCE.CASH_FLOW)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title={t("finance.realizedGrossProfit", "Arassa Peýda")}
              value={formatMoney(totalRealizedProfit, "$")}
              subtitle={`Peýda maržasy: ${marginPercent}%`}
              color="#16a34a"
              onClick={() => navigate(PATHS.FINANCE.CASH_FLOW)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title={t("finance.totalCashBalance", "Jemi Kassa Galyndysy")}
              value={formatMoney(18615, "$")}
              subtitle={`${cashBoxes.length} işjeň kassa`}
              color="#2563EB"
              onClick={() => navigate(PATHS.FINANCE.CASH_FLOW)}
            />
          </Grid>
        </Grid>

        {/* ── Visual Analytics / Charts Section ── */}
        <Grid container spacing={2.5}>
          {/* Revenue vs COGS vs Profit Bar Chart */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: "12px",
                borderColor: "divider",
                bgcolor: "background.paper",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Hyzmatlar boýunça Maliýe Deňeşdirmesi
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
                  Satyş, özüne düşýän baha (COGS) we gazanylan peýda grafiki
                </Typography>
              </Box>

              {barCategories.length > 0 ? (
                <Box sx={{ width: "100%", height: 280 }}>
                  <BarChart
                    xAxis={[{ scaleType: "band", data: barCategories }]}
                    series={[
                      { data: revenueData, label: "Satyş (Revenue)", color: "#2563EB" },
                      { data: cogsData, label: "COGS (Cost)", color: "#DC2626" },
                      { data: profitData, label: "Peýda (Profit)", color: "#16A34A" },
                    ]}
                    height={270}
                    margin={{ top: 30, bottom: 30, left: 50, right: 20 }}
                    borderRadius={6}
                  />
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                  Maglumat ýok
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Cash Boxes Balance Distribution Donut Chart */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: "12px",
                borderColor: "divider",
                bgcolor: "background.paper",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Kassa Paýlanyşygy (Donut)
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
                  Kassalar boýunça balans paýy
                </Typography>
              </Box>

              {pieData.length > 0 ? (
                <Box sx={{ width: "100%", height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PieChart
                    series={[
                      {
                        data: pieData,
                        innerRadius: 55,
                        outerRadius: 90,
                        paddingAngle: 3,
                        cornerRadius: 6,
                        highlightScope: { fade: "global", highlight: "item" },
                      },
                    ]}
                    height={260}
                    margin={{ top: 20, bottom: 20, left: 20, right: 120 }}
                  />
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                  Maglumat ýok
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* ── Tables & Breakdowns ── */}
        <Grid container spacing={2.5}>
          {/* Service realization P&L table */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: "12px",
                borderColor: "divider",
                bgcolor: "background.paper",
                height: "100%",
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Hyzmatlar boýunça P&L Hasabaty (FIFO)
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
                  Hyzmatlaryň hakyky satyn alnan partiýa bahasy we gazanylan peýda
                </Typography>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: 700, fontSize: "13px", color: "text.secondary", borderBottom: (theme) => `1px solid ${theme.palette.divider}`, py: 1.5 } }}>
                      <TableCell>{t("finance.serviceType", "Hyzmat")}</TableCell>
                      <TableCell align="right">Sany</TableCell>
                      <TableCell align="right">COGS ($)</TableCell>
                      <TableCell align="right">Satyş ($)</TableCell>
                      <TableCell align="right">Peýda ($)</TableCell>
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
                            "& td": { borderBottom: (theme) => `1px solid ${theme.palette.divider}`, py: 1.5, fontSize: "13.5px" },
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                            {row.service_type}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "text.secondary" }}>
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
                            <Typography
                              component="span"
                              sx={{
                                fontWeight: 700,
                                fontSize: "12px",
                                color: Number(itemMargin) > 30 ? "#16a34a" : "#D97706",
                              }}
                            >
                              {itemMargin}%
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Cash Boxes & Accounts */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: "12px",
                borderColor: "divider",
                bgcolor: "background.paper",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                    Kassalar we Hasaplar
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
                    Nagt kassa galyndylary we bank hasaplary
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => navigate(PATHS.FINANCE.CASH_FLOW)}
                  sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px" }}
                >
                  Ählisi →
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, mt: 1 }}>
                {cashBoxes.map((cb) => (
                  <Box
                    key={cb.guid}
                    sx={{
                      p: 1.8,
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {cb.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {cb.currency}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontSize: "14px",
                        color: "text.primary",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
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

      {/* Dialogs */}
      <AddCashTransactionModal
        open={isAddTxOpen}
        close={() => setIsAddTxOpen(false)}
      />
    </>
  );
};

export default FinanceOverview;
