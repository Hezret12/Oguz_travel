import { useState } from "react";
import { Box } from "@mui/material";
import { Helmet } from "react-helmet-async";
import dayjs from "dayjs";

import { useLocale } from "../../../hooks/useLocale";
import useReportData from "./hooks/useReportData";
import useReportTheme from "./hooks/useReportTheme";
import { formatNumber, formatCompact } from "../../../functions/generalHelpers";

import ReportHeader from "./Contents/ReportHeader";
import ReportSummaryCards from "./Contents/ReportSummaryCards";
import ReportCharts from "./Contents/ReportCharts";
import ReportTable from "./Contents/ReportTable";

const scrollbarSx = {
  "&::-webkit-scrollbar": { width: 6, height: 6 },
  "&::-webkit-scrollbar-thumb": { borderRadius: 3 },
};

const TurkishAirlinesReport = () => {
  const { t } = useLocale();
  const [selectedDate, setSelectedDate] = useState(dayjs());

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
    isDark,
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
        ...scrollbarSx,
        "&::-webkit-scrollbar-thumb": {
          ...scrollbarSx["&::-webkit-scrollbar-thumb"],
          backgroundColor: isDark ? "rgba(20,184,166,0.25)" : "#CBD5E1",
        },
      }}
    >
      <Helmet>
        <title>Turkish Airlines • Oguz Travel</title>
      </Helmet>

      <ReportHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        teal={colors.teal}
        borderCol={colors.border}
        paperSx={paperSx}
        selectSx={selectSx}
      />

      <ReportSummaryCards
        stats={stats}
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
