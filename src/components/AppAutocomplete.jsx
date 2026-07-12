import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const AppAutocomplete = ({
  name,
  control,
  label,
  options = [], // [{ label: "name", value: "id" }]
  required = false,
  placeholder,
  fullWidth = true,
  size = "medium",
  disabled = false,
  popupIcon = <KeyboardArrowDownIcon />,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => {
        const hasError = Boolean(error);
        const selectedValue = options.find((opt) => opt.value === value) || null;

        return (
          <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
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
                {required && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>}
              </Typography>
            )}
            <Autocomplete
              id={`${name}-autocomplete`}
              disabled={disabled}
              options={options}
              getOptionLabel={(option) => option.label || ""}
              value={selectedValue}
              onChange={(_, newValue) => {
                onChange(newValue ? newValue.value : "");
              }}
              isOptionEqualToValue={(option, val) => option.value === (val?.value ?? val)}
              popupIcon={popupIcon}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={ref}
                  placeholder={placeholder}
                  error={hasError}
                  helperText={error?.message}
                  fullWidth={fullWidth}
                  size={size}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      minHeight: "44px",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.02)" : "#ffffff",
                        boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      py: "4px",
                    },
                    "& .MuiFormHelperText-root": {
                      mx: 1,
                      mt: 0.5,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    },
                  }}
                />
              )}
              {...props}
            />
          </Box>
        );
      }}
    />
  );
};

export default AppAutocomplete;
