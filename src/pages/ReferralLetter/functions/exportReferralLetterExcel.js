import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { formatYhNumber } from "../../../functions/yhNumber";

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
  if (g === "male" || g === "erkek") return "erkek";
  if (g === "female" || g === "aýal" || g === "ayal") return "aýal";
  return g;
};

const getOfficeName = (office) => {
  if (!office) return "";
  if (typeof office === "string") return office.trim();
  if (office.shortName?.tk) return String(office.shortName.tk).trim();
  if (office.fullName?.tk) return String(office.fullName.tk).trim();
  if (typeof office.shortName === "string" && office.shortName) return office.shortName.trim();
  if (typeof office.fullName === "string" && office.fullName) return office.fullName.trim();
  if (office.shortName?.en) return String(office.shortName.en).trim();
  if (office.fullName?.en) return String(office.fullName.en).trim();
  if (office.shortName?.ru) return String(office.shortName.ru).trim();
  if (office.fullName?.ru) return String(office.fullName.ru).trim();
  if (office.name) return String(office.name).trim();
  if (office.title) return String(office.title).trim();
  return "";
};

const resolveOfficeName = (row) => {
  const opr = row.received_opr;
  const office = row.office || opr?.office;
  return getOfficeName(office);
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

const resolveDateText = (letters = [], options = {}) => {
  let years = [];

  const startD =
    options.start_date ||
    options.queryParams?.start_date ||
    options.queryParams?.start_departure_date ||
    options.queryParams?.start_contract_date;
  const endD =
    options.end_date ||
    options.queryParams?.end_date ||
    options.queryParams?.end_departure_date ||
    options.queryParams?.end_contract_date;

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
  return years.length === 1
    ? `${years[0]}${suffix} ýylyň DOWAMYNDA`
    : `${years.join("-")}${suffix} ýyllaryň DOWAMYNDA`;
};

export const exportReferralLetterExcel = async (letters = [], options = {}) => {
  const fileName = options.fileName || "Ýollanma_Hatlary_Hasabaty";
  const sheetName = options.sheetName || "Ýollanma Hatlary";
  const dateText = options.dateText || resolveDateText(letters, options);
  const titleBanner = options.titleBanner;

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
    { header: "T/b", key: "index_number", width: 8, align: "center" },
    { header: "Arza №", key: "application_number", width: 14, align: "center" },
    { header: "Ofis", key: "office", width: 14, align: "center" },
    { header: "Syýahatçynyň F.A.A.a.", key: "client_name", width: 34, align: "left" },
    { header: "Jynsy", key: "gender", width: 12, align: "center" },
    { header: "Doglan senesi", key: "dob", width: 16, align: "center" },
    {
      header: "Pasport №",
      key: "passport",
      width: 18,
      align: "center",
      note: "Pasportynyň seriýasy we belgisi",
    },
    {
      header: "Gidýän ýurdy",
      key: "destination_country",
      width: 18,
      align: "center",
      note: "Gidýän Ýurdy",
    },
    {
      header: "BGN Gidiş",
      key: "bgn_departure",
      width: 16,
      align: "center",
      note: "BGN Gidiş",
    },
    {
      header: "S-ÝH №",
      key: "travel_doc",
      width: 18,
      align: "center",
      note: "Syýahat ýolhatynyň №",
    },
    { header: "Gidýän wagty", key: "departure_date", width: 16, align: "center" },
    { header: "Gelýän wagty", key: "return_date", width: 16, align: "center" },
    { header: "Bahasy (TMT)", key: "price", width: 18, align: "right" },
    { header: "Operator", key: "operator", width: 16, align: "center" },
    { header: "AGENT", key: "agent_name", width: 18, align: "left" },
    { header: "şertnama №", key: "contract_number", width: 16, align: "center" },
    { header: "şertnama sene", key: "contract_date", width: 16, align: "center" },
  ];

  const priceColIdx = columnsConfig.findIndex((c) => c.key === "price");

  // Set column widths
  columnsConfig.forEach((col, idx) => {
    worksheet.getColumn(START_COL + idx).width = col.width;
  });

  const END_COL = START_COL + columnsConfig.length - 1;

  // Row 1: top margin row
  worksheet.getRow(1).height = 12;

  // Row 2: Title Banner Row merged across table columns
  const titleRow = worksheet.getRow(2);
  titleRow.height = 30;
  worksheet.mergeCells(2, START_COL, 2, END_COL);
  const titleCell = worksheet.getCell(2, START_COL);

  if (titleBanner) {
    titleCell.value = titleBanner;
    titleCell.font = {
      name: "Times New Roman",
      size: 11,
      bold: true,
      color: { argb: "FF000000" },
    };
  } else {
    titleCell.value = {
      richText: [
        {
          text: 'OGUZABAT Hojalyk Jemgyýetiniň "OGUZTRAVEL" syýahatçylyk bölümi tarapyndan ',
          font: {
            name: "Times New Roman",
            size: 11,
            bold: true,
            color: { argb: "FF000000" },
          },
        },
        {
          text: dateText,
          font: {
            name: "Times New Roman",
            size: 11,
            bold: true,
            color: { argb: "FFFF0000" }, // Red date as in user reference
          },
        },
        {
          text: " daşary ýurtlara ugradylan syýahatçylar baradaky hasabat",
          font: {
            name: "Times New Roman",
            size: 11,
            bold: true,
            color: { argb: "FF000000" },
          },
        },
      ],
    };
  }

  titleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };

  // Row 3: spacing row
  worksheet.getRow(3).height = 12;

  // Header Row (Row 4)
  const headerRow = worksheet.getRow(START_ROW);
  headerRow.height = 28;

  columnsConfig.forEach((col, idx) => {
    const colNumber = START_COL + idx;
    const cell = headerRow.getCell(colNumber);
    cell.value = col.header;
    cell.font = {
      name: "Times New Roman",
      size: 10,
      bold: true,
      color: { argb: "FF000000" },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };

    if (col.note) {
      cell.note = {
        texts: [
          {
            text: col.note,
            font: {
              name: "Tahoma",
              size: 9,
              bold: true,
            },
          },
        ],
      };
    }
  });

  const currencyNumFmt = '#,##0.00" TMT"';

  // Data rows
  letters.forEach((row, offset) => {
    const rowIndex = START_ROW + 1 + offset;
    const currentRow = worksheet.getRow(rowIndex);
    currentRow.height = 20;

    const price = Number(row.price || 0);

    const clientName = row.client?.fullName ? String(row.client.fullName) : "";

    const agentName = row.agent?.name
      ? String(row.agent.name).trim()
      : typeof row.agent === "string"
      ? row.agent.trim()
      : "";

    const rowData = [
      row.index_number ?? offset + 1,
      row.application_number ? String(row.application_number).trim() : "",
      resolveOfficeName(row),
      clientName,
      formatGender(row.client?.gender),
      formatDate(row.client?.dateOfBirth),
      row.client?.passport_number ? String(row.client.passport_number).toUpperCase() : "",
      row.destination_country ? String(row.destination_country).trim() : "",
      row.bgn_departure ? String(row.bgn_departure).trim() : (row.tranzit ? String(row.tranzit).trim() : ""),
      formatYhNumber(row.travel_document_number),
      formatDate(row.departure_date),
      formatDate(row.return_date),
      price,
      "Oguzabat",
      agentName,
      row.contract_number ? String(row.contract_number).trim() : "",
      formatDate(row.contract_date),
    ];

    rowData.forEach((val, idx) => {
      const colNumber = START_COL + idx;
      const cell = currentRow.getCell(colNumber);
      cell.value = val;
      cell.font = {
        name: "Times New Roman",
        size: 10,
        bold: columnsConfig[idx].key === "operator",
        color: { argb: "FF000000" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: columnsConfig[idx].align,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };

      // Numerical formatting for price with currency suffix
      if (idx === priceColIdx && typeof val === "number") {
        cell.numFmt = currencyNumFmt;
      }
    });
  });

  // Export buffer & download
  const buffer = await workbook.xlsx.writeBuffer();
  const cleanFileName = `${fileName}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, cleanFileName);
};
