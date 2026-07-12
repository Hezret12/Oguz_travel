import { FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useGet } from "../../../hooks/CRUD/useGet";
import {
  getAllDepartmentApi,
  getAllOfficeApi,
  getAllPositionApi,
} from "../../../api/queries/getters";
import { useLocale } from "../../../hooks/useLocale";

// ─── Styles ────────────────────────────────────────────────────────────────
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

// ─── Generic Filter Select ──────────────────────────────────────────────────
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
      onOpen={() => onOpen(name)}
      onClose={() => onClose(name)}
      IconComponent={isOpen ? KeyboardArrowUpIcon : KeyboardArrowDownIcon}
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

// ─── EmployeeFilter ─────────────────────────────────────────────────────────
/**
 * Self-contained filter panel for the Employee page.
 *
 * Props:
 *  - filters       → draft filter state from usePageFilters (keys: department_guid, position_guid, office_guid)
 *  - selectsOpen   → open-state map keyed by filter field name
 *  - onFilterChange(key, value) → dispatch setDraftFilter
 *  - onSelectOpen(name)
 *  - onSelectClose(name)
 */
const EmployeeFilter = ({
  filters,
  selectsOpen,
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => {
  const { t, selectedLang } = useLocale();

  const { data: departments, isLoading: isDeptLoading } = useGet({
    apiFn: getAllDepartmentApi,
    key: "department",
  });

  const { data: positions, isLoading: isPosLoading } = useGet({
    apiFn: getAllPositionApi,
    key: "position",
  });

  const { data: offices, isLoading: isOffLoading } = useGet({
    apiFn: getAllOfficeApi,
    key: "office",
  });

  const deptOptions = departments.map((d) => ({
    value: d.guid,
    label: selectedLang(d.name),
  }));

  const posOptions = positions.map((p) => ({
    value: p.guid,
    label: selectedLang(p.name),
  }));

  const offOptions = offices.map((o) => ({
    value: o.guid,
    label: selectedLang(o.fullName),
  }));

  const allText = t("all") ?? "All";

  return (
    <Stack spacing={2.5}>
      <FilterSelect
        label={t("columns.department")}
        name="department_guid"
        value={filters.department_guid}
        options={deptOptions}
        isOpen={selectsOpen?.department_guid ?? false}
        isLoading={isDeptLoading}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      <FilterSelect
        label={t("columns.position")}
        name="position_guid"
        value={filters.position_guid}
        options={posOptions}
        isOpen={selectsOpen?.position_guid ?? false}
        isLoading={isPosLoading}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      <FilterSelect
        label={t("columns.office")}
        name="office_guid"
        value={filters.office_guid}
        options={offOptions}
        isOpen={selectsOpen?.office_guid ?? false}
        isLoading={isOffLoading}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
    </Stack>
  );
};

export default EmployeeFilter;
