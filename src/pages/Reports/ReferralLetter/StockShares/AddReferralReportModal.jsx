import { useMemo, useState } from "react";
import { Box, Grid } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import CustomTextField from "../../../../components/CustomTextField";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import CustomSelect from "../../../../components/CustomSelect";
import CustomTabs from "../../../../components/CustomTabs";
import GlobalEmployeeAutocomplete from "../../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../../components/Dialog/FooterButton";
import { useCreate } from "../../../../hooks/CRUD/useCreate";
import { useLocale } from "../../../../hooks/useLocale";
import { addOtherLetterApi } from "../../../../api/queries/post";
import { LetterCountField } from "../components/LetterCount";
import {
  LETTER_STATUS,
  STOCK_LETTERS_KEY,
  YH_INPUT_PROPS,
  createYhRangeValidators,
  formatYhNumber,
  getLetterStatusOptions,
  getRangeCount,
  toOtherLetterPayload,
  toYhInt,
} from "../functions/stockLetters";

const MODE_SINGLE = "single";
const MODE_RANGE = "range";

// Records an "other letter" (sold / damaged / lost) inside a stock batch. "single" mode is
// one ÝH number (`isOne`); "range" mode covers start..end inclusive. `occupied` holds the
// ranges already used in the batch (referral letters and other letters) so nothing overlaps.
// Only the fields of the active tab are mounted, and react-hook-form skips validation for
// unmounted fields.
const AddReferralReportModal = ({
  open,
  close,
  table,
  stock,
  occupied = [],
  defaultRange,
}) => {
  const { t } = useLocale();
  const isModalOpen =
    open !== undefined ? Boolean(open) : Boolean(table?.getState().creatingRow);

  const [mode, setMode] = useState(MODE_SINGLE);

  const statusOptions = useMemo(() => getLetterStatusOptions(t), [t]);

  const modeTabs = useMemo(
    () => [
      { value: MODE_SINGLE, label: t("referralLetter.singleMode") },
      { value: MODE_RANGE, label: t("referralLetter.rangeMode") },
    ],
    [t],
  );

  const getDefaultValues = () => {
    const start = defaultRange?.start;
    const end = defaultRange?.end;
    return {
      date: new Date().toISOString(),
      assignment_opr_guid: "",
      received_by: "",
      letterNo: start != null ? formatYhNumber(start) : "",
      startNo: start != null ? formatYhNumber(start) : "",
      endNo: end != null ? formatYhNumber(end) : "",
      status: LETTER_STATUS.SOLD,
      note: "",
    };
  };

  const { control, handleSubmit, reset, clearErrors } = useForm({
    defaultValues: getDefaultValues(),
  });

  const [startNo, endNo] = useWatch({ control, name: ["startNo", "endNo"] });
  const rangeCount = useMemo(() => getRangeCount(startNo, endNo), [startNo, endNo]);

  const { validateLetterNo, validateStartNo, validateEndNo } = useMemo(
    () => createYhRangeValidators({ t, stock, occupied }),
    [t, stock, occupied],
  );

  const handleClose = () => {
    if (table) table.setCreatingRow(null);
    reset(getDefaultValues());
    setMode(MODE_SINGLE);
    close?.();
  };

  const handleModeChange = (_event, nextMode) => {
    setMode(nextMode);
    clearErrors();
  };

  // Invalidated (not prepended): the letters of a batch come from a range query.
  const { mutate: createOtherLetter, isPending } = useCreate({
    apiFn: addOtherLetterApi,
    key: STOCK_LETTERS_KEY,
    isPaginated: true,
    onSuccess: () => {
      handleClose();
    },
  });

  const handleFormSubmit = (data) => {
    const isRange = mode === MODE_RANGE;
    const start = isRange ? toYhInt(data.startNo) : toYhInt(data.letterNo);
    const end = isRange ? toYhInt(data.endNo) : start;
    createOtherLetter(
      toOtherLetterPayload({
        start,
        end,
        date: data.date,
        status: data.status,
        operatorGuid: data.assignment_opr_guid,
        receivedBy: data.received_by,
        note: data.note,
      }),
    );
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={600}>
      <CustomDialogHeader variant="h5" title={t("referralLetter.addReport")} />
      <CustomForm handleSubmit={handleSubmit(handleFormSubmit)}>
        <Box sx={{ mb: 2.5 }}>
          <CustomTabs
            value={mode}
            onChange={handleModeChange}
            tabs={modeTabs}
            variant="pills"
            color="blue"
            size="small"
            fullWidth
          />
        </Box>

        <Grid container spacing={2.25}>
          {/* Number row: same height in both tabs so the dialog never resizes */}
          {mode === MODE_SINGLE ? (
            <Grid size={{ xs: 12, sm: 8 }}>
              <CustomTextField
                name="letterNo"
                control={control}
                label={t("referralLetter.letterNo")}
                InputProps={YH_INPUT_PROPS}
                required
                rules={{
                  required: t("validation.required"),
                  validate: validateLetterNo,
                }}
              />
            </Grid>
          ) : (
            <>
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
            </>
          )}
          <Grid size={{ xs: 12, sm: 4 }}>
            <LetterCountField count={mode === MODE_SINGLE ? 1 : rangeCount} />
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

export default AddReferralReportModal;
