import { useMemo, memo } from "react";
import {
  Box,
  Chip,
  Divider,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { ChevronDown } from "lucide-react";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllTranslatorsApi } from "../../../api/queries/getters";
import GlobalEmployeeAutocomplete from "../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";

// Standalone blue accent for this filter only — the app's theme primary is teal.
const getAccent = (theme) =>
  theme.palette.mode === "dark"
    ? { main: "#3B82F6", dark: "#2563EB", contrastText: "#F8FAFC" }
    : { main: "#2563EB", dark: "#1D4ED8", contrastText: "#ffffff" };

const selectSx = (theme) => {
  const accent = getAccent(theme);
  return {
    borderRadius: "8px",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: accent.main },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: accent.main,
    },
  };
};

const menuPaperProps = {
  paper: {
    sx: {
      borderRadius: "12px",
      marginTop: "4px",
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "0 8px 24px rgba(0,0,0,0.5)"
          : "0 4px 20px rgba(0,0,0,0.08)",
    },
  },
};

const FilterSelect = ({
  label,
  name,
  value,
  options = [],
  isOpen,
  allText,
  onChange,
  onOpen,
  onClose,
}) => (
  <FormControl fullWidth size="small">
    <Typography
      variant="body2"
      sx={{ mb: 0.5, fontWeight: 600, color: "text.primary", fontSize: "12.5px" }}
    >
      {label}
    </Typography>
    <Select
      value={value ?? ""}
      onChange={(e) => onChange(name, e.target.value)}
      open={isOpen}
      onOpen={() => onOpen?.(name)}
      onClose={() => onClose?.(name)}
      displayEmpty
      sx={selectSx}
      MenuProps={{ slotProps: menuPaperProps }}
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
            transform: isOpen ? "rotate(180deg)" : "none",
            transition:
              "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease",
          }}
        >
          <ChevronDown size={18} />
        </Box>
      )}
    >
      <MenuItem value="">
        <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
          {allText}
        </Typography>
      </MenuItem>
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

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
      sx={{ mb: 0.5, fontWeight: 600, color: "text.primary", fontSize: "12.5px" }}
    >
      {label}
    </Typography>
    <DatePicker
      value={value ? dayjs(value) : null}
      onChange={(newValue) => {
        onChange(
          name,
          newValue && newValue.isValid() ? newValue.format("YYYY-MM-DD") : "",
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
          sx: (theme) => {
            const accent = getAccent(theme);
            return {
              "& .MuiInputBase-root": {
                fontSize: "0.8125rem",
                height: "36px",
                minHeight: "36px",
                borderRadius: "9px",
                backgroundColor: "background.paper",
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: accent.main,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: accent.main,
              },
              "& .MuiInputAdornment-root .MuiIconButton-root": {
                color: accent.main,
              },
            };
          },
        },
      }}
    />
  </FormControl>
);

const FilterTimePicker = ({ label, name, value, onChange }) => (
  <FormControl fullWidth size="small">
    <Typography
      variant="body2"
      sx={{ mb: 0.5, fontWeight: 600, color: "text.primary", fontSize: "12.5px" }}
    >
      {label}
    </Typography>
    <TimePicker
      value={value ? dayjs(value, "HH:mm") : null}
      onChange={(newValue) => {
        onChange(
          name,
          newValue && newValue.isValid() ? newValue.format("HH:mm") : "",
        );
      }}
      format="HH:mm"
      ampm={false}
      slotProps={{
        field: { clearable: true, onClear: () => onChange(name, "") },
        textField: {
          fullWidth: true,
          size: "small",
          sx: (theme) => {
            const accent = getAccent(theme);
            return {
              "& .MuiInputBase-root": {
                fontSize: "0.8125rem",
                height: "36px",
                minHeight: "36px",
                borderRadius: "9px",
                backgroundColor: "background.paper",
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: accent.main,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: accent.main,
              },
              "& .MuiInputAdornment-root .MuiIconButton-root": {
                color: accent.main,
              },
            };
          },
        },
      }}
    />
  </FormControl>
);

const useDayPresets = ({ filters, onFilterChange, startKey, endKey, t }) =>
  useMemo(() => {
    const sDate = filters?.[startKey];
    const eDate = filters?.[endKey];

    const thisMonthStart = dayjs().startOf("month").format("YYYY-MM-DD");
    const thisMonthEnd = dayjs().endOf("month").format("YYYY-MM-DD");

    const lastMonthStart = dayjs()
      .subtract(1, "month")
      .startOf("month")
      .format("YYYY-MM-DD");
    const lastMonthEnd = dayjs()
      .subtract(1, "month")
      .endOf("month")
      .format("YYYY-MM-DD");

    const thisYearStart = dayjs().startOf("year").format("YYYY-MM-DD");
    const thisYearEnd = dayjs().endOf("year").format("YYYY-MM-DD");

    const apply = (start, end) => {
      onFilterChange(startKey, start);
      onFilterChange(endKey, end);
    };

    return [
      {
        id: "thisMonth",
        label: t("outbound.thisMonth"),
        isActive: sDate === thisMonthStart && eDate === thisMonthEnd,
        onClick: () => apply(thisMonthStart, thisMonthEnd),
      },
      {
        id: "lastMonth",
        label: t("outbound.lastMonth"),
        isActive: sDate === lastMonthStart && eDate === lastMonthEnd,
        onClick: () => apply(lastMonthStart, lastMonthEnd),
      },
      {
        id: "thisYear",
        label: t("outbound.thisYear"),
        isActive: sDate === thisYearStart && eDate === thisYearEnd,
        onClick: () => apply(thisYearStart, thisYearEnd),
      },
      {
        id: "allTime",
        label: t("outbound.allTime"),
        isActive: !sDate && !eDate,
        onClick: () => apply("", ""),
      },
    ];
  }, [filters, onFilterChange, startKey, endKey, t]);

const PresetChips = ({ presets }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.25 }}>
    {presets.map((p) => (
      <Chip
        key={p.id}
        label={p.label}
        size="small"
        clickable
        onClick={p.onClick}
        variant="outlined"
        sx={(theme) => {
          const accent = getAccent(theme);
          return {
            borderRadius: "7px",
            fontSize: "11px",
            fontWeight: 600,
            height: "24px",
            transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
            color: p.isActive ? accent.contrastText : "text.secondary",
            borderColor: p.isActive ? accent.main : "divider",
            backgroundColor: p.isActive
              ? accent.main
              : alpha(theme.palette.text.primary, 0.02),
            "& .MuiChip-label": { px: "8px" },
            "&:hover": {
              borderColor: accent.main,
              backgroundColor: p.isActive
                ? accent.dark
                : alpha(accent.main, 0.08),
            },
          };
        }}
      />
    ))}
  </Box>
);

const DayGroup = ({
  icon,
  title,
  presets,
  startKey,
  endKey,
  timeKey,
  timeLabel,
  filters,
  onFilterChange,
  t,
}) => (
  <Box
    sx={{
      p: 1.25,
      borderRadius: "10px",
      border: "1px solid",
      borderColor: "divider",
      backgroundColor: (theme) =>
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.02)"
          : "rgba(0, 0, 0, 0.015)",
      display: "flex",
      flexDirection: "column",
      gap: 1,
    }}
  >
    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
      {icon}
      <Typography
        variant="subtitle2"
        sx={(theme) => ({
          fontWeight: 700,
          fontSize: "0.8rem",
          color: getAccent(theme).main,
        })}
      >
        {title}
      </Typography>
    </Stack>

    <PresetChips presets={presets} />

    <Stack spacing={1.25}>
      <FilterDatePicker
        label={t("columns.startDate")}
        name={startKey}
        value={filters?.[startKey]}
        maxDate={filters?.[endKey]}
        onChange={onFilterChange}
      />

      <FilterDatePicker
        label={t("columns.endDate")}
        name={endKey}
        value={filters?.[endKey]}
        minDate={filters?.[startKey]}
        onChange={onFilterChange}
      />
    </Stack>

    <FilterTimePicker
      label={timeLabel}
      name={timeKey}
      value={filters?.[timeKey]}
      onChange={onFilterChange}
    />
  </Box>
);

const TranslateFilter = ({
  filters,
  selectsOpen,
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => {
  const { t } = useLocale();

  const { data: translators = [] } = useGet({
    apiFn: getAllTranslatorsApi,
    key: "translators",
  });

  const translatorOptions = useMemo(
    () =>
      (translators || []).map((tr) => ({ value: tr.guid, label: tr.fullName })),
    [translators],
  );

  const allText = t("all") ?? "All";

  const receivedPresets = useDayPresets({
    filters,
    onFilterChange,
    startKey: "start_received_day",
    endKey: "end_received_day",
    t,
  });

  const completedPresets = useDayPresets({
    filters,
    onFilterChange,
    startKey: "start_completed_day",
    endKey: "end_completed_day",
    t,
  });

  return (
    <Stack spacing={2}>
      <GlobalEmployeeAutocomplete
        name="opr_guid"
        value={filters?.opr_guid ?? ""}
        onChange={(val) => onFilterChange("opr_guid", val)}
        label={t("columns.operator")}
        placeholder={allText}
        size="small"
      />

      <FilterSelect
        label={t("columns.translator")}
        name="translator_guid"
        value={filters?.translator_guid}
        options={translatorOptions}
        isOpen={selectsOpen?.translator_guid ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      <Divider sx={{ borderColor: "divider" }} />

      <DayGroup
        icon={
          <EventRoundedIcon
            sx={(theme) => ({ fontSize: 16, color: getAccent(theme).main })}
          />
        }
        title={t("columns.receivedDay")}
        presets={receivedPresets}
        startKey="start_received_day"
        endKey="end_received_day"
        timeKey="received_time"
        timeLabel={t("columns.receivedTime")}
        filters={filters}
        onFilterChange={onFilterChange}
        t={t}
      />

      <DayGroup
        icon={
          <EventAvailableRoundedIcon
            sx={(theme) => ({ fontSize: 16, color: getAccent(theme).main })}
          />
        }
        title={t("columns.completedDay")}
        presets={completedPresets}
        startKey="start_completed_day"
        endKey="end_completed_day"
        timeKey="completed_time"
        timeLabel={t("columns.completedTime")}
        filters={filters}
        onFilterChange={onFilterChange}
        t={t}
      />
    </Stack>
  );
};

export default memo(TranslateFilter);
