import { Box, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
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
  format = "DD.MM.YYYY",
  ...props
}) => {
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
                }}
              >
                {label}
                {required && (
                  <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                )}
              </Typography>
            )}
            <DatePicker
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
              views={["year", "month", "day"]}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size,
                  error: hasError,
                  helperText: error?.message,
                  inputRef: field.ref,
                },
                sx: {
                  "& .MuiInputBase-root": {
                    fontSize: "0.9rem",
                    height: "48px",
                    minHeight: "48px",
                  },
                  "& .MuiInputLabel-root": { fontSize: "0.9rem" },
                  "& .MuiInputAdornment-root .MuiIconButton-root": {
                    color: "#1565C0",
                  },
                },
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
