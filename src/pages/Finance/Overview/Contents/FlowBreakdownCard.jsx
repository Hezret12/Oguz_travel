import { useState } from "react";
import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, ViewToggle } from "./SectionCard";
import {
  chartSx,
  formatAmount,
  formatCompactAmount,
  formatPercent,
  percentOf,
  tickLabelStyle,
} from "../functions/analyticsFormat";

const ROW_HEIGHT = 34;
const numCell = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

// Where money came from / went to, as ranked horizontal bars in one hue
// (magnitude, not identity). `items`: [{ key, name, group, USD, TMT }].
const FlowBreakdownCard = ({ title, subtitle, items, currency, color }) => {
  const { t, selectedLang } = useLocale();
  const [view, setView] = useState("chart");

  const rows = items
    .filter((i) => i[currency] > 0)
    .sort((a, b) => b[currency] - a[currency])
    .map((i) => ({ ...i, label: selectedLang(i.name) }));
  const total = rows.reduce((sum, i) => sum + i[currency], 0);

  return (
    <SectionCard
      title={title}
      subtitle={`${subtitle} · ${t("finance.analytics.total")} ${formatAmount(total, currency)}`}
      action={
        <ViewToggle
          value={view}
          onChange={setView}
          chartLabel={t("finance.analytics.trend.chart")}
          tableLabel={t("finance.analytics.trend.table")}
        />
      }
    >
      {rows.length === 0 ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : view === "chart" ? (
        <Box sx={{ mx: -1 }}>
          <BarChart
            layout="horizontal"
            height={rows.length * ROW_HEIGHT + 50}
            hideLegend
            skipAnimation
            borderRadius={4}
            grid={{ vertical: true }}
            yAxis={[
              {
                scaleType: "band",
                data: rows.map((r) => r.label),
                width: 150,
                categoryGapRatio: 0.35,
                tickLabelStyle: { ...tickLabelStyle, fontSize: 12 },
              },
            ]}
            xAxis={[{ valueFormatter: (v) => formatCompactAmount(v, currency), tickLabelStyle }]}
            series={[
              {
                id: "amount",
                data: rows.map((r) => r[currency]),
                color,
                valueFormatter: (v) =>
                  v === null ? "" : `${formatAmount(v, currency)} · ${formatPercent(percentOf(v, total), 0)}`,
              },
            ]}
            sx={chartSx}
          />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("finance.analytics.flow.item")}</TableCell>
                <TableCell>{t("finance.analytics.flow.group")}</TableCell>
                <TableCell sx={numCell}>{t("finance.analytics.flow.amount")}</TableCell>
                <TableCell sx={numCell}>%</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.key} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{r.label}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={t(`finance.analytics.flow.groups.${r.group}`)}
                      sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ ...numCell, fontWeight: 700 }}>{formatAmount(r[currency], currency)}</TableCell>
                  <TableCell sx={numCell}>{formatPercent(percentOf(r[currency], total), 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
};

export default FlowBreakdownCard;
