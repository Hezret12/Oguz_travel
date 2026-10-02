import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useLocale } from "../../../hooks/useLocale";
import SectionCard, { EmptyState, ShareBar } from "../../Finance/Overview/Contents/SectionCard";
import {
  formatPercent,
  percentOf,
  tableSx,
  useDashboardColors,
} from "../../Finance/Overview/functions/analyticsFormat";
import { BOTH_CURRENCIES } from "../../Finance/Overview/functions/dashboardData";
import { AmountLines } from "./ChartParts";

const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

// Operator ranking by sales count (currency-free), with sales and profit in
// each currency. `scope` (e.g. the selected service's name) is added to the
// subtitle when the list is narrowed.
const OperatorCard = ({ operators, scope }) => {
  const { t } = useLocale();
  const colors = useDashboardColors();
  const subtitle = t("finance.analytics.operators.subtitle");

  const rows = operators
    .filter((o) => BOTH_CURRENCIES.some((c) => o[c].revenue > 0))
    .sort((a, b) => b.count - a.count);
  const totalCount = rows.reduce((sum, o) => sum + o.count, 0);
  const pick = (o, field) => Object.fromEntries(BOTH_CURRENCIES.map((c) => [c, o[c][field]]));

  return (
    <SectionCard
      title={t("finance.analytics.operators.title")}
      subtitle={scope ? `${scope} · ${subtitle}` : subtitle}
    >
      {rows.length === 0 ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : (
        <TableContainer>
          <Table size="small" sx={tableSx}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 32 }}>№</TableCell>
                <TableCell>{t("finance.analytics.operators.operator")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.categories.count")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.kpi.revenue")}</TableCell>
                <TableCell sx={num}>{t("finance.analytics.categories.profit")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((o, index) => {
                const share = percentOf(o.count, totalCount);
                return (
                  <TableRow key={o.guid} hover>
                    <TableCell sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>{index + 1}</TableCell>
                    <TableCell sx={{ minWidth: 170 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                        <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                          {o.fullName}
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                          {formatPercent(share, 0)}
                        </Typography>
                      </Box>
                      <ShareBar value={share} color={colors.sale} />
                    </TableCell>
                    <TableCell sx={num}>{o.count}</TableCell>
                    <TableCell sx={num}>
                      <AmountLines values={pick(o, "revenue")} />
                    </TableCell>
                    <TableCell sx={num}>
                      <AmountLines values={pick(o, "profit")} weight={700} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
};

export default OperatorCard;
