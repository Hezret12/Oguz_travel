import { FormControl, MenuItem, Select, Stack, Typography, TextField } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { getAllStatusApi } from "../../../../api/queries/getters";
import { useLocale } from "../../../../hooks/useLocale";

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
      onOpen={() => onOpen?.(name)}
      onClose={() => onClose?.(name)}
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

// ─── Filter Date ──────────────────────────────────────────────────
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
        }
      }}
    />
  </FormControl>
);

/**
 * Self-contained filter panel for the B2B ticket page.
 */
const B2BFilter = ({
  filters,
  selectsOpen,
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => {
  const { t, selectedLang } = useLocale();

  // ── Fetch lookup status ───────────────────────────────────────────────
  const { data: statusList, isLoading: isStatusLoading } = useGet({
    apiFn: getAllStatusApi,
    key: "status",
  });

  const statusOptions = (statusList || []).map((s) => ({
    value: s.guid,
    label: selectedLang(s.name),
  }));

  const paymentTypeOptions = [
    { value: "credit", label: t("payment_types.credit", "Credit") },
    { value: "cash", label: t("payment_types.cash", "Cash") },
  ];

  const allText = t("all") ?? "All";

  return (
    <Stack spacing={2.5}>
      <FilterDate
        label={t("columns.issueDate", "Issue Date")}
        name="issueDate"
        value={filters.issueDate}
        onChange={onFilterChange}
      />

      <FilterDate
        label={t("columns.flightDate", "Flight Date")}
        name="flightDate"
        value={filters.flightDate}
        onChange={onFilterChange}
      />

      <FilterSelect
        label={t("columns.status", "Status")}
        name="status_guid"
        value={filters.status_guid}
        options={statusOptions}
        isOpen={selectsOpen?.status_guid ?? false}
        isLoading={isStatusLoading}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      <FilterSelect
        label={t("columns.paymentType", "Payment Type")}
        name="payment_types"
        value={filters.payment_types}
        options={paymentTypeOptions}
        isOpen={selectsOpen?.payment_types ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
    </Stack>
  );
};

export default B2BFilter;
