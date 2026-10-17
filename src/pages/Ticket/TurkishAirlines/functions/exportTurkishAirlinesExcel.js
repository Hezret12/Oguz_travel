import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const formatDate = (val) => {
  if (!val) return "";
  const d = String(val).split("T")[0].trim();
  const parts = d.split("-");
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return d;
};

const getOfficeName = (office) => {
  if (!office) return "";
  const short = office.shortName ?? office;
  if (!short) return "";

  if (typeof short === "string") {
    const trimmed = short.trim();
    return trimmed.toLowerCase() !== "string" ? trimmed.toUpperCase() : "";
  }

  if (typeof short === "object") {
    const val =
      (short.tk && String(short.tk).trim().toLowerCase() !== "string" ? short.tk : "") ||
      (short.ru && String(short.ru).trim().toLowerCase() !== "string" ? short.ru : "") ||
      (short.en && String(short.en).trim().toLowerCase() !== "string" ? short.en : "") ||
      "";
    return val ? String(val).trim().toUpperCase() : "";
  }

  return "";
};

const ACCENT_RED = "FFDC2626"; // Refined corporate red (#DC2626)

const STATUS_BY_INDEX = {
  1: {
    label: "SALE",
    style: {
      bg: "FFDCFCE7",
      fg: "FF166534", 
      border: "FF86EFAC",
    },
  },
  2: {
    label: "REISSUE",
    style: {
      bg: "FFDBEAFE",
      fg: "FF1E40AF", 
      border: "FF93C5FD",
    },
  },
  3: {
    label: "REFUND",
    style: {
      bg: "FFFEF2F2",
      fg: ACCENT_RED, 
      border: "FFFECACA", 
    },
  },
};

const resolveStatusInfo = (rowOrStatus) => {
  if (!rowOrStatus) return { label: "", style: null };

  // 1. Primary: match by index_number directly (1: SALE, 2: REISSUE, 3: REFUND)
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

  // 2. Fallback: match by name string if index_number is not present
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

export const exportTurkishAirlinesExcel = async (tickets = [], options = {}) => {
  const fileName = options.fileName || "Turkish_Airlines_Hasabaty";
  const sheetName = options.sheetName || "Turkish Airlines";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName.substring(0, 31), {
    views: [{ showGridLines: true }],
  });

  const START_ROW = 4;
  const START_COL = 4; // Column D

  worksheet.getColumn(1).width = 4;
  worksheet.getColumn(2).width = 4;
  worksheet.getColumn(3).width = 4;

  worksheet.getRow(1).height = 15;
  worksheet.getRow(2).height = 15;
  worksheet.getRow(3).height = 15;

  const columnsConfig = [
    { header: "T/B", key: "index_number", width: 8, align: "center" },
    { header: "Sene", key: "datetime", width: 13, align: "center" },
    { header: "Tabşyryjy, operator", key: "operator1", width: 22, align: "left" },
    { header: "Ofis", key: "ofis1", width: 10, align: "center" },
    { header: "Kabul ediji, operator", key: "operator2", width: 22, align: "left" },
    { header: "Ofis", key: "ofis2", width: 10, align: "center" },
    { header: "Agent", key: "agent", width: 20, align: "left" },
    { header: "Agent Tel", key: "agent_tel", width: 18, align: "center" },
    { header: "Ýolagçy", key: "passenger", width: 26, align: "left" },
    { header: "Ýolagçy Tel", key: "passenger_tel", width: 18, align: "center" },
    { header: "Doglan senesi", key: "dob", width: 13, align: "center" },
    { header: "Miles & Smiles", key: "miles", width: 16, align: "center" },
    { header: "Pasport Nº", key: "passport", width: 15, align: "center" },
    { header: "PCOI", key: "pcoi", width: 16, align: "center", note: "Passport Country of Issue" },
    { header: "PDOE", key: "pdoe", width: 13, align: "center", note: "Passport Date of Expiry" },
    { header: "Status", key: "status", width: 14, align: "center" },
    { header: "PNR", key: "pnr", width: 14, align: "center" },
    { header: "Ticket №", key: "ticket_number", width: 18, align: "center" },
    { header: "Gatnaw ugur", key: "route", width: 20, align: "center" },
    { header: "Class", key: "class", width: 10, align: "center" },
    { header: "Uçuş güni", key: "flight_date", width: 14, align: "center" },
    { header: "Töleg ýagdaýy", key: "is_paid", width: 15, align: "center" },
    { header: "Töleg %", key: "percent", width: 15, align: "center" },
    { header: "Base fare", key: "base_fare", width: 16, align: "right" },
    { header: "Satyş baha", key: "total_price", width: 16, align: "right" },
    { header: "Aýdylan baha", key: "quoted_price", width: 16, align: "right" },
    { header: "Kabul edildi", key: "accepted_price", width: 16, align: "right" },
    { header: "Gaýtaryldy", key: "returned_price", width: 16, align: "right" },
    { header: "Kassa", key: "kassa", width: 12, align: "center" },
    { header: "Bellik", key: "note", width: 20, align: "left" },
  ];

  const totalColIdx = columnsConfig.findIndex((c) => c.key === "total_price");
  const baseFareColIdx = columnsConfig.findIndex((c) => c.key === "base_fare");
  const quotedColIdx = columnsConfig.findIndex((c) => c.key === "quoted_price");
  const acceptedColIdx = columnsConfig.findIndex((c) => c.key === "accepted_price");
  const returnedColIdx = columnsConfig.findIndex((c) => c.key === "returned_price");
  const statusColIdx = columnsConfig.findIndex((c) => c.key === "status");
  const isPaidColIdx = columnsConfig.findIndex((c) => c.key === "is_paid");

  // Set column widths
  columnsConfig.forEach((col, idx) => {
    worksheet.getColumn(START_COL + idx).width = col.width;
  });

  const END_COL = START_COL + columnsConfig.length - 1;
  const lastDataRow = START_ROW + tickets.length;
  // One blank row between data and total keeps the total row outside Excel's
  // AutoFilter list range, so filtering the data doesn't hide the total too.
  const totalRowIndex = lastDataRow + 2;

  // Header Row (Row 4)
  const headerRow = worksheet.getRow(START_ROW);
  headerRow.height = 30;

  const headerFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFFFFF" },
  };

  columnsConfig.forEach((col, idx) => {
    const colNumber = START_COL + idx;
    const cell = headerRow.getCell(colNumber);
    cell.value = col.header;
    if (col.note) {
      cell.note = col.note;
    }
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: idx === baseFareColIdx ? ACCENT_RED : "FF000000" },
    };
    cell.fill = headerFill;
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

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

  // Enable AutoFilter on Row 4
  worksheet.autoFilter = {
    from: { row: START_ROW, column: START_COL },
    to: { row: lastDataRow, column: END_COL },
  };

  const parseExcelNumber = (val) => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "number") return Number.isFinite(val) ? val : null;
    const cleaned = String(val).replace(/,/g, ".").replace(/[^0-9.-]/g, "").trim();
    if (cleaned === "" || cleaned === "-") return null;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  };

  const currencyNumFmt = '"$ "#,##0.00;"$ "-#,##0.00;"$ -"';

  const colMaxLens = columnsConfig.map((c) => (c.header ? String(c.header).length : 10));

  let sumTotal = 0;
  let sumBase = 0;
  let sumQuoted = 0;
  let sumAccepted = 0;
  let sumReturned = 0;

  // Data rows
  tickets.forEach((row, offset) => {
    const rowIndex = START_ROW + 1 + offset;
    const currentRow = worksheet.getRow(rowIndex);
    currentRow.height = 20;

    const totalPrice = parseExcelNumber(row.total_price) ?? 0;
    const baseFare = parseExcelNumber(row.base_fare) ?? 0;
    const quotedPrice = parseExcelNumber(row.quoted_price) ?? 0;
    const acceptedPrice = parseExcelNumber(row.accepted_price);
    const returnedPrice = parseExcelNumber(row.returned_price);

    sumTotal += totalPrice;
    sumBase += baseFare;
    sumQuoted += quotedPrice;
    if (acceptedPrice !== null) sumAccepted += acceptedPrice;
    if (returnedPrice !== null) sumReturned += returnedPrice;

    const statusInfo = resolveStatusInfo(row);
    const statusValue = statusInfo.label;
    const isPaidLabel = resolveIsPaid(row);
    const pctValue = resolvePercent(row);

    const rowValues = {
      index_number: row.index_number ?? offset + 1,
      datetime: formatDate(row.datetime),
      operator1: row.ta_assignment_operator?.fullName
        ? String(row.ta_assignment_operator.fullName).toUpperCase()
        : "",
      ofis1: getOfficeName(row.ta_assignment_operator?.office),
      operator2: row.ta_receiver_operator?.fullName
        ? String(row.ta_receiver_operator.fullName).toUpperCase()
        : "",
      ofis2: getOfficeName(row.ta_receiver_operator?.office),
      agent: row.agent?.name ? String(row.agent.name).toUpperCase() : "",
      agent_tel: row.agent?.phone_number ? String(row.agent.phone_number).trim() : "",
      passenger: row.client?.fullName ? String(row.client.fullName).toUpperCase() : "",
      passenger_tel: row.client?.phone_number ? String(row.client.phone_number).trim() : "",
      dob: formatDate(row.client?.dateOfBirth),
      miles: row.milesSmiles ? String(row.milesSmiles).toUpperCase() : "",
      passport: row.client?.passport_number ? String(row.client.passport_number).toUpperCase() : "",
      pcoi: row.client?.passportCountryOfIssue ? String(row.client.passportCountryOfIssue).toUpperCase() : "TURKMENISTAN",
      pdoe: formatDate(row.client?.passportExpiryDate),
      status: statusValue,
      pnr: row.pnr ? String(row.pnr).toUpperCase() : "",
      ticket_number: row.ticket_number ? String(row.ticket_number).trim() : "",
      route: row.route ? String(row.route).toUpperCase() : "",
      class: row.class ? String(row.class).toUpperCase() : "",
      flight_date: formatDate(row.flight_date),
      is_paid: isPaidLabel,
      percent: pctValue,
      base_fare: baseFare,
      total_price: totalPrice,
      quoted_price: quotedPrice,
      accepted_price: acceptedPrice !== null ? acceptedPrice : "",
      returned_price: returnedPrice !== null ? returnedPrice : "",
      kassa: getOfficeName(row.office),
      note: row.note ? String(row.note).trim() : "",
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

      // Single-pass length tracking (zero extra DOM/cell lookups)
      if (val !== null && val !== undefined && val !== "") {
        const len = String(val).length;
        if (len > colMaxLens[idx]) {
          colMaxLens[idx] = len;
        }
        if (len > 40) {
          cell.alignment.wrapText = true;
        }
      }

      // Apply Zebra background
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: zebraBg },
      };

      // Borders
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

      // Status styling
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

      // Red font color for Net baha (base fare)
      if (idx === baseFareColIdx) {
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: ACCENT_RED } };
      }

      // Currency formatting
      if (
        (idx === totalColIdx ||
          idx === baseFareColIdx ||
          idx === quotedColIdx ||
          idx === acceptedColIdx ||
          idx === returnedColIdx) &&
        typeof val === "number"
      ) {
        cell.numFmt = currencyNumFmt;
      }
    });
  });

  // Total Row
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

  if (tickets.length > 0) {
    const sumCols = [
      { key: "total_price", sum: sumTotal, isRed: false },
      { key: "base_fare", sum: sumBase, isRed: true },
      { key: "quoted_price", sum: sumQuoted, isRed: false },
      { key: "accepted_price", sum: sumAccepted, isRed: false },
      { key: "returned_price", sum: sumReturned, isRed: false },
    ];

    sumCols.forEach(({ key, sum, isRed }) => {
      const colIdx = columnsConfig.findIndex((c) => c.key === key);
      if (colIdx !== -1) {
        const colLetter = getExcelColName(START_COL + colIdx);
        const cell = totalRow.getCell(START_COL + colIdx);
        cell.value = {
          formula: `SUBTOTAL(109,${colLetter}${firstDataRow}:${colLetter}${lastDataRow})`,
          result: sum,
        };
        cell.numFmt = currencyNumFmt;
        if (isRed) {
          cell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: ACCENT_RED } };
        }
      }
    });
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
