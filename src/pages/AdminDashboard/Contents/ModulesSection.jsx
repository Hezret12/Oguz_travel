import { createElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { ArrowUpRight, FileCheck, FileText, Languages, PlaneTakeoff, TicketsPlane, UtensilsCrossed } from "lucide-react";
import { LineChart } from "@mui/x-charts/LineChart";
import { useLocale } from "../../../hooks/useLocale";
import { PATHS } from "../../../routes/paths";
import TurkishAirlinesIcon from "../../../assets/icons/turkishAirlines.svg";
import SectionCard, { ChartGradients, LegendRow } from "../../Finance/Overview/Contents/SectionCard";
import { DeltaBadge } from "../../Finance/Overview/Contents/KpiGrid";
import {
  changePercent,
  chartSx,
  formatAmount,
  formatCompactAmount,
  formatPercent,
  percentOf,
  segmentedSx,
  tickLabelStyle,
  tooltipSlotProps,
  useFlowColors,
  useSeriesColors,
  xAxisBase,
  yAxisBase,
} from "../../Finance/Overview/functions/analyticsFormat";

// Same icons and pages as the sidebar entries.
const MODULE_META = {
  b2b: { labelKey: "sidebar.ticketB2B", icon: TicketsPlane, path: PATHS.TICKET.B2B },
  thy: { labelKey: "sidebar.ticketTurkishAirlines", image: TurkishAirlinesIcon, path: PATHS.TICKET.TURKISH_AIRLINES },
  outbound: { labelKey: "sidebar.outbound", icon: PlaneTakeoff, path: PATHS.OUTBOUND },
  visa: { labelKey: "sidebar.visa.title", icon: FileText, path: PATHS.VISA.APPLICATIONS },
  translation: { labelKey: "sidebar.translation", icon: Languages, path: PATHS.TRANSLATION },
  referral: { labelKey: "sidebar.referalLetters", icon: FileCheck, path: PATHS.REFERRAL_LETTERS },
  cafeteria: { labelKey: "sidebar.cafeteria", icon: UtensilsCrossed, path: PATHS.CAFETERIA },
};

const GRADIENT = "dashboard-module-gradient";
const axisLabelStyle = { ...tickLabelStyle, fontSize: 12 };
const num = { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

const ModuleIcon = ({ meta, size = 16 }) =>
  meta.image ? (
    <Box component="img" src={meta.image} alt="" sx={{ width: size + 4, height: size, objectFit: "contain" }} />
  ) : (
    createElement(meta.icon, { size, strokeWidth: 2.2 })
  );

const StatRow = ({ label, value, hint, danger }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 1,
      py: 1,
      borderBottom: "1px solid",
      borderColor: "divider",
    }}
  >
    <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>{label}</Typography>
    <Box sx={{ textAlign: "right" }}>
      <Typography component="span" sx={{ ...num, fontSize: "0.9rem", fontWeight: 700, color: danger ? "error.main" : "text.primary" }}>
        {value}
      </Typography>
      {hint && (
        <Typography component="span" sx={{ ...num, ml: 0.75, fontSize: "0.72rem", color: "text.secondary" }}>
          {hint}
        </Typography>
      )}
    </Box>
  </Box>
);

// Module tabs + one large chart for the selected module: sales (area),
// profit (line) and the previous period's sales (dashed) on one axis, with
// the module's key numbers and top operators beside it.
const ModulesSection = ({ modules, currency, labels, compareLabel }) => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const colors = useFlowColors();
  const { outflow: previousColor } = useSeriesColors();
  const [selected, setSelected] = useState(modules[0]?.key);

  const mod = modules.find((m) => m.key === selected) || modules[0];
  const meta = MODULE_META[mod.key];
  const { revenue, profit, count, receivable, refunds } = mod.current;
  const money = (v) => formatAmount(v, currency);
  const hasData = count > 0;
  const hasPrevious = mod.prevRevenue.some((v) => v != null);

  const legend = [
    { label: t("dashboard.sales"), color: colors.inflow, shape: "line" },
    { label: t("dashboard.profit"), color: colors.neutral, shape: "line" },
    ...(hasPrevious ? [{ label: t("dashboard.previousPeriod"), color: previousColor, shape: "line", dashed: true }] : []),
  ];

  return (
    <SectionCard title={t("dashboard.modulesTitle")} subtitle={t("dashboard.modulesSubtitle")}>
      {/* Module tabs */}
      <Box sx={{ overflowX: "auto", mx: -0.5, px: 0.5, pb: 0.5 }}>
        <ToggleButtonGroup
          exclusive
          value={mod.key}
          onChange={(_e, next) => next && setSelected(next)}
          sx={[segmentedSx, { "& .MuiToggleButton-root": { height: 36, px: 1.75, gap: 0.9 } }]}
        >
          {modules.map((m) => (
            <ToggleButton key={m.key} value={m.key}>
              <ModuleIcon meta={MODULE_META[m.key]} size={15} />
              {t(MODULE_META[m.key].labelKey)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 1 }}>
            <Box>
              <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                {t(meta.labelKey)} · {t("dashboard.sales").toLowerCase()}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.25, flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: "1.9rem", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                  {money(revenue)}
                </Typography>
                <DeltaBadge change={changePercent(revenue, mod.previous.revenue)} upIsGood />
                <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{compareLabel}</Typography>
              </Box>
            </Box>
            {hasData && <LegendRow items={legend} />}
          </Box>

          {hasData ? (
            <Box sx={{ mx: -1 }}>
              <ChartGradients gradients={[{ id: GRADIENT, color: colors.inflow, opacity: 0.24 }]} />
              <LineChart
                key={mod.key}
                height={320}
                hideLegend
                margin={{ top: 12, right: 24, bottom: 4, left: 0 }}
                grid={{ horizontal: true }}
                xAxis={[{ ...xAxisBase, scaleType: "point", data: labels, tickLabelStyle: axisLabelStyle }]}
                yAxis={[
                  {
                    ...yAxisBase,
                    width: 60,
                    tickNumber: 5,
                    valueFormatter: (v) => formatCompactAmount(v, currency),
                    tickLabelStyle: axisLabelStyle,
                  },
                ]}
                series={[
                  ...(hasPrevious
                    ? [
                        {
                          id: "previous",
                          label: t("dashboard.previousPeriod"),
                          data: mod.prevRevenue,
                          color: previousColor,
                          curve: "monotoneX",
                          showMark: false,
                          connectNulls: false,
                          valueFormatter: (v) => (v == null ? "—" : money(v)),
                        },
                      ]
                    : []),
                  {
                    id: "revenue",
                    label: t("dashboard.sales"),
                    data: mod.buckets.map((b) => b.revenue),
                    color: colors.inflow,
                    area: true,
                    curve: "monotoneX",
                    showMark: false,
                    valueFormatter: money,
                  },
                  {
                    id: "profit",
                    label: t("dashboard.profit"),
                    data: mod.buckets.map((b) => b.profit),
                    color: colors.neutral,
                    curve: "monotoneX",
                    showMark: false,
                    valueFormatter: money,
                  },
                ]}
                sx={chartSx({ revenue: GRADIENT }, ["previous"])}
                slotProps={tooltipSlotProps}
              />
            </Box>
          ) : (
            <Box sx={{ height: 320, display: "grid", placeItems: "center", color: "text.secondary", fontSize: "0.9rem" }}>
              {t("dashboard.noSalesInCurrency", { currency })}
            </Box>
          )}
        </Grid>

        {/* Key numbers + top operators */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <StatRow label={t("dashboard.salesCount")} value={count.toLocaleString("en-US")} />
            <StatRow label={t("dashboard.profit")} value={money(profit)} hint={formatPercent(percentOf(profit, revenue), 0)} danger={profit < 0} />
            <StatRow label={t("dashboard.avgSale")} value={money(count ? revenue / count : 0)} />
            <StatRow label={t("dashboard.receivable")} value={money(receivable)} />
            <StatRow label={t("paymentRefunded")} value={refunds.toLocaleString("en-US")} />

            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "text.secondary", mt: 2.5, mb: 0.75 }}>
              {t("dashboard.topOperators")}
            </Typography>
            {mod.operators.length === 0 ? (
              <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>—</Typography>
            ) : (
              mod.operators.map((o, i) => (
                <Box key={o.guid} sx={{ py: 0.6 }}>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.4 }}>
                    <Typography sx={{ width: 16, fontSize: "0.75rem", fontWeight: 700, color: "text.secondary" }}>{i + 1}</Typography>
                    <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: "0.85rem", fontWeight: 600 }}>
                      {o.name || "—"}
                    </Typography>
                    <Typography sx={{ ...num, fontSize: "0.72rem", color: "text.secondary" }}>
                      {t("dashboard.salesN", { count: o.count })}
                    </Typography>
                    <Typography sx={{ ...num, fontSize: "0.85rem", fontWeight: 600 }}>{money(o.revenue)}</Typography>
                  </Box>
                  <Box sx={{ ml: 3, height: 4, borderRadius: 2, backgroundColor: "action.hover", overflow: "hidden" }}>
                    <Box
                      sx={{
                        width: `${Math.max(2, percentOf(o.revenue, mod.operators[0].revenue))}%`,
                        height: "100%",
                        borderRadius: 2,
                        backgroundColor: colors.inflow,
                      }}
                    />
                  </Box>
                </Box>
              ))
            )}
            <Box sx={{ minHeight: 16 }} />

            <Button
              onClick={() => navigate(meta.path)}
              endIcon={<ArrowUpRight size={16} />}
              sx={{ mt: "auto", ml: -1, alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
            >
              {t("dashboard.openModuleNamed", { name: t(meta.labelKey) })}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </SectionCard>
  );
};

export default ModulesSection;
