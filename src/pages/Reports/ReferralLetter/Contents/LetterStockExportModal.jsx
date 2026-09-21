import { useState } from "react";
import { Box, Chip, Grid, LinearProgress, Stack, Typography, alpha } from "@mui/material";
import { FileSpreadsheet, Layers, Package, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "../../../../hooks/useLocale";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import FooterButton from "../../../../components/Dialog/FooterButton";
import { ExcelIcon } from "../../../../components/ExportExcelButton";
import { exportLetterStockExcel } from "../functions/exportLetterStockExcel";

const EXCEL_GREEN = "#107C41";

const PreviewStat = ({ icon, label, value }) => (
  <Box
    sx={(theme) => ({
      p: 1.25,
      height: "100%",
      borderRadius: "10px",
      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
      color: "primary.main",
    })}
  >
    <Stack direction="row" spacing={0.6} sx={{ alignItems: "center", mb: 0.4 }}>
      {icon}
      <Typography
        sx={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", opacity: 0.85 }}
      >
        {label}
      </Typography>
    </Stack>
    <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "text.primary" }}>{value}</Typography>
  </Box>
);

/**
 * Letter stock report export. Uses the page's search, and shows the page's own totals as a
 * preview, so it needs no extra request before the user confirms.
 */
export const LetterStockExportModal = ({ open, close, queryParams = {}, stockCount = 0, letterCount = null }) => {
  const { t } = useLocale();
  const [search, setSearch] = useState(() => String(queryParams?.search ?? "").trim());
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(null);

  const formatCount = (value) => new Intl.NumberFormat("en-US").format(Number(value || 0));
  // The page totals are for the page's search; once it is cleared here they no longer apply.
  const isPreviewForSearch = search === String(queryParams?.search ?? "").trim();
  const hasNoData = isPreviewForSearch && Number(stockCount) === 0;

  const handleClose = () => {
    if (isExporting) return;
    close?.();
  };

  const handleExport = async (e) => {
    e?.preventDefault?.();
    if (isExporting) return;

    setIsExporting(true);
    setProgress({ message: t("referralLetter.export.fetchingStocks"), percent: 2 });
    try {
      await exportLetterStockExcel({
        params: search ? { search } : {},
        onProgress: setProgress,
        t,
      });
      toast.success(t("referralLetter.export.success"));
      setIsExporting(false);
      close?.();
    } catch (err) {
      console.error("Letter stock Excel export error:", err);
      toast.error(err?.message || t("common.exportError"));
      setIsExporting(false);
      setProgress(null);
    }
  };

  return (
    <CustomDialog open={open} close={handleClose} widthX={600}>
      <CustomDialogHeader variant="h5" title={t("common.exportExcelModalTitle")} />

      <CustomForm onSubmit={handleExport}>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
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
                0.04,
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
                  {t("referralLetter.export.modalTitle")}
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
                {t("referralLetter.export.modalDesc")}
              </Typography>
            </Box>
          </Stack>

          {search && (
            <Box>
              <Chip
                size="small"
                icon={<Search size={13} />}
                label={search}
                onDelete={isExporting ? undefined : () => setSearch("")}
                variant="outlined"
                color="primary"
                sx={{ borderRadius: "7px", height: 26, fontWeight: 500 }}
              />
            </Box>
          )}

          {isPreviewForSearch && (
            <Grid container spacing={1}>
              <Grid size={{ xs: 6 }}>
                <PreviewStat
                  icon={<Layers size={13} />}
                  label={t("referralLetter.export.stocks")}
                  value={formatCount(stockCount)}
                />
              </Grid>
              {letterCount !== null && (
                <Grid size={{ xs: 6 }}>
                  <PreviewStat
                    icon={<Package size={13} />}
                    label={t("referralLetter.export.letters")}
                    value={`${formatCount(letterCount)} ${t("referralLetter.letterUnit")}`}
                  />
                </Grid>
              )}
            </Grid>
          )}

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

export default LetterStockExportModal;
