import {
  Autocomplete,
  Box,
  TextField,
  Typography,
  Chip,
  Checkbox,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const AppAutocomplete = ({
  name,
  control,
  label,
  options = [],
  required = false,
  placeholder,
  fullWidth = true,
  size = "medium",
  disabled = false,
  multiple = false,
  maxChips,
  popupIcon = <ChevronDown size={18} />,
  renderTags: customRenderTags,
  onValueChange,
  sx = {},
  ...restProps
}) => {
  // Strip any accidental renderTags, ownerState, or PaperProps from restProps
  const cleanProps = { ...restProps };
  delete cleanProps.renderTags;
  delete cleanProps.ownerState;
  delete cleanProps.PaperProps;

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
            : typeof cleanProps.limitTags === "number" && cleanProps.limitTags > 0
              ? cleanProps.limitTags
              : null;

        const renderTagsProp = customRenderTags
          ? customRenderTags
          : multiple
            ? (selectedOptions, getTagProps) => {
              const total = selectedOptions.length;
              const limit = chipLimit && chipLimit > 0 ? chipLimit : total;
              const visible = selectedOptions.slice(0, limit);
              const hiddenCount = total - limit;

              return [
                ...visible.map((opt, idx) => {
                  const tagProps = { ...getTagProps({ index: idx }) };
                  const tagKey = tagProps.key;
                  delete tagProps.key;
                  delete tagProps.renderTags;
                  delete tagProps.ownerState;

                  return (
                    <Chip
                      {...tagProps}
                      key={tagKey || opt.value || idx}
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
            : undefined;

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
              {...cleanProps}
              id={`${name}-autocomplete`}
              multiple={multiple}
              disableCloseOnSelect={multiple}
              limitTags={chipLimit ?? -1}
              disabled={disabled}
              options={options}
              popupIcon={popupIcon}
              getOptionKey={(option, index) =>
                option?.value ?? option?.id ?? option?.userGuid ?? option?.label ?? index
              }
              getOptionLabel={(option) => option.label || ""}
              {...(renderTagsProp ? { renderTags: renderTagsProp } : {})}
              renderOption={(optionProps, option, { selected, index }) => {
                const { key, ...cleanOptionProps } = optionProps;
                delete cleanOptionProps.renderTags;
                delete cleanOptionProps.ownerState;
                const optionKey =
                  option?.value ?? option?.id ?? key ?? `${option?.label || "opt"}-${index}`;

                return (
                  <li key={optionKey} {...cleanOptionProps}>
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
                );
              }}
              value={selectedValue}
              onChange={(_, newValue) => {
                if (multiple) {
                  const vals = Array.isArray(newValue)
                    ? newValue.map((v) => v.value)
                    : [];
                  onChange(vals);
                  onValueChange?.(vals, newValue);
                } else {
                  const val = newValue ? newValue.value : "";
                  onChange(val);
                  onValueChange?.(val, newValue);
                }
              }}
              isOptionEqualToValue={(option, val) =>
                option.value === (val?.value ?? val)
              }
              renderInput={(params) => {
                const { ...textFieldProps } = params;
                delete textFieldProps.renderTags;
                delete textFieldProps.ownerState;
                return (
                  <TextField
                    {...textFieldProps}
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
                  />
                );
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  minHeight: "44px",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "#ffffff",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  },
                  "&.Mui-focused": {
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? "0 0 0 3px rgba(59, 130, 246, 0.16)"
                        : "0 0 0 3px rgba(37, 99, 235, 0.12)",
                  },
                },
                "& .MuiAutocomplete-input": {
                  minWidth: 0,
                },
                "& .MuiAutocomplete-endAdornment": {
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: "12px",
                },
                "& .MuiAutocomplete-popupIndicator": {
                  color: "text.secondary",
                  p: "4px",
                },
                "& .MuiAutocomplete-clearIndicator": {
                  color: "text.secondary",
                  p: "4px",
                },
                "& .MuiFormHelperText-root": {
                  mx: 1,
                  mt: 0.5,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                },
                ...sx,
                ...cleanProps.sx,
              }}
            />
          </Box>
        );
      }}
    />
  );
};

export default AppAutocomplete;
