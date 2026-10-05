import dayjs from "dayjs";

// One tab per sheet of the monthly inbound report workbook.
export const INBOUND_TABS = [
  { key: "expected", labelKey: "inbound.tabs.expected" },
  { key: "arrivals", labelKey: "inbound.tabs.arrivals" },
  { key: "invitations", labelKey: "inbound.tabs.invitations" },
];

export const INBOUND_QUERY_KEYS = {
  expected: ["inbound", "expected"],
  arrivals: ["inbound", "arrivals"],
  invitations: ["inbound", "invitations"],
};

export const INBOUND_SUMMARY_KEY = "inbound-summary";

export const GENDER_VALUES = ["MALE", "FEMALE"];

export const getGenderOptions = (t) =>
  GENDER_VALUES.map((value) => ({ value, label: t(`inbound.gender.${value}`) }));

export const DATE_FORMAT = "YYYY-MM-DD";

// Form dates are ISO strings; the API stores plain calendar days.
export const toDay = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format(DATE_FORMAT) : null;

// Counts come from text inputs; empty means 0.
export const toCount = (value) => {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const trimText = (value) => String(value ?? "").trim();
