import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTurkishAirlinesReportApi,
  getTurkishAirlinesStatusMonthApi,
} from "../../../../api/queries/getters";
import { useLocale } from "../../../../hooks/useLocale";

const STATUS_COLORS = {
  SALE: "#10B981",
  REISSUE: "#F59E0B",
  REFUND: "#EF4444",
};

const OFFICE_COLORS = [
  "#14B8A6", "#22D3EE", "#FBBF24", "#F472B6", "#A78BFA",
  "#FB923C", "#34D399", "#60A5FA", "#E879F9", "#F87171",
];

const selectReport = (res) => {
  const payload = res?.data ?? {};
  return {
    reportData: Array.isArray(payload.data) ? payload.data : [],
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
  const { t, currentLanguage, selectedLang } = useLocale();

  const yearMonth = selectedDate.format("YYYY-MM");
  const daysInMonth = selectedDate.daysInMonth();

  const { data: report, isLoading } = useQuery({
    queryKey: ["turkishAirlinesReport", { year_month: yearMonth }],
    queryFn: () => getTurkishAirlinesReportApi({ year_month: yearMonth }),
    select: selectReport,
  });

  const reportData = useMemo(() => report?.reportData ?? [], [report]);
  const dailyTotals = useMemo(() => report?.dailyTotals ?? [], [report]);
  const footer = useMemo(() => report?.footer ?? [], [report]);
  const grandTotal = useMemo(() => report?.grandTotal ?? {}, [report]);

  const { data: statusList = [], isLoading: isStatusLoading } = useQuery({
    queryKey: ["turkishAirlinesStatusMonth", { yearMonth }],
    queryFn: () => getTurkishAirlinesStatusMonthApi({ yearMonth }),
    select: selectStatus,
  });

  const offices = useMemo(
    () =>
      footer
        .map((f) => {
          const short = selectedLang(f.shortname) || selectedLang(f.office) || "";
          const full = selectedLang(f.full_name) || short;
          return { short, full };
        })
        .filter((o) => Boolean(o.short)),
    [footer, selectedLang]
  );

  const statusChartData = useMemo(
    () =>
      statusList.map((item, i) => {
        const rawName =
          selectedLang(item.status_name) ||
          (typeof item.status_name === "string" ? item.status_name : "") ||
          item.status ||
          `Status ${i + 1}`;
        const key = String(rawName).trim().toUpperCase();
        const translatedStatus = t(`saleStatus.${key}`) !== `saleStatus.${key}`
          ? t(`saleStatus.${key}`)
          : rawName;

        const value = Number(item.ticket_count ?? item.count ?? item.value ?? 0) || 0;
        const percentage = item.percentage || "0.00%";

        return {
          id: item.status_guid || i,
          statusName: translatedStatus,
          label: `${translatedStatus}: ${value} (${percentage})`,
          value,
          color:
            STATUS_COLORS[key] ||
            OFFICE_COLORS[i % OFFICE_COLORS.length],
          percentage,
          ticketCount: value,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statusList, currentLanguage]
  );

  const { reportIndex, totalsIndex } = useMemo(() => {
    const rIdx = new Map();
    reportData.forEach((d) => {
      const key = `${d.datetime}-${selectedLang(d.shortname)}`;
      rIdx.set(key, d);
    });

    const tIdx = new Map();
    dailyTotals.forEach((d) => {
      tIdx.set(d.datetime, d);
    });

    return { reportIndex: rIdx, totalsIndex: tIdx };
  }, [reportData, dailyTotals, selectedLang]);

  const { rows, barChartData } = useMemo(() => {
    const tableRows = [];
    const chartData = [];

    for (let i = 0; i < daysInMonth; i++) {
      const dayStr = String(i + 1).padStart(2, "0");
      const row = { day: i + 1 };

      offices.forEach(({ short }) => {
        const match = reportIndex.get(`${dayStr}-${short}`);
        row[short] = match
          ? { quoted: Number(match.quoted_price_sum) || 0, base: Number(match.base_fare_sum) || 0 }
          : null;
      });

      const totalMatch = totalsIndex.get(dayStr);
      row.total = totalMatch ? Number(totalMatch.daily_total_quoted) : 0;
      row.totalBase = totalMatch ? Number(totalMatch.daily_total_base) : 0;

      tableRows.push(row);
      chartData.push({ day: String(i + 1), value: row.total });
    }

    return { rows: tableRows, barChartData: chartData };
  }, [reportIndex, totalsIndex, offices, daysInMonth]);

  const stats = useMemo(() => {
    const monthBase = Number(grandTotal.month_total_base) || 0;
    const monthQuoted = Number(grandTotal.month_total_quoted) || 0;
    const monthProfit = Number(grandTotal.month_profit) || 0;
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
    const dailyAvg = workingDays > 0 ? Math.round(monthQuoted / workingDays) : 0;

    let bestDay = 0;
    let bestDayNum = 0;
    dailyTotals.forEach((d) => {
      const val = Number(d.daily_total_quoted) || 0;
      if (val > bestDay) {
        bestDay = val;
        bestDayNum = Number(d.datetime);
      }
    });

    return { monthBase, monthQuoted, monthProfit, monthPaid, monthCredit, workingDays, dailyAvg, bestDay, bestDayNum };
  }, [grandTotal, dailyTotals]);

  const officeBreakdown = useMemo(() => {
    const maxQuoted = Math.max(...footer.map((f) => Number(f.total_quoted) || 0), 1);
    return footer.map((f, i) => ({
      office: selectedLang(f.shortname) || selectedLang(f.office) || "—",
      totalQuoted: Number(f.total_quoted) || 0,
      percentage: f.percentage,
      barWidth: Math.min(100, Math.max(0, ((Number(f.total_quoted) || 0) / maxQuoted) * 100)),
      color: OFFICE_COLORS[i % OFFICE_COLORS.length],
    }));
  }, [footer, selectedLang]);

  const findFooter = useCallback(
    (officeShort) =>
      footer.find(
        (f) => selectedLang(f.shortname) === officeShort || selectedLang(f.office) === officeShort
      ),
    [footer, selectedLang]
  );

  return {
    isLoading,
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
