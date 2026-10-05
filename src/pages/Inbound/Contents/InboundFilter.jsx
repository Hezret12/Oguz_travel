import { memo, useMemo } from "react";
import { Box, Chip, FormControl, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import { DATE_FORMAT } from "../constants";

// Which date of a row the range applies to, per tab.
const RANGE_HINT_KEYS = {
  expected: "inbound.filter.hintExpected",
  arrivals: "inbound.filter.hintArrivals",
  invitations: "inbound.filter.hintInvitations",
};

const monthRange = (offset) => {
  const month = dayjs().add(offset, "month");
  return {
    start: month.startOf("month").format(DATE_FORMAT),
    end: month.endOf("month").format(DATE_FORMAT),
  };
};

const FilterDatePicker = ({ label, name, value, onChange, minDate, maxDate }) => (
  <FormControl fullWidth size="small">
    <Typography
      variant="body2"
      sx={{ mb: 0.75, fontWeight: 600, color: "text.primary", fontSize: "13px" }}
    >
      {label}
    </Typography>
    <DatePicker
      value={value ? dayjs(value) : null}
      onChange={(newValue) =>
        onChange(name, newValue && newValue.isValid() ? newValue.format(DATE_FORMAT) : "")
      }
      minDate={minDate ? dayjs(minDate) : undefined}
      maxDate={maxDate ? dayjs(maxDate) : undefined}
      format="DD.MM.YYYY"
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
          },
        },
      }}
    />
  </FormControl>
);

const InboundFilter = ({ activeTab, filters, onFilterChange }) => {
  const { t } = useLocale();
  const startDate = filters?.start_date;
  const endDate = filters?.end_date;

  // The reports are monthly, and "expected" is filed for the month ahead.
  const presets = useMemo(() => {
    const month = (id, labelKey, offset) => {
      const range = monthRange(offset);
      return { id, label: t(labelKey), ...range };
    };
    return [
      month("lastMonth", "outbound.lastMonth", -1),
      month("thisMonth", "outbound.thisMonth", 0),
      month("nextMonth", "inbound.filter.nextMonth", 1),
      { id: "allTime", label: t("outbound.allTime"), start: "", end: "" },
    ];
  }, [t]);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
        <Typography
          variant="body2"
          sx={{ fontWeight: 650, color: "text.primary", fontSize: "13.5px" }}
        >
          {t("outbound.dateRange")}
        </Typography>
      </Stack>

      <Typography sx={{ color: "text.secondary", fontSize: "12.5px" }}>
        {t(RANGE_HINT_KEYS[activeTab])}
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {presets.map((preset) => {
          const isActive = (startDate || "") === preset.start && (endDate || "") === preset.end;
          return (
            <Chip
              key={preset.id}
              label={preset.label}
              size="small"
              clickable
              onClick={() => {
                onFilterChange("start_date", preset.start);
                onFilterChange("end_date", preset.end);
              }}
              variant={isActive ? "filled" : "outlined"}
              color={isActive ? "primary" : "default"}
              sx={{
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: isActive ? 650 : 500,
                height: "28px",
              }}
            />
          );
        })}
      </Box>

      <FilterDatePicker
        label={t("columns.startDate")}
        name="start_date"
        value={startDate}
        maxDate={endDate}
        onChange={onFilterChange}
      />
      <FilterDatePicker
        label={t("columns.endDate")}
        name="end_date"
        value={endDate}
        minDate={startDate}
        onChange={onFilterChange}
      />
    </Stack>
  );
};

export default memo(InboundFilter);
