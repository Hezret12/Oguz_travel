import { useMemo, useState } from "react";
import {
  Box,
  ButtonBase,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { CalendarRange, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useLocale } from "../../hooks/useLocale";
import { CustomDialog } from "./CustomDialog";
import { CustomDialogHeader } from "./CustomDialogHeader";
import { CustomForm } from "./CustomForm";
import FooterButton from "./FooterButton";
import { ExcelIcon } from "../ExportExcelButton";
import { fetchAllPaginatedData } from "../../functions/excelExportHelper";

const EXCEL_GREEN = "#107C41";

/**
 * Excel export driven only by a start/end date the user picks in the modal.
 * Page filters (search, status, operator, …) are intentionally NOT applied —
 * the API receives just `start_date` / `end_date`.
 *
 * `exportFn(items, { fileName, sheetName, startDate, endDate })` builds the file.
 */
export const DateRangeExcelExportModal = ({
  open,
  close,
  apiFn,
  exportFn,
  title,
  fileName = "Export",
  sheetName = "Hasabat",
}) => {
  const { t } = useLocale();

  const [startDate, setStartDate] = useState(() => dayjs().startOf("month"));
  const [endDate, setEndDate] = useState(() => dayjs().endOf("month"));
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(null);

  const presets = useMemo(() => {
    const lastMonth = dayjs().subtract(1, "month");
    return [
      { key: "thisMonth", label: t("common.exportThisMonth"), start: dayjs().startOf("month"), end: dayjs().endOf("month") },
      { key: "lastMonth", label: t("common.exportLastMonth"), start: lastMonth.startOf("month"), end: lastMonth.endOf("month") },
      { key: "thisYear", label: t("common.exportThisYear"), start: dayjs().startOf("year"), end: dayjs().endOf("year") },
      { key: "all", label: t("common.exportAllTime"), start: null, end: null },
    ];
  }, [t]);

  const isPresetActive = (p) =>
    p.start
      ? Boolean(startDate?.isSame(p.start, "day") && endDate?.isSame(p.end, "day"))
      : !startDate && !endDate;

  const handleClose = () => {
    if (isExporting) return;
    close?.();
  };

  const handleExport = async (e) => {
    e?.preventDefault?.();
    if (isExporting) return;

    const params = {};
    if (startDate?.isValid()) params.start_date = startDate.format("YYYY-MM-DD");
    if (endDate?.isValid()) params.end_date = endDate.format("YYYY-MM-DD");

    setIsExporting(true);
    setProgress({ loaded: 0, total: 0 });
    try {
      const items = await fetchAllPaginatedData(
        apiFn,
        params,
        (loaded, total) => setProgress({ loaded, total }),
        100
      );

      if (!items?.length) {
        toast.error(t("common.noDataToExport"));
        setIsExporting(false);
        setProgress(null);
        return;
      }

      await exportFn(items, {
        fileName,
        sheetName,
        startDate: params.start_date,
        endDate: params.end_date,
      });

      toast.success(t("common.excelExportSuccess"));
      setIsExporting(false);
      close?.();
    } catch (err) {
      console.error("Excel export error:", err);
      toast.error(err?.message || t("common.exportError"));
      setIsExporting(false);
      setProgress(null);
    }
  };

  const percent =
    progress?.total > 0 ? Math.min(100, Math.round((progress.loaded / progress.total) * 100)) : 0;

  const datePickerSx = {
    "& .MuiInputBase-root": {
      fontSize: "0.875rem",
      height: "40px",
      minHeight: "40px",
      borderRadius: "9px",
      backgroundColor: "background.paper",
    },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
    "& .MuiInputAdornment-root .MuiIconButton-root": { color: "primary.main", padding: "4px" },
  };

  const renderDatePicker = (label, value, setValue, extra) => (
    <>
      <Typography sx={{ display: "block", mb: 0.6, fontWeight: 600, color: "text.secondary", fontSize: "12px" }}>
        {label}
      </Typography>
      <DatePicker
        value={value}
        onChange={(val) => setValue(val && val.isValid() ? val : null)}
        format="DD.MM.YYYY"
        disabled={isExporting}
        {...extra}
        slotProps={{
          field: { clearable: true, onClear: () => setValue(null) },
          textField: { fullWidth: true, size: "small", placeholder: "DD.MM.YYYY", sx: datePickerSx },
        }}
      />
    </>
  );

  return (
    <CustomDialog open={open} close={handleClose} widthX={660}>
      <CustomDialogHeader variant="h5" title={title || t("common.exportExcelModalTitle")} />

      <CustomForm onSubmit={handleExport}>
        <Stack spacing={2.2} sx={{ pt: 0.5 }}>
          {/* Header banner */}
          <Stack
            direction="row"
            spacing={1.8}
            sx={(theme) => ({
              alignItems: "center",
              p: 2,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              background: `linear-gradient(135deg, ${alpha(theme.palette.text.primary, 0.02)} 0%, ${alpha(
                theme.palette.text.primary,
                0.05
              )} 100%)`,
            })}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha(EXCEL_GREEN, 0.1),
                border: `1px solid ${alpha(EXCEL_GREEN, 0.2)}`,
                boxShadow: `0 2px 10px ${alpha(EXCEL_GREEN, 0.12)}`,
              }}
            >
              <ExcelIcon size={26} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "14.5px" }}>
                  {title || t("common.exportExcelModalTitle")}
                </Typography>
                <Chip
                  label="XLSX"
                  size="small"
                  sx={{
                    height: 19,
                    fontSize: "10.5px",
                    fontWeight: 800,
                    borderRadius: "5px",
                    color: EXCEL_GREEN,
                    backgroundColor: alpha(EXCEL_GREEN, 0.14),
                  }}
                />
              </Stack>
              <Typography sx={{ color: "text.secondary", fontSize: "12px", mt: 0.2 }}>
                {t("common.exportPeriodDesc")}
              </Typography>
            </Box>
          </Stack>

          {/* Date range */}
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <Stack
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1.5 }}
            >
              <Stack direction="row" spacing={0.8} sx={{ alignItems: "center", color: "primary.main" }}>
                <CalendarRange size={16} />
                <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "13.5px" }}>
                  {t("common.exportDateRange")}
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  p: "4px",
                  borderRadius: "10px",
                  backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.05),
                }}
              >
                {presets.map((p) => {
                  const active = isPresetActive(p);
                  return (
                    <ButtonBase
                      key={p.key}
                      type="button"
                      disabled={isExporting}
                      onClick={() => {
                        setStartDate(p.start);
                        setEndDate(p.end);
                      }}
                      sx={{
                        py: 0.75,
                        px: 1.6,
                        borderRadius: "7px",
                        fontSize: "13px",
                        fontWeight: active ? 700 : 500,
                        color: active ? "primary.main" : "text.secondary",
                        backgroundColor: active ? "background.paper" : "transparent",
                        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          backgroundColor: (theme) =>
                            active ? theme.palette.background.paper : alpha(theme.palette.text.primary, 0.06),
                        },
                      }}
                    >
                      {p.label}
                    </ButtonBase>
                  );
                })}
              </Box>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderDatePicker(t("common.exportStartDate"), startDate, setStartDate, {
                  maxDate: endDate || undefined,
                })}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderDatePicker(t("common.exportEndDate"), endDate, setEndDate, {
                  minDate: startDate || undefined,
                })}
              </Grid>
            </Grid>
          </Box>

          {/* Progress */}
          {isExporting && (
            <Box
              sx={{
                p: 1.75,
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.02),
              }}
            >
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "12.5px" }}>
                  {progress?.total > 0 ? `${t("loading")} ${progress.loaded} / ${progress.total}` : t("loading")}
                </Typography>
                <Typography sx={{ color: EXCEL_GREEN, fontWeight: 800, fontSize: "13px" }}>{`${percent}%`}</Typography>
              </Stack>
              <LinearProgress
                variant={progress?.total > 0 ? "determinate" : "indeterminate"}
                value={percent}
                sx={(theme) => ({
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.text.primary, 0.08),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${EXCEL_GREEN} 0%, #22C55E 100%)`,
                  },
                })}
              />
            </Box>
          )}
        </Stack>

        <FooterButton
          loading={isExporting}
          disabled={isExporting}
          onCancel={handleClose}
          icon={<FileSpreadsheet size={18} />}
          saveText={t("common.exportExcelBtn")}
          cancelText={t("cancel")}
          saveButtonSx={{
            backgroundColor: EXCEL_GREEN,
            border: "0.5px solid #16A34A",
            boxShadow: `0 2px 8px ${alpha(EXCEL_GREEN, 0.3)}`,
            "&:hover": {
              backgroundColor: "#0D6535",
              transform: "translateY(-1px)",
              boxShadow: `0 4px 14px ${alpha(EXCEL_GREEN, 0.36)}`,
            },
          }}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default DateRangeExcelExportModal;
