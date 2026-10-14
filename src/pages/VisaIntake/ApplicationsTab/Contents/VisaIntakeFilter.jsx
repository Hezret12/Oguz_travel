import { memo, useMemo } from "react";
import { Box, FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import GlobalEmployeeAutocomplete from "../../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import { VISA_STATUS, VISA_STATUS_CONFIG } from "../../../../functions/statusChipConfigs";

const selectSx = {
  borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
};

const menuPaperProps = {
  paper: {
    sx: {
      borderRadius: "12px",
      marginTop: "4px",
      maxHeight: 300,
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "0 8px 24px rgba(0,0,0,0.5)"
          : "0 4px 20px rgba(0,0,0,0.08)",
    },
  },
};

const StatusOption = ({ color, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
    <Typography sx={{ fontSize: "0.875rem" }}>{label}</Typography>
  </Box>
);

const StatusFilter = ({ label, value, options, allText, onChange }) => (
  <FormControl fullWidth size="small">
    <Typography
      variant="body2"
      sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}
    >
      {label}
    </Typography>
    <Select
      value={value ?? ""}
      onChange={(e) => onChange("status", e.target.value)}
      displayEmpty
      sx={selectSx}
      MenuProps={{ slotProps: menuPaperProps }}
      IconComponent={(props) => <ChevronDown size={18} {...props} />}
      renderValue={(selected) => {
        const opt = options.find((o) => o.value === selected);
        return opt ? (
          <StatusOption color={opt.color} label={opt.label} />
        ) : (
          <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>{allText}</Typography>
        );
      }}
    >
      <MenuItem value="">
        <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>{allText}</Typography>
      </MenuItem>
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          <StatusOption color={opt.color} label={opt.label} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const FilterDatePicker = ({ label, name, value, onChange }) => (
  <FormControl fullWidth size="small">
    <Typography
      variant="body2"
      sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}
    >
      {label}
    </Typography>
    <DatePicker
      value={value ? dayjs(value) : null}
      onChange={(newValue) => {
        onChange(
          name,
          newValue && newValue.isValid()
            ? newValue.format("YYYY-MM-DD")
            : ""
        );
      }}
      format="DD.MM.YYYY"
      views={["year", "month", "day"]}
      slotProps={{
        textField: {
          fullWidth: true,
          size: "small",
          sx: {
            "& .MuiInputBase-root": {
              fontSize: "0.9rem",
              height: "44px",
              minHeight: "44px",
              borderRadius: "10px",
            },
            "& .MuiInputAdornment-root .MuiIconButton-root": {
              color: "#1565C0",
            },
          },
        },
      }}
    />
  </FormControl>
);

const VisaIntakeFilter = ({ filters, onFilterChange }) => {
  const { t } = useLocale();

  // Same labels as the intake form's status select; colours from the table's status chip.
  const statusOptions = useMemo(
    () => [
      { value: VISA_STATUS.PROCESS, label: t("visa.statusProcess") },
      { value: VISA_STATUS.DONE, label: t("visa.statusDone") },
      { value: VISA_STATUS.FAIL, label: t("visa.statusFail") },
    ].map((o) => ({ ...o, color: VISA_STATUS_CONFIG[o.value].color })),
    [t],
  );

  return (
    <Stack spacing={2.5}>
      <FilterDatePicker
        label={`${t("visaIntake.fields.applicationDate")} · ${t("columns.startDate")}`}
        name="start_date"
        value={filters.start_date}
        onChange={onFilterChange}
      />

      <FilterDatePicker
        label={`${t("visaIntake.fields.applicationDate")} · ${t("columns.endDate")}`}
        name="end_date"
        value={filters.end_date}
        onChange={onFilterChange}
      />

      {/* Loads operators 40 at a time (more on scroll) and searches them on the server. */}
      <GlobalEmployeeAutocomplete
        name="operator_guid"
        value={filters.operator_guid ?? ""}
        onChange={(val) => onFilterChange("operator_guid", val)}
        label={t("columns.operator")}
        placeholder={t("all")}
        size="small"
      />

      <StatusFilter
        label={t("columns.visaStatus")}
        value={filters.status}
        options={statusOptions}
        allText={t("all")}
        onChange={onFilterChange}
      />
    </Stack>
  );
};

export default memo(VisaIntakeFilter);
