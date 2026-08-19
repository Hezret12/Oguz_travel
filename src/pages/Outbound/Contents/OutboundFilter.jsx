import { useMemo } from "react";
import {
  Box,
  Divider,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import GlobalEmployeeAutocomplete from "../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import {
  SOURCE_OPTIONS,
  TICKET_TYPE_OPTIONS,
  MEAL_PLAN_OPTIONS,
  TRAIN_TYPE_OPTIONS,
  CAR_TYPE_OPTIONS,
  getPaymentOptions,
} from "../constants";

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
      slotProps={menuPaperProps}
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
              minHeight: "40px",
              borderRadius: "8px",
            },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
            "& .MuiInputAdornment-root .MuiIconButton-root": {
              color: "primary.main",
            },
          },
        },
      }}
    />
  </FormControl>
);

const OutboundFilter = ({
  activeTab = "hotel",
  filters = {},
  selectsOpen = {},
  onFilterChange,
  onSelectOpen,
  onSelectClose,
}) => {
  const { t } = useLocale();

  const paymentOptions = useMemo(() => getPaymentOptions(t), [t]);
  const allText = t("all") ?? "All";

  return (
    <Stack spacing={2.5}>
      {/* ================= GLOBAL / ORTAK FİLTRELER ================= */}
      <FilterDatePicker
        label={t("outbound.requestDate")}
        name="application_date"
        value={filters.application_date}
        onChange={onFilterChange}
      />

      <GlobalEmployeeAutocomplete
        name="opr_guid"
        value={filters.opr_guid ?? ""}
        onChange={(val) => onFilterChange("opr_guid", val)}
        label={t("outbound.operator")}
        placeholder={allText}
        size="small"
      />

      <GlobalEmployeeAutocomplete
        name="prepared_opr_guid"
        value={filters.prepared_opr_guid ?? ""}
        onChange={(val) => onFilterChange("prepared_opr_guid", val)}
        label={t("outbound.preparedBy")}
        placeholder={allText}
        size="small"
      />

      <FilterSelect
        label={t("columns.paymentStatus")}
        name="is_paid"
        value={filters.is_paid}
        options={paymentOptions}
        isOpen={selectsOpen?.is_paid ?? false}
        allText={allText}
        onChange={onFilterChange}
        onOpen={onSelectOpen}
        onClose={onSelectClose}
      />

      {/* ================= TAB'E GÖRE DEĞİŞEN SELECT FİLTRELERİ ================= */}
      {activeTab !== "package" && <Divider sx={{ my: 0.5 }} />}

      {/* 1. HOTEL TAB */}
      {activeTab === "hotel" && (
        <>
          <FilterSelect
            label={t("outbound.source")}
            name="system"
            value={filters.system}
            options={SOURCE_OPTIONS}
            isOpen={selectsOpen?.system ?? false}
            allText={allText}
            onChange={onFilterChange}
            onOpen={onSelectOpen}
            onClose={onSelectClose}
          />
          <FilterSelect
            label={t("outbound.mealPlan")}
            name="meal_plan"
            value={filters.meal_plan}
            options={MEAL_PLAN_OPTIONS}
            isOpen={selectsOpen?.meal_plan ?? false}
            allText={allText}
            onChange={onFilterChange}
            onOpen={onSelectOpen}
            onClose={onSelectClose}
          />
        </>
      )}

      {/* 2. AIRWAY TAB */}
      {activeTab === "airway" && (
        <>
          <FilterSelect
            label={t("outbound.source")}
            name="system"
            value={filters.system}
            options={SOURCE_OPTIONS}
            isOpen={selectsOpen?.system ?? false}
            allText={allText}
            onChange={onFilterChange}
            onOpen={onSelectOpen}
            onClose={onSelectClose}
          />
          <FilterSelect
            label={t("outbound.ticketType")}
            name="ticket_type"
            value={filters.ticket_type}
            options={TICKET_TYPE_OPTIONS}
            isOpen={selectsOpen?.ticket_type ?? false}
            allText={allText}
            onChange={onFilterChange}
            onOpen={onSelectOpen}
            onClose={onSelectClose}
          />
        </>
      )}

      {/* 3. RAILWAY TAB */}
      {activeTab === "railway" && (
        <>
          <FilterSelect
            label={t("outbound.source")}
            name="system"
            value={filters.system}
            options={SOURCE_OPTIONS}
            isOpen={selectsOpen?.system ?? false}
            allText={allText}
            onChange={onFilterChange}
            onOpen={onSelectOpen}
            onClose={onSelectClose}
          />
          <FilterSelect
            label={t("outbound.ticketType")}
            name="ticket_type"
            value={filters.ticket_type}
            options={TICKET_TYPE_OPTIONS}
            isOpen={selectsOpen?.ticket_type ?? false}
            allText={allText}
            onChange={onFilterChange}
            onOpen={onSelectOpen}
            onClose={onSelectClose}
          />
          <FilterSelect
            label={t("outbound.trainType")}
            name="train_type"
            value={filters.train_type}
            options={TRAIN_TYPE_OPTIONS}
            isOpen={selectsOpen?.train_type ?? false}
            allText={allText}
            onChange={onFilterChange}
            onOpen={onSelectOpen}
            onClose={onSelectClose}
          />
        </>
      )}

      {/* 4. TOUR TAB */}
      {activeTab === "tour" && (
        <FilterSelect
          label={t("outbound.source")}
          name="system"
          value={filters.system}
          options={SOURCE_OPTIONS}
          isOpen={selectsOpen?.system ?? false}
          allText={allText}
          onChange={onFilterChange}
          onOpen={onSelectOpen}
          onClose={onSelectClose}
        />
      )}

      {/* 5. TRANSFER TAB */}
      {activeTab === "transfer" && (
        <>
          <FilterSelect
            label={t("outbound.source")}
            name="system"
            value={filters.system}
            options={SOURCE_OPTIONS}
            isOpen={selectsOpen?.system ?? false}
            allText={allText}
            onChange={onFilterChange}
            onOpen={onSelectOpen}
            onClose={onSelectClose}
          />
          <FilterSelect
            label={t("outbound.transferType")}
            name="transfer_type"
            value={filters.transfer_type}
            options={TICKET_TYPE_OPTIONS}
            isOpen={selectsOpen?.transfer_type ?? false}
            allText={allText}
            onChange={onFilterChange}
            onOpen={onSelectOpen}
            onClose={onSelectClose}
          />
          <FilterSelect
            label={t("outbound.carType")}
            name="machine_type"
            value={filters.machine_type}
            options={CAR_TYPE_OPTIONS}
            isOpen={selectsOpen?.machine_type ?? false}
            allText={allText}
            onChange={onFilterChange}
            onOpen={onSelectOpen}
            onClose={onSelectClose}
          />
        </>
      )}
    </Stack>
  );
};

export default OutboundFilter;
