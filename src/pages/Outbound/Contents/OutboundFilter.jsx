import { useMemo } from "react";
import { FormControl, MenuItem, Select, Stack, Typography, TextField } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllEmployeeApi, getAllOfficeApi } from "../../../api/queries/getters";

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

const FilterDate = ({ label, name, value, onChange }) => (
  <FormControl fullWidth size="small">
    <Typography
      variant="body2"
      sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}
    >
      {label}
    </Typography>
    <TextField
      type="date"
      size="small"
      value={value ?? ""}
      onChange={(e) => onChange(name, e.target.value)}
      InputLabelProps={{ shrink: true }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
        },
      }}
    />
  </FormControl>
);

const OutboundFilter = ({
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

  const { data: offices = [] } = useGet({
    apiFn: getAllOfficeApi,
    key: "offices",
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

  const officeOptions = useMemo(
    () =>
      (offices || []).map((off) => ({
        value: off.guid,
        label: selectedLang(off.shortName) || selectedLang(off.fullName) || "",
      })),
    [offices, selectedLang]
  );

  const allText = t("all") ?? "All";

  return (
    <Stack spacing={2.5}>
      <FilterDate
        label={t("columns.startDate") || "Başlangyç sene"}
        name="start_date"
        value={filters.start_date}
        onChange={onFilterChange}
      />

      <FilterDate
        label={t("columns.endDate") || "Gutarýan sene"}
        name="end_date"
        value={filters.end_date}
        onChange={onFilterChange}
      />

      <FilterSelect
        label={t("outbound.office") || "Ofis"}
        name="office_guid"
        value={filters.office_guid}
        options={officeOptions}
        isOpen={selectsOpen?.office_guid ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      <FilterSelect
        label={t("outbound.operator") || "Operator"}
        name="operator_guid"
        value={filters.operator_guid}
        options={employeeOptions}
        isOpen={selectsOpen?.operator_guid ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
    </Stack>
  );
};

export default OutboundFilter;
