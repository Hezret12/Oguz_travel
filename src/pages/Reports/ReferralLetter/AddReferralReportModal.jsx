import { useMemo, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import CustomTextField from "../../../components/CustomTextField";
import CustomDatePicker from "../../../components/CustomDatePicker";
import CustomSelect from "../../../components/CustomSelect";
import CustomTabs from "../../../components/CustomTabs";
import OverflowTooltipLabel from "../../../components/OverflowTooltipLabel";
import GlobalEmployeeAutocomplete from "../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useLocale } from "../../../hooks/useLocale";
import { addReportShareApi } from "../../../api/queries/post";

const MODE_SINGLE = "single";
const MODE_RANGE = "range";

const toInt = (value) => {
  if (value === "" || value == null) return NaN;
  return Number(value);
};

// The backend stores every report-share as a number range. "single" mode is
// just a range of one letter (start === end, total_count 1); "range" mode
// covers start..end inclusive. Only the fields of the active tab are mounted,
// and react-hook-form skips validation for unmounted fields.
const AddReferralReportModal = ({
  open,
  close,
  table,
  stock,
  shares = [],
  defaultRange,
}) => {
  const { t } = useLocale();
  const isModalOpen =
    open !== undefined ? Boolean(open) : Boolean(table?.getState().creatingRow);

  const [mode, setMode] = useState(MODE_SINGLE);

  const stockStart = Number(stock?.start_yh_number);
  const stockEnd = Number(stock?.end_yh_number);

  const statusOptions = useMemo(
    () => [
      { label: t("referralLetter.statusSold"), value: 1, color: "#16a34a" },
      { label: t("referralLetter.statusDamaged"), value: 2, color: "#ea580c" },
      { label: t("referralLetter.statusLost"), value: 3, color: "#dc2626" },
    ],
    [t],
  );

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
      letterNo: start != null ? String(start) : "",
      startNo: start != null ? String(start) : "",
      endNo: end != null ? String(end) : "",
      status: 1,
      note: "",
    };
  };

  const { control, handleSubmit, reset, clearErrors } = useForm({
    defaultValues: getDefaultValues(),
  });

  const [startNo, endNo] = useWatch({ control, name: ["startNo", "endNo"] });
  const rangeCount = useMemo(() => {
    const s = toInt(startNo);
    const e = toInt(endNo);
    if (!Number.isInteger(s) || !Number.isInteger(e) || e < s) return 0;
    return e - s + 1;
  }, [startNo, endNo]);

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

  const { mutate: createReportShare, isPending } = useCreate({
    apiFn: addReportShareApi,
    key: "reportShares",
    onSuccess: () => {
      handleClose();
    },
  });

  // Returns an error message for a single number, or null when it is valid.
  const checkNumber = (num) => {
    if (!Number.isInteger(num) || num <= 0) {
      return t("referralLetter.letterNoInvalid");
    }
    if (stock && (num < stockStart || num > stockEnd)) {
      return t("referralLetter.letterNoOutOfRange", {
        start: stockStart,
        end: stockEnd,
      });
    }
    return null;
  };

  const findOverlap = (from, to) =>
    shares.find(
      (s) =>
        Number(s.start_yh_number) <= to && Number(s.end_yh_number) >= from,
    );

  const validateLetterNo = (value) => {
    const num = toInt(value);
    const error = checkNumber(num);
    if (error) return error;
    if (findOverlap(num, num)) return t("referralLetter.letterNoUsed");
    return true;
  };

  const validateStartNo = (value) => checkNumber(toInt(value)) ?? true;

  const validateEndNo = (value, formValues) => {
    const end = toInt(value);
    const error = checkNumber(end);
    if (error) return error;
    const start = toInt(formValues.startNo);
    if (!Number.isInteger(start)) return true;
    if (end < start) return t("referralLetter.rangeInvalid");
    const overlap = findOverlap(start, end);
    if (overlap) {
      return t("referralLetter.rangeOverlap", {
        start: overlap.start_yh_number,
        end: overlap.end_yh_number,
      });
    }
    return true;
  };

  const handleFormSubmit = (data) => {
    const isRange = mode === MODE_RANGE;
    const start = isRange ? toInt(data.startNo) : toInt(data.letterNo);
    const end = isRange ? toInt(data.endNo) : start;
    createReportShare({
      datetime: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      assignment_opr_guid: data.assignment_opr_guid,
      received_by: data.received_by,
      start_yh_number: start,
      end_yh_number: end,
      total_count: end - start + 1,
      status: Number(data.status || 1),
      note: data.note || "",
    });
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
                type="number"
                allowNegative={false}
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
            </>
          )}
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
                {mode === MODE_SINGLE ? 1 : rangeCount} {t("referralLetter.letterUnit")}
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

export default AddReferralReportModal;
