import { useMemo } from "react";
import { FormControl, MenuItem, Select, Stack, Typography, TextField } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllTranslatorsApi, getAllStatusApi } from "../../../api/queries/getters";

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

const TranslateFilter = ({
  filters,
  selectsOpen,
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => {
  const { t, selectedLang } = useLocale();

  const { data: translators = [] } = useGet({
    apiFn: getAllTranslatorsApi,
    key: "translators",
  });

  const translatorOptions = useMemo(
    () => (translators || []).map((tr) => ({ value: tr.guid, label: tr.fullName })),
    [translators]
  );

  const statusOptions = useMemo(
    () => [
      { value: false, label: t("statusNormal") || "Adaty" },
      { value: true, label: t("statusUrgent") || "Gyssagly" },
    ],
    [t]
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

      <FilterSelect
        label={t("columns.status") || "Status"}
        name="status_guid"
        value={filters.status_guid}
        options={statusOptions}
        isOpen={selectsOpen?.status_guid ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
    </Stack>
  );
};

export default TranslateFilter;
