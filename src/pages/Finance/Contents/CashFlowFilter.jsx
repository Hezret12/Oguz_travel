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
import {
  getAllEmployeeApi,
  getAllOfficeApi,
} from "../../../api/queries/getters";

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
  const { t, selectedLang } = useLocale();

  const { data: employeesData } = useGet({
    apiFn: getAllEmployeeApi,
    key: "all-employees-filter",
    params: { limit: 100 },
  });

  const { data: officesData } = useGet({
    apiFn: getAllOfficeApi,
    key: "all-offices-filter",
    params: { limit: 100 },
  });

  const employeeOptions = useMemo(() => {
    const raw = employeesData?.data ?? employeesData ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map((emp) => ({
      label: emp.fullName || emp.name || "—",
      value: emp.guid,
    }));
  }, [employeesData]);

  const officeOptions = useMemo(() => {
    const raw = officesData?.data ?? officesData ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map((off) => ({
      label: selectedLang(off.shortName) || selectedLang(off.fullName) || off.name || "—",
      value: off.guid,
    }));
  }, [officesData, selectedLang]);

  const currencyOptions = useMemo(
    () => [
      { label: "TMT", value: "TMT" },
      { label: "USD", value: "USD" },
    ],
    []
  );

  const isManualOptions = useMemo(
    () => [
      { label: "El bilen goşulan (Manual)", value: "true" },
      { label: "Awto-sinkronlaşan (Auto-Sync)", value: "false" },
    ],
    []
  );

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography
          variant="body2"
          sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}
        >
          {t("category", "Kategoriýa")}
        </Typography>
        <TextField
          size="small"
          fullWidth
          value={draft.category || ""}
          onChange={(e) => setDraftFilter("category", e.target.value)}
          placeholder={t("category", "Kategoriýa")}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: "background.paper",
            },
          }}
        />
      </Box>

      <FilterSelect
        label={t("operator", "Jogapkär / Operator")}
        name="receiver_opr_guid"
        value={draft.receiver_opr_guid}
        options={employeeOptions}
        isOpen={selectsOpen.receiver_opr_guid}
        allText={t("all")}
        onChange={setDraftFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />

      <FilterSelect
        label={t("office", "Ofis")}
        name="office_guid"
        value={draft.office_guid}
        options={officeOptions}
        isOpen={selectsOpen.office_guid}
        allText={t("all")}
        onChange={setDraftFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />

      <FilterSelect
        label={t("currency", "Walýuta")}
        name="currency"
        value={draft.currency}
        options={currencyOptions}
        isOpen={selectsOpen.currency}
        allText={t("all")}
        onChange={setDraftFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />

      <FilterSelect
        label={t("finance.type", "Goşulyş görnüşi")}
        name="is_manual"
        value={draft.is_manual}
        options={isManualOptions}
        isOpen={selectsOpen.is_manual}
        allText={t("all")}
        onChange={setDraftFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />

      <FilterDate
        label={t("date", "Sene")}
        name="datetime"
        value={draft.datetime}
        onChange={setDraftFilter}
      />
    </Stack>
  );
};

export default CashFlowFilter;
