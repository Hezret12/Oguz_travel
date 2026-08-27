import { useState } from "react";
import { Box } from "@mui/material";
import dayjs from "dayjs";

import useReportData from "./hooks/useReportData";
import useReportTheme from "./hooks/useReportTheme";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { formatNumber, formatCompact } from "../../../functions/generalHelpers";
import { useQuery } from "@tanstack/react-query";
import { getTurkishQuarterApi } from "../../../api/queries/getters";

import ReportHeader from "./Contents/ReportHeader";
import ReportSummaryCards from "./Contents/ReportSummaryCards";
import ReportCharts from "./Contents/ReportCharts";
import ReportTable from "./Contents/ReportTable";
import TurkishAirlinesExportModal from "./Contents/TurkishAirlinesExportModal";

const getCurrentQuarter = () => Math.floor(new Date().getMonth() / 3) + 1;

const TurkishAirlinesReport = () => {
  useDocumentTitle("Turkish Airlines - Oguz Travel");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter());
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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
        onExportExcel={() => setIsExportModalOpen(true)}
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
        onExportExcel={() => setIsExportModalOpen(true)}
        teal={colors.teal}
        accent={colors.accent}
        green={colors.green}
        borderCol={colors.border}
        paperSx={paperSx}
        headerCellSx={headerCellSx}
        bodyCellSx={bodyCellSx}
        footerCellSx={footerCellSx}
        bgHeader={colors.bgHeader}
        bgSticky={colors.bgSticky}
      />

      {/* Excel Export Confirmation Modal */}
      <TurkishAirlinesExportModal
        open={isExportModalOpen}
        close={() => setIsExportModalOpen(false)}
        selectedDate={selectedDate}
        daysInMonth={daysInMonth}
        offices={offices}
        rows={rows}
        grandTotal={grandTotal}
        findFooter={findFooter}
      />
    </Box>
  );
};

export default TurkishAirlinesReport;
