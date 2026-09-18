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
import {
  CalendarRange,
  CircleAlert,
  FileSpreadsheet,
  Hash,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import {
  getAllCafeteriaTransactionsApi,
  getCafeteriaSummaryApi,
} from "../../../api/queries/getters";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";
import { ExcelIcon } from "../../../components/ExportExcelButton";
import { exportCafeteriaExcel } from "../functions/exportCafeteriaExcel";

const EXCEL_GREEN = "#107C41";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const toDayjs = (val) => (val && dayjs(val).isValid() ? dayjs(val) : null);

const Section = ({ icon, title, action, children }) => (
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
      <Stack direction="row" spacing={0.9} sx={{ alignItems: "center", color: "primary.main" }}>
        {icon}
        <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "13.5px" }}>
          {title}
        </Typography>
      </Stack>
      {action}
    </Stack>
    {children}
  </Box>
);

const SegmentButton = ({ active, onClick, disabled, paletteKey = "primary", icon, children }) => (
  <ButtonBase
    type="button"
    onClick={onClick}
    disabled={disabled}
    sx={(theme) => {
      const color = theme.palette[paletteKey].main;
      return {
        py: 0.9,
        px: 1,
        gap: 0.6,
        borderRadius: "9px",
        border: "1px solid",
        fontSize: "12.5px",
        fontWeight: active ? 700 : 500,
        borderColor: active ? color : "transparent",
        color: active ? color : theme.palette.text.secondary,
        backgroundColor: active
          ? paletteKey === "primary"
            ? theme.palette.background.paper
            : alpha(color, 0.12)
          : "transparent",
        boxShadow: active ? `0 2px 8px ${alpha(color, 0.18)}` : "none",
        transition: "all 0.18s ease-in-out",
        "&:hover": { backgroundColor: alpha(color, active ? 0.14 : 0.06) },
      };
    }}
  >
    {icon}
    {children}
  </ButtonBase>
);

const PreviewStat = ({ icon, label, value, paletteKey, loading }) => (
  <Box
    sx={(theme) => {
      const color = paletteKey ? theme.palette[paletteKey].main : theme.palette.text.primary;
      return {
        p: 1.25,
        height: "100%",
        borderRadius: "10px",
        border: `1px solid ${alpha(color, 0.2)}`,
        backgroundColor: alpha(color, 0.05),
        color,
        opacity: loading ? 0.55 : 1,
        transition: "opacity 0.2s ease",
      };
    }}
  >
    <Stack direction="row" spacing={0.6} sx={{ alignItems: "center", mb: 0.4 }}>
      {icon}
      <Typography
        sx={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", opacity: 0.85 }}
      >
        {label}
      </Typography>
    </Stack>
    <Typography sx={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.01em", fontFamily: "'Inter', sans-serif" }}>
      {value}
    </Typography>
  </Box>
);

export const CafeteriaExportModal = ({ open, close, queryParams = {} }) => {
  const { t, selectedLang } = useLocale();

  // Modal is mounted only while open, so page filters seed the initial state once.
  // The type filter isn't editable here; the page's applied type filter is kept.
  const type = String(queryParams?.type ?? "");
  // Defaults to this month unless the page already has a date filter
  const hasPageDates = Boolean(queryParams?.start_date || queryParams?.end_date);
  const [startDate, setStartDate] = useState(() =>
    hasPageDates ? toDayjs(queryParams?.start_date) : dayjs().startOf("month")
  );
  const [endDate, setEndDate] = useState(() =>
    hasPageDates ? toDayjs(queryParams?.end_date) : dayjs().endOf("month")
  );
  const [search, setSearch] = useState(() => String(queryParams?.search ?? "").trim());
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(null);

  const exportParams = useMemo(() => {
    const params = {};
    if (startDate?.isValid()) params.start_date = startDate.format("YYYY-MM-DD");
    if (endDate?.isValid()) params.end_date = endDate.format("YYYY-MM-DD");
    if (type !== "") params.type = type;
    if (search) params.search = search;
    return params;
  }, [startDate, endDate, type, search]);

  // Live preview of what will land in the file
  const { data: summary, isFetching: isSummaryFetching } = useGet({
    apiFn: getCafeteriaSummaryApi,
    key: ["cafeteria-summary", exportParams],
    params: exportParams,
  });
  const { totalItems, isFetching: isCountFetching } = usePagginationGet({
    apiFn: getAllCafeteriaTransactionsApi,
    key: "cafeteriaExportCount",
    params: { ...exportParams, page: 1, limit: 1 },
  });

  const isPreviewLoading = isSummaryFetching || isCountFetching;
  const totalIncome = Number(summary?.totalIncome ?? 0);
  const totalExpense = Number(summary?.totalExpense ?? 0);
  const balance = Number(summary?.balance ?? totalIncome - totalExpense);
  const hasNoData = !isCountFetching && Number(totalItems) === 0;

  const presets = useMemo(() => {
    const lastMonth = dayjs().subtract(1, "month");
    return [
      { key: "thisMonth", label: t("cafeteria.export.thisMonth"), start: dayjs().startOf("month"), end: dayjs().endOf("month") },
      { key: "lastMonth", label: t("cafeteria.export.lastMonth"), start: lastMonth.startOf("month"), end: lastMonth.endOf("month") },
      { key: "thisYear", label: t("cafeteria.export.thisYear"), start: dayjs().startOf("year"), end: dayjs().endOf("year") },
      { key: "all", label: t("cafeteria.export.allTime"), start: null, end: null },
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

    setIsExporting(true);
    setProgress({ message: t("cafeteria.export.fetching"), percent: 2 });
    try {
      await exportCafeteriaExcel({
        params: exportParams,
        onProgress: setProgress,
        t,
        selectedLang,
      });
      toast.success(t("cafeteria.export.success"));
      setIsExporting(false);
      close?.();
    } catch (err) {
      console.error("Cafeteria Excel export error:", err);
      toast.error(err?.message || t("common.exportError"));
      setIsExporting(false);
      setProgress(null);
    }
  };

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
    <CustomDialog open={open} close={handleClose} widthX={680}>
      <CustomDialogHeader variant="h5" title={t("common.exportExcelModalTitle")} />

      <CustomForm onSubmit={handleExport}>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {/* Hero banner */}
          <Stack
            direction="row"
            spacing={1.8}
            sx={(theme) => ({
              alignItems: "center",
              p: 2,
              borderRadius: "12px",
              border: `1px solid ${alpha(EXCEL_GREEN, 0.22)}`,
              background: `linear-gradient(135deg, ${alpha(EXCEL_GREEN, 0.1)} 0%, ${alpha(
                theme.palette.primary.main,
                0.04
              )} 100%)`,
            })}
          >
            <Box
              sx={{
                width: 50,
                height: 50,
                flexShrink: 0,
                borderRadius: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "background.paper",
                border: `1px solid ${alpha(EXCEL_GREEN, 0.25)}`,
                boxShadow: `0 4px 14px ${alpha(EXCEL_GREEN, 0.18)}`,
              }}
            >
              <ExcelIcon size={28} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "14.5px" }}>
                  {t("cafeteria.export.modalTitle")}
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
              <Typography sx={{ color: "text.secondary", fontSize: "12px", mt: 0.3 }}>
                {t("cafeteria.export.modalDesc")}
              </Typography>
            </Box>
          </Stack>

          {/* Period */}
          <Section
            icon={<CalendarRange size={16} />}
            title={t("cafeteria.export.period")}
            action={
              <Box
                sx={{
                  display: "flex",
                  gap: 0.4,
                  p: "3px",
                  borderRadius: "9px",
                  backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.05),
                }}
              >
                {presets.map((p) => (
                  <SegmentButton
                    key={p.key}
                    active={isPresetActive(p)}
                    disabled={isExporting}
                    onClick={() => {
                      setStartDate(p.start);
                      setEndDate(p.end);
                    }}
                  >
                    {p.label}
                  </SegmentButton>
                ))}
              </Box>
            }
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderDatePicker(t("cafeteria.export.startDate"), startDate, setStartDate, {
                  maxDate: endDate || undefined,
                })}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderDatePicker(t("cafeteria.export.endDate"), endDate, setEndDate, {
                  minDate: startDate || undefined,
                })}
              </Grid>
            </Grid>
          </Section>

          {/* Live preview */}
          <Box>
            <Stack
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1 }}
            >
              <Typography
                sx={{
                  fontSize: "11.5px",
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {t("cafeteria.export.preview")}
              </Typography>
              {search && (
                <Chip
                  size="small"
                  icon={<Search size={13} />}
                  label={t("cafeteria.export.searchApplied", { value: search })}
                  onDelete={isExporting ? undefined : () => setSearch("")}
                  variant="outlined"
                  color="primary"
                  sx={{ borderRadius: "7px", height: 26, fontWeight: 500 }}
                />
              )}
            </Stack>
            <Grid container spacing={1}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <PreviewStat
                  icon={<Hash size={13} />}
                  label={t("cafeteria.export.records")}
                  value={new Intl.NumberFormat("en-US").format(Number(totalItems || 0))}
                  loading={isPreviewLoading}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <PreviewStat
                  icon={<TrendingUp size={13} />}
                  label={t("cafeteria.income")}
                  value={`+${formatMoney(totalIncome)}`}
                  paletteKey="success"
                  loading={isPreviewLoading}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <PreviewStat
                  icon={<TrendingDown size={13} />}
                  label={t("cafeteria.expense")}
                  value={`-${formatMoney(totalExpense)}`}
                  paletteKey="error"
                  loading={isPreviewLoading}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <PreviewStat
                  icon={<Wallet size={13} />}
                  label={t("cafeteria.balance")}
                  value={`${balance < 0 ? "-" : ""}${formatMoney(Math.abs(balance))}`}
                  paletteKey={balance < 0 ? "error" : "primary"}
                  loading={isPreviewLoading}
                />
              </Grid>
            </Grid>

            {hasNoData && (
              <Stack
                direction="row"
                spacing={1}
                sx={(theme) => ({
                  alignItems: "center",
                  mt: 1,
                  p: 1,
                  borderRadius: "9px",
                  color: theme.palette.warning.main,
                  backgroundColor: alpha(theme.palette.warning.main, 0.08),
                })}
              >
                <CircleAlert size={15} />
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600 }}>
                  {t("cafeteria.export.noData")}
                </Typography>
              </Stack>
            )}
          </Box>

          {/* Export progress */}
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
                  {progress?.message || t("loading")}
                </Typography>
                <Typography sx={{ color: EXCEL_GREEN, fontWeight: 800, fontSize: "13px" }}>
                  {`${progress?.percent || 0}%`}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress?.percent || 0}
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

export default CafeteriaExportModal;
