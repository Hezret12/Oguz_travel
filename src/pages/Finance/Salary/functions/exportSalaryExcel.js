import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getAllSalariesApi, getSalarySummaryApi } from "../../../../api/queries/getters";
import { toNumber } from "./salaryUtils";

const MONEY_FORMAT = '#,##0.00;-#,##0.00;"-"';

// Same column order as the paper "Aýlyk" sheet.
const getColumns = (t) => [
  { key: "index", header: "№", width: 5 },
  { key: "fullName", header: t("salary.employee"), width: 36 },
  { key: "office", header: t("salary.office"), width: 12 },
  { key: "card_amount", header: t("salary.cardAmount"), width: 14, money: true },
  { key: "base_salary", header: t("salary.baseSalary"), width: 13, money: true },
  { key: "work_days", header: t("salary.workDays"), width: 9 },
  { key: "worked_days", header: t("salary.workedDays"), width: 9 },
  { key: "advance", header: t("salary.advance"), width: 12, money: true },
  { key: "cafeteria_credit", header: t("salary.cafeteriaCredit"), width: 13, money: true },
  { key: "loan", header: t("salary.loan"), width: 11, money: true },
  { key: "bonus", header: t("salary.bonus"), width: 11, money: true },
  { key: "payable_amount", header: t("salary.payable"), width: 13, money: true },
  { key: "paid_amount", header: t("salary.paidAmount"), width: 13, money: true },
  { key: "paid_date", header: t("salary.paidDate"), width: 13 },
  { key: "note", header: t("salary.note"), width: 24 },
  { key: "total_amount", header: t("salary.total"), width: 14, money: true },
];

const TOTAL_KEYS = [
  "card_amount",
  "base_salary",
  "advance",
  "cafeteria_credit",
  "loan",
  "bonus",
  "payable_amount",
  "paid_amount",
  "total_amount",
];

const formatDate = (value) => {
  if (!value) return "";
  const [y, m, d] = String(value).slice(0, 10).split("-");
  return d ? `${d}.${m}.${y}` : "";
};

// Exports every row matching the current filters (not just the visible page).
export const exportSalaryExcel = async ({ params, monthLabel, selectedLang, t }) => {
  const [listRes, summaryRes] = await Promise.all([
    getAllSalariesApi({ ...params, page: 1, limit: 1000 }),
    getSalarySummaryApi(params),
  ]);
  const rows = listRes?.data?.data || [];
  const summary = summaryRes?.data?.data || {};
  const columns = getColumns(t);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(monthLabel, {
    views: [{ state: "frozen", ySplit: 2 }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  sheet.columns = columns.map((c) => ({ key: c.key, width: c.width }));

  sheet.mergeCells(1, 1, 1, columns.length);
  const title = sheet.getCell(1, 1);
  title.value = `${t("salary.title")} — ${monthLabel}`;
  title.font = { bold: true, size: 14 };
  title.alignment = { horizontal: "center" };

  const header = sheet.getRow(2);
  columns.forEach((c, i) => {
    const cell = header.getCell(i + 1);
    cell.value = c.header;
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
  });
  header.height = 30;

  rows.forEach((r, i) => {
    sheet.addRow({
      index: i + 1,
      fullName: r.employee?.fullName || "",
      office: selectedLang(r.employee?.office?.shortName) || "",
      card_amount: toNumber(r.card_amount),
      base_salary: toNumber(r.base_salary),
      work_days: toNumber(r.work_days),
      worked_days: toNumber(r.worked_days),
      advance: toNumber(r.advance),
      cafeteria_credit: toNumber(r.cafeteria_credit),
      loan: toNumber(r.loan),
      bonus: toNumber(r.bonus),
      payable_amount: toNumber(r.payable_amount),
      paid_amount: toNumber(r.paid_amount),
      paid_date: formatDate(r.paid_date),
      note: r.note || "",
      total_amount: toNumber(r.total_amount),
    });
  });

  const totals = { index: rows.length };
  TOTAL_KEYS.forEach((k) => { totals[k] = toNumber(summary[k]); });
  const totalRow = sheet.addRow(totals);
  totalRow.font = { bold: true };

  columns.forEach((c, i) => {
    if (c.money) sheet.getColumn(i + 1).numFmt = MONEY_FORMAT;
  });
  const lastRow = sheet.rowCount;
  for (let r = 2; r <= lastRow; r += 1) {
    sheet.getRow(r).eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: r === lastRow - 1 ? "medium" : "thin" },
        right: { style: "thin" },
      };
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${t("salary.title")} ${monthLabel}.xlsx`,
  );
};
