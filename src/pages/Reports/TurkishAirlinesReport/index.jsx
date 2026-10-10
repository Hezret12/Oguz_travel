import { useCallback, useMemo, useState } from "react";
import { Box } from "@mui/material";
import dayjs from "dayjs";

import useReportData from "./hooks/useReportData";
import useReportTheme from "./hooks/useReportTheme";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { formatNumber, formatCompact } from "../../../functions/generalHelpers";
import { useQuery } from "@tanstack/react-query";
import { getTurkishQuarterApi } from "../../../api/queries/getters";
import { getQuarterOfDate, buildQuarterComparison } from "./functions/quarter";

import ReportHeader from "./Contents/ReportHeader";
import ReportSummaryCards from "./Contents/ReportSummaryCards";
import ReportCharts from "./Contents/ReportCharts";
import ReportTable from "./Contents/ReportTable";
import TurkishAirlinesExportModal from "./Contents/TurkishAirlinesExportModal";

const TurkishAirlinesReport = () => {
  useDocumentTitle("Turkish Airlines - Oguz Travel");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedQuarter, setSelectedQuarter] = useState(() => getQuarterOfDate(dayjs()));
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const {
    data: quarterRes,
    isFetching: isQuarterFetching,
    refetch: refetchQuarter,
    dataUpdatedAt: quarterUpdatedAt,
  } = useQuery({
    queryKey: ["turkish-quarter", selectedQuarter],
    queryFn: () => getTurkishQuarterApi({ quarter: selectedQuarter }),
  });

  const quarterComparison = useMemo(
    () => (quarterRes ? buildQuarterComparison(quarterRes.data) : null),
    [quarterRes]
  );

  const {
    isLoading,
    isFetching: isReportFetching,
    refetch: refetchReport,
    reportUpdatedAt,
    statusUpdatedAt,
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

  // The oldest of the loaded answers, so the time never claims fresher data than is on screen.
  const loadedTimes = [reportUpdatedAt, statusUpdatedAt, quarterUpdatedAt].filter(Boolean);
  const updatedAt = loadedTimes.length ? Math.min(...loadedTimes) : 0;
  const isFetching = isReportFetching || isQuarterFetching;
  const handleRefresh = useCallback(
    () => Promise.all([refetchReport(), refetchQuarter()]),
    [refetchReport, refetchQuarter]
  );

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
        updatedAt={updatedAt}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
        teal={colors.teal}
        borderCol={colors.border}
        paperSx={paperSx}
        selectSx={selectSx}
      />

      <ReportSummaryCards
        stats={stats}
        quarterComparison={quarterComparison}
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
        formatCompact={formatCompact}
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
