import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getAllTotalCalculationsApi } from "../../../api/queries/getters";
import { fetchAllPaginatedData } from "../../../functions/excelExportHelper";
import { CUSTOM_PERIOD, getPeriodRange, isValidCustomRange } from "../../Finance/Overview/functions/officeAnalyticsMock";
import { buildMockSales } from "./salesMock";

// Demo data until real sales are wired in: set to false to use the API below.
export const USE_MOCK_SALES = true;

/**
 * Sales dashboard data, computed in the browser.
 *
 * Source: GET /total-calculations/get-all-total-calculations — every sale of
 * every module (B2B, THY, air, rail, hotel, tour, transfer, package, visa,
 * translation, referral letter, cafe) is synced there by DB triggers.
 * `is_manual=false` keeps only those project sales (no cash-book rows).
 * The API only filters by single day or whole year, so we load whole years
 * (cached per year) and cut the exact range here.
 *
 * Rules:
 * - USD and TMT are never added together; everything is per currency.
 * - REFUND rows are excluded from sales, profit and counts (shown separately).
 * - Receivable = sale − paid, only for rows still marked "notpaid".
 * - Rows without a status (e.g. referral letters, cafe) are never assumed paid.
 */

// Sale category (tbl_categories guid) → dashboard module card.
// NOTE: Turkish Airlines and Visa have no DB trigger into total_calculations
// yet, so with real data their cards stay empty until they get their own
// source (or triggers). The demo data includes them.
export const THY_CATEGORY = "mock-thy";
export const MODULES = [
  { key: "b2b", categories: ["e1000000-0000-0000-0000-000000000001"] },
  { key: "thy", categories: [THY_CATEGORY] },
  {
    key: "outbound", // airway, railway, hotel, tour, transfer, package
    categories: [
      "e1000000-0000-0000-0000-000000000002",
      "e1000000-0000-0000-0000-000000000003",
      "e1000000-0000-0000-0000-000000000004",
      "e1000000-0000-0000-0000-000000000005",
      "e1000000-0000-0000-0000-000000000006",
      "e1000000-0000-0000-0000-000000000007",
    ],
  },
  { key: "visa", categories: ["e1000000-0000-0000-0000-000000000008"] },
  { key: "translation", categories: ["e1000000-0000-0000-0000-000000000009"] },
  { key: "referral", categories: ["e1000000-0000-0000-0000-000000000010"] },
  { key: "cafeteria", categories: ["e1000000-0000-0000-0000-000000000011"] },
];
const MODULE_OF = Object.fromEntries(MODULES.flatMap((m) => m.categories.map((c) => [c, m.key])));

const PAGE_SIZE = 500;
const YEAR_STALE_MS = 5 * 60 * 1000;

const PERIOD_GRANULARITY = { thisMonth: "day", lastMonth: "day", quarter: "week", year: "month" };

// Current range + the previous range of the same length right before it.
export const resolveRange = (period, customRange, today = dayjs()) => {
  const isCustom = period === CUSTOM_PERIOD && isValidCustomRange(customRange, today);
  const { start, end } = getPeriodRange(period, customRange, today);
  let granularity;
  if (isCustom) {
    const days = end.diff(start, "day") + 1;
    granularity = days <= 45 ? "day" : days <= 180 ? "week" : "month";
  } else {
    granularity = PERIOD_GRANULARITY[period] || "day";
  }
  // Running periods compare with the same span one month / one year back
  // ("1–19 Sep" vs "1–19 Aug"), matching their "vs last month / year" label.
  // Everything else compares with the equally long span right before it.
  if (period === "thisMonth" || period === "year") {
    const unit = period === "year" ? "year" : "month";
    return { start, end, prevStart: start.subtract(1, unit), prevEnd: end.subtract(1, unit), granularity };
  }
  const lengthMs = end.valueOf() - start.valueOf();
  const prevEnd = start.subtract(1, "millisecond");
  const prevStart = dayjs(prevEnd.valueOf() - lengthMs);
  return { start, end, prevStart, prevEnd, granularity };
};

const toNum = (v) => Number(v) || 0;

const bucketKey = (d, granularity) =>
  granularity === "month"
    ? d.startOf("month").format("YYYY-MM-DD")
    : granularity === "week"
      ? d.subtract((d.day() + 6) % 7, "day").startOf("day").format("YYYY-MM-DD") // Monday
      : d.startOf("day").format("YYYY-MM-DD");

const buildBuckets = (start, end, granularity) => {
  const buckets = [];
  let cursor = dayjs(bucketKey(start, granularity));
  while (cursor.valueOf() <= end.valueOf()) {
    buckets.push({
      key: cursor.format("YYYY-MM-DD"),
      label: granularity === "month" ? cursor.format("MM.YYYY") : cursor.format("DD.MM"),
      revenue: 0,
      profit: 0,
      count: 0,
      receivable: 0,
    });
    cursor = cursor.add(1, granularity === "month" ? "month" : granularity === "week" ? "week" : "day");
  }
  return buckets;
};

const emptyTotals = () => ({ revenue: 0, cost: 0, profit: 0, count: 0, receivable: 0, refunds: 0, refundAmount: 0 });

const addToTotals = (t, r) => {
  const status = String(r.status || "").toUpperCase();
  if (status === "REFUND") {
    t.refunds += 1;
    t.refundAmount += toNum(r.sale_price);
    return;
  }
  t.revenue += toNum(r.sale_price);
  t.cost += toNum(r.net_price);
  t.profit += toNum(r.profit);
  t.count += 1;
  if (status === "NOTPAID") t.receivable += Math.max(0, toNum(r.sale_price) - toNum(r.credit_price));
};

const inRange = (ms, a, b) => ms >= a.valueOf() && ms <= b.valueOf();

/** Aggregates one currency (and optionally one office) for the current and previous range. */
export const aggregateSales = (rows, { range, currency, officeGuid }) => {
  const { start, end, prevStart, prevEnd, granularity } = range;
  const current = emptyTotals();
  const previous = emptyTotals();
  const buckets = buildBuckets(start, end, granularity);
  const bucketIndex = Object.fromEntries(buckets.map((b, i) => [b.key, i]));
  const payment = { PAID: { count: 0, amount: 0 }, NOTPAID: { count: 0, amount: 0 }, REFUND: { count: 0, amount: 0 }, NONE: { count: 0, amount: 0 } };
  // Previous-period buckets line up with the current ones by position
  // (day 1 with day 1), so the comparison line can share the x-axis.
  const prevBuckets = buildBuckets(prevStart, prevEnd, granularity);
  const prevIndex = Object.fromEntries(prevBuckets.map((b, i) => [b.key, i]));
  const modules = Object.fromEntries(
    MODULES.map((m) => [
      m.key,
      {
        key: m.key,
        current: emptyTotals(),
        previous: emptyTotals(),
        buckets: buildBuckets(start, end, granularity),
        prevRevenue: buckets.map(() => null),
        operators: new Map(),
      },
    ]),
  );
  const moduleOf = (r) => modules[MODULE_OF[r.category?.guid || r.category_guid]];

  for (const r of rows) {
    if ((r.currency || "USD") !== currency) continue;
    if (officeGuid && (r.office_guid || r.office?.guid) !== officeGuid) continue;
    const d = dayjs(r.datetime);
    const ms = d.valueOf();

    const mod = moduleOf(r);
    if (inRange(ms, prevStart, prevEnd)) {
      addToTotals(previous, r);
      if (mod) {
        addToTotals(mod.previous, r);
        const pi = prevIndex[bucketKey(d, granularity)];
        if (pi != null && pi < mod.prevRevenue.length && String(r.status || "").toUpperCase() !== "REFUND") {
          mod.prevRevenue[pi] = (mod.prevRevenue[pi] || 0) + toNum(r.sale_price);
        }
      }
      continue;
    }
    if (!inRange(ms, start, end)) continue;

    addToTotals(current, r);
    if (mod) addToTotals(mod.current, r);

    const status = String(r.status || "").toUpperCase();
    const pay = payment[status] ?? payment.NONE;
    pay.count += 1;
    pay.amount += toNum(r.sale_price);
    if (status === "REFUND") continue;

    const sale = toNum(r.sale_price);
    const profit = toNum(r.profit);
    const receivable = status === "NOTPAID" ? Math.max(0, sale - toNum(r.credit_price)) : 0;

    const bi = bucketIndex[bucketKey(d, granularity)];
    const b = buckets[bi];
    if (b) {
      b.revenue += sale;
      b.profit += profit;
      b.count += 1;
      b.receivable += receivable;
    }
    const mb = mod?.buckets[bi];
    if (mb) {
      mb.revenue += sale;
      mb.profit += profit;
      mb.count += 1;
    }
    const oprId = r.receiver_operator?.guid || r.receiver_opr_guid;
    if (mod && oprId) {
      const mo = mod.operators.get(oprId) || { guid: oprId, name: r.receiver_operator?.fullName || "", revenue: 0, count: 0 };
      mo.revenue += sale;
      mo.count += 1;
      mod.operators.set(oprId, mo);
    }

  }

  return {
    current,
    previous,
    buckets,
    payment,
    modules: MODULES.map((m) => {
      const mod = modules[m.key];
      // Periods with no previous data at a position stay null (gap), not 0.
      const hasPrev = mod.previous.count > 0;
      return {
        ...mod,
        prevRevenue: hasPrev ? mod.prevRevenue.map((v, i) => (v == null && i < prevBuckets.length ? 0 : v)) : mod.prevRevenue,
        operators: [...mod.operators.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      };
    }),
  };
};

// One cached request per calendar year the two ranges touch.
export const useSalesRows = (range) => {
  const years = useMemo(() => {
    const list = [];
    for (let y = range.prevStart.year(); y <= range.end.year(); y++) list.push(y);
    return list;
  }, [range.prevStart, range.end]);

  const results = useQueries({
    queries: years.map((year) => ({
      queryKey: ["dashboard-sales", USE_MOCK_SALES ? "mock" : "api", year],
      queryFn: () =>
        USE_MOCK_SALES
          ? buildMockSales(year)
          : fetchAllPaginatedData(getAllTotalCalculationsApi, { datetime: String(year), is_manual: false }, null, PAGE_SIZE),
      staleTime: YEAR_STALE_MS,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const isFetching = results.some((r) => r.isFetching);
  const isError = results.some((r) => r.isError);
  const dataVersion = results.map((r) => r.dataUpdatedAt).join(",");
  const rows = useMemo(
    () => results.flatMap((r) => (Array.isArray(r.data) ? r.data : [])),
    // `results` is a new array every render; the update stamps say when data changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataVersion],
  );
  const refetch = () => results.forEach((r) => r.refetch());
  const updatedAt = Math.max(0, ...results.map((r) => r.dataUpdatedAt || 0));

  return { rows, isLoading, isFetching, isError, refetch, updatedAt, isDemo: USE_MOCK_SALES };
};
