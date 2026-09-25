import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { formatDate } from "../../../functions/generalHelpers";
import { VISA_STATUS, toVisaStatusKey } from "../../../functions/statusChipConfigs";

// Same look as the other module exports (Translate, B2B): green header,
// colored badge cells, SUBTOTAL totals that follow Excel's AutoFilter.
// TMT and USD are separate columns and are never added together.

const START_ROW = 4;
const START_COL = 4;
const MONEY_FMT = "#,##0.00";

const BADGE = {
  green: { dot: "FF16A34A", text: "FF15803D", bg: "FFF0FDF4", border: "FFBBF7D0" },
  amber: { dot: "FFD97706", text: "FFB45309", bg: "FFFFFBEB", border: "FFFDE68A" },
  blue: { dot: "FF2563EB", text: "FF1D4ED8", bg: "FFEFF6FF", border: "FFBFDBFE" },
  red: { dot: "FFDC2626", text: "FFB91C1C", bg: "FFFEF2F2", border: "FFFECACA" },
};

const VISA_STATUS_EXCEL = {
  [VISA_STATUS.PROCESS]: { label: "Işlenýär", tone: BADGE.blue },
  [VISA_STATUS.DONE]: { label: "Tamamlandy", tone: BADGE.green },
  [VISA_STATUS.FAIL]: { label: "Ýatyryldy", tone: BADGE.red },
};

const COLUMNS = [
  { header: "№", key: "index_number", width: 8, align: "center" },
  { header: "SENESI", key: "date", width: 13, align: "center" },
  { header: "OPERATOR", key: "operator", width: 24, align: "left" },
  { header: "OFIS", key: "office", width: 10, align: "center" },
  { header: "MÜŞDERI", key: "client", width: 28, align: "left" },
  { header: "TELEFON", key: "phone", width: 16, align: "center" },
  { header: "PASPORT №", key: "passport", width: 14, align: "center" },
  { header: "DOGLAN\nSENESI", key: "dob", width: 13, align: "center" },
  { header: "PASPORT\nSANY", key: "passport_count", width: 10, align: "center", sum: "count" },
  { header: "WIZA\nÝAGDAÝY", key: "status", width: 15, align: "center" },
  { header: "BAHASY\n(TMT)", key: "price_tmt", width: 14, align: "right", sum: "money" },
  { header: "TÖLENEN\n(TMT)", key: "paid_tmt", width: 14, align: "right", sum: "money" },
  { header: "GALAN\n(TMT)", key: "left_tmt", width: 14, align: "right", sum: "money" },
  { header: "BAHASY\n(USD)", key: "price_usd", width: 14, align: "right", sum: "money" },
  { header: "TÖLENEN\n(USD)", key: "paid_usd", width: 14, align: "right", sum: "money" },
  { header: "GALAN\n(USD)", key: "left_usd", width: 14, align: "right", sum: "money" },
  { header: "TÖLEG\nÝAGDAÝY", key: "is_paid", width: 14, align: "center" },
  { header: "AGENT", key: "agent", width: 20, align: "left" },
  { header: "AGENT\nTELEFON", key: "agent_phone", width: 16, align: "center" },
  { header: "BELLIK", key: "note", width: 30, align: "left" },
];

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const text = (v) => {
  if (v == null) return "";
  if (typeof v === "object") return String(v.tk || v.ru || v.en || "").trim();
  return String(v).trim();
};

const upper = (v) => text(v).toUpperCase();

const isPaid = (v) => v === true || v === "true" || v === 1 || v === "1";

const colLetter = (index) => {
  let letter = "";
  while (index > 0) {
    const rem = (index - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    index = Math.floor((index - rem - 1) / 26);
  }
  return letter;
};

const edgeBorder = (col, endCol, inner) => ({
  top: { style: "thin", color: { argb: inner } },
  bottom: { style: "thin", color: { argb: inner } },
  left: { style: col === START_COL ? "medium" : "thin", color: { argb: col === START_COL ? "FF000000" : inner } },
  right: { style: col === endCol ? "medium" : "thin", color: { argb: col === endCol ? "FF000000" : inner } },
});

// "● Label" on a soft tinted background.
const paintBadge = (cell, label, tone, col, endCol) => {
  cell.value = {
    richText: [
      { text: "● ", font: { name: "Calibri", size: 9, bold: true, color: { argb: tone.dot } } },
      { text: label, font: { name: "Calibri", size: 9.5, bold: true, color: { argb: tone.text } } },
    ],
  };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: tone.bg } };
  cell.border = edgeBorder(col, endCol, tone.border);
};

const toRow = (v, i) => {
  const priceTmt = num(v.price_tmt);
  const priceUsd = num(v.price_usd);
  const paidTmt = num(v.totalPaidTmt);
  const paidUsd = num(v.totalPaidUsd);
  return {
    // Visa number from the system; the row position only when it is missing.
    index_number: v.index_number ? Number(v.index_number) || v.index_number : i + 1,
    date: formatDate(v.datetime),
    operator: upper(v.receiveroperator?.fullName),
    office: upper(v.receiveroperator?.office?.shortName),
    client: upper(v.client?.fullName),
    phone: text(v.client?.phone_number),
    passport: upper(v.client?.passport_number),
    dob: formatDate(v.client?.dateOfBirth),
    passport_count: num(v.passport_count) || 1,
    status: toVisaStatusKey(v.status),
    price_tmt: priceTmt,
    paid_tmt: paidTmt,
    left_tmt: Math.max(0, priceTmt - paidTmt),
    price_usd: priceUsd,
    paid_usd: paidUsd,
    left_usd: Math.max(0, priceUsd - paidUsd),
    is_paid: isPaid(v.is_paid),
    agent: text(v.agent?.name),
    agent_phone: text(v.agent?.phone_number ?? v.agent?.phone),
    note: text(v.note),
  };
};

export const exportVisaExcel = async (visas = [], options = {}) => {
  const fileName = options.fileName || "Wiza_Hasabaty";
  const sheetName = options.sheetName || "Wiza";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();
  const ws = workbook.addWorksheet(sheetName.substring(0, 31), { views: [{ showGridLines: true }] });

  const endCol = START_COL + COLUMNS.length - 1;
  const firstDataRow = START_ROW + 1;
  const lastDataRow = START_ROW + visas.length;

  [1, 2, 3].forEach((c) => (ws.getColumn(c).width = 4));
  [1, 2, 3].forEach((r) => (ws.getRow(r).height = 15));
  COLUMNS.forEach((col, i) => (ws.getColumn(START_COL + i).width = col.width));

  // Header
  const header = ws.getRow(START_ROW);
  header.height = 42;
  COLUMNS.forEach((col, i) => {
    const c = START_COL + i;
    const cell = header.getCell(c);
    cell.value = col.header;
    cell.font = { name: "Calibri", size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF66A64F" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "medium", color: { argb: "FF386624" } },
      bottom: { style: "thin", color: { argb: "FF5E9C47" } },
      left: { style: c === START_COL ? "medium" : "thin", color: { argb: c === START_COL ? "FF386624" : "FF5E9C47" } },
      right: { style: c === endCol ? "medium" : "thin", color: { argb: c === endCol ? "FF386624" : "FF5E9C47" } },
    };
  });
  ws.views = [{ state: "frozen", ySplit: START_ROW, showGridLines: true }];

  // Data
  const sums = Object.fromEntries(COLUMNS.filter((c) => c.sum).map((c) => [c.key, 0]));
  visas.forEach((visa, offset) => {
    const data = toRow(visa, offset);
    const row = ws.getRow(firstDataRow + offset);
    row.height = 21;

    COLUMNS.forEach((col, i) => {
      const c = START_COL + i;
      const cell = row.getCell(c);
      const value = data[col.key];
      cell.font = { name: "Calibri", size: 10 };
      cell.alignment = { vertical: "middle", horizontal: col.align, wrapText: col.key === "note" };
      cell.border = edgeBorder(c, endCol, "FFD9D9D9");

      if (col.key === "status") {
        const info = VISA_STATUS_EXCEL[value] ?? VISA_STATUS_EXCEL[VISA_STATUS.PROCESS];
        paintBadge(cell, info.label, info.tone, c, endCol);
        return;
      }
      if (col.key === "is_paid") {
        paintBadge(cell, value ? "Tölendi" : "Kredit", value ? BADGE.green : BADGE.amber, c, endCol);
        return;
      }

      cell.value = value;
      if (col.sum) sums[col.key] += num(value);
      if (col.sum === "money") {
        cell.numFmt = MONEY_FMT;
        // Unpaid remainder stands out; a zero remainder stays plain.
        if ((col.key === "left_tmt" || col.key === "left_usd") && value > 0) {
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFB45309" } };
        }
      }
    });
  });

  ws.autoFilter = { from: { row: START_ROW, column: START_COL }, to: { row: Math.max(lastDataRow, START_ROW), column: endCol } };

  // Totals: one blank row below the data keeps them out of the AutoFilter range.
  const total = ws.getRow(lastDataRow + 2);
  total.height = 24;
  COLUMNS.forEach((col, i) => {
    const c = START_COL + i;
    const cell = total.getCell(c);
    cell.font = { name: "Calibri", size: 10, bold: true };
    cell.alignment = { vertical: "middle", horizontal: col.align };
    cell.border = {
      ...edgeBorder(c, endCol, "FFD9D9D9"),
      top: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
    };
    if (col.sum && visas.length > 0) {
      const letter = colLetter(c);
      cell.value = { formula: `SUBTOTAL(109,${letter}${firstDataRow}:${letter}${lastDataRow})`, result: sums[col.key] };
      cell.numFmt = col.sum === "money" ? MONEY_FMT : "#,##0";
    }
  });
  const label = total.getCell(START_COL);
  label.value = "Jemi";
  label.alignment = { vertical: "middle", horizontal: "left" };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `${fileName}_${dayjs().format("YYYY-MM-DD")}.xlsx`);
};
