import { useMemo } from "react";
import { Box, FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import GlobalEmployeeAutocomplete from "../../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";

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
            "& .MuiInputAdornment-root .MuiIconButton-root": {
              color: "primary.main",
            },
          },
        },
      }}
    />
  </FormControl>
);

const ReferralLetterFilter = ({
  filters,
  selectsOpen,
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => {
  const { t } = useLocale();

  const statusOptions = useMemo(
    () => [
      { label: t("referralLetter.statusSold") || "Satyldy", value: 1 },
      { label: t("referralLetter.statusDamaged") || "Zyýan ýeten", value: 2 },
      { label: t("referralLetter.statusLost") || "Ýitirilen", value: 3 },
    ],
    [t]
  );

  const allText = t("all") ?? "All";

  return (
    <Stack spacing={2.5}>
      <FilterDatePicker
        label={t("columns.date")}
        name="datetime"
        value={filters.datetime}
        onChange={onFilterChange}
      />

      {/* Operator 1 (Assignment) */}
      <GlobalEmployeeAutocomplete
        name="assignment_opr_guid"
        value={filters?.assignment_opr_guid ?? ""}
        onChange={(val) => onFilterChange("assignment_opr_guid", val)}
        label={t("referralLetter.submittedBy")}
        placeholder={allText}
        size="small"
      />

      {/* Operator 2 (Receiver) */}
      <GlobalEmployeeAutocomplete
        name="receiver_opr_guid"
        value={filters?.receiver_opr_guid ?? ""}
        onChange={(val) => onFilterChange("receiver_opr_guid", val)}
        label={t("referralLetter.receivedBy")}
        placeholder={allText}
        size="small"
      />

      <FilterSelect
        label={t("columns.status")}
        name="status"
        value={filters.status}
        options={statusOptions}
        isOpen={selectsOpen?.status ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
    </Stack>
  );
};

export default ReferralLetterFilter;
