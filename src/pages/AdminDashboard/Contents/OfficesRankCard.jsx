import { Box, Typography } from "@mui/material";
import { useLocale } from "../../../hooks/useLocale";
import SectionCard, { EmptyState } from "../../Finance/Overview/Contents/SectionCard";
import {
  formatAmount,
  formatPercent,
  percentOf,
  useDashboardColors,
} from "../../Finance/Overview/functions/analyticsFormat";
import { Delta } from "./ChartParts";

const GRID = {
  display: "grid",
  gridTemplateColumns: {
    xs: "22px minmax(0,1fr) auto",
    md: "22px minmax(140px,1.6fr) minmax(120px,1fr) minmax(110px,0.9fr) 64px",
  },
  alignItems: "center",
  columnGap: 2,
};
const numSx = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const headSx = { fontSize: "0.72rem", fontWeight: 600, color: "text.secondary" };

// Offices ranked by sales: the bar is each office's share of all sales, then
// profit with its change vs the previous period and the margin. Shown only
// while the dashboard covers every office.
const OfficesRankCard = ({ offices, currency }) => {
  const { t, selectedLang } = useLocale();
  const colors = useDashboardColors();
  const rows = offices.filter((o) => o.sale > 0 || o.profit !== 0).sort((a, b) => b.sale - a.sale);
  const totalSale = rows.reduce((sum, o) => sum + o.sale, 0);
  const maxSale = Math.max(1, ...rows.map((o) => o.sale));
  const money = (v) => formatAmount(v, currency);

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

          {rows.map((o, i) => {
            const share = percentOf(o.sale, totalSale);
            return (
              <Box
                key={o.guid}
                sx={{ ...GRID, py: 1.5, borderBottom: "1px solid", borderColor: "divider", "&:last-of-type": { borderBottom: 0 } }}
              >
                <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                  {i + 1}
                </Typography>
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.6 }}>
                    <Typography noWrap sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                      {selectedLang(o.name)}
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                      {formatPercent(share, 0)}
                    </Typography>
                  </Box>
                  {/* Bar length is relative to the leading office, so the top one fills the track */}
                  <Box sx={{ height: 6, borderRadius: 3, backgroundColor: "action.hover", overflow: "hidden" }}>
                    <Box
                      sx={{
                        width: `${Math.max(1, (o.sale / maxSale) * 100)}%`,
                        height: "100%",
                        borderRadius: 3,
                        backgroundColor: colors.sale,
                        transition: "width .4s ease",
                      }}
                    />
                  </Box>
                </Box>
                <Typography sx={{ ...numSx, fontSize: "0.875rem", fontWeight: 600 }}>{money(o.sale)}</Typography>
                <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "flex-end", alignItems: "center", gap: 0.75 }}>
                  <Typography sx={{ ...numSx, fontSize: "0.875rem", color: o.profit < 0 ? "error.main" : "text.primary" }}>
                    {money(o.profit)}
                  </Typography>
                  <Delta change={o.profitChange || null} upIsGood />
                </Box>
                <Typography sx={{ ...numSx, fontSize: "0.8rem", color: "text.secondary", display: { xs: "none", md: "block" } }}>
                  {o.sale ? formatPercent(percentOf(o.profit, o.sale)) : "—"}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </SectionCard>
  );
};

export default OfficesRankCard;
