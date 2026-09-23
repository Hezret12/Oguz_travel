export const CURRENCY_OPTIONS = [
  { label: "TMT", value: "TMT" },
  { label: "USD", value: "USD" },
];

const CURRENCY_SYMBOL = { USD: "$" };

export const fmtMoney = (val, currency = "USD") => {
  const num = Number(val || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = CURRENCY_SYMBOL[currency];
  return symbol ? `${symbol}${num}` : `${num} ${currency}`;
};

// Compact form for summary cards: 10.93M, 81.6K
export const fmtCompact = (val, currency = "USD") => {
  const abs = Math.abs(Number(val || 0));
  const sign = Number(val) < 0 ? "-" : "";
  let body;
  if (abs >= 1e6) body = `${(abs / 1e6).toFixed(2)}M`;
  else if (abs >= 1e4) body = `${(abs / 1e3).toFixed(1)}K`;
  else body = abs.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const symbol = CURRENCY_SYMBOL[currency];
  return symbol ? `${sign}${symbol}${body}` : `${sign}${body} ${currency}`;
};

// Cash-ledger rows (manual / Excel) carry a type; project rows don't.
export const isCashRow = (row) => row?.source === "MANUAL" || row?.source === "EXCEL" || Boolean(row?.type);

export const cashAmount = (row) =>
  Number(row?.type === "INCOME" ? row?.sale_price : row?.net_price) || 0;

// Visa project rows are priced in both currencies at once and have no cost
// side, so there is no profit to show — they render as two currency lines.
// Every other project row (tickets, translations…) is single-currency and
// renders as sale price + profit.
const DUAL_CURRENCY_FIELDS = [
  { currency: "TMT", field: "price_tmt" },
  { currency: "USD", field: "price_usd" },
];

export const dualCurrencyAmounts = (row) => {
  const items = DUAL_CURRENCY_FIELDS.filter(
    ({ field }) => row?.[field] !== undefined && row?.[field] !== null,
  ).map(({ currency, field }) => ({ currency, value: Number(row[field]) || 0 }));
  return items.length ? items : null;
};

export const toFormValues = (row = {}) => ({
  type: row.type || "EXPENSE",
  category_guid: row.category_guid || row.category?.guid || "",
  amount: row.guid ? String(cashAmount(row) || "") : "",
  currency: row.currency || "USD",
  receiver_opr_guid: row.receiver_opr_guid || row.receiver_operator?.guid || "",
  datetime: row.datetime || new Date().toISOString(),
  description: row.description || "",
  giver: row.giver || "",
  receiver: row.receiver || "",
  company: row.company || "",
});

export const toPayload = (form) => ({
  type: form.type,
  amount: Number(form.amount),
  // Older API builds only know `net_price` (an expense) and require it;
  // newer ones use amount + type and ignore this. Keeps saves working
  // whichever backend version is deployed. Income has no legacy field.
  ...(form.type === "EXPENSE" ? { net_price: Number(form.amount) } : {}),
  currency: form.currency || "USD",
  category_guid: form.category_guid || null,
  receiver_opr_guid: form.receiver_opr_guid || null,
  datetime: form.datetime ? new Date(form.datetime).toISOString() : new Date().toISOString(),
  description: form.description?.trim() || "",
  giver: form.giver?.trim() || "",
  receiver: form.receiver?.trim() || "",
  company: form.company?.trim() || "",
});
