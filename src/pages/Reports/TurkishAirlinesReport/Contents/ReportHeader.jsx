import { memo, useCallback } from "react";
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
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import ExportExcelButton from "../../../../components/ExportExcelButton";
import { QUARTERS, getQuarterOfDate, normalizeQuarter } from "../functions/quarter";

// Module-level so MUI doesn't remount it every render; MUI adds `MuiSelect-iconOpen` while the menu is open.
const SelectChevron = ({ className }) => (
  <Box
    component="span"
    className={className}
    sx={{
      display: "inline-flex",
      position: "absolute",
      right: 12,
      top: "calc(50% - 9px)",
      color: "text.secondary",
      pointerEvents: "none",
      transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      "&.MuiSelect-iconOpen": { transform: "rotate(180deg)" },
    }}
  >
    <ChevronDown size={18} />
  </Box>
);

const QuarterBadge = ({ value, active, teal }) => (
  <Box
    sx={{
      width: 32,
      height: 30,
      flexShrink: 0,
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 800,
      color: active ? "#FFFFFF" : teal,
      backgroundColor: active ? teal : alpha(teal, 0.12),
    }}
  >
    Q{value}
  </Box>
);

const ReportHeader = ({
  selectedDate,
  onDateChange,
  selectedQuarter,
  onQuarterChange,
  onExportExcel,
  teal = "#0D9488",
}) => {
  const { t } = useLocale();

  const d = dayjs.isDayjs(selectedDate) ? selectedDate : dayjs(selectedDate);
  const validDate = d.isValid() ? d : dayjs();

  const quarter = normalizeQuarter(selectedQuarter);

  // Month navigation keeps the quarter card in sync with the selected month.
  const changeMonth = useCallback(
    (date) => {
      onDateChange(date);
      onQuarterChange?.(getQuarterOfDate(date));
    },
    [onDateChange, onQuarterChange]
  );

  const handlePrevMonth = useCallback(
    () => changeMonth(validDate.subtract(1, "month")),
    [changeMonth, validDate]
  );

  const handleNextMonth = useCallback(
    () => changeMonth(validDate.add(1, "month")),
    [changeMonth, validDate]
  );

  const handleDateSelect = useCallback(
    (newDate) => {
      if (newDate && dayjs.isDayjs(newDate) && newDate.isValid()) changeMonth(newDate);
    },
    [changeMonth]
  );

  const handleQuarterSelect = useCallback(
    (e) => onQuarterChange?.(normalizeQuarter(e.target.value)),
    [onQuarterChange]
  );

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
        <FormControl size="small" sx={{ minWidth: 190 }}>
          <Select
            value={quarter}
            onChange={handleQuarterSelect}
            inputProps={{ "aria-label": t("report.turkishAirlines.selectQuarter") }}
            renderValue={(val) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                <QuarterBadge value={val} active teal={teal} />
                <Box sx={{ minWidth: 0, lineHeight: 1.15 }}>
                  <Typography noWrap sx={{ fontSize: 13, fontWeight: 700, color: "text.primary", lineHeight: 1.25 }}>
                    {t(`report.turkishAirlines.quarterMonths.q${val}`)}
                  </Typography>
                </Box>
              </Box>
            )}
            IconComponent={SelectChevron}
            sx={{
              height: 42,
              borderRadius: "10px",
              backgroundColor: "background.paper",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 2px 8px rgba(0,0,0,0.3)"
                  : "0 1px 4px rgba(0,0,0,0.06)",
              transition: "border-color 0.15s ease",
              "&:hover": { borderColor: alpha(teal, 0.5) },
              "&.Mui-focused": { borderColor: teal },
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiSelect-select": {
                py: 0.5,
                pl: 0.75,
                pr: "36px !important",
                display: "flex",
                alignItems: "center",
              },
            }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "right" },
              transformOrigin: { vertical: "top", horizontal: "right" },
              slotProps: {
                paper: {
                  sx: {
                    mt: 0.75,
                    minWidth: 240,
                    borderRadius: "12px",
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                  },
                },
                list: { sx: { p: 0.75 } },
              },
            }}
          >
            {QUARTERS.map((q) => {
              const isSelected = q === quarter;
              return (
                <MenuItem
                  key={q}
                  value={q}
                  sx={{
                    borderRadius: "8px",
                    py: 0.9,
                    px: 1,
                    mb: 0.25,
                    "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: alpha(teal, 0.1) },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, width: "100%" }}>
                    <QuarterBadge value={q} active={isSelected} teal={teal} />
                    <Typography sx={{ fontSize: 13.5, fontWeight: isSelected ? 700 : 600, flex: 1 }}>
                      {t(`report.turkishAirlines.quarterMonths.q${q}`)}
                    </Typography>
                    <CheckRoundedIcon sx={{ fontSize: 18, color: teal, visibility: isSelected ? "visible" : "hidden" }} />
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {onExportExcel && (
          <ExportExcelButton onClick={onExportExcel} />
        )}
      </Box>
    </Box>
  );
};

export default memo(ReportHeader);
