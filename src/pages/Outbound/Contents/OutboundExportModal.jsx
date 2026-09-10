import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Button,
} from "@mui/material";
import {
  Building2,
  PlaneTakeoff,
  TrainFront,
  Compass,
  Car,
  Package,
  FileSpreadsheet,
  Layers,
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
import { exportOutboundExcel, OUTBOUND_SERVICE_MAP } from "../functions/exportOutboundExcel";

const SERVICE_CONFIGS = [
  { key: "hotel", labelKey: "outbound.hotel", icon: Building2 },
  { key: "airway", labelKey: "outbound.airway", icon: PlaneTakeoff },
  { key: "railway", labelKey: "outbound.railway", icon: TrainFront },
  { key: "tour", labelKey: "outbound.tour", icon: Compass },
  { key: "transfer", labelKey: "outbound.transfer", icon: Car },
  { key: "package", labelKey: "outbound.package", icon: Package },
];

export const OutboundExportModal = ({
  open,
  close,
  queryParams = {},
  activeTab = "hotel",
}) => {
  const { t, selectedLang } = useLocale();

  // Selected services state: all checked by default
  const [selectedServices, setSelectedServices] = useState({
    hotel: true,
    airway: true,
    railway: true,
    tour: true,
    transfer: true,
    package: true,
  });

  const [includeSummary, setIncludeSummary] = useState(true);
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

  const handleSelectAll = () => {
    setSelectedServices({
      hotel: true,
      airway: true,
      railway: true,
      tour: true,
      transfer: true,
      package: true,
    });
  };

  const handleDeselectAll = () => {
    setSelectedServices({
      hotel: false,
      airway: false,
      railway: false,
      tour: false,
      transfer: false,
      package: false,
    });
  };

  const handleSelectCurrentTabOnly = () => {
    setSelectedServices({
      hotel: activeTab === "hotel",
      airway: activeTab === "airway",
      railway: activeTab === "railway",
      tour: activeTab === "tour",
      transfer: activeTab === "transfer",
      package: activeTab === "package",
    });
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
      await exportOutboundExcel({
        selectedServiceKeys: selectedKeys,
        queryParams,
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

  // Active filters info
  const hasDateFilter = Boolean(queryParams?.start_date || queryParams?.end_date);
  const hasSearch = Boolean(queryParams?.search);
  const hasPaymentFilter = Boolean(queryParams?.is_paid);

  return (
    <CustomDialog open={open} close={handleClose} widthX={640}>
      <CustomDialogHeader
        variant="h5"
        title={t("outbound.exportModalTitle")}
      />

      <CustomForm onSubmit={handleExport}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 0.5 }}>
          {/* Header Description & Active Filter Badge */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
              p: 1.5,
              borderRadius: "10px",
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <ExcelIcon size={24} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {t("outbound.exportModalTitle")}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  {t("outbound.exportModalDesc")}
                </Typography>
              </Box>
            </Box>

            {/* Active Filters indicator */}
            {(hasDateFilter || hasSearch || hasPaymentFilter) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                {hasDateFilter && (
                  <Chip
                    icon={<Calendar size={13} />}
                    size="small"
                    variant="outlined"
                    color="primary"
                    label={`${queryParams.start_date ? dayjs(queryParams.start_date).format("DD.MM.YYYY") : "..."} - ${queryParams.end_date ? dayjs(queryParams.end_date).format("DD.MM.YYYY") : "..."}`}
                    sx={{ fontSize: "11.5px", fontWeight: 600, borderRadius: "6px" }}
                  />
                )}
                {hasSearch && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`"${queryParams.search}"`}
                    sx={{ fontSize: "11.5px", fontWeight: 600, borderRadius: "6px" }}
                  />
                )}
              </Box>
            )}
          </Box>

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
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {t("outbound.exportScope")} ({selectedKeys.length}/6)
              </Typography>

              {/* Quick Select Buttons */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={handleSelectAll}
                  disabled={isExporting}
                  sx={{ textTransform: "none", fontSize: "12px", fontWeight: 600, py: 0.2, px: 0.8 }}
                >
                  {t("outbound.selectAll")}
                </Button>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  |
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={handleDeselectAll}
                  disabled={isExporting}
                  sx={{ textTransform: "none", fontSize: "12px", fontWeight: 600, py: 0.2, px: 0.8, color: "text.secondary" }}
                >
                  {t("outbound.deselectAll")}
                </Button>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  |
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={handleSelectCurrentTabOnly}
                  disabled={isExporting}
                  sx={{ textTransform: "none", fontSize: "12px", fontWeight: 600, py: 0.2, px: 0.8 }}
                >
                  {t("outbound.onlyCurrentTab")} ({t(OUTBOUND_SERVICE_MAP[activeTab]?.labelKey || activeTab)})
                </Button>
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
                      variant="outlined"
                      onClick={() => !isExporting && handleToggleService(service.key)}
                      sx={{
                        p: 1.4,
                        borderRadius: "10px",
                        cursor: isExporting ? "default" : "pointer",
                        borderColor: isSelected ? "primary.main" : "divider",
                        backgroundColor: isSelected ? "action.selected" : "background.paper",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.18s ease",
                        "&:hover": {
                          borderColor: isSelected ? "primary.main" : "text.secondary",
                          backgroundColor: isSelected ? "action.selected" : "action.hover",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isSelected ? "primary.main" : "text.secondary",
                            backgroundColor: "action.hover",
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
                        sx={{ p: 0.2 }}
                      />
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Consolidated Summary Sheet Toggle */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: "10px",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  disabled={isExporting}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Layers size={16} style={{ opacity: 0.75 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "13.5px" }}>
                    {t("outbound.includeSummarySheet")}
                  </Typography>
                </Box>
              }
            />
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", pl: 3.8, mt: 0.2 }}>
              {t("outbound.exportSummaryDesc")}
            </Typography>
          </Paper>

          {/* Live Progress Bar during fetch & export */}
          {isExporting && (
            <Box sx={{ width: "100%", pt: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={progressInfo?.percent || 10}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "action.hover",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    backgroundColor: "#107c41",
                  },
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.8 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  {progressInfo?.message || t("loading")}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                  {`${progressInfo?.percent || 0}%`}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <FooterButton
          loading={isExporting}
          disabled={selectedKeys.length === 0 || isExporting}
          onCancel={handleClose}
          icon={<FileSpreadsheet size={18} />}
          saveButtonSx={{
            backgroundColor: "#107C41",
            border: "0.5px solid #16A34A",
            boxShadow: "0 2px 8px rgba(16, 124, 65, 0.30)",
            "&:hover": {
              backgroundColor: "#0D6535",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 14px rgba(16, 124, 65, 0.36)",
            },
            "&:active": {
              transform: "scale(0.98)",
              boxShadow: "0 1px 4px rgba(16, 124, 65, 0.24)",
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
