import { memo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import DateRangeRoundedIcon from "@mui/icons-material/DateRangeRounded";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";

const MONTHS = [
  { value: 0, tk: "Ýanwar", ru: "Январь", en: "January" },
  { value: 1, tk: "Fewral", ru: "Февраль", en: "February" },
  { value: 2, tk: "Mart", ru: "Март", en: "March" },
  { value: 3, tk: "Aprel", ru: "Апрель", en: "April" },
  { value: 4, tk: "Maý", ru: "Май", en: "May" },
  { value: 5, tk: "Iýun", ru: "Июнь", en: "June" },
  { value: 6, tk: "Iýul", ru: "Июль", en: "July" },
  { value: 7, tk: "Awgust", ru: "Август", en: "August" },
  { value: 8, tk: "Sentýabr", ru: "Сентябрь", en: "September" },
  { value: 9, tk: "Oktýabr", ru: "Октябрь", en: "October" },
  { value: 10, tk: "Noýabr", ru: "Ноябрь", en: "November" },
  { value: 11, tk: "Dekabr", ru: "Декабрь", en: "December" },
];

const YEARS = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

const QUARTER_OPTIONS = [
  { value: 1, key: "q1", defaultLabel: "Q1 · Ýan – Mar" },
  { value: 2, key: "q2", defaultLabel: "Q2 · Apr – Iýun" },
  { value: 3, key: "q3", defaultLabel: "Q3 · Iýul – Sen" },
  { value: 4, key: "q4", defaultLabel: "Q4 · Okt – Dek" },
];

const ReportHeader = ({
  selectedDate,
  onDateChange,
  selectedQuarter,
  onQuarterChange,
  teal,
  paperSx,
  selectSx,
}) => {
  const { t, currentLanguage } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const d = dayjs.isDayjs(selectedDate) ? selectedDate : dayjs(selectedDate);
  const currentMonthIdx = d.isValid() ? d.month() : dayjs().month();
  const currentYear = d.isValid() ? d.year() : dayjs().year();

  const handlePrevMonth = useCallback(() => {
    const prev = (d.isValid() ? d : dayjs()).subtract(1, "month");
    onDateChange(prev);
    if (onQuarterChange) {
      const q = Math.floor(prev.month() / 3) + 1;
      onQuarterChange(q);
    }
  }, [d, onDateChange, onQuarterChange]);

  const handleNextMonth = useCallback(() => {
    const next = (d.isValid() ? d : dayjs()).add(1, "month");
    onDateChange(next);
    if (onQuarterChange) {
      const q = Math.floor(next.month() / 3) + 1;
      onQuarterChange(q);
    }
  }, [d, onDateChange, onQuarterChange]);

  const handleMonthChange = useCallback(
    (monthVal) => {
      const newDate = (d.isValid() ? d : dayjs()).month(Number(monthVal));
      onDateChange(newDate);
      if (onQuarterChange) {
        const q = Math.floor(Number(monthVal) / 3) + 1;
        onQuarterChange(q);
      }
    },
    [d, onDateChange, onQuarterChange]
  );

  const handleYearChange = useCallback(
    (yearVal) => {
      const newDate = (d.isValid() ? d : dayjs()).year(Number(yearVal));
      onDateChange(newDate);
    },
    [d, onDateChange]
  );

  const getMonthLabel = (m) => {
    if (currentLanguage === "ru") return m.ru;
    if (currentLanguage === "en") return m.en;
    return m.tk;
  };

  const selectedMonthObj = MONTHS.find((m) => m.value === currentMonthIdx) || MONTHS[currentMonthIdx] || MONTHS[0];
  const monthDisplayStr = `${getMonthLabel(selectedMonthObj)} ${currentYear}`;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        pt: 1,
        pb: 0.5,
        width: "100%",
      }}
    >
      {/* Title & Active Period */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "20px", sm: "24px" },
            letterSpacing: "-0.3px",
            lineHeight: 1.3,
            color: "text.primary",
          }}
        >
          {t("sidebar.reportTurkishAirlines") || t("report.turkishAirlines.title") || "Türk howa ýollary"}
        </Typography>

        <Box
          sx={{
            display: { xs: "none", sm: "inline-flex" },
            alignItems: "center",
            gap: 0.8,
            px: 1.5,
            py: 0.5,
            borderRadius: "20px",
            backgroundColor: alpha(teal, 0.1),
            border: `1px solid ${alpha(teal, 0.25)}`,
            color: teal,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />
          {monthDisplayStr}
        </Box>
      </Box>

      {/* Date & Quarter Controls */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        {/* Month & Year Box: < Prev | Month | Year | Next > */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
            borderRadius: "10px",
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
            p: "3px 6px",
          }}
        >
          {/* Prev Month Button */}
          <Tooltip title={t("prev") || "Öňki aý"}>
            <IconButton
              size="small"
              onClick={handlePrevMonth}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                color: "text.secondary",
                "&:hover": { color: teal, backgroundColor: alpha(teal, 0.1) },
              }}
            >
              <ChevronLeftRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Month Select */}
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={currentMonthIdx}
              onChange={(e) => handleMonthChange(e.target.value)}
              displayEmpty
              renderValue={(val) => {
                const m = MONTHS.find((item) => item.value === val) || MONTHS[val] || MONTHS[0];
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <CalendarMonthRoundedIcon sx={{ fontSize: 16, color: teal }} />
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "text.primary" }}>
                      {getMonthLabel(m)}
                    </Typography>
                  </Box>
                );
              }}
              sx={{
                height: 34,
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "& .MuiSelect-select": { py: 0.5, px: 1 },
              }}
            >
              {MONTHS.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                    {String(m.value + 1).padStart(2, "0")} · {getMonthLabel(m)}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Year Select */}
          <FormControl size="small" sx={{ minWidth: 85 }}>
            <Select
              value={currentYear}
              onChange={(e) => handleYearChange(e.target.value)}
              displayEmpty
              renderValue={(val) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <DateRangeRoundedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "text.primary" }}>
                    {val}
                  </Typography>
                </Box>
              )}
              sx={{
                height: 34,
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "& .MuiSelect-select": { py: 0.5, px: 0.8 },
              }}
            >
              {YEARS.map((y) => (
                <MenuItem key={y} value={y}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                    {y}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Next Month Button */}
          <Tooltip title={t("next") || "Indiki aý"}>
            <IconButton
              size="small"
              onClick={handleNextMonth}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                color: "text.secondary",
                "&:hover": { color: teal, backgroundColor: alpha(teal, 0.1) },
              }}
            >
              <ChevronRightRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Quarter Select Dropdown */}
        <FormControl size="small" sx={{ minWidth: 165 }}>
          <Select
            value={selectedQuarter ?? 1}
            onChange={(e) => onQuarterChange?.(Number(e.target.value))}
            displayEmpty
            renderValue={(val) => {
              const opt = QUARTER_OPTIONS.find((o) => o.value === val);
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmojiEventsRoundedIcon sx={{ fontSize: 18, color: teal }} />
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "text.primary" }}>
                    {t(`report.turkishAirlines.${opt?.key}`) || opt?.defaultLabel || `Q${val}`}
                  </Typography>
                </Box>
              );
            }}
            sx={{
              height: 42,
              borderRadius: "10px",
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiSelect-select": {
                py: 1,
                px: 1.5,
                display: "flex",
                alignItems: "center",
              },
            }}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: "12px",
                  mt: 0.5,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                },
              },
            }}
          >
            {QUARTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 0.3 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      backgroundColor: alpha(teal, 0.12),
                      color: teal,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Q{opt.value}
                  </Box>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                    {t(`report.turkishAirlines.${opt.key}`) || opt.defaultLabel}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default memo(ReportHeader);
