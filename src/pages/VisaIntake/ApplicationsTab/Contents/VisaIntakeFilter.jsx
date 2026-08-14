import { useMemo } from "react";
import { FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { getAllEmployeeApi } from "../../../../api/queries/getters";
import { VISA_SELECT_OPTIONS } from "../../../../functions/visaCountryFieldConfigs";

const selectSx = {
  borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.main",
  },
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
      sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}
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
      slotProps={menuPaperProps}
    >
      <MenuItem value="">
        <em>{allText}</em>
      </MenuItem>
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
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

const VisaIntakeFilter = ({
  filters,
  selectsOpen,
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => {
  const { t, selectedLang } = useLocale();

  const { data: employees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const employeeOptions = useMemo(
    () =>
      (employees || []).map((emp) => {
        const officeShort = emp.office?.shortName
          ? selectedLang(emp.office.shortName) ||
            selectedLang(emp.office.fullName) ||
            ""
          : "";
        const label = officeShort
          ? `${emp.fullName} (${officeShort})`
          : emp.fullName;
        return { label, value: emp.guid };
      }),
    [employees, selectedLang],
  );

  const allText = t("all");

  return (
    <Stack spacing={2.5}>
      <FilterDatePicker
        label={t("visaIntake.fields.applicationDate")}
        name="start_date"
        value={filters.start_date}
        onChange={onFilterChange}
      />

      <FilterDatePicker
        label={t("visaIntake.fields.applicationDate")}
        name="end_date"
        value={filters.end_date}
        onChange={onFilterChange}
      />

      <FilterSelect
        label={t("columns.operator")}
        name="operator_guid"
        value={filters.operator_guid}
        options={employeeOptions}
        isOpen={selectsOpen?.operator_guid ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      <FilterSelect
        label={t("visaIntake.fields.visaCategory")}
        name="visa_category"
        value={filters.visa_category}
        options={VISA_SELECT_OPTIONS.visaCategories}
        isOpen={selectsOpen?.visa_category ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
    </Stack>
  );
};

export default VisaIntakeFilter;
