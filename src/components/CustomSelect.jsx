import {
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";

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

  // Dışarıdan gelen getRowId / getRowLabel ile her türlü data şeklini normalize ediyoruz
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

        return (
          <Box sx={{ width: "100%" }}>
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
                value={isLoading || isError ? "" : (field.value ?? "")}
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
                    selected === ""
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
                {field.value &&
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
                  return (
                    <MenuItem key={option.id} value={option.id}>
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
                  sx={{ mx: 1, mt: 0.5, fontSize: "0.75rem", fontWeight: 500 }}
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
