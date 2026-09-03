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
  customExportFn = null,
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

  return (
    <CustomDialog open={open} close={handleClose} widthX={640}>
      <CustomDialogHeader
        variant="h5"
        title={t("common.exportExcelModalTitle")}
      />

      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CustomCheckbox
                name="include_page_filters"
                control={control}
                label={t("common.includeCurrentPageFilters")}
              />
            </Grid>

            {customFilterFields ? (
              customFilterFields({ control })
            ) : (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomDatePicker
                    name="date_from"
                    control={control}
                    label={t("dateFrom")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomDatePicker
                    name="date_to"
                    control={control}
                    label={t("dateTo")}
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
              ? `${t("loading")} (${progressInfo.loaded} / ${progressInfo.total})`
              : t("common.exportExcel")
          }
          cancelText={t("cancel")}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default GlobalExcelExportModal;
