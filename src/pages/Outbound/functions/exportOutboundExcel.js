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

const resolveStaff = (staff, selectedLang) => {
  if (!staff) return "";
  const name = staff.fullName || staff.name || "";
  const officeObj = staff.office;
  const officeName = officeObj ? resolveText(officeObj.fullName || officeObj.shortName || officeObj, selectedLang) : "";
  return officeName ? `${name} (${officeName})` : name;
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
      return parts.join(" - ");
    }
    case "airway": {
      const parts = [
        row.ticket_number ? `№ ${row.ticket_number}` : null,
        row.route,
        row.ticket_type,
      ].filter(Boolean);
      return parts.join(" | ");
    }
    case "railway": {
      const parts = [
        row.ticket_number ? `№ ${row.ticket_number}` : null,
        row.train_type,
        row.route,
      ].filter(Boolean);
      return parts.join(" | ");
    }
    case "tour": {
      const parts = [row.tour_name, row.tour_type].filter(Boolean);
      return parts.join(" - ");
    }
    case "transfer": {
      const parts = [row.transfer_type, row.machine_type, row.route].filter(Boolean);
      return parts.join(" | ");
    }
    case "package": {
      const parts = [row.package_name, row.partner ? `[${row.partner}]` : null].filter(Boolean);
      return parts.join(" ");
    }
    default:
      return "";
  }
};

const THIN_BORDER = {
  top: { style: "thin", color: { argb: "FFCBD5E1" } },
  left: { style: "thin", color: { argb: "FFCBD5E1" } },
  bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
  right: { style: "thin", color: { argb: "FFCBD5E1" } },
};

const TOTAL_BORDER = {
  top: { style: "thin", color: { argb: "FF000000" } },
  left: { style: "thin", color: { argb: "FFCBD5E1" } },
  bottom: { style: "double", color: { argb: "FF000000" } },
  right: { style: "thin", color: { argb: "FFCBD5E1" } },
};

const CURRENCY_FMT = '#,##0.00" USD"';

/**
 * Creates and formats a worksheet with banner, headers, data, and totals
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
  const safeSheetName = sheetName.replace(/[:*?/\\[\]]/g, "_").substring(0, 31);
  const worksheet = workbook.addWorksheet(safeSheetName, {
    views: [{ showGridLines: true }],
  });

  const totalCols = columns.length;

  // Row 1: Title Banner
  worksheet.mergeCells(1, 1, 1, totalCols);
  const titleRow = worksheet.getRow(1);
  titleRow.height = 30;
  const titleCell = worksheet.getCell("A1");
  titleCell.value = titleBanner;
  titleCell.font = { name: "Segoe UI", size: 12, bold: true, color: { argb: "FF0F172A" } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF8FAFC" },
  };
  titleCell.border = THIN_BORDER;

  // Row 2: Subtitle with Date / Total info
  worksheet.mergeCells(2, 1, 2, totalCols);
  const subtitleRow = worksheet.getRow(2);
  subtitleRow.height = 20;
  const subCell = worksheet.getCell("A2");
  subCell.value = periodText;
  subCell.font = { name: "Segoe UI", size: 9.5, italic: true, color: { argb: "FF475569" } };
  subCell.alignment = { vertical: "middle", horizontal: "center" };
  subCell.border = THIN_BORDER;

  // Row 3: Empty spacing row
  worksheet.getRow(3).height = 8;

  // Row 4: Column Headers
  const headerRowIndex = 4;
  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.height = 26;

  columns.forEach((col, colIdx) => {
    const cell = headerRow.getCell(colIdx + 1);
    cell.value = col.header;
    cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF0F172A" } };
    cell.alignment = {
      vertical: "middle",
      horizontal: col.align || "center",
      wrapText: true,
    };
    cell.border = THIN_BORDER;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" },
    };
  });

  // Track max lengths for dynamic column width calculation
  const colWidths = columns.map((col) => col.width || Math.max(col.header.length + 4, 12));

  // Rows 5+: Data Rows
  let startDataRow = 5;
  data.forEach((item, rowOffset) => {
    const currentRowIndex = startDataRow + rowOffset;
    const row = worksheet.getRow(currentRowIndex);
    row.height = 20;

    columns.forEach((col, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      const val = col.accessor ? col.accessor(item, rowOffset) : item[col.key];

      cell.value = val !== null && val !== undefined ? val : "";
      cell.font = { name: "Segoe UI", size: 9.5 };
      cell.alignment = {
        vertical: "middle",
        horizontal: col.align || "center",
      };
      cell.border = THIN_BORDER;

      if (col.isCurrency && typeof val === "number") {
        cell.numFmt = CURRENCY_FMT;
      }

      // Calculate width
      const strVal = String(val ?? "");
      if (strVal.length > colWidths[colIdx]) {
        colWidths[colIdx] = Math.min(Math.max(colWidths[colIdx], strVal.length + 3), 45);
      }
    });
  });

  // Total Summary Row at the bottom
  const totalRowIndex = startDataRow + data.length;
  const totalRow = worksheet.getRow(totalRowIndex);
  totalRow.height = 24;

  const netFareColIdx = columns.findIndex((c) => c.key === "net_fare");
  const priceColIdx = columns.findIndex((c) => c.key === "price");
  const profitColIdx = columns.findIndex((c) => c.key === "profit");

  columns.forEach((col, colIdx) => {
    const cell = totalRow.getCell(colIdx + 1);
    cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF0F172A" } };
    cell.border = TOTAL_BORDER;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF1F5F9" },
    };

    if (colIdx === 0) {
      cell.value = t ? t("outbound.total") : "JEMI";
      cell.alignment = { vertical: "middle", horizontal: "center" };
    } else if (colIdx === netFareColIdx && data.length > 0) {
      const colLetter = cell.address.replace(/[0-9]/g, "");
      cell.value = { formula: `SUM(${colLetter}5:${colLetter}${totalRowIndex - 1})` };
      cell.numFmt = CURRENCY_FMT;
      cell.alignment = { vertical: "middle", horizontal: "right" };
    } else if (colIdx === priceColIdx && data.length > 0) {
      const colLetter = cell.address.replace(/[0-9]/g, "");
      cell.value = { formula: `SUM(${colLetter}5:${colLetter}${totalRowIndex - 1})` };
      cell.numFmt = CURRENCY_FMT;
      cell.alignment = { vertical: "middle", horizontal: "right" };
    } else if (colIdx === profitColIdx && data.length > 0) {
      const colLetter = cell.address.replace(/[0-9]/g, "");
      cell.value = { formula: `SUM(${colLetter}5:${colLetter}${totalRowIndex - 1})` };
      cell.numFmt = CURRENCY_FMT;
      cell.alignment = { vertical: "middle", horizontal: "right" };
    } else {
      cell.value = "";
    }
  });

  // Apply column widths
  worksheet.columns = colWidths.map((width) => ({ width }));
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
        percent: Math.round(((i) / selectedServiceKeys.length) * 85),
      });
    }

    const items = await fetchAllPaginatedData(def.apiFn, cleanFilterParams, null, 100);
    servicesData[key] = items || [];
    totalLoadedRecords += (items || []).length;
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
  let periodText = `Eksport senesi: ${dayjs().format("DD.MM.YYYY HH:mm")}`;
  if (cleanFilterParams.start_date || cleanFilterParams.end_date) {
    const s = cleanFilterParams.start_date ? dayjs(cleanFilterParams.start_date).format("DD.MM.YYYY") : "...";
    const e = cleanFilterParams.end_date ? dayjs(cleanFilterParams.end_date).format("DD.MM.YYYY") : "...";
    periodText = `Döwür: ${s} - ${e} | ${periodText}`;
  }

  // 4. Consolidated Summary Sheet (if enabled and more than 0 records)
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
      { header: "#", key: "index_number", width: 6, align: "center", accessor: (_, idx) => idx + 1 },
      { header: t ? t("outbound.service") : "Hyzmat", key: "_serviceTitle", width: 14, align: "center" },
      {
        header: t ? t("outbound.requestDate") : "Arza senesi",
        key: "application_date",
        width: 13,
        align: "center",
        accessor: (r) => formatExcelDate(r.application_date),
      },
      {
        header: t ? t("outbound.clientName") : "Müşderi",
        key: "client_name",
        width: 24,
        align: "left",
        accessor: (r) => r.client?.fullName || r.client_name || "",
      },
      {
        header: t ? t("outbound.operator") : "Operator",
        key: "operator",
        width: 24,
        align: "left",
        accessor: (r) => resolveStaff(r.operator, selectedLang),
      },
      {
        header: t ? t("outbound.preparedBy") : "Taýýarlan",
        key: "prepared_by",
        width: 24,
        align: "left",
        accessor: (r) => resolveStaff(r.preparedOpr, selectedLang),
      },
      {
        header: t ? t("outbound.netFare") : "Net baha",
        key: "net_fare",
        width: 14,
        align: "right",
        isCurrency: true,
        accessor: (r) => Number(r.net_fare || 0),
      },
      {
        header: t ? t("outbound.price") : "Bahasy",
        key: "price",
        width: 14,
        align: "right",
        isCurrency: true,
        accessor: (r) => Number(r.price || 0),
      },
      {
        header: t ? t("outbound.profit") : "Peýda",
        key: "profit",
        width: 14,
        align: "right",
        isCurrency: true,
        accessor: (r) => Number(r.profit ?? ((r.price || 0) - (r.net_fare || 0))),
      },
      {
        header: t ? t("outbound.paymentStatus") : "Töleg ýagdaýy",
        key: "is_paid",
        width: 14,
        align: "center",
        accessor: (r) => resolvePaymentStatus(r.is_paid, t),
      },
      {
        header: t ? t("columns.paymentPercentage") : "Töleg %",
        key: "paidPercentage",
        width: 10,
        align: "center",
        accessor: (r) => `${r.paidPercentage ?? 0}%`,
      },
      {
        header: t ? t("outbound.destinationCountry") : "Barmaly ýurt",
        key: "destination_country",
        width: 16,
        align: "center",
        accessor: (r) => r.destination_country || "",
      },
      {
        header: t ? t("outbound.serviceDetails") : "Hyzmat jikme-jikligi",
        key: "details",
        width: 32,
        align: "left",
        accessor: (r) => resolveServiceDetail(r._serviceKey, r),
      },
      {
        header: t ? t("outbound.note") : "Bellik",
        key: "note",
        width: 20,
        align: "left",
        accessor: (r) => r.note || "",
      },
    ];

    buildStyledSheet({
      workbook,
      sheetName: t ? t("outbound.summarySheet") : "Umumy Hasabat",
      titleBanner: 'OGUZTRAVEL - Outbound Satuwlar Umumy Hasabaty',
      periodText: `${periodText} | Jemi: ${summaryRows.length} sany satyş`,
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

    // Common columns present in every service
    const baseColumns = [
      { header: "#", key: "index_number", width: 6, align: "center", accessor: (_, idx) => idx + 1 },
      {
        header: t ? t("outbound.requestDate") : "Arza senesi",
        key: "application_date",
        width: 13,
        align: "center",
        accessor: (r) => formatExcelDate(r.application_date),
      },
      {
        header: t ? t("outbound.clientName") : "Müşderi",
        key: "client_name",
        width: 24,
        align: "left",
        accessor: (r) => r.client?.fullName || r.client_name || "",
      },
      {
        header: t ? t("outbound.operator") : "Operator",
        key: "operator",
        width: 24,
        align: "left",
        accessor: (r) => resolveStaff(r.operator, selectedLang),
      },
      {
        header: t ? t("outbound.preparedBy") : "Taýýarlan",
        key: "prepared_by",
        width: 24,
        align: "left",
        accessor: (r) => resolveStaff(r.preparedOpr, selectedLang),
      },
      {
        header: t ? t("outbound.netFare") : "Net baha",
        key: "net_fare",
        width: 14,
        align: "right",
        isCurrency: true,
        accessor: (r) => Number(r.net_fare || 0),
      },
      {
        header: t ? t("outbound.price") : "Bahasy",
        key: "price",
        width: 14,
        align: "right",
        isCurrency: true,
        accessor: (r) => Number(r.price || 0),
      },
      {
        header: t ? t("outbound.profit") : "Peýda",
        key: "profit",
        width: 14,
        align: "right",
        isCurrency: true,
        accessor: (r) => Number(r.profit ?? ((r.price || 0) - (r.net_fare || 0))),
      },
      {
        header: t ? t("outbound.paymentStatus") : "Töleg ýagdaýy",
        key: "is_paid",
        width: 14,
        align: "center",
        accessor: (r) => resolvePaymentStatus(r.is_paid, t),
      },
      {
        header: t ? t("columns.paymentPercentage") : "Töleg %",
        key: "paidPercentage",
        width: 10,
        align: "center",
        accessor: (r) => `${r.paidPercentage ?? 0}%`,
      },
      {
        header: t ? t("outbound.destinationCountry") : "Barmaly ýurt",
        key: "destination_country",
        width: 16,
        align: "center",
        accessor: (r) => r.destination_country || "",
      },
    ];

    // Service-specific columns
    let specificColumns = [];
    if (serviceKey === "hotel") {
      specificColumns = [
        { header: t ? t("outbound.hotelName") : "Otel ady", key: "hotel_name", width: 22, align: "left", accessor: (r) => r.hotel_name || "" },
        { header: t ? t("outbound.roomType") : "Otag görnüşi", key: "room_type", width: 16, align: "center", accessor: (r) => r.room_type || "" },
        { header: t ? t("outbound.mealPlan") : "Iýmit", key: "meal_plan", width: 12, align: "center", accessor: (r) => r.meal_plan || "" },
        { header: t ? t("outbound.guestCount") : "Myhman sany", key: "guests_count", width: 13, align: "center", accessor: (r) => r.guests_count || "" },
        { header: t ? t("outbound.source") : "Ulgam", key: "system", width: 14, align: "center", accessor: (r) => r.system || "" },
      ];
    } else if (serviceKey === "airway") {
      specificColumns = [
        { header: t ? t("outbound.ticketNumber") : "Bilet №", key: "ticket_number", width: 16, align: "center", accessor: (r) => r.ticket_number || "" },
        { header: t ? t("outbound.ticketType") : "Bilet görnüşi", key: "ticket_type", width: 15, align: "center", accessor: (r) => r.ticket_type || "" },
        { header: t ? t("outbound.route") : "Ugur", key: "route", width: 18, align: "center", accessor: (r) => r.route || "" },
        { header: t ? t("outbound.guestCount") : "Ýolagçy sany", key: "passenger_count", width: 13, align: "center", accessor: (r) => r.passenger_count || "" },
      ];
    } else if (serviceKey === "railway") {
      specificColumns = [
        { header: t ? t("outbound.ticketNumber") : "Bilet №", key: "ticket_number", width: 16, align: "center", accessor: (r) => r.ticket_number || "" },
        { header: t ? t("outbound.trainType") : "Otly görnüşi", key: "train_type", width: 15, align: "center", accessor: (r) => r.train_type || "" },
        { header: t ? t("outbound.ticketType") : "Bilet görnüşi", key: "ticket_type", width: 15, align: "center", accessor: (r) => r.ticket_type || "" },
        { header: t ? t("outbound.route") : "Ugur", key: "route", width: 18, align: "center", accessor: (r) => r.route || "" },
        { header: t ? t("outbound.guestCount") : "Ýolagçy sany", key: "passenger_count", width: 13, align: "center", accessor: (r) => r.passenger_count || "" },
      ];
    } else if (serviceKey === "tour") {
      specificColumns = [
        { header: t ? t("outbound.tourName") : "Tur ady", key: "tour_name", width: 22, align: "left", accessor: (r) => r.tour_name || "" },
        { header: t ? t("outbound.guestCount") : "Myhman sany", key: "guests_count", width: 13, align: "center", accessor: (r) => r.guests_count || "" },
        { header: t ? t("outbound.source") : "Ulgam", key: "system", width: 14, align: "center", accessor: (r) => r.system || "" },
      ];
    } else if (serviceKey === "transfer") {
      specificColumns = [
        { header: t ? t("outbound.transferType") : "Transfer görnüşi", key: "transfer_type", width: 16, align: "center", accessor: (r) => r.transfer_type || "" },
        { header: t ? t("outbound.route") : "Ugur", key: "route", width: 18, align: "center", accessor: (r) => r.route || "" },
        { header: t ? t("outbound.carType") : "Maşyn görnüşi", key: "machine_type", width: 15, align: "center", accessor: (r) => r.machine_type || "" },
        { header: t ? t("outbound.guestCount") : "Myhman sany", key: "guests_count", width: 13, align: "center", accessor: (r) => r.guests_count || "" },
        { header: t ? t("outbound.source") : "Ulgam", key: "system", width: 14, align: "center", accessor: (r) => r.system || "" },
      ];
    } else if (serviceKey === "package") {
      specificColumns = [
        { header: t ? t("outbound.partner") : "Hyzmatdaş", key: "partner", width: 16, align: "center", accessor: (r) => r.partner || "" },
      ];
    }

    const noteColumn = [
      {
        header: t ? t("outbound.note") : "Bellik",
        key: "note",
        width: 20,
        align: "left",
        accessor: (r) => r.note || "",
      },
    ];

    const finalColumns = [...baseColumns, ...specificColumns, ...noteColumn];

    buildStyledSheet({
      workbook,
      sheetName: serviceTitle,
      titleBanner: `OGUZTRAVEL - ${serviceTitle} Satuwlar Hasabaty`,
      periodText: `${periodText} | Jemi: ${data.length} sany satyş`,
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
  const fileName = `Outbound_Hasabat_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, fileName);
};
