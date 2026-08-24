import { useMemo } from "react";
import { Box, FormControl, MenuItem, Select, Stack, Typography, TextField } from "@mui/material";
import { ChevronDown } from "lucide-react";
import { useLocale } from "../../../hooks/useLocale";
import { getBooleanPaymentFilterOptions } from "../../../functions/generalHelpers";

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
      MenuProps={{ slotProps: menuPaperProps }}
      IconComponent={() => (
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            right: 12,
            top: "calc(50% - 9px)",
            color: "text.secondary",
            pointerEvents: "none",
            transform: isOpen ? "rotate(180deg)" : "none",
            transition:
              "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease",
          }}
        >
          <ChevronDown size={18} />
        </Box>
      )}
    >
      <MenuItem value="">
        <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
          {allText}
        </Typography>
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



  const statusOptions = useMemo(
    () => [
      { value: "PENDING", label: t("visa.statusPending") },
      { value: "IN_PROGRESS", label: t("visa.statusInProgress") },
      { value: "APPROVED", label: t("visa.statusApproved") },
      { value: "REJECTED", label: t("visa.statusRejected") },
      { value: "CANCELLED", label: t("visa.statusCancelled") },
      { value: "COMPLETED", label: t("visa.statusCompleted") },
    ],
    [t]
  );

  const paymentFilterOptions = useMemo(
    () => getBooleanPaymentFilterOptions(t),
    [t]
  );

  const allText = t("all");

  return (
    <Stack spacing={2.5}>
      <FilterDate
        label={t("columns.startDate")}
        name="start_date"
        value={filters.start_date}
        onChange={onFilterChange}
      />

      <FilterDate
        label={t("columns.endDate")}
        name="end_date"
        value={filters.end_date}
        onChange={onFilterChange}
      />

      <FilterSelect
        label={t("columns.visaStatus")}
        name="status"
        value={filters.status}
        options={statusOptions}
        isOpen={selectsOpen?.status ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      <FilterSelect
        label={t("columns.paymentStatus")}
        name="is_paid"
        value={filters?.is_paid}
        options={paymentFilterOptions}
        isOpen={selectsOpen?.is_paid ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
    </Stack>
  );
};

export default VisaFilter;
