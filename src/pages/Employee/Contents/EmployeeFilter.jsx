import { FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const selectSx = {
  borderRadius: "10px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "divider",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.main",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.main",
  },
};

const selectSlotProps = {
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
  options,
  isOpen,
  allText,
  onChange,
  onOpen,
  onClose,
}) => (
  <FormControl fullWidth size="small">
    <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}>
      {label}
    </Typography>
    <Select
      value={value}
      onChange={(event) => onChange(name, event.target.value)}
      open={isOpen}
      onOpen={() => onOpen(name)}
      onClose={() => onClose(name)}
      IconComponent={isOpen ? KeyboardArrowUpIcon : KeyboardArrowDownIcon}
      displayEmpty
      sx={selectSx}
      slotProps={selectSlotProps}
    >
      <MenuItem value="">
        <em>{allText}</em>
      </MenuItem>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const EmployeeFilter = ({
  filters,
  selectsOpen,
  departmentOptions,
  positionOptions,
  officeOptions,
  allText,
  labels,
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => (
  <Stack spacing={2.5}>
    <FilterSelect
      label={labels.department}
      name="department"
      value={filters.department}
      options={departmentOptions}
      isOpen={selectsOpen.department}
      allText={allText}
      onChange={onFilterChange}
      onOpen={onSelectOpen}
      onClose={onSelectClose}
    />

    <FilterSelect
      label={labels.position}
      name="position"
      value={filters.position}
      options={positionOptions}
      isOpen={selectsOpen.position}
      allText={allText}
      onChange={onFilterChange}
      onOpen={onSelectOpen}
      onClose={onSelectClose}
    />

    <FilterSelect
      label={labels.office}
      name="office"
      value={filters.office}
      options={officeOptions}
      isOpen={selectsOpen.office}
      allText={allText}
      onChange={onFilterChange}
      onOpen={onSelectOpen}
      onClose={onSelectClose}
    />
  </Stack>
);

export default EmployeeFilter;
