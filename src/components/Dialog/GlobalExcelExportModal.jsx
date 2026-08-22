import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLocale } from "../../hooks/useLocale";
import { CustomDialog } from "./CustomDialog";
import { CustomDialogHeader } from "./CustomDialogHeader";
import { CustomForm } from "./CustomForm";
import FooterButton from "./FooterButton";
import CustomDatePicker from "../CustomDatePicker";
import CustomTextField from "../CustomTextField";
import GlobalEmployeeAutocomplete from "../global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
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
  customFilterFields = null,
}) => {
  const { t } = useLocale();
  const [isExporting, setIsExporting] = useState(false);
  const [progressInfo, setProgressInfo] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      departure_date_from: null,
      departure_date_to: null,
      contract_date_from: null,
      contract_date_to: null,
      destination_country: "",
      received_opr_guid: null,
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
    setIsExporting(true);
    setProgressInfo(null);

    try {
      // Build filter payload strictly from modal form inputs
      const filterPayload = {};

      if (formData.departure_date_from) filterPayload.departure_date_from = formData.departure_date_from;
      if (formData.departure_date_to) filterPayload.departure_date_to = formData.departure_date_to;
      if (formData.contract_date_from) filterPayload.contract_date_from = formData.contract_date_from;
      if (formData.contract_date_to) filterPayload.contract_date_to = formData.contract_date_to;
      if (formData.destination_country?.trim()) filterPayload.destination_country = formData.destination_country.trim();
      if (formData.received_opr_guid) filterPayload.received_opr_guid = formData.received_opr_guid;

      // Automatically fetch all pages in batches
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
        title={t("common.exportExcelModalTitle", "Excel-e Eksport Etmek (Filter)")}
      />

      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t(
              "common.exportExcelModalDesc",
              "Eksport ediljek maglumatlar üçin aşakdaky süzgüçleri saýlap bilersiňiz:"
            )}
          </Typography>

          <Grid container spacing={2}>
            {/* Custom module-specific filter fields if provided */}
            {customFilterFields ? (
              customFilterFields({ control })
            ) : (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomDatePicker
                    name="departure_date_from"
                    control={control}
                    label={t("columns.departureDateFrom", "Gidiş senesi (Başlangyç)")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomDatePicker
                    name="departure_date_to"
                    control={control}
                    label={t("columns.departureDateTo", "Gidiş senesi (Soňky)")}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomDatePicker
                    name="contract_date_from"
                    control={control}
                    label={t("columns.contractDateFrom", "Şertnama senesi (Başlangyç)")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomDatePicker
                    name="contract_date_to"
                    control={control}
                    label={t("columns.contractDateTo", "Şertnama senesi (Soňky)")}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    name="destination_country"
                    control={control}
                    label={t("columns.destinationCountry", "Gidýän ýurdy")}
                    placeholder="Meselem: Türkiýe, Özbegistan"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <GlobalEmployeeAutocomplete
                    name="received_opr_guid"
                    control={control}
                    label={t("columns.operator", "Operator")}
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
