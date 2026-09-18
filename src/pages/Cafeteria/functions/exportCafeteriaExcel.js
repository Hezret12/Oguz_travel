import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { fetchAllPaginatedData, formatExcelDate } from "../../../functions/excelExportHelper";
import { getAllCafeteriaTransactionsApi } from "../../../api/queries/getters";

const ACCENT_RED = "FFDC2626";
const AMOUNT_FMT = '#,##0.00;-#,##0.00;"-"';

const TYPE_STYLE = {
  income: { bg: "FFDCFCE7", fg: "FF166534", border: "FF86EFAC" },
  expense: { bg: "FFFEF2F2", fg: ACCENT_RED, border: "FFFECACA" },
};

const toSafeNumber = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v).replace(/,/g, ".").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const isIncomeType = (v) => {
  const s = String(v ?? "").toUpperCase();
  return s === "TRUE" || s === "1" || s === "INCOME";
};

// `date` is stored as YYYY-MM-DD, so the hour comes from when the record was created.
const resolveTime = (row) => {
  const createdAt = row?.createdAt || row?.created_at;
  if (createdAt && dayjs(createdAt).isValid()) return dayjs(createdAt).format("HH:mm");
  if (typeof row?.date === "string" && row.date.includes("T") && dayjs(row.date).isValid()) {
    return dayjs(row.date).format("HH:mm");
  }
  return "";
};

const getExcelColName = (colNum) => {
  let colName = "";
  let num = colNum;
  while (num > 0) {
    const mod = (num - 1) % 26;
    colName = String.fromCharCode(65 + mod) + colName;
    num = Math.floor((num - 1) / 26);
  }
  return colName;
};

const resolveOffice = (row, selectedLang) => {
  const shortName = row?.createdBy?.office?.shortName;
  if (!shortName) return "";
  if (typeof shortName === "string") return shortName.trim().toUpperCase();
  const val = selectedLang?.(shortName) || shortName.tk || shortName.ru || shortName.en || "";
  return String(val).trim().toUpperCase();
};

const outerBorder = (colNumber, startCol, endCol, color = "FFD9D9D9") => ({
  top: { style: "thin", color: { argb: color } },
  bottom: { style: "thin", color: { argb: color } },
  left:
    colNumber === startCol
      ? { style: "medium", color: { argb: "FF000000" } }
      : { style: "thin", color: { argb: color } },
  right:
    colNumber === endCol
      ? { style: "medium", color: { argb: "FF000000" } }
      : { style: "thin", color: { argb: color } },
});

export const exportCafeteriaExcel = async ({ params = {}, onProgress = null, t, selectedLang }) => {
  const cleanParams = {};
  Object.entries(params).forEach(([k, v]) => {
    if (!["page", "limit", "pageSize"].includes(k) && v !== undefined && v !== null && v !== "") {
      cleanParams[k] = v;
    }
  });

  onProgress?.({ message: t("cafeteria.export.fetching"), percent: 5 });

  const items = await fetchAllPaginatedData(
    getAllCafeteriaTransactionsApi,
    cleanParams,
    (loaded, total) =>
      onProgress?.({
        message: `${t("cafeteria.export.fetching")} ${loaded} / ${total}`,
        percent: total > 0 ? 5 + Math.round((loaded / total) * 80) : 40,
      }),
    100
  );

  if (!items?.length) throw new Error(t("cafeteria.export.noData"));

  onProgress?.({ message: t("cafeteria.export.generating"), percent: 90 });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(t("cafeteria.title").substring(0, 31), {
    views: [{ showGridLines: true }],
  });

  const START_ROW = 4;
  const START_COL = 4; // Column D

  worksheet.getColumn(1).width = 4;
  worksheet.getColumn(2).width = 4;
  worksheet.getColumn(3).width = 4;

  const columnsConfig = [
    { header: "T/B", key: "index_number", width: 6, align: "center" },
    { header: t("cafeteria.export.colDate"), key: "date", width: 13, align: "center" },
    { header: t("cafeteria.export.colTime"), key: "time", width: 9, align: "center" },
    { header: t("cafeteria.export.colType"), key: "type", width: 13, align: "center" },
    { header: t("cafeteria.export.colDescription"), key: "description", width: 34, align: "left" },
    { header: t("cafeteria.export.colIncome"), key: "income", width: 16, align: "right" },
    { header: t("cafeteria.export.colExpense"), key: "expense", width: 16, align: "right" },
    { header: t("cafeteria.export.colCurrency"), key: "currency", width: 10, align: "center" },
    { header: t("cafeteria.export.colEmployee"), key: "employee", width: 24, align: "left" },
    { header: t("cafeteria.export.colOffice"), key: "office", width: 12, align: "center" },
  ];

  const incomeColIdx = columnsConfig.findIndex((c) => c.key === "income");
  const expenseColIdx = columnsConfig.findIndex((c) => c.key === "expense");
  const typeColIdx = columnsConfig.findIndex((c) => c.key === "type");
  const currencyColIdx = columnsConfig.findIndex((c) => c.key === "currency");

  const END_COL = START_COL + columnsConfig.length - 1;

  // Row 2: title banner across the table, report period in red
  let periodText = t("cafeteria.export.allTime");
  if (cleanParams.start_date || cleanParams.end_date) {
    const s = cleanParams.start_date ? dayjs(cleanParams.start_date).format("DD.MM.YYYY") : "...";
    const e = cleanParams.end_date ? dayjs(cleanParams.end_date).format("DD.MM.YYYY") : "...";
    periodText = `${s} - ${e}`;
  }

  worksheet.getRow(1).height = 12;
  worksheet.getRow(2).height = 30;
  worksheet.getRow(3).height = 10;
  worksheet.mergeCells(2, START_COL, 2, END_COL);
  const titleCell = worksheet.getCell(2, START_COL);
  titleCell.value = {
    richText: [
      {
        text: 'OGUZABAT Hojalyk Jemgyýetiniň "OGUZTRAVEL" syýahatçylyk bölümi | ',
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FF000000" } },
      },
      {
        text: t("cafeteria.export.reportTitle"),
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FF0E8584" } },
      },
      {
        text: ` (${periodText})`,
        font: { name: "Calibri", size: 11, bold: true, color: { argb: ACCENT_RED } },
      },
    ],
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

  const firstDataRow = START_ROW + 1;
  const lastDataRow = START_ROW + items.length;
  // One blank row between data and total keeps the total row outside Excel's
  // AutoFilter list range, so filtering the data doesn't hide the total too.
  const totalRowIndex = lastDataRow + 2;

  // Header Row (Row 4)
  const headerRow = worksheet.getRow(START_ROW);
  headerRow.height = 30;
  columnsConfig.forEach((col, idx) => {
    const colNumber = START_COL + idx;
    const cell = headerRow.getCell(colNumber);
    cell.value = col.header;
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: idx === expenseColIdx ? ACCENT_RED : "FF000000" },
    };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "medium", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
      left:
        colNumber === START_COL
          ? { style: "medium", color: { argb: "FF000000" } }
          : { style: "thin", color: { argb: "FFBFBFBF" } },
      right:
        colNumber === END_COL
          ? { style: "medium", color: { argb: "FF000000" } }
          : { style: "thin", color: { argb: "FFBFBFBF" } },
    };
  });

  worksheet.autoFilter = {
    from: { row: START_ROW, column: START_COL },
    to: { row: lastDataRow, column: END_COL },
  };

  const colMaxLens = columnsConfig.map((c) => (c.header ? String(c.header).length : 10));
  const totalsByCurrency = {};

  // Data Rows (starting from Row 5)
  items.forEach((row, offset) => {
    const currentRow = worksheet.getRow(firstDataRow + offset);
    currentRow.height = 20;

    const isIncome = isIncomeType(row.type);
    const amount = Math.abs(toSafeNumber(row.amount));
    const currency = String(row.currency || "TMT").toUpperCase();

    totalsByCurrency[currency] ??= { income: 0, expense: 0 };
    if (isIncome) totalsByCurrency[currency].income += amount;
    else totalsByCurrency[currency].expense += amount;

    const rowValues = {
      index_number: row.index_number ?? offset + 1,
      date: formatExcelDate(row.date),
      time: resolveTime(row),
      type: isIncome ? t("cafeteria.types.income") : t("cafeteria.types.expense"),
      description: row.description ? String(row.description).trim() : "",
      income: isIncome ? amount : 0,
      expense: isIncome ? 0 : amount,
      currency,
      employee: row.createdBy?.fullName ? String(row.createdBy.fullName).toUpperCase() : "",
      office: resolveOffice(row, selectedLang),
    };

    const zebraBg = offset % 2 === 1 ? "FFE5E7EB" : "FFFFFFFF";

    columnsConfig.forEach((col, idx) => {
      const colNumber = START_COL + idx;
      const cell = currentRow.getCell(colNumber);
      const val = rowValues[col.key] ?? "";

      cell.value = val;
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF000000" } };
      cell.alignment = { vertical: "middle", horizontal: col.align };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: zebraBg } };
      cell.border = outerBorder(colNumber, START_COL, END_COL);

      if (val !== null && val !== undefined && val !== "") {
        const len = String(val).length;
        if (len > colMaxLens[idx]) colMaxLens[idx] = len;
        if (len > 40) cell.alignment.wrapText = true;
      }

      // Income / expense badge
      if (idx === typeColIdx) {
        const style = isIncome ? TYPE_STYLE.income : TYPE_STYLE.expense;
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: style.bg } };
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: style.fg } };
        cell.border = outerBorder(colNumber, START_COL, END_COL, style.border);
      }

      if (idx === incomeColIdx || idx === expenseColIdx) {
        cell.numFmt = AMOUNT_FMT;
      }
      if (idx === expenseColIdx) {
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: ACCENT_RED } };
      }
    });
  });

  // Total row(s) — one per currency so TMT and USD are never summed together
  const currencies = Object.keys(totalsByCurrency).sort((a, b) =>
    a === "TMT" ? -1 : b === "TMT" ? 1 : a.localeCompare(b)
  );
  const isMultiCurrency = currencies.length > 1;
  const incomeLetter = getExcelColName(START_COL + incomeColIdx);
  const expenseLetter = getExcelColName(START_COL + expenseColIdx);
  const currencyLetter = getExcelColName(START_COL + currencyColIdx);
  const range = (letter) => `${letter}${firstDataRow}:${letter}${lastDataRow}`;
  const sumFormula = (letter, cur) =>
    isMultiCurrency
      ? `SUMIFS(${range(letter)},${range(currencyLetter)},"${cur}")`
      : `SUBTOTAL(109,${range(letter)})`;

  currencies.forEach((cur, i) => {
    const totalRow = worksheet.getRow(totalRowIndex + i);
    totalRow.height = 24;
    const isLast = i === currencies.length - 1;

    for (let c = START_COL; c <= END_COL; c++) {
      const cell = totalRow.getCell(c);
      cell.font = { name: "Calibri", size: 10, bold: true };
      cell.alignment = { vertical: "middle", horizontal: columnsConfig[c - START_COL].align };
      cell.border = {
        top: { style: "thin", color: { argb: i === 0 ? "FF000000" : "FFD9D9D9" } },
        bottom: isLast
          ? { style: "medium", color: { argb: "FF000000" } }
          : { style: "thin", color: { argb: "FFD9D9D9" } },
        left:
          c === START_COL
            ? { style: "medium", color: { argb: "FF000000" } }
            : { style: "thin", color: { argb: "FFD9D9D9" } },
        right:
          c === END_COL
            ? { style: "medium", color: { argb: "FF000000" } }
            : { style: "thin", color: { argb: "FFD9D9D9" } },
      };
    }

    const labelCell = totalRow.getCell(START_COL);
    labelCell.value = t("cafeteria.export.total");
    labelCell.alignment = { vertical: "middle", horizontal: "left" };

    const incomeCell = totalRow.getCell(START_COL + incomeColIdx);
    incomeCell.value = { formula: sumFormula(incomeLetter, cur), result: totalsByCurrency[cur].income };
    incomeCell.numFmt = AMOUNT_FMT;
    incomeCell.font = { name: "Calibri", size: 10.5, bold: true };

    const expenseCell = totalRow.getCell(START_COL + expenseColIdx);
    expenseCell.value = { formula: sumFormula(expenseLetter, cur), result: totalsByCurrency[cur].expense };
    expenseCell.numFmt = AMOUNT_FMT;
    expenseCell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: ACCENT_RED } };

    totalRow.getCell(START_COL + currencyColIdx).value = cur;
  });

  // Auto-fitted column widths
  columnsConfig.forEach((col, idx) => {
    const baseWidth = col.width || 12;
    worksheet.getColumn(START_COL + idx).width = Math.min(Math.max(baseWidth, colMaxLens[idx] + 3), 48);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${t("cafeteria.export.fileName")}_${dayjs().format("YYYY-MM-DD")}.xlsx`);

  onProgress?.({ message: t("cafeteria.export.success"), percent: 100 });
  return items.length;
};

export default exportCafeteriaExcel;
