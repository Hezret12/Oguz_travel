import { memo } from "react";
import { FormControl, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import GlobalEmployeeAutocomplete from "../../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";

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
              color: "#1565C0",
            },
          },
        },
      }}
    />
  </FormControl>
);

const VisaIntakeFilter = ({ filters, onFilterChange }) => {
  const { t } = useLocale();

  return (
    <Stack spacing={2.5}>
      <FilterDatePicker
        label={`${t("visaIntake.fields.applicationDate")} · ${t("columns.startDate")}`}
        name="start_date"
        value={filters.start_date}
        onChange={onFilterChange}
      />

      <FilterDatePicker
        label={`${t("visaIntake.fields.applicationDate")} · ${t("columns.endDate")}`}
        name="end_date"
        value={filters.end_date}
        onChange={onFilterChange}
      />

      {/* Loads operators 40 at a time (more on scroll) and searches them on the server. */}
      <GlobalEmployeeAutocomplete
        name="operator_guid"
        value={filters.operator_guid ?? ""}
        onChange={(val) => onFilterChange("operator_guid", val)}
        label={t("columns.operator")}
        placeholder={t("all")}
        size="small"
      />
    </Stack>
  );
};

export default memo(VisaIntakeFilter);
