import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { fetchAllPaginatedData, formatExcelDate } from "../../../../functions/excelExportHelper";
import { getAllReportsApi, getLettersByDocumentRangeApi } from "../../../../api/queries/getters";
import {
  LETTER_STATUS,
  formatYhNumber,
  getLetterRange,
  getStockRange,
  resolveLetterStatus,
} from "./stockLetters";

/**
 * Letter stock report, in the layout of the other report exports (see exportCafeteriaExcel):
 * company banner on row 2 and one table from D4 with zebra rows, AutoFilter, a frozen header
 * and a SUBTOTAL total row.
 *
 * One row per batch: its number range, size, and how many of its letters were sold, damaged,
 * lost and are left, each status in its own column. Referral letters count as sold: they use
 * their number up like a sale. Header cells carry a note explaining their column
 * (`referralLetter.export.headerNotes`).
 *
 * Only numbers inside a batch are counted, like the page, and a number several entries cover
 * is counted once, so the statuses always add up to the batch size.
 */

const TEAL = "FF0E8584";
const RED = "FFDC2626";
const BLACK = "FF000000";
const GREY_TEXT = "FF6B7280";
const GRID = "FFD9D9D9";
const ZEBRA = "FFF3F4F6";
const COUNT_FMT = '#,##0;-#,##0;"-"';

const START_ROW = 4;
const START_COL = 4; // Column D, as in the other exports

const STATUS_COLOR = {
  [LETTER_STATUS.SOLD]: "FF166534",
  [LETTER_STATUS.DAMAGED]: "FF9A3412",
  [LETTER_STATUS.LOST]: "FF991B1B",
};
const USED_STATUSES = Object.keys(STATUS_COLOR);

const font = (extra = {}) => ({ name: "Calibri", size: 10, color: { argb: BLACK }, ...extra });
const solid = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const line = (style, argb) => ({ style, color: { argb } });

// Thin grey inner grid inside a medium black frame.
const frameBorder = (col, endCol, { top, bottom } = {}) => ({
  top: top ?? line("thin", GRID),
  bottom: bottom ?? line("thin", GRID),
  left: col === START_COL ? line("medium", BLACK) : line("thin", GRID),
  right: col === endCol ? line("medium", BLACK) : line("thin", GRID),
});

const getColName = (colNum) => {
  let name = "";
  let num = colNum;
  while (num > 0) {
    const mod = (num - 1) % 26;
    name = String.fromCharCode(65 + mod) + name;
    num = Math.floor((num - 1) / 26);
  }
  return name;
};

// A referral letter used its number up like a sale, so it is counted as one. `status` is free
// text in the backend; an unknown one is counted as a sale too.
const getStatusKey = (letter) => {
  if (letter.isRefferal) return LETTER_STATUS.SOLD;
  const status = resolveLetterStatus(letter.status);
  return STATUS_COLOR[status] ? status : LETTER_STATUS.SOLD;
};

/**
 * Counts each batch's numbers by status. Numbers outside the batch are ignored, and numbers an
 * earlier entry already covers are counted once.
 */
const buildBatches = (stocks, letters) => {
  const rows = letters
    .map((letter) => ({ letter, ...getLetterRange(letter) }))
    .filter((row) => Number.isFinite(row.start) && Number.isFinite(row.end))
    .sort((a, b) => a.start - b.start || a.end - b.end);
  // Entries are sorted by start, so a batch only looks from the first entry that can still
  // reach it (starting at most the longest entry's length before it) instead of all of them.
  const longest = rows.reduce((max, row) => Math.max(max, row.end - row.start), 0);
  const firstStartingFrom = (value) => {
    let lo = 0;
    let hi = rows.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (rows[mid].start < value) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  return stocks.map((stock) => {
    const range = getStockRange(stock);
    const counts = Object.fromEntries(USED_STATUSES.map((status) => [status, 0]));

    if (range) {
      let cursor = range.start;
      for (let i = firstStartingFrom(range.start - longest); i < rows.length; i += 1) {
        const row = rows[i];
        if (row.start > range.end) break;
        const from = Math.max(row.start, range.start, cursor);
        const to = Math.min(row.end, range.end);
        if (to < from) continue;
        counts[getStatusKey(row.letter)] += to - from + 1;
        cursor = to + 1;
      }
    }

    const total = Number(stock.total_letter) || (range ? range.end - range.start + 1 : 0);
    const used = USED_STATUSES.reduce((sum, status) => sum + counts[status], 0);
    return { stock, total, counts, remaining: Math.max(0, total - used) };
  });
};

const writeBanner = (sheet, endCol, title, asOf) => {
  sheet.getRow(1).height = 12;
  sheet.getRow(2).height = 30;
  sheet.getRow(3).height = 10;
  sheet.mergeCells(2, START_COL, 2, endCol);
  const cell = sheet.getCell(2, START_COL);
  cell.value = {
    richText: [
      {
        text: 'OGUZABAT Hojalyk Jemgyýetiniň "OGUZTRAVEL" syýahatçylyk bölümi | ',
        font: font({ size: 11, bold: true }),
      },
      { text: title, font: font({ size: 11, bold: true, color: { argb: TEAL } }) },
      { text: ` (${asOf})`, font: font({ size: 11, bold: true, color: { argb: RED } }) },
    ],
  };
  cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
};

// Each header cell carries a note (Excel comment) explaining its column.
const writeHeader = (sheet, columns, t) => {
  const endCol = START_COL + columns.length - 1;
  const row = sheet.getRow(START_ROW);
  row.height = 30;
  columns.forEach((col, idx) => {
    const colNumber = START_COL + idx;
    const cell = row.getCell(colNumber);
    cell.value = col.header;
    cell.note = {
      texts: [
        { font: { bold: true, size: 9 }, text: `${col.header}\n` },
        { font: { size: 9 }, text: t(`referralLetter.export.headerNotes.${col.key}`) },
      ],
      margins: { insetmode: "custom", inset: [0.12, 0.12, 0.12, 0.12] },
    };
    cell.font = font({ size: 11, bold: true, color: { argb: col.color || BLACK } });
    cell.fill = solid("FFFFFFFF");
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: line("medium", BLACK),
      bottom: line("medium", BLACK),
      left: colNumber === START_COL ? line("medium", BLACK) : line("thin", "FFBFBFBF"),
      right: colNumber === endCol ? line("medium", BLACK) : line("thin", "FFBFBFBF"),
    };
  });
};

const countColumn = (key, header, color, width = 11) => ({
  header,
  key,
  width,
  align: "right",
  sum: true,
  color,
});

const writeSheet = (workbook, batches, t, asOf) => {
  const columns = [
    { header: "T/B", key: "index", width: 6, align: "center" },
    { header: t("referralLetter.batchName"), key: "name", width: 22, align: "left" },
    { header: t("referralLetter.startNo"), key: "startNo", width: 13, align: "center" },
    { header: t("referralLetter.endNo"), key: "endNo", width: 13, align: "center" },
    countColumn("total", t("referralLetter.totalCount")),
    countColumn("sold", t("referralLetter.statusSold"), STATUS_COLOR[LETTER_STATUS.SOLD]),
    countColumn("damaged", t("referralLetter.statusDamaged"), STATUS_COLOR[LETTER_STATUS.DAMAGED], 12),
    countColumn("lost", t("referralLetter.statusLost"), STATUS_COLOR[LETTER_STATUS.LOST]),
    countColumn("remaining", t("referralLetter.remainingCount"), TEAL),
    { header: t("columns.date"), key: "date", width: 12, align: "center" },
    { header: t("columns.note"), key: "note", width: 24, align: "left" },
  ];
  const endCol = START_COL + columns.length - 1;
  const remainingCol = START_COL + columns.findIndex((c) => c.key === "remaining");
  const sheet = workbook.addWorksheet(t("referralLetter.export.sheetName").substring(0, 31), {
    // Header row stays visible while scrolling.
    views: [{ state: "frozen", ySplit: START_ROW, showGridLines: true }],
  });
  [1, 2, 3].forEach((c) => {
    sheet.getColumn(c).width = 4;
  });

  writeBanner(sheet, endCol, t("referralLetter.export.reportTitle"), asOf);
  writeHeader(sheet, columns, t);

  // Text cells, so the leading zeros of the ÝH numbers show.
  const rowValues = batches.map(({ stock, total, counts, remaining }, offset) => ({
    index: stock.index_number ?? offset + 1,
    name: stock.name ? String(stock.name).trim() : "",
    startNo: formatYhNumber(stock.start_yh_number),
    endNo: formatYhNumber(stock.end_yh_number),
    total,
    sold: counts[LETTER_STATUS.SOLD],
    damaged: counts[LETTER_STATUS.DAMAGED],
    lost: counts[LETTER_STATUS.LOST],
    remaining,
    date: formatExcelDate(stock.createdAt),
    note: stock.note ? String(stock.note).trim() : "",
  }));

  const firstDataRow = START_ROW + 1;
  const lastDataRow = START_ROW + rowValues.length;
  const maxLens = columns.map((c) => String(c.header).length);

  rowValues.forEach((values, offset) => {
    const row = sheet.getRow(firstDataRow + offset);
    row.height = 20;
    const bg = offset % 2 === 1 ? ZEBRA : "FFFFFFFF";
    columns.forEach((c, idx) => {
      const colNumber = START_COL + idx;
      const cell = row.getCell(colNumber);
      const value = values[c.key];
      cell.value = value;
      // Status counts in their colour; zero prints as "-", so empty statuses read at a glance.
      cell.font = font({ bold: Boolean(c.color) || c.key === "name", color: { argb: c.color || BLACK } });
      cell.fill = solid(bg);
      cell.alignment = { vertical: "middle", horizontal: c.align, wrapText: c.key === "note" };
      cell.border = frameBorder(colNumber, endCol);
      if (c.sum) cell.numFmt = COUNT_FMT;
      const len = (typeof value === "number" ? value.toLocaleString("en-US") : String(value ?? "")).length;
      if (len > maxLens[idx]) maxLens[idx] = len;
    });
    // A used-up batch has nothing left: greyed out.
    if (values.remaining === 0) {
      row.getCell(remainingCol).font = font({ bold: true, color: { argb: GREY_TEXT } });
    }
  });

  sheet.autoFilter = {
    from: { row: START_ROW, column: START_COL },
    to: { row: lastDataRow, column: endCol },
  };

  // Total row under the table, outside the AutoFilter range, with SUBTOTAL per count column
  // so the totals follow the filter.
  const totalRow = sheet.getRow(lastDataRow + 2);
  totalRow.height = 24;
  columns.forEach((c, idx) => {
    const colNumber = START_COL + idx;
    const cell = totalRow.getCell(colNumber);
    cell.font = font({ size: 10.5, bold: true, color: { argb: c.color || BLACK } });
    cell.alignment = { vertical: "middle", horizontal: c.align };
    cell.border = frameBorder(colNumber, endCol, {
      top: line("medium", BLACK),
      bottom: line("medium", BLACK),
    });
    if (c.sum) {
      const letter = getColName(colNumber);
      cell.value = {
        formula: `SUBTOTAL(109,${letter}${firstDataRow}:${letter}${lastDataRow})`,
        result: rowValues.reduce((sum, values) => sum + Number(values[c.key] || 0), 0),
      };
      cell.numFmt = COUNT_FMT;
    }
  });
  totalRow.getCell(START_COL).value = t("referralLetter.export.total");
  totalRow.getCell(START_COL).alignment = { vertical: "middle", horizontal: "left" };

  // Widths follow the longest value, within [col.width, 48].
  columns.forEach((col, idx) => {
    sheet.getColumn(START_COL + idx).width = Math.min(Math.max(col.width, maxLens[idx] + 3), 48);
  });
};

export const exportLetterStockExcel = async ({ params = {}, onProgress = null, t }) => {
  const stockParams = {};
  Object.entries(params).forEach(([k, v]) => {
    if (!["page", "limit", "pageSize"].includes(k) && v !== undefined && v !== null && v !== "") {
      stockParams[k] = v;
    }
  });

  onProgress?.({ message: t("referralLetter.export.fetchingStocks"), percent: 5 });
  const stocks = await fetchAllPaginatedData(
    getAllReportsApi,
    stockParams,
    (loaded, total) =>
      onProgress?.({
        message: `${t("referralLetter.export.fetchingStocks")} ${loaded} / ${total}`,
        percent: total > 0 ? 5 + Math.round((loaded / total) * 25) : 20,
      }),
    100,
  );
  if (!stocks?.length) throw new Error(t("referralLetter.export.noData"));

  // One paged walk over the span of all batches instead of a request per batch; entries are
  // then assigned to batches locally.
  const ranges = stocks.map(getStockRange).filter(Boolean);
  let letters = [];
  if (ranges.length) {
    onProgress?.({ message: t("referralLetter.export.fetchingLetters"), percent: 32 });
    letters = await fetchAllPaginatedData(
      getLettersByDocumentRangeApi,
      {
        start_number: ranges.reduce((min, r) => Math.min(min, r.start), Infinity),
        end_number: ranges.reduce((max, r) => Math.max(max, r.end), -Infinity),
      },
      (loaded, total) =>
        onProgress?.({
          message: `${t("referralLetter.export.fetchingLetters")} ${loaded} / ${total}`,
          percent: total > 0 ? 32 + Math.round((loaded / total) * 53) : 60,
        }),
      500,
    );
  }

  onProgress?.({ message: t("referralLetter.export.generating"), percent: 90 });
  const sortedStocks = [...stocks].sort(
    (a, b) =>
      Number(a.start_yh_number) - Number(b.start_yh_number) ||
      Number(a.index_number) - Number(b.index_number),
  );
  const batches = buildBatches(sortedStocks, Array.isArray(letters) ? letters : []);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();
  writeSheet(workbook, batches, t, t("referralLetter.export.asOf", { date: dayjs().format("DD.MM.YYYY") }));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${t("referralLetter.export.fileName")}_${dayjs().format("YYYY-MM-DD")}.xlsx`);

  onProgress?.({ message: t("referralLetter.export.success"), percent: 100 });
  return batches.length;
};

export default exportLetterStockExcel;
