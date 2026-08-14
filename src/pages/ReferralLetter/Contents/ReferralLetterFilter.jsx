import { useMemo } from "react";
import { FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllEmployeeApi } from "../../../api/queries/getters";

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
  isLoading,
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
      disabled={isLoading}
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
          },
        },
      }}
    />
  </FormControl>
);

const ReferralLetterFilter = ({
  filters,
  selectsOpen = {},
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => {
  const { t } = useLocale();

  // Fetch employees for operator select
  const { data: employees = [], isLoading: isEmployeeLoading } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const employeeOptions = useMemo(
    () =>
      (employees || []).map((emp) => ({
        label: emp.fullName,
        value: emp.guid,
      })),
    [employees]
  );

  const allText = t("all");

  const handleDateChange = (name, val) => {
    onFilterChange(name, val);
  };

  return (
    <Stack spacing={2.5}>
      {/* Operator (received_opr_guid) */}
      <FilterSelect
        label={t("columns.operator")}
        name="received_opr_guid"
        value={filters?.received_opr_guid}
        options={employeeOptions}
        isOpen={Boolean(selectsOpen?.received_opr_guid)}
        isLoading={isEmployeeLoading}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      {/* Departure Date */}
      <FilterDatePicker
        label={t("columns.departureDate")}
        name="departure_date"
        value={filters?.departure_date}
        onChange={handleDateChange}
      />

      {/* Return Date */}
      <FilterDatePicker
        label={t("columns.returnDate")}
        name="return_date"
        value={filters?.return_date}
        onChange={handleDateChange}
      />

      {/* Contract Date */}
      <FilterDatePicker
        label={t("columns.contractDate")}
        name="contract_date"
        value={filters?.contract_date}
        onChange={handleDateChange}
      />
    </Stack>
  );
};

export default ReferralLetterFilter;
