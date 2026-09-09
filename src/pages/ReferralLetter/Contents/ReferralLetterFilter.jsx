import { FormControl, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import GlobalEmployeeAutocomplete from "../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";

const FilterDatePicker = ({ label, name, value, onChange, minDate, maxDate }) => (
  <FormControl fullWidth size="small">
    <Typography
      variant="body2"
      sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}
    >
      {label}
    </Typography>
    <DatePicker
      value={value ? dayjs(value) : null}
      minDate={minDate ? dayjs(minDate) : undefined}
      maxDate={maxDate ? dayjs(maxDate) : undefined}
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
          },
        },
      }}
    />
  </FormControl>
);

const ReferralLetterFilter = ({
  filters,
  onFilterChange,
}) => {
  const { t } = useLocale();

  const allText = t("all");

  const handleDateChange = (name, val) => {
    onFilterChange(name, val);
  };

  return (
    <Stack spacing={2.5}>
      {/* Start Date */}
      <FilterDatePicker
        label={t("columns.startDate")}
        name="start_date"
        value={filters?.start_date}
        maxDate={filters?.end_date}
        onChange={handleDateChange}
      />

      {/* End Date */}
      <FilterDatePicker
        label={t("columns.endDate")}
        name="end_date"
        value={filters?.end_date}
        minDate={filters?.start_date}
        onChange={handleDateChange}
      />

      {/* Operator (received_opr_guid) */}
      <GlobalEmployeeAutocomplete
        name="received_opr_guid"
        value={filters?.received_opr_guid ?? ""}
        onChange={(val) => onFilterChange("received_opr_guid", val)}
        label={t("columns.operator")}
        placeholder={allText}
        size="small"
      />

      {/* Departure Date */}
      <FilterDatePicker
        label={t("columns.departureDate")}
        name="departure_date"
        value={filters?.departure_date}
        onChange={handleDateChange}
      />

      {/* Return Date */}
      <FilterDatePicker
        label={t("columns.returnDate")}
        name="return_date"
        value={filters?.return_date}
        onChange={handleDateChange}
      />

      {/* Contract Date */}
      <FilterDatePicker
        label={t("columns.contractDate")}
        name="contract_date"
        value={filters?.contract_date}
        onChange={handleDateChange}
      />
    </Stack>
  );
};

export default ReferralLetterFilter;
