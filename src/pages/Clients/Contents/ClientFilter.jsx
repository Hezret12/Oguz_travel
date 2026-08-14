import {
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";

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
      onOpen={() => onOpen(name)}
      onClose={() => onClose(name)}
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

const FilterDatePicker = ({ label, value, onChange }) => (
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
          newValue && newValue.isValid()
            ? newValue.format("YYYY-MM-DD")
            : "",
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
              color: "#1565C0",
            },
          },
        },
      }}
    />
  </FormControl>
);

const ClientFilter = ({
  filters,
  selectsOpen,
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => {
  const { t } = useLocale();
  const allText = t("all") ?? "All";

  const genderOptions = [
    { label: t("clients.genderWomen"), value: "Women" },
    { label: t("clients.genderMen"), value: "Men" },
  ];

  return (
    <Stack spacing={2.5}>
      <FilterDatePicker
        label={t("columns.dateOfBirth")}
        value={filters.dateOfBirth}
        onChange={(value) => onFilterChange("dateOfBirth", value)}
      />

      <FilterDatePicker
        label={t("columns.passportIssueDate")}
        value={filters.passportIssueDate}
        onChange={(value) => onFilterChange("passportIssueDate", value)}
      />

      <FilterDatePicker
        label={t("columns.passportExpiryDate")}
        value={filters.passportExpiryDate}
        onChange={(value) => onFilterChange("passportExpiryDate", value)}
      />

      <FilterSelect
        label={t("columns.gender")}
        name="gender"
        value={filters.gender}
        options={genderOptions}
        isOpen={selectsOpen?.gender ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
    </Stack>
  );
};

export default ClientFilter;
