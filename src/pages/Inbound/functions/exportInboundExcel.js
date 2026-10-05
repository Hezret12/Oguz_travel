import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { fetchAllPaginatedData, formatExcelDate } from "../../../functions/excelExportHelper";
import {
  getAllInboundArrivalsApi,
  getAllInboundExpectedApi,
  getAllInboundInvitationsApi,
} from "../../../api/queries/getters";
import { DATE_FORMAT } from "../constants";

// The workbook is the official monthly report form, so its wording is fixed
// Turkmen text and does not follow the interface language.
const COMPANY = '"OGUZABAT" hojalyk jemgyýeti';

const MONTHS = [
  "ÝANWAR", "FEWRAL", "MART", "APREL", "MAÝ", "IÝUN",
  "IÝUL", "AWGUST", "SENTÝABR", "OKTÝABR", "NOÝABR", "DEKABR",
];

const GENDER_TEXT = { MALE: "ERKEK", FEMALE: "AÝAL" };

const FONT = "Times New Roman";
const BLACK = { argb: "FF000000" };
const THIN = { style: "thin", color: BLACK };
const BORDER = { top: THIN, bottom: THIN, left: THIN, right: THIN };

// Ordinal suffix of a year follows the vowel harmony of its last spoken word:
// 2024 "dördünji" → -nji, 2026 "altynjy" → -njy.
const BACK_VOWEL_UNITS = [6, 9];
const BACK_VOWEL_TENS = [1, 3, 4, 6, 9];
const yearOrdinal = (year) => {
  const unit = year % 10;
  const isBack = unit ? BACK_VOWEL_UNITS.includes(unit) : BACK_VOWEL_TENS.includes(Math.floor(year / 10) % 10);
  return `${year}-${isBack ? "njy" : "nji"}`;
};

const periodText = (month) => `${yearOrdinal(month.year())} ýylyň ${MONTHS[month.month()]}`;

export const monthRangeParams = (month) => ({
  start_date: month.startOf("month").format(DATE_FORMAT),
  end_date: month.endOf("month").format(DATE_FORMAT),
});

/** "Expected" is filed for the month after the one being reported. */
export const expectedMonthOf = (month) => month.add(1, "month");

const text = (value) => String(value ?? "").trim();

const style = (cell, { bold = false, size = 12, align = "center", wrap = true, border = false } = {}) => {
  cell.font = { name: FONT, size, bold };
  cell.alignment = { vertical: "middle", horizontal: align, wrapText: wrap };
  if (border) cell.border = BORDER;
  return cell;
};

const addSheet = (workbook, name, widths) => {
  const sheet = workbook.addWorksheet(name, {
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  widths.forEach((width, i) => {
    sheet.getColumn(i + 1).width = width;
  });
  return sheet;
};

// The form's name in the top-right corner and the merged report title under it.
const writeTitle = (sheet, { formName, title, lastCol, titleRow, titleRowSpan = 1, height }) => {
  style(sheet.getCell(2, lastCol), { bold: true, align: "right", wrap: false }).value = formName;
  sheet.mergeCells(titleRow, 1, titleRow + titleRowSpan - 1, lastCol);
  style(sheet.getCell(titleRow, 1), { bold: true }).value = title;
  for (let r = titleRow; r < titleRow + titleRowSpan; r++) {
    sheet.getRow(r).height = height / titleRowSpan;
  }
};

const writeHeader = (sheet, rowIndex, headers, height) => {
  const row = sheet.getRow(rowIndex);
  row.height = height;
  headers.forEach((header, i) => {
    style(row.getCell(i + 1), { bold: true, size: 11, border: true }).value = header;
  });
};

// `aligns[i]` is the horizontal alignment of column i; long text wraps.
const writeRow = (sheet, rowIndex, values, aligns, options = {}) => {
  const row = sheet.getRow(rowIndex);
  values.forEach((value, i) => {
    style(row.getCell(i + 1), { size: 11, align: aligns[i] || "center", border: true, ...options }).value = value;
  });
  return row;
};

const writeLines = (sheet, startRow, lines) => {
  lines.forEach(([rowOffset, col, value]) => {
    style(sheet.getCell(startRow + rowOffset, col), { align: "left", wrap: false }).value = value;
  });
};

const EXECUTOR_LINES = [
  [0, 2, "Ýerine ýetiriji:   F.A.A.a.  (goly)"],
  [1, 2, "Tel.:"],
];


const buildExpectedSheet = (workbook, rows, month) => {
  const sheet = addSheet(workbook, "GARAŞYLÝAN -ОЖИДАЕМЫЕ", [7, 22, 16, 28, 52, 24]);
  writeTitle(sheet, {
    formName: "GARAŞYLÝAN",
    title: `${periodText(month)} aýy boýunça ${COMPANY} tarapyndan ýekeleýin we toparlaýyn garaşylýan daşary ýurt syýahatçylary barada maglumat`,
    lastCol: 6,
    titleRow: 4,
    height: 48,
  });
  writeHeader(
    sheet,
    6,
    ["T/b", "Ýurdy", "Syýahatçylaryň sany", "Syýahatyň möhleti", "Syýahat ugurlary", "Ulagyň görnüşi"],
    36,
  );

  const aligns = ["center", "left", "center", "center", "left", "left"];
  rows.forEach((row, i) => {
    writeRow(
      sheet,
      7 + i,
      [
        `${i + 1}.`,
        text(row.country),
        Number(row.tourists_count) || 0,
        `${formatExcelDate(row.start_date)} – ${formatExcelDate(row.end_date)}`,
        text(row.route),
        text(row.transport),
      ],
      aligns,
    );
  });

  const totalRow = 7 + rows.length;
  writeRow(sheet, totalRow, ["", "Jemi:", "", "", "", ""], aligns, { bold: true });
  sheet.getCell(totalRow, 3).value = rows.length
    ? { formula: `SUM(C7:C${totalRow - 1})`, result: rows.reduce((sum, r) => sum + (Number(r.tourists_count) || 0), 0) }
    : 0;

  writeLines(sheet, totalRow + 3, EXECUTOR_LINES);
};


const buildArrivalsSheet = (workbook, rows, month) => {
  const sheet = addSheet(workbook, "GELEN - ПРИЕМ ПОФАМИЛЬНЫЙ", [6, 34, 10, 14, 20, 14, 16, 18, 14, 14, 16, 16]);
  writeTitle(sheet, {
    formName: "GELEN syýahatçylar",
    title: `${COMPANY} tarapyndan\n${periodText(month)} aýynda kabul edilen daşary ýurtly syýahatçylar baradaky hasabat`,
    lastCol: 12,
    titleRow: 4,
    titleRowSpan: 2,
    height: 44,
  });
  writeHeader(
    sheet,
    7,
    [
      "T/b",
      "Syýahatçynyň F.A.A.a.",
      "Jynsy",
      "Doglan senesi",
      "Pasportynyň seriýasy we belgisi",
      "Raýatlygy",
      "Çakylygyň №",
      "Syýahat ýolhatynyň №",
      "Giren senesi",
      "Çykýan senesi",
      "BGN giriş",
      "BGN çykyş",
    ],
    48,
  );

  const aligns = ["center", "left"];
  rows.forEach((row, i) => {
    writeRow(
      sheet,
      8 + i,
      [
        i + 1,
        text(row.full_name),
        GENDER_TEXT[row.gender] || text(row.gender),
        formatExcelDate(row.birth_date),
        text(row.passport_number),
        text(row.citizenship),
        text(row.invitation_number),
        text(row.voucher_number),
        formatExcelDate(row.entry_date),
        formatExcelDate(row.exit_date),
        text(row.entry_border),
        text(row.exit_border),
      ],
      aligns,
    );
  });

  let rowIndex = 8 + rows.length;
  writeRow(sheet, rowIndex, ["", "Jemi:", rows.length, "", "", "", "", "", "", "", "", ""], aligns, { bold: true });

  // "Jemi ýurtlar boýunça": people per citizenship, largest first.
  const byCountry = new Map();
  rows.forEach((row) => {
    const country = text(row.citizenship);
    byCountry.set(country, (byCountry.get(country) || 0) + 1);
  });
  const countries = [...byCountry.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  rowIndex += 2;
  sheet.mergeCells(rowIndex, 2, rowIndex, 3);
  style(sheet.getCell(rowIndex, 2), { bold: true, align: "left" }).value = "Jemi ýurtlar boýunça";
  rowIndex += 1;
  style(sheet.getCell(rowIndex, 2), { bold: true, size: 11, border: true }).value = "Ýurdy";
  style(sheet.getCell(rowIndex, 3), { bold: true, size: 11, border: true }).value = "Adam sany";
  const firstCountryRow = rowIndex + 1;
  countries.forEach(([country, count]) => {
    rowIndex += 1;
    style(sheet.getCell(rowIndex, 2), { size: 11, align: "left", border: true }).value = country;
    style(sheet.getCell(rowIndex, 3), { size: 11, border: true }).value = count;
  });
  rowIndex += 1;
  style(sheet.getCell(rowIndex, 2), { bold: true, size: 11, align: "left", border: true }).value = "JEMI:";
  style(sheet.getCell(rowIndex, 3), { bold: true, size: 11, border: true }).value = countries.length
    ? { formula: `SUM(C${firstCountryRow}:C${rowIndex - 1})`, result: rows.length }
    : 0;

  writeLines(sheet, rowIndex + 3, [
    [0, 2, "Başlyk"],
    [0, 6, "goly"],
    [0, 9, "_____________________"],
    [1, 5, "M.Ýe."],
    [1, 10, "(F.A.A.a.)"],
    [3, 2, "Ýerine ýetiriji:   F.A.A.a.  (goly)"],
    [4, 2, "Tel.:"],
  ]);
};


const buildInvitationsSheet = (workbook, rows, month) => {
  const sheet = addSheet(workbook, "ÇAKYLYKLAR-Migrasiýa", [7, 26, 24, 22, 22, 24]);
  writeTitle(sheet, {
    formName: "ÇAKYLYKLAR-Migrasiýa",
    title: `${COMPANY} tarapyndan\n${periodText(month)} aýynda Türkmenistanyň Döwlet migrasiýa gullugyna çakylyk almak üçin tabşyrylan arzalaryň (adam sany boýunça) netijeleri baradaky hasabat`,
    lastCol: 6,
    titleRow: 4,
    titleRowSpan: 2,
    height: 66,
  });
  writeHeader(
    sheet,
    7,
    [
      "T/b",
      "Ýurtlar",
      "Çakylyk almak üçin berilen arzalaryň sany (adam sany)",
      "Çakylyk berilenleriň sany (ДОБРО)",
      "Çakylyk berilmedikleriň sany",
      "Netijesine garaşylýan arzalaryň sany",
    ],
    64,
  );

  // One line per country, even if it was entered in several records.
  const byCountry = new Map();
  rows.forEach((row) => {
    const country = text(row.country);
    const sum = byCountry.get(country) || { granted: 0, refused: 0, pending: 0 };
    sum.granted += Number(row.granted_count) || 0;
    sum.refused += Number(row.refused_count) || 0;
    sum.pending += Number(row.pending_count) || 0;
    byCountry.set(country, sum);
  });
  const countries = [...byCountry.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  const aligns = ["center", "left"];
  const totals = { granted: 0, refused: 0, pending: 0 };
  countries.forEach(([country, sum], i) => {
    const r = 8 + i;
    totals.granted += sum.granted;
    totals.refused += sum.refused;
    totals.pending += sum.pending;
    writeRow(
      sheet,
      r,
      [
        i + 1,
        country,
        // Submitted = granted + refused + pending, as in the form.
        { formula: `D${r}+E${r}+F${r}`, result: sum.granted + sum.refused + sum.pending },
        sum.granted,
        sum.refused,
        sum.pending,
      ],
      aligns,
    );
  });

  const totalRow = 8 + countries.length;
  const sumOf = (col, result) =>
    countries.length ? { formula: `SUM(${col}8:${col}${totalRow - 1})`, result } : 0;
  writeRow(
    sheet,
    totalRow,
    [
      "",
      "Jemi:",
      { formula: `D${totalRow}+E${totalRow}+F${totalRow}`, result: totals.granted + totals.refused + totals.pending },
      sumOf("D", totals.granted),
      sumOf("E", totals.refused),
      sumOf("F", totals.pending),
    ],
    aligns,
    { bold: true },
  );

  writeLines(sheet, totalRow + 4, [
    [0, 2, "Başlyk                               goly"],
    [0, 4, "___________"],
    [1, 2, "M.Ýe."],
    [1, 4, "(F.A.A.a.)"],
    [3, 2, "Ýerine ýetiriji:   F.A.A.a.  (goly)"],
    [4, 2, "Tel.:"],
  ]);
};


/**
 * Builds the three-sheet monthly report for `month` (a dayjs): received tourists and
 * invitation results of that month, and the tourists expected in the month after it.
 */
export const exportInboundExcel = async ({ month, t, onProgress = null }) => {
  const expectedMonth = expectedMonthOf(month);

  onProgress?.({ message: t("inbound.export.fetching"), percent: 5 });
  const expected = await fetchAllPaginatedData(getAllInboundExpectedApi, monthRangeParams(expectedMonth));
  onProgress?.({ message: t("inbound.export.fetching"), percent: 30 });
  const arrivals = await fetchAllPaginatedData(getAllInboundArrivalsApi, monthRangeParams(month));
  onProgress?.({ message: t("inbound.export.fetching"), percent: 60 });
  const invitations = await fetchAllPaginatedData(getAllInboundInvitationsApi, monthRangeParams(month));

  if (!expected.length && !arrivals.length && !invitations.length) {
    throw new Error(t("common.exportExcelNoData"));
  }

  onProgress?.({ message: t("inbound.export.generating"), percent: 85 });

  const byDate = (field) => (a, b) => String(a[field] || "").localeCompare(String(b[field] || ""));
  expected.sort(byDate("start_date"));
  arrivals.sort(
    (a, b) => byDate("entry_date")(a, b) || text(a.full_name).localeCompare(text(b.full_name)),
  );

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();

  buildExpectedSheet(workbook, expected, expectedMonth);
  buildArrivalsSheet(workbook, arrivals, month);
  buildInvitationsSheet(workbook, invitations, month);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `Inbound_hasabat_${month.format("YYYY-MM")}.xlsx`);

  onProgress?.({ message: t("inbound.export.success"), percent: 100 });
  return { expected: expected.length, arrivals: arrivals.length, invitations: invitations.length };
};

export default exportInboundExcel;
