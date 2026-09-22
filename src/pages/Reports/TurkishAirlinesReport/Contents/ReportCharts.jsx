import { memo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  LinearProgress,
  Grid,
  alpha,
  useTheme,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import { MapPinHouse } from "lucide-react";
import PieChartRoundedIcon from "@mui/icons-material/PieChartRounded";
import { useLocale } from "../../../../hooks/useLocale";
import QuarterReportCard from "./QuarterReportCard";

const SectionTitle = ({ icon, title, subtitle, color, action }) => (
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
            color: "text.primary",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary" }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
    {action}
  </Box>
);

const EmptyState = ({ icon, text, borderCol }) => (
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
      sx={{ color: "text.secondary", fontWeight: 600 }}
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
  formatCompact,
  selectedQuarter,
  onQuarterChange,
  teal,
  accent,
  borderCol,
  paperSx,
}) => {
  const { t } = useLocale();
  const theme = useTheme();

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
            />

            {isLoading ? (
              <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 2 }} />
            ) : barChartData && barChartData.length > 0 && barChartData.some((d) => Number(d.value) > 0) ? (
              <Box sx={{ width: "100%", height: 240 }}>
                <BarChart
                  dataset={barChartData}
                  hideLegend
                  grid={{ horizontal: true }}
                  borderRadius={4}
                  xAxis={[
                    {
                      scaleType: "band",
                      dataKey: "day",
                      disableLine: true,
                      disableTicks: true,
                      categoryGapRatio: 0.35,
                      tickLabelStyle: { fill: theme.palette.text.secondary, fontSize: 10.5 },
                    },
                  ]}
                  yAxis={[
                    {
                      disableLine: true,
                      disableTicks: true,
                      valueFormatter: (v) => formatCompact(v),
                      tickLabelStyle: { fill: theme.palette.text.secondary, fontSize: 11 },
                    },
                  ]}
                  series={[
                    {
                      dataKey: "value",
                      color: teal,
                      label: t("report.turkishAirlines.total"),
                      valueFormatter: (v) => formatNumber(v),
                    },
                  ]}
                  height={240}
                  margin={{ top: 10, bottom: 5, left: 5, right: 10 }}
                  sx={{
                    "& .MuiChartsGrid-line": { stroke: borderCol, strokeDasharray: "4 4" },
                  }}
                />
              </Box>
            ) : (
              <EmptyState
                icon={<ShowChartRoundedIcon sx={{ fontSize: 40, color: "text.secondary", opacity: 0.3, mb: 1 }} />}
                text={noDataText}
                borderCol={borderCol}
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
            />

            {isStatusLoading ? (
              <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
            ) : statusChartData && statusChartData.length > 0 ? (
              <Grid
                container
                spacing={{ xs: 2.5, md: 3 }}
                sx={{ flex: 1, py: 1, width: "100%", m: 0, alignItems: "center" }}
              >
                {/* Left Column: Donut Chart with Centered Metric */}
                <Grid
                  size={{ xs: 12, sm: 5 }}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 190,
                      height: 190,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <PieChart
                      hideLegend
                      slotProps={{
                        legend: { hidden: true },
                      }}
                      series={[
                        {
                          data: (statusChartData.filter((d) => d.value > 0).length > 0
                            ? statusChartData.filter((d) => d.value > 0)
                            : [{ id: "empty", value: 1, color: theme.palette.divider }]
                          ).map((item) => ({
                            id: item.id,
                            value: item.value,
                            color: item.color,
                            label: "", // Empty to strictly prevent canvas legend rendering
                          })),
                          innerRadius: 54,
                          outerRadius: 82,
                          paddingAngle: 4,
                          cornerRadius: 6,
                          highlightScope: { faded: "global", highlighted: "item" },
                          faded: { innerRadius: 48, additionalRadius: -8, color: "gray" },
                        },
                      ]}
                      width={190}
                      height={190}
                      margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                      onHighlightChange={(item) => setHighlightedItem(item)}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: "text.primary",
                          lineHeight: 1.1,
                          fontSize: "1.45rem",
                        }}
                      >
                        {highlightedSlice ? highlightedSlice.value : totalStatusCount}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          display: "block",
                          mt: 0.2,
                        }}
                      >
                        {highlightedSlice
                          ? highlightedSlice.statusName
                          : (t("report.turkishAirlines.total") || "Jemi")}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Right Column: Status Items Breakdown with Percent Bars */}
                <Grid
                  size={{ xs: 12, sm: 7 }}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    p: { xs: 0, sm: "0 8px" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.2,
                      width: "100%",
                    }}
                  >
                    {statusChartData.map((item) => {
                      const pctNum = parseFloat(String(item.percentage ?? "0").replace("%", "")) || 0;
                      const isHighlighted = highlightedSlice?.id === item.id;
                      return (
                        <Box
                          key={item.id}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.75,
                            px: 1.5,
                            py: 1.1,
                            borderRadius: "10px",
                            border: 1,
                            borderColor: isHighlighted ? alpha(item.color, 0.5) : "divider",
                            backgroundColor: isHighlighted ? alpha(item.color, 0.08) : "transparent",
                            opacity: item.value > 0 ? 1 : 0.6,
                            transition: "background-color 0.15s ease, border-color 0.15s ease",
                            "&:hover": { backgroundColor: "action.hover" },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: item.color,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  color: "text.primary",
                                  fontSize: 13,
                                }}
                              >
                                {item.statusName}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  color: item.value > 0 ? item.color : "text.secondary",
                                  fontSize: 13,
                                }}
                              >
                                {item.value}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "text.secondary",
                                }}
                              >
                                ({item.percentage})
                              </Typography>
                            </Box>
                          </Box>

                          {/* Visual Progress Bar */}
                          <Box
                            sx={{
                              width: "100%",
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: "action.hover",
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${Math.min(pctNum, 100)}%`,
                                height: "100%",
                                backgroundColor: item.color,
                                borderRadius: 2,
                                transition: "width 0.5s ease-in-out",
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <EmptyState
                icon={<PieChartRoundedIcon sx={{ fontSize: 40, color: "text.secondary", opacity: 0.3, mb: 1 }} />}
                text={noDataText}
                borderCol={borderCol}
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
              icon={<MapPinHouse size={20} />}
              title={t("report.turkishAirlines.officeBreakdown") || "Ofisler boýunça paýy"}
              subtitle={t("report.turkishAirlines.officeBreakdownSubtitle") || "Toplam ciroya katkı oranları"}
              color={accent}
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
                  <Box key={item.key || item.office}>
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
                            color: "text.primary",
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
                          color: "text.secondary",
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
                        backgroundColor: "action.hover",
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
                icon={
                  <Box sx={{ display: "flex", color: "text.secondary", opacity: 0.3, mb: 1 }}>
                    <MapPinHouse size={40} />
                  </Box>
                }
                text={noDataText}
                borderCol={borderCol}
              />
            )}
          </Paper>
        </Grid>

        {/* Quarter Report Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <QuarterReportCard
            selectedQuarter={selectedQuarter}
            onQuarterChange={onQuarterChange}
            paperSx={paperSx}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(ReportCharts);

