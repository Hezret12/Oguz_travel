import { Box, FormControl, Stack, Typography } from "@mui/material";
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
      {/* Operator (received_opr_guid) */}
      <GlobalEmployeeAutocomplete
        name="received_opr_guid"
        value={filters?.received_opr_guid ?? ""}
        onChange={(val) => onFilterChange("received_opr_guid", val)}
        label={t("columns.operator")}
        placeholder={allText}
        size="small"
      />

      {/* Departure Date Group */}
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
          {t("columns.departureDate")}
        </Typography>

        <FilterDatePicker
          label={t("columns.startDate")}
          name="start_departure_date"
          value={filters?.start_departure_date}
          maxDate={filters?.end_departure_date}
          onChange={handleDateChange}
        />

        <FilterDatePicker
          label={t("columns.endDate")}
          name="end_departure_date"
          value={filters?.end_departure_date}
          minDate={filters?.start_departure_date}
          onChange={handleDateChange}
        />
      </Box>

      {/* Return Date Group */}
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
          {t("columns.returnDate")}
        </Typography>

        <FilterDatePicker
          label={t("columns.startDate")}
          name="start_return_date"
          value={filters?.start_return_date}
          maxDate={filters?.end_return_date}
          onChange={handleDateChange}
        />

        <FilterDatePicker
          label={t("columns.endDate")}
          name="end_return_date"
          value={filters?.end_return_date}
          minDate={filters?.start_return_date}
          onChange={handleDateChange}
        />
      </Box>

      {/* Contract Date Group */}
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
          {t("columns.contractDate")}
        </Typography>

        <FilterDatePicker
          label={t("columns.startDate")}
          name="start_contract_date"
          value={filters?.start_contract_date}
          maxDate={filters?.end_contract_date}
          onChange={handleDateChange}
        />

        <FilterDatePicker
          label={t("columns.endDate")}
          name="end_contract_date"
          value={filters?.end_contract_date}
          minDate={filters?.start_contract_date}
          onChange={handleDateChange}
        />
      </Box>
    </Stack>
  );
};

export default ReferralLetterFilter;
