import { useMemo, memo } from "react";
import { Box, Chip, FormControl, Stack, Typography, alpha } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { CalendarRange } from "lucide-react";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";

const DATE_FORMAT = "YYYY-MM-DD";

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
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
            "& .MuiInputAdornment-root .MuiIconButton-root": { color: "primary.main" },
          },
        },
      }}
    />
  </FormControl>
);

/** Letter stock filters: the batch's created date between `start_date` and `end_date`. */
const LetterStockFilter = ({ filters, onFilterChange }) => {
  const { t } = useLocale();
  const startDate = filters?.start_date;
  const endDate = filters?.end_date;

  const presets = useMemo(() => {
    const range = (from, to) => [from.format(DATE_FORMAT), to.format(DATE_FORMAT)];
    const now = dayjs();
    const items = [
      { id: "thisMonth", range: range(now.startOf("month"), now.endOf("month")) },
      {
        id: "lastMonth",
        range: range(
          now.subtract(1, "month").startOf("month"),
          now.subtract(1, "month").endOf("month"),
        ),
      },
      { id: "thisYear", range: range(now.startOf("year"), now.endOf("year")) },
      { id: "allTime", range: ["", ""] },
    ];
    return items.map(({ id, range: [from, to] }) => ({
      id,
      label: t(`outbound.${id}`),
      isActive: (startDate || "") === from && (endDate || "") === to,
      onClick: () => {
        onFilterChange("start_date", from);
        onFilterChange("end_date", to);
      },
    }));
  }, [startDate, endDate, onFilterChange, t]);

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.25 }}>
        <Box component="span" sx={{ display: "inline-flex", color: "primary.main" }}>
          <CalendarRange size={18} />
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 650, fontSize: "13.5px" }}>
          {t("outbound.dateRange")}
        </Typography>
      </Stack>

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
              borderColor: p.isActive ? "primary.main" : "divider",
              backgroundColor: (theme) =>
                p.isActive ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.02),
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

      <Stack spacing={2}>
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
    </Box>
  );
};

export default memo(LetterStockFilter);
