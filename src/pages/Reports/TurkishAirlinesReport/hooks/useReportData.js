import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTurkishAirlinesReportApi,
  getTurkishAirlinesStatusMonthApi,
  getAllOfficeApi,
} from "../../../../api/queries/getters";
import { useLocale } from "../../../../hooks/useLocale";
import { SALE_STATUS_CONFIG } from "../../../../functions/statusChipConfigs";

import dayjs from "dayjs";

const STATUS_COLORS = {
  SALE: "#10B981",
  REISSUE: "#F59E0B",
  REFUND: "#EF4444",
};

const OFFICE_COLORS = [
  "#14B8A6", "#22D3EE", "#FBBF24", "#F472B6", "#A78BFA",
  "#FB923C", "#34D399", "#60A5FA", "#E879F9", "#F87171",
];

// Language-independent office identifier, so columns/rows/footer stay aligned when the UI language changes.
const getOfficeKey = (obj) => {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj.tk || obj.ru || obj.en || "";
};

const getRecordOfficeNameKey = (f) =>
  getOfficeKey(f.shortname) ||
  getOfficeKey(f.shortName) ||
  getOfficeKey(f.office) ||
  getOfficeKey(f.full_name) ||
  getOfficeKey(f.fullName);

// Report rows carry `office_guid`, office list rows carry `guid`; fall back to the tk name for older responses.
const getRecordOfficeKey = (f) => f.office_guid || f.guid || getRecordOfficeNameKey(f);

const selectReport = (res) => {
  const payload = res?.data ?? res ?? {};
  return {
    reportData: Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [],
    dailyTotals: Array.isArray(payload.dailyTotals) ? payload.dailyTotals : [],
    footer: Array.isArray(payload.footer) ? payload.footer : [],
    grandTotal: payload.grandTotal ?? {},
  };
};

const selectStatus = (res) => {
  const raw = res?.data ?? res ?? [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.statusList)) return raw.statusList;
  return [];
};

const useReportData = (selectedDate) => {
  const { t, selectedLang } = useLocale();

  const validDate = useMemo(() => {
    if (!selectedDate) return dayjs();
    const d = dayjs.isDayjs(selectedDate) ? selectedDate : dayjs(selectedDate);
    return d.isValid() ? d : dayjs();
  }, [selectedDate]);

  const yearMonth = useMemo(() => validDate.format("YYYY-MM"), [validDate]);
  const daysInMonth = useMemo(() => validDate.daysInMonth(), [validDate]);

  const { data: report, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["turkishAirlinesReport", yearMonth],
    queryFn: () => getTurkishAirlinesReportApi({ year_month: yearMonth }),
    select: selectReport,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: "always",
  });

  const reportData = useMemo(() => report?.reportData ?? [], [report]);
  const dailyTotals = useMemo(() => report?.dailyTotals ?? [], [report]);
  const footer = useMemo(() => report?.footer ?? [], [report]);
  const grandTotal = useMemo(() => report?.grandTotal ?? {}, [report]);

  const { data: statusList = [], isLoading: isStatusLoading } = useQuery({
    queryKey: ["turkishAirlinesStatusMonth", yearMonth],
    queryFn: () => getTurkishAirlinesStatusMonthApi({ year_month: yearMonth, yearMonth }),
    select: selectStatus,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: "always",
  });

  const { data: dbOffices = [] } = useQuery({
    queryKey: ["allOffices"],
    queryFn: () => getAllOfficeApi(),
    select: (res) =>
      Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [],
    staleTime: 1000 * 60 * 10,
  });

  const getOfficeLabel = useCallback(
    (obj) => {
      if (!obj) return "";
      if (typeof obj === "string") return obj;
      return selectedLang(obj) || obj.tk || obj.ru || obj.en || "";
    },
    [selectedLang]
  );

  const offices = useMemo(() => {
    const list = [];
    const seen = new Set();
    const guidlessNames = new Set();

    const addOffice = (f) => {
      const key = getRecordOfficeKey(f);
      const nameKey = getRecordOfficeNameKey(f);
      const short =
        getOfficeLabel(f.shortname) ||
        getOfficeLabel(f.shortName) ||
        getOfficeLabel(f.office);
      const full =
        getOfficeLabel(f.full_name) ||
        getOfficeLabel(f.fullName) ||
        short;
      // A guid-less (older) report row claims its name, so the office-list row for the same office isn't added twice.
      if (key && short && !seen.has(key) && !guidlessNames.has(nameKey)) {
        seen.add(key);
        if (key === nameKey) guidlessNames.add(nameKey);
        list.push({
          key,
          short,
          full,
          rawShort: f.shortname || f.shortName,
          rawFull: f.full_name || f.fullName,
        });
      }
    };

    footer.forEach(addOffice);
    reportData.forEach(addOffice);
    dbOffices.forEach(addOffice);

    return list;
  }, [footer, reportData, dbOffices, getOfficeLabel]);

  const statusChartData = useMemo(
    () =>
      statusList.map((item, i) => {
        const rawName =
          getOfficeLabel(item.status_name) ||
          (typeof item.status_name === "string" ? item.status_name : "") ||
          item.status ||
          `Status ${i + 1}`;
        const key = String(rawName).trim().toUpperCase();
        const config = SALE_STATUS_CONFIG[key];
        const translatedStatus =
          config?.label ||
          (t(`saleStatus.${key}`) !== `saleStatus.${key}` ? t(`saleStatus.${key}`) : rawName);

        const value = Number(item.ticket_count ?? item.count ?? item.value ?? 0) || 0;
        const percentage = item.percentage || "0.00%";

        return {
          id: item.status_guid || i,
          statusName: translatedStatus,
          label: translatedStatus,
          value,
          color:
            STATUS_COLORS[key] ||
            config?.color ||
            OFFICE_COLORS[i % OFFICE_COLORS.length],
          percentage,
          ticketCount: value,
        };
      }),
    [statusList, getOfficeLabel, t]
  );

  const { reportIndex, totalsIndex } = useMemo(() => {
    const rIdx = new Map();
    reportData.forEach((d) => {
      const rawDay = String(d.datetime ?? "").trim();
      const paddedDay = rawDay.padStart(2, "0");
      const unpaddedDay = String(parseInt(rawDay, 10) || rawDay);
      
      const key = getRecordOfficeKey(d);
      if (!key) return;
      rIdx.set(`${paddedDay}-${key}`, d);
      rIdx.set(`${unpaddedDay}-${key}`, d);
    });

    const tIdx = new Map();
    dailyTotals.forEach((d) => {
      const rawDay = String(d.datetime ?? "").trim();
      const paddedDay = rawDay.padStart(2, "0");
      const unpaddedDay = String(parseInt(rawDay, 10) || rawDay);
      tIdx.set(paddedDay, d);
      tIdx.set(unpaddedDay, d);
    });

    return { reportIndex: rIdx, totalsIndex: tIdx };
  }, [reportData, dailyTotals]);

  const { rows, barChartData } = useMemo(() => {
    const tableRows = [];
    const chartData = [];

    for (let i = 0; i < daysInMonth; i++) {
      const dayNum = i + 1;
      const dayStr = String(dayNum).padStart(2, "0");
      const dayRaw = String(dayNum);
      const row = { day: dayNum };

      offices.forEach(({ key }) => {
        const match =
          reportIndex.get(`${dayStr}-${key}`) || reportIndex.get(`${dayRaw}-${key}`);

        row[key] = match
          ? {
              quoted: Number(match.quoted_price_sum ?? match.quoted_price ?? match.total_quoted) || 0,
              base: Number(match.base_fare_sum ?? match.base_fare ?? match.total_base) || 0,
            }
          : null;
      });

      const totalMatch = totalsIndex.get(dayStr) || totalsIndex.get(dayRaw);
      row.total = totalMatch
        ? Number(totalMatch.daily_total_quoted ?? totalMatch.total_quoted ?? totalMatch.quoted_price_sum ?? 0)
        : 0;
      row.totalBase = totalMatch
        ? Number(totalMatch.daily_total_base ?? totalMatch.total_base ?? totalMatch.base_fare_sum ?? 0)
        : 0;

      tableRows.push(row);
      chartData.push({ day: String(dayNum), value: row.total });
    }

    return { rows: tableRows, barChartData: chartData };
  }, [reportIndex, totalsIndex, offices, daysInMonth]);

  const stats = useMemo(() => {
    const monthBase = Number(grandTotal.month_total_base ?? grandTotal.total_base) || 0;
    const monthQuoted = Number(grandTotal.month_total_quoted ?? grandTotal.total_quoted) || 0;
    const monthProfit =
      Number(grandTotal.month_profit ?? grandTotal.profit) ||
      (monthQuoted > 0 ? monthQuoted - monthBase : 0);
    const monthPaid =
      Number(grandTotal.month_total_paid ?? grandTotal.total_paid ?? grandTotal.paid_sum) || 0;
    const monthCredit =
      Number(
        grandTotal.month_total_credit ??
          grandTotal.total_credit ??
          grandTotal.credit_sum ??
          Math.max(0, monthQuoted - monthPaid)
      ) || 0;

    const workingDays = Number(grandTotal.working_days_count) || 0;
    const dailyAvg = workingDays > 0 ? Math.round(monthQuoted / workingDays) : (daysInMonth > 0 ? Math.round(monthQuoted / daysInMonth) : 0);

    let bestDay = 0;
    let bestDayNum = 0;
    dailyTotals.forEach((d) => {
      const val = Number(d.daily_total_quoted ?? d.total_quoted ?? d.quoted_price_sum) || 0;
      if (val > bestDay) {
        bestDay = val;
        bestDayNum = Number(d.datetime) || 0;
      }
    });

    return { monthBase, monthQuoted, monthProfit, monthPaid, monthCredit, workingDays, dailyAvg, bestDay, bestDayNum };
  }, [grandTotal, dailyTotals, daysInMonth]);

  const officeBreakdown = useMemo(() => {
    const validFooter = footer.filter((f) => {
      const short = getOfficeLabel(f.shortname) || getOfficeLabel(f.office);
      return Boolean(short);
    });
    const maxQuoted = Math.max(...validFooter.map((f) => Number(f.total_quoted ?? f.quoted_price_sum) || 0), 1);

    return validFooter.map((f, i) => {
      const totalQuoted = Number(f.total_quoted ?? f.quoted_price_sum) || 0;
      return {
        key: getRecordOfficeKey(f),
        office: getOfficeLabel(f.full_name) || getOfficeLabel(f.shortname) || "—",
        totalQuoted,
        totalBase: Number(f.total_base ?? f.base_fare_sum) || 0,
        profit: Number(f.profit) || 0,
        percentage: f.percentage || "0.00%",
        barWidth: Math.min(100, Math.max(0, (totalQuoted / maxQuoted) * 100)),
        color: OFFICE_COLORS[i % OFFICE_COLORS.length],
      };
    });
  }, [footer, getOfficeLabel]);

  const footerIndex = useMemo(
    () => new Map(footer.map((f) => [getRecordOfficeKey(f), f])),
    [footer]
  );

  const findFooter = useCallback((officeKey) => footerIndex.get(officeKey), [footerIndex]);

  return {
    isLoading,
    isFetching,
    refetch,
    isStatusLoading,
    reportData,
    dailyTotals,
    footer,
    grandTotal,
    offices,
    rows,
    barChartData,
    statusChartData,
    stats,
    officeBreakdown,
    findFooter,
    daysInMonth,
  };
};

export default useReportData;
