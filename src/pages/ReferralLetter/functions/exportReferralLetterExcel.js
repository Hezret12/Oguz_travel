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

const bgnDepartureOf = (row) => String(row.bgn_departure || row.tranzit || "").trim();

// Printed 7-digit form; only a plain 7-digit serial sorts by number, anything
// else (empty, malformed) goes after them.
const yhSortKey = (row) => {
  const yh = formatYhNumber(row.travel_document_number);
  return /^[0-9]{7}$/.test(yh) ? yh : null;
};

const collator = new Intl.Collator("tk", { sensitivity: "base", numeric: true });

// Empty values last; ties keep a stable, meaningful order via the fallbacks.
const compareBy = (...keys) => (a, b) => {
  for (const key of keys) {
    const x = key(a);
    const y = key(b);
    if (!x && !y) continue;
    if (!x) return 1;
    if (!y) return -1;
    const diff = collator.compare(x, y);
    if (diff) return diff;
  }
  return 0;
};

const departureKey = (row) => String(row.departure_date || "").slice(0, 10);

// Sheet 1 — by BGN departure (then ÝH №); sheet 2 — by ÝH № (then BGN departure).
const SHEETS = [
  { name: "BGN Gidiş boýunça", compare: compareBy(bgnDepartureOf, yhSortKey, departureKey) },
  { name: "S-ÝH № boýunça", compare: compareBy(yhSortKey, bgnDepartureOf, departureKey) },
];

/**
 * Two sheets of the same letters: one sorted by BGN departure, one by the ÝH
 * (travel document) number. Numbering (T/b) restarts at 1 on each sheet.
 */
export const exportReferralLetterExcel = async (letters = [], options = {}) => {
  const fileName = options.fileName || "Ýollanma_Hatlary_Hasabaty";
  const header = {
    dateText: options.dateText || resolveDateText(letters, options),
    titleBanner: options.titleBanner,
  };

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();

  for (const sheet of SHEETS) {
    addLetterSheet(workbook, sheet.name, [...letters].sort(sheet.compare), header);
  }

  // Export buffer & download
  const buffer = await workbook.xlsx.writeBuffer();
  const cleanFileName = `${fileName}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, cleanFileName);
};

function addLetterSheet(workbook, sheetName, letters, { dateText, titleBanner }) {
  const worksheet = workbook.addWorksheet(sheetName.substring(0, 31), {
    views: [{ state: "frozen", ySplit: 4, showGridLines: true }],
  });

  const START_ROW = 4;
  const START_COL = 4; // Column D

  // Margins: columns A, B, C width 4
  worksheet.getColumn(1).width = 4;
  worksheet.getColumn(2).width = 4;
  worksheet.getColumn(3).width = 4;

  // Same columns, order and header texts as the paper report
  // ("Çykyş syýahat hasabat"), plus the contract date at the end.
  const columnsConfig = [
    { header: "T/b", key: "index_number", width: 8, align: "center" },
    { header: "Syýahatçynyň F.A.A.a.", key: "client_name", width: 34, align: "left" },
    { header: "Jynsy", key: "gender", width: 10, align: "center" },
    { header: "Doglan senesi", key: "dob", width: 14, align: "center" },
    { header: "Pasportynyň seriýasy we belgisi", key: "passport", width: 18, align: "center" },
    { header: "Gidýän ýurdy", key: "destination_country", width: 16, align: "center" },
    { header: "Syýahat ýolhatynyň №", key: "travel_doc", width: 16, align: "center" },
    { header: "Gidýän wagty", key: "departure_date", width: 14, align: "center" },
    { header: "Gelýän wagty", key: "return_date", width: 14, align: "center" },
    { header: "BGN gidiş", key: "bgn_departure", width: 16, align: "center" },
    { header: "BGN geliş", key: "bgn_arrival", width: 16, align: "center" },
    { header: "Syýahat operator/agent", key: "operator", width: 25, align: "center" },
    { header: "TMT", key: "price", width: 16, align: "right" },
    { header: "Şertnama senesi", key: "contract_date", width: 16, align: "center" },
  ];

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
  headerRow.height = 32;

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

  // The column header already says TMT, so the amount is shown as a plain number.
  const currencyNumFmt = "#,##0.00";

  // One style object per column, shared by all its cells: with thousands of
  // rows, fresh font/border objects per cell cost hundreds of MB.
  const thinBorder = { style: "thin", color: { argb: "FF000000" } };
  const border = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
  const cellStyles = columnsConfig.map((col) => ({
    font: { name: "Times New Roman", size: 10, bold: col.key === "operator", color: { argb: "FF000000" } },
    alignment: { vertical: "middle", horizontal: col.align },
    border,
    ...(col.key === "price" ? { numFmt: currencyNumFmt } : {}),
  }));

  // Data rows
  letters.forEach((row, offset) => {
    const rowIndex = START_ROW + 1 + offset;
    const currentRow = worksheet.getRow(rowIndex);
    currentRow.height = 20;

    const price = Number(row.price || 0);

    const clientName = row.client?.fullName ? String(row.client.fullName) : "";

    // Values keyed by column key — order comes from columnsConfig
    const values = {
      index_number: offset + 1,
      client_name: clientName,
      gender: formatGender(row.client?.gender),
      dob: formatDate(row.client?.dateOfBirth),
      passport: row.client?.passport_number
        ? String(row.client.passport_number).toUpperCase()
        : "",
      // The sheet is in Turkmen; older letters only have the free-text country.
      destination_country: String(
        row.refferalCountry?.name?.tk || row.destination_country || "",
      ).trim(),
      bgn_departure: bgnDepartureOf(row),
      bgn_arrival: row.bgn_arrival ? String(row.bgn_arrival).trim() : "",
      travel_doc: formatYhNumber(row.travel_document_number),
      departure_date: formatDate(row.departure_date),
      return_date: formatDate(row.return_date),
      price,
      operator: '"Oguzabat" HJ',
      contract_date: formatDate(row.contract_date),
    };

    const rowData = columnsConfig.map((col) => values[col.key] ?? "");

    rowData.forEach((val, idx) => {
      const cell = currentRow.getCell(START_COL + idx);
      cell.value = val;
      cell.style = cellStyles[idx];
    });
  });

  // Filter dropdowns on the header row, as in the paper report.
  worksheet.autoFilter = {
    from: { row: START_ROW, column: START_COL },
    to: { row: START_ROW + Math.max(letters.length, 1), column: END_COL },
  };
}
