import { useMemo, useState } from "react";
import { Box, Grid, LinearProgress, Stack, Typography, alpha } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";
import { getInboundSummaryApi } from "../../../api/queries/getters";
import { INBOUND_SUMMARY_KEY } from "../constants";
import {
  expectedMonthOf,
  exportInboundExcel,
  monthRangeParams,
} from "../functions/exportInboundExcel";

const EXCEL_GREEN = "#107C41";

const SheetStat = ({ title, period, value }) => (
  <Box
    sx={(theme) => ({
      p: 1.25,
      height: "100%",
      borderRadius: "10px",
      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
    })}
  >
    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "primary.main", textTransform: "uppercase" }}>
      {title}
    </Typography>
    <Typography sx={{ fontSize: "11.5px", color: "text.secondary" }}>{period}</Typography>
    <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "text.primary", mt: 0.4 }}>
      {value}
    </Typography>
  </Box>
);

/**
 * Monthly report export. One month is picked; the workbook holds that month's
 * received tourists and invitation results, plus the tourists expected in the
 * month after it — the way the report is filed.
 */
const InboundExportModal = ({ open, close, queryParams = {} }) => {
  const { t } = useLocale();
  // Modal is mounted only while open, so the page's date filter seeds the month once.
  const [month, setMonth] = useState(() =>
    (queryParams?.start_date && dayjs(queryParams.start_date).isValid()
      ? dayjs(queryParams.start_date)
      : dayjs()
    ).startOf("month"),
  );
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(null);

  const isMonthValid = Boolean(month?.isValid());
  const expectedMonth = isMonthValid ? expectedMonthOf(month) : null;

  const monthParams = useMemo(() => (isMonthValid ? monthRangeParams(month) : {}), [isMonthValid, month]);
  const expectedParams = useMemo(
    () => (isMonthValid ? monthRangeParams(expectedMonthOf(month)) : {}),
    [isMonthValid, month],
  );

  const { data: monthSummary, isFetching: isMonthFetching } = useGet({
    apiFn: getInboundSummaryApi,
    key: INBOUND_SUMMARY_KEY,
    params: monthParams,
    options: { enabled: isMonthValid },
  });
  const { data: expectedSummary, isFetching: isExpectedFetching } = useGet({
    apiFn: getInboundSummaryApi,
    key: INBOUND_SUMMARY_KEY,
    params: expectedParams,
    options: { enabled: isMonthValid },
  });

  const isCounting = isMonthFetching || isExpectedFetching;
  const expectedCount = Number(expectedSummary?.expected?.tourists) || 0;
  const arrivalsCount = Number(monthSummary?.arrivals?.total) || 0;
  const invitationsCount = Number(monthSummary?.invitations?.submitted) || 0;
  const hasNoData = isMonthValid && !isCounting && !expectedCount && !arrivalsCount && !invitationsCount;

  const handleClose = () => {
    if (isExporting) return;
    close?.();
  };

  const handleExport = async (e) => {
    e?.preventDefault?.();
    if (isExporting || !isMonthValid) return;

    setIsExporting(true);
    setProgress({ message: t("inbound.export.fetching"), percent: 2 });
    try {
      await exportInboundExcel({ month, t, onProgress: setProgress });
      toast.success(t("inbound.export.success"));
      setIsExporting(false);
      close?.();
    } catch (err) {
      console.error("Inbound Excel export error:", err);
      toast.error(err?.message || t("common.exportError"));
      setIsExporting(false);
      setProgress(null);
    }
  };

  const people = (count) => t("inbound.export.people", { count });

  return (
    <CustomDialog open={open} close={handleClose} widthX={600}>
      <CustomDialogHeader variant="h5" title={t("common.exportExcelModalTitle")} />

      <CustomForm handleSubmit={handleExport}>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Typography sx={{ color: "text.secondary", fontSize: "13px" }}>
            {t("inbound.export.modalDesc")}
          </Typography>

          <Box>
            <Typography sx={{ mb: 0.75, fontWeight: 600, color: "text.primary", fontSize: "13px" }}>
              {t("inbound.fields.reportMonth")}
            </Typography>
            <DatePicker
              value={month}
              onChange={(value) => setMonth(value ? value.startOf("month") : value)}
              views={["year", "month"]}
              format="MM.YYYY"
              disabled={isExporting}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Box>

          {isMonthValid && (
            <Grid container spacing={1} sx={{ opacity: isCounting ? 0.5 : 1, transition: "opacity 0.2s ease" }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SheetStat
                  title={t("inbound.tabs.arrivals")}
                  period={month.format("MM.YYYY")}
                  value={people(arrivalsCount)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SheetStat
                  title={t("inbound.tabs.invitations")}
                  period={month.format("MM.YYYY")}
                  value={people(invitationsCount)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SheetStat
                  title={t("inbound.tabs.expected")}
                  period={expectedMonth.format("MM.YYYY")}
                  value={people(expectedCount)}
                />
              </Grid>
            </Grid>
          )}

          {hasNoData && (
            <Typography sx={{ color: "warning.main", fontSize: "13px", fontWeight: 600 }}>
              {t("common.exportExcelNoData")}
            </Typography>
          )}

          {isExporting && (
            <Box>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "12.5px" }}>
                  {progress?.message || t("loading")}
                </Typography>
                <Typography sx={{ color: EXCEL_GREEN, fontWeight: 800, fontSize: "13px" }}>
                  {`${progress?.percent || 0}%`}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress?.percent || 0}
                sx={{ height: 7, borderRadius: 4 }}
              />
            </Box>
          )}
        </Stack>

        <FooterButton
          loading={isExporting}
          disabled={isExporting || !isMonthValid || hasNoData}
          onCancel={handleClose}
          icon={<FileSpreadsheet size={18} />}
          saveText={t("common.exportExcelBtn")}
          cancelText={t("cancel")}
          saveButtonSx={{
            backgroundColor: EXCEL_GREEN,
            "&:hover": { backgroundColor: "#0D6535" },
          }}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default InboundExportModal;
