import { Grid } from "@mui/material";
import { useController, useWatch } from "react-hook-form";
import dayjs from "dayjs";

import CustomDatePicker from "../../../components/CustomDatePicker";
import { useLocale } from "../../../hooks/useLocale";

const datePickerSx = {
  "& .MuiPickersOutlinedInput-root, & .MuiOutlinedInput-root, & .MuiInputBase-root": {
    minHeight: "44px !important",
    height: "44px !important",
  },
  "& .MuiPickersInputBase-sectionsContainer, & .MuiInputBase-input": {
    paddingTop: "10px !important",
    paddingBottom: "10px !important",
  },
};

/**
 * The task window (`startDate` → `endDate`, date + time) shared by the create and edit
 * modals. The end picker can't go before the chosen start; the schema enforces the same.
 */
export default function TaskWindowFields({ control, disabled = false }) {
  const { t } = useLocale();
  const startDate = useWatch({ control, name: "startDate" });
  const { field: startField } = useController({ control, name: "startDate" });
  const minEnd = startDate && dayjs(startDate).isValid() ? dayjs(startDate) : undefined;

  // Opening an empty start picker fills in the current time (to the minute) as the default.
  const handleStartOpen = () => {
    if (!startDate) startField.onChange(dayjs().second(0).millisecond(0).toISOString());
  };

  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomDatePicker
          name="startDate"
          control={control}
          label={t("task.startDate")}
          showTime
          ampm={false}
          onOpen={handleStartOpen}
          disabled={disabled}
          inputSx={datePickerSx}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomDatePicker
          name="endDate"
          control={control}
          label={t("task.endDate")}
          showTime
          ampm={false}
          minDateTime={minEnd}
          referenceDate={minEnd}
          disabled={disabled}
          inputSx={datePickerSx}
        />
      </Grid>
    </>
  );
}
