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

const ACCENT_RED = "FFDC2626"; // Refined, vibrant crimson (#DC2626)

const STATUS_BY_INDEX = {
  1: {
    label: "SALE",
    style: {
      bg: "FFDCFCE7", // Soft mint tint
      fg: "FF166534", // Deep emerald
      border: "FF86EFAC",
    },
  },
  2: {
    label: "REISSUE",
    style: {
      bg: "FFDBEAFE", // Soft royal tint
      fg: "FF1E40AF", // Deep navy
      border: "FF93C5FD",
    },
  },
  3: {
    label: "REFUND",
    style: {
      bg: "FFFEF2F2", // Soft blush tint
      fg: ACCENT_RED,  // Clean, modern red
      border: "FFFECACA",
    },
  },
};

const resolveStatusInfo = (rowOrStatus) => {
  if (!rowOrStatus) return { label: "", style: null };

  const statusObj = rowOrStatus.tstatus || rowOrStatus.status || rowOrStatus;
  const indexNumber =
    typeof statusObj === "number"
      ? statusObj
      : typeof rowOrStatus === "number"
      ? rowOrStatus
      : statusObj?.index_number ?? rowOrStatus.status_index_number;

  if (indexNumber !== undefined && indexNumber !== null && STATUS_BY_INDEX[Number(indexNumber)]) {
    return STATUS_BY_INDEX[Number(indexNumber)];
  }

  const name =
    statusObj?.name?.en ||
    statusObj?.name?.tk ||
    (typeof statusObj?.name === "string" ? statusObj.name : "") ||
    (typeof statusObj === "string" ? statusObj : "") ||
    rowOrStatus.sale_status ||
    "";

  const key = String(name).trim().toUpperCase();
  if (key === "SALE" || key === "1") return STATUS_BY_INDEX[1];
  if (key === "REISSUE" || key === "2") return STATUS_BY_INDEX[2];
  if (key === "REFUND" || key === "3") return STATUS_BY_INDEX[3];

  return { label: key, style: null };
};

const getStatusExcelStyle = (rowOrStatus) => resolveStatusInfo(rowOrStatus).style;

const getOfficeShortName = (operator) => {
  const shortName = operator?.office?.shortName;
  if (!shortName) return "";

  if (typeof shortName === "string") {
    const trimmed = shortName.trim();
    return trimmed.toLowerCase() !== "string" ? trimmed.toUpperCase() : "";
  }

  if (typeof shortName === "object") {
    const val =
      (shortName.tk && String(shortName.tk).trim().toLowerCase() !== "string" ? shortName.tk : "") ||
      (shortName.ru && String(shortName.ru).trim().toLowerCase() !== "string" ? shortName.ru : "") ||
      (shortName.en && String(shortName.en).trim().toLowerCase() !== "string" ? shortName.en : "") ||
      "";
    return val ? String(val).trim().toUpperCase() : "";
  }

  return "";
};

const resolveAssignmentOffice = (row) => getOfficeShortName(row?.assignment_operator);

const resolveReceiverOffice = (row) => getOfficeShortName(row?.receiver_operator);

const resolveAgent = (row) => {
  const agent = row?.agent;
  if (!agent) return "";
  if (typeof agent === "object") {
    const name =
      agent.name && String(agent.name).trim().toLowerCase() !== "string"
        ? String(agent.name).trim().toUpperCase()
        : "";
    const phone =
      agent.phone_number && String(agent.phone_number).trim().toLowerCase() !== "string"
        ? String(agent.phone_number).trim()
        : "";
    if (name && phone) return `${name} (${phone})`;
    if (name) return name;
    if (phone) return phone;
    return "";
  }
  if (typeof agent === "string" && agent.trim().toLowerCase() !== "string") {
    return agent.trim().toUpperCase();
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
  if (row?.travel_type !== undefined && row?.travel_type !== null && row?.travel_type !== "") {
    return String(row.travel_type) === "1" ? "ROUND TRIP" : "ONE WAY";
  }
  return "";
};

const resolveCard = (row) => {
  if (!row?.card) return "";
  const cardStr = String(row.card).trim();
  if (!cardStr || cardStr.toLowerCase() === "string") return "";
  if (cardStr.startsWith("**")) return cardStr;
  if (cardStr.length > 4) return `**${cardStr.slice(-4)}`;
  return `**${cardStr}`;
};

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
    { header: "Tabşyryjy, operator", key: "assignment_operator", width: 22, align: "center" },
    { header: "Ofis", key: "assignment_office", width: 10, align: "center" },
    { header: "Kabul ediji, operator", key: "receiver_operator", width: 22, align: "center" },
    { header: "Ofis", key: "receiver_office", width: 10, align: "center" },
    { header: "Agent", key: "agent", width: 20, align: "left" },
    { header: "Ýolagçy", key: "passenger", width: 28, align: "left" },
    { header: "Pasport Nº", key: "passport", width: 16, align: "center" },
    { header: "PNR", key: "pnr", width: 14, align: "center" },
    { header: "Status", key: "status", width: 14, align: "center" },
    { header: "Howa ýoly", key: "airline", width: 24, align: "left" },
    { header: "Gatnaw ugur", key: "route", width: 22, align: "center" },
    { header: "Class", key: "class", width: 12, align: "center" },
    { header: "Gatnawyň görnüşi", key: "travel_type", width: 20, align: "center" },
    { header: "Uçuş güni", key: "flight_date", width: 14, align: "center" },
    { header: "Net baha", key: "net_price", width: 16, align: "right" },
    { header: "Satyş baha", key: "sale_price", width: 16, align: "right" },
    { header: "Peýda", key: "profit", width: 16, align: "right" },
    { header: "Kart", key: "card", width: 12, align: "center" },
    { header: "Töleg ýagdaýy", key: "is_paid", width: 15, align: "center" },
    { header: "Töleg %", key: "percent", width: 12, align: "center" },
    { header: "Bellik", key: "note", width: 25, align: "left" },
  ];

  const netColIdx = columnsConfig.findIndex((c) => c.key === "net_price");
  const saleColIdx = columnsConfig.findIndex((c) => c.key === "sale_price");
  const profitColIdx = columnsConfig.findIndex((c) => c.key === "profit");
  const statusColIdx = columnsConfig.findIndex((c) => c.key === "status");
  const isPaidColIdx = columnsConfig.findIndex((c) => c.key === "is_paid");

  // Set column widths for table columns
  columnsConfig.forEach((col, idx) => {
    worksheet.getColumn(START_COL + idx).width = col.width;
  });

  const END_COL = START_COL + columnsConfig.length - 1;
  const totalRowIndex = START_ROW + tickets.length + 1;

  // Header Row (Row 4) — Clean white background with prominent bold typography
  const headerRow = worksheet.getRow(START_ROW);
  headerRow.height = 30; // Generous height for bolder, larger header

  const headerFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFFFFF" }, // White header background
  };

  columnsConfig.forEach((col, idx) => {
    const colNumber = START_COL + idx;
    const cell = headerRow.getCell(colNumber);
    cell.value = col.header;
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: idx === netColIdx ? ACCENT_RED : "FF000000" },
    };
    cell.fill = headerFill;
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    // Header border: medium top/bottom perimeter
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

  const parseExcelNumber = (val) => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "number") return Number.isFinite(val) ? val : null;
    const cleaned = String(val).replace(/,/g, ".").replace(/[^0-9.-]/g, "").trim();
    if (cleaned === "" || cleaned === "-") return null;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  };

  // Currency format matching reference image: $ 520.00; $ -60.00; $  -
  const currencyNumFmt = '"$ "#,##0.00;"$ "-#,##0.00;"$ -"';

  const colMaxLens = columnsConfig.map((c) => (c.header ? String(c.header).length : 10));

  let sumNet = 0;
  let sumSale = 0;
  let sumProfit = 0;

  // Populate Data Rows with Zebra Striping (starting from Row 5)
  tickets.forEach((row, offset) => {
    const rowIndex = START_ROW + 1 + offset;
    const currentRow = worksheet.getRow(rowIndex);
    currentRow.height = 20;

    const netPrice = parseExcelNumber(row.net_price) ?? 0;
    const salePrice = parseExcelNumber(row.sale_price) ?? 0;
    const profit = Number(
      row.profit !== undefined && row.profit !== null
        ? row.profit
        : salePrice - netPrice
    );

    sumNet += netPrice;
    sumSale += salePrice;
    sumProfit += profit;

    const passportVal =
      row.client?.passport_number ||
      row.passport_number ||
      row.passport ||
      "";
    const passport = passportVal && passportVal !== "string" ? String(passportVal).toUpperCase() : "";

    const statusInfo = resolveStatusInfo(row);
    const isPaidLabel = resolveIsPaid(row);
    const pctValue = resolvePercent(row);

    const passengerVal = row.client?.fullName || row.passenger || "";
    const passenger = passengerVal && passengerVal !== "string"
      ? String(extractText(passengerVal)).toUpperCase()
      : "";

    const op1Val = row.assignment_operator?.fullName || "";
    const op1 = op1Val && op1Val !== "string" ? String(extractText(op1Val)).toUpperCase() : "";

    const op2Val = row.receiver_operator?.fullName || "";
    const op2 = op2Val && op2Val !== "string" ? String(extractText(op2Val)).toUpperCase() : "";

    const rowValues = {
      index_number: row.index_number ?? offset + 1,
      datetime: formatDate(row.datetime),
      assignment_operator: op1,
      assignment_office: resolveAssignmentOffice(row),
      receiver_operator: op2,
      receiver_office: resolveReceiverOffice(row),
      agent: resolveAgent(row),
      passenger: passenger,
      passport: passport,
      pnr: row.pnr && row.pnr !== "string" ? String(row.pnr).toUpperCase() : "",
      status: statusInfo.label,
      airline: row.airline && row.airline !== "string" ? String(row.airline).toUpperCase() : "",
      route: row.route && row.route !== "string" ? String(row.route).toUpperCase() : "",
      class: row.class && row.class !== "string" ? String(row.class).toUpperCase() : "",
      travel_type: resolveTripType(row),
      flight_date: formatDate(row.flight_date),
      net_price: netPrice,
      sale_price: salePrice,
      profit: profit,
      card: resolveCard(row),
      is_paid: isPaidLabel,
      percent: pctValue,
      note: row.note && row.note !== "string" ? String(row.note) : "",
    };

    const rowData = columnsConfig.map((col) => rowValues[col.key] ?? "");

    // Zebra striping: Alternate between White (#FFFFFF) and Subtle Gray (#E5E7EB)
    const isEvenRow = offset % 2 === 1;
    const zebraBg = isEvenRow ? "FFE5E7EB" : "FFFFFFFF";

    rowData.forEach((val, idx) => {
      const colNumber = START_COL + idx;
      const cell = currentRow.getCell(colNumber);
      cell.value = val;
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF000000" } };
      cell.alignment = {
        vertical: "middle",
        horizontal: columnsConfig[idx].align,
      };

      // Apply Zebra background
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: zebraBg },
      };

      // Single-pass length tracking (zero extra cell lookups)
      if (val !== null && val !== undefined && val !== "") {
        const len = String(val).length;
        if (len > colMaxLens[idx]) {
          colMaxLens[idx] = len;
        }
        if (len > 40) {
          cell.alignment.wrapText = true;
        }
      }

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

      // Status styling with subtle badge colors
      if (idx === statusColIdx && val) {
        const statusStyle = statusInfo.style || getStatusExcelStyle(val);
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
          cell.border = {
            top: { style: "thin", color: { argb: statusStyle.border || "FFD9D9D9" } },
            bottom: { style: "thin", color: { argb: statusStyle.border || "FFD9D9D9" } },
            left: colNumber === START_COL
              ? { style: "medium", color: { argb: "FF000000" } }
              : { style: "thin", color: { argb: statusStyle.border || "FFD9D9D9" } },
            right: colNumber === END_COL
              ? { style: "medium", color: { argb: "FF000000" } }
              : { style: "thin", color: { argb: statusStyle.border || "FFD9D9D9" } },
          };
        }
      }

      // Payment status (is_paid) pill styling
      if (idx === isPaidColIdx && val) {
        const isPaid = val === "Tölendi";
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: isPaid ? "FFDCFCE7" : "FFFEF2F2" },
        };
        cell.font = {
          name: "Calibri",
          size: 10,
          bold: true,
          color: { argb: isPaid ? "FF166534" : ACCENT_RED },
        };
      }

      // Professional red for Net Price column
      if (idx === netColIdx) {
        cell.font = {
          name: "Calibri",
          size: 10,
          bold: true,
          color: { argb: ACCENT_RED },
        };
      }

      // Currency formatting for Net, Sale, Profit
      if ((idx === netColIdx || idx === saleColIdx || idx === profitColIdx) && typeof val === "number") {
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
      cellNet.font = {
        name: "Calibri",
        size: 10.5,
        bold: true,
        color: { argb: ACCENT_RED },
      };
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
      cellSale.font = { name: "Calibri", size: 10, bold: true };
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
      cellProfit.font = {
        name: "Calibri",
        size: 10,
        bold: true,
      };
    }
  }

  // Apply auto-fitted column widths (O(Columns) - zero extra cell lookups)
  columnsConfig.forEach((col, idx) => {
    const baseWidth = col.width || 12;
    worksheet.getColumn(START_COL + idx).width = Math.min(Math.max(baseWidth, colMaxLens[idx] + 3), 48);
  });

  // Export buffer & download
  const buffer = await workbook.xlsx.writeBuffer();
  const cleanFileName = `${fileName}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, cleanFileName);
};
