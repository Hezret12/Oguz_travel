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

const getTurkmenOrdinalSuffix = (year) => {
  const y = Number(year);
  const lastTwo = y % 100;
  if (lastTwo === 0) return "-nji";
  if (lastTwo % 10 === 0) {
    const backVowels = [30, 40, 60, 90];
    return backVowels.includes(lastTwo) ? "-njy" : "-nji";
  }
  const lastDigit = y % 10;
  return lastDigit === 6 || lastDigit === 9 ? "-njy" : "-nji";
};

const resolveTitleBanner = (letters = [], options = {}) => {
  let years = [];

  const startD = options.start_date || options.queryParams?.start_date;
  const endD = options.end_date || options.queryParams?.end_date;

  if (startD && endD) {
    const sY = dayjs(startD).year();
    const eY = dayjs(endD).year();
    if (sY && eY && sY <= eY) {
      if (eY - sY <= 5) {
        for (let y = sY; y <= eY; y++) {
          years.push(y);
        }
      } else {
        years = [sY, eY];
      }
    }
  } else if (startD) {
    const sY = dayjs(startD).year();
    if (sY) years.push(sY);
  } else if (endD) {
    const eY = dayjs(endD).year();
    if (eY) years.push(eY);
  }

  if (years.length === 0) {
    const yearsSet = new Set();
    letters.forEach((row) => {
      const raw =
        row.date_time ||
        row.datetime ||
        row.date ||
        row.departure_date ||
        row.contract_date ||
        row.createdAt ||
        row.created_at;
      if (raw) {
        const y = dayjs(raw).year();
        if (y && !isNaN(y) && y > 2000 && y < 2100) {
          yearsSet.add(y);
        }
      }
    });
    const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);
    if (sortedYears.length > 0) {
      const minY = sortedYears[0];
      const maxY = sortedYears[sortedYears.length - 1];
      if (maxY > minY && maxY - minY <= 5) {
        for (let y = minY; y <= maxY; y++) {
          years.push(y);
        }
      } else {
        years = sortedYears;
      }
    }
  }

  if (years.length === 0) {
    years = [dayjs().year()];
  }

  const lastYear = years[years.length - 1];
  const suffix = getTurkmenOrdinalSuffix(lastYear);
  const dateText =
    years.length === 1
      ? `${years[0]}${suffix} ýylyň DOWAMYNDA`
      : `${years.join("-")}${suffix} ýyllaryň DOWAMYNDA`;

  return `OGUZABAT Hojalyk Jemgyýetiniň "OGUZTRAVEL" syýahatçylyk bölümi tarapyndan ${dateText} daşary ýurtlara ugradylan syýahatçylar baradaky hasabat`;
};

export const exportReferralLetterExcel = async (letters = [], options = {}) => {
  const fileName = options.fileName || "Yollanma_Hatlary_Hasabaty";
  const sheetName = options.sheetName || "Ýollanma Hatlary";
  const titleBanner =
    options.titleBanner || resolveTitleBanner(letters, options);

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

  const columnsConfig = [
    { header: "T/B", key: "index_number", width: 8, align: "center" },
    { header: "Arza №", key: "application_number", width: 14, align: "center" },
    { header: "Ofis", key: "office", width: 14, align: "center" },
    { header: "Syýahatçynyň F.A.A.a", key: "client_name", width: 28, align: "left" },
    { header: "Jynsy", key: "gender", width: 12, align: "center" },
    { header: "Doglan senesi", key: "dob", width: 14, align: "center" },
    { header: "Passport №", key: "passport", width: 16, align: "center" },
    { header: "Gidýän ýurdy", key: "destination_country", width: 18, align: "center" },
    { header: "Tranzit", key: "tranzit", width: 14, align: "center" },
    { header: "S-ÝH №", key: "travel_doc", width: 16, align: "center" },
    { header: "Gidýän wagty", key: "departure_date", width: 14, align: "center" },
    { header: "Gelýän wagty", key: "return_date", width: 14, align: "center" },
    { header: "Bahasy (TMT)", key: "price", width: 16, align: "right" },
    { header: "Operator", key: "operator", width: 14, align: "center" },
    { header: "Agent", key: "agent_name", width: 20, align: "left" },
    { header: "Şertnama №", key: "contract_number", width: 16, align: "center" },
    { header: "Şertnama sene", key: "contract_date", width: 14, align: "center" },
  ];

  const priceColIdx = columnsConfig.findIndex((c) => c.key === "price");

  // Set column widths
  columnsConfig.forEach((col, idx) => {
    worksheet.getColumn(START_COL + idx).width = col.width;
  });

  const END_COL = START_COL + columnsConfig.length - 1;
  const totalRowIndex = START_ROW + letters.length + 1;

  // Row 1: top margin row
  worksheet.getRow(1).height = 12;

  // Row 2: Title Banner Row merged across table columns
  const titleRow = worksheet.getRow(2);
  titleRow.height = 34;
  worksheet.mergeCells(2, START_COL, 2, END_COL);
  const titleCell = worksheet.getCell(2, START_COL);
  titleCell.value = titleBanner;
  titleCell.font = {
    name: "Calibri",
    size: 11,
    bold: true,
    color: { argb: "FF000000" },
  };
  titleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };

  // Row 3: spacing row
  worksheet.getRow(3).height = 12;

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

    const clientName = row.client?.fullName ? String(row.client.fullName).toUpperCase() : "";

    const agentName = row.agent?.name
      ? String(row.agent.name).toUpperCase()
      : typeof row.agent === "string"
      ? row.agent.toUpperCase()
      : "";

    const rowData = [
      row.index_number ?? offset + 1,
      row.application_number ? String(row.application_number).trim() : "",
      "",
      clientName,
      formatGender(row.client?.gender),
      formatDate(row.client?.dateOfBirth),
      row.client?.passport_number ? String(row.client.passport_number).toUpperCase() : "",
      row.destination_country ? String(row.destination_country).toUpperCase() : "",
      row.tranzit ? String(row.tranzit).toUpperCase() : "",
      row.travel_document_number ? String(row.travel_document_number).toUpperCase() : "",
      formatDate(row.departure_date),
      formatDate(row.return_date),
      price,
      "Oguzabat",
      agentName,
      row.contract_number ? String(row.contract_number).trim() : "",
      formatDate(row.contract_date),
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
