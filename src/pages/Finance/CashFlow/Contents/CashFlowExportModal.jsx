import { useMemo, useState } from "react";
import { Box, ButtonBase, Chip, Grid, LinearProgress, Stack, Typography, alpha } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ArrowDownLeft, ArrowUpRight, CalendarRange, CircleAlert, FileSpreadsheet, Funnel, Hash } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import { usePagginationGet } from "../../../../hooks/usePagginationGet";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import FooterButton from "../../../../components/Dialog/FooterButton";
import { ExcelIcon } from "../../../../components/ExportExcelButton";
import { exportCashFlowExcel } from "../functions/exportCashFlowExcel";

const EXCEL_GREEN = "#107C41";
const CURRENCIES = ["TMT", "USD"];
// Page params the modal manages itself or that don't filter data
const NON_FILTER_KEYS = ["page", "limit", "pageSize", "date_from", "date_to", "source"];

const fmtNumber = (val) =>
  Number(val || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const toDayjs = (val) => (val && dayjs(val).isValid() ? dayjs(val) : null);

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

const PreviewStat = ({ icon: Icon, label, tone, loading, children }) => (
  <Box
    sx={(theme) => {
      const color = tone ? theme.palette[tone].main : theme.palette.text.secondary;
      return {
        p: 1.25,
        height: "100%",
        borderRadius: "10px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        opacity: loading ? 0.55 : 1,
        transition: "opacity 0.2s ease",
        "& .stat-head": { color },
      };
    }}
  >
    <Stack className="stat-head" direction="row" spacing={0.6} sx={{ alignItems: "center", mb: 0.5 }}>
      <Icon size={13} />
      <Typography sx={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </Typography>
    </Stack>
    {children}
  </Box>
);

const CurrencyLine = ({ currency, value }) => (
  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
    <Typography sx={{ width: 28, fontSize: "10.5px", fontWeight: 700, color: "text.secondary" }}>{currency}</Typography>
    <Typography sx={{ fontSize: "14px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
      {fmtNumber(value)}
    </Typography>
  </Box>
);

// Exports the table with the page's current tab + filters; only the period is chosen here.
export const CashFlowExportModal = ({ open, close, apiFn, queryParams = {}, isProjectTab, sourceLabel }) => {
  const { t, selectedLang } = useLocale();

  // Mounted only while open, so the page's date filter seeds the period once (default: this month)
  const hasPageDates = Boolean(queryParams?.date_from || queryParams?.date_to);
  const [startDate, setStartDate] = useState(() =>
    hasPageDates ? toDayjs(queryParams.date_from) : dayjs().startOf("month"),
  );
  const [endDate, setEndDate] = useState(() =>
    hasPageDates ? toDayjs(queryParams.date_to) : dayjs().endOf("month"),
  );
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(null);

  const exportParams = useMemo(() => {
    const params = {};
    Object.entries(queryParams).forEach(([k, v]) => {
      if (!["page", "limit", "pageSize", "date_from", "date_to"].includes(k) && v !== "" && v != null) params[k] = v;
    });
    if (startDate?.isValid()) params.date_from = startDate.format("YYYY-MM-DD");
    if (endDate?.isValid()) params.date_to = endDate.format("YYYY-MM-DD");
    return params;
  }, [queryParams, startDate, endDate]);

  const filterCount = Object.keys(exportParams).filter((k) => !NON_FILTER_KEYS.includes(k)).length;

  // Live preview of what lands in the file. Never cached: add/edit/delete on the
  // page don't invalidate this key, so a stale count would be misleading.
  const { totalItems, meta, isFetching } = usePagginationGet({
    apiFn,
    key: "cashFlowExportPreview",
    params: { ...exportParams, page: 1, limit: 1 },
    options: { staleTime: 0, gcTime: 0 },
  });

  const totals = Array.isArray(meta?.totals) ? meta.totals : [];
  const sumFor = (currency, field) =>
    totals.filter((c) => c.currency === currency).reduce((acc, c) => acc + Number(c[field] || 0), 0);
  const hasNoData = !isFetching && Number(totalItems) === 0;

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

    setIsExporting(true);
    setProgress({ message: t("finance.cashBook.export.fetching"), percent: 2 });
    try {
      await exportCashFlowExcel({ apiFn, params: exportParams, onProgress: setProgress, t, selectedLang });
      toast.success(t("finance.cashBook.export.success"));
      setIsExporting(false);
      close?.();
    } catch (err) {
      console.error("Cash flow Excel export error:", err);
      toast.error(err?.message || t("common.exportError"));
      setIsExporting(false);
      setProgress(null);
    }
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

  const incomeLabel = isProjectTab ? t("finance.totalSale") : t("finance.income");
  const expenseLabel = isProjectTab ? t("finance.totalCost") : t("finance.expense");

  return (
    <CustomDialog open={open} close={handleClose} widthX={640}>
      <CustomDialogHeader variant="h5" title={t("common.exportExcelModalTitle")} />

      <CustomForm onSubmit={handleExport}>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {/* Banner */}
          <Stack
            direction="row"
            spacing={1.75}
            sx={(theme) => ({
              alignItems: "center",
              p: 1.75,
              borderRadius: "12px",
              border: `1px solid ${alpha(EXCEL_GREEN, 0.22)}`,
              background: `linear-gradient(135deg, ${alpha(EXCEL_GREEN, 0.1)} 0%, ${alpha(
                theme.palette.primary.main,
                0.04,
              )} 100%)`,
            })}
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                flexShrink: 0,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "background.paper",
                border: `1px solid ${alpha(EXCEL_GREEN, 0.25)}`,
              }}
            >
              <ExcelIcon size={26} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "14.5px" }}>
                  {t("finance.cashBook.export.title")}
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
                {t("finance.cashBook.export.desc")}
              </Typography>
            </Box>
          </Stack>

          {/* Period */}
          <Box sx={{ p: 2, borderRadius: "12px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <Stack
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1.5 }}
            >
              <Stack direction="row" spacing={0.9} sx={{ alignItems: "center", color: "primary.main" }}>
                <CalendarRange size={16} />
                <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "13.5px" }}>
                  {t("finance.cashBook.export.period")}
                </Typography>
              </Stack>
              <Box
                sx={{
                  display: "flex",
                  gap: 0.4,
                  p: "3px",
                  borderRadius: "9px",
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
                        px: 1.25,
                        borderRadius: "7px",
                        fontSize: "12.5px",
                        fontWeight: active ? 700 : 500,
                        color: active ? "primary.main" : "text.secondary",
                        backgroundColor: active ? "background.paper" : "transparent",
                        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                        transition: "all 0.15s ease",
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
                {t("finance.cashBook.export.preview")}
              </Typography>
              <Stack direction="row" spacing={0.75}>
                {sourceLabel && (
                  <Chip size="small" label={sourceLabel} variant="outlined" sx={{ borderRadius: "7px", height: 24, fontWeight: 600 }} />
                )}
                {filterCount > 0 && (
                  <Chip
                    size="small"
                    icon={<Funnel size={12} />}
                    label={t("finance.cashBook.export.filtersApplied", { count: filterCount })}
                    variant="outlined"
                    color="primary"
                    sx={{ borderRadius: "7px", height: 24, fontWeight: 600 }}
                  />
                )}
              </Stack>
            </Stack>

            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <PreviewStat icon={Hash} label={t("finance.cashBook.export.records")} loading={isFetching}>
                  <Typography sx={{ fontSize: "20px", fontWeight: 800, fontVariantNumeric: "tabular-nums", lineHeight: 1.6 }}>
                    {new Intl.NumberFormat("en-US").format(Number(totalItems || 0))}
                  </Typography>
                </PreviewStat>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <PreviewStat icon={ArrowDownLeft} label={incomeLabel} tone="success" loading={isFetching}>
                  {CURRENCIES.map((c) => (
                    <CurrencyLine key={c} currency={c} value={sumFor(c, "income")} />
                  ))}
                </PreviewStat>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <PreviewStat icon={ArrowUpRight} label={expenseLabel} tone="error" loading={isFetching}>
                  {CURRENCIES.map((c) => (
                    <CurrencyLine key={c} currency={c} value={sumFor(c, "expense")} />
                  ))}
                </PreviewStat>
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
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600 }}>{t("common.exportExcelNoData")}</Typography>
              </Stack>
            )}
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

export default CashFlowExportModal;
