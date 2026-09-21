import { memo } from "react";
import { Box, Typography, Paper, alpha, Grid } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { useLocale } from "../../../../hooks/useLocale";

const formatPercent = (value) => `${Math.round(value)}%`;

// Share of `part` in `total` as a percentage, or null when there is nothing to divide by.
const shareOf = (part, total) => (total > 0 ? (part / total) * 100 : null);

const MetaPill = ({ color, children }) => (
  <Box
    component="span"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.3,
      px: 0.75,
      py: 0.2,
      borderRadius: "6px",
      fontSize: 11.5,
      fontWeight: 700,
      whiteSpace: "nowrap",
      color,
      bgcolor: alpha(color, 0.12),
    }}
  >
    {children}
  </Box>
);

const SummaryCard = memo(({ icon, value, label, meta, sublabel, color, paperSx }) => (
  <Paper
    sx={{
      ...paperSx,
      p: 2.25,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
      position: "relative",
      overflow: "hidden",
      borderLeft: `3px solid ${color}`,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          lineHeight: 1.4,
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: alpha(color, 0.12),
          color,
        }}
      >
        {icon}
      </Box>
    </Box>

    <Typography
      noWrap
      sx={{
        fontSize: { xs: 26, sm: 28 },
        fontWeight: 800,
        color: "text.primary",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      {value}
    </Typography>

    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: "auto", minHeight: 22 }}>
      {meta}
      <Typography noWrap sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 500, minWidth: 0 }}>
        {sublabel}
      </Typography>
    </Box>
  </Paper>
));

SummaryCard.displayName = "SummaryCard";

const ReportSummaryCards = ({
  stats,
  quarterComparison,
  formatCompact,
  paperSx,
  teal = "#0D9488",
  accent = "#0284C7",
  green = "#10B981",
  orange = "#F59E0B",
}) => {
  const { t } = useLocale();

  const quoted = Number(stats?.monthQuoted) || 0;
  const profit = Number(stats?.monthProfit) || 0;
  const credit = Number(stats?.monthCredit) || 0;
  const margin = shareOf(profit, quoted);
  const unpaid = shareOf(credit, quoted);

  const achievement = quarterComparison?.achievement ?? null;
  const growth = quarterComparison?.growth ?? null;
  const isUp = growth === null || growth >= 0;
  const growthColor = isUp ? green : "#EF4444";
  const GrowthIcon = isUp ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard
          icon={<AttachMoneyIcon sx={{ fontSize: 22 }} />}
          value={formatCompact(quoted)}
          label={t("columns.quotedFare")}
          meta={
            <MetaPill color={teal}>
              {t("report.turkishAirlines.dailyAvg")}: {formatCompact(stats?.dailyAvg ?? 0)}
            </MetaPill>
          }
          sublabel={t("report.turkishAirlines.sublabelQuoted")}
          color={teal}
          paperSx={paperSx}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard
          icon={<TrendingUpIcon sx={{ fontSize: 22 }} />}
          value={formatCompact(profit)}
          label={t("columns.profit")}
          meta={
            margin !== null && (
              <MetaPill color={green}>
                {t("report.turkishAirlines.margin")}: {formatPercent(margin)}
              </MetaPill>
            )
          }
          sublabel={t("report.turkishAirlines.sublabelProfit")}
          color={green}
          paperSx={paperSx}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard
          icon={<EmojiEventsRoundedIcon sx={{ fontSize: 22 }} />}
          value={achievement === null ? "—" : formatPercent(achievement)}
          label={t("report.turkishAirlines.achievementRate")}
          meta={
            growth !== null && (
              <MetaPill color={growthColor}>
                <GrowthIcon sx={{ fontSize: 14 }} />
                {growth >= 0 ? "+" : ""}
                {formatPercent(growth)}
              </MetaPill>
            )
          }
          sublabel={
            quarterComparison
              ? growth !== null
                ? t("report.turkishAirlines.vsYear", { year: quarterComparison.previous.year })
                : t("report.turkishAirlines.noBaseline", { year: quarterComparison.previous.year })
              : t("report.turkishAirlines.achievementSublabel")
          }
          color={accent}
          paperSx={paperSx}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard
          icon={<PendingActionsRoundedIcon sx={{ fontSize: 22 }} />}
          value={formatCompact(credit)}
          label={t("paymentCredit")}
          meta={
            unpaid !== null && credit > 0 && (
              <MetaPill color={orange}>{formatPercent(unpaid)}</MetaPill>
            )
          }
          sublabel={t("report.turkishAirlines.sublabelCredit")}
          color={orange}
          paperSx={paperSx}
        />
      </Grid>
    </Grid>
  );
};

export default memo(ReportSummaryCards);
