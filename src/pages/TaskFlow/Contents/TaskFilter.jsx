import { useMemo, memo } from "react";
import { Box, FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import AppUserAutocomplete from "../../../components/AppUserAutocomplete";
import { TASK_STATUS_ITEMS, TASK_PRIORITY_ITEMS } from "../functions/taskMeta";

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
      boxShadow: 3,
    },
  },
};

// Module-level so MUI doesn't remount it every render; MUI adds `MuiSelect-iconOpen` while open.
const SelectChevron = ({ className }) => (
  <Box
    component="span"
    className={className}
    sx={{
      display: "inline-flex",
      position: "absolute",
      right: 12,
      top: "calc(50% - 9px)",
      color: "text.secondary",
      pointerEvents: "none",
      transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      "&.MuiSelect-iconOpen": { transform: "rotate(180deg)" },
    }}
  >
    <ChevronDown size={18} />
  </Box>
);

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
      IconComponent={SelectChevron}
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

function TaskFilter({
  filters = {},
  onFilterChange,
  selectsOpen = {},
  onSelectOpen,
  onSelectClose,
}) {
  const { t } = useLocale();

  const statusOptions = useMemo(
    () => TASK_STATUS_ITEMS.map((item) => ({ label: t(item.labelKey), value: item.id })),
    [t]
  );

  const priorityOptions = useMemo(
    () => TASK_PRIORITY_ITEMS.map((item) => ({ label: t(item.labelKey), value: item.value })),
    [t]
  );

  return (
    <Stack spacing={2.5}>
      <FilterSelect
        label={t("columns.status")}
        name="status"
        value={filters.status}
        options={statusOptions}
        isOpen={Boolean(selectsOpen.status)}
        allText={t("all")}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
      <FilterSelect
        label={t("task.priority")}
        name="priority"
        value={filters.priority}
        options={priorityOptions}
        isOpen={Boolean(selectsOpen.priority)}
        allText={t("all")}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />
      <FilterDatePicker
        label={t("task.dueDate")}
        name="due_date"
        value={filters.due_date}
        onChange={onFilterChange}
      />
      <AppUserAutocomplete
        label={t("task.assignees")}
        value={filters.opr_guid}
        onChange={(val) => onFilterChange("opr_guid", val)}
        multiple={false}
      />
    </Stack>
  );
}

export default memo(TaskFilter);
