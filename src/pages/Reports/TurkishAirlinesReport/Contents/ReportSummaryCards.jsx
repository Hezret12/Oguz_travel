import { memo } from "react";
import { Box, Typography, Paper, Chip, alpha, Grid } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { useLocale } from "../../../../hooks/useLocale";

const SummaryCard = memo(
  ({ icon, value, label, sublabel, color, paperSx }) => (
    <Paper
      sx={{
        ...paperSx,
        p: 2.2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 1.2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.3)} 100%)`,
        },
        "&:hover": {
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: alpha(color, 0.12),
            color: color,
            border: `1px solid ${alpha(color, 0.15)}`,
            transition: "transform 0.2s ease",
          }}
        >
          {icon}
        </Box>
        <Chip
          label="THY"
          size="small"
          sx={{
            height: 20,
            fontSize: 10,
            fontWeight: 700,
            backgroundColor: alpha(color, 0.08),
            color: color,
            border: `1px solid ${alpha(color, 0.2)}`,
          }}
        />
      </Box>
      <Box sx={{ mt: 0.5 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            fontFamily: "'Inter', sans-serif",
            color: "text.primary",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: "text.secondary",
            fontSize: 13,
            mt: 0.5,
          }}
        >
          {label}
        </Typography>
        {sublabel && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              opacity: 0.75,
              fontSize: 11.5,
              display: "block",
              mt: 0.3,
            }}
          >
            {sublabel}
          </Typography>
        )}
      </Box>
    </Paper>
  )
);

SummaryCard.displayName = "SummaryCard";

const ReportSummaryCards = ({
  stats,
  achievementPercentage = "0%",
  formatCompact,
  paperSx,
  teal = "#0D9488",
  green = "#10B981",
  orange = "#F59E0B",
}) => {
  const { t } = useLocale();

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard
          icon={<AttachMoneyIcon sx={{ fontSize: 24 }} />}
          value={formatCompact(stats?.monthQuoted ?? 0)}
          label={t("columns.quotedFare")}
          sublabel={t("report.turkishAirlines.sublabelQuoted")}
          color={teal}
          paperSx={paperSx}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard
          icon={<TrendingUpIcon sx={{ fontSize: 24 }} />}
          value={formatCompact(stats?.monthProfit ?? 0)}
          label={t("columns.profit")}
          sublabel={t("report.turkishAirlines.sublabelProfit")}
          color={green}
          paperSx={paperSx}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard
          icon={<EmojiEventsRoundedIcon sx={{ fontSize: 24 }} />}
          value={achievementPercentage}
          label={t("report.turkishAirlines.achievementRate")}
          sublabel={t("report.turkishAirlines.achievementSublabel")}
          color="#059669"
          paperSx={paperSx}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard
          icon={<PendingActionsRoundedIcon sx={{ fontSize: 24 }} />}
          value={formatCompact(stats?.monthCredit ?? 0)}
          label={t("paymentCredit")}
          sublabel={t("report.turkishAirlines.sublabelCredit")}
          color={orange}
          paperSx={paperSx}
        />
      </Grid>
    </Grid>
  );
};

export default memo(ReportSummaryCards);
