import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";


export const formatExcelDate = (val) => {
  if (!val) return "";
  const d = dayjs(val);
  return d.isValid() ? d.format("DD.MM.YYYY") : String(val);
};

export const extractExcelText = (val, lang = "tk") => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object") {
    return val[lang] || val.fullName || val.name || val.shortName || val.title || "";
  }
  return String(val);
};


export const fetchAllPaginatedData = async (
  apiFn,
  filterParams = {},
  onProgress = null,
  pageSize = 100
) => {
  // Strip any page / limit from filterParams so they don't override pagination
  const cleanFilterParams = { ...filterParams };
  delete cleanFilterParams.page;
  delete cleanFilterParams.limit;
  delete cleanFilterParams.pageSize;

  // 1. Fetch First Page
  const firstRes = await apiFn({ ...cleanFilterParams, page: 1, limit: pageSize });
  const firstBody = firstRes?.data;

  let allItems = [];
  if (Array.isArray(firstBody?.data?.data)) {
    allItems = [...firstBody.data.data];
  } else if (Array.isArray(firstBody?.data)) {
    allItems = [...firstBody.data];
  } else if (Array.isArray(firstBody?.items)) {
    allItems = [...firstBody.items];
  } else if (Array.isArray(firstBody)) {
    allItems = [...firstBody];
  }

  const totalItems =
    firstBody?.data?.totalItems ??
    firstBody?.totalItems ??
    firstBody?.meta?.totalItems ??
    firstBody?.data?.meta?.totalItems ??
    allItems.length;

  const pageSizeEffective = allItems.length > 0 ? allItems.length : pageSize;

  let totalPages =
    firstBody?.data?.totalPages ??
    firstBody?.totalPages ??
    firstBody?.meta?.totalPages ??
    firstBody?.data?.meta?.totalPages;

  if (!totalPages || (totalItems > allItems.length && totalPages <= 1)) {
    totalPages = Math.ceil(totalItems / pageSizeEffective);
  } else if (totalItems > 0 && pageSizeEffective > 0) {
    totalPages = Math.max(totalPages, Math.ceil(totalItems / pageSizeEffective));
  } else {
    totalPages = 1;
  }

  if (onProgress) {
    onProgress(Math.min(allItems.length, totalItems), totalItems);
  }

  // If all data fits in page 1
  if (totalPages <= 1 || allItems.length >= totalItems) {
    return allItems;
  }

  // 2. Fetch remaining pages (2 to totalPages) in parallel chunks of 5
  const remainingPages = [];
  for (let p = 2; p <= totalPages; p++) {
    remainingPages.push(p);
  }

  const CHUNK_SIZE = 5;
  for (let i = 0; i < remainingPages.length; i += CHUNK_SIZE) {
    const pageChunk = remainingPages.slice(i, i + CHUNK_SIZE);
    const chunkPromises = pageChunk.map((p) =>
      apiFn({ ...cleanFilterParams, page: p, limit: pageSizeEffective })
    );

    const chunkResponses = await Promise.all(chunkPromises);

    chunkResponses.forEach((res) => {
      const body = res?.data;
      let pageItems = [];
      if (Array.isArray(body?.data?.data)) pageItems = body.data.data;
      else if (Array.isArray(body?.data)) pageItems = body.data;
      else if (Array.isArray(body?.items)) pageItems = body.items;
      else if (Array.isArray(body)) pageItems = body;

      allItems.push(...pageItems);
    });

    if (onProgress) {
      onProgress(Math.min(allItems.length, totalItems), totalItems);
    }
  }

  // Deduplicate by guid/id if available
  const seen = new Set();
  const dedupedItems = [];
  for (const item of allItems) {
    const key = item?.guid || item?.id;
    if (key) {
      if (!seen.has(key)) {
        seen.add(key);
        dedupedItems.push(item);
      }
    } else {
      dedupedItems.push(item);
    }
  }

  return dedupedItems;
};


export const exportStyledExcelFile = async ({
  titleBanner = null,
  rightHeader = null,
  columns = [],
  data = [],
  fileName = "Export",
  sheetName = "Hasabat",
}) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Eksport etmek üçin maglumat tapylmady");
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName.substring(0, 31), {
    views: [{ showGridLines: true }],
  });

  const thinBorder = {
    top: { style: "thin", color: { argb: "FF000000" } },
    left: { style: "thin", color: { argb: "FF000000" } },
    bottom: { style: "thin", color: { argb: "FF000000" } },
    right: { style: "thin", color: { argb: "FF000000" } },
  };

  let startRowIndex = 1;

  // Title Banner
  if (titleBanner) {
    const titleRow = worksheet.getRow(1);
    titleRow.height = 28;

    // Put title across columns
    worksheet.mergeCells(1, 1, 1, Math.max(columns.length, 12));
    const titleCell = worksheet.getCell("A1");
    titleCell.value = titleBanner;
    titleCell.font = { name: "Times New Roman", size: 11, bold: true };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    if (rightHeader) {
      const rightRow = worksheet.getRow(2);
      rightRow.height = 18;
      const rightCell = worksheet.getCell(2, Math.max(columns.length, 12));
      rightCell.value = rightHeader;
      rightCell.font = { name: "Times New Roman", size: 10, italic: true };
      rightCell.alignment = { vertical: "middle", horizontal: "right" };
    }

    startRowIndex = 3;
  }

  // Header Row
  const headerRow = worksheet.getRow(startRowIndex);
  headerRow.height = 26;

  columns.forEach((col, colIdx) => {
    const cell = headerRow.getCell(colIdx + 1);
    cell.value = col.header;
    cell.font = { name: "Times New Roman", size: 10, bold: true };
    cell.alignment = {
      vertical: "middle",
      horizontal: col.align || "center",
      wrapText: true,
    };
    cell.border = thinBorder;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF2F2F2" },
    };
  });

  // Set column widths
  worksheet.columns = columns.map((col) => ({
    width: col.width || 15,
  }));

  // Data Rows
  data.forEach((rowItem, rowOffset) => {
    const currentRow = worksheet.getRow(startRowIndex + 1 + rowOffset);
    currentRow.height = 20;

    columns.forEach((col, colIdx) => {
      const cell = currentRow.getCell(colIdx + 1);
      const rawValue = col.accessor ? col.accessor(rowItem, rowOffset) : rowItem[col.key];

      cell.value = rawValue != null ? rawValue : "";
      cell.font = { name: "Times New Roman", size: 9.5 };
      cell.alignment = {
        vertical: "middle",
        horizontal: col.align || "center",
      };
      cell.border = thinBorder;
    });
  });

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const cleanFileName = `${fileName.replace(/[^a-zA-Z0-9_\-\u0400-\u04FF\u00C0-\u017F]/g, "_")}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, cleanFileName);
};
