import { useMemo } from "react";
import { Box, FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import AppUserAutocomplete from "../../../components/AppUserAutocomplete";

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
  allText = "Hemmesi",
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
              height: "40px",
              borderRadius: "10px",
            },
          },
        },
      }}
    />
  </FormControl>
);

export default function TaskFilter({
  filters,
  draft,
  onFilterChange,
  setFilter,
  selectsOpen = {},
  onSelectOpen,
  onSelectClose,
  openSelect,
  closeSelect,
}) {
  const { t } = useLocale();

  const currentFilters = filters || draft || {};
  const handleFilterChange = onFilterChange || setFilter;
  const handleSelectOpen = onSelectOpen || openSelect;
  const handleSelectClose = onSelectClose || closeSelect;
  const statusOptions = useMemo(
    () => [
      { label: t("task.statusToDo", "TO DO"), value: 1 },
      { label: t("task.statusInProgress", "IN PROGRESS"), value: 2 },
      { label: t("task.statusCompleted", "COMPLETED"), value: 3 },
    ],
    [t]
  );

  const priorityOptions = useMemo(
    () => [
      { label: t("task.priorityUrgent", "Gyssagly"), value: "urgent" },
      { label: t("task.priorityMedium", "Medium"), value: "medium" },
    ],
    [t]
  );

  return (
    <Stack spacing={2.5}>
      <FilterSelect
        label={t("columns.status")}
        name="status"
        value={currentFilters.status}
        options={statusOptions}
        isOpen={Boolean(selectsOpen.status)}
        allText={t("all", "Hemmesi")}
        onChange={handleFilterChange}
        onOpen={handleSelectOpen}
        onClose={handleSelectClose}
      />
      <FilterSelect
        label={t("task.priority")}
        name="priority"
        value={currentFilters.priority}
        options={priorityOptions}
        isOpen={Boolean(selectsOpen.priority)}
        allText={t("all", "Hemmesi")}
        onChange={handleFilterChange}
        onOpen={handleSelectOpen}
        onClose={handleSelectClose}
      />
      <FilterDatePicker
        label={t("task.dueDate")}
        name="due_date"
        value={currentFilters.due_date}
        onChange={handleFilterChange}
      />
      <AppUserAutocomplete
        label={t("task.assignees")}
        value={currentFilters.opr_guid}
        onChange={(val) => handleFilterChange("opr_guid", val)}
        multiple={false}
      />
    </Stack>
  );
}
