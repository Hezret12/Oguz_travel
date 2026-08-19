import {
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  Tooltip,
  CircularProgress,
  Checkbox,
  Chip,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import OverflowTooltipLabel from "./OverflowTooltipLabel";

const defaultGetRowId = (item) => item?.guid ?? item?.value ?? "";
const defaultGetRowLabel = (item) => item?.label ?? "";

const menuPaperSx = {
  borderRadius: "12px",
  marginTop: "6px",
  backgroundColor: "background.paper",
  boxShadow: (theme) =>
    theme.palette.mode === "dark"
      ? "0px 12px 32px rgba(0, 0, 0, 0.55)"
      : "0px 10px 30px rgba(0, 0, 0, 0.1)",
  border: "1px solid",
  borderColor: "divider",
  maxHeight: 300,
  "& .MuiList-root": { padding: "6px 0" },
  "& .MuiMenuItem-root": {
    borderRadius: "8px",
    margin: "3px 6px",
    padding: "9px 12px",
    fontSize: "0.875rem",
    transition: "all 0.15s ease",
    "&:hover": {
      backgroundColor: "action.hover",
      color: "text.primary",
    },
    "&.Mui-selected": {
      backgroundColor: (theme) =>
        theme.palette.mode === "dark"
          ? "rgba(20, 184, 166, 0.16)"
          : "rgba(14, 133, 132, 0.08)",
      color: "primary.main",
      fontWeight: 600,
      "&:hover": {
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(20, 184, 166, 0.22)"
            : "rgba(14, 133, 132, 0.12)",
      },
    },
  },
};

const CustomSelect = ({
  name,
  control,
  rules,
  label,
  options = [],
  size = "medium",
  disabled = false,
  required = false,
  multiple = false,
  placeholder,
  sx = {},
  isLoading = false,
  isError = false,
  loadingText,
  errorText,
  emptyText,
  getRowId = defaultGetRowId,
  getRowLabel = defaultGetRowLabel,
  renderOption,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const normalizedOptions = useMemo(
    () =>
      options.map((item) => ({
        id: getRowId(item),
        label: getRowLabel(item),
        color: item?.color || item?.statusColor || item?.dotColor || null,
        raw: item,
      })),
    [options, getRowId, getRowLabel],
  );

  const isEmpty = !isLoading && !isError && normalizedOptions.length === 0;
  const isDisabled = disabled || isLoading || isError;

  const resolvedPlaceholder = isLoading
    ? (loadingText ?? "Ýüklenýär...")
    : isError
      ? (errorText ?? "Maglumatlary ýüklap bolmady")
      : isEmpty
        ? (emptyText ?? "Maglumat ýok")
        : placeholder;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const hasError = Boolean(error) || isError;
        const selectedValue = isLoading || isError
          ? (multiple ? [] : "")
          : multiple
          ? Array.isArray(field.value)
            ? field.value
            : field.value
            ? [field.value]
            : []
          : field.value ?? "";

        return (
          <Box sx={{ width: "100%" }}>
            {label && (
              <OverflowTooltipLabel label={label} required={required} />
            )}

            <FormControl
              fullWidth
              error={hasError}
              size={size}
              disabled={isDisabled}
              required={required}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
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
                        ? "0 0 0 3px rgba(20, 184, 166, 0.18)"
                        : "0 0 0 3px rgba(14, 133, 132, 0.12)",
                  },
                },
                "& .MuiSelect-select": {
                  py: "10px",
                  display: "flex",
                  alignItems: "center",
                },
                ...sx,
              }}
            >
              <Select
                {...field}
                inputRef={field.ref}
                id={`${name}-select`}
                multiple={multiple}
                value={selectedValue}
                displayEmpty={Boolean(resolvedPlaceholder)}
                MenuProps={{ slotProps: { paper: { sx: menuPaperSx } } }}
                open={isOpen}
                onOpen={() => !isDisabled && setIsOpen(true)}
                onClose={() => setIsOpen(false)}
                IconComponent={() =>
                  isLoading ? (
                    <CircularProgress
                      size={16}
                      sx={{ mr: 1.5, color: "text.disabled" }}
                    />
                  ) : (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        right: 12,
                        top: "calc(50% - 9px)",
                        color: "text.secondary",
                        pointerEvents: "none",
                        transform: isOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease",
                      }}
                    >
                      <ChevronDown size={18} />
                    </Box>
                  )
                }
                renderValue={(selected) => {
                  if (
                    selected === undefined ||
                    selected === null ||
                    selected === "" ||
                    (Array.isArray(selected) && selected.length === 0)
                  ) {
                    return (
                      <Typography
                        sx={{
                          color: isError ? "error.main" : "text.disabled",
                          fontSize: "0.875rem",
                        }}
                      >
                        {resolvedPlaceholder}
                      </Typography>
                    );
                  }

                  if (Array.isArray(selected)) {
                    const allLabels = selected
                      .map((val) => normalizedOptions.find((opt) => opt.id === val)?.label ?? val)
                      .join(", ");
                    const visibleItems = selected.slice(0, 2);
                    const remainingCount = selected.length - 2;

                    return (
                      <Tooltip title={selected.length > 1 ? allLabels : ""} arrow placement="top">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            overflow: "hidden",
                            maxWidth: "calc(100% - 24px)",
                          }}
                        >
                          {visibleItems.map((val) => {
                            const selectedOption = normalizedOptions.find((opt) => opt.id === val);
                            return (
                              <Chip
                                key={val}
                                size="small"
                                label={selectedOption?.label ?? val}
                                sx={{
                                  height: "22px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  borderRadius: "6px",
                                  maxWidth: remainingCount > 0 ? "110px" : "150px",
                                  "& .MuiChip-label": {
                                    px: 0.75,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  },
                                  bgcolor: (theme) =>
                                    theme.palette.mode === "dark"
                                      ? "rgba(255, 255, 255, 0.08)"
                                      : "rgba(0, 0, 0, 0.06)",
                                }}
                              />
                            );
                          })}
                          {remainingCount > 0 && (
                            <Chip
                              size="small"
                              label={`+${remainingCount}`}
                              sx={{
                                height: "22px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                borderRadius: "6px",
                                bgcolor: (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "rgba(20, 184, 166, 0.2)"
                                    : "rgba(14, 133, 132, 0.12)",
                                color: "primary.main",
                              }}
                            />
                          )}
                        </Box>
                      </Tooltip>
                    );
                  }

                  const selectedOption = normalizedOptions.find(
                    (opt) => opt.id === selected,
                  );
                  const optionColor =
                    selectedOption?.color || selectedOption?.raw?.color;

                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {optionColor && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: optionColor,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Typography sx={{ fontSize: "0.875rem" }}>
                        {selectedOption?.label ?? selected}
                      </Typography>
                    </Box>
                  );
                }}
                {...props}
              >
                {!multiple && field.value &&
                  !normalizedOptions.some((opt) => opt.id === field.value) && (
                    <MenuItem
                      key={field.value}
                      value={field.value}
                      sx={{ display: "none" }}
                    >
                      {field.value}
                    </MenuItem>
                  )}
                {normalizedOptions.map((option) => {
                  if (renderOption) {
                    return renderOption(option.raw, option);
                  }
                  const optionColor = option.color || option.raw?.color;
                  const isSelected = multiple
                    ? (Array.isArray(field.value) ? field.value : []).includes(option.id)
                    : field.value === option.id;

                  return (
                    <MenuItem key={option.id} value={option.id}>
                      {multiple && (
                        <Checkbox
                          checked={isSelected}
                          size="small"
                          sx={{ mr: 1, p: 0 }}
                        />
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          width: "100%",
                        }}
                      >
                        {optionColor && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: optionColor,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span>{option.label}</span>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>

              {(hasError || error?.message) && (
                <FormHelperText
                  sx={{
                    position: "absolute",
                    bottom: "-20px",
                    left: 0,
                    mx: 1,
                    mt: 0,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    lineHeight: 1.2,
                  }}
                >
                  {error?.message ?? resolvedPlaceholder}
                </FormHelperText>
              )}
            </FormControl>
          </Box>
        );
      }}
    />
  );
};

export default CustomSelect;
