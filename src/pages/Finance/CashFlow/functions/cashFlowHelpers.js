export const CURRENCY_OPTIONS = [
  { label: "TMT", value: "TMT" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
];

const CURRENCY_SYMBOL = { USD: "$", EUR: "€" };

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
  currency: form.currency || "USD",
  category_guid: form.category_guid || null,
  receiver_opr_guid: form.receiver_opr_guid || null,
  datetime: form.datetime ? new Date(form.datetime).toISOString() : new Date().toISOString(),
  description: form.description?.trim() || "",
  giver: form.giver?.trim() || "",
  receiver: form.receiver?.trim() || "",
  company: form.company?.trim() || "",
});
