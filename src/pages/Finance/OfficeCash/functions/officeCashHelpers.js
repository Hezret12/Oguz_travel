import { cashAmount } from "../../CashFlow/functions/cashFlowHelpers";

// Office cash rows are ordinary cash-ledger rows (tbl_total_calculations)
// booked to an office, so they also show up under Cash Flow → Kassa.
export const OFFICE_CASH_SOURCES = "MANUAL,EXCEL";

export const toFormValues = (row = {}, officeGuid = "") => ({
  office_guid: row.office_guid || row.office?.guid || officeGuid || "",
  type: row.type || "EXPENSE",
  amount: row.guid ? String(cashAmount(row) || "") : "",
  // price − Çykdajy: equals the stored profit, and for an income saved before
  // profits existed (no Çykdajy) it is the whole price, so nothing changes.
  profit: row.guid && row.type === "INCOME" ? String(cashAmount(row) - (Number(row.net_price) || 0)) : "",
  currency: row.currency || "USD",
  datetime: row.datetime || new Date().toISOString(),
  description: row.description || "",
});

export const toPayload = (form) => ({
  office_guid: form.office_guid,
  type: form.type,
  amount: Number(form.amount),
  // Income only: the backend stores Çykdajy (net_price) = amount − profit.
  ...(form.type === "INCOME" ? { profit: Number(form.profit) } : {}),
  currency: form.currency,
  datetime: new Date(form.datetime).toISOString(),
  description: form.description.trim(),
});

