import { Box, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Controller } from "react-hook-form";
import dayjs from "dayjs";

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
  slotProps: externalSlotProps = {},
  ...props
}) => {
  const PickerComponent = showTime ? DateTimePicker : DatePicker;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const hasError = Boolean(error);

        return (
          <Box sx={{ width: "100%" }}>
            {label && (
              <Typography
                variant="body2"
                sx={{
                  mb: 0.75,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "text.primary",
                }}
              >
                {label}
                {required && (
                  <span
                    style={{
                      color: "#ef4444",
                      marginLeft: "4px",
                      fontSize: "17px",
                    }}
                  >
                    *
                  </span>
                )}
              </Typography>
            )}
            <PickerComponent
              value={field.value ? dayjs(field.value) : null}
              onChange={(newValue) => {
                field.onChange(
                  newValue && newValue.isValid()
                    ? newValue.toISOString()
                    : null,
                );
              }}
              format={format}
              disabled={disabled}
              views={showTime ? undefined : ["year", "month", "day"]}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size,
                  error: hasError,
                  helperText: error?.message,
                  inputRef: field.ref,
                  sx: {
                    "& .MuiInputBase-root": {
                      fontSize: "0.9rem",
                    },
                    "& .MuiInputLabel-root": { fontSize: "0.9rem" },
                    "& .MuiInputAdornment-root .MuiIconButton-root": {
                      color: "#1565C0",
                    },
                    ...sx,
                    ...(externalSlotProps.textField?.sx || {}),
                  },
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
