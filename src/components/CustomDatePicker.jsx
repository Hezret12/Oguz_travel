import { useState } from "react";
import { Box } from "@mui/material";
import OverflowTooltipLabel from "./OverflowTooltipLabel";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Controller } from "react-hook-form";
import dayjs from "dayjs";

// Form value stored for a typed-but-invalid date when `validateFormat` is on,
// so the form schema can reject it instead of it being silently dropped.
export const INVALID_DATE = "Invalid Date";

const CustomDatePicker = ({
  name,
  control,
  rules,
  label,
  disabled = false,
  required = false,
  size = "small",
  showTime = false,
  format = showTime ? "DD.MM.YYYY HH:mm" : "DD.MM.YYYY",
  sx = {},
  inputSx = {},
  slotProps: externalSlotProps = {},
  validateFormat = false,
  ...props
}) => {
  const PickerComponent = showTime ? DateTimePicker : DatePicker;
  // The picker's own invalid value, fed back so the typed sections stay on screen.
  const [invalidDraft, setInvalidDraft] = useState(null);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const hasError = Boolean(error);

        const parsedValue =
          field.value === INVALID_DATE
            ? invalidDraft
            : field.value && dayjs(field.value).isValid()
              ? dayjs(field.value)
              : null;

        return (
          <Box
            sx={{
              width: "100%",
              "& .MuiInputBase-root, & .MuiPickersInputBase-root, & .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root": {
                height: "44px !important",
                minHeight: "44px !important",
                maxHeight: "44px !important",
                borderRadius: "7px !important",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.03)"
                    : "#ffffff",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxSizing: "border-box !important",
                "&:hover": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "#ffffff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                },
              },
              "& input, & .MuiInputBase-input, & .MuiPickersInputBase-input, & .MuiOutlinedInput-input": {
                height: "44px !important",
                maxHeight: "44px !important",
                padding: "0 12px !important",
                fontSize: "0.875rem !important",
                boxSizing: "border-box !important",
                textAlign: "left !important",
              },
              "& .MuiPickersSectionList-root": {
                padding: "0 !important",
                height: "100% !important",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start !important",
                textAlign: "left !important",
              },
              "& .MuiInputAdornment-root": {
                height: "100%",
                maxHeight: "44px",
                marginRight: "4px",
                "& button, & .MuiIconButton-root": {
                  color: "primary.main",
                  padding: "4px !important",
                },
              },
              ...sx,
              ...inputSx,
            }}
          >
            {label && (
              <OverflowTooltipLabel label={label} required={required} />
            )}
            <PickerComponent
              value={parsedValue}
              onChange={(newValue) => {
                if (!newValue) {
                  field.onChange(null);
                } else if (dayjs.isDayjs(newValue) && newValue.isValid()) {
                  field.onChange(newValue.toISOString());
                } else if (validateFormat) {
                  setInvalidDraft(newValue);
                  field.onChange(INVALID_DATE);
                }
              }}
              format={format}
              disabled={disabled}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size,
                  error: hasError,
                  helperText: error?.message,
                  inputRef: field.ref,
                  ...(externalSlotProps.textField || {}),
                },
                ...externalSlotProps,
              }}
              {...props}
            />
          </Box>
        );
      }}
    />
  );
};

export default CustomDatePicker;
