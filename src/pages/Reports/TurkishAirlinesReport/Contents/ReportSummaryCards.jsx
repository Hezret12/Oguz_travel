import { memo } from "react";
import { Box, Typography, Paper, Chip, alpha, useTheme } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PriceCheckRoundedIcon from "@mui/icons-material/PriceCheckRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { useLocale } from "../../../../hooks/useLocale";

const SummaryCard = memo(
  ({ icon, value, label, sublabel, color, paperSx, isDark }) => (
    <Paper
      sx={{
        ...paperSx,
        p: 2.2,
        display: "flex",
        flexDirection: "column",
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
            color: isDark ? "#FFF" : "#0F172A",
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
            color: isDark ? "rgba(255,255,255,0.7)" : "#475569",
            fontSize: 13,
            mt: 0.3,
          }}
        >
          {label}
        </Typography>
        {sublabel && (
          <Typography
            variant="caption"
            sx={{
              color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8",
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
  teal,
  accent,
  green,
  orange,
}) => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: "repeat(3, 1fr)",
          lg: "repeat(5, 1fr)",
        },
        gap: 2,
      }}
    >
      <SummaryCard
        icon={<ReceiptLongRoundedIcon sx={{ fontSize: 24 }} />}
        value={formatCompact(stats.monthBase)}
        label={t("columns.baseFare")}
        sublabel={t("report.turkishAirlines.sublabelBase")}
        color={accent}
        paperSx={paperSx}
        isDark={isDark}
      />
      <SummaryCard
        icon={<AttachMoneyIcon sx={{ fontSize: 24 }} />}
        value={formatCompact(stats.monthQuoted)}
        label={t("columns.quotedFare")}
        sublabel={t("report.turkishAirlines.sublabelQuoted")}
        color={teal}
        paperSx={paperSx}
        isDark={isDark}
      />
      <SummaryCard
        icon={<TrendingUpIcon sx={{ fontSize: 24 }} />}
        value={formatCompact(stats.monthProfit)}
        label={t("report.turkishAirlines.profit") || t("columns.profit") || "Peýda"}
        sublabel={t("report.turkishAirlines.sublabelProfit") || "Aýlyk net peýda"}
        color={green}
        paperSx={paperSx}
        isDark={isDark}
      />
      <SummaryCard
        icon={<EmojiEventsRoundedIcon sx={{ fontSize: 24 }} />}
        value={achievementPercentage}
        label={t("report.turkishAirlines.achievementRate") || "Çäryek Maksady"}
        sublabel={t("report.turkishAirlines.achievementSublabel") || "Geçen çäryek temasy"}
        color="#059669"
        paperSx={paperSx}
        isDark={isDark}
      />
      <SummaryCard
        icon={<PendingActionsRoundedIcon sx={{ fontSize: 24 }} />}
        value={formatCompact(stats.monthCredit)}
        label={t("paymentCredit") || "Kredit (Ödenmedi)"}
        sublabel={t("report.turkishAirlines.sublabelCredit") || "Garaşylýan borç jemi"}
        color={orange}
        paperSx={paperSx}
        isDark={isDark}
      />
    </Box>
  );
};

export default memo(ReportSummaryCards);
