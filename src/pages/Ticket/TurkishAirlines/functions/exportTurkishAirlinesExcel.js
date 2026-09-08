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
  if (office.shortName?.tk) return String(office.shortName.tk).toUpperCase();
  if (office.fullName?.tk) return String(office.fullName.tk).toUpperCase();
  if (typeof office.shortName === "string" && office.shortName) return office.shortName.toUpperCase();
  if (typeof office.fullName === "string" && office.fullName) return office.fullName.toUpperCase();
  if (office.shortName?.en) return String(office.shortName.en).toUpperCase();
  if (office.fullName?.en) return String(office.fullName.en).toUpperCase();
  return "";
};

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
      bg: "FFFEF2F2", // Soft warm rose / blush tint (#FEF2F2)
      fg: "FF991B1B", // Deep executive wine / crimson (#991B1B)
      border: "FFFCA5A5", // Subtle rose border (#FCA5A5)
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

const getStatusName = (rowOrStatus) => resolveStatusInfo(rowOrStatus).label;
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
    { header: "Senesi", key: "datetime", width: 13, align: "center" },
    { header: "Tabşyryjy, Operator", key: "operator1", width: 22, align: "left" },
    { header: "Ofis", key: "ofis1", width: 10, align: "center" },
    { header: "Kabul ediji, Operator", key: "operator2", width: 22, align: "left" },
    { header: "Ofis", key: "ofis2", width: 10, align: "center" },
    { header: "Agent", key: "agent", width: 20, align: "left" },
    { header: "Agent Tel", key: "agent_tel", width: 18, align: "center" },
    { header: "Ýolagçy", key: "passenger", width: 26, align: "left" },
    { header: "Ýolagçy Tel", key: "passenger_tel", width: 18, align: "center" },
    { header: "Doglan senesi", key: "dob", width: 13, align: "center" },
    { header: "Miles & Smiles", key: "miles", width: 16, align: "center" },
    { header: "Passport №", key: "passport", width: 15, align: "center" },
    { header: "PCOI", key: "pcoi", width: 16, align: "center", note: "Passport Country of Issue" },
    { header: "PDOE", key: "pdoe", width: 13, align: "center", note: "Passport Date of Expiry" },
    { header: "Status", key: "status", width: 14, align: "center" },
    { header: "PNR", key: "pnr", width: 14, align: "center" },
    { header: "Ticket №", key: "ticket_number", width: 18, align: "center" },
    { header: "Route", key: "route", width: 20, align: "center" },
    { header: "Class", key: "class", width: 10, align: "center" },
    { header: "Flight Date", key: "flight_date", width: 14, align: "center" },
    { header: "Töleg ýagdayy", key: "is_paid", width: 15, align: "center" },
    { header: "Töleg Göterimi", key: "percent", width: 15, align: "center" },
    { header: "Base Fare", key: "base_fare", width: 16, align: "right" },
    { header: "Total", key: "total_price", width: 16, align: "right" },
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

  // Set column widths
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
    fgColor: { argb: "FFF2F2F2" },
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
      size: 10,
      bold: true,
      color: { argb: idx === baseFareColIdx ? "FF991B1B" : "FF000000" },
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
    to: { row: START_ROW, column: END_COL },
  };

  const currencyNumFmt = '"$ " #,##0.00;"$ " -#,##0.00;"$  -"';

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

    const totalPrice = Number(row.total_price || 0);
    const baseFare = Number(row.base_fare || 0);
    const quotedPrice = Number(row.quoted_price || 0);
    const acceptedPrice =
      row.accepted_price !== null && row.accepted_price !== undefined && row.accepted_price !== ""
        ? Number(row.accepted_price)
        : null;
    const returnedPrice =
      row.returned_price !== null && row.returned_price !== undefined && row.returned_price !== ""
        ? Number(row.returned_price)
        : null;

    sumTotal += totalPrice;
    sumBase += baseFare;
    sumQuoted += quotedPrice;
    if (acceptedPrice !== null) sumAccepted += acceptedPrice;
    if (returnedPrice !== null) sumReturned += returnedPrice;

    const statusInfo = resolveStatusInfo(row);
    const statusValue = statusInfo.label;
    const isPaidLabel = resolveIsPaid(row);
    const pctValue = resolvePercent(row);

    const rowData = [
      row.index_number ?? offset + 1,
      formatDate(row.datetime),
      row.ta_assignment_operator?.fullName ? String(row.ta_assignment_operator.fullName).toUpperCase() : "",
      getOfficeName(row.ta_assignment_operator?.office),
      row.ta_receiver_operator?.fullName ? String(row.ta_receiver_operator.fullName).toUpperCase() : "",
      getOfficeName(row.ta_receiver_operator?.office),
      row.agent?.name ? String(row.agent.name).toUpperCase() : "",
      row.agent?.phone_number ? String(row.agent.phone_number).trim() : "",
      row.client?.fullName ? String(row.client.fullName).toUpperCase() : "",
      row.client?.phone_number ? String(row.client.phone_number).trim() : "",
      formatDate(row.client?.dateOfBirth),
      row.milesSmiles ? String(row.milesSmiles).toUpperCase() : "",
      row.client?.passport_number ? String(row.client.passport_number).toUpperCase() : "",
      row.client?.passportCountryOfIssue ? String(row.client.passportCountryOfIssue).toUpperCase() : "TURKMENISTAN",
      formatDate(row.client?.passportExpiryDate),
      statusValue,
      row.pnr ? String(row.pnr).toUpperCase() : "",
      row.ticket_number ? String(row.ticket_number).trim() : "",
      row.route ? String(row.route).toUpperCase() : "",
      row.class ? String(row.class).toUpperCase() : "",
      formatDate(row.flight_date),
      isPaidLabel,
      pctValue,
      baseFare,
      totalPrice,
      quotedPrice,
      acceptedPrice !== null ? acceptedPrice : "",
      returnedPrice !== null ? returnedPrice : "",
      getOfficeName(row.office),
      row.note ? String(row.note).trim() : "",
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

      // Red font color for BASE FARE
      if (idx === baseFareColIdx) {
        cell.font = { name: "Calibri", size: 10, color: { argb: "FF991B1B" } };
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
  const lastDataRow = totalRowIndex - 1;

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
          formula: `SUM(${colLetter}${firstDataRow}:${colLetter}${lastDataRow})`,
          result: sum,
        };
        cell.numFmt = currencyNumFmt;
        if (isRed) {
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF991B1B" } };
        }
      }
    });

    const noteColIdx = columnsConfig.findIndex((c) => c.key === "note");
    if (noteColIdx !== -1) {
      const cellNote = totalRow.getCell(START_COL + noteColIdx);
      cellNote.value = 0;
      cellNote.numFmt = currencyNumFmt;
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
