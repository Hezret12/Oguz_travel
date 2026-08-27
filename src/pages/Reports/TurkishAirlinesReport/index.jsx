import { useState, useCallback } from "react";
import { Box } from "@mui/material";
import dayjs from "dayjs";

import useReportData from "./hooks/useReportData";
import useReportTheme from "./hooks/useReportTheme";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { formatNumber, formatCompact } from "../../../functions/generalHelpers";
import { useQuery } from "@tanstack/react-query";
import { getTurkishQuarterApi } from "../../../api/queries/getters";
import { exportTurkishAirlinesExcel } from "./functions/exportTurkishAirlinesExcel";

import ReportHeader from "./Contents/ReportHeader";
import ReportSummaryCards from "./Contents/ReportSummaryCards";
import ReportCharts from "./Contents/ReportCharts";
import ReportTable from "./Contents/ReportTable";

const getCurrentQuarter = () => Math.floor(new Date().getMonth() / 3) + 1;

const TurkishAirlinesReport = () => {
  useDocumentTitle("Turkish Airlines - Oguz Travel");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter());

  const { data: quarterRes } = useQuery({
    queryKey: ["turkish-quarter", selectedQuarter],
    queryFn: () => getTurkishQuarterApi({ quarter: selectedQuarter }),
  });

  const quarterData = quarterRes?.data || {};
  const achievementPercentage = quarterData?.achievement_percentage || "0%";

  const {
    isLoading,
    isStatusLoading,
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
  } = useReportData(selectedDate);

  const {
    colors,
    paperSx,
    selectSx,
    headerCellSx,
    bodyCellSx,
    footerCellSx,
  } = useReportTheme();

  const handleExportExcel = useCallback(async () => {
    try {
      await exportTurkishAirlinesExcel({
        selectedDate,
        daysInMonth,
        offices,
        rows,
        footer,
        grandTotal,
        findFooter,
      });
    } catch (err) {
      console.error("Turkish Airlines Excel export error:", err);
    }
  }, [selectedDate, daysInMonth, offices, rows, footer, grandTotal, findFooter]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        pb: 8,
      }}
    >
      <ReportHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedQuarter={selectedQuarter}
        onQuarterChange={setSelectedQuarter}
        onExportExcel={handleExportExcel}
        teal={colors.teal}
        borderCol={colors.border}
        paperSx={paperSx}
        selectSx={selectSx}
      />

      <ReportSummaryCards
        stats={stats}
        achievementPercentage={achievementPercentage}
        formatCompact={formatCompact}
        paperSx={paperSx}
        teal={colors.teal}
        accent={colors.accent}
        green={colors.green}
        orange={colors.orange}
      />

      <ReportCharts
        isLoading={isLoading}
        isStatusLoading={isStatusLoading}
        barChartData={barChartData}
        officeBreakdown={officeBreakdown}
        statusChartData={statusChartData}
        formatNumber={formatNumber}
        monthQuoted={stats.monthQuoted}
        selectedQuarter={selectedQuarter}
        onQuarterChange={setSelectedQuarter}
        teal={colors.teal}
        accent={colors.accent}
        borderCol={colors.border}
        paperSx={paperSx}
      />

      <ReportTable
        isLoading={isLoading}
        offices={offices}
        rows={rows}
        footer={footer}
        grandTotal={grandTotal}
        findFooter={findFooter}
        formatNumber={formatNumber}
        daysInMonth={daysInMonth}
        onExportExcel={handleExportExcel}
        teal={colors.teal}
        accent={colors.accent}
        green={colors.green}
        orange={colors.orange}
        borderCol={colors.border}
        paperSx={paperSx}
        headerCellSx={headerCellSx}
        bodyCellSx={bodyCellSx}
        footerCellSx={footerCellSx}
        bgHeader={colors.bgHeader}
        bgSticky={colors.bgSticky}
      />
    </Box>
  );
};

export default TurkishAirlinesReport;
