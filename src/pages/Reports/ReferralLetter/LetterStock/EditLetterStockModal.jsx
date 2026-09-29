import { useMemo, useEffect } from "react";
import { Alert, Box, Grid } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import CustomTextField from "../../../../components/CustomTextField";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../../components/Dialog/FooterButton";
import { useUpdate } from "../../../../hooks/CRUD/useUpdate";
import { useLocale } from "../../../../hooks/useLocale";
import { updateReportApi } from "../../../../api/queries/patch";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { getLettersByDocumentRangeApi } from "../../../../api/queries/getters";
import { LetterTotalSummary } from "../components/LetterCount";
import {
  STOCK_LETTERS_KEY,
  YH_INPUT_PROPS,
  formatYhNumber,
  getLetterRange,
  getRangeCount,
  getStockLettersParams,
  getStockRange,
  isYhNumber,
  normalizeYhNumber,
  toYhInt,
} from "../functions/stockLetters";

const getFormValues = (stock) => ({
  batchName: stock?.name || stock?.batchName || "",
  startNo: formatYhNumber(stock?.start_yh_number ?? stock?.startNo),
  endNo: formatYhNumber(stock?.end_yh_number ?? stock?.endNo),
  note: stock?.note || "",
});

const EditLetterStockModal = ({ table, row }) => {
  const { t } = useLocale();
  const isModalOpen = Boolean(table && row && table.getState().editingRow?.id === row.id);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: getFormValues(row?.original),
  });

  useEffect(() => {
    if (row?.original) reset(getFormValues(row.original));
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

  const usedBoundsLabel = usedBounds && {
    start: formatYhNumber(usedBounds.start),
    end: formatYhNumber(usedBounds.end),
  };

  const validateStartNo = (value) => {
    if (!isYhNumber(value)) return t("referralLetter.letterNoInvalid");
    if (usedBounds && toYhInt(value) > usedBounds.start) {
      return t("referralLetter.stockMustContainUsed", usedBoundsLabel);
    }
    return true;
  };

  const validateEndNo = (value, formValues) => {
    if (!isYhNumber(value)) return t("referralLetter.letterNoInvalid");
    const end = toYhInt(value);
    const start = toYhInt(formValues.startNo);
    if (Number.isInteger(start) && end < start) return t("referralLetter.rangeInvalid");
    if (usedBounds && end < usedBounds.end) {
      return t("referralLetter.stockMustContainUsed", usedBoundsLabel);
    }
    return true;
  };

  const [watchStartNo, watchEndNo] = useWatch({
    control,
    name: ["startNo", "endNo"],
  });

  const calculatedCount = useMemo(
    () => getRangeCount(watchStartNo, watchEndNo),
    [watchStartNo, watchEndNo],
  );

  const { mutate: updateReport, isPending } = useUpdate({
    apiFn: updateReportApi,
    key: "reports",
    isPaginated: true,
    idKey: "guid",
    onSuccessUpdate: () => {
      table?.setEditingRow(null);
    },
  });

  const handleFormSubmit = (data) => {
    updateReport({
      guid: row.original.guid || row.original.id,
      name: data.batchName,
      start_yh_number: normalizeYhNumber(data.startNo),
      end_yh_number: normalizeYhNumber(data.endNo),
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

        {isLettersError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {t("errorOccurred")}
          </Alert>
        )}

        {/* Saving waits for the letters of the batch, so the new range can be checked against them. */}
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
