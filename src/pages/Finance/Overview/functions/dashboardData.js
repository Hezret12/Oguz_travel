import { keepPreviousData, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  getDashboardCardsApi,
  getDashboardCategoriesApi,
  getDashboardCategoryAnalyticsApi,
  getDashboardChartApi,
  getDashboardMoneyOutApi,
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

// The bucket size the API picks for a period (see intervalFor on the server):
// the month presets by day, the year by month, a picked range by its length —
// about a month by day, about half a year by week, longer by month.
export const dashboardGranularity = (period, customRange) => {
  if (period === "year") return "month";
  if (period === "thisMonth" || period === "lastMonth") return "day";
  const { start, end } = getPeriodRange(period, customRange);
  const days = end.diff(start, "day", true);
  return days <= 45 ? "day" : days <= 190 ? "week" : "month";
};

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

// Day and week buckets are keyed by date: "DD" within one month, "DD.MM" within
// one year, "DD.MM.YY" across years. Months read "MM.YYYY".
const bucketLabel = (period, sameMonth, sameYear = true) =>
  isDayKey(period)
    ? periodDate(period).format(sameMonth ? "DD" : sameYear ? "DD.MM" : "DD.MM.YY")
    : periodDate(period).format("MM.YYYY");

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
  // Not a sale: locked months' salaries and USD bonuses (no chart bucket).
  salary: byCurrency(raw?.salary),
});

export const EMPTY_CARDS = mapCards(null);

// The running presets come filled with zeros up to the month / year end; the days and
// months still to come are cut, so the lines don't fall to zero after today.
const RUNNING_PRESETS = new Set(["this_month", "this_year"]);
const isRunning = (params) => RUNNING_PRESETS.has(params?.period_preset);
const notYet = (date, unit) => date.isAfter(dayjs(), unit);

// Chart points in the request's currency; `balance` is the running profit since the start.
// The series has no credit, so the receivable card shows no sparkline.
const mapChart = (raw, params) => {
  const all = Array.isArray(raw) ? raw : [];
  const rows = isRunning(params)
    ? all.filter((r) => !notYet(periodDate(r.period), isDayKey(r.period) ? "day" : "month"))
    : all;
  const days = rows.map((r) => String(r.period)).filter(isDayKey);
  const sameMonth = days.length > 0 && days.every((p) => p.slice(0, 7) === days[0].slice(0, 7));
  const sameYear = days.every((p) => p.slice(0, 4) === days[0].slice(0, 4));
  return rows.map((r) => ({
    key: r.period,
    date: periodDate(r.period).format("YYYY-MM-DD"),
    label: bucketLabel(r.period, sameMonth, sameYear),
    count: num(r.sales_count),
    revenue: num(r.sale_price),
    cost: num(r.net_price),
    profit: num(r.profit),
    balance: num(r.last_profit),
  }));
};

// Money out by group; `byPeriod` is keyed like the chart buckets ("YYYY-MM-DD" / "YYYY-MM").
const toOutGroups = (g) => ({ cost: num(g?.cost), salary: num(g?.salary), expense: num(g?.expense) });
const mapMoneyOut = (raw) => ({
  totals: toOutGroups(raw?.totals),
  previous: toOutGroups(raw?.previous),
  byPeriod: new Map((Array.isArray(raw?.series) ? raw.series : []).map((r) => [String(r.period), toOutGroups(r)])),
});

export const EMPTY_MONEY_OUT = mapMoneyOut(null);

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

// One office row in one currency (the endpoint answers per currency).
const mapOffices = (raw) =>
  (Array.isArray(raw) ? raw : []).map((o) => ({
    guid: o.office_guid,
    name: toI18nName(o.name),
    sale: num(o.sale_price),
    net: num(o.net_price),
    profit: num(o.profit),
    profitChange: num(o.profit_change_percentage),
  }));

// A change percentage is null where the previous period has nothing to compare with.
const changeOrNull = (percentage, hasPrevious) => (hasPrevious ? num(percentage) : null);

// Points carry a sortable `key` ("YYYY-MM-DD" per day / week, "YYYY-MM" per month).
// An older API sent only the preformatted label: "MM.YYYY", or "DD.MM" in the current year.
const labelIsAhead = (label) => {
  const [first, second] = String(label).split(".");
  return second?.length === 4
    ? notYet(dayjs(`${second}-${first}-01`), "month")
    : notYet(dayjs(`${dayjs().year()}-${second}-${first}`), "day");
};

// One service (or all): totals, change vs the previous period and the chart.
const mapCategoryAnalytics = (raw, params) => {
  const points = Array.isArray(raw?.chart) ? raw.chart : [];
  const isAhead = (p) =>
    p.key ? notYet(periodDate(p.key), isDayKey(p.key) ? "day" : "month") : labelIsAhead(p.label);
  const chart = (isRunning(params) ? points.filter((p) => !isAhead(p)) : points).map((p) => ({
    key: p.key ?? p.label,
    label: p.label,
    sale: num(p.sale),
    profit: num(p.profit),
    prevSale: num(p.prev_sale),
  }));
  // The API reports +100% when the previous period is empty; show no change then.
  const hasPrevious = chart.some((p) => p.prevSale !== 0);
  return {
    sale: num(raw?.total_sale),
    profit: num(raw?.total_profit),
    credit: num(raw?.total_credit),
    count: num(raw?.total_count),
    refunds: num(raw?.total_refund_count),
    saleChange: changeOrNull(raw?.comparison?.sale_percentage, hasPrevious),
    profitChange: changeOrNull(raw?.comparison?.profit_percentage, hasPrevious),
    chart,
  };
};

export const EMPTY_CATEGORY_ANALYTICS = mapCategoryAnalytics(null);

// The previous result stays on screen while the next one loads.
const useDashboardQuery = (name, apiFn, params, map, options = {}) =>
  useQuery({
    queryKey: ["dashboard", name, params],
    queryFn: async () => map(unwrap(await apiFn(params))),
    placeholderData: keepPreviousData,
    staleTime: STALE_MS,
    ...options,
  });

export const useDashboardCards = (params) => useDashboardQuery("cards", getDashboardCardsApi, params, mapCards);
export const useDashboardChart = (params) =>
  useDashboardQuery("chart", getDashboardChartApi, params, (raw) => mapChart(raw, params));
export const useDashboardMoneyOut = (params) =>
  useDashboardQuery("moneyOut", getDashboardMoneyOutApi, params, mapMoneyOut);
export const useDashboardStatus = (params) => useDashboardQuery("status", getDashboardStatusApi, params, mapStatus);
export const useDashboardOperators = (params) =>
  useDashboardQuery("operators", getDashboardOperatorsApi, params, (raw) => mapOperators(raw, params.currency));
export const useDashboardCategories = (params) =>
  useDashboardQuery("categories", getDashboardCategoriesApi, params, (raw) => mapCategories(raw, params.currency));
export const useDashboardCategoryAnalytics = (params) =>
  useDashboardQuery("categoryAnalytics", getDashboardCategoryAnalyticsApi, params, (raw) =>
    mapCategoryAnalytics(raw, params),
  );
export const useDashboardOffices = (params, options) =>
  useDashboardQuery("offices", getDashboardOfficesApi, params, mapOffices, options);

/** Loading / fetching / error flags and a refetch for a group of dashboard queries. */
export const combineQueries = (queries) => ({
  isLoading: queries.some((q) => q.isLoading),
  isFetching: queries.some((q) => q.isFetching),
  isError: queries.some((q) => q.isError),
  updatedAt: Math.max(0, ...queries.map((q) => q.dataUpdatedAt || 0)),
  refetch: () => Promise.all(queries.map((q) => q.refetch())),
});
