import { useMemo } from "react";
import { FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useLocale } from "../../../hooks/useLocale";

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

export default function TaskFilter({
  draft,
  setFilter,
  selectsOpen = {},
  openSelect,
  closeSelect,
}) {
  const { t } = useLocale();

  const statusOptions = useMemo(
    () => [
      { label: t("task.statusToDo", "TO DO"), value: "To Do" },
      { label: t("task.statusInProgress", "IN PROGRESS"), value: "In Progress" },
      { label: t("task.statusCompleted", "COMPLETED"), value: "Completed" },
      { label: t("task.statusCancelled", "Cancelled"), value: "Cancelled" },
    ],
    [t]
  );

  const priorityOptions = useMemo(
    () => [
      { label: t("task.priorityHigh", "High"), value: "High" },
      { label: t("task.priorityMedium", "Medium"), value: "Medium" },
      { label: t("task.priorityLow", "Low"), value: "Low" },
    ],
    [t]
  );

  return (
    <Stack spacing={2.5}>
      <FilterSelect
        label={t("columns.status", "Status")}
        name="status"
        value={draft.status}
        options={statusOptions}
        isOpen={Boolean(selectsOpen.status)}
        allText={t("all", "Hemmesi")}
        onChange={setFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />
      <FilterSelect
        label={t("task.priority", "Priority")}
        name="priority"
        value={draft.priority}
        options={priorityOptions}
        isOpen={Boolean(selectsOpen.priority)}
        allText={t("all", "Hemmesi")}
        onChange={setFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />
    </Stack>
  );
}

