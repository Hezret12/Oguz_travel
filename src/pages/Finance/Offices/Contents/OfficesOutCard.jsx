import { memo, useState } from "react";
import {
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
import BaseFareLabel from "../../../../components/BaseFareLabel";
import { BASE_FARE_TEXT } from "../../../../functions/baseFare";
import SectionCard, { EmptyState, ViewToggle } from "../../Overview/Contents/SectionCard";
import {
  CURRENCIES,
  formatAmount,
  scrollTableSx,
  stickyFooterSx,
  tableSx,
  useFlowColors,
} from "../../Overview/functions/analyticsFormat";
import { CurrencyPanels, LegendStat, StatRow } from "../../../AdminDashboard/Contents/ChartParts";
import ColumnBreakdown from "../../../AdminDashboard/Contents/ColumnBreakdown";

// What an office's money out is made of, then their sum.
const PARTS = ["cost", "salary", "expense"];
const GROUPS = [...PARTS, "total"];
const num = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
// A hairline before each money group keeps USD/TMT pairs together.
const groupStart = { borderLeft: "1px solid", borderLeftColor: "divider", pl: 2 };

const sortValue = (row, by) => (by === "name" ? row.name : row.out[by.group][by.currency]);

// Money out per office: the cost of its sales (base fare), salaries and kassa
// expenses together. The chart draws that one total as a column per office (a
// panel per currency); the sortable table also lists what it is made of. USD
// and TMT are listed side by side, never added.
const OfficesOutCard = ({ rows, totals, currency: mainCurrency }) => {
  const { t } = useLocale();
  const { outflow } = useFlowColors();
  const [view, setView] = useState("chart");
  const [sort, setSort] = useState({ by: { group: "total", currency: mainCurrency }, dir: "desc" });

  const text = {
    cost: BASE_FARE_TEXT,
    salary: t("finance.analytics.flow.groups.salary"),
    expense: t("finance.analytics.flow.groups.expense"),
    total: t("finance.offices.outTotal"),
  };
  const label = { ...text, cost: <BaseFareLabel /> };

  // Offices with nothing going out in either currency are left out.
  const active = rows.filter((row) => CURRENCIES.some((c) => row.out.total[c] > 0));
  // Only the currencies something went out in get a chart panel.
  const currencies = CURRENCIES.filter((c) => totals.out.total[c] > 0);

  const isActive = (by) =>
    by === "name" ? sort.by === "name" : sort.by !== "name" && sort.by.group === by.group && sort.by.currency === by.currency;
  const toggleSort = (by) =>
    setSort((prev) => ({
      by,
      dir: isActive(by) ? (prev.dir === "asc" ? "desc" : "asc") : by === "name" ? "asc" : "desc",
    }));
  const sorted = [...active].sort((a, b) => {
    const av = sortValue(a, sort.by);
    const bv = sortValue(b, sort.by);
    const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
    return sort.dir === "asc" ? cmp : -cmp;
  });

  // One column per office: its whole money out, in the page's money-out colour.
  const series = [{ id: "total", label: text.total, color: outflow, value: (row, currency) => row.out.total[currency] }];
  const chartLabels = {
    noData: t("finance.analytics.noData"),
    topShown: (count) => t("dashboard.topShown", { count }),
    showAll: (count) => t("dashboard.showAll", { count }),
  };
  const bothAmounts = (group) =>
    CURRENCIES.filter((c) => group[c] > 0)
      .map((c) => formatAmount(group[c], c))
      .join(" · ") || "—";

  return (
    <SectionCard
      title={t("finance.offices.outTitle")}
      subtitle={t("finance.offices.outSubtitle")}
      action={
        <ViewToggle
          value={view}
          onChange={setView}
          chartLabel={t("finance.analytics.trend.chart")}
          tableLabel={t("finance.analytics.trend.table")}
        />
      }
    >
      {active.length === 0 ? (
        <EmptyState>{t("finance.analytics.noData")}</EmptyState>
      ) : (
        <>
          {/* The total of every office; with its swatch it also names the chart's columns */}
          <StatRow>
            <LegendStat color={outflow} shape="bar" label={label.total} value={bothAmounts(totals.out.total)} />
          </StatRow>

          {view === "chart" ? (
            <CurrencyPanels currencies={currencies}>
              {(currency) => (
                <ColumnBreakdown
                  rows={active.map((row) => ({ ...row, key: row.guid, label: row.name }))}
                  currency={currency}
                  series={series}
                  labels={chartLabels}
                  onShowAll={() => setView("table")}
                />
              )}
            </CurrencyPanels>
          ) : (
            <TableContainer sx={scrollTableSx}>
              <Table
                size="small"
                stickyHeader
                sx={[
                  tableSx,
                  stickyFooterSx,
                  {
                    minWidth: 900,
                    // tableSx trims the first cell of every row; the second header
                    // row starts with a money group, which keeps its padding.
                    "& .MuiTableHead-root .MuiTableRow-root:nth-of-type(2) .MuiTableCell-root:first-of-type": { pl: 2 },
                    // Two sticky header rows: the second sits under the first.
                    "& .MuiTableHead-root .MuiTableRow-root:nth-of-type(2) .MuiTableCell-root": { top: 30 },
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
                        sx={{ ...groupStart, height: 30, textAlign: "center", color: "text.primary", fontWeight: 700, borderBottom: 0, pb: 0 }}
                      >
                        {label[group]}
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
                  {sorted.map((row) => (
                    <TableRow key={row.guid} hover>
                      <TableCell sx={{ minWidth: 140 }}>
                        <Typography noWrap sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                          {row.name}
                        </Typography>
                      </TableCell>
                      {GROUPS.flatMap((group) =>
                        CURRENCIES.map((currency, i) => {
                          const value = row.out[group][currency];
                          return (
                            <TableCell
                              key={`${group}-${currency}`}
                              sx={{
                                ...num,
                                ...(i === 0 ? groupStart : {}),
                                fontWeight: group === "total" ? 700 : 500,
                                color: value ? (group === "total" ? "text.primary" : "text.secondary") : "text.disabled",
                              }}
                            >
                              {value ? formatAmount(value, currency) : "—"}
                            </TableCell>
                          );
                        }),
                      )}
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell>{t("finance.analytics.total")}</TableCell>
                    {GROUPS.flatMap((group) =>
                      CURRENCIES.map((currency, i) => (
                        <TableCell key={`${group}-${currency}`} sx={{ ...num, ...(i === 0 ? groupStart : {}) }}>
                          {formatAmount(totals.out[group][currency], currency)}
                        </TableCell>
                      )),
                    )}
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </SectionCard>
  );
};

export default memo(OfficesOutCard);
