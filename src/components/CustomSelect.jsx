import {
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { useState, useMemo } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const defaultGetRowId = (item) => item?.guid ?? item?.value ?? "";
const defaultGetRowLabel = (item) => item?.label ?? "";

const menuPaperSx = {
  borderRadius: "12px",
  marginTop: "6px",
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
    margin: "4px 8px",
    padding: "10px 14px",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: (theme) =>
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(37, 99, 235, 0.04)",
      transform: "translateX(4px)",
      color: "primary.main",
    },
    "&.Mui-selected": {
      backgroundColor: (theme) =>
        theme.palette.mode === "dark"
          ? "rgba(37, 99, 235, 0.2)"
          : "rgba(37, 99, 235, 0.08)",
      color: "primary.main",
      fontWeight: 600,
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
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Dışarıdan gelen getRowId / getRowLabel ile her türlü data şeklini normalize ediyoruz
  const normalizedOptions = useMemo(
    () =>
      options.map((item) => ({
        id: getRowId(item),
        label: getRowLabel(item),
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
                  <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                )}
              </Typography>
            )}

            <FormControl
              fullWidth
              error={hasError}
              size={size}
              disabled={isDisabled}
              required={required}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "7px",
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
                IconComponent={(iconProps) =>
                  isLoading ? (
                    <CircularProgress
                      size={16}
                      sx={{ mr: 1.5, color: "text.disabled" }}
                    />
                  ) : (
                    <KeyboardArrowDownIcon
                      {...iconProps}
                      style={{
                        ...iconProps.style,
                        transform: isOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  )
                }
                renderValue={(selected) => {
                  if (selected === undefined || selected === null || selected === "") {
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
                  return (
                    <Typography sx={{ fontSize: "0.875rem" }}>
                      {selectedOption?.label ?? selected}
                    </Typography>
                  );
                }}
                {...props}
              >
                {normalizedOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
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
