import { useMemo } from "react";
import { FormControl, MenuItem, Select, Stack, Typography, TextField } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllPackageByIndexApi } from "../../../api/queries/getters";

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

const VisaFilter = ({
  filters,
  selectsOpen,
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => {
  const { t } = useLocale();

  const { data: mainPackages = [] } = useGet({
    apiFn: getAllPackageByIndexApi,
    key: "visa-packages-byindex",
    params: { index: 4 },
  });

  const { data: servicePackages = [] } = useGet({
    apiFn: getAllPackageByIndexApi,
    key: "visa-packages-byindex",
    params: { index: 5 },
  });

  const packageOptions = useMemo(
    () => (mainPackages || []).map((p) => ({ value: p.guid, label: p.name })),
    [mainPackages]
  );

  const serviceOptions = useMemo(
    () => (servicePackages || []).map((p) => ({ value: p.guid, label: p.name })),
    [servicePackages]
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
        label={t("sidebar.visa.packages") || "Bukja"}
        name="package_guid"
        value={filters.package_guid}
        options={packageOptions}
        isOpen={selectsOpen?.package_guid ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      <FilterSelect
        label={t("columns.service") || "Hyzmat"}
        name="service_guid"
        value={filters.service_guid}
        options={serviceOptions}
        isOpen={selectsOpen?.service_guid ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
    </Stack>
  );
};

export default VisaFilter;
