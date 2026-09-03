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
  // If time is "08:34:00" -> "8:34"
  const parts = str.split(":");
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    return `${hours}:${minutes}`;
  }
  return str.slice(0, 5);
};

/**
 * Resolves source/origin office (NIREDEN GELENI)
 */
const resolveOrigin = (row) => {
  return (
    row.nireden_geleni ||
    row.source_origin ||
    row.operator?.office?.shortName ||
    row.client?.office?.shortName ||
    row.office?.shortName ||
    (row.operator?.office?.fullName ? String(row.operator.office.fullName).toUpperCase() : "") ||
    "OGUZABAT"
  );
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
 * Export translation table to Excel matching the exact visual specification:
 * Green header (#66A64F), white text, AutoFilter on Row 1, 14 columns, and Total row at bottom.
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

  // 14 Columns matching user's image exactly
  const columnsConfig = [
    { header: "TERJIMAN\nGELEN GUNI", key: "received_day", width: 15, align: "center" },
    { header: "TERJIMA\nBERLEN\nWAGTY", key: "received_time", width: 12, align: "center" },
    { header: "NIREDEN GELENI", key: "nireden_geleni", width: 18, align: "left" },
    { header: "OPERATOR", key: "operator", width: 26, align: "left" },
    { header: "SAHYPA\nSANY", key: "page_count", width: 11, align: "right" },
    { header: "RAYATYN ADY", key: "client_name", width: 22, align: "left" },
    { header: "HAYSY DILEN\nHAYSY DILE", key: "direction", width: 16, align: "center" },
    { header: "TERJIMED\nEN GELEN\nWAGTY", key: "completed_time", width: 13, align: "center" },
    { header: "STATUS", key: "status", width: 12, align: "center" },
    { header: "TERJIMEDEN\nGELEN\nSAHYPA\nSANY", key: "completed_page_count", width: 14, align: "right" },
    { header: "TERJIME EDILIP\nGELEN GUNI", key: "completed_day", width: 16, align: "center" },
    { header: "TERJIME EDEN", key: "translator", width: 24, align: "left" },
    { header: "DUZEDILEN\nTERJIME", key: "correction_status", width: 14, align: "center" },
    { header: "TÖLENEN PUL", key: "price", width: 14, align: "right" },
  ];

  // Set column widths
  worksheet.columns = columnsConfig.map((col) => ({
    width: col.width,
  }));

  // Style Header Row (Row 1)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 42;

  const headerFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF66A64F" }, // Exact Excel green from image
  };

  const headerBorder = {
    top: { style: "thin", color: { argb: "FF5E9C47" } },
    bottom: { style: "thin", color: { argb: "FF5E9C47" } },
    left: { style: "thin", color: { argb: "FF5E9C47" } },
    right: { style: "thin", color: { argb: "FF5E9C47" } },
  };

  columnsConfig.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = headerFill;
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = headerBorder;
  });

  // Enable AutoFilter on Row 1 (header dropdown arrows)
  worksheet.autoFilter = {
    from: "A1",
    to: "N1",
  };

  // Thin cell borders for data
  const dataBorder = {
    top: { style: "thin", color: { argb: "FFD9D9D9" } },
    bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
    left: { style: "thin", color: { argb: "FFD9D9D9" } },
    right: { style: "thin", color: { argb: "FFD9D9D9" } },
  };

  let sumPrice = 0;
  let sumPages = 0;
  let sumCompletedPages = 0;

  // Populate Data Rows
  translations.forEach((row, offset) => {
    const rowIndex = offset + 2;
    const currentRow = worksheet.getRow(rowIndex);
    currentRow.height = 20;

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
      row.operator?.fullName ? String(row.operator.fullName).toUpperCase() : "",
      pageCount,
      row.client?.fullName ? String(row.client.fullName).toUpperCase() : "",
      row.source_to_target ? String(row.source_to_target).toUpperCase() : "",
      formatTime(row.completed_time),
      resolveStatus(row),
      completedPageCount !== null ? completedPageCount : "",
      formatDate(row.completed_day),
      row.translator?.fullName ? String(row.translator.fullName).toUpperCase() : "",
      row.correction_status ? String(row.correction_status).toUpperCase() : "DOGRY",
      price,
    ];

    rowData.forEach((val, colIdx) => {
      const cell = currentRow.getCell(colIdx + 1);
      cell.value = val;
      cell.font = { name: "Calibri", size: 10 };
      cell.alignment = {
        vertical: "middle",
        horizontal: columnsConfig[colIdx].align,
      };
      cell.border = dataBorder;

      // Numeric formatting for price
      if (colIdx === 13 && typeof val === "number") {
        cell.numFmt = "#,##0";
      }
    });
  });

  // Total Row at the bottom
  const totalRowIndex = translations.length + 2;
  const totalRow = worksheet.getRow(totalRowIndex);
  totalRow.height = 22;

  const totalBorder = {
    top: { style: "thin", color: { argb: "FF000000" } },
    bottom: { style: "thin", color: { argb: "FF000000" } },
    left: { style: "thin", color: { argb: "FFD9D9D9" } },
    right: { style: "thin", color: { argb: "FFD9D9D9" } },
  };

  // Fill Total row cells
  for (let c = 1; c <= columnsConfig.length; c++) {
    const cell = totalRow.getCell(c);
    cell.border = totalBorder;
    cell.font = { name: "Calibri", size: 10, bold: true };
    cell.alignment = { vertical: "middle", horizontal: columnsConfig[c - 1].align };
  }

  // Label "Total" in Column A
  const cellA = totalRow.getCell(1);
  cellA.value = "Total";
  cellA.alignment = { vertical: "middle", horizontal: "left" };

  // Total formula for SAHYPA SANY (Column 5 / E)
  if (translations.length > 0) {
    const cellPages = totalRow.getCell(5);
    cellPages.value = {
      formula: `SUM(E2:E${totalRowIndex - 1})`,
      result: sumPages,
    };
    cellPages.numFmt = "#,##0";

    // Total formula for TERJIMEDEN GELEN SAHYPA SANY (Column 10 / J)
    const cellCompletedPages = totalRow.getCell(10);
    cellCompletedPages.value = {
      formula: `SUM(J2:J${totalRowIndex - 1})`,
      result: sumCompletedPages,
    };
    cellCompletedPages.numFmt = "#,##0";

    // Total formula for TÖLENEN PUL (Column 14 / N)
    const cellPrice = totalRow.getCell(14);
    cellPrice.value = {
      formula: `SUM(N2:N${totalRowIndex - 1})`,
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
