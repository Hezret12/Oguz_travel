import { FormControl, MenuItem, Select, Stack, Typography, TextField } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useLocale } from "../../../hooks/useLocale";

// ─── Styles ───────────────────────────────────────────────────────────────────
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

// ─── Generic Filter Select ────────────────────────────────────────────────────
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

// ─── Filter Date ──────────────────────────────────────────────────────────────
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

// ─── ReferralLetterFilter ─────────────────────────────────────────────────────
const ReferralLetterFilter = ({
  filters,
  selectsOpen,
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => {
  const { t } = useLocale();

  const currencyOptions = [
    { value: "TMT", label: "TMT (m)" },
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "RUB", label: "RUB (₽)" },
  ];

  const allText = t("all") ?? "All";

  return (
    <Stack spacing={2.5}>
      <FilterSelect
        label={t("columns.currency", "Currency")}
        name="currency"
        value={filters.currency}
        options={currencyOptions}
        isOpen={selectsOpen?.currency ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      <FilterDate
        label={t("columns.departureDate", "Departure Date")}
        name="departure_date"
        value={filters.departure_date}
        onChange={onFilterChange}
      />

      <FilterDate
        label={t("columns.returnDate", "Return Date")}
        name="returned_date"
        value={filters.returned_date}
        onChange={onFilterChange}
      />
    </Stack>
  );
};

export default ReferralLetterFilter;
