import { useMemo } from "react";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllTranslatorsApi } from "../../../api/queries/getters";
import GlobalEmployeeAutocomplete from "../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";

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

const FilterDatePicker = ({
  label,
  name,
  value,
  onChange,
  minDate,
  maxDate,
}) => (
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
          newValue && newValue.isValid() ? newValue.format("YYYY-MM-DD") : "",
        );
      }}
      minDate={minDate ? dayjs(minDate) : undefined}
      maxDate={maxDate ? dayjs(maxDate) : undefined}
      format="DD.MM.YYYY"
      views={["year", "month", "day"]}
      slotProps={{
        field: { clearable: true, onClear: () => onChange(name, "") },
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

const FilterTimePicker = ({ label, name, value, onChange }) => (
  <FormControl fullWidth size="small">
    <Typography
      variant="body2"
      sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}
    >
      {label}
    </Typography>
    <TimePicker
      value={value ? dayjs(value, "HH:mm") : null}
      onChange={(newValue) => {
        onChange(
          name,
          newValue && newValue.isValid() ? newValue.format("HH:mm") : "",
        );
      }}
      format="HH:mm"
      ampm={false}
      slotProps={{
        field: { clearable: true, onClear: () => onChange(name, "") },
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

const TranslateFilter = ({
  filters,
  selectsOpen,
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => {
  const { t } = useLocale();

  const { data: translators = [] } = useGet({
    apiFn: getAllTranslatorsApi,
    key: "translators",
  });

  const translatorOptions = useMemo(
    () =>
      (translators || []).map((tr) => ({ value: tr.guid, label: tr.fullName })),
    [translators],
  );

  const allText = t("all") ?? "All";

  return (
    <Stack spacing={2.5}>
      <GlobalEmployeeAutocomplete
        name="opr_guid"
        value={filters?.opr_guid ?? ""}
        onChange={(val) => onFilterChange("opr_guid", val)}
        label={t("columns.operator")}
        placeholder={allText}
        size="small"
      />

      <FilterSelect
        label={t("columns.translator")}
        name="translator_guid"
        value={filters?.translator_guid}
        options={translatorOptions}
        isOpen={selectsOpen?.translator_guid ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
      {/* Gelen güni (Received Day Group) */}
      <Box
        sx={{
          p: 1.75,
          borderRadius: "10px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.02)"
              : "rgba(0, 0, 0, 0.015)",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "primary.main",
          }}
        >
          {t("columns.receivedDay")}
        </Typography>

        <FilterDatePicker
          label={t("columns.startDate")}
          name="start_received_day"
          value={filters?.start_received_day}
          maxDate={filters?.end_received_day}
          onChange={onFilterChange}
        />

        <FilterDatePicker
          label={t("columns.endDate")}
          name="end_received_day"
          value={filters?.end_received_day}
          minDate={filters?.start_received_day}
          onChange={onFilterChange}
        />
      </Box>

      {/* Tabşyrylan güni (Completed Day Group) */}
      <Box
        sx={{
          p: 1.75,
          borderRadius: "10px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.02)"
              : "rgba(0, 0, 0, 0.015)",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "primary.main",
          }}
        >
          {t("columns.completedDay")}
        </Typography>

        <FilterDatePicker
          label={t("columns.startDate")}
          name="start_completed_day"
          value={filters?.start_completed_day}
          maxDate={filters?.end_completed_day}
          onChange={onFilterChange}
        />

        <FilterDatePicker
          label={t("columns.endDate")}
          name="end_completed_day"
          value={filters?.end_completed_day}
          minDate={filters?.start_completed_day}
          onChange={onFilterChange}
        />
      </Box>

      {/* Received Time & Completed Time Side-by-Side */}
      <Stack direction="row" spacing={1.5} sx={{ "& > *": { flex: 1 } }}>
        <FilterTimePicker
          label={t("columns.receivedTime")}
          name="received_time"
          value={filters?.received_time}
          onChange={onFilterChange}
        />

        <FilterTimePicker
          label={t("columns.completedTime")}
          name="completed_time"
          value={filters?.completed_time}
          onChange={onFilterChange}
        />
      </Stack>
    </Stack>
  );
};

export default TranslateFilter;
