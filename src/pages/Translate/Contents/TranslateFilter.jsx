import { useMemo } from "react";
import { FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllTranslatorsApi, getAllEmployeeApi } from "../../../api/queries/getters";

const selectSx = {
  borderRadius: "10px",
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
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
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
      IconComponent={isOpen ? KeyboardArrowUpIcon : KeyboardArrowDownIcon}
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

const FilterTimePicker = ({ label, name, value, onChange }) => (
  <FormControl fullWidth size="small">
    <Typography
      variant="body2"
      sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}
    >
      {label}
    </Typography>
    <TimePicker
      value={value ? dayjs(value, "HH:mm") : null}
      onChange={(newValue) => {
        onChange(
          name,
          newValue && newValue.isValid()
            ? newValue.format("HH:mm")
            : ""
        );
      }}
      format="HH:mm"
      ampm={false}
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

const TranslateFilter = ({
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

  const { data: translators = [] } = useGet({
    apiFn: getAllTranslatorsApi,
    key: "translators",
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
    [employees, selectedLang]
  );

  const translatorOptions = useMemo(
    () => (translators || []).map((tr) => ({ value: tr.guid, label: tr.fullName })),
    [translators]
  );

  const allText = t("all") ?? "All";

  return (
    <Stack spacing={2.5}>
      <FilterDatePicker
        label={t("columns.receivedDay") || "Alnan güni"}
        name="received_day"
        value={filters.received_day}
        onChange={onFilterChange}
      />

      <FilterTimePicker
        label={t("columns.receivedTime") || "Alnan wagty"}
        name="received_time"
        value={filters.received_time}
        onChange={onFilterChange}
      />

      <FilterSelect
        label={t("columns.operator") || "Operator"}
        name="opr_guid"
        value={filters.opr_guid}
        options={employeeOptions}
        isOpen={selectsOpen?.opr_guid ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      <FilterTimePicker
        label={t("columns.completedTime") || "Tabşyrylan wagty"}
        name="completed_time"
        value={filters.completed_time}
        onChange={onFilterChange}
      />

      <FilterDatePicker
        label={t("columns.completedDay") || "Tabşyrylan güni"}
        name="completed_day"
        value={filters.completed_day}
        onChange={onFilterChange}
      />

      <FilterSelect
        label={t("columns.translator") || "Terjimeçi"}
        name="translator_guid"
        value={filters.translator_guid}
        options={translatorOptions}
        isOpen={selectsOpen?.translator_guid ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
    </Stack>
  );
};

export default TranslateFilter;
