import { Box } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useLocale } from "../../../hooks/useLocale";
import SectionCard, { EmptyState } from "../../Finance/Overview/Contents/SectionCard";
import {
  chartSx,
  formatAmount,
  tickLabelStyle,
  tooltipSlotProps,
  useDashboardColors,
  xAxisBase,
  yAxisBase,
} from "../../Finance/Overview/functions/analyticsFormat";
import { LegendStat, StatRow } from "./ChartParts";

const countFormat = (v) => Math.round(Number(v) || 0).toLocaleString("en-US");

// How many sales per day / month, the average ticket and the busiest bucket:
// is growth coming from more sales or from bigger ones? One series, named by
// the title, so it needs no legend.
const VolumeCard = ({ buckets, currency, granularity }) => {
  const { t } = useLocale();
  const colors = useDashboardColors();
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  const revenue = buckets.reduce((sum, b) => sum + b.revenue, 0);
  const peak = buckets.reduce((best, b) => (b.count > (best?.count ?? 0) ? b : best), null);

  return (
    <SectionCard title={t("dashboard.salesCount")} subtitle={t(`finance.analytics.trend.by.${granularity}`)}>
      <StatRow>
        <LegendStat label={t("finance.analytics.total")} value={countFormat(total)} />
        <LegendStat label={t("dashboard.avgSale")} value={total ? formatAmount(revenue / total, currency) : "—"} />
      </StatRow>

      {total === 0 ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : (
        <Box sx={{ mx: -1, mt: "auto" }}>
          <BarChart
            height={220}
            hideLegend
            skipAnimation
            borderRadius={3}
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
            grid={{ horizontal: true }}
            xAxis={[
              {
                ...xAxisBase,
                scaleType: "band",
                data: buckets.map((b) => b.label),
                categoryGapRatio: 0.3,
                tickLabelStyle: { ...tickLabelStyle, fontSize: 11 },
              },
            ]}
            yAxis={[{ ...yAxisBase, width: 36, tickNumber: 3, valueFormatter: countFormat }]}
            series={[
              {
                id: "count",
                label: t("dashboard.salesCount"),
                data: buckets.map((b) => b.count),
                color: colors.sale,
                valueFormatter: (v) => t("dashboard.salesN", { count: v ?? 0 }),
              },
            ]}
            sx={chartSx()}
            slotProps={tooltipSlotProps}
          />
        </Box>
      )}

      {peak && total > 0 && (
        <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
          {t("dashboard.peakPeriod", { label: peak.label, count: peak.count })}
        </Box>
      )}
    </SectionCard>
  );
};

export default VolumeCard;
