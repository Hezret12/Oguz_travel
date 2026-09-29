import dayjs from "dayjs";

/** Reporting periods shared by the dashboard and finance analytics pages. */
export const PERIODS = ["thisMonth", "lastMonth", "quarter", "year"];

// A user-picked { start, end } range ("YYYY-MM-DD", both inclusive).
export const CUSTOM_PERIOD = "custom";
export const MAX_RANGE_DAYS = 366;

export const isValidCustomRange = (customRange, today = dayjs()) => {
  if (!customRange?.start || !customRange?.end) return false;
  const start = dayjs(customRange.start);
  const end = dayjs(customRange.end);
  return (
    start.isValid() &&
    end.isValid() &&
    !start.isAfter(end, "day") &&
    !end.isAfter(today, "day") &&
    end.diff(start, "day") + 1 <= MAX_RANGE_DAYS
  );
};

/**
 * The { start, end } dayjs bounds of a period (both inclusive), whether it is one of `PERIODS`
 * or a picked range. Single source for every analytics page and its date range filter, so the
 * dates shown in the filter are exactly the ones the report was built from.
 */
export const getPeriodRange = (period, customRange, today = dayjs()) => {
  if (period === CUSTOM_PERIOD && isValidCustomRange(customRange, today)) {
    return { start: dayjs(customRange.start).startOf("day"), end: dayjs(customRange.end).endOf("day") };
  }
  switch (period) {
    case "lastMonth": {
      const start = today.subtract(1, "month").startOf("month");
      return { start, end: start.endOf("month") };
    }
    // The last three complete months.
    case "quarter":
      return {
        start: today.startOf("month").subtract(3, "month"),
        end: today.startOf("month").subtract(1, "day").endOf("day"),
      };
    case "year":
      return { start: today.startOf("year"), end: today.endOf("day") };
    default:
      return { start: today.startOf("month"), end: today.endOf("day") };
  }
};
