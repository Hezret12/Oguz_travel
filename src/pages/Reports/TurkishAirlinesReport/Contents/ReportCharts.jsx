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
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

const ReportCharts = ({
  isLoading,
  barChartData,
  officeBreakdown,
  formatNumber,
  monthQuoted,
  teal,
  accent,
  borderCol,
  paperSx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1.8fr 1fr" },
        gap: 2,
      }}
    >
      {/* Bar Chart: Daily Turnover */}
      <Paper sx={{ ...paperSx, p: { xs: 2, sm: 2.5 } }}>
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
                Günlük Ciro Graphiği
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748B" }}
              >
                Günlük toplam satış rakamları
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`Jemi: ${formatNumber(monthQuoted)}`}
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
        ) : (
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
              series={[{ dataKey: "value", color: teal, label: "Ciro" }]}
              height={260}
              margin={{ top: 15, bottom: 25, left: 55, right: 15 }}
              slotProps={{ bar: { rx: 4, ry: 4 } }}
              sx={{
                "& .MuiChartsAxis-line": { stroke: borderCol },
                "& .MuiChartsAxis-tick": { stroke: borderCol },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Office Distribution */}
      <Paper sx={{ ...paperSx, p: { xs: 2, sm: 2.5 } }}>
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
              Ofisler Boýunça Paýy
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748B" }}
            >
              Toplam ciroya katkı oranları
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
        ) : (
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
        )}
      </Paper>
    </Box>
  );
};

export default memo(ReportCharts);
