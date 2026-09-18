import { Box, Typography } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, ShareBar } from "./SectionCard";
import { formatAmount, formatPercent, percentOf } from "../functions/analyticsFormat";

const amountSx = {
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
  textAlign: "right",
};

// Where money came from / went to, as a ranked list with share bars in one
// hue (magnitude, not identity). `items`: [{ key, name, group, USD, TMT }].
//
// Many items move money in both currencies (e.g. visa sold for $ and TMT).
// The two are never added or converted: ranking, share bar and % use the
// selected currency, and the other currency's amount is listed under it so
// nothing is hidden — including items that only moved the other currency.
const FlowBreakdownCard = ({ title, subtitle, items, currency, color }) => {
  const { t, selectedLang } = useLocale();
  const other = currency === "USD" ? "TMT" : "USD";

  const rows = items
    .filter((i) => i[currency] > 0 || i[other] > 0)
    .sort((a, b) => b[currency] - a[currency] || b[other] - a[other]);
  const total = rows.reduce((sum, i) => sum + (i[currency] || 0), 0);
  const otherTotal = rows.reduce((sum, i) => sum + (i[other] || 0), 0);
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
          <Typography sx={{ ...amountSx, fontSize: "1rem", fontWeight: 600 }}>
            {formatAmount(total, currency)}
          </Typography>
          {otherTotal > 0 && (
            <Typography sx={{ ...amountSx, fontSize: "0.72rem", color: "text.secondary" }}>
              {formatAmount(otherTotal, other)}
            </Typography>
          )}
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
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <Typography
                    sx={{
                      ...amountSx,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: r[currency] > 0 ? "text.primary" : "text.disabled",
                    }}
                  >
                    {r[currency] > 0 ? formatAmount(r[currency], currency) : "—"}
                  </Typography>
                  {r[other] > 0 && (
                    <Typography sx={{ ...amountSx, fontSize: "0.72rem", color: "text.secondary", mt: 0.25 }}>
                      {formatAmount(r[other], other)}
                    </Typography>
                  )}
                </Box>
                <Typography
                  sx={{ ...amountSx, width: 40, fontSize: "0.75rem", color: "text.secondary" }}
                >
                  {r[currency] > 0 ? formatPercent(percentOf(r[currency], total), 0) : "—"}
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
