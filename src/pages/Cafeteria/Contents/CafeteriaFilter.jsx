import { useMemo, memo } from "react";
import {
  Box,
  ButtonBase,
  Chip,
  Divider,
  FormControl,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import { useOfficeOptions } from "../functions/useOfficeOptions";

const FilterDatePicker = ({
  label,
  name,
  value,
  onChange,
  minDate,
  maxDate,
}) => (
  <FormControl fullWidth size="small">
    <Typography
      variant="body2"
      sx={{ mb: 0.75, fontWeight: 600, color: "text.primary", fontSize: "13px" }}
    >
      {label}
    </Typography>
    <DatePicker
      value={value ? dayjs(value) : null}
      onChange={(newValue) => {
        onChange(
          name,
          newValue && newValue.isValid() ? newValue.format("YYYY-MM-DD") : ""
        );
      }}
      minDate={minDate ? dayjs(minDate) : undefined}
      maxDate={maxDate ? dayjs(maxDate) : undefined}
      format="DD.MM.YYYY"
      views={["year", "month", "day"]}
      slotProps={{
        field: { clearable: true, onClear: () => onChange(name, "") },
        textField: {
          fullWidth: true,
          size: "small",
          sx: {
            "& .MuiInputBase-root": {
              fontSize: "0.875rem",
              height: "42px",
              minHeight: "42px",
              borderRadius: "10px",
              backgroundColor: "background.paper",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "divider",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
            "& .MuiInputAdornment-root .MuiIconButton-root": {
              color: "primary.main",
            },
          },
        },
      }}
    />
  </FormControl>
);

const CafeteriaFilter = ({ filters, onFilterChange }) => {
  const { t } = useLocale();

  const currentType = String(filters?.type ?? "");
  const officeOptions = useOfficeOptions();

  // Quick Date Range Presets
  const presets = useMemo(() => {
    const sDate = filters?.start_date;
    const eDate = filters?.end_date;

    const thisMonthStart = dayjs().startOf("month").format("YYYY-MM-DD");
    const thisMonthEnd = dayjs().endOf("month").format("YYYY-MM-DD");

    const lastMonthStart = dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD");
    const lastMonthEnd = dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD");

    const thisYearStart = dayjs().startOf("year").format("YYYY-MM-DD");
    const thisYearEnd = dayjs().endOf("year").format("YYYY-MM-DD");

    return [
      {
        id: "thisMonth",
        label: t("outbound.thisMonth") || "Şu aý",
        isActive: sDate === thisMonthStart && eDate === thisMonthEnd,
        onClick: () => {
          onFilterChange("start_date", thisMonthStart);
          onFilterChange("end_date", thisMonthEnd);
        },
      },
      {
        id: "lastMonth",
        label: t("outbound.lastMonth") || "Geçen aý",
        isActive: sDate === lastMonthStart && eDate === lastMonthEnd,
        onClick: () => {
          onFilterChange("start_date", lastMonthStart);
          onFilterChange("end_date", lastMonthEnd);
        },
      },
      {
        id: "thisYear",
        label: t("outbound.thisYear") || "Şu ýyl",
        isActive: sDate === thisYearStart && eDate === thisYearEnd,
        onClick: () => {
          onFilterChange("start_date", thisYearStart);
          onFilterChange("end_date", thisYearEnd);
        },
      },
      {
        id: "allTime",
        label: t("outbound.allTime") || "Ähli döwür",
        isActive: !sDate && !eDate,
        onClick: () => {
          onFilterChange("start_date", "");
          onFilterChange("end_date", "");
        },
      },
    ];
  }, [filters?.start_date, filters?.end_date, onFilterChange, t]);

  return (
    <Stack spacing={3}>
      {/* 1. Transaction Type Segmented Control */}
      <Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.25 }}>
          <SwapVertRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: 650, color: "text.primary", fontSize: "13.5px" }}
          >
            {t("cafeteria.type")}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1,
            p: 0.5,
            borderRadius: "12px",
            backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.04),
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Hemmesi (All) */}
          <ButtonBase
            type="button"
            onClick={() => onFilterChange("type", "")}
            sx={{
              py: 1,
              px: 1,
              borderRadius: "9px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.4,
              border: "1px solid",
              borderColor: currentType === "" ? "primary.main" : "transparent",
              backgroundColor: (theme) =>
                currentType === "" ? theme.palette.background.paper : "transparent",
              color: currentType === "" ? "primary.main" : "text.secondary",
              boxShadow: currentType === "" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.18s ease-in-out",
              "&:hover": {
                backgroundColor: (theme) =>
                  currentType === ""
                    ? theme.palette.background.paper
                    : alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <Typography sx={{ fontSize: "12.5px", fontWeight: currentType === "" ? 700 : 500 }}>
              {t("all")}
            </Typography>
          </ButtonBase>

          {/* Girdeji (Income) */}
          <ButtonBase
            type="button"
            onClick={() => onFilterChange("type", "true")}
            sx={{
              py: 1,
              px: 1,
              borderRadius: "9px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.4,
              border: "1px solid",
              borderColor: currentType === "true" ? "success.main" : "transparent",
              backgroundColor: (theme) =>
                currentType === "true"
                  ? alpha(theme.palette.success.main, 0.12)
                  : "transparent",
              color: currentType === "true" ? "success.main" : "text.secondary",
              boxShadow:
                currentType === "true"
                  ? (theme) => `0 2px 8px ${alpha(theme.palette.success.main, 0.2)}`
                  : "none",
              transition: "all 0.18s ease-in-out",
              "&:hover": {
                backgroundColor: (theme) =>
                  alpha(theme.palette.success.main, currentType === "true" ? 0.16 : 0.06),
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TrendingUpRoundedIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: "12.5px", fontWeight: currentType === "true" ? 700 : 500 }}>
                {t("cafeteria.types.income")}
              </Typography>
            </Box>
          </ButtonBase>

          {/* Çykdajy (Expense) */}
          <ButtonBase
            type="button"
            onClick={() => onFilterChange("type", "false")}
            sx={{
              py: 1,
              px: 1,
              borderRadius: "9px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.4,
              border: "1px solid",
              borderColor: currentType === "false" ? "error.main" : "transparent",
              backgroundColor: (theme) =>
                currentType === "false"
                  ? alpha(theme.palette.error.main, 0.12)
                  : "transparent",
              color: currentType === "false" ? "error.main" : "text.secondary",
              boxShadow:
                currentType === "false"
                  ? (theme) => `0 2px 8px ${alpha(theme.palette.error.main, 0.2)}`
                  : "none",
              transition: "all 0.18s ease-in-out",
              "&:hover": {
                backgroundColor: (theme) =>
                  alpha(theme.palette.error.main, currentType === "false" ? 0.16 : 0.06),
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TrendingDownRoundedIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: "12.5px", fontWeight: currentType === "false" ? 700 : 500 }}>
                {t("cafeteria.types.expense")}
              </Typography>
            </Box>
          </ButtonBase>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "divider" }} />

      {/* 2. Office */}
      <Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.25 }}>
          <StorefrontRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: 650, color: "text.primary", fontSize: "13.5px" }}
          >
            {t("columns.office")}
          </Typography>
        </Stack>
        <TextField
          select
          fullWidth
          size="small"
          value={filters?.office_guid ?? ""}
          onChange={(e) => onFilterChange("office_guid", e.target.value)}
          slotProps={{ select: { displayEmpty: true } }}
          sx={{
            "& .MuiInputBase-root": {
              fontSize: "0.875rem",
              height: "42px",
              borderRadius: "10px",
              backgroundColor: "background.paper",
            },
          }}
        >
          <MenuItem value="">{t("all")}</MenuItem>
          {officeOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Divider sx={{ borderColor: "divider" }} />

      {/* 3. Date Range Section with Quick Presets */}
      <Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.25 }}>
          <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: 650, color: "text.primary", fontSize: "13.5px" }}
          >
            {t("outbound.dateRange") || "Sene aralygy"}
          </Typography>
        </Stack>

        {/* Quick Date Presets */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
          {presets.map((p) => (
            <Chip
              key={p.id}
              label={p.label}
              size="small"
              clickable
              onClick={p.onClick}
              variant={p.isActive ? "filled" : "outlined"}
              color={p.isActive ? "primary" : "default"}
              sx={{
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: p.isActive ? 650 : 500,
                height: "28px",
                transition: "all 0.15s ease",
                borderColor: p.isActive ? "primary.main" : "divider",
                backgroundColor: (theme) =>
                  p.isActive
                    ? theme.palette.primary.main
                    : alpha(theme.palette.text.primary, 0.02),
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: (theme) =>
                    p.isActive
                      ? theme.palette.primary.dark
                      : alpha(theme.palette.primary.main, 0.08),
                },
              }}
            />
          ))}
        </Box>

        {/* Date Pickers Stack */}
        <Stack spacing={2}>
          <FilterDatePicker
            label={t("columns.startDate")}
            name="start_date"
            value={filters?.start_date}
            maxDate={filters?.end_date}
            onChange={onFilterChange}
          />

          <FilterDatePicker
            label={t("columns.endDate")}
            name="end_date"
            value={filters?.end_date}
            minDate={filters?.start_date}
            onChange={onFilterChange}
          />
        </Stack>
      </Box>
    </Stack>
  );
};

export default memo(CafeteriaFilter);
