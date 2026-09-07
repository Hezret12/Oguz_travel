import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  LinearProgress,
} from "@mui/material";
import { FileSpreadsheet } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLocale } from "../../hooks/useLocale";
import { CustomDialog } from "./CustomDialog";
import { CustomDialogHeader } from "./CustomDialogHeader";
import { CustomForm } from "./CustomForm";
import FooterButton from "./FooterButton";
import { ExcelIcon } from "../ExportExcelButton";
import {
  exportStyledExcelFile,
  fetchAllPaginatedData,
} from "../../functions/excelExportHelper";


export const GlobalExcelExportModal = ({
  open,
  close,
  apiFn,
  columns = [],
  titleBanner = null,
  rightHeader = null,
  fileName = "Export",
  sheetName = "Hasabat",
  baseQueryParams = {},
  totalItems = null,
  defaultValues = {},
  customFilterFields = null,
  transformPayload = null,
  customExportFn = null,
}) => {
  const { t } = useLocale();
  const [isExporting, setIsExporting] = useState(false);
  const [progressInfo, setProgressInfo] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      ...defaultValues,
    },
    mode: "onSubmit",
  });

  const handleClose = () => {
    if (isExporting) return;
    reset();
    setProgressInfo(null);
    close();
  };

  const onSubmit = async (formData) => {
    if (isExporting) return;
    if (totalItems === 0) {
      toast.error(t("common.noDataToExport"));
      return;
    }

    setIsExporting(true);
    setProgressInfo(null);

    try {
      // Always extract sanitized page filters from baseQueryParams
      const sanitizedPageFilters = {};
      if (baseQueryParams) {
        Object.entries(baseQueryParams).forEach(([key, val]) => {
          if (
            key !== "page" &&
            key !== "limit" &&
            key !== "pageSize" &&
            val !== null &&
            val !== undefined &&
            val !== ""
          ) {
            sanitizedPageFilters[key] = val;
          }
        });
      }

      let filterPayload = { ...sanitizedPageFilters };

      if (transformPayload) {
        filterPayload = transformPayload(formData, sanitizedPageFilters);
      } else if (customFilterFields) {
        Object.entries(formData).forEach(([key, val]) => {
          if (
            val !== null &&
            val !== undefined &&
            val !== ""
          ) {
            if (typeof val === "string") {
              const trimmed = val.trim();
              if (trimmed) filterPayload[key] = trimmed;
            } else {
              filterPayload[key] = val;
            }
          }
        });
      }

      const items = await fetchAllPaginatedData(
        apiFn,
        filterPayload,
        (loaded, total) => setProgressInfo({ loaded, total }),
        100
      );

      if (!items || items.length === 0) {
        toast.error(t("common.noDataToExport"));
        return;
      }

      if (customExportFn) {
        await customExportFn(items, {
          titleBanner,
          rightHeader,
          columns,
          fileName,
          sheetName,
        });
      } else {
        await exportStyledExcelFile({
          titleBanner,
          rightHeader,
          columns,
          data: items,
          fileName,
          sheetName,
        });
      }

      toast.success(t("common.excelExportSuccess"));
      handleClose();
    } catch (err) {
      console.error("Excel export error:", err);
      toast.error(err?.message || t("common.exportError"));
    } finally {
      setIsExporting(false);
      setProgressInfo(null);
    }
  };

  const isZeroItems = totalItems === 0;

  return (
    <CustomDialog open={open} close={handleClose} widthX={customFilterFields ? 640 : 500}>
      <CustomDialogHeader
        variant="h5"
        title={t("common.exportExcelModalTitle")}
      />

      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {customFilterFields ? (
            <Grid container spacing={2}>
              {customFilterFields({ control })}
            </Grid>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                py: 2,
                px: 1,
                gap: 2,
              }}
            >
              {/* Excel Icon Badge */}
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(16, 124, 65, 0.08)",
                  border: (theme) =>
                    theme.palette.mode === "dark"
                      ? "1px solid rgba(16, 185, 129, 0.3)"
                      : "1px solid rgba(16, 124, 65, 0.2)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 4px 20px rgba(16, 185, 129, 0.2)"
                      : "0 4px 16px rgba(16, 124, 65, 0.12)",
                }}
              >
                <ExcelIcon size={32} />
              </Box>

              {/* Confirmation Text & Item Count */}
              <Box sx={{ maxWidth: 360 }}>
                {totalItems !== null && totalItems !== undefined ? (
                  totalItems > 0 ? (
                    <>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          fontSize: "1.05rem",
                          mb: 0.5,
                        }}
                      >
                        {t("common.exportExcelConfirmCount", { count: totalItems })}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {t("common.exportExcelConfirmText")}
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                      }}
                    >
                      {t("common.exportExcelNoData")}
                    </Typography>
                  )
                ) : (
                  <>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        fontSize: "1.05rem",
                        mb: 0.5,
                      }}
                    >
                      {t("common.exportExcelModalTitle")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {t("common.exportExcelConfirmAll")}
                    </Typography>
                  </>
                )}
              </Box>

              {/* Progress Bar during Export */}
              {isExporting && (
                <Box sx={{ width: "100%", mt: 1 }}>
                  <LinearProgress
                    variant={
                      progressInfo && progressInfo.total > 0
                        ? "determinate"
                        : "indeterminate"
                    }
                    value={
                      progressInfo && progressInfo.total > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (progressInfo.loaded / progressInfo.total) * 100
                            )
                          )
                        : 0
                    }
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.08)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 3,
                        backgroundColor: "#107c41",
                      },
                    }}
                  />
                  {progressInfo && progressInfo.total > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        textAlign: "center",
                        mt: 0.75,
                        color: "text.secondary",
                        fontWeight: 600,
                      }}
                    >
                      {`${progressInfo.loaded} / ${progressInfo.total} (${Math.round((progressInfo.loaded / progressInfo.total) * 100)}%)`}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>

        <FooterButton
          loading={isExporting}
          disabled={isZeroItems || isExporting}
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
            progressInfo && progressInfo.total > 0
              ? `${t("loading")} (${progressInfo.loaded} / ${progressInfo.total})`
              : t("common.exportExcelBtn") || t("common.exportExcel")
          }
          cancelText={t("cancel")}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default GlobalExcelExportModal;
