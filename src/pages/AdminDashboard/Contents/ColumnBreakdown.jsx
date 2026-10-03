import { Box, Link } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  chartSx,
  formatAmount,
  formatCompactAmount,
  formatPercent,
  percentOf,
  tickLabelStyle,
  tooltipSlotProps,
  useDashboardColors,
  xAxisBase,
  yAxisBase,
} from "../../Finance/Overview/functions/analyticsFormat";
import { EmptyState } from "../../Finance/Overview/Contents/SectionCard";

// As many columns as stay readable in a half-width panel, names included.
const TOP = 8;
// A name under its columns: up to two lines of about this many characters,
// broken between words, so "Test hyzmat 01" and "Test hyzmat 02" stay apart
// instead of both ending in "…".
const LINE_LENGTH = 12;
const cut = (text) => (text.length > LINE_LENGTH ? `${text.slice(0, LINE_LENGTH - 1)}…` : text);
const twoLines = (name) => {
  const words = String(name).trim().split(/\s+/);
  let first = words.shift() ?? "";
  while (words.length && `${first} ${words[0]}`.length <= LINE_LENGTH) first += ` ${words.shift()}`;
  return words.length ? `${cut(first)}\n${cut(words.join(" "))}` : cut(first);
};

// The labels sit above the columns, inside the plot: without this headroom on
// the value axis the tallest column's label is clipped at the plot's edge.
const HEADROOM = 1.16;

// One currency's sales and profit per row (service…) as two columns each,
// biggest sale first, the amount written on every column. Only the `TOP`
// biggest are drawn — a longer tail would be pixel-high beside them — and a
// note under the chart says so, with their share of all sales and a link
// (`onShowAll`) to the full table. No "other" column: a sum of the small ones
// could tower over the real ones. With `onSelect`, a click on a row's columns
// picks its key (again clears it).
const ColumnBreakdown = ({ rows, currency, labels, selectedKey, onSelect, onShowAll }) => {
  const colors = useDashboardColors();
  const money = (v) => formatAmount(v, currency);

  const ranked = rows
    .filter((r) => r[currency].revenue > 0)
    .sort((a, b) => b[currency].revenue - a[currency].revenue);
  const shown = ranked.slice(0, TOP);
  const total = ranked.reduce((sum, r) => sum + r[currency].revenue, 0);
  const shownTotal = shown.reduce((sum, r) => sum + r[currency].revenue, 0);

  if (shown.length === 0) return <EmptyState>{labels.noData}</EmptyState>;

  const values = shown.flatMap((r) => [r[currency].revenue, r[currency].profit]);
  const top = Math.max(...values) * HEADROOM;
  // Only a loss reaches below zero; its label hangs under the column.
  const bottom = Math.min(0, ...values) * HEADROOM;

  // A column too small to matter gets no label; zero profit gets no column.
  const columnLabel = (item) => (item.value ? formatCompactAmount(item.value, currency) : null);

  return (
    <Box>
      <Box sx={{ mx: -1 }}>
        <BarChart
          height={300}
          hideLegend
          skipAnimation
          borderRadius={4}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          grid={{ horizontal: true }}
          onAxisClick={
            onSelect
              ? (_event, data) => {
                  const row = data ? shown[data.dataIndex] : null;
                  if (row) onSelect(row.key === selectedKey ? "" : row.key);
                }
              : undefined
          }
          xAxis={[
            {
              ...xAxisBase,
              scaleType: "band",
              data: shown.map((r) => r.label),
              // On two lines under the columns, in full in the tooltip.
              valueFormatter: (name, context) => (context.location === "tick" ? twoLines(name) : name),
              tickLabelInterval: () => true,
              height: 44,
              categoryGapRatio: 0.34,
              barGapRatio: 0.12,
              tickLabelStyle: { ...tickLabelStyle, fontSize: 11.5 },
            },
          ]}
          yAxis={[
            {
              ...yAxisBase,
              width: 48,
              tickNumber: 4,
              min: bottom,
              max: top,
              valueFormatter: (v) => formatCompactAmount(v, currency),
              tickLabelStyle: { ...tickLabelStyle, fontSize: 11.5 },
            },
          ]}
          series={[
            {
              id: "revenue",
              label: labels.revenue,
              data: shown.map((r) => r[currency].revenue),
              color: colors.sale,
              barLabel: columnLabel,
              barLabelPlacement: "outside",
              valueFormatter: money,
            },
            {
              id: "profit",
              label: labels.profit,
              data: shown.map((r) => r[currency].profit),
              color: colors.profit,
              barLabel: columnLabel,
              barLabelPlacement: "outside",
              valueFormatter: (v, { dataIndex }) =>
                `${money(v)} · ${labels.margin} ${formatPercent(percentOf(v, shown[dataIndex]?.[currency].revenue))}`,
            },
          ]}
          sx={[
            chartSx(),
            (theme) => ({
              cursor: onSelect ? "pointer" : "default",
              "& .MuiBarLabel-root": {
                fill: theme.palette.text.primary,
                fontSize: 11,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              },
            }),
          ]}
          slotProps={tooltipSlotProps}
        />
      </Box>

      {ranked.length > shown.length && (
        <Box sx={{ mt: 1.5, pt: 1, borderTop: "1px solid", borderColor: "divider", fontSize: "0.75rem", color: "text.secondary" }}>
          {labels.topShown(shown.length)}
          {" · "}
          {labels.shareOfSales(formatPercent(percentOf(shownTotal, total), 0))}
          {onShowAll && (
            <>
              {" · "}
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={onShowAll}
                sx={{ fontSize: "inherit", fontWeight: 600, verticalAlign: "baseline" }}
              >
                {labels.showAll(ranked.length)} →
              </Link>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ColumnBreakdown;
