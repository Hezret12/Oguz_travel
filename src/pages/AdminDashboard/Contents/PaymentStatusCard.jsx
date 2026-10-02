import { Box, Tooltip, Typography } from "@mui/material";
import { CheckCircle2, CircleDashed, Clock, RotateCcw } from "lucide-react";
import { useLocale } from "../../../hooks/useLocale";
import SectionCard, { EmptyState } from "../../Finance/Overview/Contents/SectionCard";
import { formatAmount, formatPercent, percentOf } from "../../Finance/Overview/functions/analyticsFormat";
import { BOTH_CURRENCIES } from "../../Finance/Overview/functions/dashboardData";
import { AmountLines } from "./ChartParts";
import { SALES_PAYMENT_STATUS_CONFIG } from "../../../functions/statusChipConfigs";

const STATUSES = [
  { key: "PAID", icon: CheckCircle2, color: SALES_PAYMENT_STATUS_CONFIG.PAID.color, labelKey: "paymentPaid" },
  { key: "NOTPAID", icon: Clock, color: SALES_PAYMENT_STATUS_CONFIG.NOTPAID.color, labelKey: "paymentCredit" },
  { key: "REFUND", icon: RotateCcw, color: SALES_PAYMENT_STATUS_CONFIG.REFUND.color, labelKey: "paymentRefunded" },
  { key: "NONE", icon: CircleDashed, color: null, labelKey: "dashboard.noStatus" },
];

// How the period's sales stand on payment: the receivable in both currencies
// up top, then one segmented bar (share of sales count) and a row per status
// with its count and its amount in each currency. `payment` is { TMT, USD };
// the count is the currency-free one, the same in both.
const PaymentStatusCard = ({ payment, receivable }) => {
  const { t } = useLocale();
  const items = STATUSES.map((s) => ({
    ...s,
    count: payment.TMT[s.key].countAll,
    amounts: Object.fromEntries(BOTH_CURRENCIES.map((c) => [c, payment[c][s.key].amount])),
  })).filter((s) => s.count > 0);
  const totalCount = items.reduce((sum, s) => sum + s.count, 0);

  return (
    <SectionCard title={t("dashboard.paymentTitle")} subtitle={t("dashboard.paymentSubtitle")}>
      {totalCount === 0 ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : (
        <>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{t("dashboard.receivable")}</Typography>
            {BOTH_CURRENCIES.map((currency) => (
              <Typography
                key={currency}
                sx={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}
              >
                {formatAmount(receivable[currency], currency)}
              </Typography>
            ))}
          </Box>

          {/* One bar, segments separated by a 2px surface gap */}
          <Box sx={{ display: "flex", gap: "2px", height: 10, borderRadius: 5, overflow: "hidden" }}>
            {items.map((s) => (
              <Tooltip key={s.key} title={`${t(s.labelKey)} · ${s.count}`} arrow>
                <Box
                  sx={{
                    width: `${percentOf(s.count, totalCount)}%`,
                    minWidth: 4,
                    backgroundColor: s.color || "text.disabled",
                  }}
                />
              </Tooltip>
            ))}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {items.map((s) => {
              const Icon = s.icon;
              return (
                <Box
                  key={s.key}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "20px minmax(0,1fr) auto 44px",
                    alignItems: "center",
                    gap: 1.25,
                    py: 0.9,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-of-type": { borderBottom: 0 },
                  }}
                >
                  <Box sx={{ display: "flex", color: s.color || "text.secondary" }}>
                    <Icon size={17} strokeWidth={2.2} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                      {t(s.labelKey)}
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                      {t("dashboard.salesN", { count: s.count })}
                    </Typography>
                  </Box>
                  <Box sx={{ fontSize: "0.875rem" }}>
                    <AmountLines values={s.amounts} />
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {formatPercent(percentOf(s.count, totalCount), 0)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </SectionCard>
  );
};

export default PaymentStatusCard;
