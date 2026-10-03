import { Box, ButtonBase, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import {
  formatAmount,
  formatPercent,
  percentOf,
  tooltipSlotProps,
  useSliceColors,
} from "../../Finance/Overview/functions/analyticsFormat";

const SIZE = 172;
const OTHER_KEY = "__other__";

// One currency's sales split by row (service, operator…): a donut with the
// total in its hole, and beside it a list that carries every number — name,
// amount, share, profit and margin — so nothing is read from colour alone.
//
// `slotOf` gives a row its colour slot, the same in every currency's donut (a
// service is one colour in TMT and in USD). Rows without a slot fold into one
// grey "other" slice. `meta(row)` adds to a row's detail line; with
// `onSelect`, a list row picks its key (again clears it).
const DonutBreakdown = ({ rows, currency, slotOf, labels, selectedKey, onSelect, meta }) => {
  const { slots, other } = useSliceColors();
  const money = (v) => formatAmount(v, currency);

  const ranked = rows
    .filter((r) => r[currency].revenue > 0)
    .sort((a, b) => b[currency].revenue - a[currency].revenue);
  const named = ranked.filter((r) => slotOf(r.key) !== undefined);
  const rest = ranked.filter((r) => slotOf(r.key) === undefined);

  const slices = [
    ...named.map((r) => ({
      key: r.key,
      label: r.label,
      color: slots[slotOf(r.key)],
      revenue: r[currency].revenue,
      profit: r[currency].profit,
      extra: meta?.(r),
      selectable: true,
    })),
    ...(rest.length
      ? [
          {
            key: OTHER_KEY,
            label: `${labels.other} (${rest.length})`,
            color: other,
            revenue: rest.reduce((sum, r) => sum + r[currency].revenue, 0),
            profit: rest.reduce((sum, r) => sum + r[currency].profit, 0),
            selectable: false,
          },
        ]
      : []),
  ];
  const total = slices.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
      <Box sx={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0, mx: { xs: "auto", sm: 0 } }}>
        <PieChart
          hideLegend
          skipAnimation
          width={SIZE}
          height={SIZE}
          margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
          series={[
            {
              data: slices.map((s) => ({ id: s.key, value: s.revenue, label: s.label, color: s.color })),
              innerRadius: 56,
              outerRadius: 84,
              // A 2px surface gap between slices.
              paddingAngle: 2,
              cornerRadius: 4,
              highlightScope: { fade: "global", highlight: "item" },
              valueFormatter: (item) => `${money(item.value)} · ${formatPercent(percentOf(item.value, total), 0)}`,
            },
          ]}
          slotProps={tooltipSlotProps}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{labels.total}</Typography>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            {money(total)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column" }}>
        {slices.map((s) => {
          const selected = s.selectable && Boolean(selectedKey) && s.key === selectedKey;
          const canSelect = Boolean(onSelect) && s.selectable;
          return (
            <ButtonBase
              key={s.key}
              onClick={canSelect ? () => onSelect(selected ? "" : s.key) : undefined}
              disabled={!canSelect}
              sx={{
                display: "grid",
                gridTemplateColumns: "10px minmax(0,1fr) auto",
                columnGap: 1.25,
                alignItems: "center",
                textAlign: "left",
                px: 1,
                py: 0.75,
                mx: -1,
                borderRadius: "8px",
                backgroundColor: selected ? "action.selected" : "transparent",
                "&:hover": { backgroundColor: selected ? "action.selected" : "action.hover" },
              }}
            >
              <Box sx={{ width: 10, height: 10, borderRadius: "3px", backgroundColor: s.color }} />
              <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                {money(s.revenue)}
              </Typography>

              <Typography
                noWrap
                sx={{ gridColumn: "2 / -1", fontSize: "0.72rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}
              >
                {formatPercent(percentOf(s.revenue, total), 0)}
                {" · "}
                {labels.profit}{" "}
                {s.profit !== 0 ? (
                  <>
                    <Box component="span" sx={{ fontWeight: 600, color: s.profit < 0 ? "error.main" : "text.primary" }}>
                      {money(s.profit)}
                    </Box>
                    {` · ${labels.margin} ${formatPercent(percentOf(s.profit, s.revenue))}`}
                  </>
                ) : (
                  "—"
                )}
                {s.extra && ` · ${s.extra}`}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};

export default DonutBreakdown;
