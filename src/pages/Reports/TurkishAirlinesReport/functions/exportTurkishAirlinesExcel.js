import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const TK_MONTHS = [
  "Ýanwar",
  "Fewral",
  "Mart",
  "Aprel",
  "Maý",
  "Iýun",
  "Iýul",
  "Awgust",
  "Sentýabr",
  "Oktýabr",
  "Noýabr",
  "Dekabr",
];

const formatMoneyDisplay = (val) => {
  if (val === undefined || val === null || val === "" || Number.isNaN(Number(val)) || Number(val) === 0) {
    return "$  -";
  }
  const num = Number(val);
  return `$ ${num.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const exportTurkishAirlinesExcel = async ({
  selectedDate,
  daysInMonth,
  offices = [],
  rows = [],
  grandTotal = {},
  findFooter,
}) => {
  const d = dayjs.isDayjs(selectedDate) ? selectedDate : dayjs(selectedDate);
  const validDate = d.isValid() ? d : dayjs();
  const monthNameTk = TK_MONTHS[validDate.month()] || "Awgust";
  const yearStr = validDate.format("YYYY");

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZ_TRAVEL";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(
    `Turkish_Airlines_${validDate.format("MM_YYYY")}`,
    {
      views: [{ showGridLines: true }],
    }
  );

  const startRow = 5;
  const startCol = 5; // Column E (5x5 start)

  // Border generator with outer table boundary and single footer border
  const getTableBorder = (isHeader, isFooter, isFirstCol, isLastCol) => ({
    top: isHeader
      ? { style: "medium", color: { argb: "FF333333" } }
      : isFooter
      ? { style: "medium", color: { argb: "FF333333" } }
      : { style: "thin", color: { argb: "FFCCCCCC" } },
    bottom: isFooter
      ? { style: "medium", color: { argb: "FF333333" } }
      : isHeader
      ? { style: "medium", color: { argb: "FF666666" } }
      : { style: "thin", color: { argb: "FFCCCCCC" } },
    left: isFirstCol
      ? { style: "medium", color: { argb: "FF333333" } }
      : { style: "thin", color: { argb: "FFCCCCCC" } },
    right: isLastCol
      ? { style: "medium", color: { argb: "FF333333" } }
      : { style: "thin", color: { argb: "FFCCCCCC" } },
  });

  const titleBorder = {
    top: { style: "medium", color: { argb: "FF0D9488" } },
    left: { style: "medium", color: { argb: "FF0D9488" } },
    bottom: { style: "medium", color: { argb: "FF0D9488" } },
    right: { style: "medium", color: { argb: "FF0D9488" } },
  };

  // Build Column Definitions
  const columns = [
    { key: "date", header: "DATE", width: 14, align: "center" },
    { key: "total_quoted", header: "JEMI", width: 16, align: "right", isTotal: true },
    { key: "total_base", header: "JEMI BF", width: 16, align: "right", isBf: true, isTotal: true },
  ];

  offices.forEach(({ short }) => {
    const upper = String(short || "").toUpperCase();
    columns.push({
      key: `${short}_quoted`,
      officeShort: short,
      header: upper,
      width: 15,
      align: "right",
      isQuoted: true,
    });
    columns.push({
      key: `${short}_base`,
      officeShort: short,
      header: `${upper} BF`,
      width: 15,
      align: "right",
      isBf: true,
    });
  });

  const numCols = columns.length;
  const endCol = startCol + numCols - 1;

  for (let c = 1; c < startCol; c++) {
    worksheet.getColumn(c).width = 4;
  }
  columns.forEach((col, idx) => {
    worksheet.getColumn(startCol + idx).width = col.width || 15;
  });

  const titleText = `Türk howa ýollary ${monthNameTk} ${yearStr} Hasabaty`;
  worksheet.mergeCells(2, startCol, 3, endCol);
  const titleCell = worksheet.getCell(2, startCol);
  titleCell.value = titleText;
  titleCell.font = {
    name: "Calibri",
    size: 14,
    bold: true,
    color: { argb: "FF0F766E" },
  };
  titleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF0FDFA" },
  };

  for (let r = 2; r <= 3; r++) {
    for (let c = startCol; c <= endCol; c++) {
      worksheet.getCell(r, c).border = titleBorder;
    }
  }

  // 2. Header Row at Row 5 (5x5 start)
  const headerRow = worksheet.getRow(startRow);
  headerRow.height = 26;

  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(startCol + idx);
    const isFirstCol = idx === 0;
    const isLastCol = idx === numCols - 1;

    cell.value = col.header;
    cell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: col.isBf ? "FFDC2626" : "FF000000" },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8FAFC" },
    };
    cell.border = getTableBorder(true, false, isFirstCol, isLastCol);
  });

  const numDays = daysInMonth || validDate.daysInMonth();

  for (let i = 0; i < numDays; i++) {
    const dayNum = i + 1;
    const isEvenDay = dayNum % 2 === 0;
    const rowBgColor = isEvenDay ? "FFD9D9D9" : "FFFFFFFF";
    const dayDate = validDate.date(dayNum).format("DD.MM.YYYY");
    const rowData = rows[i] || { day: dayNum, total: 0, totalBase: 0 };
    const currentRowIndex = startRow + 1 + i;
    const excelRow = worksheet.getRow(currentRowIndex);
    excelRow.height = 20;

    columns.forEach((col, colIdx) => {
      const cell = excelRow.getCell(startCol + colIdx);
      const isFirstCol = colIdx === 0;
      const isLastCol = colIdx === numCols - 1;

      cell.border = getTableBorder(false, false, isFirstCol, isLastCol);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rowBgColor },
      };

      if (col.key === "date") {
        cell.value = dayDate;
        cell.font = { name: "Calibri", size: 9.5, bold: false, color: { argb: "FF333333" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else if (col.key === "total_quoted") {
        const val = Number(rowData.total || 0);
        cell.value = formatMoneyDisplay(val);
        cell.font = {
          name: "Calibri",
          size: 9.5,
          bold: val > 0,
          color: { argb: "FF000000" },
        };
        cell.alignment = { vertical: "middle", horizontal: "right" };
      } else if (col.key === "total_base") {
        const val = Number(rowData.totalBase || 0);
        cell.value = formatMoneyDisplay(val);
        cell.font = {
          name: "Calibri",
          size: 9.5,
          bold: false,
          color: { argb: "FFDC2626" },
        };
        cell.alignment = { vertical: "middle", horizontal: "right" };
      } else if (col.isQuoted) {
        const officeVal = rowData[col.officeShort];
        const val = typeof officeVal === "object" ? Number(officeVal?.quoted || 0) : Number(officeVal || 0);
        cell.value = formatMoneyDisplay(val);
        cell.font = {
          name: "Calibri",
          size: 9.5,
          bold: false,
          color: { argb: "FF000000" },
        };
        cell.alignment = { vertical: "middle", horizontal: "right" };
      } else if (col.isBf) {
        const officeVal = rowData[col.officeShort];
        const val = typeof officeVal === "object" ? Number(officeVal?.base || 0) : 0;
        cell.value = formatMoneyDisplay(val);
        cell.font = {
          name: "Calibri",
          size: 9.5,
          bold: false,
          color: { argb: "FFDC2626" },
        };
        cell.alignment = { vertical: "middle", horizontal: "right" };
      }
    });
  }

  // 4. Grand Total Row (Bottom Summary)
  const totalRowIndex = startRow + 1 + numDays;
  const totalRow = worksheet.getRow(totalRowIndex);
  totalRow.height = 24;

  const grandQuoted =
    Number(grandTotal.month_total_quoted ?? grandTotal.total_quoted) ||
    rows.reduce((acc, curr) => acc + Number(curr.total || 0), 0);

  const grandBase =
    Number(grandTotal.month_total_base ?? grandTotal.total_base) ||
    rows.reduce((acc, curr) => acc + Number(curr.totalBase || 0), 0);

  columns.forEach((col, colIdx) => {
    const cell = totalRow.getCell(startCol + colIdx);
    const isFirstCol = colIdx === 0;
    const isLastCol = colIdx === numCols - 1;

    cell.border = getTableBorder(false, true, isFirstCol, isLastCol);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFFFF" },
    };

    if (col.key === "date") {
      cell.value = "";
      cell.alignment = { vertical: "middle", horizontal: "center" };
    } else if (col.key === "total_quoted") {
      cell.value = formatMoneyDisplay(grandQuoted);
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF000000" } };
      cell.alignment = { vertical: "middle", horizontal: "right" };
    } else if (col.key === "total_base") {
      cell.value = formatMoneyDisplay(grandBase);
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFDC2626" } };
      cell.alignment = { vertical: "middle", horizontal: "right" };
    } else if (col.isQuoted) {
      const f = findFooter ? findFooter(col.officeShort) : null;
      const val =
        Number(f?.total_quoted ?? f?.quoted_price_sum) ||
        rows.reduce((acc, r) => {
          const v = r[col.officeShort];
          return acc + (typeof v === "object" ? Number(v?.quoted || 0) : Number(v || 0));
        }, 0);
      cell.value = formatMoneyDisplay(val);
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF000000" } };
      cell.alignment = { vertical: "middle", horizontal: "right" };
    } else if (col.isBf) {
      const f = findFooter ? findFooter(col.officeShort) : null;
      const val =
        Number(f?.total_base ?? f?.base_fare_sum) ||
        rows.reduce((acc, r) => {
          const v = r[col.officeShort];
          return acc + (typeof v === "object" ? Number(v?.base || 0) : 0);
        }, 0);
      cell.value = formatMoneyDisplay(val);
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFDC2626" } };
      cell.alignment = { vertical: "middle", horizontal: "right" };
    }
  });

  // Export buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `Turk_howa_yollary_${monthNameTk}_${yearStr}_Hasabaty.xlsx`;
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, fileName);
};
