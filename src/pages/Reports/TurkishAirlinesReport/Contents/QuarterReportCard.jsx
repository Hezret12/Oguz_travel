import { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  alpha,
  Skeleton,
  Chip,
} from "@mui/material";
import PieChartRoundedIcon from "@mui/icons-material/PieChartRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { useLocale } from "../../../../hooks/useLocale";
import { useQuery } from "@tanstack/react-query";
import { getTurkishQuarterApi } from "../../../../api/queries/getters";
import { formatNumber } from "../../../../functions/generalHelpers";

export default function QuarterReportCard({ selectedQuarter, onQuarterChange, paperSx, teal = "#0D9488" }) {
  const { t } = useLocale();

  const quarter = selectedQuarter || Math.floor(new Date().getMonth() / 3) + 1;

  const { data: quarterRes, isLoading } = useQuery({
    queryKey: ["turkish-quarter", quarter],
    queryFn: () => getTurkishQuarterApi({ quarter }),
  });

  const qi = useMemo(() => {
    if (!quarterRes) return null;
    const rd = quarterRes?.data || {};
    const list = Array.isArray(rd?.data) ? rd.data : Array.isArray(rd) ? rd : [];

    const achStr = rd?.achievement_percentage || "0%";
    const achNum = parseFloat(achStr.replace("%", "")) || 0;

    const sorted = [...list].sort((a, b) => Number(a.year) - Number(b.year));
    const prev = sorted.length > 1 ? sorted[0] : null;
    const curr = sorted.length > 0 ? sorted[sorted.length - 1] || sorted[0] : null;

    const prevProfit = Number(prev?.profit) || 0;
    const currProfit = Number(curr?.profit) || 0;
    const diff = currProfit - prevProfit;
    const isUp = diff >= 0;

    return {
      achNum,
      achStr,
      prevYear: prev?.year || null,
      currYear: curr?.year || null,
      prevProfit,
      currProfit,
      diff,
      isUp,
      isDone: achNum >= 100,
    };
  }, [quarterRes]);

  const trendColor = qi?.isUp ? "#10B981" : "#EF4444";

  return (
    <Paper
      sx={{
        ...paperSx,
        p: { xs: 2, sm: 2.5 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: alpha(teal, 0.12),
              color: teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${alpha(teal, 0.18)}`,
            }}
          >
            <PieChartRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.9rem",
                lineHeight: 1.2,
                color: "text.primary",
              }}
            >
              {t("report.turkishAirlines.quarterReport")}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 600, mt: 0.2 }}>
              {t(`report.turkishAirlines.q${quarter}`)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {[1, 2, 3, 4].map((q) => {
            const isActive = quarter === q;
            return (
              <Chip
                key={q}
                label={`Q${q}`}
                size="small"
                onClick={() => onQuarterChange?.(q)}
                sx={{
                  fontWeight: 800,
                  fontSize: 11.5,
                  cursor: "pointer",
                  backgroundColor: isActive
                    ? teal
                    : (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.06)"
                          : "#F1F5F9",
                  color: isActive ? "#FFF" : "text.secondary",
                  border: (theme) =>
                    `1px solid ${
                      isActive
                        ? teal
                        : theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.08)"
                        : "#E2E8F0"
                    }`,
                  "&:hover": {
                    backgroundColor: isActive ? teal : alpha(teal, 0.12),
                    color: isActive ? "#FFF" : teal,
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Skeleton variant="rectangular" height={64} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Achievement Progress */}
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: 1,
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>
                {t("report.turkishAirlines.achievementRate")}
              </Typography>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: qi?.isDone ? "#10B981" : teal,
                  letterSpacing: "-0.02em",
                }}
              >
                {qi?.achStr || "0%"}
              </Typography>
            </Box>
            <Box
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.08)"
                    : "#E2E8F0",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${Math.min(100, qi?.achNum || 0)}%`,
                  borderRadius: 4,
                  backgroundColor: qi?.isDone ? "#10B981" : teal,
                  transition: "width 0.5s ease",
                }}
              />
            </Box>
          </Box>

          {/* Year-over-Year Profit Comparison */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              p: 2,
              borderRadius: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.03)"
                  : "#F8FAFC",
              border: (theme) =>
                `1px solid ${
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "#E2E8F0"
                }`,
            }}
          >
            {/* Previous Year */}
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600, mb: 0.5 }}>
                {qi?.prevYear || "—"}
              </Typography>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "text.primary",
                  letterSpacing: "-0.02em",
                }}
              >
                ${formatNumber(qi?.prevProfit)}
              </Typography>
            </Box>

            {/* Arrow + Trend */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                px: 1,
              }}
            >
              <ArrowForwardRoundedIcon
                sx={{ fontSize: 18, color: "text.secondary", transform: "rotate(-30deg)" }}
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.3,
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 1,
                  backgroundColor: alpha(trendColor, 0.1),
                }}
              >
                {qi?.isUp ? (
                  <TrendingUpRoundedIcon sx={{ fontSize: 14, color: trendColor }} />
                ) : (
                  <TrendingDownRoundedIcon sx={{ fontSize: 14, color: trendColor }} />
                )}
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: trendColor,
                    whiteSpace: "nowrap",
                  }}
                >
                  {qi?.isUp ? "+" : "-"}${formatNumber(Math.abs(qi?.diff || 0))}
                </Typography>
              </Box>
            </Box>

            {/* Current Year */}
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600, mb: 0.5 }}>
                {qi?.currYear || "—"}
              </Typography>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: teal,
                  letterSpacing: "-0.02em",
                }}
              >
                ${formatNumber(qi?.currProfit)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
