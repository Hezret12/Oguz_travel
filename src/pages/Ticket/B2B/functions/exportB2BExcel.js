import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { formatDate } from "../../../../functions/generalHelpers";


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


const getStatusKey = (row) => {
  if (row.tstatus?.name?.en) return row.tstatus.name.en;
  if (row.tstatus?.name && typeof row.tstatus.name === "string") return row.tstatus.name;
  if (row.tstatus?.name) return extractText(row.tstatus.name);
  if (row.status?.name?.en) return row.status.name.en;
  if (row.status?.name && typeof row.status.name === "string") return row.status.name;
  if (row.status?.name) return extractText(row.status.name);
  if (typeof row.status === "string") return row.status;
  if (row.sale_status) return row.sale_status;
  return "";
};

const getStatusExcelStyle = (status) => {
  const key = String(status || "").trim().toUpperCase();
  if (key === "SALE" || key.includes("SALE") || key.includes("SAT")) {
    return {
      bg: "FF16A34A", // Green (#16a34a)
      fg: "FFFFFFFF", // White text
    };
  }
  if (key === "REISSUE" || key.includes("REISSUE") || key.includes("ÇALŞ") || key.includes("DOLY")) {
    return {
      bg: "FF2563EB", // Blue (#2563eb)
      fg: "FFFFFFFF", // White text
    };
  }
  if (key === "REFUND" || key.includes("REFUND") || key.includes("RET") || key.includes("GAÝTAR") || key.includes("GAYTAR")) {
    return {
      bg: "FFDC2626", // Red (#dc2626)
      fg: "FFFFFFFF", // White text
    };
  }
  return null;
};

const resolveAssignmentOffice = (row) => {
  const officeVal =
    row.assignment_operator?.office?.shortName ||
    row.assignment_operator?.office?.fullName ||
    row.office?.shortName ||
    row.office?.fullName ||
    row.assignment_operator?.office ||
    row.office;
  const text = extractText(officeVal);
  return text ? String(text).toUpperCase() : "AG1";
};

const resolveReceiverOffice = (row) => {
  const officeVal =
    row.receiver_operator?.office?.shortName ||
    row.receiver_operator?.office?.fullName ||
    row.receiver_operator?.office;
  const text = extractText(officeVal);
  if (text) return String(text).toUpperCase();

  if (
    row.receiver_opr_guid &&
    row.assignment_opr_guid &&
    row.receiver_opr_guid === row.assignment_opr_guid
  ) {
    return resolveAssignmentOffice(row);
  }

  if (
    row.receiver_operator?.fullName &&
    row.assignment_operator?.fullName &&
    row.receiver_operator.fullName === row.assignment_operator.fullName
  ) {
    return resolveAssignmentOffice(row);
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

const resolveTripType = (row) => {
  if (row.travel_type !== undefined && row.travel_type !== null) {
    return String(row.travel_type) === "1" ? "ROUND TRIP" : "ONE WAY";
  }
  if (row.tripType) return String(row.tripType).toUpperCase();
  return "ONE WAY";
};

const resolveCard = (row) => {
  if (!row.card) return "";
  const cardStr = String(row.card).trim();
  if (cardStr.startsWith("**")) return cardStr;
  if (cardStr.length > 4) return `**${cardStr.slice(-4)}`;
  return `**${cardStr}`;
};

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

const resolveIsPaid = (row) => {
  if (
    row.is_paid === true ||
    row.is_paid === "true" ||
    row.is_paid === 1 ||
    row.is_paid === "1"
  ) {
    return "Tölendi";
  }
  return "Kredit";
};

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

  const columnsConfig = [
    { header: "T/B", key: "index_number", width: 6, align: "center" },
    { header: "Sene", key: "datetime", width: 13, align: "center" },
    { header: "Tabşyryjy, Operator", key: "assignment_operator", width: 30, align: "left" },
    { header: "Ofis", key: "assignment_office", width: 15, align: "center" },
    { header: "Kabul ediji, Operator", key: "receiver_operator", width: 30, align: "left" },
    { header: "Ofis", key: "receiver_office", width: 15, align: "center" },
    { header: "Agent", key: "agent", width: 25, align: "left" },
    { header: "Ýolagçy", key: "passenger", width: 30, align: "left" },
    { header: "Passport №", key: "passport", width: 20, align: "center" },
    { header: "PNR", key: "pnr", width: 15, align: "center" },
    { header: "Status", key: "status", width: 15, align: "center" },
    { header: "Howa ýoly", key: "airline", width: 28, align: "left" },
    { header: "Gatnaw ugur", key: "route", width: 28, align: "center" },
    { header: "Class", key: "class", width: 12, align: "center" },
    { header: "Gatnawyň görnüşi", key: "travel_type", width: 17, align: "center" },
    { header: "UÇUŞ güni", key: "flight_date", width: 15, align: "center" },
     { header: "Töleg ýagdaýy", key: "is_paid", width: 15, align: "center" },
    { header: "Töleg %", key: "percent", width: 15, align: "center" },
    { header: "Net baha", key: "net_price", width: 18, align: "right" },
    { header: "Satyş Baha", key: "sale_price", width: 18, align: "right" },
    { header: "Peýda", key: "profit", width: 18, align: "right" },
    { header: "Kart", key: "card", width: 12, align: "center" },
    { header: "Bellik", key: "note", width: 25, align: "left" },
   
  ];

  const netColIdx = columnsConfig.findIndex((c) => c.key === "net_price");
  const saleColIdx = columnsConfig.findIndex((c) => c.key === "sale_price");
  const profitColIdx = columnsConfig.findIndex((c) => c.key === "profit");
  const cardColIdx = columnsConfig.findIndex((c) => c.key === "card");
  const statusColIdx = columnsConfig.findIndex((c) => c.key === "status");

  // Set column widths for table columns
  columnsConfig.forEach((col, idx) => {
    worksheet.getColumn(START_COL + idx).width = col.width;
  });

  const END_COL = START_COL + columnsConfig.length - 1;
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
    cell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: idx === netColIdx ? "FFDC2626" : "FF000000" },
    };
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

  // Enable AutoFilter on row 4
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
      resolveAssignmentOffice(row),
      row.receiver_operator?.fullName ? String(extractText(row.receiver_operator.fullName)).toUpperCase() : "",
      resolveReceiverOffice(row),
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

      // Cell borders with medium outer perimeter on START_COL and END_COL
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

      // Status styling with badge colors
      if (idx === statusColIdx && val) {
        const statusStyle = getStatusExcelStyle(val);
        if (statusStyle) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: statusStyle.bg },
          };
          cell.font = {
            name: "Calibri",
            size: 10,
            bold: true,
            color: { argb: statusStyle.fg },
          };
        }
      }

      // Currency formatting for Net, Sale, Profit
      if ((idx === netColIdx || idx === saleColIdx || idx === profitColIdx) && typeof val === "number") {
        cell.numFmt = currencyNumFmt;
      }

      // Red font color for NET BAHA (Net fare)
      if (idx === netColIdx) {
        cell.font = { name: "Calibri", size: 10, color: { argb: "FFDC2626" } };
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

    // Total row single solid bottom border and outer border
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

  const firstDataRow = START_ROW + 1; // 5
  const lastDataRow = totalRowIndex - 1;

  if (tickets.length > 0) {
    // NET BAHA formula
    if (netColIdx !== -1) {
      const netColLetter = getExcelColName(START_COL + netColIdx);
      const cellNet = totalRow.getCell(START_COL + netColIdx);
      cellNet.value = {
        formula: `SUM(${netColLetter}${firstDataRow}:${netColLetter}${lastDataRow})`,
        result: sumNet,
      };
      cellNet.numFmt = currencyNumFmt;
      cellNet.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFDC2626" } };
    }

    // SATYŞ BAHA formula
    if (saleColIdx !== -1) {
      const saleColLetter = getExcelColName(START_COL + saleColIdx);
      const cellSale = totalRow.getCell(START_COL + saleColIdx);
      cellSale.value = {
        formula: `SUM(${saleColLetter}${firstDataRow}:${saleColLetter}${lastDataRow})`,
        result: sumSale,
      };
      cellSale.numFmt = currencyNumFmt;
    }

    // PEÝDA formula
    if (profitColIdx !== -1) {
      const profitColLetter = getExcelColName(START_COL + profitColIdx);
      const cellProfit = totalRow.getCell(START_COL + profitColIdx);
      cellProfit.value = {
        formula: `SUM(${profitColLetter}${firstDataRow}:${profitColLetter}${lastDataRow})`,
        result: sumProfit,
      };
      cellProfit.numFmt = currencyNumFmt;
    }

    // KART total value (displays 0)
    if (cardColIdx !== -1) {
      const cellCard = totalRow.getCell(START_COL + cardColIdx);
      cellCard.value = 0;
      cellCard.alignment = { vertical: "middle", horizontal: "center" };
    }
  }

  // Export buffer & download
  const buffer = await workbook.xlsx.writeBuffer();
  const cleanFileName = `${fileName}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, cleanFileName);
};
