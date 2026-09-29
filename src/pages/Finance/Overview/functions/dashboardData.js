import { keepPreviousData, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  getDashboardCardsApi,
  getDashboardCategoriesApi,
  getDashboardChartApi,
  getDashboardOfficesApi,
  getDashboardOperatorsApi,
  getDashboardStatusApi,
} from "../../../../api/queries/getters";
import { getPeriodRange } from "./periods";

/**
 * Data for the dashboard pages (Admin dashboard, Finance overview, Offices report) from the
 * /dashboard/* endpoints, which aggregate tbl_total_calculations:
 *   sale_price = sales, net_price = cost of sales, credit_price = still owed, profit.
 * USD and TMT are reported separately and never added together.
 */

const STALE_MS = 60 * 1000;

// Periods whose backend preset covers the same range as ours; the backend also picks the
// chart grouping from the preset (month for the year, day otherwise). "quarter" (the last
// three complete months) and picked ranges go as explicit dates, grouped by day.
const PRESETS = { thisMonth: "this_month", lastMonth: "last_month", year: "this_year" };

// No offset, so the server reads it as its own local midnight, like the presets.
const LOCAL_DAY = "YYYY-MM-DD[T]00:00:00";

export const toDashboardParams = ({ period, customRange, officeGuid, currency }) => {
  const preset = PRESETS[period];
  let range;
  if (preset) {
    range = { period_preset: preset };
  } else {
    const { start, end } = getPeriodRange(period, customRange);
    range = { start_date: start.format(LOCAL_DAY), end_date: end.format(LOCAL_DAY) };
  }
  return {
    ...range,
    ...(officeGuid ? { office_guid: officeGuid } : {}),
    ...(currency ? { currency } : {}),
  };
};

export const dashboardGranularity = (period) => (period === "year" ? "month" : "day");

// { status, data } envelope from the API's response interceptor.
const unwrap = (res) => res?.data?.data;

const num = (v) => Number(v) || 0;

// Category / office names come as { tk, ru, en }; fall-back names as plain text.
const toI18nName = (name) =>
  name && typeof name === "object" ? name : { tk: name || "—", ru: name || "—", en: name || "—" };

// Backend period keys: "YYYY-MM-DD" per day, "YYYY-MM" per month. (Its ISO-week keys,
// "YYYY-WW", only come with the `last_3_months` preset, which is never sent.)
const isDayKey = (period) => /^\d{4}-\d{2}-\d{2}$/.test(period);
const periodDate = (period) => dayjs(isDayKey(period) ? period : `${period}-01`);

const bucketLabel = (period, sameMonth) =>
  isDayKey(period) ? periodDate(period).format(sameMonth ? "DD" : "DD.MM") : periodDate(period).format("MM.YYYY");

// One `{ value, previous }` per figure and currency. The API sends the change as `difference`.
const toPair = (metric) => ({
  value: num(metric?.value),
  previous: num(metric?.value) - num(metric?.difference),
});

const byCurrency = (metric) => ({ USD: toPair(metric?.usd), TMT: toPair(metric?.tmt) });

const mapCards = (raw) => ({
  count: toPair(raw?.sales_count),
  revenue: byCurrency(raw?.sale_price),
  cost: byCurrency(raw?.net_price),
  receivable: byCurrency(raw?.credit_price),
  profit: byCurrency(raw?.profit),
});

export const EMPTY_CARDS = mapCards(null);

// Chart points in the request's currency; `balance` is the running profit since the start.
const mapChart = (raw) => {
  const rows = Array.isArray(raw) ? raw : [];
  const days = rows.map((r) => String(r.period)).filter(isDayKey);
  const sameMonth = days.length > 0 && days.every((p) => p.slice(0, 7) === days[0].slice(0, 7));
  return rows.map((r) => ({
    key: r.period,
    date: periodDate(r.period).format("YYYY-MM-DD"),
    label: bucketLabel(r.period, sameMonth),
    count: num(r.sales_count),
    revenue: num(r.sale_price),
    cost: num(r.net_price),
    receivable: num(r.credit_price),
    profit: num(r.profit),
    balance: num(r.last_profit),
  }));
};

const toStatus = (s) => ({ count: num(s?.count), amount: num(s?.total_sale) });

const mapStatus = (raw) => ({
  PAID: toStatus(raw?.statuses?.paid),
  NOTPAID: toStatus(raw?.statuses?.notpaid),
  REFUND: toStatus(raw?.statuses?.refund),
  NONE: toStatus(raw?.statuses?.no_status),
});

export const EMPTY_PAYMENT = mapStatus(null);

// Figures sit under the currency key the cards read them from (`row[currency]`).
const mapOperators = (raw, currency) =>
  (Array.isArray(raw) ? raw : []).map((o) => ({
    guid: o.operator_guid,
    fullName: o.operator_name,
    count: num(o.sales_count),
    [currency]: { revenue: num(o.sale_price), profit: num(o.profit) },
  }));

const mapCategories = (raw, currency) =>
  (Array.isArray(raw?.items) ? raw.items : []).map((c) => ({
    key: c.category_guid,
    name: toI18nName(c.category_name),
    count: num(c.sales_count),
    [currency]: { revenue: num(c.sale_price), cost: num(c.net_price), profit: num(c.profit) },
  }));

const pairOf = (m) => ({ USD: num(m?.usd), TMT: num(m?.tmt) });

// Offices report rows: sales as money in, cost of sales as money out.
const mapOffices = (raw) => ({
  rows: (Array.isArray(raw?.offices) ? raw.offices : []).map((o) => ({
    guid: o.office_guid,
    name: toI18nName(o.name),
    inflow: pairOf(o.sale_price),
    outflow: pairOf(o.net_price),
    credit: pairOf(o.credit_price),
    profit: pairOf(o.profit),
  })),
  totals: {
    inflow: pairOf(raw?.jemi?.sale_price),
    outflow: pairOf(raw?.jemi?.net_price),
    credit: pairOf(raw?.jemi?.credit_price),
    profit: pairOf(raw?.jemi?.profit),
  },
});

// The previous result stays on screen while the next one loads.
const useDashboardQuery = (name, apiFn, params, map) =>
  useQuery({
    queryKey: ["dashboard", name, params],
    queryFn: async () => map(unwrap(await apiFn(params))),
    placeholderData: keepPreviousData,
    staleTime: STALE_MS,
  });

export const useDashboardCards = (params) => useDashboardQuery("cards", getDashboardCardsApi, params, mapCards);
export const useDashboardChart = (params) => useDashboardQuery("chart", getDashboardChartApi, params, mapChart);
export const useDashboardStatus = (params) => useDashboardQuery("status", getDashboardStatusApi, params, mapStatus);
export const useDashboardOperators = (params) =>
  useDashboardQuery("operators", getDashboardOperatorsApi, params, (raw) => mapOperators(raw, params.currency));
export const useDashboardCategories = (params) =>
  useDashboardQuery("categories", getDashboardCategoriesApi, params, (raw) => mapCategories(raw, params.currency));
export const useDashboardOffices = (params) => useDashboardQuery("offices", getDashboardOfficesApi, params, mapOffices);

/** Loading / fetching / error flags and a refetch for a group of dashboard queries. */
export const combineQueries = (queries) => ({
  isLoading: queries.some((q) => q.isLoading),
  isFetching: queries.some((q) => q.isFetching),
  isError: queries.some((q) => q.isError),
  updatedAt: Math.max(0, ...queries.map((q) => q.dataUpdatedAt || 0)),
  refetch: () => Promise.all(queries.map((q) => q.refetch())),
});
