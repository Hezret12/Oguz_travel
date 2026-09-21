import { useMemo, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import CustomTextField from "../../../components/CustomTextField";
import CustomDatePicker from "../../../components/CustomDatePicker";
import CustomSelect from "../../../components/CustomSelect";
import OverflowTooltipLabel from "../../../components/OverflowTooltipLabel";
import GlobalEmployeeAutocomplete from "../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { useLocale } from "../../../hooks/useLocale";
import { updateOtherLetterApi } from "../../../api/queries/patch";
import {
  STOCK_LETTERS_KEY,
  findOverlap,
  getLetterRange,
  getLetterStatusOptions,
  resolveLetterStatus,
  toOtherLetterPayload,
} from "./functions/stockLetters";

const toInt = (value) => {
  if (value === "" || value == null) return NaN;
  return Number(value);
};

/** Edits an "other letter" of a stock batch; the quantity follows from its ÝH range. */
const EditReferralReportModal = ({ open, close, table, row, stock, occupied = [] }) => {
  const { t } = useLocale();
  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && row && table.getState().editingRow?.id === row.id);

  const letter = row?.original;
  const stockStart = Number(stock?.start_yh_number);
  const stockEnd = Number(stock?.end_yh_number);

  const statusOptions = useMemo(() => getLetterStatusOptions(t), [t]);

  const initialValues = useMemo(() => {
    const { start, end } = getLetterRange(letter);
    return {
      date: letter?.date_time || null,
      assignment_opr_guid: letter?.received_opr_guid || "",
      received_by: letter?.accepted_by || "",
      startNo: Number.isFinite(start) ? String(start) : "",
      endNo: Number.isFinite(end) ? String(end) : "",
      status: resolveLetterStatus(letter?.status),
      note: letter?.note || "",
    };
  }, [letter]);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: initialValues,
  });

  const [prevRowId, setPrevRowId] = useState(null);
  const currentRowId = isModalOpen && letter ? letter.guid : null;
  if (currentRowId !== prevRowId) {
    setPrevRowId(currentRowId);
    reset(initialValues);
  }

  const [startNo, endNo] = useWatch({ control, name: ["startNo", "endNo"] });
  const rangeCount = useMemo(() => {
    const s = toInt(startNo);
    const e = toInt(endNo);
    if (!Number.isInteger(s) || !Number.isInteger(e) || e < s) return 0;
    return e - s + 1;
  }, [startNo, endNo]);

  const { mutate: updateOtherLetter, isPending } = useUpdate({
    apiFn: updateOtherLetterApi,
    key: STOCK_LETTERS_KEY,
    idKey: "guid",
    onSuccessUpdate: () => {
      handleClose();
    },
  });

  // Returns an error message for a single number, or null when it is valid.
  const checkNumber = (num) => {
    if (!Number.isInteger(num) || num <= 0) return t("referralLetter.letterNoInvalid");
    if (stock && (num < stockStart || num > stockEnd)) {
      return t("referralLetter.letterNoOutOfRange", { start: stockStart, end: stockEnd });
    }
    return null;
  };

  const validateStartNo = (value) => checkNumber(toInt(value)) ?? true;

  const validateEndNo = (value, formValues) => {
    const end = toInt(value);
    const error = checkNumber(end);
    if (error) return error;
    const start = toInt(formValues.startNo);
    if (!Number.isInteger(start)) return true;
    if (end < start) return t("referralLetter.rangeInvalid");
    const overlap = findOverlap(occupied, start, end, letter?.guid);
    if (overlap) {
      return t("referralLetter.rangeOverlap", { start: overlap.start, end: overlap.end });
    }
    return true;
  };

  const handleFormSubmit = (data) => {
    updateOtherLetter({
      guid: letter.guid,
      ...toOtherLetterPayload({
        start: toInt(data.startNo),
        end: toInt(data.endNo),
        date: data.date,
        status: data.status,
        operatorGuid: data.assignment_opr_guid || undefined,
        receivedBy: data.received_by,
        note: data.note,
      }),
    });
  };

  const handleClose = () => {
    table?.setEditingRow(null);
    close?.();
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={560}>
      <CustomDialogHeader variant="h5" title={t("referralLetter.editReport")} />
      <CustomForm handleSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={2.25}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <CustomTextField
              name="startNo"
              control={control}
              label={t("referralLetter.startNoFrom")}
              type="number"
              allowNegative={false}
              required
              rules={{
                required: t("validation.required"),
                validate: validateStartNo,
                deps: ["endNo"],
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <CustomTextField
              name="endNo"
              control={control}
              label={t("referralLetter.endNoTo")}
              type="number"
              allowNegative={false}
              required
              rules={{
                required: t("validation.required"),
                validate: validateEndNo,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <OverflowTooltipLabel label={t("referralLetter.quantity")} />
            <Box
              sx={{
                minHeight: 44,
                px: 1.5,
                display: "flex",
                alignItems: "center",
                borderRadius: "7px",
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "action.hover",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
                noWrap
              >
                {rangeCount} {t("referralLetter.letterUnit")}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomDatePicker
              name="date"
              control={control}
              label={t("columns.dateTime")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              name="status"
              control={control}
              label={t("columns.status")}
              options={statusOptions}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <GlobalEmployeeAutocomplete
              name="assignment_opr_guid"
              control={control}
              label={t("referralLetter.submittedBy")}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="received_by"
              control={control}
              label={t("referralLetter.receivedBy")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomTextField
              name="note"
              control={control}
              label={t("columns.note")}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>

        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditReferralReportModal;
