import { useState, useMemo, useCallback } from "react";
import { Box, useTheme } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getTurkishAirlinesReportApi, getAllOfficeApi } from "../../../api/queries/getters";

import ReportHeader from "./Contents/ReportHeader";
import ReportSummaryCards from "./Contents/ReportSummaryCards";
import ReportCharts from "./Contents/ReportCharts";
import ReportTable from "./Contents/ReportTable";

const formatNumber = (val) => {
  const num = Number(val);
  if (!num && num !== 0) return "—";
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

const formatCompact = (val) => {
  const num = Number(val);
  if (!num && num !== 0) return "0";
  if (Math.abs(num) >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
};

const OFFICE_COLORS = [
  "#14B8A6", "#22D3EE", "#FBBF24", "#F472B6", "#A78BFA", "#FB923C",
  "#34D399", "#60A5FA", "#E879F9", "#F87171",
];

const TurkishAirlinesReport = () => {
  const { t, selectedLang } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [selectedDate, setSelectedDate] = useState(dayjs());

  const yearMonth = selectedDate.format("YYYY-MM");
  const daysInMonth = selectedDate.daysInMonth();

  /* ── Fetch offices directly via getAllOfficeApi ── */
  const { data: rawOffices = [] } = useGet({
    apiFn: getAllOfficeApi,
    key: "office",
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ["turkishAirlinesReport", { year_month: yearMonth }],
    queryFn: () => getTurkishAirlinesReportApi({ year_month: yearMonth }),
    select: (res) => res?.data ?? {},
  });

  const reportData = Array.isArray(response?.data) ? response.data : [];
  const dailyTotals = Array.isArray(response?.dailyTotals) ? response.dailyTotals : [];
  const footer = Array.isArray(response?.footer) ? response.footer : [];
  const grandTotal = response?.grandTotal ?? {};

  const offices = useMemo(() => {
    if (Array.isArray(rawOffices) && rawOffices.length > 0) {
      return rawOffices
        .map((o) => {
          const short = selectedLang(o.shortName) || o.shortName || "";
          const full = selectedLang(o.name || o.fullName || o.shortName) || short;
          return { short, full };
        })
        .filter((o) => Boolean(o.short));
    }
    return footer
      .map((f) => ({
        short: selectedLang(f.office) || "",
        full: selectedLang(f.office) || "",
      }))
      .filter((o) => Boolean(o.short));
  }, [rawOffices, footer, selectedLang]);

  /* ── Build Daily Rows ── */
  const rows = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayStr = String(i + 1).padStart(2, "0");
      const row = { day: i + 1 };

      offices.forEach(({ short }) => {
        const match = reportData.find(
          (d) => d.datetime === dayStr && selectedLang(d.shortname) === short
        );
        row[short] = match ? Number(match.quoted_price_sum) : null;
      });

      const totalMatch = dailyTotals.find((d) => d.datetime === dayStr);
      row.total = totalMatch ? Number(totalMatch.daily_total_quoted) : 0;

      return row;
    });
  }, [reportData, dailyTotals, offices, daysInMonth, selectedLang]);

  /* ── Bar Chart Dataset ── */
  const barChartData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayStr = String(i + 1).padStart(2, "0");
      const match = dailyTotals.find((d) => d.datetime === dayStr);
      return {
        day: String(i + 1),
        value: match ? Number(match.daily_total_quoted) : 0,
      };
    });
  }, [dailyTotals, daysInMonth]);

  /* ── Summary Stats ── */
  const stats = useMemo(() => {
    const monthBase = Number(grandTotal.month_total_base) || 0;
    const monthQuoted = Number(grandTotal.month_total_quoted) || 0;
    const monthProfit = Number(grandTotal.month_profit) || 0;
    const monthPaid = Number(
      grandTotal.month_total_paid ?? grandTotal.total_paid ?? grandTotal.paid_sum
    ) || 0;
    const monthCredit = Number(
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

    return {
      monthBase,
      monthQuoted,
      monthProfit,
      monthPaid,
      monthCredit,
      workingDays,
      dailyAvg,
      bestDay,
      bestDayNum,
    };
  }, [grandTotal, dailyTotals]);

  /* ── Office Distribution Breakdown ── */
  const officeBreakdown = useMemo(() => {
    const maxQuoted = Math.max(...footer.map((f) => Number(f.total_quoted) || 0), 1);
    return footer.map((f, i) => ({
      office: selectedLang(f.office) || "—",
      totalQuoted: Number(f.total_quoted) || 0,
      percentage: f.percentage,
      barWidth: Math.min(
        100,
        Math.max(0, ((Number(f.total_quoted) || 0) / maxQuoted) * 100)
      ),
      color: OFFICE_COLORS[i % OFFICE_COLORS.length],
    }));
  }, [footer, selectedLang]);

  const findFooter = useCallback(
    (officeShort) => {
      return footer.find((f) => selectedLang(f.office) === officeShort);
    },
    [footer, selectedLang]
  );

  /* ── Design Tokens & Styles ── */
  const teal = isDark ? "#14B8A6" : "#0E8584";
  const accent = isDark ? "#22D3EE" : "#0284C7";
  const green = isDark ? "#34D399" : "#10B981";
  const orange = isDark ? "#FBBF24" : "#D97706";
  const bgCard = isDark ? "#031E2A" : "#FFFFFF";
  const bgSticky = isDark ? "#021721" : "#FFFFFF";
  const bgHeader = isDark ? "#052938" : "#F8FAFC";
  const borderCol = isDark ? "rgba(20, 184, 166, 0.15)" : "#E2E8F0";

  const paperSx = useMemo(
    () => ({
      borderRadius: 3,
      border: `1px solid ${borderCol}`,
      backgroundColor: bgCard,
      boxShadow: isDark
        ? "0 8px 32px rgba(0,0,0,0.36)"
        : "0 2px 12px rgba(0,0,0,0.04)",
    }),
    [borderCol, bgCard, isDark]
  );

  const selectSx = useMemo(
    () => ({
      backgroundColor: isDark ? "rgba(20,184,166,0.06)" : "#FFFFFF",
      borderRadius: 2,
      "& .MuiOutlinedInput-notchedOutline": { borderColor: borderCol },
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: teal },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: teal },
    }),
    [isDark, borderCol, teal]
  );

  const headerCellSx = useMemo(
    () => ({
      fontWeight: 700,
      fontSize: 11.5,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: isDark ? "rgba(255,255,255,0.6)" : "#475569",
      borderBottom: `1px solid ${borderCol}`,
      py: 1.5,
      px: 1.5,
      whiteSpace: "nowrap",
      backgroundColor: bgHeader,
    }),
    [isDark, borderCol, bgHeader]
  );

  const bodyCellSx = useMemo(
    () => ({
      fontSize: 13,
      fontWeight: 500,
      color: isDark ? "rgba(255,255,255,0.85)" : "#334155",
      borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #F1F5F9",
      py: 1.2,
      px: 1.5,
      whiteSpace: "nowrap",
      fontFamily: "'Inter', sans-serif",
    }),
    [isDark]
  );

  const footerCellSx = useMemo(
    () => ({
      ...bodyCellSx,
      fontWeight: 700,
      fontSize: 13,
      backgroundColor: isDark ? "rgba(20,184,166,0.08)" : "#F0FDF4",
      borderBottom: "none",
      borderTop: isDark ? `2px solid rgba(20,184,166,0.3)` : `2px solid #CBD5E1`,
    }),
    [bodyCellSx, isDark]
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: 0,
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        pb: 6,
        pr: 0.5,
        "&::-webkit-scrollbar": { width: 6, height: 6 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: isDark ? "rgba(20,184,166,0.25)" : "#CBD5E1",
          borderRadius: 3,
        },
      }}
    >
      <Helmet>
        <title>{t("report.turkishAirlines.title")} | Oguz Travel</title>
      </Helmet>

      {/* 1. Header Toolbar (Day.js DatePicker) */}
      <ReportHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        teal={teal}
        borderCol={borderCol}
        paperSx={paperSx}
        selectSx={selectSx}
      />

      {/* 2. Summary KPI Cards (5 Cards) */}
      <ReportSummaryCards
        stats={stats}
        formatCompact={formatCompact}
        paperSx={paperSx}
        teal={teal}
        accent={accent}
        green={green}
        orange={orange}
      />

      {/* 3. Charts Section */}
      <ReportCharts
        isLoading={isLoading}
        barChartData={barChartData}
        officeBreakdown={officeBreakdown}
        formatNumber={formatNumber}
        monthQuoted={stats.monthQuoted}
        teal={teal}
        accent={accent}
        borderCol={borderCol}
        paperSx={paperSx}
      />

      {/* 4. Daily Report Table */}
      <ReportTable
        isLoading={isLoading}
        offices={offices}
        rows={rows}
        footer={footer}
        grandTotal={grandTotal}
        findFooter={findFooter}
        formatNumber={formatNumber}
        daysInMonth={daysInMonth}
        teal={teal}
        accent={accent}
        green={green}
        orange={orange}
        borderCol={borderCol}
        paperSx={paperSx}
        headerCellSx={headerCellSx}
        bodyCellSx={bodyCellSx}
        footerCellSx={footerCellSx}
        bgHeader={bgHeader}
        bgSticky={bgSticky}
      />
    </Box>
  );
};

export default TurkishAirlinesReport;
