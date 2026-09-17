import { Box, Typography } from "@mui/material";
import { AlertOctagon, AlertTriangle, Clock } from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState } from "./SectionCard";
import { formatAmount } from "../functions/analyticsFormat";

// Status colours are reserved for state and always paired with an icon + label.
const BUCKETS = {
  d0_30: { icon: Clock, color: "info.main" },
  d31_60: { icon: AlertTriangle, color: "warning.main" },
  d60_plus: { icon: AlertOctagon, color: "error.main" },
};

const ageBucket = (days) => (days > 60 ? "d60_plus" : days > 30 ? "d31_60" : "d0_30");

// Unpaid sales by age, plus the largest open balances.
const ReceivablesCard = ({ receivables, currency }) => {
  const { t, selectedLang } = useLocale();
  const items = receivables.items
    .filter((i) => i.currency === currency && i.due > 0)
    .sort((a, b) => b.due - a.due)
    .slice(0, 5);

  return (
    <SectionCard
      title={t("finance.analytics.receivables.title")}
      subtitle={t("finance.analytics.receivables.subtitle")}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          columnGap: 2,
          px: 2,
          py: 1.25,
          borderRadius: "10px",
          border: "1px solid",
          borderColor: "divider",
          "& > *:not(:first-of-type)": { pl: 2, borderLeft: "1px solid", borderColor: "divider" },
        }}
      >
        {receivables.buckets.map((b) => {
          const { icon: Icon, color } = BUCKETS[b.key];
          return (
            <Box key={b.key} sx={{ minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ color, display: "flex" }}>
                  <Icon size={13} />
                </Box>
                <Typography noWrap sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                  {t(`finance.analytics.receivables.${b.key}`)}
                </Typography>
              </Box>
              <Typography noWrap sx={{ mt: 0.25, fontWeight: 600, fontSize: "1.05rem", fontVariantNumeric: "tabular-nums" }}>
                {formatAmount(b[currency], currency)}
              </Typography>
              <Typography noWrap sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                {t("finance.analytics.receivables.salesCount", { count: b.count })}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "text.secondary", mt: 0.5 }}>
        {t("finance.analytics.receivables.largest")}
      </Typography>

      {items.length === 0 ? (
        <EmptyState>{t("finance.analytics.receivables.empty")}</EmptyState>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {items.map((i, index) => {
            const { icon: Icon, color } = BUCKETS[ageBucket(i.days)];
            return (
              <Box
                key={i.guid}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  py: 1,
                  borderTop: index === 0 ? "none" : "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    {selectedLang(i.category)} · {i.operator}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: "0.72rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                    <Box component="span" sx={{ color, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 0.5, verticalAlign: "middle" }}>
                      <Icon size={11} />
                      {t("finance.analytics.receivables.daysOpen", { count: i.days })}
                    </Box>{" "}
                    ·{" "}
                    {t("finance.analytics.receivables.paidOf", {
                      paid: formatAmount(i.paid, currency),
                      sale: formatAmount(i.sale, currency),
                    })}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {formatAmount(i.due, currency)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </SectionCard>
  );
};

export default ReceivablesCard;
