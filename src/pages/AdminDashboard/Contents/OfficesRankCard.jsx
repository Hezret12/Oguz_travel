import { Box, Typography } from "@mui/material";
import { useLocale } from "../../../hooks/useLocale";
import SectionCard, { EmptyState } from "../../Finance/Overview/Contents/SectionCard";
import { formatAmount, formatPercent, percentOf } from "../../Finance/Overview/functions/analyticsFormat";
import { BOTH_CURRENCIES } from "../../Finance/Overview/functions/dashboardData";
import { AmountLines, Delta } from "./ChartParts";

const GRID = {
  display: "grid",
  gridTemplateColumns: {
    xs: "22px minmax(0,1fr) auto",
    md: "22px minmax(140px,1.4fr) minmax(120px,1fr) minmax(160px,1fr) 64px",
  },
  alignItems: "center",
  columnGap: 2,
};
const numSx = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const headSx = { fontSize: "0.72rem", fontWeight: 600, color: "text.secondary" };
const lineSx = { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.25 };

// Offices ranked by sales, TMT first then USD (the two are never added), with
// each currency's profit, its change vs the previous period and the margin.
// Shown only while the dashboard covers every office.
const OfficesRankCard = ({ offices }) => {
  const { t, selectedLang } = useLocale();
  const rows = offices
    .filter((o) => BOTH_CURRENCIES.some((c) => o[c].sale > 0 || o[c].profit !== 0))
    .sort((a, b) => b.TMT.sale - a.TMT.sale || b.USD.sale - a.USD.sale);
  const pick = (o, field) => Object.fromEntries(BOTH_CURRENCIES.map((c) => [c, o[c][field]]));

  return (
    <SectionCard title={t("dashboard.officesTitle")} subtitle={t("dashboard.officesSubtitle")}>
      {rows.length === 0 ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : (
        <Box>
          <Box sx={{ ...GRID, pb: 1, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography sx={headSx}>№</Typography>
            <Typography sx={headSx}>{t("columns.office")}</Typography>
            <Typography sx={{ ...headSx, ...numSx }}>{t("dashboard.sales")}</Typography>
            <Typography sx={{ ...headSx, ...numSx, display: { xs: "none", md: "block" } }}>{t("dashboard.profit")}</Typography>
            <Typography sx={{ ...headSx, ...numSx, display: { xs: "none", md: "block" } }}>
              {t("finance.analytics.categories.margin")}
            </Typography>
          </Box>

          {rows.map((o, i) => (
            <Box
              key={o.guid}
              sx={{ ...GRID, py: 1.5, borderBottom: "1px solid", borderColor: "divider", "&:last-of-type": { borderBottom: 0 } }}
            >
              <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                {i + 1}
              </Typography>
              <Typography noWrap sx={{ fontSize: "0.875rem", fontWeight: 600, minWidth: 0 }}>
                {selectedLang(o.name)}
              </Typography>
              <Box sx={{ fontSize: "0.875rem" }}>
                <AmountLines values={pick(o, "sale")} />
              </Box>
              <Box sx={{ ...lineSx, display: { xs: "none", md: "flex" } }}>
                {BOTH_CURRENCIES.map((c) => (
                  <Box key={c} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Typography
                      sx={{
                        ...numSx,
                        fontSize: "0.875rem",
                        color: !o[c].profit ? "text.disabled" : o[c].profit < 0 ? "error.main" : "text.primary",
                      }}
                    >
                      {o[c].profit ? formatAmount(o[c].profit, c) : `— ${c}`}
                    </Typography>
                    {o[c].profit !== 0 && <Delta change={o[c].profitChange || null} upIsGood />}
                  </Box>
                ))}
              </Box>
              <Box sx={{ ...lineSx, display: { xs: "none", md: "flex" } }}>
                {BOTH_CURRENCIES.map((c) => (
                  <Typography key={c} sx={{ ...numSx, fontSize: "0.8rem", color: "text.secondary" }}>
                    {o[c].sale ? formatPercent(percentOf(o[c].profit, o[c].sale)) : "—"}
                  </Typography>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
};

export default OfficesRankCard;
