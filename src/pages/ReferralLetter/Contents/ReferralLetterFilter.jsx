import {
  Box,
  FormControl,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import FlightLandRoundedIcon from "@mui/icons-material/FlightLandRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import GlobalEmployeeAutocomplete from "../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";

const CompactDatePicker = ({ label, value, onChange, minDate, maxDate }) => (
  <FormControl fullWidth size="small">
    <Typography
      variant="caption"
      sx={{
        mb: 0.5,
        fontWeight: 500,
        fontSize: "0.75rem",
        color: "text.secondary",
        display: "block",
        lineHeight: 1.2,
      }}
    >
      {label}
    </Typography>
    <DatePicker
      value={value ? dayjs(value) : null}
      minDate={minDate ? dayjs(minDate) : undefined}
      maxDate={maxDate ? dayjs(maxDate) : undefined}
      onChange={(newValue) => {
        onChange(
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
          placeholder: "DD.MM.YYYY",
          sx: {
            "& .MuiInputBase-root": {
              fontSize: "0.8125rem",
              height: "38px",
              minHeight: "38px",
              borderRadius: "8px",
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.03)"
                  : "#ffffff",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            },
            "& .MuiInputBase-input": {
              padding: "7px 10px",
              fontSize: "0.8125rem",
            },
            "& .MuiIconButton-root": {
              padding: "4px",
              marginRight: "-2px",
              color: "action.active",
              "& .MuiSvgIcon-root": {
                fontSize: "18px",
              },
            },
          },
        },
      }}
    />
  </FormControl>
);

const DateRangeCard = ({
  icon: Icon,
  title,
  startName,
  endName,
  startValue,
  endValue,
  startLabel,
  endLabel,
  onChange,
  onClear,
}) => {
  const hasValue = Boolean(startValue || endValue);

  return (
    <Box
      sx={(theme) => ({
        p: 1.5,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: hasValue
          ? theme.palette.primary.main
          : theme.palette.divider,
        backgroundColor: hasValue
          ? theme.palette.mode === "dark"
            ? "rgba(0, 114, 229, 0.08)"
            : "rgba(0, 114, 229, 0.03)"
          : theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.02)"
            : "rgba(0, 0, 0, 0.015)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: hasValue
            ? theme.palette.primary.main
            : theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.2)"
              : "rgba(0, 0, 0, 0.2)",
        },
      })}
    >
      {/* Card Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.25 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {Icon && (
            <Box
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 26,
                height: 26,
                borderRadius: "7px",
                backgroundColor: hasValue
                  ? theme.palette.primary.main
                  : theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.05)",
                color: hasValue ? "#ffffff" : "primary.main",
                transition: "all 0.2s ease",
              })}
            >
              <Icon sx={{ fontSize: 16 }} />
            </Box>
          )}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              fontSize: "0.83rem",
              color: hasValue ? "primary.main" : "text.primary",
            }}
          >
            {title}
          </Typography>
        </Stack>

        {hasValue && (
          <Tooltip title="Arassala" arrow>
            <IconButton
              size="small"
              onClick={onClear}
              sx={{
                p: 0.35,
                color: "text.secondary",
                "&:hover": {
                  color: "error.main",
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {/* Side-by-Side Date Pickers */}
      <Stack direction="row" spacing={1.25} alignItems="flex-end">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CompactDatePicker
            label={startLabel}
            value={startValue}
            maxDate={endValue}
            onChange={(val) => onChange(startName, val)}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CompactDatePicker
            label={endLabel}
            value={endValue}
            minDate={startValue}
            onChange={(val) => onChange(endName, val)}
          />
        </Box>
      </Stack>
    </Box>
  );
};

const ReferralLetterFilter = ({
  filters,
  onFilterChange,
}) => {
  const { t } = useLocale();
  const allText = t("all");

  const handleDateChange = (name, val) => {
    onFilterChange(name, val);
  };

  const handleClearRange = (startKey, endKey) => {
    onFilterChange(startKey, "");
    onFilterChange(endKey, "");
  };

  return (
    <Stack spacing={2}>
      {/* Operator (received_opr_guid) */}
      <GlobalEmployeeAutocomplete
        name="received_opr_guid"
        value={filters?.received_opr_guid ?? ""}
        onChange={(val) => onFilterChange("received_opr_guid", val)}
        label={t("columns.operator")}
        placeholder={allText}
        size="small"
      />

      {/* Departure Date Group (Gidiş senesi) */}
      <DateRangeCard
        icon={FlightTakeoffRoundedIcon}
        title={t("columns.departureDate")}
        startName="start_departure_date"
        endName="end_departure_date"
        startValue={filters?.start_departure_date}
        endValue={filters?.end_departure_date}
        startLabel={t("columns.startDate")}
        endLabel={t("columns.endDate")}
        onChange={handleDateChange}
        onClear={() =>
          handleClearRange("start_departure_date", "end_departure_date")
        }
      />

      {/* Return Date Group (Gelýän senesi) */}
      <DateRangeCard
        icon={FlightLandRoundedIcon}
        title={t("columns.returnDate")}
        startName="start_return_date"
        endName="end_return_date"
        startValue={filters?.start_return_date}
        endValue={filters?.end_return_date}
        startLabel={t("columns.startDate")}
        endLabel={t("columns.endDate")}
        onChange={handleDateChange}
        onClear={() =>
          handleClearRange("start_return_date", "end_return_date")
        }
      />

      {/* Contract Date Group (Şertnama senesi) */}
      <DateRangeCard
        icon={DescriptionOutlinedIcon}
        title={t("columns.contractDate")}
        startName="start_contract_date"
        endName="end_contract_date"
        startValue={filters?.start_contract_date}
        endValue={filters?.end_contract_date}
        startLabel={t("columns.startDate")}
        endLabel={t("columns.endDate")}
        onChange={handleDateChange}
        onClear={() =>
          handleClearRange("start_contract_date", "end_contract_date")
        }
      />
    </Stack>
  );
};

export default ReferralLetterFilter;
