import {
  Autocomplete,
  Box,
  TextField,
  Typography,
  Chip,
  Checkbox,
} from "@mui/material";
import { Controller } from "react-hook-form";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

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
  multiple = false,
  maxChips,
  popupIcon = <KeyboardArrowDownIcon />,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => {
        const hasError = Boolean(error);
        const currentValues = Array.isArray(value) ? value : [];

        const selectedValue = multiple
          ? options.filter((opt) => currentValues.includes(opt.value))
          : options.find((opt) => opt.value === value) || null;

        const chipLimit =
          typeof maxChips === "number" && maxChips > 0
            ? maxChips
            : typeof props.limitTags === "number" && props.limitTags > 0
            ? props.limitTags
            : null;

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
                {required && (
                  <span style={{ color: "#ef4444", marginLeft: "4px" }}>
                    *
                  </span>
                )}
              </Typography>
            )}

            <Autocomplete
              id={`${name}-autocomplete`}
              multiple={multiple}
              disableCloseOnSelect={multiple}
              limitTags={chipLimit ?? -1}
              disabled={disabled}
              options={options}
              getOptionLabel={(option) => option.label || ""}
              renderTags={
                multiple
                  ? (selectedOptions, getTagProps) => {
                      const total = selectedOptions.length;
                      const limit =
                        chipLimit && chipLimit > 0 ? chipLimit : total;
                      const visible = selectedOptions.slice(0, limit);
                      const hiddenCount = total - limit;

                      return [
                        ...visible.map((opt, idx) => {
                          const tagProps = getTagProps({ index: idx });
                          return (
                            <Chip
                              {...tagProps}
                              key={opt.value || idx}
                              label={opt.label}
                              size="small"
                              sx={{
                                borderRadius: "6px",
                                height: "24px",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                maxWidth: "110px",
                                my: 0.25,
                                mr: 0.5,
                              }}
                            />
                          );
                        }),
                        hiddenCount > 0 ? (
                          <Chip
                            key="hidden-tag-count"
                            size="small"
                            label={`+${hiddenCount}`}
                            sx={{
                              borderRadius: "6px",
                              height: "24px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              bgcolor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "#334155"
                                  : "#E2E8F0",
                              color: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "#F8FAFC"
                                  : "#475569",
                              my: 0.25,
                              mr: 0.5,
                            }}
                          />
                        ) : null,
                      ].filter(Boolean);
                    }
                  : undefined
              }
              renderOption={(props, option, { selected, index }) => (
                <li {...props} key={`${option.value || option.label}-${index}`}>
                  {multiple && (
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                  )}
                  {option.label}
                </li>
              )}
              value={selectedValue}
              onChange={(_, newValue) => {
                if (multiple) {
                  onChange(
                    Array.isArray(newValue)
                      ? newValue.map((v) => v.value)
                      : [],
                  );
                } else {
                  onChange(newValue ? newValue.value : "");
                }
              }}
              isOptionEqualToValue={(option, val) =>
                option.value === (val?.value ?? val)
              }
              popupIcon={popupIcon}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={ref}
                  placeholder={
                    multiple && Array.isArray(selectedValue) && selectedValue.length > 0
                      ? ""
                      : placeholder
                  }
                  error={hasError}
                  helperText={error?.message}
                  fullWidth={fullWidth}
                  size={size}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      minHeight: "44px",
                      maxHeight: "44px",
                      overflow: "hidden",
                      flexWrap: "nowrap",
                      py: "2px",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.03)"
                          : "#ffffff",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "#ffffff",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.02)"
                            : "#ffffff",
                        boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      py: "4px",
                      minWidth: "30px !important",
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
