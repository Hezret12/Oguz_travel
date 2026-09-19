import { Box, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState } from "../../Overview/Contents/SectionCard";
import { formatAmount, formatPercent, percentOf, useFlowColors } from "../../Overview/functions/analyticsFormat";

// One card per office — works for any number of offices. The bar splits the
// office's money in into what went out (orange) and what stayed as profit
// (teal); a loss-making office gets a full orange bar plus a red "loss" note.
const OfficeCard = ({ office, currency, rank, total, colors }) => {
  const { t } = useLocale();
  const inflow = office.inflow[currency];
  const outflow = office.outflow[currency];
  const profit = office.profit[currency];
  const up = profit >= 0;
  const margin = percentOf(profit, inflow);
  const costShare = inflow > 0 ? Math.min(100, (outflow / inflow) * 100) : 100;
  const money = (v) => formatAmount(v, currency);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        minWidth: 0,
        transition: "border-color .15s ease",
        "&:hover": { borderColor: alpha(up ? colors.inflow : colors.outflow, 0.5) },
      }}
    >
      {/* Name + rank + share of all money in */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: "6px",
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "text.secondary",
            backgroundColor: "action.hover",
          }}
        >
          {rank}
        </Box>
        <Typography noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: "0.95rem" }}>
          {office.name}
        </Typography>
        <Tooltip title={t("finance.offices.shareOfIncome")} arrow>
          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", whiteSpace: "nowrap" }}>
            {formatPercent(percentOf(inflow, total), 0)}
          </Typography>
        </Tooltip>
      </Box>

      {/* Profit headline */}
      <Box>
        <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mb: 0.25 }}>
          {t("finance.analytics.kpi.profit")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: "1.35rem", fontWeight: 700, lineHeight: 1.2, color: up ? "text.primary" : "error.main" }}>
            {money(profit)}
          </Typography>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.25,
              px: 0.75,
              py: 0.2,
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: up ? "success.main" : "error.main",
              backgroundColor: (theme) => alpha(up ? theme.palette.success.main : theme.palette.error.main, 0.12),
            }}
          >
            {up ? <ArrowUpRight size={12} strokeWidth={2.6} /> : <ArrowDownRight size={12} strokeWidth={2.6} />}
            {formatPercent(margin, 1)}
          </Box>
        </Box>
      </Box>

      {/* Where the office's money in went: out vs. kept */}
      <Box>
        <Box sx={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: "2px", backgroundColor: "action.hover" }}>
          <Box sx={{ width: `${costShare}%`, backgroundColor: colors.outflow, transition: "width .4s ease" }} />
          {up && <Box sx={{ flex: 1, backgroundColor: colors.inflow }} />}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mt: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{t("finance.analytics.cash.inflow")}</Typography>
            <Typography noWrap sx={{ fontSize: "0.82rem", fontWeight: 600 }}>{money(inflow)}</Typography>
          </Box>
          <Box sx={{ minWidth: 0, textAlign: "right" }}>
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{t("finance.analytics.cash.outflow")}</Typography>
            <Typography noWrap sx={{ fontSize: "0.82rem", fontWeight: 600 }}>{money(outflow)}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const OfficesChart = ({ rows, currency }) => {
  const { t } = useLocale();
  const colors = useFlowColors();

  const offices = rows
    .filter((r) => r.inflow[currency] || r.outflow[currency])
    .sort((a, b) => b.profit[currency] - a.profit[currency]);
  const total = offices.reduce((s, r) => s + r.inflow[currency], 0);

  return (
    <SectionCard
      title={t("finance.offices.cardsTitle")}
      subtitle={t("finance.offices.cardsSubtitle")}
      action={
        <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 2 }}>
          {[
            { label: t("finance.analytics.cash.outflow"), color: colors.outflow },
            { label: t("finance.analytics.kpi.profit"), color: colors.inflow },
          ].map((item) => (
            <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "2px", backgroundColor: item.color }} />
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{item.label}</Typography>
            </Box>
          ))}
        </Box>
      }
    >
      {offices.length === 0 ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 2 }}>
          {offices.map((office, i) => (
            <OfficeCard key={office.guid} office={office} currency={currency} rank={i + 1} total={total} colors={colors} />
          ))}
        </Box>
      )}
    </SectionCard>
  );
};

export default OfficesChart;
