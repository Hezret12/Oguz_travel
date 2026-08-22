import { useState } from "react";
import {
  Box,
  Grid,
} from "@mui/material";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLocale } from "../../hooks/useLocale";
import { CustomDialog } from "./CustomDialog";
import { CustomDialogHeader } from "./CustomDialogHeader";
import { CustomForm } from "./CustomForm";
import FooterButton from "./FooterButton";
import CustomDatePicker from "../CustomDatePicker";
import CustomCheckbox from "../CustomCheckbox";
import {
  exportStyledExcelFile,
  fetchAllPaginatedData,
} from "../../functions/excelExportHelper";

/**
 * Universal Global Excel Export Modal.
 * Works with any API endpoint and page module (B2B, Turkish Airlines, Visa, ReferralLetter, etc.)
 */
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
  defaultValues = {},
  customFilterFields = null,
  transformPayload = null,
}) => {
  const { t } = useLocale();
  const [isExporting, setIsExporting] = useState(false);
  const [progressInfo, setProgressInfo] = useState(null);

  const fallbackDefaultValues = {
    include_page_filters: true,
    date_from: null,
    date_to: null,
    ...defaultValues,
  };

  const { control, handleSubmit, reset } = useForm({
    defaultValues: fallbackDefaultValues,
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
    setIsExporting(true);
    setProgressInfo(null);

    try {
      // 1. Sanitize active page filter parameters (strip UI pagination keys: page, limit, pageSize)
      const sanitizedPageFilters = {};
      if (formData.include_page_filters && baseQueryParams) {
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

      // 2. Build final filter payload merging modal inputs with active page filters
      let filterPayload = { ...sanitizedPageFilters };

      if (transformPayload) {
        filterPayload = transformPayload(formData, sanitizedPageFilters);
      } else {
        Object.entries(formData).forEach(([key, val]) => {
          if (
            key !== "include_page_filters" &&
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

      // 3. Automatically fetch all pages in batches
      const items = await fetchAllPaginatedData(
        apiFn,
        filterPayload,
        (loaded, total) => setProgressInfo({ loaded, total }),
        100
      );

      if (!items || items.length === 0) {
        toast.error(t("common.noDataToExport", "Dışa aktarılacak veri bulunamadı"));
        return;
      }

      await exportStyledExcelFile({
        titleBanner,
        rightHeader,
        columns,
        data: items,
        fileName,
        sheetName,
      });

      toast.success(t("common.excelExportSuccess", "Excel faýly üstünlikli ýüklenildi"));
      handleClose();
    } catch (err) {
      console.error("Excel export error:", err);
      toast.error(err?.message || t("common.exportError", "Excel faýly ýüklenende ýalňyşlyk ýüze çykdy"));
    } finally {
      setIsExporting(false);
      setProgressInfo(null);
    }
  };

  return (
    <CustomDialog open={open} close={handleClose} widthX={640}>
      <CustomDialogHeader
        variant="h5"
        title={t("common.exportExcelModalTitle", "Excel-e Eksport Etmek")}
      />

      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Grid container spacing={2}>
            {/* Checkbox to include active page search & filters */}
            <Grid size={{ xs: 12 }}>
              <CustomCheckbox
                name="include_page_filters"
                control={control}
                label={t(
                  "common.includeCurrentPageFilters",
                  "Sahypadaky bar bolan gözleg we filterleri hem goşmak",
                )}
              />
            </Grid>

            {/* Custom module-specific filter fields or universal date range fallback */}
            {customFilterFields ? (
              customFilterFields({ control })
            ) : (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomDatePicker
                    name="date_from"
                    control={control}
                    label={t("dateFrom", "Başlangyç senesi")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomDatePicker
                    name="date_to"
                    control={control}
                    label={t("dateTo", "Soňky senesi")}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>

        <FooterButton
          loading={isExporting}
          onCancel={handleClose}
          saveText={
            progressInfo && progressInfo.total > 0
              ? `${t("loading", "Ýüklenýär...")} (${progressInfo.loaded} / ${progressInfo.total})`
              : t("common.exportExcel", "Excel-e Eksport")
          }
          cancelText={t("cancel", "Ýatyrmak")}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default GlobalExcelExportModal;
