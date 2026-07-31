import { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Skeleton,
  Grid,
} from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";

import { useLocale } from "../../../../hooks/useLocale";
import { useQuery } from "@tanstack/react-query";
import { getTurkishQuarterApi } from "../../../../api/queries/getters";
import { formatNumber } from "../../../../functions/generalHelpers";

const QUARTER_NAMES = {
  1: "1-nji Çäryek (Q1: Ýan - Mar)",
  2: "2-nji Çäryek (Q2: Apr - Iýun)",
  3: "3-nji Çäryek (Q3: Iýul - Sen)",
  4: "4-nji Çäryek (Q4: Okt - Dek)",
};

export default function QuarterReportCard({ selectedQuarter, paperSx, teal }) {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const quarter = selectedQuarter || Math.floor(new Date().getMonth() / 3) + 1;

  const { data: quarterRes, isLoading } = useQuery({
    queryKey: ["turkish-quarter", quarter],
    queryFn: () => getTurkishQuarterApi({ quarter }),
  });

  const quarterInfo = useMemo(() => {
    if (!quarterRes) return null;
    const responseData = quarterRes?.data || {};
    const list = Array.isArray(responseData?.data) ? responseData.data : Array.isArray(responseData) ? responseData : [];

    const achievementStr = responseData?.achievement_percentage || "0%";
    const achievementNum = parseFloat(achievementStr.replace("%", "")) || 0;

    const sorted = [...list].sort((a, b) => Number(a.year) - Number(b.year));
    const prevYearData = sorted.length > 1 ? sorted[0] : null;
    const currYearData = sorted.length > 0 ? sorted[sorted.length - 1] : null;

    const prevProfit = Number(prevYearData?.profit) || 0;
    const currProfit = Number(currYearData?.profit) || 0;

    const prevQuoted = Number(prevYearData?.total_quoted_price) || 0;
    const currQuoted = Number(currYearData?.total_quoted_price) || 0;

    const prevBase = Number(prevYearData?.total_base_fare) || 0;
    const currBase = Number(currYearData?.total_base_fare) || 0;

    const profitGap = prevProfit - currProfit;
    const isCompleted = achievementNum >= 100 || profitGap <= 0;
    const remainingAmount = isCompleted ? 0 : profitGap;
    const remainingPercent = isCompleted ? 0 : Math.max(0, 100 - achievementNum);

    return {
      list: sorted,
      achievementNum,
      achievementStr,
      isCompleted,
      remainingAmount,
      remainingPercent,
      prevYearData,
      currYearData,
      prevProfit,
      currProfit,
      prevQuoted,
      currQuoted,
      prevBase,
      currBase,
      profitDiff: currProfit - prevProfit,
      quotedDiff: currQuoted - prevQuoted,
      baseDiff: currBase - prevBase,
    };
  }, [quarterRes]);

  return (
    <Paper sx={{ ...paperSx, p: { xs: 2, sm: 2.5 }, position: "relative", overflow: "hidden", height: "100%" }}>
      {/* Title Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              backgroundColor: alpha(teal, 0.15),
              color: teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EmojiEventsRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2 }}>
              {t("report.turkishAirlines.quarterReport") || "Çäryeklik Deňeşdirme we Maksat Hasabaty"}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {QUARTER_NAMES[quarter]}
            </Typography>
          </Box>
        </Box>

        {quarterInfo?.achievementStr && (
          <Chip
            label={`Görkeziji: ${quarterInfo.achievementStr}`}
            sx={{
              fontWeight: 800,
              fontSize: "0.82rem",
              backgroundColor: quarterInfo.isCompleted ? "#10B981" : teal,
              color: "#ffffff",
              borderRadius: "6px",
              height: 28,
            }}
          />
        )}
      </Box>

      {isLoading ? (
        <Box sx={{ py: 2 }}>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3, mb: 2 }} />
          <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* 1. Hero KPI Banner: Goal Progress & Remaining Gap */}
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              backgroundColor: quarterInfo?.isCompleted
                ? isDark
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(16, 185, 129, 0.05)"
                : isDark
                ? "rgba(20, 184, 166, 0.08)"
                : "rgba(14, 133, 132, 0.04)",
              border: "1.5px solid",
              borderColor: quarterInfo?.isCompleted
                ? "rgba(16, 185, 129, 0.3)"
                : isDark
                ? "rgba(20, 184, 166, 0.25)"
                : "rgba(14, 133, 132, 0.2)",
            }}
          >
            {/* Header Status Text */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {quarterInfo?.isCompleted ? (
                  <CheckCircleRoundedIcon sx={{ color: "#10B981", fontSize: 22 }} />
                ) : (
                  <HourglassTopRoundedIcon sx={{ color: isDark ? "#F59E0B" : "#D97706", fontSize: 22 }} />
                )}
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                  {quarterInfo?.isCompleted
                    ? "Maksat Doly Amala Aşyryldy!"
                    : "Geçen Çäryek Temasyna Galan Miktar:"}
                </Typography>
              </Box>

              <Chip
                label={
                  quarterInfo?.isCompleted
                    ? `+$${formatNumber(Math.abs(quarterInfo?.profitDiff))} Artykmaç`
                    : `-$${formatNumber(quarterInfo?.remainingAmount)} (${quarterInfo?.remainingPercent}% galýar)`
                }
                size="small"
                sx={{
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  backgroundColor: quarterInfo?.isCompleted ? "#10B981" : isDark ? "#F59E0B" : "#EF4444",
                  color: "#FFFFFF",
                  borderRadius: "6px",
                }}
              />
            </Box>

            {/* Progress Bar */}
            <LinearProgress
              variant="determinate"
              value={Math.min(100, quarterInfo?.achievementNum || 0)}
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 1.5,
                backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  backgroundColor: quarterInfo?.isCompleted ? "#10B981" : teal,
                },
              }}
            />

            {/* 3 Executive Stat Cards */}
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 4 }}>
                <Box sx={{ p: 1, borderRadius: "8px", bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", display: "block" }}>
                    Geçen Ýyl ({quarterInfo?.prevYearData?.year || 2025}) Peýda
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary", mt: 0.2 }}>
                    ${formatNumber(quarterInfo?.prevProfit)}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 4 }}>
                <Box sx={{ p: 1, borderRadius: "8px", bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", display: "block" }}>
                    Häzirki Ýyl ({quarterInfo?.currYearData?.year || 2026}) Peýda
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: teal, mt: 0.2 }}>
                    ${formatNumber(quarterInfo?.currProfit)}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 4 }}>
                <Box sx={{ p: 1, borderRadius: "8px", bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", display: "block" }}>
                    {quarterInfo?.isCompleted ? "Artykmaç Gazanç" : "Kalan Miktar (Galan)"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      color: quarterInfo?.isCompleted ? "#10B981" : "#EF4444",
                      mt: 0.2,
                    }}
                  >
                    {quarterInfo?.isCompleted
                      ? `+$${formatNumber(Math.abs(quarterInfo?.profitDiff))}`
                      : `-$${formatNumber(quarterInfo?.remainingAmount)}`}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* 2. Structured Year-over-Year Comparison Table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "10px",
              border: "1px solid",
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.02)" : "#FFFFFF",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC" }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Metrik (Görkeziji)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
                    {quarterInfo?.prevYearData?.year || 2025} Ýyl
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
                    {quarterInfo?.currYearData?.year || 2026} Ýyl
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
                    Üýtgeşme (Fark)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Base Fare Row */}
                <TableRow hover>
                  <TableCell sx={{ fontSize: "0.78rem", fontWeight: 600 }}>Maya Çykdajysy (Base)</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.78rem" }}>${formatNumber(quarterInfo?.prevBase)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.78rem", fontWeight: 700 }}>${formatNumber(quarterInfo?.currBase)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.78rem", fontWeight: 700, color: quarterInfo?.baseDiff >= 0 ? "#10B981" : "#EF4444" }}>
                    {quarterInfo?.baseDiff >= 0 ? `+$${formatNumber(quarterInfo?.baseDiff)}` : `-$${formatNumber(Math.abs(quarterInfo?.baseDiff))}`}
                  </TableCell>
                </TableRow>

                {/* Quoted Price Row */}
                <TableRow hover>
                  <TableCell sx={{ fontSize: "0.78rem", fontWeight: 600 }}>Satylgy Bahasy (Quoted)</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.78rem" }}>${formatNumber(quarterInfo?.prevQuoted)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.78rem", fontWeight: 700 }}>${formatNumber(quarterInfo?.currQuoted)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.78rem", fontWeight: 700, color: quarterInfo?.quotedDiff >= 0 ? "#10B981" : "#EF4444" }}>
                    {quarterInfo?.quotedDiff >= 0 ? `+$${formatNumber(quarterInfo?.quotedDiff)}` : `-$${formatNumber(Math.abs(quarterInfo?.quotedDiff))}`}
                  </TableCell>
                </TableRow>

                {/* Net Profit Row */}
                <TableRow hover sx={{ backgroundColor: isDark ? "rgba(20, 184, 166, 0.05)" : "rgba(14, 133, 132, 0.03)" }}>
                  <TableCell sx={{ fontSize: "0.8rem", fontWeight: 800, color: teal }}>Net Peýda (Profit)</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.8rem", fontWeight: 700 }}>${formatNumber(quarterInfo?.prevProfit)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.8rem", fontWeight: 800, color: teal }}>${formatNumber(quarterInfo?.currProfit)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.8rem", fontWeight: 800 }}>
                    <Chip
                      icon={quarterInfo?.profitDiff >= 0 ? <TrendingUpIcon sx={{ fontSize: "14px !important" }} /> : <TrendingDownIcon sx={{ fontSize: "14px !important" }} />}
                      label={`${quarterInfo?.profitDiff >= 0 ? "+" : "-"}$${formatNumber(Math.abs(quarterInfo?.profitDiff))}`}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "0.74rem",
                        fontWeight: 800,
                        backgroundColor: quarterInfo?.profitDiff >= 0 ? "#10B981" : "#EF4444",
                        color: "#FFFFFF",
                        "& .MuiChip-icon": { color: "#FFFFFF" },
                      }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Paper>
  );
}
