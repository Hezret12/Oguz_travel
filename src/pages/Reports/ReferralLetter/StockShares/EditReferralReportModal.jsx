import { useMemo, useState } from "react";
import { Grid } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import CustomTextField from "../../../../components/CustomTextField";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import CustomSelect from "../../../../components/CustomSelect";
import GlobalEmployeeAutocomplete from "../../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../../components/Dialog/FooterButton";
import { useUpdate } from "../../../../hooks/CRUD/useUpdate";
import { useLocale } from "../../../../hooks/useLocale";
import { updateOtherLetterApi } from "../../../../api/queries/patch";
import { LetterCountField } from "../components/LetterCount";
import {
  STOCK_LETTERS_KEY,
  YH_INPUT_PROPS,
  createYhRangeValidators,
  formatYhNumber,
  getLetterRange,
  getLetterStatusOptions,
  getRangeCount,
  resolveLetterStatus,
  toOtherLetterPayload,
  toYhInt,
} from "../functions/stockLetters";

/** Edits an "other letter" of a stock batch; the quantity follows from its ÝH range. */
const EditReferralReportModal = ({ open, close, table, row, stock, occupied = [] }) => {
  const { t } = useLocale();
  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && row && table.getState().editingRow?.id === row.id);

  const letter = row?.original;

  const statusOptions = useMemo(() => getLetterStatusOptions(t), [t]);

  const initialValues = useMemo(() => {
    const { start, end } = getLetterRange(letter);
    return {
      date: letter?.date_time || null,
      assignment_opr_guid: letter?.received_opr_guid || "",
      received_by: letter?.accepted_by || "",
      startNo: Number.isFinite(start) ? formatYhNumber(start) : "",
      endNo: Number.isFinite(end) ? formatYhNumber(end) : "",
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
  const rangeCount = useMemo(() => getRangeCount(startNo, endNo), [startNo, endNo]);

  // The edited letter may keep (and shrink or grow into) its own range, so it is ignored
  // when looking for overlaps.
  const { validateStartNo, validateEndNo } = useMemo(
    () => createYhRangeValidators({ t, stock, occupied, ignoreGuid: letter?.guid }),
    [t, stock, occupied, letter?.guid],
  );

  const { mutate: updateOtherLetter, isPending } = useUpdate({
    apiFn: updateOtherLetterApi,
    key: STOCK_LETTERS_KEY,
    isPaginated: true,
    idKey: "guid",
    onSuccessUpdate: () => {
      handleClose();
    },
  });

  const handleFormSubmit = (data) => {
    updateOtherLetter({
      guid: letter.guid,
      ...toOtherLetterPayload({
        start: toYhInt(data.startNo),
        end: toYhInt(data.endNo),
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
              InputProps={YH_INPUT_PROPS}
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
              InputProps={YH_INPUT_PROPS}
              required
              rules={{
                required: t("validation.required"),
                validate: validateEndNo,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <LetterCountField count={rangeCount} />
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
