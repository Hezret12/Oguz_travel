import { useMemo } from "react";
import { Box, Grid } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import CustomTextField from "../../../../components/CustomTextField";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../../components/Dialog/FooterButton";
import { useCreate } from "../../../../hooks/CRUD/useCreate";
import { useLocale } from "../../../../hooks/useLocale";
import { addReportApi } from "../../../../api/queries/post";
import { LetterTotalSummary } from "../components/LetterCount";
import {
  YH_INPUT_PROPS,
  getRangeCount,
  isYhNumber,
  normalizeYhNumber,
  toYhInt,
} from "../functions/stockLetters";

// ÝH serials are typed as text so leading zeros ("0369420") are kept.

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

  const calculatedCount = useMemo(
    () => getRangeCount(watchStartNo, watchEndNo),
    [watchStartNo, watchEndNo],
  );

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
    isYhNumber(value) ? true : t("referralLetter.letterNoInvalid");

  const validateEndNo = (value, formValues) => {
    const error = validateStartNo(value);
    if (error !== true) return error;
    const start = toYhInt(formValues.startNo);
    if (Number.isInteger(start) && toYhInt(value) < start) return t("referralLetter.rangeInvalid");
    return true;
  };

  const handleFormSubmit = (data) => {
    createReport({
      name: data.batchName,
      start_yh_number: normalizeYhNumber(data.startNo),
      end_yh_number: normalizeYhNumber(data.endNo),
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
                placeholder="0369420"
                InputProps={YH_INPUT_PROPS}
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
                placeholder="0369569"
                InputProps={YH_INPUT_PROPS}
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

          <LetterTotalSummary count={calculatedCount} />
        </Box>

        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddLetterStockModal;
