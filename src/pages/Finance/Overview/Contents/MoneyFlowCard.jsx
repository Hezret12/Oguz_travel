import { useMemo, useState } from "react";
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, LegendRow, ShareBar, ViewToggle } from "./SectionCard";
import { ChartTooltip, pointerIn, useElementWidth } from "./chartKit";
import { formatAmount, formatPercent, percentOf, tableSx, useFlowColors } from "../functions/analyticsFormat";

const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

// Layout constants (px)
const NODE_W = 10;
const TILL_W = 14;
const GAP = 8; // between nodes in a column
const MIN_SLOT = 34; // room for a two-line label, even for a thin node
const PLOT_H = 340; // target height of the flow bands
const MAX_ITEMS = 6; // per side; the tail folds into "Other"
const MIN_SHARE = 0.03;

// Top items per side; everything else (and anything under 3%) folds into "Other"
// so every node is tall enough to be seen and labelled.
const foldItems = (items, total, otherName) => {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const keep = [];
  let rest = 0;
  sorted.forEach((item) => {
    if (keep.length < MAX_ITEMS && item.value / total >= MIN_SHARE) keep.push(item);
    else rest += item.value;
  });
  if (rest > 0) keep.push({ key: "other", name: otherName, value: rest, isOther: true });
  return keep;
};

// Places a column of nodes: true-scale heights, but each node gets at least
// MIN_SLOT of vertical room so labels never collide.
const placeColumn = (items, k) => {
  let y = 0;
  return items.map((item) => {
    const h = Math.max(2, item.value * k);
    const slot = Math.max(h, MIN_SLOT);
    const node = { ...item, h, y: y + (slot - h) / 2 };
    y += slot + GAP;
    return node;
  });
};

const columnHeight = (nodes) =>
  nodes.length ? nodes[nodes.length - 1].y + nodes[nodes.length - 1].h + GAP : 0;

// Band between two vertical edges, as a closed cubic path.
const bandPath = (x0, y0, x1, y1, h) => {
  const xm = (x0 + x1) / 2;
  return `M${x0},${y0} C${xm},${y0} ${xm},${y1} ${x1},${y1} L${x1},${y1 + h} C${xm},${y1 + h} ${xm},${y0 + h} ${x0},${y0 + h} Z`;
};

const buildLayout = ({ inflow, outflow, width, labels }) => {
  const inTotal = inflow.reduce((s, i) => s + i.value, 0);
  const outTotal = outflow.reduce((s, i) => s + i.value, 0);
  const net = inTotal - outTotal;

  // Both sides must add up to the same total: what is left stays in the till,
  // a shortfall is drawn from the opening balance.
  const left = foldItems(inflow, inTotal, labels.other).map((n) => ({ ...n, side: "in" }));
  const right = foldItems(outflow, outTotal, labels.other).map((n) => ({ ...n, side: "out" }));
  if (net > 0) right.push({ key: "leftover", name: labels.leftover, value: net, side: "till" });
  if (net < 0) left.push({ key: "drawdown", name: labels.drawdown, value: -net, side: "till" });

  const total = Math.max(inTotal, outTotal);
  const k = PLOT_H / total;
  const leftNodes = placeColumn(left, k);
  const rightNodes = placeColumn(right, k);
  const tillH = total * k;

  const labelW = Math.min(170, Math.max(110, width * 0.2));
  const top = 30; // room for the till label
  const height = Math.max(columnHeight(leftNodes), columnHeight(rightNodes), tillH) + top + 8;
  const center = (colH) => top + (height - top - colH) / 2;

  const xLeft = labelW;
  const xRight = width - labelW - NODE_W;
  const xTill = (width - TILL_W) / 2;
  const tillY = center(tillH);

  const shift = (nodes) => {
    const off = center(columnHeight(nodes) - GAP);
    return nodes.map((n) => ({ ...n, y: n.y + off }));
  };
  const L = shift(leftNodes);
  const R = shift(rightNodes);

  // Bands stack on the till in the same order as their nodes.
  let inY = tillY;
  const inLinks = L.map((n) => {
    const link = { id: `in:${n.key}`, node: n, d: bandPath(xLeft + NODE_W, n.y, xTill, inY, n.h) };
    inY += n.h;
    return link;
  });
  let outY = tillY;
  const outLinks = R.map((n) => {
    const link = { id: `out:${n.key}`, node: n, d: bandPath(xTill + TILL_W, outY, xRight, n.y, n.h) };
    outY += n.h;
    return link;
  });

  return { L, R, inLinks, outLinks, height, xLeft, xRight, xTill, tillY, tillH, inTotal, outTotal, net, top };
};

const FlowTable = ({ items, currency, color, title }) => {
  const { t, selectedLang } = useLocale();
  const other = currency === "USD" ? "TMT" : "USD";
  const rows = items
    .filter((i) => i[currency] > 0 || i[other] > 0)
    .sort((a, b) => b[currency] - a[currency] || b[other] - a[other]);
  const total = rows.reduce((s, i) => s + (i[currency] || 0), 0);
  const otherTotal = rows.reduce((s, i) => s + (i[other] || 0), 0);

  return (
    <Box>
      <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", mb: 1 }}>{title}</Typography>
      <TableContainer>
        <Table size="small" sx={tableSx}>
          <TableHead>
            <TableRow>
              <TableCell>{t("finance.analytics.flow.item")}</TableCell>
              <TableCell sx={num}>{currency}</TableCell>
              <TableCell sx={num}>{other}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((i) => {
              const share = percentOf(i[currency], total);
              return (
                <TableRow key={i.key} hover>
                  <TableCell sx={{ minWidth: 150 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                      <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        {selectedLang(i.name)}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                        {i[currency] > 0 ? formatPercent(share, 0) : "—"}
                      </Typography>
                    </Box>
                    <ShareBar value={share} color={color} />
                  </TableCell>
                  <TableCell sx={{ ...num, fontWeight: 600, color: i[currency] > 0 ? "text.primary" : "text.disabled" }}>
                    {i[currency] > 0 ? formatAmount(i[currency], currency) : "—"}
                  </TableCell>
                  <TableCell sx={{ ...num, color: i[other] > 0 ? "text.secondary" : "text.disabled" }}>
                    {i[other] > 0 ? formatAmount(i[other], other) : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>{t("finance.analytics.total")}</TableCell>
              <TableCell sx={num}>{formatAmount(total, currency)}</TableCell>
              <TableCell sx={num}>{formatAmount(otherTotal, other)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Where the money came from, through the till, to where it went — one picture
// instead of two separate bar lists. Band thickness = amount (selected
// currency only; USD and TMT are never mixed).
const MoneyFlowCard = ({ cashFlow, currency }) => {
  const { t, selectedLang } = useLocale();
  const colors = useFlowColors();
  const [view, setView] = useState("chart");
  const [hover, setHover] = useState(null); // { id, tip }
  const [ref, width] = useElementWidth();

  const labels = useMemo(
    () => ({
      other: t("finance.analytics.flow.other"),
      leftover: t("finance.analytics.flow.leftover"),
      drawdown: t("finance.analytics.flow.drawdown"),
    }),
    [t],
  );

  const toItems = (list) =>
    list
      .filter((i) => i[currency] > 0)
      .map((i) => ({ key: i.key, name: selectedLang(i.name), value: i[currency] }));

  const inflow = toItems(cashFlow.inflow);
  const outflow = toItems(cashFlow.outflow);
  const hasData = inflow.length > 0 && outflow.length > 0;
  const layout = hasData ? buildLayout({ inflow, outflow, width, labels }) : null;

  const colorOf = (side) => (side === "in" ? colors.inflow : side === "out" ? colors.outflow : colors.neutral);
  const money = (v) => formatAmount(v, currency);
  const shareOf = (n) => formatPercent(percentOf(n.value, n.side === "out" ? layout.outTotal : layout.inTotal), 1);

  const showTip = (event, id, node) => {
    const p = pointerIn(event, ref.current);
    const till = t("finance.analytics.flow.till");
    setHover({
      id,
      tip: {
        x: p.x,
        y: p.y,
        title: node.side === "out" || (node.side === "till" && node.key === "leftover") ? `${till} → ${node.name}` : `${node.name} → ${till}`,
        rows: [{ label: shareOf(node), value: money(node.value), color: colorOf(node.side) }],
      },
    });
  };

  const dimmed = (id) => hover && hover.id !== id;

  const legend = [
    { label: t("finance.analytics.cash.inflow"), color: colors.inflow, shape: "bar" },
    { label: t("finance.analytics.cash.outflow"), color: colors.outflow, shape: "bar" },
    { label: t("finance.analytics.flow.till"), color: colors.neutral, shape: "bar" },
  ];

  const renderLabel = (n, align) => {
    const x = align === "end" ? layout.xLeft - 10 : layout.xRight + NODE_W + 10;
    const cy = n.y + n.h / 2;
    return (
      <text key={`l:${n.key}`} x={x} textAnchor={align} style={{ pointerEvents: "none" }}>
        <tspan x={x} y={cy - 3} fontSize={12} fontWeight={600} className="mf-ink">
          {n.name.length > 22 ? `${n.name.slice(0, 21)}…` : n.name}
        </tspan>
        <tspan x={x} y={cy + 12} fontSize={11} className="mf-muted">
          {money(n.value)}
        </tspan>
      </text>
    );
  };

  return (
    <SectionCard
      title={t("finance.analytics.flow.sankeyTitle")}
      subtitle={t("finance.analytics.flow.sankeySubtitle")}
      action={
        <>
          {view === "chart" && hasData && (
            <Box sx={{ display: { xs: "none", md: "block" }, mr: 1.5 }}>
              <LegendRow items={legend} />
            </Box>
          )}
          <ViewToggle
            value={view}
            onChange={setView}
            chartLabel={t("finance.analytics.trend.chart")}
            tableLabel={t("finance.analytics.trend.table")}
          />
        </>
      }
    >
      {!hasData ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : view === "table" ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <FlowTable items={cashFlow.inflow} currency={currency} color={colors.inflow} title={t("finance.analytics.flow.inTitle")} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <FlowTable items={cashFlow.outflow} currency={currency} color={colors.outflow} title={t("finance.analytics.flow.outTitle")} />
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ overflowX: "auto", mx: -1 }}>
          <Box
            ref={ref}
            onMouseLeave={() => setHover(null)}
            sx={(theme) => ({
              position: "relative",
              minWidth: 620,
              px: 1,
              "& .mf-ink": { fill: theme.palette.text.primary },
              "& .mf-muted": { fill: theme.palette.text.secondary },
              "& .mf-band": { transition: "fill-opacity .18s ease" },
              // Bands draw in from left to right once per currency switch.
              "& .mf-reveal": { animation: "mfReveal .9s cubic-bezier(.3,.7,.2,1) both" },
              "@keyframes mfReveal": {
                from: { clipPath: "inset(0 100% 0 0)" },
                to: { clipPath: "inset(0 0 0 0)" },
              },
              "@media (prefers-reduced-motion: reduce)": { "& .mf-reveal": { animation: "none" } },
            })}
          >
            <Box sx={{ display: { xs: "block", md: "none" }, mb: 1.5 }}>
              <LegendRow items={legend} />
            </Box>
            <svg
              key={currency}
              width={width}
              height={layout.height}
              role="img"
              aria-label={t("finance.analytics.flow.sankeyTitle")}
              style={{ display: "block", overflow: "visible" }}
            >
              <g className="mf-reveal">
                {[...layout.inLinks, ...layout.outLinks].map(({ id, node, d }) => (
                  <path
                    key={id}
                    d={d}
                    className="mf-band"
                    fill={colorOf(node.side)}
                    fillOpacity={hover?.id === id ? 0.5 : dimmed(id) ? 0.1 : 0.24}
                    onMouseMove={(e) => showTip(e, id, node)}
                  />
                ))}
              </g>

              {/* Till in the middle */}
              <rect
                x={layout.xTill}
                y={layout.tillY}
                width={TILL_W}
                height={layout.tillH}
                rx={3}
                fill={colors.neutral}
              />
              <text x={layout.xTill + TILL_W / 2} y={layout.tillY - 12} textAnchor="middle">
                <tspan fontSize={12} fontWeight={700} className="mf-ink">
                  {t("finance.analytics.flow.till")}
                </tspan>
                <tspan dx={6} fontSize={11} className="mf-muted">
                  {money(Math.max(layout.inTotal, layout.outTotal))}
                </tspan>
              </text>

              {/* Nodes: a 2px surface gap around each keeps neighbours apart */}
              {[...layout.L.map((n) => ({ n, x: layout.xLeft })), ...layout.R.map((n) => ({ n, x: layout.xRight }))].map(
                ({ n, x }) => {
                  const id = `${n.side === "out" || n.key === "leftover" ? "out" : "in"}:${n.key}`;
                  return (
                    <rect
                      key={`n:${id}`}
                      x={x}
                      y={n.y}
                      width={NODE_W}
                      height={n.h}
                      rx={3}
                      fill={colorOf(n.side)}
                      stroke={colors.surface}
                      strokeWidth={2}
                      tabIndex={0}
                      style={{ cursor: "default", outline: "none" }}
                      onMouseMove={(e) => showTip(e, id, n)}
                      onFocus={() =>
                        setHover({
                          id,
                          tip: {
                            x: x + NODE_W,
                            y: n.y + n.h / 2,
                            title: n.name,
                            rows: [{ label: shareOf(n), value: money(n.value), color: colorOf(n.side) }],
                          },
                        })
                      }
                      onBlur={() => setHover(null)}
                    />
                  );
                },
              )}

              {layout.L.map((n) => renderLabel(n, "end"))}
              {layout.R.map((n) => renderLabel(n, "start"))}
            </svg>
            <ChartTooltip tip={hover?.tip} containerWidth={width} />
          </Box>
        </Box>
      )}
    </SectionCard>
  );
};

export default MoneyFlowCard;
