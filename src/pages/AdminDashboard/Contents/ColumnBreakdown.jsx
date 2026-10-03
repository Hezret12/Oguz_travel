import { Box, Link } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  chartSx,
  formatAmount,
  formatCompactAmount,
  formatPercent,
  percentOf,
  tickLabelStyle,
  tooltipSlotProps,
  xAxisBase,
  yAxisBase,
} from "../../Finance/Overview/functions/analyticsFormat";
import { EmptyState } from "../../Finance/Overview/Contents/SectionCard";

// As many rows as stay readable in a half-width panel, names included.
const TOP = 8;
// A name under its columns: up to two lines of about this many characters,
// broken between words, so two names that start alike ("Awia bilet içerki", "Awia bilet daşary") stay apart
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

/**
 * One currency's figures per row (service, office…) as a group of columns
 * each, biggest first, the amount written on every column.
 *
 * `series` names the columns of a group: `{ id, label, color, value(row,
 * currency), tooltip?(value, row, currency) }`. The first series ranks the rows
 * unless `rankBy(row, currency)` is given; a row whose rank value is zero is
 * left out.
 *
 * Only the `TOP` biggest rows are drawn — a longer tail would be pixel-high
 * beside them — and a note under the chart says so, with (when
 * `labels.shareOfTotal` is given) their share of the whole and a link
 * (`onShowAll`) to the full table. There is no "other" group: a sum of the
 * small rows could tower over the real ones.
 *
 * With `onSelect`, a click on a row's columns picks its key (again clears
 * it); the picked row keeps its colours while the rest fade.
 */
const ColumnBreakdown = ({ rows, currency, series, rankBy, labels, selectedKey, onSelect, onShowAll }) => {
  const money = (v) => formatAmount(v, currency);
  const rank = rankBy ?? series[0].value;

  const ranked = rows
    .filter((r) => rank(r, currency) > 0)
    .sort((a, b) => rank(b, currency) - rank(a, currency));
  const shown = ranked.slice(0, TOP);

  if (shown.length === 0) return <EmptyState>{labels.noData}</EmptyState>;

  const total = ranked.reduce((sum, r) => sum + rank(r, currency), 0);
  const shownTotal = shown.reduce((sum, r) => sum + rank(r, currency), 0);

  const values = shown.flatMap((r) => series.map((s) => s.value(r, currency)));
  const top = Math.max(...values) * HEADROOM;
  // Only a loss reaches below zero; its label hangs under the column.
  const bottom = Math.min(0, ...values) * HEADROOM;

  // With a row picked — and drawn here — its columns keep their colour and
  // the others fade, so the eye lands on the pick. A pick outside the drawn
  // top rows fades nothing: there would be no full-colour column to look at.
  const pickedIndex = selectedKey ? shown.findIndex((r) => r.key === selectedKey) : -1;
  const columnColor = (color) =>
    pickedIndex < 0 ? undefined : ({ dataIndex }) => (dataIndex === pickedIndex ? color : alpha(color, 0.28));

  // A zero gets neither a column nor a label.
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
          series={series.map((s) => ({
            id: s.id,
            label: s.label,
            data: shown.map((r) => s.value(r, currency)),
            color: s.color,
            colorGetter: columnColor(s.color),
            barLabel: columnLabel,
            barLabelPlacement: "outside",
            valueFormatter: s.tooltip ? (v, { dataIndex }) => s.tooltip(v, shown[dataIndex], currency) : money,
          }))}
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
          {labels.shareOfTotal && (
            <>
              {" · "}
              {labels.shareOfTotal(formatPercent(percentOf(shownTotal, total), 0))}
            </>
          )}
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
