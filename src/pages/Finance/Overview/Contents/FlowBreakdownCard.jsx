import { Box, Typography } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, ShareBar } from "./SectionCard";
import { formatAmount, formatPercent, percentOf } from "../functions/analyticsFormat";

// Where money came from / went to, as a ranked list with share bars in one
// hue (magnitude, not identity). `items`: [{ key, name, group, USD, TMT }].
const FlowBreakdownCard = ({ title, subtitle, items, currency, color }) => {
  const { t, selectedLang } = useLocale();

  const rows = items
    .filter((i) => i[currency] > 0)
    .sort((a, b) => b[currency] - a[currency]);
  const total = rows.reduce((sum, i) => sum + i[currency], 0);
  const max = rows[0]?.[currency] || 1;

  return (
    <SectionCard
      title={title}
      subtitle={subtitle}
      action={
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
            {t("finance.analytics.total")}
          </Typography>
          <Typography sx={{ fontSize: "1rem", fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            {formatAmount(total, currency)}
          </Typography>
        </Box>
      }
    >
      {rows.length === 0 ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {rows.map((r, index) => (
            <Box
              component="li"
              key={r.key}
              sx={{
                py: 1.25,
                borderTop: index === 0 ? "none" : "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mb: 0.75 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap component="span" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    {selectedLang(r.name)}
                  </Typography>
                  {/* The exchange row is its own group; do not repeat its name. */}
                  {r.group !== "exchange" && (
                    <Typography noWrap component="span" sx={{ fontSize: "0.72rem", color: "text.secondary", ml: 1 }}>
                      {t(`finance.analytics.flow.groups.${r.group}`)}
                    </Typography>
                  )}
                </Box>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {formatAmount(r[currency], currency)}
                </Typography>
                <Typography
                  sx={{ width: 40, textAlign: "right", fontSize: "0.75rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}
                >
                  {formatPercent(percentOf(r[currency], total), 0)}
                </Typography>
              </Box>
              {/* Scaled to the largest item so the ranking reads at a glance. */}
              <ShareBar value={percentOf(r[currency], max)} color={color} />
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
};

export default FlowBreakdownCard;
