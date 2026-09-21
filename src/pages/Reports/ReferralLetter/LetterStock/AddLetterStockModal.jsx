import { useMemo } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import CustomTextField from "../../../../components/CustomTextField";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../../components/Dialog/FooterButton";
import { useCreate } from "../../../../hooks/CRUD/useCreate";
import { useLocale } from "../../../../hooks/useLocale";
import { addReportApi } from "../../../../api/queries/post";
import { isYhNumber, YH_NUMBER_MAX_LENGTH } from "../functions/stockLetters";

// ÝH serials are typed as text so leading zeros ("0000001") are kept.
const yhInputProps = { inputProps: { maxLength: YH_NUMBER_MAX_LENGTH, inputMode: "numeric" } };

const AddLetterStockModal = ({ open, close, table }) => {
  const { t } = useLocale();
  const isModalOpen = open !== undefined ? Boolean(open) : Boolean(table?.getState().creatingRow);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      batchName: "",
      startNo: "",
      endNo: "",
      note: "",
    },
  });

  const [watchStartNo, watchEndNo] = useWatch({
    control,
    name: ["startNo", "endNo"],
  });

  const calculatedCount = useMemo(() => {
    const start = parseInt(watchStartNo || "0", 10);
    const end = parseInt(watchEndNo || "0", 10);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      return end - start + 1;
    }
    return 1;
  }, [watchStartNo, watchEndNo]);

  const handleClose = () => {
    if (table) table.setCreatingRow(null);
    reset();
    close?.();
  };

  const { mutate: createReport, isPending } = useCreate({
    apiFn: addReportApi,
    key: "reports",
    onSuccess: () => {
      handleClose();
    },
  });

  const validateStartNo = (value) =>
    isYhNumber(value) && parseInt(value, 10) > 0 ? true : t("referralLetter.letterNoInvalid");

  const validateEndNo = (value, formValues) => {
    const error = validateStartNo(value);
    if (error !== true) return error;
    const start = parseInt(formValues.startNo, 10);
    if (!Number.isNaN(start) && parseInt(value, 10) < start) return t("referralLetter.rangeInvalid");
    return true;
  };

  const handleFormSubmit = (data) => {
    createReport({
      name: data.batchName,
      start_yh_number: data.startNo.trim(),
      end_yh_number: data.endNo.trim(),
      total_letter: calculatedCount,
      note: data.note || "",
    });
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={520}>
      <CustomDialogHeader variant="h5" title={t("referralLetter.addLetterStock")} />
      <CustomForm handleSubmit={handleSubmit(handleFormSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
          <CustomTextField
            name="batchName"
            control={control}
            label={t("referralLetter.batchName")}
            placeholder={t("referralLetter.batchNamePlaceholder")}
            required
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="startNo"
                control={control}
                label={t("referralLetter.startNo")}
                placeholder="0000001"
                InputProps={yhInputProps}
                required
                rules={{
                  required: t("validation.required"),
                  validate: validateStartNo,
                  deps: ["endNo"],
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="endNo"
                control={control}
                label={t("referralLetter.endNo")}
                placeholder="0090000"
                InputProps={yhInputProps}
                required
                rules={{
                  required: t("validation.required"),
                  validate: validateEndNo,
                }}
              />
            </Grid>
          </Grid>

          <CustomTextField
            name="note"
            control={control}
            label={t("columns.note")}
            multiline
            rows={2}
          />

          <Box
            sx={{
              mt: 0.5,
              p: 2,
              borderRadius: "10px",
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.04)"
                  : "#F8FAFC",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.875rem",
              }}
            >
              {t("referralLetter.totalQuantity")}:{" "}
              <strong style={{ color: "text.primary", fontWeight: 800 }}>
                {calculatedCount}
              </strong>{" "}
              {t("referralLetter.letterUnit")}
            </Typography>
          </Box>
        </Box>

        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddLetterStockModal;
