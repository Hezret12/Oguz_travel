import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { fetchAllPaginatedData, formatExcelDate } from "../../../functions/excelExportHelper";
import {
  getAllHotelsApi,
  getAllAirwaysApi,
  getAllRailwaysApi,
  getAllToursApi,
  getAllTransfersApi,
  getAllPackagesApi,
} from "../../../api/queries/getters";

// Map service keys to APIs and sheet definitions
export const OUTBOUND_SERVICE_MAP = {
  hotel: {
    key: "hotel",
    labelKey: "outbound.hotel",
    sheetName: "Otel",
    apiFn: getAllHotelsApi,
  },
  airway: {
    key: "airway",
    labelKey: "outbound.airway",
    sheetName: "Howa ýollary",
    apiFn: getAllAirwaysApi,
  },
  railway: {
    key: "railway",
    labelKey: "outbound.railway",
    sheetName: "Demir ýol",
    apiFn: getAllRailwaysApi,
  },
  tour: {
    key: "tour",
    labelKey: "outbound.tour",
    sheetName: "Tur",
    apiFn: getAllToursApi,
  },
  transfer: {
    key: "transfer",
    labelKey: "outbound.transfer",
    sheetName: "Transfer",
    apiFn: getAllTransfersApi,
  },
  package: {
    key: "package",
    labelKey: "outbound.package",
    sheetName: "Bukja",
    apiFn: getAllPackagesApi,
  },
};

const ACCENT_RED = "FFDC2626"; // Crimson red (#DC2626) as used in TurkishAirlines & B2B
const ACCENT_GREEN = "FF166534"; // Deep emerald (#166534)
const CURRENCY_FMT = '"$ " #,##0.00;"$ " -#,##0.00;"$  -"';

const toSafeNumber = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getPaymentPillStyle = (val) => {
  if (!val) return null;
  const s = String(val).toLowerCase().trim();

  // 1. Gaýtaryldy / Refunded / Возврат (Rich Corporate Crimson Red)
  if (
    s.includes("gaýtaryldy") ||
    s.includes("gaytaryldy") ||
    s.includes("возврат") ||
    s.includes("refund") ||
    s === "3"
  ) {
    return {
      bg: "FFFEE2E2", // Soft rose/red tint (#FEE2E2)
      fg: "FFB91C1C", // Deep bold crimson red (#B91C1C)
      border: "FFF87171", // Defined red border (#F87171)
    };
  }

  // 2. Tölendi / Paid / Оплачено (Mint & Deep Emerald Green)
  if (
    s.includes("tölendi") ||
    s.includes("tolendi") ||
    s.includes("оплачено") ||
    s.includes("paid") ||
    s === "1" ||
    s === "true"
  ) {
    return {
      bg: "FFDCFCE7", // Soft mint (#DCFCE7)
      fg: "FF166534", // Deep emerald (#166534)
      border: "FF86EFAC", // Emerald border (#86EFAC)
    };
  }

  // 3. Kredit / Credit / Кредит (Warm Amber / Dark Orange)
  if (
    s.includes("kredit") ||
    s.includes("кредит") ||
    s.includes("credit") ||
    s === "2" ||
    s === "false" ||
    s === "0"
  ) {
    return {
      bg: "FFFEF3C7", // Soft amber tint (#FEF3C7)
      fg: "FFB45309", // Warm dark amber/orange (#B45309)
      border: "FFFCD34D", // Amber border (#FCD34D)
    };
  }

  return null;
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

const resolveText = (val, selectedLang) => {
  if (!val) return "";
  if (typeof val === "string") return val.trim();
  if (typeof val === "number") return String(val);
  if (typeof val === "object") {
    if (selectedLang && typeof selectedLang === "function") {
      const localized = selectedLang(val);
      if (localized) return String(localized).trim();
    }
    return String(val.tk || val.fullName || val.name || val.shortName || val.title || "").trim();
  }
  return String(val);
};

const resolveOffice = (row, selectedLang) => {
  const officeObj = row?.operator?.office || row?.office || row?.preparedOpr?.office;
  if (!officeObj) return "";
  const target = officeObj.shortName || officeObj.fullName || officeObj.name || officeObj;
  return resolveText(target, selectedLang).toUpperCase();
};

const resolveStaffName = (staff) => {
  if (!staff) return "";
  if (typeof staff === "string") return staff.trim().toUpperCase();
  return (staff.fullName || staff.name || "").toUpperCase();
};


const resolvePaymentStatus = (status, t) => {
  const num = Number(status);
  if (num === 1) return t ? t("outbound.paid") : "Tölendi";
  if (num === 2) return t ? t("outbound.credit") : "Kredit";
  if (num === 3) return t ? t("outbound.refunded") : "Gaýtaryldy";
  return status ? String(status) : "";
};

const resolveServiceDetail = (serviceKey, row) => {
  switch (serviceKey) {
    case "hotel": {
      const parts = [row.hotel_name, row.room_type, row.meal_plan].filter(Boolean);
      return parts.join(" - ").toUpperCase();
    }
    case "airway": {
      const parts = [
        row.ticket_number ? `№ ${row.ticket_number}` : null,
        row.route,
        row.ticket_type,
      ].filter(Boolean);
      return parts.join(" | ").toUpperCase();
    }
    case "railway": {
      const parts = [
        row.ticket_number ? `№ ${row.ticket_number}` : null,
        row.train_type,
        row.route,
      ].filter(Boolean);
      return parts.join(" | ").toUpperCase();
    }
    case "tour": {
      const parts = [row.tour_name, row.tour_type].filter(Boolean);
      return parts.join(" - ").toUpperCase();
    }
    case "transfer": {
      const parts = [row.transfer_type, row.machine_type, row.route].filter(Boolean);
      return parts.join(" | ").toUpperCase();
    }
    case "package": {
      const parts = [row.package_name, row.partner ? `[${row.partner}]` : null].filter(Boolean);
      return parts.join(" ").toUpperCase();
    }
    default:
      return "";
  }
};

// Computes visual character length accounting for Cyrillic and capital characters
const getVisualLength = (str) => {
  if (!str) return 0;
  const s = String(str);
  let len = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    // Cyrillic (0x0400-0x04FF) & uppercase letters take ~1.28x space in proportional fonts
    if ((code >= 0x0400 && code <= 0x04FF) || (s[i] >= "A" && s[i] <= "Z")) {
      len += 1.28;
    } else {
      len += 1;
    }
  }
  return len;
};

/**
 * Creates and formats a worksheet matching the TurkishAirlines & B2B design standard:
 * - Margins on Columns A, B, C (width 4)
 * - Row 2 Title Banner across table
 * - Row 4 Header with medium borders & autoFilter
 * - Alternating subtle zebra striping (White / #F3F4F6)
 * - Mint / Blush status badges
 * - Bottom Total Row with SUM formulas & medium borders
 */
const buildStyledSheet = ({
  workbook,
  sheetName,
  titleBanner,
  periodText,
  columns,
  data,
  t,
}) => {
  let safeSheetName = (sheetName || "Sheet").replace(/[:*?/\\[\]]/g, "_").substring(0, 31);
  let counter = 1;
  while (workbook.getWorksheet(safeSheetName)) {
    const suffix = `_${counter}`;
    safeSheetName = `${(sheetName || "Sheet").substring(0, 31 - suffix.length)}${suffix}`;
    counter++;
  }
  const worksheet = workbook.addWorksheet(safeSheetName, {
    views: [{ showGridLines: true }],
  });

  const START_ROW = 4;
  const START_COL = 4; // Column D (matches TurkishAirlines & B2B standard)
  const END_COL = START_COL + columns.length - 1;
  const totalRowIndex = START_ROW + data.length + 1;

  // Margin Columns A, B, C (width 4)
  worksheet.getColumn(1).width = 4;
  worksheet.getColumn(2).width = 4;
  worksheet.getColumn(3).width = 4;

  // Margin Rows 1 & 3
  worksheet.getRow(1).height = 12;
  worksheet.getRow(3).height = 10;

  // Row 2: Title Banner Row merged across table
  const titleRow = worksheet.getRow(2);
  titleRow.height = 30;
  worksheet.mergeCells(2, START_COL, 2, END_COL);
  const titleCell = worksheet.getCell(2, START_COL);
  titleCell.value = {
    richText: [
      {
        text: 'OGUZABAT Hojalyk Jemgyýetiniň "OGUZTRAVEL" syýahatçylyk bölümi | ',
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FF000000" } },
      },
      {
        text: titleBanner,
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FF0E8584" } }, // Brand Teal
      },
      {
        text: periodText ? ` (${periodText})` : "",
        font: { name: "Calibri", size: 10, italic: true, color: { argb: ACCENT_RED } },
      },
    ],
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

  // Calculate dynamic column widths with Cyrillic & uppercase safety padding
  const colWidths = columns.map((col) => {
    const headerVisual = getVisualLength(col.header);
    return Math.max(col.width || 12, Math.ceil(headerVisual + 4));
  });

  // Pre-calculate widths from data rows
  data.forEach((item, rowOffset) => {
    columns.forEach((col, colIdx) => {
      const rawVal = col.accessor ? col.accessor(item, rowOffset) : item[col.key];
      const strVal = String(rawVal ?? "");
      const visualLen = getVisualLength(strVal);
      const maxColLimit = col.key === "details" || col.key === "note" ? 65 : 48;
      const targetWidth = Math.min(Math.ceil(visualLen + 4), maxColLimit);
      if (targetWidth > colWidths[colIdx]) {
        colWidths[colIdx] = targetWidth;
      }
    });
  });

  // Apply column widths to worksheet
  columns.forEach((_, colIdx) => {
    worksheet.getColumn(START_COL + colIdx).width = colWidths[colIdx];
  });

  // Row 4: Header Row
  const headerRow = worksheet.getRow(START_ROW);
  headerRow.height = 30;

  const headerFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFFFFF" },
  };

  const profitColIdx = columns.findIndex((c) => c.key === "profit");
  const isPaidColIdx = columns.findIndex((c) => c.key === "is_paid");
  const netFareColIdx = columns.findIndex((c) => c.key === "net_fare");
  const priceColIdx = columns.findIndex((c) => c.key === "price");

  columns.forEach((col, idx) => {
    const colNumber = START_COL + idx;
    const cell = headerRow.getCell(colNumber);
    cell.value = col.header;
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: col.key === "net_fare" ? ACCENT_RED : "FF000000" },
    };
    cell.fill = headerFill;
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    // Header Borders matching TurkishAirlines & B2B
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

  // Data Rows (Starting at Row 5)
  data.forEach((item, rowOffset) => {
    const rowIndex = START_ROW + 1 + rowOffset;
    const row = worksheet.getRow(rowIndex);

    // Subtle zebra striping: White and #F3F4F6
    const isEvenRow = rowOffset % 2 === 1;
    const zebraBg = isEvenRow ? "FFF3F4F6" : "FFFFFFFF";

    let maxLinesInRow = 1;

    columns.forEach((col, colIdx) => {
      const colNumber = START_COL + colIdx;
      const cell = row.getCell(colNumber);
      const val = col.accessor ? col.accessor(item, rowOffset) : item[col.key];

      cell.value = val !== null && val !== undefined ? val : "";
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF000000" } };
      cell.alignment = {
        vertical: "middle",
        horizontal: col.align || "center",
        wrapText: col.wrapText !== false,
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: zebraBg },
      };

      // Border styles matching TurkishAirlines & B2B
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

      // Currency Formatting
      if (col.isCurrency && typeof val === "number") {
        cell.numFmt = CURRENCY_FMT;
      }

      // Net Baha accent color
      if (col.key === "net_fare") {
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: ACCENT_RED } };
      }

      // Profit colored text
      if (col.key === "profit" && typeof val === "number") {
        cell.font = {
          name: "Calibri",
          size: 10,
          bold: true,
          color: { argb: val > 0 ? ACCENT_GREEN : val < 0 ? ACCENT_RED : "FF64748B" },
        };
      }

      // Payment Status Pill (Mint for Tölendi, Warm Amber for Kredit, Bold Red for Gaýtaryldy)
      if (colIdx === isPaidColIdx && val) {
        const pillStyle = getPaymentPillStyle(val);
        if (pillStyle) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: pillStyle.bg },
          };
          cell.font = {
            name: "Calibri",
            size: 10,
            bold: true,
            color: { argb: pillStyle.fg },
          };
          cell.border = {
            top: { style: "thin", color: { argb: pillStyle.border } },
            bottom: { style: "thin", color: { argb: pillStyle.border } },
            left: colNumber === START_COL
              ? { style: "medium", color: { argb: "FF000000" } }
              : { style: "thin", color: { argb: pillStyle.border } },
            right: colNumber === END_COL
              ? { style: "medium", color: { argb: "FF000000" } }
              : { style: "thin", color: { argb: pillStyle.border } },
          };
        }
      }

      // Multi-line height calculation
      const strVal = String(val ?? "");
      const visualLen = getVisualLength(strVal);
      const effectiveW = colWidths[colIdx];
      if (visualLen > effectiveW) {
        const lines = Math.ceil(visualLen / (effectiveW - 2));
        if (lines > maxLinesInRow) {
          maxLinesInRow = lines;
        }
      }
    });

    row.height = maxLinesInRow > 1 ? Math.min(maxLinesInRow * 16 + 6, 75) : 21;
  });

  // Total Summary Row (Bottom)
  const totalRow = worksheet.getRow(totalRowIndex);
  totalRow.height = 24;

  for (let c = START_COL; c <= END_COL; c++) {
    const cell = totalRow.getCell(c);
    cell.font = { name: "Calibri", size: 10, bold: true };
    cell.alignment = { vertical: "middle", horizontal: columns[c - START_COL]?.align || "center" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8FAFC" },
    };

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
  cellTotalLabel.value = t ? t("outbound.total") : "Total";
  cellTotalLabel.alignment = { vertical: "middle", horizontal: "left" };

  const firstDataRow = START_ROW + 1;
  const lastDataRow = totalRowIndex - 1;

  if (data.length > 0) {
    const sumCols = [
      { idx: netFareColIdx, isRed: true },
      { idx: priceColIdx, isRed: false },
      { idx: profitColIdx, isRed: false, isGreen: true },
    ];

    sumCols.forEach(({ idx, isRed, isGreen }) => {
      if (idx !== -1) {
        const colLetter = getExcelColName(START_COL + idx);
        const cell = totalRow.getCell(START_COL + idx);
        cell.value = {
          formula: `SUM(${colLetter}${firstDataRow}:${colLetter}${lastDataRow})`,
        };
        cell.numFmt = CURRENCY_FMT;
        cell.font = {
          name: "Calibri",
          size: 10.5,
          bold: true,
          color: { argb: isRed ? ACCENT_RED : isGreen ? ACCENT_GREEN : "FF000000" },
        };
      }
    });
  } else {
    // Graceful display of $ 0.00 when sheet has 0 data records
    [netFareColIdx, priceColIdx, profitColIdx].forEach((idx) => {
      if (idx !== -1) {
        const cell = totalRow.getCell(START_COL + idx);
        cell.value = 0;
        cell.numFmt = CURRENCY_FMT;
        cell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF000000" } };
      }
    });
  }
};

/**
 * Main export function: Fetches all selected Outbound services and writes a single unified Excel file
 */
export const exportOutboundExcel = async ({
  selectedServiceKeys = [],
  queryParams = {},
  includeSummary = true,
  onProgress = null,
  t,
  selectedLang,
}) => {
  if (!selectedServiceKeys || selectedServiceKeys.length === 0) {
    throw new Error(t ? t("outbound.noServicesSelected") : "Iň bolmanda bir hyzmaty saýlaň");
  }

  // 1. Sanitize filter params
  const cleanFilterParams = {};
  if (queryParams) {
    Object.entries(queryParams).forEach(([k, v]) => {
      if (k !== "page" && k !== "limit" && k !== "pageSize" && v !== undefined && v !== "" && v !== null) {
        cleanFilterParams[k] = v;
      }
    });
  }

  // 2. Fetch data for each selected service with progress updates
  const servicesData = {};
  let totalLoadedRecords = 0;

  for (let i = 0; i < selectedServiceKeys.length; i++) {
    const key = selectedServiceKeys[i];
    const def = OUTBOUND_SERVICE_MAP[key];
    if (!def) continue;

    const serviceName = t ? t(def.labelKey) : def.sheetName;

    if (onProgress) {
      onProgress({
        phase: "fetching",
        current: i + 1,
        total: selectedServiceKeys.length,
        message: t
          ? t("outbound.fetchingService", { service: serviceName })
          : `${serviceName} maglumatlary alynýar...`,
        percent: Math.round((i / selectedServiceKeys.length) * 85),
      });
    }

    try {
      const items = await fetchAllPaginatedData(def.apiFn, cleanFilterParams, null, 100);
      servicesData[key] = items || [];
      totalLoadedRecords += (items || []).length;
    } catch (fetchErr) {
      console.error(`Error loading ${serviceName} outbound data:`, fetchErr);
      throw new Error(
        t
          ? `${serviceName} maglumatlary alynýarka säwlik ýüze çykdy: ${fetchErr?.message || ""}`
          : `Error loading data for ${serviceName}: ${fetchErr?.message || ""}`,
        { cause: fetchErr }
      );
    }
  }

  if (totalLoadedRecords === 0) {
    throw new Error(t ? t("outbound.noDataFound") : "Saýlanan hyzmatlar boýunça maglumat tapylmady");
  }

  if (onProgress) {
    onProgress({
      phase: "generating",
      current: selectedServiceKeys.length,
      total: selectedServiceKeys.length,
      message: t ? t("outbound.generatingExcel") : "Excel faýly döredilýär...",
      percent: 90,
    });
  }

  // 3. Create Workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OGUZTRAVEL";
  workbook.created = new Date();

  // Date range description for subtitles
  let periodText = "";
  if (cleanFilterParams.start_date || cleanFilterParams.end_date) {
    const s = cleanFilterParams.start_date ? dayjs(cleanFilterParams.start_date).format("DD.MM.YYYY") : "...";
    const e = cleanFilterParams.end_date ? dayjs(cleanFilterParams.end_date).format("DD.MM.YYYY") : "...";
    periodText = `${s} - ${e}`;
  } else {
    periodText = dayjs().format("DD.MM.YYYY");
  }

  // 4. Consolidated Summary Sheet (Umumy Hasabat)
  if (includeSummary) {
    const summaryRows = [];
    selectedServiceKeys.forEach((serviceKey) => {
      const items = servicesData[serviceKey] || [];
      const def = OUTBOUND_SERVICE_MAP[serviceKey];
      const serviceTitle = t ? t(def.labelKey) : def.sheetName;

      items.forEach((item) => {
        summaryRows.push({
          ...item,
          _serviceKey: serviceKey,
          _serviceTitle: serviceTitle,
        });
      });
    });

    const summaryColumns = [
      { header: "T/B", key: "index_number", width: 7, align: "center", accessor: (_, idx) => idx + 1 },
      { header: t ? t("outbound.service") : "Hyzmat", key: "_serviceTitle", width: 15, align: "center" },
      {
        header: t ? t("outbound.requestDate") : "Sene",
        key: "application_date",
        width: 13,
        align: "center",
        accessor: (r) => formatExcelDate(r.application_date),
      },
      {
        header: t ? t("outbound.office") : "Ofis",
        key: "office",
        width: 18,
        align: "left",
        accessor: (r) => resolveOffice(r, selectedLang),
      },
      {
        header: t ? t("outbound.operator") : "Operator",
        key: "operator",
        width: 22,
        align: "left",
        accessor: (r) => resolveStaffName(r.operator),
      },
      {
        header: t ? t("outbound.clientName") : "Müşderi",
        key: "client_name",
        width: 26,
        align: "left",
        accessor: (r) => (r.client?.fullName || r.client_name || "").toUpperCase(),
      },
      {
        header: t ? t("outbound.preparedBy") : "Taýýarlan",
        key: "prepared_by",
        width: 22,
        align: "left",
        accessor: (r) => resolveStaffName(r.preparedOpr),
      },
      {
        header: t ? t("outbound.netFare") : "Net baha",
        key: "net_fare",
        width: 15,
        align: "right",
        isCurrency: true,
        accessor: (r) => toSafeNumber(r.net_fare),
      },
      {
        header: t ? t("outbound.price") : "Satyş baha",
        key: "price",
        width: 15,
        align: "right",
        isCurrency: true,
        accessor: (r) => toSafeNumber(r.price),
      },
      {
        header: t ? t("outbound.profit") : "Peýda",
        key: "profit",
        width: 15,
        align: "right",
        isCurrency: true,
        accessor: (r) => toSafeNumber(r.profit ?? (toSafeNumber(r.price) - toSafeNumber(r.net_fare))),
      },
      {
        header: t ? t("outbound.paymentStatus") : "Töleg ýagdaýy",
        key: "is_paid",
        width: 15,
        align: "center",
        accessor: (r) => resolvePaymentStatus(r.is_paid, t),
      },
      {
        header: t ? t("columns.paymentPercentage") : "Töleg %",
        key: "paidPercentage",
        width: 10,
        align: "center",
        accessor: (r) => `${r.paidPercentage ?? 0}`,
      },
      {
        header: t ? t("outbound.destinationCountry") : "Barmaly ýurt",
        key: "destination_country",
        width: 22,
        align: "left",
        accessor: (r) => (r.destination_country || "").toUpperCase(),
      },
      {
        header: t ? t("outbound.serviceDetails") : "Hyzmat jikme-jikligi",
        key: "details",
        width: 34,
        align: "left",
        accessor: (r) => resolveServiceDetail(r._serviceKey, r),
      },
      {
        header: t ? t("outbound.note") : "Bellik",
        key: "note",
        width: 22,
        align: "left",
        accessor: (r) => r.note || "",
      },
    ];

    buildStyledSheet({
      workbook,
      sheetName: t ? t("outbound.summarySheet") : "Umumy Hasabat",
      titleBanner: "Outbound Satuwlar Umumy Hasabaty",
      periodText,
      columns: summaryColumns,
      data: summaryRows,
      t,
    });
  }

  // 5. Individual Service Sheets
  selectedServiceKeys.forEach((serviceKey) => {
    const data = servicesData[serviceKey] || [];
    const def = OUTBOUND_SERVICE_MAP[serviceKey];
    const serviceTitle = t ? t(def.labelKey) : def.sheetName;

    const baseColumns = [
      { header: "T/B", key: "index_number", width: 7, align: "center", accessor: (_, idx) => idx + 1 },
      {
        header: t ? t("outbound.requestDate") : "Sene",
        key: "application_date",
        width: 13,
        align: "center",
        accessor: (r) => formatExcelDate(r.application_date),
      },
      {
        header: t ? t("outbound.office") : "Ofis",
        key: "office",
        width: 18,
        align: "left",
        accessor: (r) => resolveOffice(r, selectedLang),
      },
      {
        header: t ? t("outbound.operator") : "Operator",
        key: "operator",
        width: 22,
        align: "left",
        accessor: (r) => resolveStaffName(r.operator),
      },
      {
        header: t ? t("outbound.clientName") : "Müşderi",
        key: "client_name",
        width: 26,
        align: "left",
        accessor: (r) => (r.client?.fullName || r.client_name || "").toUpperCase(),
      },
      {
        header: t ? t("outbound.preparedBy") : "Taýýarlan",
        key: "prepared_by",
        width: 22,
        align: "left",
        accessor: (r) => resolveStaffName(r.preparedOpr),
      },
      {
        header: t ? t("outbound.netFare") : "Net baha",
        key: "net_fare",
        width: 15,
        align: "right",
        isCurrency: true,
        accessor: (r) => toSafeNumber(r.net_fare),
      },
      {
        header: t ? t("outbound.price") : "Satyş baha",
        key: "price",
        width: 15,
        align: "right",
        isCurrency: true,
        accessor: (r) => toSafeNumber(r.price),
      },
      {
        header: t ? t("outbound.profit") : "Peýda",
        key: "profit",
        width: 15,
        align: "right",
        isCurrency: true,
        accessor: (r) => toSafeNumber(r.profit ?? (toSafeNumber(r.price) - toSafeNumber(r.net_fare))),
      },
      {
        header: t ? t("outbound.paymentStatus") : "Töleg ýagdaýy",
        key: "is_paid",
        width: 15,
        align: "center",
        accessor: (r) => resolvePaymentStatus(r.is_paid, t),
      },
      {
        header: t ? t("columns.paymentPercentage") : "Töleg %",
        key: "paidPercentage",
        width: 10,
        align: "center",
        accessor: (r) => `${r.paidPercentage ?? 0}`,
      },
      {
        header: t ? t("outbound.destinationCountry") : "Barmaly ýurt",
        key: "destination_country",
        width: 22,
        align: "left",
        accessor: (r) => (r.destination_country || "").toUpperCase(),
      },
    ];

    let specificColumns = [];
    if (serviceKey === "hotel") {
      specificColumns = [
        { header: t ? t("outbound.hotelName") : "Otel ady", key: "hotel_name", width: 22, align: "left", accessor: (r) => (r.hotel_name || "").toUpperCase() },
        { header: t ? t("outbound.roomType") : "Otag görnüşi", key: "room_type", width: 16, align: "center", accessor: (r) => (r.room_type || "").toUpperCase() },
        { header: t ? t("outbound.mealPlan") : "Iýmit", key: "meal_plan", width: 12, align: "center", accessor: (r) => (r.meal_plan || "").toUpperCase() },
        { header: t ? t("outbound.guestCount") : "Myhman sany", key: "guests_count", width: 13, align: "center", accessor: (r) => r.guests_count || "" },
        { header: t ? t("outbound.source") : "Ulgam", key: "system", width: 14, align: "center", accessor: (r) => (r.system || "").toUpperCase() },
      ];
    } else if (serviceKey === "airway") {
      specificColumns = [
        { header: t ? t("outbound.ticketNumber") : "Ticket №", key: "ticket_number", width: 18, align: "center", accessor: (r) => (r.ticket_number || "").toUpperCase() },
        { header: t ? t("outbound.ticketType") : "Görnüşi", key: "ticket_type", width: 15, align: "center", accessor: (r) => (r.ticket_type || "").toUpperCase() },
        { header: t ? t("outbound.route") : "Gatnaw ugur", key: "route", width: 20, align: "center", accessor: (r) => (r.route || "").toUpperCase() },
        { header: t ? t("outbound.guestCount") : "Ýolagçy sany", key: "passenger_count", width: 13, align: "center", accessor: (r) => r.passenger_count || "" },
      ];
    } else if (serviceKey === "railway") {
      specificColumns = [
        { header: t ? t("outbound.ticketNumber") : "Ticket №", key: "ticket_number", width: 18, align: "center", accessor: (r) => (r.ticket_number || "").toUpperCase() },
        { header: t ? t("outbound.trainType") : "Otly görnüşi", key: "train_type", width: 15, align: "center", accessor: (r) => (r.train_type || "").toUpperCase() },
        { header: t ? t("outbound.ticketType") : "Görnüşi", key: "ticket_type", width: 15, align: "center", accessor: (r) => (r.ticket_type || "").toUpperCase() },
        { header: t ? t("outbound.route") : "Gatnaw ugur", key: "route", width: 20, align: "center", accessor: (r) => (r.route || "").toUpperCase() },
        { header: t ? t("outbound.guestCount") : "Ýolagçy sany", key: "passenger_count", width: 13, align: "center", accessor: (r) => r.passenger_count || "" },
      ];
    } else if (serviceKey === "tour") {
      specificColumns = [
        { header: t ? t("outbound.tourName") : "Tur ady", key: "tour_name", width: 22, align: "left", accessor: (r) => (r.tour_name || "").toUpperCase() },
        { header: t ? t("outbound.guestCount") : "Myhman sany", key: "guests_count", width: 13, align: "center", accessor: (r) => r.guests_count || "" },
        { header: t ? t("outbound.source") : "Ulgam", key: "system", width: 14, align: "center", accessor: (r) => (r.system || "").toUpperCase() },
      ];
    } else if (serviceKey === "transfer") {
      specificColumns = [
        { header: t ? t("outbound.transferType") : "Transfer", key: "transfer_type", width: 16, align: "center", accessor: (r) => (r.transfer_type || "").toUpperCase() },
        { header: t ? t("outbound.route") : "Gatnaw ugur", key: "route", width: 20, align: "center", accessor: (r) => (r.route || "").toUpperCase() },
        { header: t ? t("outbound.carType") : "Maşyn", key: "machine_type", width: 15, align: "center", accessor: (r) => (r.machine_type || "").toUpperCase() },
        { header: t ? t("outbound.guestCount") : "Ýolagçy sany", key: "guests_count", width: 13, align: "center", accessor: (r) => r.guests_count || "" },
        { header: t ? t("outbound.source") : "Ulgam", key: "system", width: 14, align: "center", accessor: (r) => (r.system || "").toUpperCase() },
      ];
    } else if (serviceKey === "package") {
      specificColumns = [
        { header: t ? t("outbound.partner") : "Hyzmatdaş", key: "partner", width: 16, align: "center", accessor: (r) => (r.partner || "").toUpperCase() },
      ];
    }

    const noteColumn = [
      {
        header: t ? t("outbound.note") : "Bellik",
        key: "note",
        width: 22,
        align: "left",
        accessor: (r) => r.note || "",
      },
    ];

    const finalColumns = [...baseColumns, ...specificColumns, ...noteColumn];

    buildStyledSheet({
      workbook,
      sheetName: serviceTitle,
      titleBanner: `${serviceTitle} Satuwlar Hasabaty`,
      periodText,
      columns: finalColumns,
      data,
      t,
    });
  });

  if (onProgress) {
    onProgress({
      phase: "saving",
      current: selectedServiceKeys.length,
      total: selectedServiceKeys.length,
      message: t ? t("outbound.exportSuccess") : "Faýl ýüklenýär...",
      percent: 100,
    });
  }

  // 6. Write Buffer & Save file
  const buffer = await workbook.xlsx.writeBuffer();
  const cleanFileName = `Outbound_Hasabat_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, cleanFileName);
};
