import { useMemo } from "react";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
  TextField,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllCashBoxesApi } from "../../../api/queries/getters";

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

const FilterDate = ({ label, name, value, onChange }) => (
  <FormControl fullWidth size="small">
    <Typography
      variant="body2"
      sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}
    >
      {label}
    </Typography>
    <TextField
      fullWidth
      size="small"
      type="date"
      value={value ?? ""}
      onChange={(e) => onChange(name, e.target.value)}
      slotProps={{
        inputLabel: { shrink: true },
        input: { sx: selectSx },
      }}
    />
  </FormControl>
);

const CashFlowFilter = ({
  draft = {},
  setDraftFilter,
  selectsOpen = {},
  openSelect,
  closeSelect,
}) => {
  const { t } = useLocale();

  const { data: cashBoxesData } = useGet({
    apiFn: getAllCashBoxesApi,
    key: "all-cash-boxes",
  });

  const cashBoxOptions = useMemo(
    () =>
      (cashBoxesData || []).map((cb) => ({
        label: `${cb.name} (${cb.currency})`,
        value: cb.guid,
      })),
    [cashBoxesData]
  );

  const transactionTypeOptions = useMemo(
    () => [
      { label: "Girdeji (INCOME)", value: "INCOME" },
      { label: "Çykdajy (EXPENSE)", value: "EXPENSE" },
      { label: "Üpjün edijä töleg (SUPPLIER_PAYMENT)", value: "SUPPLIER_PAYMENT" },
      { label: "Müşderi tölegi (CLIENT_PAYMENT)", value: "CLIENT_PAYMENT" },
      { label: "Geçirim (TRANSFER)", value: "TRANSFER" },
    ],
    []
  );

  const categoryOptions = useMemo(
    () => [
      { label: "Partiýa satyn alnyşy (LOT_PURCHASE)", value: "LOT_PURCHASE" },
      { label: "Müşderi hyzmaty (CLIENT_SALE)", value: "CLIENT_SALE" },
      { label: "Ofis kireýi (OFFICE_RENT)", value: "OFFICE_RENT" },
      { label: "Aýlyk haky (SALARY)", value: "SALARY" },
      { label: "Beýleki çykdajylar (OVERHEAD)", value: "OVERHEAD" },
    ],
    []
  );

  return (
    <Stack spacing={2.5}>
      <FilterSelect
        label={t("finance.transactionType")}
        name="transaction_type"
        value={draft.transaction_type}
        options={transactionTypeOptions}
        isOpen={selectsOpen.transaction_type}
        allText={t("all")}
        onChange={setDraftFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />

      <FilterSelect
        label={t("finance.cashBox")}
        name="cash_box_guid"
        value={draft.cash_box_guid}
        options={cashBoxOptions}
        isOpen={selectsOpen.cash_box_guid}
        allText={t("all")}
        onChange={setDraftFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />

      <FilterSelect
        label={t("category", "Kategoriýa")}
        name="category"
        value={draft.category}
        options={categoryOptions}
        isOpen={selectsOpen.category}
        allText={t("all")}
        onChange={setDraftFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />

      <FilterDate
        label={t("startDate", "Başlangyç sene")}
        name="start_date"
        value={draft.start_date}
        onChange={setDraftFilter}
      />

      <FilterDate
        label={t("endDate", "Gutarýan sene")}
        name="end_date"
        value={draft.end_date}
        onChange={setDraftFilter}
      />
    </Stack>
  );
};

export default CashFlowFilter;
