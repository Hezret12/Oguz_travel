import { cashAmount } from "../../CashFlow/functions/cashFlowHelpers";

// Office cash rows are ordinary cash-ledger rows (tbl_total_calculations)
// booked to an office, so they also show up under Cash Flow → Kassa.
export const OFFICE_CASH_SOURCES = "MANUAL,EXCEL";

// Always shown, in this order; any other currency an office holds follows.
export const BASE_CURRENCIES = ["TMT", "USD"];

export const toFormValues = (row = {}, officeGuid = "") => ({
  office_guid: row.office_guid || row.office?.guid || officeGuid || "",
  type: row.type || "EXPENSE",
  amount: row.guid ? String(cashAmount(row) || "") : "",
  currency: row.currency || "USD",
  datetime: row.datetime || new Date().toISOString(),
  description: row.description || "",
});

export const toPayload = (form) => ({
  office_guid: form.office_guid,
  type: form.type,
  amount: Number(form.amount),
  currency: form.currency,
  datetime: new Date(form.datetime).toISOString(),
  description: form.description.trim(),
});

// Per-currency balance of one office, or of every office added together
// (per currency — TMT and USD are never added to each other).
export const sumTotals = (offices = []) => {
  const byCurrency = new Map();
  offices.forEach((office) =>
    (office.totals || []).forEach((t) => {
      const acc = byCurrency.get(t.currency) ?? { currency: t.currency, income: 0, expense: 0, balance: 0, count: 0 };
      acc.income += Number(t.income || 0);
      acc.expense += Number(t.expense || 0);
      acc.balance += Number(t.balance || 0);
      acc.count += Number(t.count || 0);
      byCurrency.set(t.currency, acc);
    }),
  );
  return [...byCurrency.values()];
};

export const currenciesOf = (offices = []) => {
  const extra = new Set();
  offices.forEach((o) => (o.totals || []).forEach((t) => !BASE_CURRENCIES.includes(t.currency) && extra.add(t.currency)));
  return [...BASE_CURRENCIES, ...[...extra].sort()];
};
