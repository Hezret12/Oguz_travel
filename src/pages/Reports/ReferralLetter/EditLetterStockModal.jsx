import { useMemo, useEffect } from "react";
import { Alert, Box, Grid, Typography } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import CustomTextField from "../../../components/CustomTextField";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { useLocale } from "../../../hooks/useLocale";
import { updateReportApi } from "../../../api/queries/patch";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getLettersByDocumentRangeApi } from "../../../api/queries/getters";
import {
  STOCK_LETTERS_KEY,
  getLetterRange,
  getStockLettersParams,
  getStockRange,
} from "./functions/stockLetters";

const EditLetterStockModal = ({ table, row }) => {
  const { t } = useLocale();
  const isModalOpen = Boolean(table && row && table.getState().editingRow?.id === row.id);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      batchName: row?.original?.name || row?.original?.batchName || "",
      startNo: row?.original?.start_yh_number || row?.original?.startNo || "",
      endNo: row?.original?.end_yh_number || row?.original?.endNo || "",
      note: row?.original?.note || "",
    },
  });

  useEffect(() => {
    if (row?.original) {
      reset({
        batchName: row.original.name || row.original.batchName || "",
        startNo: String(row.original.start_yh_number ?? row.original.startNo ?? ""),
        endNo: String(row.original.end_yh_number ?? row.original.endNo ?? ""),
        note: row.original.note || "",
      });
    }
  }, [row, reset]);

  // Letters already recorded in this batch (same cache entry as its expanded panel). The new
  // range must still contain them, or they would be left outside every batch.
  const lettersParams = useMemo(() => getStockLettersParams(row?.original), [row]);
  const {
    data: letters = [],
    isLoading: isLettersLoading,
    isError: isLettersError,
  } = useGet({
    apiFn: getLettersByDocumentRangeApi,
    key: STOCK_LETTERS_KEY,
    params: lettersParams ?? {},
    options: { enabled: isModalOpen && Boolean(lettersParams), staleTime: 30_000 },
  });

  const usedBounds = useMemo(() => {
    const stockRange = getStockRange(row?.original);
    if (!stockRange || !Array.isArray(letters)) return null;
    let min = Infinity;
    let max = -Infinity;
    for (const letter of letters) {
      const { start, end } = getLetterRange(letter);
      const from = Math.max(start, stockRange.start);
      const to = Math.min(end, stockRange.end);
      if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) continue;
      min = Math.min(min, from);
      max = Math.max(max, to);
    }
    return Number.isFinite(min) ? { start: min, end: max } : null;
  }, [letters, row]);

  const validateStartNo = (value) => {
    const start = parseInt(value, 10);
    if (Number.isNaN(start) || start <= 0) return t("referralLetter.letterNoInvalid");
    if (usedBounds && start > usedBounds.start) {
      return t("referralLetter.stockMustContainUsed", usedBounds);
    }
    return true;
  };

  const validateEndNo = (value, formValues) => {
    const end = parseInt(value, 10);
    if (Number.isNaN(end) || end <= 0) return t("referralLetter.letterNoInvalid");
    const start = parseInt(formValues.startNo, 10);
    if (!Number.isNaN(start) && end < start) return t("referralLetter.rangeInvalid");
    if (usedBounds && end < usedBounds.end) {
      return t("referralLetter.stockMustContainUsed", usedBounds);
    }
    return true;
  };

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

  const { mutate: updateReport, isPending } = useUpdate({
    apiFn: updateReportApi,
    key: "reports",
    idKey: "guid",
    onSuccessUpdate: () => {
      table?.setEditingRow(null);
    },
  });

  const handleFormSubmit = (data) => {
    updateReport({
      guid: row.original.guid || row.original.id,
      name: data.batchName,
      start_yh_number: Number(data.startNo || 0),
      end_yh_number: Number(data.endNo || 0),
      total_letter: calculatedCount,
      note: data.note || "",
    });
  };

  const handleClose = () => {
    table?.setEditingRow(null);
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={520}>
      <CustomDialogHeader
        variant="h5"
        title={t("referralLetter.editLetterStock")}
      />
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
              <strong style={{ color: "text.primary", fontWeight: 700 }}>
                {calculatedCount}
              </strong>{" "}
              {t("referralLetter.letterUnit")}
            </Typography>
          </Box>
        </Box>

        {isLettersError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {t("errorOccurred")}
          </Alert>
        )}

        {/* Saving waits for the batch's letters, so the new range can be checked against them. */}
        <FooterButton
          loading={isPending}
          onCancel={handleClose}
          disabled={isLettersLoading || isLettersError}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditLetterStockModal;
