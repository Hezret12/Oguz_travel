import { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  alpha,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import PieChartRoundedIcon from "@mui/icons-material/PieChartRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";

import { useLocale } from "../../../../hooks/useLocale";
import { useQuery } from "@tanstack/react-query";
import { getTurkishQuarterApi } from "../../../../api/queries/getters";
import { formatNumber } from "../../../../functions/generalHelpers";
import {
  QUARTERS,
  normalizeQuarter,
  formatUsd,
  buildQuarterComparison,
} from "../functions/quarter";

const formatPercent = (value) => `${Math.round(value)}%`;

const YearTile = ({ year, profit, revenue, highlighted, badge, revenueLabel, profitLabel }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      p: 1.75,
      borderRadius: 2,
      border: 1,
      borderColor: highlighted ? (th) => alpha(th.palette.primary.main, 0.35) : "divider",
      bgcolor: highlighted ? (th) => alpha(th.palette.primary.main, 0.06) : "action.hover",
      display: "flex",
      flexDirection: "column",
      gap: 0.75,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: highlighted ? "primary.main" : "text.secondary" }}>
        {year}
      </Typography>
      {badge}
    </Box>
    <Box>
      <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600 }}>{profitLabel}</Typography>
      <Typography
        noWrap
        sx={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: highlighted ? "primary.main" : "text.primary",
        }}
      >
        {formatUsd(profit, formatNumber)}
      </Typography>
    </Box>
    <Typography noWrap sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 500 }}>
      {revenueLabel}: <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>{formatUsd(revenue, formatNumber)}</Box>
    </Typography>
  </Box>
);

export default function QuarterReportCard({ selectedQuarter, onQuarterChange, paperSx }) {
  const { t } = useLocale();
  const quarter = normalizeQuarter(selectedQuarter);

  const { data: quarterRes, isLoading } = useQuery({
    queryKey: ["turkish-quarter", quarter],
    queryFn: () => getTurkishQuarterApi({ quarter }),
  });

  const qi = useMemo(() => buildQuarterComparison(quarterRes?.data), [quarterRes]);

  const trendColor = qi.isUp ? "success.main" : "error.main";
  const TrendIcon = qi.isUp ? TrendingUpRoundedIcon : TrendingDownRoundedIcon;
  const progress = qi.achievement === null ? 0 : Math.min(100, Math.max(0, qi.achievement));

  const growthBadge = (qi.current.hasData || qi.previous.hasData) && (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.3,
        px: 0.75,
        py: 0.2,
        borderRadius: 1,
        color: trendColor,
        bgcolor: (th) => alpha(qi.isUp ? th.palette.success.main : th.palette.error.main, 0.12),
      }}
    >
      <TrendIcon sx={{ fontSize: 14 }} />
      <Typography sx={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
        {qi.growth !== null
          ? `${qi.growth >= 0 ? "+" : ""}${formatPercent(qi.growth)}`
          : `${qi.diff >= 0 ? "+" : ""}${formatUsd(qi.diff, formatNumber)}`}
      </Typography>
    </Box>
  );

  const handleQuarterChange = (_, value) => {
    if (value !== null) onQuarterChange?.(value);
  };

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 2,
              bgcolor: (th) => alpha(th.palette.primary.main, 0.12),
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: (th) => `1px solid ${alpha(th.palette.primary.main, 0.18)}`,
            }}
          >
            <PieChartRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2, color: "text.primary" }}>
              {t("report.turkishAirlines.quarterReport")}
            </Typography>
            <Typography noWrap sx={{ fontSize: 12, color: "text.secondary", fontWeight: 600, mt: 0.2 }}>
              Q{quarter} · {t(`report.turkishAirlines.quarterMonths.q${quarter}`)} · {qi.previous.year} → {qi.current.year}
            </Typography>
          </Box>
        </Box>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={quarter}
          onChange={handleQuarterChange}
          aria-label={t("report.turkishAirlines.selectQuarter")}
          sx={{
            bgcolor: "action.hover",
            borderRadius: 2,
            p: 0.4,
            gap: 0.4,
            "& .MuiToggleButton-root": {
              border: 0,
              borderRadius: "6px !important",
              px: 1.25,
              py: 0.35,
              fontSize: 11.5,
              fontWeight: 800,
              color: "text.secondary",
              "&.Mui-selected, &.Mui-selected:hover": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
              },
            },
          }}
        >
          {QUARTERS.map((q) => (
            <ToggleButton key={q} value={q}>
              Q{q}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {isLoading ? (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Skeleton variant="rectangular" height={64} sx={{ borderRadius: 2 }} />
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 2, flex: 1 }} />
            <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 2, flex: 1 }} />
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Goal achievement: current-year profit against previous-year profit */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1, mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>
                  {t("report.turkishAirlines.achievementRate")}
                </Typography>
                {qi.isGoalReached && (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.3,
                      px: 0.75,
                      py: 0.1,
                      borderRadius: 1,
                      color: "success.main",
                      bgcolor: (th) => alpha(th.palette.success.main, 0.12),
                    }}
                  >
                    <EmojiEventsRoundedIcon sx={{ fontSize: 13 }} />
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700 }}>
                      {t("report.turkishAirlines.goalReached")}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: qi.isGoalReached ? "success.main" : qi.hasBaseline ? "primary.main" : "text.secondary",
                }}
              >
                {qi.achievement === null ? "—" : formatPercent(qi.achievement)}
              </Typography>
            </Box>
            <Box sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover", overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%",
                  width: `${progress}%`,
                  borderRadius: 4,
                  bgcolor: qi.isGoalReached ? "success.main" : "primary.main",
                  transition: "width 0.5s ease",
                }}
              />
            </Box>
            <Typography sx={{ mt: 0.75, fontSize: 11.5, color: "text.secondary", fontWeight: 500 }}>
              {qi.hasBaseline
                ? `${formatUsd(qi.current.profit, formatNumber)} / ${formatUsd(qi.previous.profit, formatNumber)}`
                : t("report.turkishAirlines.noBaseline", { year: qi.previous.year })}
            </Typography>
          </Box>

          {/* Year-over-year profit comparison */}
          <Box sx={{ display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
            <YearTile
              year={qi.previous.year}
              profit={qi.previous.profit}
              revenue={qi.previous.revenue}
              profitLabel={t("report.turkishAirlines.profit")}
              revenueLabel={t("report.turkishAirlines.quotedPrice")}
            />
            <YearTile
              highlighted
              year={qi.current.year}
              profit={qi.current.profit}
              revenue={qi.current.revenue}
              profitLabel={t("report.turkishAirlines.profit")}
              revenueLabel={t("report.turkishAirlines.quotedPrice")}
              badge={growthBadge}
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
}
