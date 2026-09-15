import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { formatDate } from "../../../functions/generalHelpers";


const formatTime = (val) => {
  if (!val) return "";
  const str = String(val).trim();
  const parts = str.split(":");
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    return `${hours}:${minutes}`;
  }
  return str.slice(0, 5);
};

const extractText = (val) => {
  if (!val) return "";
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parsed.tk || parsed.ru || parsed.en || Object.values(parsed)[0] || "";
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof val === "object") {
    return val.tk || val.ru || val.en || val.shortName || val.fullName || val.name || "";
  }
  return String(val);
};


const resolveOrigin = (row) => {
  const originVal =
    row.operator?.office?.shortName ||
    row.client?.office?.shortName ||
    row.office?.shortName ||
    row.operator?.office?.fullName ||
    row.client?.office?.fullName ||
    row.office?.fullName ||
    "OGUZABAT";

  const resolved = extractText(originVal);
  return resolved ? String(resolved).toUpperCase() : "OGUZABAT";
};

const TRANSLATION_STATUS_EXCEL_CONFIG = {
  TRUE: {
    label: "Gyssagly",
    dotColor: "FFE11D48",    // #e11d48 (Rose)
    textColor: "FF9F1239",   // #9f1239 (Deep rose)
    bgColor: "FFFFE4E6",     // #ffe4e6 (Soft rose tint)
    borderColor: "FFFECDD3", // #fecdd3
  },
  FALSE: {
    label: "Adaty",
    dotColor: "FF0284C7",    // #0284c7 (Sky blue)
    textColor: "FF0369A1",   // #0369a1 (Deep sky)
    bgColor: "FFE0F2FE",     // #e0f2fe (Soft sky tint)
    borderColor: "FFBAE6FD", // #bae6fd
  },
  "0": {
    label: "Gaýtaryldy",
    dotColor: "FFEA580C",    // #ea580c (Orange)
    textColor: "FFC2410C",   // #c2410c (Deep orange)
    bgColor: "FFFFEDD5",     // #ffedd5 (Soft orange tint)
    borderColor: "FFFED7AA", // #fed7aa
  },
};

const resolveStatusInfo = (statusVal) => {
  if (statusVal === "true" || statusVal === true) {
    return TRANSLATION_STATUS_EXCEL_CONFIG.TRUE;
  }
  if (statusVal === "0" || statusVal === 0) {
    return TRANSLATION_STATUS_EXCEL_CONFIG["0"];
  }
  return TRANSLATION_STATUS_EXCEL_CONFIG.FALSE;
};

const resolveStatus = (row) => resolveStatusInfo(row?.status).label;

const resolvePercent = (row) => {
  const raw = row?.paidPercentage ?? row?.payment_percent ?? row?.paymentPercentage;
  if (raw !== undefined && raw !== null && raw !== "") {
    const str = String(raw).trim();
    if (str.endsWith("%")) return str;
    const num = parseFloat(str);
    if (!isNaN(num)) return `${num.toFixed(0)}%`;
  }
  const isPaid =
    row?.is_paid === true ||
    row?.is_paid === "true" ||
    row?.is_paid === 1 ||
    row?.is_paid === "1" ||
    String(row?.is_paid).toUpperCase() === "TOLENDI";
  return isPaid ? "100%" : "0%";
};

const resolveIsPaid = (row) => {
  const val = row?.is_paid;
  if (
    val === true ||
    val === "true" ||
    val === 1 ||
    val === "1" ||
    String(val).toUpperCase() === "TOLENDI"
  ) {
    return "Tölendi";
  }
  return "Kredit";
};


const getColLetter = (colIndex) => {
  let temp;
  let letter = "";
  while (colIndex > 0) {
    temp = (colIndex - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colIndex = Math.floor((colIndex - temp - 1) / 26);
  }
  return letter;
};

export const exportTranslateExcel = async (translations = [], options = {}) => {
  const fileName = options.fileName || "Terjime_Hasabaty";
  const sheetName = options.sheetName || "Terjime";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName.substring(0, 31), {
    views: [{ showGridLines: true }],
  });

  const START_ROW = 4;
  const START_COL = 4;

  worksheet.getColumn(1).width = 4;
  worksheet.getColumn(2).width = 4;
  worksheet.getColumn(3).width = 4;

  worksheet.getRow(1).height = 15;
  worksheet.getRow(2).height = 15;
  worksheet.getRow(3).height = 15;

  const columnsConfig = [
    { header: "TERJIMAN\nGELEN GÜNI", key: "received_day", width: 16, align: "center" },
    { header: "TERJIMÄ\nBERLEN WAGTY", key: "received_time", width: 14, align: "center" },
    { header: "NIREDEN\nGELENI", key: "nireden_geleni", width: 18, align: "left" },
    { header: "OPERATOR", key: "operator", width: 26, align: "left" },
    { header: "SAHYPA\nSANY", key: "page_count", width: 13, align: "center" },
    { header: "RAÝATYŇ\nADY", key: "client_name", width: 24, align: "left" },
    { header: "HAÝSY DILDEN\nHAÝSY DILE", key: "direction", width: 18, align: "center" },
    { header: "TERJIMEDEN\nGELEN WAGTY", key: "completed_time", width: 16, align: "center" },
    { header: "STATUS", key: "status", width: 16, align: "center" },
    { header: "TERJIMEDEN GELEN\nSAHYPA SANY", key: "completed_page_count", width: 18, align: "center" },
    { header: "TERJIME EDILIP\nGELEN GÜNI", key: "completed_day", width: 17, align: "center" },
    { header: "TERJIME\nEDEN", key: "translator", width: 26, align: "left" },
    { header: "DÜZEDILEN\nTERJIME", key: "correction_status", width: 16, align: "center" },
    { header: "TÖLENEN\nPUL", key: "price", width: 16, align: "right" },
    { header: "ÇYKDAJY", key: "expense_price", width: 16, align: "right" },
    { header: "PEÝDA", key: "profit", width: 16, align: "right" },
    { header: "TÖLEG\nÝAGDAÝY", key: "is_paid", width: 15, align: "center" },
    { header: "TÖLEG\nGÖTERIMI", key: "paid_percentage", width: 15, align: "center" },
  ];

  const statusColIdx = columnsConfig.findIndex((c) => c.key === "status");
  const pageCountColIdx = columnsConfig.findIndex((c) => c.key === "page_count");
  const completedPageColIdx = columnsConfig.findIndex((c) => c.key === "completed_page_count");
  const priceColIdx = columnsConfig.findIndex((c) => c.key === "price");
  const expensePriceColIdx = columnsConfig.findIndex((c) => c.key === "expense_price");
  const profitColIdx = columnsConfig.findIndex((c) => c.key === "profit");
  const isPaidColIdx = columnsConfig.findIndex((c) => c.key === "is_paid");
  const pctColIdx = columnsConfig.findIndex((c) => c.key === "paid_percentage");

  columnsConfig.forEach((col, idx) => {
    worksheet.getColumn(START_COL + idx).width = col.width;
  });

  const END_COL = START_COL + columnsConfig.length - 1;
  const lastDataRow = START_ROW + translations.length;
  // One blank row between data and total keeps the total row outside Excel's
  // AutoFilter list range, so filtering the data doesn't hide the total too.
  const totalRowIndex = lastDataRow + 2;

  const headerRow = worksheet.getRow(START_ROW);
  headerRow.height = 56;

  const headerFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF66A64F" },
  };

  columnsConfig.forEach((col, idx) => {
    const colNumber = START_COL + idx;
    const cell = headerRow.getCell(colNumber);
    cell.value = col.header;
    cell.font = { name: "Calibri", size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = headerFill;
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    cell.border = {
      top: { style: "medium", color: { argb: "FF386624" } },
      bottom: { style: "thin", color: { argb: "FF5E9C47" } },
      left: colNumber === START_COL
        ? { style: "medium", color: { argb: "FF386624" } }
        : { style: "thin", color: { argb: "FF5E9C47" } },
      right: colNumber === END_COL
        ? { style: "medium", color: { argb: "FF386624" } }
        : { style: "thin", color: { argb: "FF5E9C47" } },
    };
  });

  worksheet.autoFilter = {
    from: { row: START_ROW, column: START_COL },
    to: { row: lastDataRow, column: END_COL },
  };

  let sumPrice = 0;
  let sumExpense = 0;
  let sumProfit = 0;
  let sumPages = 0;
  let sumCompletedPages = 0;

  translations.forEach((row, offset) => {
    const rowIndex = START_ROW + 1 + offset;
    const currentRow = worksheet.getRow(rowIndex);
    currentRow.height = 21;

    const pageCount = Number(row.page_count || 0);
    const completedPageCount =
      row.completed_page_count != null && row.completed_page_count !== ""
        ? Number(row.completed_page_count)
        : null;
    const price = Number(row.price || 0);
    const expensePrice = Number(row.expense_price ?? row.expense ?? 0);
    const profit =
      row.profit !== undefined && row.profit !== null && row.profit !== ""
        ? Number(row.profit)
        : price - expensePrice;

    sumPages += pageCount;
    if (completedPageCount !== null) sumCompletedPages += completedPageCount;
    sumPrice += price;
    sumExpense += expensePrice;
    sumProfit += profit;

    const isPaidLabel = resolveIsPaid(row);
    const pctValue = resolvePercent(row);

    const rowData = [
      formatDate(row.received_day),
      formatTime(row.received_time),
      resolveOrigin(row),
      row.operator?.fullName ? String(extractText(row.operator.fullName)).toUpperCase() : "",
      pageCount,
      row.client?.fullName ? String(extractText(row.client.fullName)).toUpperCase() : "",
      row.source_to_target ? String(row.source_to_target).toUpperCase() : "",
      formatTime(row.completed_time),
      resolveStatus(row),
      completedPageCount !== null ? completedPageCount : "",
      formatDate(row.completed_day),
      row.translator?.fullName ? String(extractText(row.translator.fullName)).toUpperCase() : "",
      row.correction_status ? String(row.correction_status).toUpperCase() : "DOGRY",
      price,
      expensePrice,
      profit,
      isPaidLabel,
      pctValue,
    ];

    rowData.forEach((val, idx) => {
      const colNumber = START_COL + idx;
      const cell = currentRow.getCell(colNumber);
      cell.value = val;
      cell.font = { name: "Calibri", size: 10 };
      cell.alignment = {
        vertical: "middle",
        horizontal: columnsConfig[idx].align,
      };

      cell.border = {
        top: { style: "thin", color: { argb: "FFD9D9D9" } },
        bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
        left: colNumber === START_COL
          ? { style: "medium", color: { argb: "FF000000" } }
          : { style: "thin", color: { argb: "FFD9D9D9" } },
        right: colNumber === END_COL
          ? { style: "medium", color: { argb: "FF000000" } }
          : { style: "thin", color: { argb: "FFD9D9D9" } },
      };

      // Professional status styling: colored dot indicator & soft badge
      if (idx === statusColIdx) {
        const statusInfo = resolveStatusInfo(row.status);
        cell.value = {
          richText: [
            {
              text: "● ",
              font: {
                name: "Calibri",
                size: 9,
                bold: true,
                color: { argb: statusInfo.dotColor },
              },
            },
            {
              text: statusInfo.label,
              font: {
                name: "Calibri",
                size: 9.5,
                bold: true,
                color: { argb: statusInfo.textColor },
              },
            },
          ],
        };

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: statusInfo.bgColor },
        };

        cell.border = {
          top: { style: "thin", color: { argb: statusInfo.borderColor } },
          bottom: { style: "thin", color: { argb: statusInfo.borderColor } },
          left: colNumber === START_COL
            ? { style: "medium", color: { argb: "FF000000" } }
            : { style: "thin", color: { argb: statusInfo.borderColor } },
          right: colNumber === END_COL
            ? { style: "medium", color: { argb: "FF000000" } }
            : { style: "thin", color: { argb: statusInfo.borderColor } },
        };
      }

      // Professional is_paid badge styling with dot
      if (idx === isPaidColIdx) {
        const isPaidInfo = isPaidLabel === "Tölendi"
          ? {
              dotColor: "FF16A34A",
              textColor: "FF15803D",
              bgColor: "FFF0FDF4",
              borderColor: "FFBBF7D0",
            }
          : {
              dotColor: "FFD97706",
              textColor: "FFB45309",
              bgColor: "FFFFFBEB",
              borderColor: "FFFDE68A",
            };

        cell.value = {
          richText: [
            {
              text: "● ",
              font: {
                name: "Calibri",
                size: 9,
                bold: true,
                color: { argb: isPaidInfo.dotColor },
              },
            },
            {
              text: isPaidLabel,
              font: {
                name: "Calibri",
                size: 9.5,
                bold: true,
                color: { argb: isPaidInfo.textColor },
              },
            },
          ],
        };

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: isPaidInfo.bgColor },
        };

        cell.border = {
          top: { style: "thin", color: { argb: isPaidInfo.borderColor } },
          bottom: { style: "thin", color: { argb: isPaidInfo.borderColor } },
          left: colNumber === START_COL
            ? { style: "medium", color: { argb: "FF000000" } }
            : { style: "thin", color: { argb: isPaidInfo.borderColor } },
          right: colNumber === END_COL
            ? { style: "medium", color: { argb: "FF000000" } }
            : { style: "thin", color: { argb: isPaidInfo.borderColor } },
        };
      }

      // Professional percentage styling
      if (idx === pctColIdx) {
        const num = parseFloat(pctValue);
        let fgColor = "FFDC2626";
        let bgColor = "FFFEE2E2";
        let borderColor = "FFFECACA";
        if (num >= 100) {
          fgColor = "FF15803D";
          bgColor = "FFF0FDF4";
          borderColor = "FFBBF7D0";
        } else if (num > 0) {
          fgColor = "FFB45309";
          bgColor = "FFFFFBEB";
          borderColor = "FFFDE68A";
        }

        cell.font = { name: "Calibri", size: 9.5, bold: true, color: { argb: fgColor } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bgColor },
        };
        cell.border = {
          top: { style: "thin", color: { argb: borderColor } },
          bottom: { style: "thin", color: { argb: borderColor } },
          left: colNumber === START_COL
            ? { style: "medium", color: { argb: "FF000000" } }
            : { style: "thin", color: { argb: borderColor } },
          right: colNumber === END_COL
            ? { style: "medium", color: { argb: "FF000000" } }
            : { style: "thin", color: { argb: borderColor } },
        };
      }

      if (idx === priceColIdx && typeof val === "number") {
        cell.numFmt = "#,##0.00";
      }

      if (idx === expensePriceColIdx && typeof val === "number") {
        cell.numFmt = "#,##0.00";
      }

      if (idx === profitColIdx && typeof val === "number") {
        cell.numFmt = "#,##0.00";
        cell.font = {
          name: "Calibri",
          size: 10,
          bold: true,
          color: { argb: val >= 0 ? "FF15803D" : "FFDC2626" },
        };
      }
    });
  });

  const totalRow = worksheet.getRow(totalRowIndex);
  totalRow.height = 24;

  for (let c = START_COL; c <= END_COL; c++) {
    const cell = totalRow.getCell(c);
    cell.font = { name: "Calibri", size: 10, bold: true };
    cell.alignment = { vertical: "middle", horizontal: columnsConfig[c - START_COL].align };

    cell.border = {
      top: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
      left: c === START_COL
        ? { style: "medium", color: { argb: "FF000000" } }
        : { style: "thin", color: { argb: "FFD9D9D9" } },
      right: c === END_COL
        ? { style: "medium", color: { argb: "FF000000" } }
        : { style: "thin", color: { argb: "FFD9D9D9" } },
    };
  }

  const cellTotalLabel = totalRow.getCell(START_COL);
  cellTotalLabel.value = "Total";
  cellTotalLabel.alignment = { vertical: "middle", horizontal: "left" };

  const firstDataRow = START_ROW + 1;

  if (translations.length > 0) {
    if (pageCountColIdx !== -1) {
      const colNum = START_COL + pageCountColIdx;
      const letter = getColLetter(colNum);
      const cell = totalRow.getCell(colNum);
      cell.value = {
        formula: `SUBTOTAL(109,${letter}${firstDataRow}:${letter}${lastDataRow})`,
        result: sumPages,
      };
      cell.numFmt = "#,##0";
    }

    if (completedPageColIdx !== -1) {
      const colNum = START_COL + completedPageColIdx;
      const letter = getColLetter(colNum);
      const cell = totalRow.getCell(colNum);
      cell.value = {
        formula: `SUBTOTAL(109,${letter}${firstDataRow}:${letter}${lastDataRow})`,
        result: sumCompletedPages,
      };
      cell.numFmt = "#,##0";
    }

    if (priceColIdx !== -1) {
      const colNum = START_COL + priceColIdx;
      const letter = getColLetter(colNum);
      const cell = totalRow.getCell(colNum);
      cell.value = {
        formula: `SUBTOTAL(109,${letter}${firstDataRow}:${letter}${lastDataRow})`,
        result: sumPrice,
      };
      cell.numFmt = "#,##0.00";
    }

    if (expensePriceColIdx !== -1) {
      const colNum = START_COL + expensePriceColIdx;
      const letter = getColLetter(colNum);
      const cell = totalRow.getCell(colNum);
      cell.value = {
        formula: `SUBTOTAL(109,${letter}${firstDataRow}:${letter}${lastDataRow})`,
        result: sumExpense,
      };
      cell.numFmt = "#,##0.00";
    }

    if (profitColIdx !== -1) {
      const colNum = START_COL + profitColIdx;
      const letter = getColLetter(colNum);
      const cell = totalRow.getCell(colNum);
      cell.value = {
        formula: `SUBTOTAL(109,${letter}${firstDataRow}:${letter}${lastDataRow})`,
        result: sumProfit,
      };
      cell.numFmt = "#,##0.00";
      cell.font = {
        name: "Calibri",
        size: 10,
        bold: true,
        color: { argb: sumProfit >= 0 ? "FF15803D" : "FFDC2626" },
      };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const cleanFileName = `${fileName}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, cleanFileName);
};
