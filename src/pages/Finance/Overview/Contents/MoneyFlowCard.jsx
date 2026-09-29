import { useState } from "react";
import { Box, Divider, Grid, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, ViewToggle } from "./SectionCard";
import {
  formatAmount,
  formatPercent,
  percentOf,
  tooltipSlotProps,
  useFlowColors,
  useSliceColors,
} from "../functions/analyticsFormat";

// Top 5 + "Other": a donut stays readable up to six slices, and the list
// view uses the same rows so both views always agree.
const MAX_ROWS = 5;
const DONUT = 188;

// `field` picks the figure per category: "revenue" (sales) or "cost".
const toRows = (categories, field, currency, otherName, selectedLang) => {
  const valueOf = (c) => c[currency]?.[field] ?? 0;
  const sorted = categories.filter((c) => valueOf(c) > 0).sort((a, b) => valueOf(b) - valueOf(a));
  const rows = sorted.slice(0, MAX_ROWS).map((c) => ({ key: c.key, name: selectedLang(c.name), value: valueOf(c) }));
  const rest = sorted.slice(MAX_ROWS).reduce((s, c) => s + valueOf(c), 0);
  if (rest > 0) rows.push({ key: "other", name: otherName, value: rest, isOther: true });
  return rows;
};

const SideHeader = ({ title, total, color, currency }) => (
  <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, mb: 1.75 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: "2px", backgroundColor: color }} />
      <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{title}</Typography>
    </Box>
    <Typography sx={{ fontWeight: 700, fontSize: "1rem", whiteSpace: "nowrap" }}>{formatAmount(total, currency)}</Typography>
  </Box>
);

// List view: name, amount, share and a thin bar in the side's colour.
const FlowList = ({ rows, total, color, currency }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
    {rows.map((row) => {
      const share = percentOf(row.value, total);
      return (
        <Box key={row.key}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.6 }}>
            <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: "0.85rem" }}>
              {row.name}
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
              {formatAmount(row.value, currency)}
            </Typography>
            <Typography sx={{ width: 42, textAlign: "right", fontSize: "0.75rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
              {formatPercent(share, 0)}
            </Typography>
          </Box>
          <Box sx={{ height: 6, borderRadius: 3, backgroundColor: "action.hover", overflow: "hidden" }}>
            <Box sx={{ width: `${Math.max(1, share)}%`, height: "100%", borderRadius: 3, backgroundColor: color, transition: "width 0.4s ease" }} />
          </Box>
        </Box>
      );
    })}
  </Box>
);

// Chart view: donut with the total in the middle, legend beside it. Hovering
// a legend row highlights its slice and vice versa.
const FlowDonut = ({ id, rows, total, currency, totalLabel }) => {
  const slice = useSliceColors();
  const [highlighted, setHighlighted] = useState(null);
  const colorOf = (row, i) => (row.isOther ? slice.other : slice.slots[i]);
  const activeIndex = highlighted?.dataIndex;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
      <Box sx={{ position: "relative", width: DONUT, height: DONUT, flexShrink: 0, mx: { xs: "auto", sm: 0 } }}>
        <PieChart
          width={DONUT}
          height={DONUT}
          hideLegend
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          highlightedItem={highlighted}
          onHighlightChange={setHighlighted}
          series={[
            {
              id,
              data: rows.map((r, i) => ({ id: r.key, value: r.value, label: r.name, color: colorOf(r, i) })),
              innerRadius: DONUT * 0.33,
              outerRadius: DONUT * 0.48,
              paddingAngle: 1.5, // the surface gap between slices
              cornerRadius: 4,
              highlightScope: { fade: "global", highlight: "item" },
              faded: { additionalRadius: -2 },
              valueFormatter: (item) => `${formatAmount(item.value, currency)} · ${formatPercent(percentOf(item.value, total), 0)}`,
            },
          ]}
          slotProps={tooltipSlotProps}
        />
        {/* Total in the hole; the hovered slice's share replaces it */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", maxWidth: DONUT * 0.55 }} noWrap>
            {activeIndex != null ? rows[activeIndex]?.name : totalLabel}
          </Typography>
          <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.3 }}>
            {activeIndex != null ? formatPercent(percentOf(rows[activeIndex]?.value, total), 0) : formatAmount(total, currency)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.25 }}>
        {rows.map((row, i) => {
          const active = activeIndex === i;
          return (
            <Box
              key={row.key}
              onMouseEnter={() => setHighlighted({ seriesId: id, dataIndex: i })}
              onMouseLeave={() => setHighlighted(null)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1,
                py: 0.75,
                borderRadius: "8px",
                cursor: "default",
                backgroundColor: active ? "action.hover" : "transparent",
                opacity: activeIndex != null && !active ? 0.55 : 1,
                transition: "opacity .15s ease, background-color .15s ease",
              }}
            >
              <Box sx={{ width: 10, height: 10, borderRadius: "3px", flexShrink: 0, backgroundColor: colorOf(row, i) }} />
              <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: "0.83rem" }}>
                {row.name}
              </Typography>
              <Typography sx={{ fontSize: "0.83rem", fontWeight: 600, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                {formatAmount(row.value, currency)}
              </Typography>
              <Typography sx={{ width: 38, textAlign: "right", fontSize: "0.75rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                {formatPercent(percentOf(row.value, total), 0)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// Sales and cost of sales by service, side by side, and the gross profit
// between them. Selected currency only; USD and TMT are never mixed.
const MoneyFlowCard = ({ categories, currency }) => {
  const { t, selectedLang } = useLocale();
  const colors = useFlowColors();
  const [view, setView] = useState("chart");
  const other = t("finance.analytics.flow.other");

  const sides = [
    { id: "in", title: t("finance.analytics.flow.inTitle"), color: colors.inflow, rows: toRows(categories, "revenue", currency, other, selectedLang) },
    { id: "out", title: t("finance.analytics.flow.outTitle"), color: colors.outflow, rows: toRows(categories, "cost", currency, other, selectedLang) },
  ].map((s) => ({ ...s, total: s.rows.reduce((sum, r) => sum + r.value, 0) }));
  const left = sides[0].total - sides[1].total;
  const hasData = sides.some((s) => s.rows.length > 0);

  return (
    <SectionCard
      title={t("finance.analytics.flow.cardTitle")}
      subtitle={t("finance.analytics.flow.cardSubtitle")}
      action={
        <ViewToggle
          value={view}
          onChange={setView}
          chartLabel={t("finance.analytics.trend.chart")}
          tableLabel={t("finance.analytics.trend.table")}
        />
      }
    >
      {!hasData ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : (
        <>
          <Grid container spacing={{ xs: 3, md: 5 }}>
            {sides.map((s) => (
              <Grid key={s.id} size={{ xs: 12, md: 6 }}>
                <SideHeader title={s.title} total={s.total} color={s.color} currency={currency} />
                {s.rows.length === 0 ? (
                  <EmptyState>{t("finance.analytics.noData")}</EmptyState>
                ) : view === "chart" ? (
                  <FlowDonut
                    key={currency}
                    id={s.id}
                    rows={s.rows}
                    total={s.total}
                    currency={currency}
                    totalLabel={t("finance.analytics.total")}
                  />
                ) : (
                  <FlowList rows={s.rows} total={s.total} color={s.color} currency={currency} />
                )}
              </Grid>
            ))}
          </Grid>

          <Divider />
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
              {left >= 0 ? t("finance.analytics.flow.leftover") : t("finance.analytics.flow.drawdown")}
            </Typography>
            <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: left >= 0 ? "text.primary" : "error.main" }}>
              {formatAmount(left, currency)}
            </Typography>
          </Box>
        </>
      )}
    </SectionCard>
  );
};

export default MoneyFlowCard;
