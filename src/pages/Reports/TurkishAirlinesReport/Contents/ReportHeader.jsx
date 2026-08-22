import { memo, useCallback, useMemo, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  alpha,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PieChartRoundedIcon from "@mui/icons-material/PieChartRounded";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";

const QUARTERS = [
  { value: 1, key: "report.turkishAirlines.q1" },
  { value: 2, key: "report.turkishAirlines.q2" },
  { value: 3, key: "report.turkishAirlines.q3" },
  { value: 4, key: "report.turkishAirlines.q4" },
];

const ReportHeader = ({
  selectedDate,
  onDateChange,
  selectedQuarter,
  onQuarterChange,
  teal = "#0D9488",
}) => {
  const { t } = useLocale();

  const d = dayjs.isDayjs(selectedDate) ? selectedDate : dayjs(selectedDate);
  const validDate = d.isValid() ? d : dayjs();

  const handlePrevMonth = useCallback(() => {
    const prev = validDate.subtract(1, "month");
    onDateChange(prev);
    if (onQuarterChange) {
      const q = Math.floor(prev.month() / 3) + 1;
      onQuarterChange(q);
    }
  }, [validDate, onDateChange, onQuarterChange]);

  const handleNextMonth = useCallback(() => {
    const next = validDate.add(1, "month");
    onDateChange(next);
    if (onQuarterChange) {
      const q = Math.floor(next.month() / 3) + 1;
      onQuarterChange(q);
    }
  }, [validDate, onDateChange, onQuarterChange]);

  const handleDateSelect = useCallback(
    (newDate) => {
      if (newDate && dayjs.isDayjs(newDate) && newDate.isValid()) {
        onDateChange(newDate);
        if (onQuarterChange) {
          const q = Math.floor(newDate.month() / 3) + 1;
          onQuarterChange(q);
        }
      }
    },
    [onDateChange, onQuarterChange]
  );

  const quarterOptions = useMemo(
    () =>
      QUARTERS.map((q) => ({
        value: q.value,
        label: t(q.key),
      })),
    [t]
  );

  const monthDisplayStr = validDate.format("MMMM YYYY");

  const [isQuarterOpen, setIsQuarterOpen] = useState(false);

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
          {t("sidebar.reportTurkishAirlines")}
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
            textTransform: "capitalize",
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
        {/* Day.js Month & Year DatePicker: < Prev | Month Year Picker | Next > */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            backgroundColor: "background.paper",
            borderRadius: "10px",
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 2px 8px rgba(0,0,0,0.3)"
                : "0 1px 4px rgba(0,0,0,0.06)",
            p: "3px 6px",
            height: 42,
          }}
        >
          {/* Prev Month Button */}
          <Tooltip title={t("prev")}>
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

          {/* Month & Year Day.js DatePicker */}
          <DatePicker
            views={["year", "month"]}
            openTo="month"
            value={validDate}
            onChange={handleDateSelect}
            format="MMMM YYYY"
            slotProps={{
              textField: {
                size: "small",
                variant: "standard",
                slotProps: {
                  input: {
                    disableUnderline: true,
                  },
                },
                sx: {
                  width: { xs: 130, sm: 160 },
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "13px", sm: "14px" },
                    fontWeight: 700,
                    cursor: "pointer",
                    color: "text.primary",
                  },
                  "& .MuiInputBase-input": {
                    textAlign: "center",
                    cursor: "pointer",
                    py: 0.5,
                    px: { xs: 0.5, sm: 1 },
                    textTransform: "capitalize",
                  },
                  "& .MuiIconButton-root": {
                    p: 0.5,
                    color: teal,
                  },
                  "& .MuiInput-underline:before, & .MuiInput-underline:after": {
                    display: "none",
                  },
                },
              },
            }}
          />

          {/* Next Month Button */}
          <Tooltip title={t("next")}>
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
            open={isQuarterOpen}
            onOpen={() => setIsQuarterOpen(true)}
            onClose={() => setIsQuarterOpen(false)}
            displayEmpty
            renderValue={(val) => {
              const opt = quarterOptions.find((o) => o.value === val);
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PieChartRoundedIcon sx={{ fontSize: 18, color: teal }} />
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "text.primary" }}>
                    {opt?.label ?? `Q${val}`}
                  </Typography>
                </Box>
              );
            }}
            IconComponent={() => (
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
                  transform: isQuarterOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease",
                }}
              >
                <ChevronDown size={18} />
              </Box>
            )}
            sx={{
              height: 42,
              borderRadius: "10px",
              backgroundColor: "background.paper",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 2px 8px rgba(0,0,0,0.3)"
                  : "0 1px 4px rgba(0,0,0,0.06)",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiSelect-select": {
                py: 1,
                pl: 1.5,
                pr: 4,
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
            {quarterOptions.map((opt) => (
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
                    {opt.value}
                  </Box>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                    {opt.label}
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
