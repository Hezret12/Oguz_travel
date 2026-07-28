import { memo } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Skeleton,
  LinearProgress,
  alpha,
  useTheme,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import PieChartRoundedIcon from "@mui/icons-material/PieChartRounded";
import { useLocale } from "../../../../hooks/useLocale";

const ReportCharts = ({
  isLoading,
  isStatusLoading,
  barChartData,
  officeBreakdown = [],
  statusChartData = [],
  formatNumber,
  monthQuoted,
  teal,
  accent,
  borderCol,
  paperSx,
}) => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const noDataText = t("noData");

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr", lg: "1.3fr 1fr 1fr" },
        gap: 2,
      }}
    >
      {/* 1. Bar Chart: Daily Turnover */}
      <Paper sx={{ ...paperSx, p: { xs: 2, sm: 2.5 }, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShowChartRoundedIcon sx={{ color: teal, fontSize: 22 }} />
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: isDark ? "#FFF" : "#0F172A",
                  lineHeight: 1.2,
                }}
              >
                {t("report.turkishAirlines.dailyTurnoverChart")}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748B" }}
              >
                {t("report.turkishAirlines.dailyTurnoverSubtitle")}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`${t("report.turkishAirlines.total")}: ${formatNumber(monthQuoted)}`}
            size="small"
            sx={{
              backgroundColor: alpha(teal, 0.12),
              color: teal,
              fontWeight: 700,
              fontSize: 12,
              height: 26,
            }}
          />
        </Box>

        {isLoading ? (
          <Skeleton
            variant="rectangular"
            height={260}
            sx={{ borderRadius: 2 }}
          />
        ) : barChartData && barChartData.length > 0 && barChartData.some((d) => Number(d.value) > 0) ? (
          <Box sx={{ width: "100%", height: 260 }}>
            <BarChart
              dataset={barChartData}
              xAxis={[
                {
                  scaleType: "band",
                  dataKey: "day",
                  tickLabelStyle: {
                    fill: isDark ? "rgba(255,255,255,0.4)" : "#64748B",
                    fontSize: 11,
                  },
                },
              ]}
              yAxis={[
                {
                  tickLabelStyle: {
                    fill: isDark ? "rgba(255,255,255,0.4)" : "#64748B",
                    fontSize: 11,
                  },
                },
              ]}
              series={[{ dataKey: "value", color: teal, label: t("report.turkishAirlines.total") || "Ciro" }]}
              height={260}
              margin={{ top: 15, bottom: 25, left: 55, right: 15 }}
              slotProps={{ bar: { rx: 4, ry: 4 } }}
              sx={{
                "& .MuiChartsAxis-line": { stroke: borderCol },
                "& .MuiChartsAxis-tick": { stroke: borderCol },
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              height: 260,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: `1px dashed ${borderCol}`,
              borderRadius: 2,
              p: 2,
              textAlign: "center",
            }}
          >
            <ShowChartRoundedIcon sx={{ fontSize: 40, color: isDark ? "rgba(255,255,255,0.2)" : "#CBD5E1", mb: 1 }} />
            <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748B", fontWeight: 600 }}>
              {noDataText}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 2. Pie Chart: Status Breakdown */}
      <Paper sx={{ ...paperSx, p: { xs: 2, sm: 2.5 }, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <PieChartRoundedIcon sx={{ color: teal, fontSize: 22 }} />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: isDark ? "#FFF" : "#0F172A",
                lineHeight: 1.2,
              }}
            >
              {t("report.turkishAirlines.statusChart") || "Status grafikleri"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748B" }}
            >
              {t("report.turkishAirlines.statusChartSubtitle") || "Aýlyk status paýlanşygy"}
            </Typography>
          </Box>
        </Box>

        {isStatusLoading ? (
          <Skeleton
            variant="rectangular"
            height={260}
            sx={{ borderRadius: 2 }}
          />
        ) : statusChartData && statusChartData.length > 0 ? (
          <Box sx={{ width: "100%", height: 260, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            {statusChartData.some((d) => d.value > 0) ? (
              <PieChart
                series={[
                  {
                    data: statusChartData,
                    innerRadius: 35,
                    outerRadius: 80,
                    paddingAngle: 3,
                    cornerRadius: 4,
                    highlightScope: { faded: "global", highlighted: "item" },
                    faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
                    valueFormatter: (v) => `${v.value} (${v.percentage || ''})`,
                  },
                ]}
                height={260}
                margin={{ top: 10, bottom: 25, left: 10, right: 10 }}
                slotProps={{
                  legend: {
                    direction: "row",
                    position: { vertical: "bottom", horizontal: "middle" },
                    padding: 0,
                  },
                }}
                sx={{
                  "& .MuiChartsLegend-label": {
                    fontSize: "11px !important",
                    fill: isDark ? "rgba(255,255,255,0.7)" : "#475569",
                  },
                }}
              />
            ) : (
              <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5, px: 1, py: 2 }}>
                {statusChartData.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.2,
                      borderRadius: 1.5,
                      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                      border: `1px solid ${borderCol}`,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: item.color,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: isDark ? "#FFF" : "#0F172A",
                          fontSize: 13,
                        }}
                      >
                        {item.statusName || item.label}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: item.color,
                        fontSize: 13,
                      }}
                    >
                      {item.ticketCount} ({item.percentage})
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              height: 260,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: `1px dashed ${borderCol}`,
              borderRadius: 2,
              p: 2,
              textAlign: "center",
            }}
          >
            <PieChartRoundedIcon sx={{ fontSize: 40, color: isDark ? "rgba(255,255,255,0.2)" : "#CBD5E1", mb: 1 }} />
            <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748B", fontWeight: 600 }}>
              {noDataText}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 3. Office Distribution */}
      <Paper sx={{ ...paperSx, p: { xs: 2, sm: 2.5 }, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <StorefrontRoundedIcon sx={{ color: accent, fontSize: 22 }} />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: isDark ? "#FFF" : "#0F172A",
                lineHeight: 1.2,
              }}
            >
              {t("report.turkishAirlines.officeBreakdown") || "Ofisler boýunça paýy"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748B" }}
            >
              {t("report.turkishAirlines.officeBreakdownSubtitle") || "Toplam ciroya katkı oranları"}
            </Typography>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={42}
                sx={{ borderRadius: 1.5 }}
              />
            ))}
          </Box>
        ) : officeBreakdown && officeBreakdown.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {officeBreakdown.map((item) => (
              <Box key={item.office}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.6,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: item.color,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: isDark ? "#FFF" : "#0F172A",
                        fontSize: 13,
                      }}
                    >
                      {item.office}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: isDark ? "rgba(255,255,255,0.75)" : "#334155",
                      fontSize: 13,
                    }}
                  >
                    {formatNumber(item.totalQuoted)}{" "}
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 11,
                        color: item.color,
                        fontWeight: 700,
                        ml: 0.5,
                      }}
                    >
                      ({item.percentage})
                    </Typography>
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.barWidth}
                  sx={{
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "#F1F5F9",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 4,
                      backgroundColor: item.color,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              height: 260,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: `1px dashed ${borderCol}`,
              borderRadius: 2,
              p: 2,
              textAlign: "center",
            }}
          >
            <StorefrontRoundedIcon sx={{ fontSize: 40, color: isDark ? "rgba(255,255,255,0.2)" : "#CBD5E1", mb: 1 }} />
            <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748B", fontWeight: 600 }}>
              {noDataText}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default memo(ReportCharts);

