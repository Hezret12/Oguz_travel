import { useMemo } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import CustomTextField from "../../../components/CustomTextField";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useLocale } from "../../../hooks/useLocale";
import { addReportApi } from "../../../api/queries/post";

const AddLetterStockModal = ({ open, close }) => {
  const { t } = useLocale();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      batchName: "",
      startNo: "0000001",
      endNo: "0090000",
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

  const { mutate: createReport, isPending } = useCreate({
    apiFn: addReportApi,
    key: "reports",
    onSuccess: () => {
      reset();
      close();
    },
  });

  const handleFormSubmit = (data) => {
    createReport({
      name: data.batchName,
      start_yh_number: Number(data.startNo || 0),
      end_yh_number: Number(data.endNo || 0),
      total_letter: calculatedCount,
      note: data.note || "",
    });
  };

  const handleClose = () => {
    reset();
    close();
  };

  return (
    <CustomDialog open={open} close={handleClose} widthX={520}>
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
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="endNo"
                control={control}
                label={t("referralLetter.endNo")}
                placeholder="0090000"
                required
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
              <strong style={{ color: "text.primary", fontWeight: 700 }}>
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
