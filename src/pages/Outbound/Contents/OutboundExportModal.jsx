import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Checkbox,
  LinearProgress,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Building2,
  PlaneTakeoff,
  TrainFront,
  Compass,
  Car,
  Package,
  FileSpreadsheet,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";
import { ExcelIcon } from "../../../components/ExportExcelButton";
import { exportOutboundExcel } from "../functions/exportOutboundExcel";

const SERVICE_CONFIGS = [
  { key: "hotel", labelKey: "outbound.hotel", icon: Building2, color: "#0E8584" },
  { key: "airway", labelKey: "outbound.airway", icon: PlaneTakeoff, color: "#0284C7" },
  { key: "railway", labelKey: "outbound.railway", icon: TrainFront, color: "#6366F1" },
  { key: "tour", labelKey: "outbound.tour", icon: Compass, color: "#059669" },
  { key: "transfer", labelKey: "outbound.transfer", icon: Car, color: "#D97706" },
  { key: "package", labelKey: "outbound.package", icon: Package, color: "#8B5CF6" },
];

export const OutboundExportModal = ({
  open,
  close,
  queryParams = {},
}) => {
  const { t, selectedLang } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Selected services state: all checked by default
  const [selectedServices, setSelectedServices] = useState({
    hotel: true,
    airway: true,
    railway: true,
    tour: true,
    transfer: true,
    package: true,
  });

  // Date range state (initialized with queryParams if provided)
  const [startDate, setStartDate] = useState(() =>
    queryParams?.start_date && dayjs(queryParams.start_date).isValid()
      ? dayjs(queryParams.start_date)
      : null
  );
  const [endDate, setEndDate] = useState(() =>
    queryParams?.end_date && dayjs(queryParams.end_date).isValid()
      ? dayjs(queryParams.end_date)
      : null
  );

  const includeSummary = true;
  const [isExporting, setIsExporting] = useState(false);
  const [progressInfo, setProgressInfo] = useState(null);

  // Selected keys array
  const selectedKeys = useMemo(
    () => Object.keys(selectedServices).filter((k) => selectedServices[k]),
    [selectedServices]
  );

  const handleToggleService = (key) => {
    setSelectedServices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };


  // Quick Date Presets
  const activePreset = useMemo(() => {
    if (!startDate && !endDate) return "all";
    if (
      startDate &&
      endDate &&
      startDate.isSame(dayjs().startOf("month"), "day") &&
      endDate.isSame(dayjs().endOf("month"), "day")
    ) {
      return "thisMonth";
    }
    const lastM = dayjs().subtract(1, "month");
    if (
      startDate &&
      endDate &&
      startDate.isSame(lastM.startOf("month"), "day") &&
      endDate.isSame(lastM.endOf("month"), "day")
    ) {
      return "lastMonth";
    }
    if (
      startDate &&
      endDate &&
      startDate.isSame(dayjs().startOf("year"), "day") &&
      endDate.isSame(dayjs().endOf("year"), "day")
    ) {
      return "thisYear";
    }
    return "custom";
  }, [startDate, endDate]);

  const handleSetThisMonth = () => {
    setStartDate(dayjs().startOf("month"));
    setEndDate(dayjs().endOf("month"));
  };

  const handleSetLastMonth = () => {
    const lastMonth = dayjs().subtract(1, "month");
    setStartDate(lastMonth.startOf("month"));
    setEndDate(lastMonth.endOf("month"));
  };

  const handleSetThisYear = () => {
    setStartDate(dayjs().startOf("year"));
    setEndDate(dayjs().endOf("year"));
  };

  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleClose = () => {
    if (isExporting) return;
    setProgressInfo(null);
    close?.();
  };

  const handleExport = async (e) => {
    e?.preventDefault?.();
    if (isExporting) return;

    if (selectedKeys.length === 0) {
      toast.error(t("outbound.noServicesSelected"));
      return;
    }

    setIsExporting(true);
    setProgressInfo({
      phase: "starting",
      message: t("loading"),
      percent: 5,
    });

    try {
      const effectiveQueryParams = {
        ...queryParams,
        start_date:
          startDate && dayjs(startDate).isValid()
            ? dayjs(startDate).format("YYYY-MM-DD")
            : undefined,
        end_date:
          endDate && dayjs(endDate).isValid()
            ? dayjs(endDate).format("YYYY-MM-DD")
            : undefined,
      };

      await exportOutboundExcel({
        selectedServiceKeys: selectedKeys,
        queryParams: effectiveQueryParams,
        includeSummary,
        onProgress: (info) => setProgressInfo(info),
        t,
        selectedLang,
      });

      toast.success(t("outbound.exportSuccess"));
      handleClose();
    } catch (err) {
      console.error("Outbound Excel export error:", err);
      toast.error(err?.message || t("common.exportError"));
    } finally {
      setIsExporting(false);
      setProgressInfo(null);
    }
  };

  const datePickerFieldSx = {
    "& .MuiInputBase-root": {
      fontSize: "0.875rem",
      height: "40px",
      minHeight: "40px",
      borderRadius: "9px",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
    "& .MuiInputAdornment-root .MuiIconButton-root": {
      color: "primary.main",
      padding: "4px",
    },
  };

  return (
    <CustomDialog open={open} close={handleClose} widthX={660}>
      <CustomDialogHeader
        variant="h5"
        title={t("outbound.exportModalTitle")}
      />

      <CustomForm onSubmit={handleExport}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2, pt: 0.5 }}>
          {/* Header Banner */}
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
              p: 2,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              background: isDark
                ? "linear-gradient(135deg, rgba(14, 133, 132, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)"
                : "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.8 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isDark ? "rgba(16, 185, 129, 0.16)" : "rgba(16, 124, 65, 0.10)",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 124, 65, 0.2)",
                  boxShadow: "0 2px 10px rgba(16, 124, 65, 0.12)",
                  flexShrink: 0,
                }}
              >
                <ExcelIcon size={26} />
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "14.5px" }}>
                    {t("outbound.exportModalTitle")}
                  </Typography>
                  <Chip
                    label="XLSX"
                    size="small"
                    sx={{
                      height: "19px",
                      fontSize: "10.5px",
                      fontWeight: 800,
                      bgcolor: isDark ? "rgba(16, 185, 129, 0.2)" : "#DCFCE7",
                      color: isDark ? "#34D399" : "#166534",
                      borderRadius: "5px",
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.2 }}>
                  {t("outbound.exportModalDesc")}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Date Range Selection (start_date & end_date) */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: "12px",
              borderColor: "divider",
              backgroundColor: isDark ? "rgba(255,255,255,0.015)" : "#FFFFFF",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Calendar size={16} color={theme.palette.primary.main} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "13.5px" }}>
                  {t("outbound.dateRange")}
                </Typography>
              </Box>

              {/* Segmented Quick Preset Pills */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: "3px",
                  borderRadius: "8px",
                  bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                  gap: 0.4,
                }}
              >
                {[
                  { key: "thisMonth", label: t("outbound.thisMonth"), onClick: handleSetThisMonth },
                  { key: "lastMonth", label: t("outbound.lastMonth"), onClick: handleSetLastMonth },
                  { key: "thisYear", label: t("outbound.thisYear"), onClick: handleSetThisYear },
                  { key: "all", label: t("outbound.allTime"), onClick: handleClearDates },
                ].map((item) => {
                  const isActive = activePreset === item.key;
                  return (
                    <Button
                      key={item.key}
                      size="small"
                      onClick={item.onClick}
                      disabled={isExporting}
                      sx={{
                        textTransform: "none",
                        fontSize: "11.5px",
                        fontWeight: isActive ? 700 : 500,
                        py: 0.3,
                        px: 1.1,
                        borderRadius: "6px",
                        minWidth: "auto",
                        color: isActive ? "primary.main" : "text.secondary",
                        bgcolor: isActive ? (isDark ? "rgba(14, 133, 132, 0.25)" : "#FFFFFF") : "transparent",
                        boxShadow: isActive ? (isDark ? "none" : "0 1px 3px rgba(0,0,0,0.08)") : "none",
                        "&:hover": {
                          bgcolor: isActive
                            ? isDark
                              ? "rgba(14, 133, 132, 0.35)"
                              : "#FFFFFF"
                            : isDark
                              ? "rgba(255,255,255,0.08)"
                              : "#E2E8F0",
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            {/* Start and End DatePickers */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{ display: "block", mb: 0.6, fontWeight: 600, color: "text.secondary", fontSize: "12px" }}
                >
                  {t("outbound.start_date")}
                </Typography>
                <DatePicker
                  value={startDate}
                  onChange={(val) => setStartDate(val)}
                  maxDate={endDate || undefined}
                  format="DD.MM.YYYY"
                  disabled={isExporting}
                  slotProps={{
                    field: { clearable: true, onClear: () => setStartDate(null) },
                    textField: {
                      fullWidth: true,
                      size: "small",
                      placeholder: "DD.MM.YYYY",
                      sx: datePickerFieldSx,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{ display: "block", mb: 0.6, fontWeight: 600, color: "text.secondary", fontSize: "12px" }}
                >
                  {t("outbound.end_date")}
                </Typography>
                <DatePicker
                  value={endDate}
                  onChange={(val) => setEndDate(val)}
                  minDate={startDate || undefined}
                  format="DD.MM.YYYY"
                  disabled={isExporting}
                  slotProps={{
                    field: { clearable: true, onClear: () => setEndDate(null) },
                    textField: {
                      fullWidth: true,
                      size: "small",
                      placeholder: "DD.MM.YYYY",
                      sx: datePickerFieldSx,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Service Selection Scope */}
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.2,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "13.5px" }}>
                  {t("outbound.exportScope")}
                </Typography>
                <Chip
                  label={`${selectedKeys.length} / 6`}
                  size="small"
                  sx={{
                    height: "20px",
                    fontWeight: 700,
                    fontSize: "11px",
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: "primary.main",
                  }}
                />
              </Box>
            </Box>

            {/* Service Cards Grid */}
            <Grid container spacing={1.5}>
              {SERVICE_CONFIGS.map((service) => {
                const Icon = service.icon;
                const isSelected = Boolean(selectedServices[service.key]);

                return (
                  <Grid key={service.key} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                      elevation={0}
                      onClick={() => !isExporting && handleToggleService(service.key)}
                      sx={{
                        p: 1.4,
                        borderRadius: "11px",
                        cursor: isExporting ? "default" : "pointer",
                        border: "1.5px solid",
                        borderColor: isSelected
                          ? alpha(service.color, 0.85)
                          : isDark
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.08)",
                        backgroundColor: isSelected
                          ? alpha(service.color, isDark ? 0.16 : 0.07)
                          : isDark
                            ? "rgba(255,255,255,0.02)"
                            : "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          borderColor: isSelected ? service.color : alpha(service.color, 0.4),
                          transform: "translateY(-1px)",
                          boxShadow: isDark
                            ? "0 4px 12px rgba(0,0,0,0.3)"
                            : "0 4px 12px rgba(0,0,0,0.05)",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: "9px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isSelected ? "#FFFFFF" : service.color,
                            backgroundColor: isSelected
                              ? service.color
                              : alpha(service.color, isDark ? 0.2 : 0.1),
                            transition: "all 0.2s ease",
                            boxShadow: isSelected ? `0 2px 8px ${alpha(service.color, 0.35)}` : "none",
                          }}
                        >
                          <Icon size={18} />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? "text.primary" : "text.secondary",
                            fontSize: "13px",
                          }}
                        >
                          {t(service.labelKey)}
                        </Typography>
                      </Box>

                      <Checkbox
                        size="small"
                        checked={isSelected}
                        disabled={isExporting}
                        sx={{
                          p: 0.2,
                          color: alpha(service.color, 0.5),
                          "&.Mui-checked": {
                            color: service.color,
                          },
                        }}
                      />
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Live Animated Progress Bar during fetch & export */}
          {isExporting && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 700, fontSize: "12.5px" }}>
                  {progressInfo?.message || t("loading")}
                </Typography>
                <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 800, fontSize: "13px" }}>
                  {`${progressInfo?.percent || 0}%`}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressInfo?.percent || 10}
                sx={{
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background: "linear-gradient(90deg, #0E8584 0%, #10B981 100%)",
                  },
                }}
              />
            </Paper>
          )}
        </Box>

        <FooterButton
          loading={isExporting}
          disabled={selectedKeys.length === 0 || isExporting}
          onCancel={handleClose}
          icon={<FileSpreadsheet size={18} />}
          saveButtonSx={{
            background: "linear-gradient(135deg, #0E8584 0%, #059669 100%)",
            border: "0.5px solid #10B981",
            boxShadow: "0 2px 10px rgba(14, 133, 132, 0.35)",
            fontWeight: 700,
            letterSpacing: "0.2px",
            height: "42px",
            px: 3,
            "&:hover": {
              background: "linear-gradient(135deg, #0B7473 0%, #047857 100%)",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 16px rgba(14, 133, 132, 0.45)",
            },
            "&:active": {
              transform: "scale(0.98)",
              boxShadow: "0 1px 4px rgba(14, 133, 132, 0.24)",
            },
          }}
          saveText={
            isExporting
              ? progressInfo?.message || t("loading")
              : t("common.exportExcelBtn")
          }
          cancelText={t("cancel")}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default OutboundExportModal;
