import { Avatar, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, ShareBar } from "./SectionCard";
import { formatAmount, formatPercent, percentOf, useSeriesColors } from "../functions/analyticsFormat";

const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

// Operator ranking by sales in the selected currency.
const OperatorCard = ({ operators, currency }) => {
  const { t } = useLocale();
  const colors = useSeriesColors();

  const rows = operators
    .filter((o) => o[currency].revenue > 0)
    .sort((a, b) => b[currency].revenue - a[currency].revenue);
  const totalRevenue = rows.reduce((sum, o) => sum + o[currency].revenue, 0);

  return (
    <SectionCard
      title={t("finance.analytics.operators.title")}
      subtitle={t("finance.analytics.operators.subtitle")}
    >
      {rows.length === 0 ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : (
        <TableContainer>
          <Table size="small">
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
                const share = percentOf(o[currency].revenue, totalRevenue);
                return (
                  <TableRow key={o.guid} hover>
                    <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>{index + 1}</TableCell>
                    <TableCell sx={{ minWidth: 190 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", fontWeight: 700, bgcolor: "action.selected", color: "text.primary" }}>
                          {initials(o.fullName)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                            <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                              {o.fullName}
                            </Typography>
                            <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                              {formatPercent(share, 0)}
                            </Typography>
                          </Box>
                          <ShareBar value={share} color={colors.revenue} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={num}>{o.count}</TableCell>
                    <TableCell sx={{ ...num, fontWeight: 600 }}>{formatAmount(o[currency].revenue, currency)}</TableCell>
                    <TableCell sx={{ ...num, fontWeight: 700 }}>{formatAmount(o[currency].profit, currency)}</TableCell>
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
