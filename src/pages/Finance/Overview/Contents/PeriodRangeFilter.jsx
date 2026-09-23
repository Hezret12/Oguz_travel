import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import { segmentedSx } from "../functions/analyticsFormat";
import {
  CUSTOM_PERIOD,
  MAX_RANGE_DAYS,
  PERIODS,
  getPeriodRange,
} from "../functions/officeAnalyticsMock";

const FIELD_SX = {
  width: 146,
  "& .MuiOutlinedInput-root": {
    height: 38,
    borderRadius: "10px",
    fontSize: "0.85rem",
    backgroundColor: "background.paper",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
  "& .MuiInputLabel-root": { fontSize: "0.85rem" },
  "& .MuiInputAdornment-root .MuiIconButton-root": { color: "primary.main" },
};

const pickerSlotProps = { textField: { size: "small", sx: FIELD_SX } };

// dayjs.min / dayjs.max need the minMax plugin, which the app does not load.
const earliest = (a, b) => (a.isBefore(b) ? a : b);
const latest = (a, b) => (a.isAfter(b) ? a : b);

// Nothing is reported from further back than this. It also keeps a date being typed from
// reaching the page: a field edited by keyboard reports every keystroke, so the year passes
// through 0002 and 0202 on its way to 2026.
const EARLIEST_YEARS_BACK = 10;

/**
 * The reporting range of an analytics page: the start and end dates themselves, plus the
 * `PERIODS` shortcuts that fill them in one click.
 *
 * The dates always show the range the page is reporting on, whether it came from a shortcut or
 * was typed in; editing either date turns the range into a custom one. `onChange` receives the
 * whole selection ({ period, customRange }) so a page can store it in one go.
 */
const PeriodRangeFilter = ({ period, customRange, onChange }) => {
  const { t } = useLocale();
  const today = dayjs();
  const floor = today.subtract(EARLIEST_YEARS_BACK, "year").startOf("year");
  const { start, end } = getPeriodRange(period, customRange, today);

  const apply = (nextStart, nextEnd) =>
    onChange({
      period: CUSTOM_PERIOD,
      customRange: { start: nextStart.format("YYYY-MM-DD"), end: nextEnd.format("YYYY-MM-DD") },
    });

  const isUsable = (value) =>
    Boolean(value?.isValid()) && !value.isBefore(floor, "day") && !value.isAfter(today, "day");

  // The other end follows when it would otherwise leave the range invalid or longer than the
  // reporting limit, so either date can be moved on its own.
  const handleStartChange = (value) => {
    if (!isUsable(value)) return;
    const nextStart = value.startOf("day");
    const latestEnd = earliest(nextStart.add(MAX_RANGE_DAYS - 1, "day"), today);
    apply(nextStart, end.isBefore(nextStart) ? nextStart : earliest(end, latestEnd));
  };

  const handleEndChange = (value) => {
    if (!isUsable(value)) return;
    const nextEnd = value.startOf("day");
    const earliestStart = latest(nextEnd.subtract(MAX_RANGE_DAYS - 1, "day"), floor);
    apply(start.isAfter(nextEnd) ? nextEnd : latest(start, earliestStart), nextEnd);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
      <DatePicker
        label={t("columns.startDate")}
        value={start}
        onChange={handleStartChange}
        format="DD.MM.YYYY"
        views={["year", "month", "day"]}
        disableFuture
        minDate={floor}
        maxDate={end}
        slotProps={pickerSlotProps}
      />
      <Typography component="span" sx={{ color: "text.secondary" }}>
        –
      </Typography>
      <DatePicker
        label={t("columns.endDate")}
        value={end}
        onChange={handleEndChange}
        format="DD.MM.YYYY"
        views={["year", "month", "day"]}
        disableFuture
        minDate={start}
        maxDate={earliest(start.add(MAX_RANGE_DAYS - 1, "day"), today)}
        slotProps={pickerSlotProps}
      />

      {/* Shortcuts; none is selected once the dates are edited by hand. */}
      <ToggleButtonGroup
        exclusive
        value={period}
        onChange={(_e, next) => next && onChange({ period: next, customRange: null })}
        sx={segmentedSx}
      >
        {PERIODS.map((p) => (
          <ToggleButton key={p} value={p}>
            {t(`finance.analytics.periods.${p}`)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default PeriodRangeFilter;
