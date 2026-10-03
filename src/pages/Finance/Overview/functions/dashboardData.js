import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";
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
  // Every sale once, whatever its currency (a visa priced in both is one sale).
  // An API without it gives the request currency's count.
  countAll: toPair(raw?.sales_count_all ?? raw?.sales_count),
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
    countAll: num(r.count_all ?? r.sales_count),
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

const toStatus = (s) => ({ count: num(s?.count), countAll: num(s?.count_all ?? s?.count), amount: num(s?.total_sale) });

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
    countAll: o.count_all == null ? null : num(o.count_all),
    [currency]: { revenue: num(o.sale_price), profit: num(o.profit) },
  }));

const mapCategories = (raw, currency) =>
  (Array.isArray(raw?.items) ? raw.items : []).map((c) => ({
    key: c.category_guid,
    name: toI18nName(c.category_name),
    count: num(c.sales_count),
    countAll: c.count_all == null ? null : num(c.count_all),
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
export const useDashboardOffices = (params, options) =>
  useDashboardQuery("offices", getDashboardOfficesApi, params, mapOffices, options);

// ── Both currencies at once ────────────────────────────────────────────────
// The endpoints answer in one currency, so a page that shows TMT and USD side
// by side asks once per currency. The figures stay apart; only the sales count
// is shared (`countAll`).
export const BOTH_CURRENCIES = ["TMT", "USD"];

// One query per currency merged into `{ TMT, USD }`; it behaves like a single
// query for combineQueries. `params` carries no currency of its own.
const useDashboardQueryByCurrency = (name, apiFn, params, map, options = {}) =>
  useQueries({
    queries: BOTH_CURRENCIES.map((currency) => {
      const currencyParams = { ...params, currency };
      return {
        queryKey: ["dashboard", name, currencyParams],
        queryFn: async () => map(unwrap(await apiFn(currencyParams)), currencyParams),
        placeholderData: keepPreviousData,
        staleTime: STALE_MS,
        ...options,
      };
    }),
    combine: (results) => ({
      data: results.every((r) => r.data)
        ? Object.fromEntries(BOTH_CURRENCIES.map((currency, i) => [currency, results[i].data]))
        : undefined,
      isLoading: results.some((r) => r.isLoading),
      isFetching: results.some((r) => r.isFetching),
      isError: results.some((r) => r.isError),
      dataUpdatedAt: Math.max(0, ...results.map((r) => r.dataUpdatedAt || 0)),
      refetch: () => Promise.all(results.map((r) => r.refetch())),
    }),
  });

// Rows of both currencies joined by `idKey`; each keeps its figures under
// `TMT` / `USD` (zeros where a currency has none). `count` is the
// currency-free count, or the two counts added on an API without it.
const ZERO_FIGURES = { revenue: 0, cost: 0, profit: 0 };
const mergeByCurrency = (byCurrency, idKey) => {
  const rows = new Map();
  BOTH_CURRENCIES.forEach((currency) => {
    (byCurrency?.[currency] ?? []).forEach((item) => {
      const row = rows.get(item[idKey]) ?? {
        ...item,
        count: 0,
        countAll: null,
        ...Object.fromEntries(BOTH_CURRENCIES.map((c) => [c, ZERO_FIGURES])),
      };
      row.count += item.count;
      row.countAll = row.countAll ?? item.countAll;
      row[currency] = item[currency];
      rows.set(item[idKey], row);
    });
  });
  return [...rows.values()].map(({ countAll, ...row }) => ({ ...row, count: countAll ?? row.count }));
};

// Chart buckets of both currencies by key: amounts per currency, one count.
// Week buckets only come where there are sales, so the two lists can differ;
// the keys ("YYYY-MM-DD" / "YYYY-MM") sort as text.
const EMPTY_BUCKET = { count: 0, countAll: 0, revenue: 0, cost: 0, profit: 0, balance: 0 };
const mergeBuckets = (byCurrency) => {
  const byKey = new Map();
  BOTH_CURRENCIES.forEach((currency) => {
    (byCurrency?.[currency] ?? []).forEach((bucket) => {
      const row = byKey.get(bucket.key) ?? {
        key: bucket.key,
        label: bucket.label,
        count: bucket.countAll,
        ...Object.fromEntries(BOTH_CURRENCIES.map((c) => [c, EMPTY_BUCKET])),
      };
      row[currency] = bucket;
      byKey.set(bucket.key, row);
    });
  });
  return [...byKey.values()].sort((a, b) => String(a.key).localeCompare(String(b.key)));
};

export const useDashboardChartByCurrency = (params) => {
  const query = useDashboardQueryByCurrency("chart", getDashboardChartApi, params, mapChart);
  return { ...query, data: query.data && mergeBuckets(query.data) };
};
export const useDashboardMoneyOutByCurrency = (params) =>
  useDashboardQueryByCurrency("moneyOut", getDashboardMoneyOutApi, params, mapMoneyOut);
export const useDashboardStatusByCurrency = (params) =>
  useDashboardQueryByCurrency("status", getDashboardStatusApi, params, mapStatus);
export const useDashboardCategoryAnalyticsByCurrency = (params) =>
  useDashboardQueryByCurrency("categoryAnalytics", getDashboardCategoryAnalyticsApi, params, mapCategoryAnalytics);
// Development only: `?mock_operators=40` in the URL swaps the operator list
// for that many made-up ones, to see how the card holds a long list (and
// `?mock_categories=30` the services, below). Never
// active in a production build; the real data and the database are untouched.
// The count is remembered for the browser tab, so it survives moving between
// pages (the menu links drop the query); `?mock_operators=0` turns it off.
const mockCount = (param) => {
  const fromUrl = new URLSearchParams(window.location.search).get(param);
  try {
    if (fromUrl !== null) sessionStorage.setItem(param, fromUrl);
    return Number(sessionStorage.getItem(param)) || 0;
  } catch {
    return Number(fromUrl) || 0;
  }
};
const mockOperators = (count) =>
  Array.from({ length: count }, (_, i) => {
    // Uneven on purpose: a few big sellers, a long tail, some in one currency only.
    const weight = 1 / (i + 1) ** 0.8;
    const tmt = i % 7 === 3 ? 0 : Math.round(60000 * weight * (0.6 + ((i * 37) % 10) / 12));
    const usd = i % 5 === 4 ? 0 : Math.round(140000 * weight * (0.5 + ((i * 53) % 10) / 10));
    return {
      guid: `mock-operator-${i + 1}`,
      fullName: `Test Operator ${String(i + 1).padStart(2, "0")}`,
      count: Math.max(1, Math.round(160 * weight)),
      TMT: { revenue: tmt, profit: Math.round(tmt * (0.15 + (i % 4) * 0.08)) },
      USD: { revenue: usd, profit: Math.round(usd * (0.04 + (i % 3) * 0.05)) },
    };
  });

export const useDashboardOperatorsByCurrency = (params) => {
  const query = useDashboardQueryByCurrency("operators", getDashboardOperatorsApi, params, (raw, p) => mapOperators(raw, p.currency));
  // Guarded here so a production build drops the whole mock.
  if (import.meta.env.DEV) {
    const count = mockCount("mock_operators");
    if (count > 0) return { ...query, data: mockOperators(count) };
  }
  return { ...query, data: query.data && mergeByCurrency(query.data, "guid") };
};
// The same for services: `?mock_categories=30`. Long names included, to see
// how the chart shortens them.
const mockCategories = (count) =>
  Array.from({ length: count }, (_, i) => {
    const weight = 1 / (i + 1) ** 1.1;
    const tmt = i % 6 === 2 ? 0 : Math.round(90000 * weight * (0.6 + ((i * 29) % 10) / 12));
    const usd = i % 4 === 3 ? 0 : Math.round(120000 * weight * (0.5 + ((i * 41) % 10) / 10));
    const margin = i % 5 === 1 ? 0 : 0.08 + (i % 4) * 0.15;
    const name = `Test hyzmat ${String(i + 1).padStart(2, "0")}${i % 3 === 0 ? " uzyn atly" : ""}`;
    return {
      key: `mock-category-${i + 1}`,
      name: { tk: name, ru: name, en: name },
      count: Math.max(1, Math.round(200 * weight)),
      TMT: { revenue: tmt, cost: Math.round(tmt * (1 - margin)), profit: Math.round(tmt * margin) },
      USD: { revenue: usd, cost: Math.round(usd * (1 - margin)), profit: Math.round(usd * margin) },
    };
  });

export const useDashboardCategoriesByCurrency = (params) => {
  const query = useDashboardQueryByCurrency("categories", getDashboardCategoriesApi, params, (raw, p) => mapCategories(raw, p.currency));
  // Guarded here so a production build drops the whole mock.
  if (import.meta.env.DEV) {
    const count = mockCount("mock_categories");
    if (count > 0) return { ...query, data: mockCategories(count) };
  }
  return { ...query, data: query.data && mergeByCurrency(query.data, "key") };
};
// Offices keyed by guid with { sale, net, profit, profitChange } per currency.
export const useDashboardOfficesByCurrency = (params, options) => {
  const query = useDashboardQueryByCurrency("offices", getDashboardOfficesApi, params, mapOffices, options);
  const data =
    query.data &&
    [...new Set(BOTH_CURRENCIES.flatMap((c) => query.data[c].map((o) => o.guid)))].map((guid) => {
      const of = (currency) => query.data[currency].find((o) => o.guid === guid);
      const any = BOTH_CURRENCIES.map(of).find(Boolean);
      return {
        guid,
        name: any.name,
        ...Object.fromEntries(
          BOTH_CURRENCIES.map((c) => [c, of(c) ?? { sale: 0, net: 0, profit: 0, profitChange: 0 }]),
        ),
      };
    });
  return { ...query, data };
};

// The currencies a list has any `field` in, in display order — so a list
// narrowed to a USD-only service shows no empty TMT lines or panel.
export const currenciesWith = (rows, field) => {
  const found = BOTH_CURRENCIES.filter((c) => rows.some((r) => r[c]?.[field]));
  return found.length ? found : BOTH_CURRENCIES;
};

// Colour slots for donuts drawn once per currency. Every donut names its own
// `slotCount` biggest rows (the rest fold into its "other" slice), so both
// always show the same number of rows. A row named in both donuts keeps one
// colour in both: shared colours go to each currency's biggest rows in turn —
// first of TMT, first of USD, second of TMT… A colour whose owner is not in a
// donut's top rows is free there and goes to that donut's next biggest row.
// Returns a lookup: (key, currency) → slot index, or undefined.
export const assignSliceSlots = (rows, currencies, slotCount, keyOf = (row) => row.key) => {
  const ranked = Object.fromEntries(
    currencies.map((currency) => [
      currency,
      rows
        .filter((row) => row[currency].revenue > 0)
        .sort((x, y) => y[currency].revenue - x[currency].revenue)
        .map(keyOf),
    ]),
  );

  const shared = new Map();
  const longest = Math.max(0, ...currencies.map((currency) => ranked[currency].length));
  for (let i = 0; i < longest && shared.size < slotCount; i += 1) {
    currencies.forEach((currency) => {
      const key = ranked[currency][i];
      if (key !== undefined && !shared.has(key) && shared.size < slotCount) shared.set(key, shared.size);
    });
  }

  const perCurrency = Object.fromEntries(
    currencies.map((currency) => {
      const top = ranked[currency].slice(0, slotCount);
      const slots = new Map(top.filter((key) => shared.has(key)).map((key) => [key, shared.get(key)]));
      const taken = new Set(slots.values());
      const free = Array.from({ length: slotCount }, (_, slot) => slot).filter((slot) => !taken.has(slot));
      top.filter((key) => !slots.has(key)).forEach((key) => slots.set(key, free.shift()));
      return [currency, slots];
    }),
  );
  return (key, currency) => perCurrency[currency]?.get(key);
};

/** Loading / fetching / error flags and a refetch for a group of dashboard queries. */
export const combineQueries = (queries) => ({
  isLoading: queries.some((q) => q.isLoading),
  isFetching: queries.some((q) => q.isFetching),
  isError: queries.some((q) => q.isError),
  updatedAt: Math.max(0, ...queries.map((q) => q.dataUpdatedAt || 0)),
  refetch: () => Promise.all(queries.map((q) => q.refetch())),
});
