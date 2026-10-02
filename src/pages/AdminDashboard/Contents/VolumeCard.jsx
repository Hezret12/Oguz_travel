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
import { BOTH_CURRENCIES } from "../../Finance/Overview/functions/dashboardData";
import { LegendStat, StatRow } from "./ChartParts";

const countFormat = (v) => Math.round(Number(v) || 0).toLocaleString("en-US");

// How many sales per day / month, the average ticket and the busiest bucket:
// is growth coming from more sales or from bigger ones? One series, named by
// the title, so it needs no legend. The count is currency-free (a sale priced
// in both currencies is one sale); the average ticket is per currency, over
// that currency's own sales.
const VolumeCard = ({ buckets, granularity }) => {
  const { t } = useLocale();
  const colors = useDashboardColors();
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  const peak = buckets.reduce((best, b) => (b.count > (best?.count ?? 0) ? b : best), null);
  const avgSale = BOTH_CURRENCIES.map((currency) => {
    const revenue = buckets.reduce((sum, b) => sum + b[currency].revenue, 0);
    const count = buckets.reduce((sum, b) => sum + b[currency].count, 0);
    return count ? formatAmount(revenue / count, currency) : null;
  })
    .filter(Boolean)
    .join(" · ");

  return (
    <SectionCard title={t("dashboard.salesCount")} subtitle={t(`finance.analytics.trend.by.${granularity}`)}>
      <StatRow>
        <LegendStat label={t("finance.analytics.total")} value={countFormat(total)} />
        <LegendStat label={t("dashboard.avgSale")} value={avgSale || "—"} />
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
