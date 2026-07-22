import { forwardRef, useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  Divider,
  InputAdornment,
  Typography,
  FormHelperText,
} from "@mui/material";
import { Controller } from "react-hook-form";

const DEFAULT_CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "TMT", symbol: "m" },
  { code: "RUB", symbol: "₽" },
];

function sanitizeDecimalInput(raw) {
  let value = raw.replace(",", ".").replace(/[^0-9.]/g, "");

  const firstDot = value.indexOf(".");
  if (firstDot !== -1) {
    value =
      value.slice(0, firstDot + 1) +
      value.slice(firstDot + 1).replace(/\./g, "");
  }

  if (value.length > 1 && value[0] === "0" && value[1] !== ".") {
    value = value.replace(/^0+/, "") || "0";
  }

  return value;
}

const sharedInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "7px",
    minHeight: "44px",
    backgroundColor: (theme) =>
      theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    pr: 0.5,
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
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "0 0 0 3px rgba(59, 130, 246, 0.16)"
          : "0 0 0 3px rgba(37, 99, 235, 0.12)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderWidth: 1.5,
    },
  },
  "& .MuiOutlinedInput-input": {
    py: "10px",
  },
  "& .MuiFormHelperText-root": {
    mx: 1,
    mt: 0.5,
    fontSize: "0.75rem",
    fontWeight: 500,
  },
};

const CurrencyAmount = forwardRef(function CurrencyAmount(
  {
    label = "",
    value,
    onChange,
    onBlur,
    name,
    control,
    rules,
    defaultValue = "",
    currency,
    onCurrencyChange,
    currencies = DEFAULT_CURRENCIES,
    error = false,
    helperText,
    disabled = false,
    fullWidth = true,
    size = "medium",
    placeholder = "0.00",
    required = false,
    sx = {},
  },
  ref
) {
  const [internalCurrency, setInternalCurrency] = useState(
    currencies[0]?.code
  );

  const handleAmountChange = (nextValue, fieldOnChange, fieldValue) => {
    const cleaned = sanitizeDecimalInput(nextValue);

    if (fieldValue && typeof fieldValue === "object" && !Array.isArray(fieldValue)) {
      const nextFieldValue = {
        ...fieldValue,
        total: cleaned,
      };
      fieldOnChange?.(nextFieldValue);
      onChange?.(nextFieldValue);
      return;
    }

    fieldOnChange?.(cleaned);
    onChange?.(cleaned);
  };

  const handleCurrencyChange = (e, fieldOnChange, fieldValue) => {
    const next = e.target.value;

    if (fieldValue && typeof fieldValue === "object" && !Array.isArray(fieldValue)) {
      const nextFieldValue = {
        ...fieldValue,
        currency: next,
      };
      fieldOnChange?.(nextFieldValue);
      onChange?.(nextFieldValue);
      return;
    }

    if (onCurrencyChange) {
      onCurrencyChange(next);
    } else {
      setInternalCurrency(next);
    }
  };

  const handleInputRef = (node, fieldRef) => {
    if (typeof fieldRef === "function") {
      fieldRef(node);
    } else if (fieldRef) {
      fieldRef.current = node;
    }

    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const renderField = ({ field, fieldState }) => {
    const hasError = Boolean(fieldState?.error || error);
    const resolvedHelperText = fieldState?.error?.message || helperText;
    const currentValue = field.value ?? value ?? "";
    const currentAmount =
      currentValue && typeof currentValue === "object" && !Array.isArray(currentValue)
        ? currentValue.total ?? ""
        : currentValue ?? "";
    const currentCurrency =
      currentValue && typeof currentValue === "object" && !Array.isArray(currentValue)
        ? currentValue.currency ?? currency ?? internalCurrency
        : currency ?? internalCurrency;

    return (
      <Box sx={{ width: "100%" }}>
        {label && (
          <Typography
            variant="body2"
            component="div"
            sx={{
              mb: 0.75,
              fontWeight: 600,
              fontSize: "0.875rem",
              color: "text.primary",
            }}
          >
            {label}
            {required && (
              <span style={{ color: "#ef4444", marginLeft: "4px", fontSize: "17px" }}>*</span>
            )}
          </Typography>
        )}

        <TextField
          name={name}
          value={currentAmount}
          onChange={(e) => handleAmountChange(e.target.value, field.onChange, currentValue)}
          onBlur={(e) => {
            field.onBlur?.();
            onBlur?.(e);
          }}
          placeholder={placeholder}
          error={hasError}
          helperText={resolvedHelperText}
          disabled={disabled}
          fullWidth={fullWidth}
          size={size}
          inputMode="decimal"
          autoComplete="off"
          inputRef={(node) => handleInputRef(node, field.ref)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end" sx={{ ml: 0 }}>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      mx: 1,
                      my: 1,
                      borderColor: "divider",
                    }}
                  />
                  <Select
                    value={currentCurrency}
                    onChange={(e) => handleCurrencyChange(e, field.onChange, currentValue)}
                    disabled={disabled}
                    variant="standard"
                    disableUnderline
                    MenuProps={{
                      slotProps: {
                        paper: {
                          elevation: 3,
                          sx: {
                            mt: 1,
                            borderRadius: "12px",
                            boxShadow: (theme) =>
                              theme.palette.mode === "dark"
                                ? "0px 12px 32px rgba(0, 0, 0, 0.55)"
                                : "0px 10px 30px rgba(0, 0, 0, 0.1)",
                            border: "1px solid",
                            borderColor: "divider",
                            maxHeight: 300,
                            "& .MuiList-root": {
                              padding: "6px 0",
                            },
                            "& .MuiMenuItem-root": {
                              borderRadius: "8px",
                              margin: "4px 8px",
                              padding: "10px 14px",
                              fontSize: "0.9rem",
                              transition: "all 0.2s ease",
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
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
                          },
                        },
                      },
                    }}
                    sx={{
                      minWidth: 72,
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "text.primary",
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        py: 0.5,
                        pr: "24px !important",
                      },
                    }}
                  >
                    {currencies.map((c) => (
                      <MenuItem key={c.code} value={c.code}>
                        <Box
                          component="span"
                          sx={{ color: "text.secondary", mr: 0.5 }}
                        >
                          {c.symbol}
                        </Box>
                        {c.code}
                      </MenuItem>
                    ))}
                  </Select>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            ...sharedInputSx,
            ...sx,
          }}
        />

        {hasError && resolvedHelperText && (
          <FormHelperText sx={{ mx: 1, mt: 0.5, fontSize: "0.75rem", fontWeight: 500 }}>
            {resolvedHelperText}
          </FormHelperText>
        )}
      </Box>
    );
  };

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={defaultValue}
        render={renderField}
      />
    );
  }

  return renderField({
    field: {
      value: value ?? "",
      onChange: (nextValue) => onChange?.(nextValue),
      onBlur: () => onBlur?.(),
      ref: null,
    },
    fieldState: {},
  });
});

export default CurrencyAmount;
