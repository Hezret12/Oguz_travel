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

const formatGender = (gender) => {
  if (!gender) return "";
  const g = String(gender).trim().toLowerCase();
  if (g === "male" || g === "erkek") return "Erkek";
  if (g === "female" || g === "aýal" || g === "ayal") return "Aýal";
  return String(gender).toUpperCase();
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

export const exportReferralLetterExcel = async (letters = [], options = {}) => {
  const fileName = options.fileName || "Yollanma_Hatlary_Hasabaty";
  const sheetName = options.sheetName || "Ýollanma Hatlary";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName.substring(0, 31), {
    views: [{ showGridLines: true }],
  });

  const START_ROW = 4;
  const START_COL = 4; // Column D

  // Margins: columns A, B, C width 4
  worksheet.getColumn(1).width = 4;
  worksheet.getColumn(2).width = 4;
  worksheet.getColumn(3).width = 4;

  // Padding rows: 1, 2, 3 height 15
  worksheet.getRow(1).height = 15;
  worksheet.getRow(2).height = 15;
  worksheet.getRow(3).height = 15;

  const columnsConfig = [
    { header: "T/B", key: "index_number", width: 8, align: "center" },
    { header: "Arza №", key: "application_number", width: 14, align: "center" },
    { header: "Operator", key: "operator", width: 22, align: "left" },
    { header: "Ofis", key: "office", width: 14, align: "center" },
    { header: "Syýahatçynyň F.A.A.", key: "client_name", width: 28, align: "left" },
    { header: "Telefon", key: "client_phone", width: 18, align: "center" },
    { header: "Jynsy", key: "gender", width: 12, align: "center" },
    { header: "Doglan senesi", key: "dob", width: 14, align: "center" },
    { header: "Passport №", key: "passport", width: 16, align: "center" },
    { header: "Gidýän ýurdy", key: "destination_country", width: 18, align: "center" },
    { header: "Tranzit", key: "tranzit", width: 14, align: "center" },
    { header: "S-ÝH №", key: "travel_doc", width: 16, align: "center" },
    { header: "Gidiş wagty", key: "departure_date", width: 14, align: "center" },
    { header: "Gelýän wagty", key: "return_date", width: 14, align: "center" },
    { header: "Bahasy", key: "price", width: 16, align: "right" },
    { header: "Walýuta", key: "currency", width: 12, align: "center" },
    { header: "Şertnama №", key: "contract_number", width: 16, align: "center" },
    { header: "Şertnama sene", key: "contract_date", width: 14, align: "center" },
    { header: "Agent", key: "agent_name", width: 20, align: "left" },
    { header: "Agent Tel", key: "agent_tel", width: 18, align: "center" },
    { header: "Bellik", key: "note", width: 24, align: "left" },
  ];

  const priceColIdx = columnsConfig.findIndex((c) => c.key === "price");

  // Set column widths
  columnsConfig.forEach((col, idx) => {
    worksheet.getColumn(START_COL + idx).width = col.width;
  });

  const END_COL = START_COL + columnsConfig.length - 1;
  const totalRowIndex = START_ROW + letters.length + 1;

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
    cell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: "FF000000" },
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

  const currencyNumFmt = '#,##0.00;-#,##0.00;"-"';
  let sumPrice = 0;

  // Data rows
  letters.forEach((row, offset) => {
    const rowIndex = START_ROW + 1 + offset;
    const currentRow = worksheet.getRow(rowIndex);
    currentRow.height = 20;

    const price = Number(row.price || 0);
    sumPrice += price;

    const operatorObj = row.refferaloperator || row.operator || row.received_opr;
    const operatorName = operatorObj?.fullName ? String(operatorObj.fullName).toUpperCase() : "";
    const officeName = getOfficeName(operatorObj?.office);

    const clientName = row.client?.fullName ? String(row.client.fullName).toUpperCase() : "";
    const clientPhone = row.client?.phone_number
      ? String(row.client.phone_number).trim()
      : row.yolagcyTel
      ? String(row.yolagcyTel).trim()
      : "";

    const agentName = row.agent?.name
      ? String(row.agent.name).toUpperCase()
      : typeof row.agent === "string"
      ? row.agent.toUpperCase()
      : "";
    const agentPhone = row.agent?.phone_number
      ? String(row.agent.phone_number).trim()
      : row.phone_number
      ? String(row.phone_number).trim()
      : "";

    const rowData = [
      row.index_number ?? offset + 1,
      row.application_number ? String(row.application_number).trim() : "",
      operatorName,
      officeName,
      clientName,
      clientPhone,
      formatGender(row.client?.gender),
      formatDate(row.client?.dateOfBirth),
      row.client?.passport_number ? String(row.client.passport_number).toUpperCase() : "",
      row.destination_country ? String(row.destination_country).toUpperCase() : "",
      row.tranzit ? String(row.tranzit).toUpperCase() : "",
      row.travel_document_number ? String(row.travel_document_number).toUpperCase() : "",
      formatDate(row.departure_date),
      formatDate(row.return_date),
      price,
      row.currency ? String(row.currency).toUpperCase() : "TMT",
      row.contract_number ? String(row.contract_number).trim() : "",
      formatDate(row.contract_date),
      agentName,
      agentPhone,
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

      // Cell borders with medium outer perimeter on START_COL and END_COL
      cell.border = {
        top: { style: "thin", color: { argb: "FFD9D9D9" } },
        bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
        left:
          colNumber === START_COL
            ? { style: "medium", color: { argb: "FF000000" } }
            : { style: "thin", color: { argb: "FFD9D9D9" } },
        right:
          colNumber === END_COL
            ? { style: "medium", color: { argb: "FF000000" } }
            : { style: "thin", color: { argb: "FFD9D9D9" } },
      };

      // Numerical formatting for price
      if (idx === priceColIdx && typeof val === "number") {
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

  const cellTotalLabel = totalRow.getCell(START_COL);
  cellTotalLabel.value = "Total";
  cellTotalLabel.alignment = { vertical: "middle", horizontal: "left" };

  const firstDataRow = START_ROW + 1;
  const lastDataRow = totalRowIndex - 1;

  if (letters.length > 0 && priceColIdx !== -1) {
    const colLetter = getExcelColName(START_COL + priceColIdx);
    const cellPrice = totalRow.getCell(START_COL + priceColIdx);
    cellPrice.value = {
      formula: `SUM(${colLetter}${firstDataRow}:${colLetter}${lastDataRow})`,
      result: sumPrice,
    };
    cellPrice.numFmt = currencyNumFmt;
  }

  // Export buffer & download
  const buffer = await workbook.xlsx.writeBuffer();
  const cleanFileName = `${fileName}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, cleanFileName);
};
