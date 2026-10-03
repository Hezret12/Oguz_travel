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

// Cash-ledger rows (manual / Excel) carry a type; project rows don't.
export const isCashRow = (row) => row?.source === "MANUAL" || row?.source === "EXCEL" || Boolean(row?.type);

export const cashAmount = (row) =>
  Number(row?.type === "INCOME" ? row?.sale_price : row?.net_price) || 0;

// Fixed guids of the backend's system categories (SYSTEM_CATEGORIES).
const VISA_CATEGORY_GUID = "e1000000-0000-0000-0000-000000000008";

// Visa project rows are priced in both currencies at once and have no cost
// side, so there is no profit to show — they render as one line per priced
// currency. The row is booked as TMT: the TMT price is sale_price and the USD
// price is sale_price_usd. Every other project row (tickets, translations…)
// is single-currency and renders as sale price + profit.
export const dualCurrencyAmounts = (row) => {
  if (isCashRow(row)) return null;
  const usd = Number(row?.sale_price_usd) || 0;
  if (row?.category_guid !== VISA_CATEGORY_GUID && usd === 0) return null;
  const tmt = Number(row?.sale_price) || 0;
  const items = [
    ...(tmt || !usd ? [{ currency: row?.currency || "TMT", value: tmt }] : []),
    ...(usd ? [{ currency: "USD", value: usd }] : []),
  ];
  return items;
};

// Project rows with only a cost side (the month's salary, a USD bonus) are
// money going out, not a sale.
export const isProjectExpense = (row) =>
  !isCashRow(row) &&
  (Number(row?.net_price) || 0) > 0 &&
  !(Number(row?.sale_price) || 0) &&
  !(Number(row?.sale_price_usd) || 0);

// One row → money in or out, its signed amount per currency and its profit.
// Drives the table's TMT · USD · Peýda columns; a currency the row does not
// touch stays null.
//   cash row        → ± amount in its currency; profit only when a cost was booked
//   salary / bonus  → − cost, no profit
//   visa            → + TMT price and + USD price, no profit
//   other project   → + sale price, profit in its currency
export const rowAmounts = (row) => {
  const currency = String(row?.currency || "USD").toUpperCase();
  const amounts = { TMT: null, USD: null };
  const put = (cur, value) => {
    const key = cur === "USD" ? "USD" : "TMT";
    amounts[key] = (amounts[key] ?? 0) + value;
  };

  if (isCashRow(row)) {
    const income = row.type === "INCOME";
    const amount = cashAmount(row);
    put(currency, income ? amount : -amount);
    const cost = Number(row.net_price) || 0;
    const profit = income && cost > 0 ? { value: amount - cost, currency } : null;
    return { kind: income ? "income" : "expense", amounts, profit };
  }

  if (isProjectExpense(row)) {
    put(currency, -(Number(row.net_price) || 0));
    return { kind: "expense", amounts, profit: null };
  }

  const dual = dualCurrencyAmounts(row);
  if (dual) {
    dual.forEach(({ currency: cur, value }) => put(cur, value));
    return { kind: "income", amounts, profit: null };
  }

  put(currency, Number(row.sale_price) || 0);
  return { kind: "income", amounts, profit: { value: Number(row.profit) || 0, currency } };
};

export const toFormValues = (row = {}) => ({
  type: row.type || "EXPENSE",
  category_guid: row.category_guid || row.category?.guid || "",
  amount: row.guid ? String(cashAmount(row) || "") : "",
  currency: row.currency || "USD",
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
  // null clears a category picked earlier; the table then shows "Other".
  category_guid: form.category_guid || null,
  // No receiver_opr_guid: the form has no operator. Leaving it out (not null)
  // makes the backend keep an older row's operator — and so its office — on edit.
  datetime: form.datetime ? new Date(form.datetime).toISOString() : new Date().toISOString(),
  description: form.description?.trim() || "",
  giver: form.giver?.trim() || "",
  receiver: form.receiver?.trim() || "",
  company: form.company?.trim() || "",
});
