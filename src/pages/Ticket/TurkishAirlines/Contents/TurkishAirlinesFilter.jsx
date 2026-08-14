import { useMemo } from "react";
import { FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import { useGet } from "../../../../hooks/CRUD/useGet";
import {
  getAllEmployeeApi,
  getAllStatusApi,
  getAllOfficeApi,
} from "../../../../api/queries/getters";

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
          },
        },
      }}
    />
  </FormControl>
);

export const TurkishAirlinesFilter = ({
  filters,
  selectsOpen = {},
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => {
  const { t, selectedLang } = useLocale();

  // Fetch Employees for operators
  const { data: employees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  // Fetch Statuses
  const { data: statuses = [] } = useGet({
    apiFn: getAllStatusApi,
    key: "statuses",
  });

  // Fetch Offices
  const { data: offices = [] } = useGet({
    apiFn: getAllOfficeApi,
    key: "offices",
  });

  const employeeOptions = useMemo(
    () =>
      (employees || []).map((emp) => ({
        label: emp.fullName,
        value: emp.guid,
      })),
    [employees]
  );

  const statusOptions = useMemo(
    () =>
      (statuses || []).map((st) => ({
        label: selectedLang(st.name) || st.name || "",
        value: st.guid,
      })),
    [statuses, selectedLang]
  );

  const officeOptions = useMemo(
    () =>
      (offices || []).map((off) => ({
        label:
          selectedLang(off.shortName) ||
          selectedLang(off.fullName) ||
          off.shortName ||
          off.fullName ||
          "",
        value: off.guid,
      })),
    [offices, selectedLang]
  );

  const isPaidOptions = useMemo(
    () => [
      { label: t("paymentPaid"), value: "true" },
      { label: t("paymentCredit"), value: "false" },
    ],
    [t]
  );

  const handleDateChange = (name, val) => {
    onFilterChange(name, val);
  };

  return (
    <Stack spacing={2.5}>
      {/* Date Time */}
      <FilterDatePicker
        label={t("columns.dateTime")}
        name="datetime"
        value={filters?.datetime}
        onChange={handleDateChange}
      />

      {/* Operator 1 (Assignment) */}
      <FilterSelect
        label={t("columns.operator")}
        name="assignment_opr_guid"
        value={filters?.assignment_opr_guid}
        options={employeeOptions}
        isOpen={Boolean(selectsOpen.assignment_opr_guid)}
        allText={t("all")}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      {/* Operator 2 (Receiver) */}
      <FilterSelect
        label={t("columns.operatorTwo")}
        name="receiver_opr_guid"
        value={filters?.receiver_opr_guid}
        options={employeeOptions}
        isOpen={Boolean(selectsOpen.receiver_opr_guid)}
        allText={t("all")}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      {/* Status */}
      <FilterSelect
        label={t("columns.status")}
        name="status_guid"
        value={filters?.status_guid}
        options={statusOptions}
        isOpen={Boolean(selectsOpen.status_guid)}
        allText={t("all")}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      {/* Flight Date */}
      <FilterDatePicker
        label={t("columns.flightDate")}
        name="flight_date"
        value={filters?.flight_date}
        onChange={handleDateChange}
      />

      {/* Payment Status (is_paid) */}
      <FilterSelect
        label={t("columns.paymentStatus")}
        name="is_paid"
        value={filters?.is_paid}
        options={isPaidOptions}
        isOpen={Boolean(selectsOpen.is_paid)}
        allText={t("all")}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      {/* Office */}
      <FilterSelect
        label={t("kassa")}
        name="office_guid"
        value={filters?.office_guid}
        options={officeOptions}
        isOpen={Boolean(selectsOpen.office_guid)}
        allText={t("all")}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
    </Stack>
  );
};

export default TurkishAirlinesFilter;
