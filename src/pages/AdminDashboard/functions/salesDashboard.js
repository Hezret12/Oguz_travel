import { keepPreviousData, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getDashboardSummaryApi } from "../../../api/queries/getters";
import { CUSTOM_PERIOD, getPeriodRange, isValidCustomRange } from "../../Finance/Overview/functions/officeAnalyticsMock";

/**
 * Sales dashboard data from GET /dashboard/get-summary.
 *
 * The backend aggregates every module sale (B2B, outbound, visa, translation,
 * referral letter, cafe — synced into tbl_total_calculations by DB triggers)
 * in SQL and returns both currencies at once, so switching USD/TMT needs no
 * new request. Rules applied there:
 * - USD and TMT are never added together.
 * - Cash-book rows are not sales; refunds are left out of sales, profit and
 *   counts (reported separately).
 * - Receivable = sale − paid, only for sales still marked "notpaid".
 * - Non-admin users always get their own office.
 */

const PERIOD_GRANULARITY = { thisMonth: "day", lastMonth: "day", quarter: "week", year: "month" };
const DAY = "YYYY-MM-DD";
const SUMMARY_STALE_MS = 60 * 1000;

// Current range + the previous range it is compared with.
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

const EMPTY_TOTALS = { count: 0, revenue: 0, cost: 0, profit: 0, receivable: 0, refunds: 0, refundAmount: 0 };
const EMPTY_PAYMENT = {
  PAID: { count: 0, amount: 0 },
  NOTPAID: { count: 0, amount: 0 },
  REFUND: { count: 0, amount: 0 },
  NONE: { count: 0, amount: 0 },
};

const toTotals = (t) => (t ? { ...t, refundAmount: t.refund_amount ?? 0 } : EMPTY_TOTALS);

// Same modules, same order as the backend sends them.
export const MODULE_KEYS = ["b2b", "thy", "outbound", "visa", "translation", "referral", "cafeteria"];

const toModule = (key, m) => ({
  key,
  current: toTotals(m?.current),
  previous: toTotals(m?.previous),
  buckets: m?.buckets ?? [],
  prevRevenue: m?.prev_revenue ?? [],
  operators: m?.operators ?? [],
});

// API (snake_case) → the shape the dashboard components render. Every module
// is always present (zeros when missing), so the UI never gets an empty list.
const toCurrencyData = (c) => {
  const byKey = new Map((c?.modules ?? []).map((m) => [m.key, m]));
  return {
    current: toTotals(c?.current),
    previous: toTotals(c?.previous),
    buckets: c?.buckets ?? [],
    payment: c?.payment ?? EMPTY_PAYMENT,
    modules: MODULE_KEYS.map((key) => toModule(key, byKey.get(key))),
  };
};

export const EMPTY_SALES = toCurrencyData(null);

/** One request per range/office; the previous result stays on screen while the next one loads. */
export const useDashboardSummary = (range, officeGuid) => {
  const params = {
    start_date: range.start.format(DAY),
    end_date: range.end.format(DAY),
    prev_start_date: range.prevStart.format(DAY),
    prev_end_date: range.prevEnd.format(DAY),
    group_by: range.granularity,
    ...(officeGuid ? { office_guid: officeGuid } : {}),
  };

  const query = useQuery({
    queryKey: ["dashboard-summary", params],
    queryFn: async () => {
      const res = await getDashboardSummaryApi(params);
      const body = res?.data;
      // The API reports errors in the body with HTTP 200.
      if (body?.status !== 200) throw new Error(body?.message || "Dashboard request failed");
      return {
        granularity: body.data.granularity,
        byCurrency: Object.fromEntries(
          Object.entries(body.data.currencies ?? {}).map(([cur, c]) => [cur, toCurrencyData(c)]),
        ),
      };
    },
    placeholderData: keepPreviousData,
    staleTime: SUMMARY_STALE_MS,
  });

  return {
    summary: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    updatedAt: query.dataUpdatedAt,
  };
};
