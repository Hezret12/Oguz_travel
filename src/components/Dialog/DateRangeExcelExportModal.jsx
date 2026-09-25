import { memo, useCallback, useMemo, useState } from "react";
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
import { CalendarRange, CircleAlert, FileSpreadsheet, Hash } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useLocale } from "../../hooks/useLocale";
import { CustomDialog } from "./CustomDialog";
import { CustomDialogHeader } from "./CustomDialogHeader";
import { CustomForm } from "./CustomForm";
import FooterButton from "./FooterButton";
import { ExcelIcon } from "../ExportExcelButton";
import { fetchAllPaginatedData } from "../../functions/excelExportHelper";
import { usePagginationGet } from "../../hooks/usePagginationGet";

const EXCEL_GREEN = "#107C41";

const DEFAULT_RANGES = [
  { key: "date", startParamKey: "start_date", endParamKey: "end_date", defaultPreset: "thisMonth" },
];

const getPresetRange = (presetKey) => {
  const lastMonth = dayjs().subtract(1, "month");
  switch (presetKey) {
    case "thisMonth":
      return { start: dayjs().startOf("month"), end: dayjs().endOf("month") };
    case "lastMonth":
      return { start: lastMonth.startOf("month"), end: lastMonth.endOf("month") };
    case "thisYear":
      return { start: dayjs().startOf("year"), end: dayjs().endOf("year") };
    default:
      return { start: null, end: null };
  }
};

const PRESET_KEYS = [
  { key: "thisMonth", labelKey: "common.exportThisMonth" },
  { key: "lastMonth", labelKey: "common.exportLastMonth" },
  { key: "thisYear", labelKey: "common.exportThisYear" },
  { key: "all", labelKey: "common.exportAllTime" },
];

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

const sectionSx = {
  p: 2,
  borderRadius: "12px",
  border: "1px solid",
  borderColor: "divider",
  backgroundColor: "background.paper",
};

const presetGroupSx = {
  display: "flex",
  gap: 0.5,
  p: "4px",
  borderRadius: "10px",
  backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.05),
};

const RangeDatePicker = ({ label, value, onChange, disabled, minDate, maxDate }) => (
  <>
    <Typography sx={{ display: "block", mb: 0.6, fontWeight: 600, color: "text.secondary", fontSize: "12px" }}>
      {label}
    </Typography>
    <DatePicker
      value={value}
      onChange={(val) => onChange(val && val.isValid() ? val : null)}
      format="DD.MM.YYYY"
      disabled={disabled}
      minDate={minDate || undefined}
      maxDate={maxDate || undefined}
      slotProps={{
        field: { clearable: true, onClear: () => onChange(null) },
        textField: { fullWidth: true, size: "small", placeholder: "DD.MM.YYYY", sx: datePickerSx },
      }}
    />
  </>
);

// One date range block (title + presets + start/end pickers). Memoized so
// editing one range doesn't re-render the others.
export const DateRangeSection = memo(({ rangeKey, title, start, end, disabled, onChange }) => {
  const { t } = useLocale();

  const isPresetActive = (presetKey) => {
    if (presetKey === "all") return !start && !end;
    const p = getPresetRange(presetKey);
    return Boolean(start?.isSame(p.start, "day") && end?.isSame(p.end, "day"));
  };

  return (
    <Box sx={sectionSx}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1.5 }}
      >
        <Stack direction="row" spacing={0.8} sx={{ alignItems: "center", color: "primary.main" }}>
          <CalendarRange size={16} />
          <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "13.5px" }}>{title}</Typography>
        </Stack>

        <Box sx={presetGroupSx}>
          {PRESET_KEYS.map(({ key, labelKey }) => {
            const active = isPresetActive(key);
            return (
              <ButtonBase
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onChange(rangeKey, getPresetRange(key))}
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
                {t(labelKey)}
              </ButtonBase>
            );
          })}
        </Box>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <RangeDatePicker
            label={t("common.exportStartDate")}
            value={start}
            maxDate={end}
            disabled={disabled}
            onChange={(val) => onChange(rangeKey, { start: val, end })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <RangeDatePicker
            label={t("common.exportEndDate")}
            value={end}
            minDate={start}
            disabled={disabled}
            onChange={(val) => onChange(rangeKey, { start, end: val })}
          />
        </Grid>
      </Grid>
    </Box>
  );
});
DateRangeSection.displayName = "DateRangeSection";

/**
 * Excel export driven only by the date range(s) the user picks in the modal.
 * Page filters (search, status, operator, …) are intentionally NOT applied —
 * the API receives just the date params of each range.
 *
 * `ranges`: [{ key, titleKey?, startParamKey, endParamKey, defaultPreset? }]
 *   defaultPreset: "thisMonth" | "lastMonth" | "thisYear" | "all" (not applied)
 *   Defaults to a single `start_date` / `end_date` range starting on this month.
 *
 * `exportFn(items, { fileName, sheetName, params })` builds the file.
 * `pageSize`: rows per request while collecting the data (the API's max).
 */
export const DateRangeExcelExportModal = ({
  open,
  close,
  apiFn,
  exportFn,
  title,
  fileName = "Export",
  sheetName = "Hasabat",
  ranges = DEFAULT_RANGES,
  pageSize = 100,
}) => {
  const { t } = useLocale();

  // Modal is mounted only while open, so `ranges` seeds the initial state once
  const [rangeValues, setRangeValues] = useState(() =>
    Object.fromEntries(ranges.map((r) => [r.key, getPresetRange(r.defaultPreset || "thisMonth")]))
  );
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(null);

  const handleRangeChange = useCallback((rangeKey, value) => {
    setRangeValues((prev) => ({ ...prev, [rangeKey]: value }));
  }, []);

  const params = useMemo(() => {
    const p = {};
    ranges.forEach((r) => {
      const { start, end } = rangeValues[r.key] || {};
      if (start?.isValid()) p[r.startParamKey] = start.format("YYYY-MM-DD");
      if (end?.isValid()) p[r.endParamKey] = end.format("YYYY-MM-DD");
    });
    return p;
  }, [ranges, rangeValues]);

  // Live record count for the selected range(s) (limit=1 → only totalItems is needed).
  // Never served from cache: the global staleTime is 30 min and page mutations
  // don't invalidate this key, so deleted/added rows would show a stale count.
  const { totalItems, isFetching: isCountFetching, isError: isCountError } = usePagginationGet({
    apiFn,
    key: ["excelExportCount", fileName],
    params: { ...params, page: 1, limit: 1 },
    options: { staleTime: 0, gcTime: 0 },
  });
  const recordCount = Number(totalItems) || 0;
  const hasNoData = !isCountFetching && !isCountError && recordCount === 0;

  const handleClose = () => {
    if (isExporting) return;
    close?.();
  };

  const handleExport = async (e) => {
    e?.preventDefault?.();
    if (isExporting) return;

    setIsExporting(true);
    setProgress({ loaded: 0, total: 0 });
    try {
      const items = await fetchAllPaginatedData(
        apiFn,
        params,
        (loaded, total) => setProgress({ loaded, total }),
        pageSize
      );

      if (!items?.length) {
        toast.error(t("common.noDataToExport"));
        setIsExporting(false);
        setProgress(null);
        return;
      }

      await exportFn(items, { fileName, sheetName, params });

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

          {/* Date range(s) */}
          {ranges.map((r) => (
            <DateRangeSection
              key={r.key}
              rangeKey={r.key}
              title={r.titleKey ? t(r.titleKey) : t("common.exportDateRange")}
              start={rangeValues[r.key]?.start ?? null}
              end={rangeValues[r.key]?.end ?? null}
              disabled={isExporting}
              onChange={handleRangeChange}
            />
          ))}

          {/* Record count for the selected range(s) */}
          <Stack
            direction="row"
            spacing={1.25}
            sx={(theme) => {
              const color = hasNoData ? theme.palette.warning.main : EXCEL_GREEN;
              return {
                alignItems: "center",
                px: 2,
                py: 1.5,
                borderRadius: "12px",
                border: `1px solid ${alpha(color, 0.25)}`,
                backgroundColor: alpha(color, 0.06),
              };
            }}
          >
            <Box
              sx={(theme) => ({
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: hasNoData ? theme.palette.warning.main : EXCEL_GREEN,
                backgroundColor: alpha(hasNoData ? theme.palette.warning.main : EXCEL_GREEN, 0.12),
              })}
            >
              {hasNoData ? <CircleAlert size={18} /> : <Hash size={18} />}
            </Box>
            <Typography sx={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "text.secondary" }}>
              {hasNoData ? t("common.exportExcelNoData") : t("common.exportRecordCount")}
            </Typography>
            {!hasNoData && (
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: EXCEL_GREEN,
                  fontFamily: "'Inter', sans-serif",
                  opacity: isCountFetching ? 0.45 : 1,
                  transition: "opacity 0.2s ease",
                }}
              >
                {isCountError ? "—" : new Intl.NumberFormat("en-US").format(recordCount)}
              </Typography>
            )}
          </Stack>

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
          disabled={isExporting || hasNoData}
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
