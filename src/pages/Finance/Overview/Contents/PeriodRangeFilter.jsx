import { memo, useState } from "react";
import { Box, Button, ButtonBase, Divider, Popover, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickerDay } from "@mui/x-date-pickers/PickerDay";
import { ArrowRight, CalendarDays, ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import { CUSTOM_PERIOD, MAX_RANGE_DAYS, PERIODS, getPeriodRange } from "../functions/periods";

export const CONTROL_HEIGHT = 38;

// Nothing is reported from further back than this.
const EARLIEST_YEARS_BACK = 10;

const DATE = "DD.MM.YYYY";

// Day-based ranges, applied as a custom range: they need no server preset.
const QUICK_RANGES = [
  { key: "today", range: (today) => ({ start: today, end: today }) },
  { key: "yesterday", range: (today) => ({ start: today.subtract(1, "day"), end: today.subtract(1, "day") }) },
  { key: "last7", range: (today) => ({ start: today.subtract(6, "day"), end: today }) },
  { key: "last30", range: (today) => ({ start: today.subtract(29, "day"), end: today }) },
];

const sameDay = (a, b) => Boolean(a && b && a.isSame(b, "day"));
const toCustom = (start, end) => ({
  period: CUSTOM_PERIOD,
  customRange: { start: start.format("YYYY-MM-DD"), end: end.format("YYYY-MM-DD") },
});

// "01.10 – 31.10.2026" within one year, full dates across years, one date for a single day.
const formatRange = (start, end) => {
  if (sameDay(start, end)) return start.format(DATE);
  return start.year() === end.year()
    ? `${start.format("DD.MM")} – ${end.format(DATE)}`
    : `${start.format(DATE)} – ${end.format(DATE)}`;
};

// A calendar day drawn as part of the range band: filled ends, a tinted run
// between them, a lighter run for the hover preview while picking the end.
const RangeDay = ({ rangeStart, rangeEnd, hoverDay, onHoverDay, ...dayProps }) => {
  const { day, outsideCurrentMonth } = dayProps;
  const previewEnd = rangeStart && !rangeEnd && hoverDay?.isAfter(rangeStart, "day") ? hoverDay : null;
  const end = rangeEnd ?? previewEnd;
  const isStart = sameDay(day, rangeStart);
  const isEnd = sameDay(day, rangeEnd);
  const inBand = Boolean(rangeStart && end && day.isAfter(rangeStart, "day") && day.isBefore(end, "day"));
  const isPreviewEdge = sameDay(day, previewEnd);
  const hasBand = Boolean(end && !sameDay(rangeStart, end));

  return (
    <PickerDay
      {...dayProps}
      selected={false}
      onMouseEnter={(e) => {
        dayProps.onMouseEnter?.(e);
        onHoverDay(day);
      }}
      sx={(theme) => {
        const main = theme.palette.primary.main;
        const band = alpha(main, previewEnd ? 0.08 : 0.14);
        if (outsideCurrentMonth) return {};
        if (isStart || isEnd) {
          return {
            backgroundColor: `${main} !important`,
            color: `${theme.palette.primary.contrastText} !important`,
            fontWeight: 700,
            borderRadius: !hasBand ? "50%" : isStart ? "50% 0 0 50%" : "0 50% 50% 0",
          };
        }
        if (inBand || isPreviewEdge) {
          return {
            backgroundColor: band,
            borderRadius: isPreviewEdge ? "0 50% 50% 0" : 0,
            "&:hover": { backgroundColor: alpha(main, 0.22) },
          };
        }
        return {};
      }}
    />
  );
};

const CALENDAR_SX = {
  width: 296,
  height: "auto",
  maxHeight: "none",
  m: 0,
  // Days touch, so the range reads as one band.
  "& .MuiDayCalendar-weekDayLabel, & .MuiPickerDay-root": { width: 40, height: 36, m: 0 },
  "& .MuiDayCalendar-weekContainer": { my: "2px" },
  "& .MuiDayCalendar-slideTransition": { minHeight: 236 },
  "& .MuiPickersCalendarHeader-root": { pl: 1.5, pr: 0.5, mt: 0.5 },
};

// One end of the range being picked; the one the next click sets is outlined.
const EndBox = ({ label, value, active }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      px: 1.25,
      py: 0.75,
      borderRadius: "8px",
      border: "1px solid",
      borderColor: active ? "primary.main" : "divider",
      backgroundColor: active ? (theme) => alpha(theme.palette.primary.main, 0.06) : "transparent",
    }}
  >
    <Typography noWrap sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: value ? "text.primary" : "text.disabled" }}>
      {value ? value.format(DATE) : "—"}
    </Typography>
  </Box>
);

const PresetButton = ({ label, active, onClick }) => (
  <ButtonBase
    onClick={onClick}
    sx={{
      justifyContent: "flex-start",
      px: 1.25,
      py: 0.875,
      borderRadius: "8px",
      fontSize: "0.85rem",
      fontWeight: active ? 700 : 500,
      whiteSpace: "nowrap",
      color: active ? "primary.main" : "text.primary",
      backgroundColor: active ? (theme) => alpha(theme.palette.primary.main, 0.1) : "transparent",
      "&:hover": { backgroundColor: active ? undefined : "action.hover" },
    }}
  >
    {label}
  </ButtonBase>
);

/**
 * The reporting range of an analytics page: one button that names the range, opening a panel
 * with ready ranges (one click applies and closes) and a calendar for any other range (click the
 * first day, then the last, then Apply).
 *
 * `onChange` receives the whole selection ({ period, customRange }) so a page can store it in one
 * go. Nothing reaches the page while a range is being picked, and every range that does is valid:
 * not in the future, not before the floor, at most MAX_RANGE_DAYS long.
 */
const PeriodRangeFilter = ({ period, customRange, onChange }) => {
  const { t } = useLocale();
  const today = dayjs().startOf("day");
  const floor = today.subtract(EARLIEST_YEARS_BACK, "year").startOf("year");
  const { start, end } = getPeriodRange(period, customRange, today);

  const [anchor, setAnchor] = useState(null);
  const [draft, setDraft] = useState({ start: null, end: null });
  const [hoverDay, setHoverDay] = useState(null);

  const quickActive = QUICK_RANGES.find(({ range }) => {
    const r = range(today);
    return period === CUSTOM_PERIOD && sameDay(r.start, start) && sameDay(r.end, end);
  });
  const activeLabel = PERIODS.includes(period)
    ? t(`finance.analytics.periods.${period}`)
    : quickActive
      ? t(`finance.analytics.periods.${quickActive.key}`)
      : t("finance.analytics.periods.custom");

  const open = (e) => {
    setDraft({ start: start.startOf("day"), end: end.startOf("day") });
    setHoverDay(null);
    setAnchor(e.currentTarget);
  };
  const close = () => setAnchor(null);

  const choose = (next) => {
    close();
    const same = next.period === period && (next.period !== CUSTOM_PERIOD
      || (next.customRange.start === customRange?.start && next.customRange.end === customRange?.end));
    if (!same) onChange(next);
  };

  // First click sets the start, second the end; a click before the start, or
  // after a finished range, starts over.
  const pickDay = (day) => {
    if (!day) return;
    const picked = day.startOf("day");
    setDraft((d) =>
      !d.start || d.end || picked.isBefore(d.start, "day") ? { start: picked, end: null } : { start: d.start, end: picked },
    );
  };

  const pickingEnd = Boolean(draft.start && !draft.end);
  const lastAllowedEnd = draft.start ? draft.start.add(MAX_RANGE_DAYS - 1, "day") : null;

  return (
    <>
      <ButtonBase
        onClick={open}
        aria-haspopup="dialog"
        sx={{
          height: CONTROL_HEIGHT,
          px: 1.5,
          gap: 1,
          maxWidth: "100%",
          borderRadius: "10px",
          border: "1px solid",
          borderColor: anchor ? "primary.main" : "divider",
          backgroundColor: "background.paper",
          color: "text.secondary",
          transition: "border-color 150ms ease",
          "&:hover": { borderColor: "primary.main" },
        }}
      >
        <CalendarDays size={16} style={{ flexShrink: 0 }} />
        <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 700, color: "text.primary" }}>
          {activeLabel}
        </Typography>
        <Typography noWrap sx={{ fontSize: "0.8rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
          {formatRange(start, end)}
        </Typography>
        <ChevronDown
          size={16}
          style={{ flexShrink: 0, transition: "transform .2s ease", transform: anchor ? "rotate(180deg)" : "none" }}
        />
      </ButtonBase>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: "14px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: (theme) =>
                theme.palette.mode === "dark" ? "0 12px 32px rgba(0,0,0,0.55)" : "0 12px 32px rgba(15,23,42,0.12)",
              maxWidth: "calc(100vw - 32px)",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" } }}>
          {/* Ready ranges: one click applies */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", sm: "column" },
              flexWrap: { xs: "wrap", sm: "nowrap" },
              gap: 0.25,
              p: 1,
              minWidth: { sm: 168 },
              borderRight: { sm: "1px solid" },
              borderBottom: { xs: "1px solid", sm: 0 },
              borderColor: "divider",
            }}
          >
            {QUICK_RANGES.map(({ key, range }) => {
              const r = range(today);
              return (
                <PresetButton
                  key={key}
                  label={t(`finance.analytics.periods.${key}`)}
                  active={quickActive?.key === key}
                  onClick={() => choose(toCustom(r.start, r.end))}
                />
              );
            })}
            <Divider sx={{ my: 0.5, display: { xs: "none", sm: "block" } }} />
            {PERIODS.map((p) => (
              <PresetButton
                key={p}
                label={t(`finance.analytics.periods.${p}`)}
                active={period === p}
                onClick={() => choose({ period: p, customRange: null })}
              />
            ))}
          </Box>

          {/* Any other range: first day, last day, Apply */}
          <Box sx={{ display: "flex", flexDirection: "column", p: 1.5, gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: 296 }}>
              <EndBox label={t("columns.startDate")} value={draft.start} active={!pickingEnd} />
              <ArrowRight size={16} style={{ flexShrink: 0, opacity: 0.5 }} />
              <EndBox label={t("columns.endDate")} value={draft.end} active={pickingEnd} />
            </Box>

            <Box onMouseLeave={() => setHoverDay(null)}>
              <DateCalendar
                value={null}
                onChange={pickDay}
                referenceDate={draft.end ?? draft.start ?? today}
                minDate={floor}
                maxDate={today}
                disableFuture
                shouldDisableDate={pickingEnd ? (day) => day.isAfter(lastAllowedEnd, "day") : undefined}
                slots={{ day: RangeDay }}
                slotProps={{
                  day: { rangeStart: draft.start, rangeEnd: draft.end, hoverDay, onHoverDay: setHoverDay },
                }}
                sx={CALENDAR_SX}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
              <Button size="small" onClick={close} sx={{ textTransform: "none", color: "text.secondary", fontWeight: 600 }}>
                {t("cancel")}
              </Button>
              <Button
                size="small"
                variant="contained"
                disableElevation
                disabled={!draft.start || !draft.end}
                onClick={() => choose(toCustom(draft.start, draft.end))}
                sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 2 }}
              >
                {t("apply")}
              </Button>
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

// The pages pass a stable onChange, so a refetch elsewhere does not re-render the filter.
export default memo(PeriodRangeFilter);
