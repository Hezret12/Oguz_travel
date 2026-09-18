import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getPaidPercent, toNumber } from "./salaryUtils";

// Same look as the B2B / Turkish Airlines exports: title banner on row 2,
// table from D4 with a white bold header, zebra rows, medium outer frame and
// a SUBTOTAL totals row.
const START_ROW = 4;
const START_COL = 4;
const MONEY_FORMAT = '#,##0.00;-#,##0.00;"-"';
const ACCENT_RED = "FFDC2626";
const BLACK = "FF000000";
const GRID = "FFD9D9D9";
// Title banner colour, as in the Turkish Airlines report.
const TITLE_COLOR = "FF0F766E";

// Same column order as the paper "Aýlyk" sheet, plus the payment status.
const getColumns = (t) => [
  { key: "index", header: "T/B", width: 6, align: "center" },
  { key: "fullName", header: t("salary.employee"), width: 30, align: "left" },
  { key: "office", header: t("salary.office"), width: 10, align: "center" },
  { key: "card_amount", header: t("salary.cardAmount"), width: 14, align: "right", money: true },
  { key: "base_salary", header: t("salary.baseSalary"), width: 13, align: "right", money: true },
  { key: "work_days", header: t("salary.workDays"), width: 9, align: "center" },
  { key: "worked_days", header: t("salary.workedDays"), width: 9, align: "center" },
  { key: "advance", header: t("salary.advance"), width: 12, align: "right", money: true },
  { key: "cafeteria_credit", header: t("salary.cafeteriaCredit"), width: 13, align: "right", money: true },
  { key: "loan", header: t("salary.loan"), width: 11, align: "right", money: true },
  { key: "bonus", header: t("salary.bonus"), width: 12, align: "right", money: true },
  { key: "payable_amount", header: t("salary.payable"), width: 14, align: "right", money: true },
  { key: "paid_amount", header: t("salary.paidAmount"), width: 14, align: "right", money: true },
  { key: "paid_date", header: t("salary.paidDate"), width: 13, align: "center" },
  { key: "paid_status", header: t("salary.paidStatus"), width: 13, align: "center" },
  { key: "note", header: t("salary.note"), width: 24, align: "left" },
  { key: "total_amount", header: t("salary.total"), width: 14, align: "right", money: true },
];

const formatDate = (value) => {
  if (!value) return "";
  const [y, m, d] = String(value).slice(0, 10).split("-");
  return d ? `${d}.${m}.${y}` : "";
};

const getExcelColName = (colNum) => {
  let name = "";
  let num = colNum;
  while (num > 0) {
    const mod = (num - 1) % 26;
    name = String.fromCharCode(65 + mod) + name;
    num = Math.floor((num - 1) / 26);
  }
  return name;
};

const solid = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });

// Thin grid inside, medium black frame on the outer columns.
const cellBorder = (colNumber, endCol, { top, bottom }) => ({
  top,
  bottom,
  left: colNumber === START_COL ? { style: "medium", color: { argb: BLACK } } : { style: "thin", color: { argb: GRID } },
  right: colNumber === endCol ? { style: "medium", color: { argb: BLACK } } : { style: "thin", color: { argb: GRID } },
});

// `rows` is every salary matching the page filters, loaded by
// GlobalExcelExportModal (not just the visible page).
export const exportSalaryExcel = async (rows = [], { monthLabel, selectedLang, t }) => {
  const columns = getColumns(t);
  const payableIdx = columns.findIndex((c) => c.key === "payable_amount");
  const statusIdx = columns.findIndex((c) => c.key === "paid_status");

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(monthLabel.slice(0, 31), {
    views: [{ showGridLines: true }],
  });

  for (let c = 1; c < START_COL; c += 1) sheet.getColumn(c).width = 4;
  for (let r = 1; r < START_ROW; r += 1) sheet.getRow(r).height = 15;

  const END_COL = START_COL + columns.length - 1;
  const firstDataRow = START_ROW + 1;
  const lastDataRow = START_ROW + rows.length;
  // A blank row keeps the totals outside the AutoFilter range.
  const totalRowIndex = lastDataRow + 2;

  // --- title ---------------------------------------------------------------
  const TITLE_ROW = 2;
  sheet.mergeCells(TITLE_ROW, START_COL, TITLE_ROW, END_COL);
  sheet.getRow(TITLE_ROW).height = 30;
  const title = sheet.getCell(TITLE_ROW, START_COL);
  title.value = t("salary.excelTitle", { month: monthLabel });
  title.font = { name: "Calibri", size: 14, bold: true, color: { argb: TITLE_COLOR } };
  title.alignment = { vertical: "middle", horizontal: "center" };
  title.fill = solid("FFF0FDFA");
  for (let c = START_COL; c <= END_COL; c += 1) {
    sheet.getCell(TITLE_ROW, c).border = {
      top: { style: "medium", color: { argb: TITLE_COLOR } },
      bottom: { style: "medium", color: { argb: TITLE_COLOR } },
      left: { style: "medium", color: { argb: TITLE_COLOR } },
      right: { style: "medium", color: { argb: TITLE_COLOR } },
    };
  }

  // --- header --------------------------------------------------------------
  const headerRow = sheet.getRow(START_ROW);
  headerRow.height = 30;
  columns.forEach((col, idx) => {
    const colNumber = START_COL + idx;
    const cell = headerRow.getCell(colNumber);
    cell.value = col.header;
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: idx === payableIdx ? ACCENT_RED : BLACK },
    };
    cell.fill = solid("FFFFFFFF");
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = cellBorder(colNumber, END_COL, {
      top: { style: "medium", color: { argb: BLACK } },
      bottom: { style: "medium", color: { argb: BLACK } },
    });
  });

  if (rows.length > 0) {
    sheet.autoFilter = {
      from: { row: START_ROW, column: START_COL },
      to: { row: lastDataRow, column: END_COL },
    };
  }

  const colMaxLens = columns.map((c) => String(c.header || "").length);

  // --- data ----------------------------------------------------------------
  rows.forEach((r, offset) => {
    const isPaid = getPaidPercent(r.paid_amount, r.payable_amount) >= 100;
    const values = {
      index: offset + 1,
      fullName: r.employee?.fullName || "",
      office: String(selectedLang(r.employee?.office?.shortName) || "").toUpperCase(),
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
      paid_status: isPaid ? t("salary.paid") : t("salary.notPaid"),
      note: r.note || "",
      total_amount: toNumber(r.total_amount),
    };

    const row = sheet.getRow(firstDataRow + offset);
    row.height = 20;
    const zebraBg = offset % 2 === 1 ? "FFE5E7EB" : "FFFFFFFF";

    columns.forEach((col, idx) => {
      const colNumber = START_COL + idx;
      const cell = row.getCell(colNumber);
      const val = values[col.key];
      cell.value = val;
      cell.font = { name: "Calibri", size: 10, color: { argb: BLACK } };
      cell.alignment = { vertical: "middle", horizontal: col.align };
      cell.fill = solid(zebraBg);
      cell.border = cellBorder(colNumber, END_COL, {
        top: { style: "thin", color: { argb: GRID } },
        bottom: { style: "thin", color: { argb: GRID } },
      });
      if (col.money) cell.numFmt = MONEY_FORMAT;

      if (idx === payableIdx) {
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: ACCENT_RED } };
      }
      if (idx === statusIdx) {
        cell.fill = solid(isPaid ? "FFDCFCE7" : "FFFEF2F2");
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: isPaid ? "FF166534" : ACCENT_RED } };
      }

      const len = String(val ?? "").length;
      if (len > colMaxLens[idx]) colMaxLens[idx] = len;
      if (len > 40) cell.alignment.wrapText = true;
    });
  });

  // --- totals --------------------------------------------------------------
  const totalRow = sheet.getRow(totalRowIndex);
  totalRow.height = 24;
  columns.forEach((col, idx) => {
    const colNumber = START_COL + idx;
    const cell = totalRow.getCell(colNumber);
    cell.font = { name: "Calibri", size: 10, bold: true };
    cell.alignment = { vertical: "middle", horizontal: col.align };
    cell.border = cellBorder(colNumber, END_COL, {
      top: { style: "thin", color: { argb: BLACK } },
      bottom: { style: "medium", color: { argb: BLACK } },
    });

    if (col.money && rows.length > 0) {
      const letter = getExcelColName(colNumber);
      cell.value = {
        formula: `SUBTOTAL(109,${letter}${firstDataRow}:${letter}${lastDataRow})`,
        result: rows.reduce((sum, r) => sum + toNumber(r[col.key]), 0),
      };
      cell.numFmt = MONEY_FORMAT;
      if (idx === payableIdx) {
        cell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: ACCENT_RED } };
      }
    }
  });
  const totalLabel = totalRow.getCell(START_COL + 1);
  totalLabel.value = `${t("salary.total")}: ${rows.length}`;
  totalLabel.alignment = { vertical: "middle", horizontal: "left" };

  columns.forEach((col, idx) => {
    sheet.getColumn(START_COL + idx).width = Math.min(Math.max(col.width, colMaxLens[idx] + 3), 48);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${t("salary.title")} ${monthLabel}.xlsx`,
  );
};
