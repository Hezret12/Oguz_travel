import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

/**
 * Formats date into DD.MM.YYYY
 */
const formatDate = (val) => {
  if (!val) return "";
  const d = dayjs(val);
  return d.isValid() ? d.format("DD.MM.YYYY") : String(val);
};

/**
 * Formats time into H:mm (e.g. "8:34", "10:00")
 */
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

/**
 * Safely extracts localized or nested string from potential JSON or objects
 */
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

/**
 * Resolves source/origin office (NIREDEN GELENI) without raw JSON leaking
 */
const resolveOrigin = (row) => {
  const originVal =
    row.nireden_geleni ||
    row.source_origin ||
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

/**
 * Resolves translation status label
 */
const resolveStatus = (row) => {
  if (row.status === "true" || row.status === true) return "Gyssagly";
  if (row.status === "0") return "Gaýtaryldy";
  return "Adaty";
};

/**
 * Export translation table to Excel:
 * - Starts at D4 (Row 4, Column 4)
 * - Green header (#66A64F), white text, AutoFilter on D4:Q4
 * - Header text sized and wrapped to prevent any clipping (height 56)
 * - Continuous medium outer border around the entire table perimeter
 * - Total row at the bottom with Excel formulas
 */
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
  const START_COL = 4; // Column D (4th column)

  // Empty margin column widths (A, B, C)
  worksheet.getColumn(1).width = 4;
  worksheet.getColumn(2).width = 4;
  worksheet.getColumn(3).width = 4;

  // Margin rows height
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
    { header: "STATUS", key: "status", width: 14, align: "center" },
    { header: "TERJIMEDEN GELEN\nSAHYPA SANY", key: "completed_page_count", width: 18, align: "center" },
    { header: "TERJIME EDILIP\nGELEN GÜNI", key: "completed_day", width: 17, align: "center" },
    { header: "TERJIME\nEDEN", key: "translator", width: 26, align: "left" },
    { header: "DÜZEDILEN\nTERJIME", key: "correction_status", width: 16, align: "center" },
    { header: "TÖLENEN\nPUL", key: "price", width: 16, align: "right" },
  ];

  // Set widths for table columns (D through Q)
  columnsConfig.forEach((col, idx) => {
    worksheet.getColumn(START_COL + idx).width = col.width;
  });

  const END_COL = START_COL + columnsConfig.length - 1; // Column 17 (Q)
  const totalRowIndex = START_ROW + translations.length + 1;

  // Header Row (Row 4)
  const headerRow = worksheet.getRow(START_ROW);
  headerRow.height = 56; // Generous height to fit all multi-line labels

  const headerFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF66A64F" }, // Exact Excel green
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

    // Header borders with medium top/outer perimeter
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

  // Enable AutoFilter on row 4 from Column D (4) to Q (17)
  worksheet.autoFilter = {
    from: { row: START_ROW, column: START_COL },
    to: { row: START_ROW, column: END_COL },
  };

  let sumPrice = 0;
  let sumPages = 0;
  let sumCompletedPages = 0;

  // Populate Data Rows (starting from Row 5)
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

    sumPages += pageCount;
    if (completedPageCount !== null) sumCompletedPages += completedPageCount;
    sumPrice += price;

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

      // Cell border with outer border handling on D and Q
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

      // Numeric formatting for price
      if (idx === 13 && typeof val === "number") {
        cell.numFmt = "#,##0";
      }
    });
  });

  // Total Row at the bottom
  const totalRow = worksheet.getRow(totalRowIndex);
  totalRow.height = 24;

  for (let c = START_COL; c <= END_COL; c++) {
    const cell = totalRow.getCell(c);
    cell.font = { name: "Calibri", size: 10, bold: true };
    cell.alignment = { vertical: "middle", horizontal: columnsConfig[c - START_COL].align };

    // Total row border with medium outer perimeter
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

  // Label "Total" in Column D (START_COL)
  const cellTotalLabel = totalRow.getCell(START_COL);
  cellTotalLabel.value = "Total";
  cellTotalLabel.alignment = { vertical: "middle", horizontal: "left" };

  const firstDataRow = START_ROW + 1;
  const lastDataRow = totalRowIndex - 1;

  if (translations.length > 0) {
    // Total formula for SAHYPA SANY (Column H = 8)
    const cellPages = totalRow.getCell(START_COL + 4);
    cellPages.value = {
      formula: `SUM(H${firstDataRow}:H${lastDataRow})`,
      result: sumPages,
    };
    cellPages.numFmt = "#,##0";

    // Total formula for TERJIMEDEN GELEN SAHYPA SANY (Column M = 13)
    const cellCompletedPages = totalRow.getCell(START_COL + 9);
    cellCompletedPages.value = {
      formula: `SUM(M${firstDataRow}:M${lastDataRow})`,
      result: sumCompletedPages,
    };
    cellCompletedPages.numFmt = "#,##0";

    // Total formula for TÖLENEN PUL (Column Q = 17)
    const cellPrice = totalRow.getCell(START_COL + 13);
    cellPrice.value = {
      formula: `SUM(Q${firstDataRow}:Q${lastDataRow})`,
      result: sumPrice,
    };
    cellPrice.numFmt = "#,##0";
  }

  // Export buffer & download
  const buffer = await workbook.xlsx.writeBuffer();
  const cleanFileName = `${fileName}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, cleanFileName);
};
