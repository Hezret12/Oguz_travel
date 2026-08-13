import { memo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Skeleton,
  LinearProgress,
  Grid,
  alpha,
  useTheme,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PieChartRoundedIcon from "@mui/icons-material/PieChartRounded";
import { useLocale } from "../../../../hooks/useLocale";
import QuarterReportCard from "./QuarterReportCard";

const SectionTitle = ({ icon, title, subtitle, color, isDark, action }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 2,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          backgroundColor: alpha(color, 0.12),
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${alpha(color, 0.15)}`,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: isDark ? "#FFF" : "#0F172A",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748B" }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
    {action}
  </Box>
);

const EmptyState = ({ icon, text, borderCol, isDark }) => (
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
    {icon}
    <Typography
      variant="body2"
      sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748B", fontWeight: 600 }}
    >
      {text}
    </Typography>
  </Box>
);

const ReportCharts = ({
  isLoading,
  isStatusLoading,
  barChartData,
  officeBreakdown = [],
  statusChartData = [],
  formatNumber,
  monthQuoted,
  selectedQuarter,
  teal,
  accent,
  borderCol,
  paperSx,
}) => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const noDataText = t("noData");
  const [highlightedItem, setHighlightedItem] = useState(null);

  const totalStatusCount = statusChartData.reduce((sum, s) => sum + (s.value || 0), 0);
  const highlightedSlice = statusChartData.find((s) => s.id === highlightedItem?.id);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Row 1 */}
      <Grid container spacing={2.5}>
        {/* Bar Chart */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            sx={{
              ...paperSx,
              p: { xs: 2, sm: 2.5 },
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SectionTitle
              icon={<ShowChartRoundedIcon sx={{ fontSize: 20 }} />}
              title={t("report.turkishAirlines.dailyTurnoverChart")}
              subtitle={t("report.turkishAirlines.dailyTurnoverSubtitle")}
              color={teal}
              isDark={isDark}
              action={
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
              }
            />

            {isLoading ? (
              <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
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
                  series={[
                    {
                      dataKey: "value",
                      color: teal,
                      label: t("report.turkishAirlines.total") || "Ciro",
                      valueFormatter: (v) => formatNumber(v),
                    },
                  ]}
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
              <EmptyState
                icon={<ShowChartRoundedIcon sx={{ fontSize: 40, color: isDark ? "rgba(255,255,255,0.2)" : "#CBD5E1", mb: 1 }} />}
                text={noDataText}
                borderCol={borderCol}
                isDark={isDark}
              />
            )}
          </Paper>
        </Grid>

        {/* Pie Chart */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            sx={{
              ...paperSx,
              p: { xs: 2, sm: 2.5 },
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SectionTitle
              icon={<PieChartRoundedIcon sx={{ fontSize: 20 }} />}
              title={t("report.turkishAirlines.statusChart") || "Status grafikleri"}
              subtitle={t("report.turkishAirlines.statusChartSubtitle") || "Aylyk status paylashygy"}
              color={accent}
              isDark={isDark}
            />

            {isStatusLoading ? (
              <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
            ) : statusChartData && statusChartData.length > 0 ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                <Box sx={{ width: { xs: "100%", sm: 200 }, height: 230, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
                  <PieChart
                    series={[
                      {
                        data: statusChartData,
                        innerRadius: 48,
                        outerRadius: 82,
                        paddingAngle: 3,
                        cornerRadius: 5,
                        highlightScope: { faded: "global", highlighted: "item" },
                        faded: { innerRadius: 36, additionalRadius: -28, color: "gray" },
                        valueFormatter: (v) => `${v.value} (${v.percentage || ""})`,
                      },
                    ]}
                    height={230}
                    margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    slotProps={{ legend: { hidden: true } }}
                    onHighlightChange={(item) => setHighlightedItem(item)}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: { xs: "50%", sm: "100px" },
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: isDark ? "#FFF" : "#0F172A", lineHeight: 1 }}
                    >
                      {highlightedSlice ? highlightedSlice.value : totalStatusCount}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748B", fontSize: 11 }}
                    >
                      {highlightedSlice ? highlightedSlice.statusName : (t("report.turkishAirlines.total") || "Jemi")}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5, minWidth: { sm: 160 } }}>
                  {statusChartData.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        py: 0.5,
                        px: 1,
                        borderRadius: 1.5,
                        transition: "background-color 0.15s ease",
                        "&:hover": {
                          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: item.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: isDark ? "rgba(255,255,255,0.85)" : "#334155",
                            fontSize: 13,
                          }}
                        >
                          {item.statusName}
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
                        {item.value} ({item.percentage})
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <EmptyState
                icon={<PieChartRoundedIcon sx={{ fontSize: 40, color: isDark ? "rgba(255,255,255,0.2)" : "#CBD5E1", mb: 1 }} />}
                text={noDataText}
                borderCol={borderCol}
                isDark={isDark}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Row 2 */}
      <Grid container spacing={2.5}>
        {/* Office Distribution */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            sx={{
              ...paperSx,
              p: { xs: 2, sm: 2.5 },
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SectionTitle
              icon={<ApartmentIcon sx={{ fontSize: 20 }} />}
              title={t("report.turkishAirlines.officeBreakdown") || "Ofisler boýunça paýy"}
              subtitle={t("report.turkishAirlines.officeBreakdownSubtitle") || "Toplam ciroya katkı oranları"}
              color={accent}
              isDark={isDark}
            />

            {isLoading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={42} sx={{ borderRadius: 1.5 }} />
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
                            boxShadow: `0 0 8px ${alpha(item.color, 0.4)}`,
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
                        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          backgroundColor: item.color,
                          transition: "transform 0.3s ease",
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <EmptyState
                icon={<ApartmentIcon sx={{ fontSize: 40, color: isDark ? "rgba(255,255,255,0.2)" : "#CBD5E1", mb: 1 }} />}
                text={noDataText}
                borderCol={borderCol}
                isDark={isDark}
              />
            )}
          </Paper>
        </Grid>

        {/* Quarter Report Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <QuarterReportCard
            selectedQuarter={selectedQuarter}
            paperSx={paperSx}
            teal={teal}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(ReportCharts);
