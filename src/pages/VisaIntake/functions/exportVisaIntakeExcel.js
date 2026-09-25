import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { formatDate } from "../../../functions/generalHelpers";
import { VISA_STATUS, toVisaStatusKey } from "../../../functions/statusChipConfigs";
import { isNotesField, sortVisaFields } from "../../../functions/visaCountryFieldConfigs";

// Visa intake applications of every country in one workbook: a "Jemi" summary
// sheet, then one sheet per country. Each country sheet has the fixed columns,
// then that country's own fields (same order and labels as the table), then
// the note. Styling matches the other module exports.

const START_ROW = 4;
const START_COL = 2;
const UNKNOWN_COUNTRY = "Näbelli ýurt";

// Field keys that already have a fixed column (same list as the table).
const STANDARD_KEYS = new Set([
  "index_number", "client_guid", "client", "passport_number", "dateOfBirth",
  "accepted_opr_guid", "operator_guid", "operator", "application_date",
  "status", "note", "notes", "actions",
]);

const STATUS_ORDER = [VISA_STATUS.PROCESS, VISA_STATUS.DONE, VISA_STATUS.FAIL];
const STATUS_EXCEL = {
  [VISA_STATUS.PROCESS]: { label: "Işlenýär", dot: "FF2563EB", text: "FF1D4ED8", bg: "FFEFF6FF", border: "FFBFDBFE" },
  [VISA_STATUS.DONE]: { label: "Tamamlandy", dot: "FF16A34A", text: "FF15803D", bg: "FFF0FDF4", border: "FFBBF7D0" },
  [VISA_STATUS.FAIL]: { label: "Ýatyryldy", dot: "FFDC2626", text: "FFB91C1C", bg: "FFFEF2F2", border: "FFFECACA" },
};

const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FF66A64F" } };
const HEADER_FONT = { name: "Calibri", size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };

const FIXED_COLUMNS = [
  { key: "index_number", header: "№", width: 8, align: "center" },
  { key: "client", header: "MÜŞDERI", width: 28, align: "left" },
  { key: "phone", header: "TELEFON", width: 16, align: "center" },
  { key: "passport", header: "PASPORT №", width: 14, align: "center" },
  { key: "dob", header: "DOGLAN\nSENESI", width: 13, align: "center" },
  { key: "operator", header: "OPERATOR", width: 24, align: "left" },
  { key: "office", header: "OFIS", width: 10, align: "center" },
  { key: "application_date", header: "ARZA\nSENESI", width: 13, align: "center" },
  { key: "status", header: "WIZA\nÝAGDAÝY", width: 15, align: "center" },
];
const NOTE_COLUMN = { key: "note", header: "BELLIK", width: 30, align: "left" };

const isEmpty = (v) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);

const text = (v) => (isEmpty(v) ? "" : String(v).trim());

const parseValues = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

/** Column descriptors for a country's own fields, built once per sheet. */
const buildFieldColumns = (fields, resolveLabel) => {
  const used = new Set(STANDARD_KEYS);
  const columns = [];
  for (const field of sortVisaFields(Array.isArray(fields) ? fields : [])) {
    const key = field.fieldKey || field.field_key || field.guid;
    if (!key || used.has(key) || isNotesField(field)) continue;
    used.add(key);
    const optionLabels = new Map(
      (Array.isArray(field.options) ? field.options : []).map((opt) =>
        opt !== null && typeof opt === "object"
          ? [String(opt.value), resolveLabel(opt.label) || String(opt.value)]
          : [String(opt), String(opt)],
      ),
    );
    const isDate = field.fieldType === "date";
    columns.push({
      key,
      header: resolveLabel(field.field_label || field.label) || key,
      type: field.fieldType,
      optionLabels,
      width: isDate ? 13 : 20,
      align: isDate ? "center" : "left",
    });
  }
  return columns;
};

const fieldText = (value, col, resolveLabel) => {
  if (isEmpty(value)) return "";
  if (col.type === "date") return formatDate(value);
  return (Array.isArray(value) ? value : [value])
    .filter((v) => !isEmpty(v))
    .map((v) => {
      if (col.optionLabels.has(String(v))) return col.optionLabels.get(String(v));
      if (typeof v === "boolean") return v ? "Hawa" : "Ýok";
      if (typeof v === "object") return resolveLabel(v);
      return String(v);
    })
    .join(", ");
};

const border = (col, endCol, inner) => ({
  top: { style: "thin", color: { argb: inner } },
  bottom: { style: "thin", color: { argb: inner } },
  left: { style: col === START_COL ? "medium" : "thin", color: { argb: col === START_COL ? "FF000000" : inner } },
  right: { style: col === endCol ? "medium" : "thin", color: { argb: col === endCol ? "FF000000" : inner } },
});

const writeHeader = (ws, columns) => {
  const endCol = START_COL + columns.length - 1;
  const row = ws.getRow(START_ROW);
  row.height = 42;
  columns.forEach((col, i) => {
    const c = START_COL + i;
    const cell = row.getCell(c);
    cell.value = col.header;
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "medium", color: { argb: "FF386624" } },
      bottom: { style: "thin", color: { argb: "FF5E9C47" } },
      left: { style: c === START_COL ? "medium" : "thin", color: { argb: c === START_COL ? "FF386624" : "FF5E9C47" } },
      right: { style: c === endCol ? "medium" : "thin", color: { argb: c === endCol ? "FF386624" : "FF5E9C47" } },
    };
  });
};

const writeTitle = (ws, value, endCol) => {
  ws.mergeCells(2, START_COL, 2, endCol);
  const cell = ws.getCell(2, START_COL);
  cell.value = value;
  cell.font = { name: "Calibri", size: 13, bold: true, color: { argb: "FF1F3A12" } };
  cell.alignment = { vertical: "middle", horizontal: "left" };
  ws.getRow(2).height = 24;
};

const statusBadge = (cell, statusKey, c, endCol) => {
  const s = STATUS_EXCEL[statusKey] ?? STATUS_EXCEL[VISA_STATUS.PROCESS];
  cell.value = {
    richText: [
      { text: "● ", font: { name: "Calibri", size: 9, bold: true, color: { argb: s.dot } } },
      { text: s.label, font: { name: "Calibri", size: 9.5, bold: true, color: { argb: s.text } } },
    ],
  };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: s.bg } };
  cell.border = border(c, endCol, s.border);
};

// Excel sheet names: max 31 chars, no []:*?/\ and unique within the workbook.
const sheetNameFor = (name, used) => {
  const base = (text(name).replace(/[[\]:*?/\\]/g, " ").trim() || UNKNOWN_COUNTRY).slice(0, 31);
  let candidate = base;
  for (let n = 2; used.has(candidate.toLowerCase()); n++) {
    const suffix = ` (${n})`;
    candidate = base.slice(0, 31 - suffix.length) + suffix;
  }
  used.add(candidate.toLowerCase());
  return candidate;
};

const countByStatus = (items) => {
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]));
  items.forEach((item) => (counts[toVisaStatusKey(item.status)] += 1));
  return counts;
};

const addCountrySheet = (workbook, { sheetName, countryName, items, fields, resolveLabel, periodText }) => {
  const fieldColumns = buildFieldColumns(fields, resolveLabel);
  const columns = [...FIXED_COLUMNS, ...fieldColumns, NOTE_COLUMN];
  const endCol = START_COL + columns.length - 1;
  const firstDataRow = START_ROW + 1;
  const lastDataRow = START_ROW + items.length;

  const ws = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: START_ROW, xSplit: START_COL + 1, showGridLines: true }],
  });
  ws.getColumn(1).width = 3;
  columns.forEach((col, i) => (ws.getColumn(START_COL + i).width = col.width));

  writeTitle(ws, `${countryName.toUpperCase()} — WIZA ARZALARY${periodText}`, endCol);
  writeHeader(ws, columns);

  items.forEach((item, offset) => {
    const values = parseValues(item.custom_field_values);
    const data = {
      index_number: item.index_number ? Number(item.index_number) || item.index_number : offset + 1,
      client: text(item.client_name || item.client?.fullName).toUpperCase(),
      phone: text(item.phone_number || item.client?.phone_number),
      passport: text(item.passport_number || item.client?.passport_number).toUpperCase(),
      dob: formatDate(item.dateOfBirth || item.client?.dateOfBirth || values.dateOfBirth),
      operator: text(item.operator_fullName || item.operator?.fullName).toUpperCase(),
      office: text(item.office_shortName).toUpperCase(),
      application_date: formatDate(item.application_date ?? values.application_date),
      status: toVisaStatusKey(item.status),
      note: text([item.note, item.notes, values.note, values.notes].find((v) => !isEmpty(v))),
    };
    for (const col of fieldColumns) data[col.key] = fieldText(values[col.key], col, resolveLabel);

    const row = ws.getRow(firstDataRow + offset);
    row.height = 21;
    columns.forEach((col, i) => {
      const c = START_COL + i;
      const cell = row.getCell(c);
      cell.font = { name: "Calibri", size: 10 };
      cell.alignment = { vertical: "middle", horizontal: col.align, wrapText: col.key === "note" };
      cell.border = border(c, endCol, "FFD9D9D9");
      if (col.key === "status") statusBadge(cell, data.status, c, endCol);
      else cell.value = data[col.key];
    });
  });

  ws.autoFilter = { from: { row: START_ROW, column: START_COL }, to: { row: lastDataRow, column: endCol } };

  // Status counts under the table (a blank row keeps them out of the filter range).
  const counts = countByStatus(items);
  const summaryRow = lastDataRow + 2;
  const cell = ws.getCell(summaryRow, START_COL);
  cell.value = `Jemi: ${items.length}   ·   ${STATUS_ORDER.map((s) => `${STATUS_EXCEL[s].label}: ${counts[s]}`).join("   ·   ")}`;
  cell.font = { name: "Calibri", size: 10, bold: true };
  ws.mergeCells(summaryRow, START_COL, summaryRow, Math.min(endCol, START_COL + 8));
};

/** First sheet: one row per country with its status counts, plus the grand total. */
const addSummarySheet = (workbook, groups, periodText) => {
  const columns = [
    { header: "№", width: 6, align: "center" },
    { header: "ÝURT", width: 30, align: "left" },
    { header: "JEMI", width: 12, align: "center" },
    ...STATUS_ORDER.map((s) => ({ header: STATUS_EXCEL[s].label.toUpperCase(), width: 14, align: "center" })),
  ];
  const endCol = START_COL + columns.length - 1;
  const ws = workbook.addWorksheet("Jemi", { views: [{ state: "frozen", ySplit: START_ROW, showGridLines: true }] });
  ws.getColumn(1).width = 3;
  columns.forEach((col, i) => (ws.getColumn(START_COL + i).width = col.width));

  writeTitle(ws, `WIZA ARZALARY — ÄHLI ÝURTLAR${periodText}`, endCol);
  writeHeader(ws, columns);

  const totals = [0, 0, 0, 0];
  groups.forEach((g, i) => {
    const counts = countByStatus(g.items);
    const values = [i + 1, g.countryName, g.items.length, ...STATUS_ORDER.map((s) => counts[s])];
    values.slice(2).forEach((v, k) => (totals[k] += v));
    const row = ws.getRow(START_ROW + 1 + i);
    row.height = 21;
    values.forEach((v, k) => {
      const c = START_COL + k;
      const cell = row.getCell(c);
      cell.value = v;
      cell.font = { name: "Calibri", size: 10, bold: k === 2 };
      cell.alignment = { vertical: "middle", horizontal: columns[k].align };
      cell.border = border(c, endCol, "FFD9D9D9");
    });
    // Jump to the country's own sheet.
    row.getCell(START_COL + 1).value = { text: g.countryName, hyperlink: `#'${g.sheetName.replace(/'/g, "''")}'!A1` };
    row.getCell(START_COL + 1).font = { name: "Calibri", size: 10, color: { argb: "FF1D4ED8" }, underline: true };
  });

  const total = ws.getRow(START_ROW + groups.length + 2);
  total.height = 24;
  ["Jemi", "", ...totals].forEach((v, k) => {
    const c = START_COL + k;
    const cell = total.getCell(c);
    cell.value = v === "" ? null : v;
    cell.font = { name: "Calibri", size: 10, bold: true };
    cell.alignment = { vertical: "middle", horizontal: k === 0 ? "left" : columns[k].align };
    cell.border = {
      ...border(c, endCol, "FFD9D9D9"),
      top: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
    };
  });
};

/**
 * @param items   applications of all countries from /receivings/get-all-receiving
 * @param options { fileName, params, countries, resolveLabel }
 *   countries: the country list with `custom_fields` (each sheet's columns)
 */
export const exportVisaIntakeExcel = async (items = [], options = {}) => {
  const { countries = [], resolveLabel = (v) => (typeof v === "string" ? v : v?.tk || "") } = options;
  const fileName = options.fileName || "Wiza_arzalary";
  const { start_date: from, end_date: to } = options.params || {};
  const periodText = from || to ? ` (${from ? formatDate(from) : "…"} – ${to ? formatDate(to) : "…"})` : "";

  const countryByGuid = new Map(countries.map((c) => [c.guid, c]));

  // Group once, keeping each country's rows in API order (newest first).
  const byCountry = new Map();
  for (const item of items) {
    const key = item.country_guid || "";
    if (!byCountry.has(key)) byCountry.set(key, []);
    byCountry.get(key).push(item);
  }

  const usedSheetNames = new Set(["jemi"]);
  const groups = [...byCountry.entries()]
    .map(([guid, rows]) => {
      const country = countryByGuid.get(guid);
      const countryName =
        resolveLabel(country?.name) || text(rows[0]?.country_name) || UNKNOWN_COUNTRY;
      return { guid, country, countryName, items: rows };
    })
    // Alphabetical; applications whose country no longer exists go last.
    .sort((a, b) => Boolean(!a.country) - Boolean(!b.country) || a.countryName.localeCompare(b.countryName, "tk"))
    .map((g) => ({ ...g, sheetName: sheetNameFor(g.countryName, usedSheetNames) }));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();

  addSummarySheet(workbook, groups, periodText);
  for (const g of groups) {
    addCountrySheet(workbook, {
      sheetName: g.sheetName,
      countryName: g.countryName,
      items: g.items,
      fields: g.country?.custom_fields || [],
      resolveLabel,
      periodText,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `${fileName}_${dayjs().format("YYYY-MM-DD")}.xlsx`);
};
