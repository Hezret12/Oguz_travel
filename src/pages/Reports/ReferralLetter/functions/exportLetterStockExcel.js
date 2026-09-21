import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { fetchAllPaginatedData, formatExcelDate } from "../../../../functions/excelExportHelper";
import { getAllReportsApi, getLettersByDocumentRangeApi } from "../../../../api/queries/getters";
import { LETTER_STATUS, getLetterRange, getStockRange, resolveLetterStatus } from "./stockLetters";

/**
 * Letter stock report, in the layout of the other report exports (see exportCafeteriaExcel):
 * company banner on row 2, one flat table per sheet from D4 with zebra rows, status pills,
 * AutoFilter and a SUBTOTAL total row.
 *
 * - Sheet 1 (summary): one row per batch — its number range and how many were sold, damaged,
 *   lost, used by referral letters, and are left.
 * - Sheet 2 (details): every batch walked from its first number to its last, each run of
 *   numbers with what happened to it, unused runs included.
 *
 * Only numbers inside a batch are counted, like the page, so an entry overhanging its batch
 * never pushes "used" past the batch size.
 */

const TEAL = "FF0E8584";
const TEAL_DARK = "FF0F5F5E";
const TEAL_LIGHT = "FFE0F2F1";
const RED = "FFDC2626";
const BLACK = "FF000000";
const GREY_TEXT = "FF6B7280";
const GRID = "FFD9D9D9";
const ZEBRA = "FFF3F4F6";
const COUNT_FMT = '#,##0;-#,##0;"-"';

const START_ROW = 4;
const START_COL = 4; // Column D, as in the other exports

const REFERRAL = "REFERRAL";
const UNUSED = "UNUSED";

const STATUS_STYLE = {
  [LETTER_STATUS.SOLD]: { bg: "FFDCFCE7", fg: "FF166534" },
  [LETTER_STATUS.DAMAGED]: { bg: "FFFFEDD5", fg: "FF9A3412" },
  [LETTER_STATUS.LOST]: { bg: "FFFEE2E2", fg: "FF991B1B" },
  [REFERRAL]: { bg: TEAL_LIGHT, fg: TEAL_DARK },
  [UNUSED]: { bg: "FFE5E7EB", fg: "FF4B5563" },
};

const font = (extra = {}) => ({ name: "Calibri", size: 10, color: { argb: BLACK }, ...extra });
const solid = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const line = (style, argb) => ({ style, color: { argb } });

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

// Thin grey inner grid inside a medium black frame.
const frameBorder = (col, endCol, { top, bottom } = {}) => ({
  top: top ?? line("thin", GRID),
  bottom: bottom ?? line("thin", GRID),
  left: col === START_COL ? line("medium", BLACK) : line("thin", GRID),
  right: col === endCol ? line("medium", BLACK) : line("thin", GRID),
});

const getStatusKey = (letter) => (letter.isRefferal ? REFERRAL : resolveLetterStatus(letter.status));

const getStatusLabels = (t) => ({
  [LETTER_STATUS.SOLD]: t("referralLetter.statusSold"),
  [LETTER_STATUS.DAMAGED]: t("referralLetter.statusDamaged"),
  [LETTER_STATUS.LOST]: t("referralLetter.statusLost"),
  [REFERRAL]: t("sidebar.referalLetters"),
  [UNUSED]: t("referralLetter.export.unused"),
});

// Keeps leading zeros ("0000201") when the entry's own number was written with them.
const padLike = (n, raw) => {
  const text = String(raw ?? "").trim();
  return /^0\d+$/.test(text) ? String(n).padStart(text.length, "0") : String(n);
};

const formatRun = (from, to, raw) =>
  from === to ? padLike(from, raw) : `${padLike(from, raw)} – ${padLike(to, raw)}`;

const createSheet = (workbook, name) => {
  const sheet = workbook.addWorksheet(name.substring(0, 31), {
    views: [{ showGridLines: true }],
  });
  [1, 2, 3].forEach((c) => {
    sheet.getColumn(c).width = 4;
  });
  return sheet;
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

const writeHeader = (sheet, columns) => {
  const endCol = START_COL + columns.length - 1;
  const row = sheet.getRow(START_ROW);
  row.height = 30;
  columns.forEach((col, idx) => {
    const colNumber = START_COL + idx;
    const cell = row.getCell(colNumber);
    cell.value = col.header;
    cell.font = font({ size: 11, bold: true, color: { argb: col.headerColor || BLACK } });
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

// Total row under the table, outside the AutoFilter range, with SUBTOTAL per `sum` column so
// the totals follow the filter.
const writeTotalRow = (sheet, columns, firstDataRow, lastDataRow, rowValues, label) => {
  const endCol = START_COL + columns.length - 1;
  const totalRow = sheet.getRow(lastDataRow + 2);
  totalRow.height = 24;
  columns.forEach((c, idx) => {
    const colNumber = START_COL + idx;
    const cell = totalRow.getCell(colNumber);
    cell.font = font({ bold: true, color: { argb: c.headerColor || BLACK } });
    cell.alignment = { vertical: "middle", horizontal: c.align };
    cell.border = frameBorder(colNumber, endCol, {
      top: line("thin", BLACK),
      bottom: line("medium", BLACK),
    });
    if (c.sum) {
      const letter = getColName(colNumber);
      cell.value = {
        formula: `SUBTOTAL(109,${letter}${firstDataRow}:${letter}${lastDataRow})`,
        result: rowValues.reduce((sum, values) => sum + Number(values[c.key] || 0), 0),
      };
      cell.numFmt = COUNT_FMT;
      cell.font = font({ size: 10.5, bold: true, color: { argb: c.headerColor || BLACK } });
    }
  });
  totalRow.getCell(START_COL).value = label;
  totalRow.getCell(START_COL).alignment = { vertical: "middle", horizontal: "left" };
};

// Widths follow the longest value, within [col.width, 48].
const fitColumns = (sheet, columns, maxLens) => {
  columns.forEach((col, idx) => {
    sheet.getColumn(START_COL + idx).width = Math.min(Math.max(col.width, maxLens[idx] + 3), 48);
  });
};

const trackLength = (maxLens, idx, value) => {
  if (value === null || value === undefined || value === "") return;
  const len = String(value).length;
  if (len > maxLens[idx]) maxLens[idx] = len;
};

/**
 * Splits each batch into consecutive runs from its first to its last number: one run per
 * entry (clipped to the batch) and one per stretch of unused numbers. Also counts the
 * batch's numbers by status.
 */
const buildBatches = (stocks, letters) => {
  const rows = letters
    .map((letter) => ({ letter, ...getLetterRange(letter) }))
    .filter((row) => Number.isFinite(row.start) && Number.isFinite(row.end))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  return stocks.map((stock) => {
    const range = getStockRange(stock);
    const counts = { [LETTER_STATUS.SOLD]: 0, [LETTER_STATUS.DAMAGED]: 0, [LETTER_STATUS.LOST]: 0, [REFERRAL]: 0 };
    const runs = [];

    if (range) {
      let cursor = range.start;
      rows.forEach((row) => {
        const from = Math.max(row.start, range.start);
        const to = Math.min(row.end, range.end);
        if (to < from) return;
        if (from > cursor) {
          runs.push({ from: cursor, to: from - 1, status: UNUSED, added: from - cursor });
        }
        const status = getStatusKey(row.letter);
        // Numbers an earlier entry already covers are counted once.
        const added = Math.max(0, to - Math.max(from, cursor) + 1);
        runs.push({
          from,
          to,
          status,
          added,
          letter: row.letter,
          overhangs: row.start < range.start || row.end > range.end,
          // Starts inside numbers an earlier entry already covers.
          overlaps: from < cursor,
        });
        counts[status in counts ? status : LETTER_STATUS.SOLD] += added;
        cursor = Math.max(cursor, to + 1);
      });
      if (cursor <= range.end) {
        runs.push({ from: cursor, to: range.end, status: UNUSED, added: range.end - cursor + 1 });
      }
    }

    const total = Number(stock.total_letter) || (range ? range.end - range.start + 1 : 0);
    const used = Object.values(counts).reduce((sum, n) => sum + n, 0);
    return { stock, range, total, used, remaining: Math.max(0, total - used), counts, runs };
  });
};

const writeSummarySheet = (workbook, batches, t, asOf) => {
  const columns = [
    { header: "T/B", key: "index", width: 6, align: "center" },
    { header: t("referralLetter.batchName"), key: "name", width: 20, align: "left" },
    { header: t("referralLetter.export.numberRange"), key: "range", width: 18, align: "center" },
    { header: t("referralLetter.totalCount"), key: "total", width: 11, align: "right", sum: true },
    { header: t("referralLetter.statusSold"), key: "sold", width: 11, align: "right", sum: true },
    { header: t("referralLetter.statusDamaged"), key: "damaged", width: 12, align: "right", sum: true },
    { header: t("referralLetter.statusLost"), key: "lost", width: 11, align: "right", sum: true },
    { header: t("sidebar.referalLetters"), key: "referral", width: 13, align: "right", sum: true },
    { header: t("referralLetter.usedCount"), key: "used", width: 11, align: "right", sum: true },
    {
      header: t("referralLetter.remainingCount"),
      key: "remaining",
      width: 11,
      align: "right",
      sum: true,
      headerColor: TEAL,
    },
    { header: t("columns.date"), key: "date", width: 12, align: "center" },
    { header: t("columns.note"), key: "note", width: 24, align: "left" },
  ];
  const col = Object.fromEntries(columns.map((c, idx) => [c.key, START_COL + idx]));
  const endCol = START_COL + columns.length - 1;
  const sheet = createSheet(workbook, t("referralLetter.export.sheetStocks"));

  writeBanner(sheet, endCol, t("referralLetter.export.reportTitle"), asOf);
  writeHeader(sheet, columns);

  const rowValues = batches.map((batch, offset) => ({
    index: batch.stock.index_number ?? offset + 1,
    name: batch.stock.name ? String(batch.stock.name).trim() : "",
    range: batch.range ? formatRun(batch.range.start, batch.range.end) : "",
    total: batch.total,
    sold: batch.counts[LETTER_STATUS.SOLD],
    damaged: batch.counts[LETTER_STATUS.DAMAGED],
    lost: batch.counts[LETTER_STATUS.LOST],
    referral: batch.counts[REFERRAL],
    used: batch.used,
    remaining: batch.remaining,
    date: formatExcelDate(batch.stock.createdAt),
    note: batch.stock.note ? String(batch.stock.note).trim() : "",
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
      cell.value = values[c.key];
      cell.font = font();
      cell.fill = solid(bg);
      cell.alignment = { vertical: "middle", horizontal: c.align, wrapText: c.key === "note" };
      cell.border = frameBorder(colNumber, endCol);
      if (c.sum) cell.numFmt = COUNT_FMT;
      trackLength(maxLens, idx, values[c.key]);
    });
    row.getCell(col.name).font = font({ bold: true });
    row.getCell(col.used).font = font({ bold: true });
    // Letters left are the number to act on; a used-up batch is greyed out.
    row.getCell(col.remaining).font = font({
      bold: true,
      color: { argb: values.remaining > 0 ? TEAL : GREY_TEXT },
    });
    if (values.lost > 0) row.getCell(col.lost).font = font({ bold: true, color: { argb: RED } });
  });

  sheet.autoFilter = {
    from: { row: START_ROW, column: START_COL },
    to: { row: lastDataRow, column: endCol },
  };

  writeTotalRow(sheet, columns, firstDataRow, lastDataRow, rowValues, t("referralLetter.export.total"));
  fitColumns(sheet, columns, maxLens);
};

/**
 * Every batch walked from its first number to its last as one flat table: each row is a run of
 * numbers with what happened to it, unused runs included. The batch column lets the AutoFilter
 * narrow it to one batch.
 */
const writeDetailsSheet = (workbook, batches, t, asOf) => {
  const columns = [
    { header: "T/B", key: "index", width: 6, align: "center" },
    { header: t("referralLetter.export.batch"), key: "batch", width: 22, align: "left" },
    { header: t("referralLetter.letterNo"), key: "numbers", width: 16, align: "center" },
    { header: t("referralLetter.quantity"), key: "count", width: 10, align: "right", sum: true },
    { header: t("columns.status"), key: "status", width: 16, align: "center" },
    { header: t("columns.date"), key: "date", width: 12, align: "center" },
    { header: t("referralLetter.submittedBy"), key: "submittedBy", width: 22, align: "left" },
    { header: t("referralLetter.receivedBy"), key: "receivedBy", width: 18, align: "left" },
    { header: t("columns.note"), key: "note", width: 30, align: "left" },
  ];
  const col = Object.fromEntries(columns.map((c, idx) => [c.key, START_COL + idx]));
  const endCol = START_COL + columns.length - 1;
  const sheet = createSheet(workbook, t("referralLetter.export.sheetLetters"));
  const statusLabel = getStatusLabels(t);

  writeBanner(sheet, endCol, t("referralLetter.export.reportTitle"), asOf);
  writeHeader(sheet, columns);

  const rows = batches.flatMap(({ stock, range, runs }) => {
    const name = stock.name ? String(stock.name).trim() : "";
    const batch = range ? `${name} (${formatRun(range.start, range.end)})`.trim() : name;
    return runs.map((run) => ({ batch, run }));
  });

  const firstDataRow = START_ROW + 1;
  const lastDataRow = START_ROW + rows.length;
  const maxLens = columns.map((c) => String(c.header).length);

  const rowValues = rows.map(({ batch, run }, offset) => {
    const { letter } = run;
    const note = !letter
      ? ""
      : letter.isRefferal
        ? [letter.destination_country, formatExcelDate(letter.departure_date)].filter(Boolean).join(" • ")
        : letter.note || "";
    return {
      index: offset + 1,
      batch,
      numbers: formatRun(run.from, run.to, letter?.travel_document_number),
      // A run starting inside numbers an earlier entry covers only adds the new ones, so the
      // total equals the batch sizes.
      count: run.added,
      status: statusLabel[run.status] || String(letter?.status ?? ""),
      date: letter ? formatExcelDate(letter.isRefferal ? letter.createdAt : letter.date_time) : "",
      submittedBy: letter?.refferaloperator?.fullName || "",
      receivedBy: letter?.accepted_by || "",
      note: String(note).trim(),
    };
  });

  rowValues.forEach((values, offset) => {
    const { run } = rows[offset];
    const row = sheet.getRow(firstDataRow + offset);
    row.height = 20;
    const bg = offset % 2 === 1 ? ZEBRA : "FFFFFFFF";
    columns.forEach((c, idx) => {
      const colNumber = START_COL + idx;
      const cell = row.getCell(colNumber);
      cell.value = values[c.key];
      cell.font = font();
      cell.fill = solid(bg);
      cell.alignment = { vertical: "middle", horizontal: c.align, wrapText: c.key === "note" };
      cell.border = frameBorder(colNumber, endCol);
      if (c.sum) cell.numFmt = COUNT_FMT;
      trackLength(maxLens, idx, values[c.key]);
    });

    row.getCell(col.numbers).font = font({ bold: true });
    const style = STATUS_STYLE[run.status];
    const statusCell = row.getCell(col.status);
    statusCell.fill = solid(style.bg);
    statusCell.font = font({ bold: true, color: { argb: style.fg } });

    // Explain anything unusual on the numbers cell itself.
    const notes = [];
    if (run.overhangs) {
      const full = getLetterRange(run.letter);
      notes.push(
        `${t("referralLetter.export.outsideStock")}: ${formatRun(full.start, full.end, run.letter.travel_document_number)}`,
      );
    }
    if (run.overlaps) notes.push(t("referralLetter.export.duplicate"));
    if (notes.length) {
      const numbersCell = row.getCell(col.numbers);
      numbersCell.note = notes.join("\n");
      numbersCell.font = font({ bold: true, color: { argb: run.overlaps ? RED : "FFB45309" } });
    }
  });

  sheet.autoFilter = {
    from: { row: START_ROW, column: START_COL },
    to: { row: lastDataRow, column: endCol },
  };

  writeTotalRow(sheet, columns, firstDataRow, lastDataRow, rowValues, t("referralLetter.export.total"));
  fitColumns(sheet, columns, maxLens);
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
        start_number: Math.min(...ranges.map((r) => r.start)),
        end_number: Math.max(...ranges.map((r) => r.end)),
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
    (a, b) => Number(a.start_yh_number) - Number(b.start_yh_number) || Number(a.index_number) - Number(b.index_number),
  );
  const batches = buildBatches(sortedStocks, Array.isArray(letters) ? letters : []);
  const asOf = t("referralLetter.export.asOf", { date: dayjs().format("DD.MM.YYYY") });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();
  writeSummarySheet(workbook, batches, t, asOf);
  writeDetailsSheet(workbook, batches, t, asOf);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${t("referralLetter.export.fileName")}_${dayjs().format("YYYY-MM-DD")}.xlsx`);

  onProgress?.({ message: t("referralLetter.export.success"), percent: 100 });
  return batches.length;
};

export default exportLetterStockExcel;
