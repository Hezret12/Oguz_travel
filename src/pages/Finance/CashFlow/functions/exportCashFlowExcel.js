import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { fetchAllPaginatedData } from "../../../../functions/excelExportHelper";
import { isCashRow } from "./cashFlowHelpers";

const ACCENT_RED = "FFDC2626";
const AMOUNT_FMT = '#,##0.00;-#,##0.00;"-"';
const CURRENCY_ORDER = ["TMT", "USD"];

const KIND_STYLE = {
  income: { bg: "FFDCFCE7", fg: "FF166534", border: "FF86EFAC" },
  expense: { bg: "FFFEF2F2", fg: ACCENT_RED, border: "FFFECACA" },
  project: { bg: "FFDBEAFE", fg: "FF1D4ED8", border: "FF93C5FD" },
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
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

// Same split as the table: cash income → income, cash expense → expense,
// project row → sale as income and cost as expense.
const splitAmounts = (row) => {
  if (!isCashRow(row)) {
    return { kind: "project", income: toNumber(row.sale_price), expense: toNumber(row.net_price) };
  }
  return row.type === "INCOME"
    ? { kind: "income", income: toNumber(row.sale_price), expense: 0 }
    : { kind: "expense", income: 0, expense: toNumber(row.net_price) };
};

export const exportCashFlowExcel = async ({ apiFn, params = {}, onProgress = null, t, selectedLang }) => {
  const cleanParams = {};
  Object.entries(params).forEach(([k, v]) => {
    if (!["page", "limit", "pageSize"].includes(k) && v !== undefined && v !== null && v !== "") {
      cleanParams[k] = v;
    }
  });

  onProgress?.({ message: t("finance.cashBook.export.fetching"), percent: 5 });

  const items = await fetchAllPaginatedData(
    apiFn,
    cleanParams,
    (loaded, total) =>
      onProgress?.({
        message: `${t("finance.cashBook.export.fetching")} ${loaded} / ${total}`,
        percent: total > 0 ? 5 + Math.round((loaded / total) * 80) : 40,
      }),
    100,
  );

  if (!items?.length) throw new Error(t("common.exportExcelNoData"));

  onProgress?.({ message: t("finance.cashBook.export.generating"), percent: 90 });

  const langText = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return selectedLang?.(val) || val.tk || val.ru || val.en || "";
  };

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(t("sidebar.cashFlow").substring(0, 31), {
    views: [{ showGridLines: true }],
  });

  const START_ROW = 4;
  const START_COL = 4; // Column D
  [1, 2, 3].forEach((c) => {
    worksheet.getColumn(c).width = 4;
  });

  const columnsConfig = [
    { header: "T/B", key: "index", width: 6, align: "center" },
    { header: t("finance.cashBook.date"), key: "date", width: 12, align: "center" },
    { header: t("finance.cashBook.export.time"), key: "time", width: 8, align: "center" },
    { header: t("finance.cashBook.direction"), key: "kind", width: 12, align: "center" },
    { header: t("category"), key: "category", width: 16, align: "left" },
    { header: t("finance.cashBook.description"), key: "description", width: 34, align: "left" },
    { header: t("finance.cashBook.giver"), key: "giver", width: 18, align: "left" },
    { header: t("finance.cashBook.receiver"), key: "receiver", width: 18, align: "left" },
    { header: t("operator"), key: "operator", width: 18, align: "left" },
    { header: t("finance.cashBook.officeCompany"), key: "office", width: 16, align: "left" },
    { header: t("finance.income"), key: "income", width: 15, align: "right" },
    { header: t("finance.expense"), key: "expense", width: 15, align: "right" },
    { header: t("currency"), key: "currency", width: 9, align: "center" },
  ];

  const colIdx = (key) => columnsConfig.findIndex((c) => c.key === key);
  const incomeColIdx = colIdx("income");
  const expenseColIdx = colIdx("expense");
  const kindColIdx = colIdx("kind");
  const currencyColIdx = colIdx("currency");
  const END_COL = START_COL + columnsConfig.length - 1;

  // Row 2: title banner, report period in red
  let periodText = t("common.exportAllTime");
  if (cleanParams.date_from || cleanParams.date_to) {
    const s = cleanParams.date_from ? dayjs(cleanParams.date_from).format("DD.MM.YYYY") : "...";
    const e = cleanParams.date_to ? dayjs(cleanParams.date_to).format("DD.MM.YYYY") : "...";
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
        text: t("finance.cashBook.export.reportTitle"),
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
  // One blank row keeps the totals outside the AutoFilter range, so filtering
  // the data in Excel doesn't hide them.
  const totalRowIndex = lastDataRow + 2;

  // Header row
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

  const colMaxLens = columnsConfig.map((c) => String(c.header || "").length);
  const totalsByCurrency = {};
  const kindLabels = {
    income: t("finance.income"),
    expense: t("finance.expense"),
    project: t("finance.cashBook.projectSale"),
  };

  items.forEach((row, offset) => {
    const currentRow = worksheet.getRow(firstDataRow + offset);
    currentRow.height = 20;

    const { kind, income, expense } = splitAmounts(row);
    const currency = String(row.currency || "USD").toUpperCase();
    const dt = row.datetime && dayjs(row.datetime).isValid() ? dayjs(row.datetime) : null;

    totalsByCurrency[currency] ??= { income: 0, expense: 0 };
    totalsByCurrency[currency].income += income;
    totalsByCurrency[currency].expense += expense;

    const rowValues = {
      index: offset + 1,
      date: dt ? dt.format("DD.MM.YYYY") : "",
      time: dt ? dt.format("HH:mm") : "",
      kind: kindLabels[kind],
      category: langText(row.category?.name),
      description: row.description ? String(row.description).trim() : "",
      giver: row.giver || "",
      receiver: row.receiver || "",
      operator: row.receiver_operator?.fullName || "",
      office: langText(row.office?.shortName) || langText(row.office?.fullName) || row.company || "",
      income,
      expense,
      currency,
    };

    const zebraBg = offset % 2 === 1 ? "FFF3F4F6" : "FFFFFFFF";

    columnsConfig.forEach((col, idx) => {
      const colNumber = START_COL + idx;
      const cell = currentRow.getCell(colNumber);
      const val = rowValues[col.key] ?? "";

      cell.value = val;
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF000000" } };
      cell.alignment = { vertical: "middle", horizontal: col.align };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: zebraBg } };
      cell.border = outerBorder(colNumber, START_COL, END_COL);

      if (val !== "") {
        const len = String(val).length;
        if (len > colMaxLens[idx]) colMaxLens[idx] = len;
        if (len > 40) cell.alignment.wrapText = true;
      }

      if (idx === kindColIdx) {
        const style = KIND_STYLE[kind];
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: style.bg } };
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: style.fg } };
        cell.border = outerBorder(colNumber, START_COL, END_COL, style.border);
      }
      if (idx === incomeColIdx || idx === expenseColIdx) cell.numFmt = AMOUNT_FMT;
      if (idx === expenseColIdx) {
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: ACCENT_RED } };
      }
    });
  });

  // One total row per currency — TMT and USD are never summed together
  const rank = (c) => (CURRENCY_ORDER.indexOf(c) + 1 || 99);
  const currencies = Object.keys(totalsByCurrency).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  const incomeLetter = getExcelColName(START_COL + incomeColIdx);
  const expenseLetter = getExcelColName(START_COL + expenseColIdx);
  const currencyLetter = getExcelColName(START_COL + currencyColIdx);
  const range = (letter) => `${letter}${firstDataRow}:${letter}${lastDataRow}`;
  const sumFormula = (letter, cur) => `SUMIFS(${range(letter)},${range(currencyLetter)},"${cur}")`;

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
    labelCell.value = t("finance.cashBook.export.total");
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

  columnsConfig.forEach((col, idx) => {
    worksheet.getColumn(START_COL + idx).width = Math.min(Math.max(col.width, colMaxLens[idx] + 3), 48);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${t("finance.cashBook.export.fileName")}_${dayjs().format("YYYY-MM-DD")}.xlsx`);

  onProgress?.({ message: t("finance.cashBook.export.success"), percent: 100 });
  return items.length;
};

export default exportCashFlowExcel;
