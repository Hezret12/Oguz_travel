import dayjs from "dayjs";

export const QUARTERS = [1, 2, 3, 4];

export const getQuarterOfDate = (date) => {
  const d = dayjs.isDayjs(date) ? date : dayjs(date);
  return Math.floor((d.isValid() ? d : dayjs()).month() / 3) + 1;
};

// Coerces any incoming value (string, NaN, out of range) to a valid quarter, defaulting to the current one.
export const normalizeQuarter = (value) => {
  const q = Number(value);
  return QUARTERS.includes(q) ? q : getQuarterOfDate(dayjs());
};

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const formatUsd = (value, formatNumber) => {
  const n = toNumber(value);
  return `${n < 0 ? "-" : ""}$${formatNumber(Math.abs(n))}`;
};

/**
 * Builds the year-over-year comparison from the `/get-turkish-quarter` body.
 * The backend compares the current calendar year with the previous one; rows are matched by year
 * (not array position) so a missing year never gets mislabelled.
 */
export const buildQuarterComparison = (body, currentYear = dayjs().year()) => {
  const list = Array.isArray(body?.data) ? body.data : [];
  const pick = (year) => {
    const row = list.find((r) => Number(r?.year) === year);
    return {
      year,
      hasData: Boolean(row),
      profit: toNumber(row?.profit),
      revenue: toNumber(row?.total_quoted_price),
    };
  };

  const current = pick(currentYear);
  const previous = pick(currentYear - 1);
  const diff = current.profit - previous.profit;
  const hasBaseline = previous.profit > 0;
  const achievement = hasBaseline ? (current.profit / previous.profit) * 100 : null;
  const growth = hasBaseline ? (diff / previous.profit) * 100 : null;

  return {
    current,
    previous,
    diff,
    isUp: diff >= 0,
    hasBaseline,
    achievement,
    growth,
    isGoalReached: achievement !== null && achievement >= 100,
  };
};
