import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import SectionCard, { EmptyState, ShareBar } from "../../Overview/Contents/SectionCard";
import {
  CURRENCIES,
  formatAmount,
  formatPercent,
  percentOf,
  tableSx,
  useSeriesColors,
} from "../../Overview/functions/analyticsFormat";

const GROUPS = ["inflow", "outflow", "profit"];
const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
// A hairline before each money group keeps USD/TMT pairs together.
const groupStart = { borderLeft: "1px solid", borderLeftColor: "divider", pl: 2 };

const sortValue = (row, by) => (by === "name" ? row.name : row[by.group][by.currency]);

// One total per office: money in, money out and profit, in USD and TMT.
// `currency` is the page's main one: the default sort and the share bar use it.
const OfficesTable = ({ rows, totals, currency: mainCurrency }) => {
  const { t } = useLocale();
  const colors = useSeriesColors();
  const [sort, setSort] = useState({ by: { group: "inflow", currency: mainCurrency }, dir: "desc" });

  const groupLabel = {
    inflow: t("finance.analytics.cash.inflow"),
    outflow: t("finance.analytics.cash.outflow"),
    profit: t("finance.analytics.kpi.profit"),
  };

  const isActive = (by) =>
    by === "name" ? sort.by === "name" : sort.by !== "name" && sort.by.group === by.group && sort.by.currency === by.currency;

  const toggleSort = (by) =>
    setSort((prev) => ({
      by,
      dir: isActive(by) ? (prev.dir === "asc" ? "desc" : "asc") : by === "name" ? "asc" : "desc",
    }));

  const sorted = [...rows].sort((a, b) => {
    const av = sortValue(a, sort.by);
    const bv = sortValue(b, sort.by);
    const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
    return sort.dir === "asc" ? cmp : -cmp;
  });

  const amountCell = (value, currency, group, isFirst) => (
    <TableCell
      key={`${group}-${currency}`}
      sx={{
        ...num,
        ...(isFirst ? groupStart : {}),
        fontWeight: group === "profit" ? 700 : 500,
        color: value < 0 ? "error.main" : currency === "TMT" ? "text.secondary" : "text.primary",
      }}
    >
      {formatAmount(value, currency)}
    </TableCell>
  );

  return (
    <SectionCard title={t("finance.offices.tableTitle")} subtitle={t("finance.offices.tableSubtitle")}>
      {rows.length === 0 ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : (
        <TableContainer>
          <Table
            size="small"
            sx={[
              tableSx,
              {
                minWidth: 760,
                // tableSx trims the first cell of every row; the second header
                // row starts with a money group, which keeps its padding.
                "& .MuiTableHead-root .MuiTableRow-root:nth-of-type(2) .MuiTableCell-root:first-of-type": { pl: 2 },
              },
            ]}
          >
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} sx={{ verticalAlign: "bottom" }}>
                  <TableSortLabel
                    active={isActive("name")}
                    direction={isActive("name") ? sort.dir : "asc"}
                    onClick={() => toggleSort("name")}
                  >
                    {t("finance.offices.office")}
                  </TableSortLabel>
                </TableCell>
                {GROUPS.map((group) => (
                  <TableCell
                    key={group}
                    colSpan={2}
                    sx={{ ...groupStart, textAlign: "center", color: "text.primary", fontWeight: 700, borderBottom: 0, pb: 0 }}
                  >
                    {groupLabel[group]}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                {GROUPS.flatMap((group) =>
                  CURRENCIES.map((currency, i) => {
                    const by = { group, currency };
                    return (
                      <TableCell key={`${group}-${currency}`} sx={{ ...num, ...(i === 0 ? groupStart : {}) }}>
                        <TableSortLabel
                          active={isActive(by)}
                          direction={isActive(by) ? sort.dir : "desc"}
                          onClick={() => toggleSort(by)}
                        >
                          {currency}
                        </TableSortLabel>
                      </TableCell>
                    );
                  }),
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((row) => {
                const share = percentOf(row.inflow[mainCurrency], totals.inflow[mainCurrency]);
                return (
                  <TableRow key={row.guid} hover>
                    <TableCell sx={{ minWidth: 170 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                        <Typography noWrap sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                          {row.name}
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                          {formatPercent(share, 0)}
                        </Typography>
                      </Box>
                      {/* Share of all offices' money in, in the main currency. */}
                      <ShareBar value={share} color={colors.inflow} />
                    </TableCell>
                    {GROUPS.flatMap((group) =>
                      CURRENCIES.map((currency, i) => amountCell(row[group][currency], currency, group, i === 0)),
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>{t("finance.analytics.total")}</TableCell>
                {GROUPS.flatMap((group) =>
                  CURRENCIES.map((currency, i) => (
                    <TableCell
                      key={`${group}-${currency}`}
                      sx={{ ...num, ...(i === 0 ? groupStart : {}), color: totals[group][currency] < 0 ? "error.main" : "text.primary" }}
                    >
                      {formatAmount(totals[group][currency], currency)}
                    </TableCell>
                  )),
                )}
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
};

export default OfficesTable;
