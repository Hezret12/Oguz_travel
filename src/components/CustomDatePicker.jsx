import { Box, Typography, Tooltip } from "@mui/material";
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
  inputSx = {},
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
                lineHeight: "44px !important",
                textAlign: "left !important",
              },
              "& .MuiPickersSectionList-root": {
                padding: "0 12px !important",
                height: "44px !important",
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
              <Tooltip title={label} arrow placement="top-start">
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    mb: 0.75,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "text.primary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    cursor: "default",
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
              </Tooltip>
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
