import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { formatDate } from "../../../../functions/generalHelpers";

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
 * Resolves ticket status key
 */
const getStatusKey = (row) => {
  if (row.tstatus?.name?.en) return row.tstatus.name.en;
  if (row.tstatus?.name && typeof row.tstatus.name === "string") return row.tstatus.name;
  if (row.status?.name?.en) return row.status.name.en;
  if (row.status?.name && typeof row.status.name === "string") return row.status.name;
  if (typeof row.status === "string") return row.status;
  return "";
};

/**
 * Resolves office short name or code
 */
const resolveOffice = (row) => {
  const officeVal =
    row.assignment_operator?.office?.shortName ||
    row.assignment_operator?.office?.fullName ||
    row.office?.shortName ||
    row.office?.fullName ||
    row.client?.office?.shortName ||
    "AG1";
  const text = extractText(officeVal);
  return text ? String(text).toUpperCase() : "AG1";
};

/**
 * Resolves trip type (ONE WAY / ROUND TRIP)
 */
const resolveTripType = (row) => {
  if (row.travel_type !== undefined && row.travel_type !== null) {
    return String(row.travel_type) === "1" ? "ROUND TRIP" : "ONE WAY";
  }
  if (row.tripType) return String(row.tripType).toUpperCase();
  return "ONE WAY";
};

/**
 * Resolves card digits (e.g. "**0329")
 */
const resolveCard = (row) => {
  if (!row.card) return "";
  const cardStr = String(row.card).trim();
  if (cardStr.startsWith("**")) return cardStr;
  if (cardStr.length > 4) return `**${cardStr.slice(-4)}`;
  return `**${cardStr}`;
};

/**
 * Resolves payment percentage accurately (e.g. "100.00%", "50%", 100)
 */
const resolvePercent = (row) => {
  const raw = row.paidPercentage ?? row.payment_percent ?? row.paymentPercentage;
  if (raw !== undefined && raw !== null && raw !== "") {
    const str = String(raw).trim();
    if (str.endsWith("%")) return str;
    const num = parseFloat(str);
    if (!isNaN(num)) return `${num.toFixed(0)}%`;
  }
  const isPaid =
    row.is_paid === true ||
    row.is_paid === "true" ||
    row.is_paid === 1 ||
    row.is_paid === "1";
  return isPaid ? "100%" : "0%";
};

/**
 * Resolves payment status label
 */
const resolveIsPaid = (row) => {
  if (
    row.is_paid === true ||
    row.is_paid === "true" ||
    row.is_paid === 1 ||
    row.is_paid === "1"
  ) {
    return "TÖLENDI";
  }
  return "KREDIT";
};

/**
 * Export B2B Tickets to Excel matching the exact user specification:
 * - Starts at D4 (4x4)
 * - 22 columns (20 from image + TÖLEG ÝAGDAÝY + TÖLEG GÖTERIMI)
 * - Full continuous medium outer border around the entire table perimeter
 * - Single solid bottom border on total row (not double)
 * - AutoFilter on D4:Y4
 * - Accounting currency formatting ($ #,##0.00;($ #,##0.00);$  -)
 * - Total row with formulas for Net Baha (Col S), Satyş Baha (Col T), and Peýda (Col U)
 */
export const exportB2BExcel = async (tickets = [], options = {}) => {
  const fileName = options.fileName || "B2B_Hasabaty";
  const sheetName = options.sheetName || "B2B";

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

  // Margin rows height (1, 2, 3)
  worksheet.getRow(1).height = 15;
  worksheet.getRow(2).height = 15;
  worksheet.getRow(3).height = 15;

  // 22 Columns (starting from Column D = 4 through Column Y = 25)
  const columnsConfig = [
    { header: "T/B", key: "index_number", width: 6, align: "center" },
    { header: "SENE", key: "datetime", width: 13, align: "center" },
    { header: "OPERATOR", key: "assignment_operator", width: 16, align: "left" },
    { header: "OFIS", key: "office", width: 10, align: "center" },
    { header: "OPERATOR2", key: "receiver_operator", width: 16, align: "left" },
    { header: "AGENT", key: "agent", width: 15, align: "left" },
    { header: "ÝOLAGÇY", key: "passenger", width: 25, align: "left" },
    { header: "PASSPORT NO", key: "passport", width: 14, align: "center" },
    { header: "PNR", key: "pnr", width: 13, align: "center" },
    { header: "STATUS", key: "status", width: 12, align: "center" },
    { header: "HOWA ÝOLY", key: "airline", width: 18, align: "left" },
    { header: "GATNAW UGUR", key: "route", width: 18, align: "center" },
    { header: "CLASS", key: "class", width: 12, align: "center" },
    { header: "GATNAWYŇ GÖRNÜŞI", key: "travel_type", width: 17, align: "center" },
    { header: "UÇUŞ GÜNI", key: "flight_date", width: 13, align: "center" },
    { header: "NET BAHA", key: "net_price", width: 15, align: "right" },
    { header: "SATYŞ BAHA", key: "sale_price", width: 15, align: "right" },
    { header: "PEÝDA", key: "profit", width: 15, align: "right" },
    { header: "KART", key: "card", width: 12, align: "center" },
    { header: "BELLIK", key: "note", width: 18, align: "left" },
    { header: "TÖLEG ÝAGDAÝY", key: "is_paid", width: 15, align: "center" },
    { header: "TÖLEG GÖTERIMI", key: "percent", width: 15, align: "center" },
  ];

  // Set column widths for table columns (D through Y)
  columnsConfig.forEach((col, idx) => {
    worksheet.getColumn(START_COL + idx).width = col.width;
  });

  const END_COL = START_COL + columnsConfig.length - 1; // Column 25 (Y)
  const totalRowIndex = START_ROW + tickets.length + 1;

  // Header Row (Row 4)
  const headerRow = worksheet.getRow(START_ROW);
  headerRow.height = 38;

  const headerFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2F2F2" }, // Light gray header
  };

  columnsConfig.forEach((col, idx) => {
    const colNumber = START_COL + idx;
    const cell = headerRow.getCell(colNumber);
    cell.value = col.header;
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF000000" } };
    cell.fill = headerFill;
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    // Header border with medium outer perimeter
    cell.border = {
      top: { style: "medium", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
      left: colNumber === START_COL
        ? { style: "medium", color: { argb: "FF000000" } }
        : { style: "thin", color: { argb: "FFBFBFBF" } },
      right: colNumber === END_COL
        ? { style: "medium", color: { argb: "FF000000" } }
        : { style: "thin", color: { argb: "FFBFBFBF" } },
    };
  });

  // Enable AutoFilter on row 4 from Column D (4) to Y (25)
  worksheet.autoFilter = {
    from: { row: START_ROW, column: START_COL },
    to: { row: START_ROW, column: END_COL },
  };

  // Currency format: $ 520.00; ($ 190.00); $  -
  const currencyNumFmt = '"$ " #,##0.00;("$ " #,##0.00);"$  -"';

  let sumNet = 0;
  let sumSale = 0;
  let sumProfit = 0;

  // Populate Data Rows (starting from Row 5)
  tickets.forEach((row, offset) => {
    const rowIndex = START_ROW + 1 + offset;
    const currentRow = worksheet.getRow(rowIndex);
    currentRow.height = 20;

    const netPrice = Number(row.net_price || 0);
    const salePrice = Number(row.sale_price || 0);
    const profit = Number(
      row.profit !== undefined && row.profit !== null
        ? row.profit
        : salePrice - netPrice
    );

    sumNet += netPrice;
    sumSale += salePrice;
    sumProfit += profit;

    const isPaidLabel = resolveIsPaid(row);
    const pctValue = resolvePercent(row);

    const passport =
      row.client?.passport_number ||
      row.client?.passport ||
      row.passport_number ||
      row.passport ||
      "";

    const rowData = [
      offset + 1,
      formatDate(row.datetime),
      row.assignment_operator?.fullName ? String(extractText(row.assignment_operator.fullName)).toUpperCase() : "",
      resolveOffice(row),
      row.receiver_operator?.fullName ? String(extractText(row.receiver_operator.fullName)).toUpperCase() : "",
      row.agent?.name ? String(extractText(row.agent.name)).toUpperCase() : "",
      row.client?.fullName ? String(extractText(row.client.fullName)).toUpperCase() : "",
      passport ? String(passport).toUpperCase() : "",
      row.pnr ? String(row.pnr).toUpperCase() : "",
      getStatusKey(row).toUpperCase(),
      row.airline ? String(row.airline).toUpperCase() : "",
      row.route ? String(row.route).toUpperCase() : "",
      row.class ? String(row.class).toUpperCase() : "",
      resolveTripType(row),
      formatDate(row.flight_date),
      netPrice,
      salePrice,
      profit,
      resolveCard(row),
      row.note || "",
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

      // Cell borders with medium outer perimeter on D and Y
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

      // Currency formatting for Net (idx 15 = Col S), Sale (idx 16 = Col T), Profit (idx 17 = Col U)
      if ((idx === 15 || idx === 16 || idx === 17) && typeof val === "number") {
        cell.numFmt = currencyNumFmt;
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

    // Total row single solid bottom border (not double) and outer border
    cell.border = {
      top: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } }, // Single solid medium line
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

  const firstDataRow = START_ROW + 1; // 5
  const lastDataRow = totalRowIndex - 1;

  if (tickets.length > 0) {
    // NET BAHA formula (Col 19 = S)
    const cellNet = totalRow.getCell(START_COL + 15);
    cellNet.value = {
      formula: `SUM(S${firstDataRow}:S${lastDataRow})`,
      result: sumNet,
    };
    cellNet.numFmt = currencyNumFmt;

    // SATYŞ BAHA formula (Col 20 = T)
    const cellSale = totalRow.getCell(START_COL + 16);
    cellSale.value = {
      formula: `SUM(T${firstDataRow}:T${lastDataRow})`,
      result: sumSale,
    };
    cellSale.numFmt = currencyNumFmt;

    // PEÝDA formula (Col 21 = U)
    const cellProfit = totalRow.getCell(START_COL + 17);
    cellProfit.value = {
      formula: `SUM(U${firstDataRow}:U${lastDataRow})`,
      result: sumProfit,
    };
    cellProfit.numFmt = currencyNumFmt;

    // KART total value (Col 22 = V) - displays 0 like in the screenshot
    const cellCard = totalRow.getCell(START_COL + 18);
    cellCard.value = 0;
    cellCard.alignment = { vertical: "middle", horizontal: "center" };
  }

  // Export buffer & download
  const buffer = await workbook.xlsx.writeBuffer();
  const cleanFileName = `${fileName}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, cleanFileName);
};
