import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

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

const formatDate = (val) => {
  if (!val) return "";
  const str = String(val).split("T")[0].trim();
  const parts = str.split("-");
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return str;
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

const resolveOperator1 = (row) => {
  const opr = row.ta_assignment_operator || row.assignment_operator;
  const name = opr?.fullName || opr?.name || (typeof opr === "string" ? opr : "");
  return name ? String(extractText(name)).toUpperCase() : "";
};

const resolveOperator1Office = (row) => {
  const opr = row.ta_assignment_operator || row.assignment_operator;
  const officeVal =
    opr?.office?.shortName ||
    opr?.office?.fullName ||
    opr?.office ||
    row.office?.shortName ||
    row.office?.fullName ||
    row.office;
  const text = extractText(officeVal);
  return text ? String(text).toUpperCase() : "";
};

const resolveOperator2 = (row) => {
  const opr = row.ta_receiver_operator || row.receiver_operator;
  const name = opr?.fullName || opr?.name || (typeof opr === "string" ? opr : "");
  return name ? String(extractText(name)).toUpperCase() : "";
};

const resolveOperator2Office = (row) => {
  const opr2 = row.ta_receiver_operator || row.receiver_operator;
  const officeVal =
    opr2?.office?.shortName ||
    opr2?.office?.fullName ||
    opr2?.office;
  const text = extractText(officeVal);
  if (text) return String(text).toUpperCase();

  const opr1 = row.ta_assignment_operator || row.assignment_operator;
  if (
    opr2?.guid &&
    opr1?.guid &&
    opr2.guid === opr1.guid
  ) {
    return resolveOperator1Office(row);
  }
  if (
    opr2?.fullName &&
    opr1?.fullName &&
    opr2.fullName === opr1.fullName
  ) {
    return resolveOperator1Office(row);
  }
  return "";
};

const resolveClientNames = (client) => {
  if (!client) return { name: "", surname: "" };
  let name = client.name || client.firstName || client.first_name || "";
  let surname = client.surname || client.lastName || client.last_name || "";

  if (!name && !surname && client.fullName) {
    const parts = String(client.fullName).trim().split(/\s+/);
    if (parts.length > 1) {
      name = parts[0];
      surname = parts.slice(1).join(" ");
    } else {
      name = parts[0] || "";
    }
  }
  return {
    name: name ? String(extractText(name)).toUpperCase() : "",
    surname: surname ? String(extractText(surname)).toUpperCase() : "",
  };
};

const resolvePassport = (row) => {
  return (
    row.client?.passport_number ||
    row.client?.passportNumber ||
    row.client?.passport ||
    row.passport_number ||
    row.passport ||
    ""
  );
};

const resolvePCOI = (row) => {
  const val =
    row.client?.passportCountryOfIssue ||
    row.client?.passport_country ||
    row.client?.pcoi ||
    row.pcoi ||
    "";
  const text = extractText(val);
  return text ? String(text).toUpperCase() : "TURKMENISTAN";
};

const resolvePDOE = (row) => {
  const val =
    row.client?.passportExpiryDate ||
    row.client?.passport_expiry_date ||
    row.client?.pdoe ||
    row.pdoe ||
    "";
  return formatDate(val);
};

const resolveKassa = (row) => {
  const officeVal =
    row.office?.shortName ||
    row.office?.fullName ||
    row.office;
  const text = extractText(officeVal);
  return text ? String(text).toUpperCase() : "";
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
    { header: "#", key: "index_number", width: 8, align: "center" },
    { header: "DATE", key: "datetime", width: 13, align: "center" },
    { header: "OPERATOR", key: "assignment_operator", width: 22, align: "left" },
    { header: "OFIS", key: "assignment_office", width: 12, align: "center" },
    { header: "OP2", key: "receiver_operator", width: 22, align: "left" },
    { header: "OP2 OFIS", key: "receiver_office", width: 12, align: "center" },
    { header: "AGENT", key: "agent", width: 20, align: "left" },
    { header: "AGENT TEL", key: "agent_tel", width: 18, align: "center" },
    { header: "Name", key: "name", width: 18, align: "left" },
    { header: "Surname", key: "surname", width: 22, align: "left" },
    { header: "ÝOLAGÇY TEL", key: "passenger_tel", width: 18, align: "center" },
    { header: "DOB", key: "dob", width: 13, align: "center" },
    { header: "MILES & SMILES", key: "miles", width: 16, align: "center" },
    { header: "Passport ID", key: "passport", width: 15, align: "center" },
    { header: "PCOI", key: "pcoi", width: 16, align: "center" },
    { header: "PDOE", key: "pdoe", width: 13, align: "center" },
    { header: "STATUS", key: "status", width: 14, align: "center" },
    { header: "PNR", key: "pnr", width: 14, align: "center" },
    { header: "TICKET #", key: "ticket_number", width: 18, align: "center" },
    { header: "Route", key: "route", width: 20, align: "center" },
    { header: "Class", key: "class", width: 10, align: "center" },
    { header: "Flight Date", key: "flight_date", width: 14, align: "center" },
    { header: "TOTAL ($)", key: "total_price", width: 16, align: "right" },
    { header: "BASE FARE", key: "base_fare", width: 16, align: "right" },
    { header: "AYDYLAN BAHA", key: "quoted_price", width: 16, align: "right" },
    { header: "KABUL EDILDI", key: "accepted_price", width: 16, align: "right" },
    { header: "GAÝTARYLDY", key: "returned_price", width: 16, align: "right" },
    { header: "KASSA", key: "kassa", width: 12, align: "center" },
    { header: "BELLIK", key: "note", width: 20, align: "left" },
  ];

  const totalColIdx = columnsConfig.findIndex((c) => c.key === "total_price");
  const baseFareColIdx = columnsConfig.findIndex((c) => c.key === "base_fare");
  const quotedColIdx = columnsConfig.findIndex((c) => c.key === "quoted_price");
  const acceptedColIdx = columnsConfig.findIndex((c) => c.key === "accepted_price");
  const returnedColIdx = columnsConfig.findIndex((c) => c.key === "returned_price");
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
      color: { argb: idx === baseFareColIdx ? "FFDC2626" : "FF000000" },
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

  // Enable AutoFilter on row 4
  worksheet.autoFilter = {
    from: { row: START_ROW, column: START_COL },
    to: { row: START_ROW, column: END_COL },
  };

  // Currency format: $ 520.00; $ -520.00; $  -
  const currencyNumFmt = '"$ " #,##0.00;"$ " -#,##0.00;"$  -"';

  let sumTotal = 0;
  let sumBase = 0;
  let sumQuoted = 0;
  let sumAccepted = 0;
  let sumReturned = 0;

  // Populate Data Rows (starting from Row 5)
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

    const clientNames = resolveClientNames(row.client);
    const passport = resolvePassport(row);

    const rowData = [
      offset + 1,
      formatDate(row.datetime),
      resolveOperator1(row),
      resolveOperator1Office(row),
      resolveOperator2(row),
      resolveOperator2Office(row),
      row.agent?.name ? String(extractText(row.agent.name)).toUpperCase() : "",
      row.agent?.phone_number ? String(row.agent.phone_number).trim() : "",
      clientNames.name,
      clientNames.surname,
      row.client?.phone_number || row.client?.phoneNumber || "",
      formatDate(row.client?.dateOfBirth || row.client?.dob),
      row.milesSmiles || "",
      passport ? String(passport).toUpperCase() : "",
      resolvePCOI(row),
      resolvePDOE(row),
      getStatusKey(row).toUpperCase(),
      row.pnr ? String(row.pnr).toUpperCase() : "",
      row.ticket_number ? String(row.ticket_number) : "",
      row.route ? String(row.route).toUpperCase() : "",
      row.class ? String(row.class).toUpperCase() : "",
      formatDate(row.flight_date),
      totalPrice,
      baseFare,
      quotedPrice,
      acceptedPrice !== null ? acceptedPrice : "",
      returnedPrice !== null ? returnedPrice : "",
      resolveKassa(row),
      row.note || "",
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

      // Cell borders
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

      // Red font color for BASE FARE
      if (idx === baseFareColIdx) {
        cell.font = { name: "Calibri", size: 10, color: { argb: "FFDC2626" } };
      }

      // Currency formatting for financial columns
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

  // Total Row at the bottom
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

  // Label "Total" in Column D (START_COL)
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
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFDC2626" } };
        }
      }
    });

    // BELLIK cell displays $ - in total row as shown in Image 1
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
