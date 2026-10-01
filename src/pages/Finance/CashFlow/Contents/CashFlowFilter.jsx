import { useMemo, memo } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import { useLocale } from "../../../../hooks/useLocale";
import { useGet } from "../../../../hooks/CRUD/useGet";
import {
  getAllEmployeeApi,
  getAllOfficeApi,
  getAllCategoriesApi,
} from "../../../../api/queries/getters";

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

export const FilterSelect = ({
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

// CustomDatePicker bound to a filter draft value ("YYYY-MM-DD" or ""). The
// local form only mirrors the draft (`values` keeps it in sync on reset).
export const FilterDate = ({ label, name, value, onChange, ...pickerProps }) => {
  const { control } = useForm({ values: { [name]: value || null } });

  return (
    <CustomDatePicker
      name={name}
      control={control}
      label={label}
      // Two pickers share a row in the 380px drawer; without minWidth 0 each
      // keeps its ~240px content width and the second one overflows.
      sx={{ flex: 1, minWidth: 0 }}
      onValueChange={(iso) => onChange(name, iso ? dayjs(iso).format("YYYY-MM-DD") : "")}
      {...pickerProps}
    />
  );
};

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
  });

  const { data: categoriesData } = useGet({
    apiFn: getAllCategoriesApi,
    key: "categories",
  });

  const categoryOptions = useMemo(() => {
    const raw =
      categoriesData?.data?.data ??
      categoriesData?.data ??
      categoriesData ??
      [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map((cat) => ({
      label:
        typeof cat.name === "object"
          ? selectedLang(cat.name) || cat.name?.tk || cat.name?.ru || cat.name?.en || "—"
          : String(cat.name || "—"),
      value: cat.guid,
    }));
  }, [categoriesData, selectedLang]);

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

  const typeOptions = useMemo(
    () => [
      { label: t("finance.income"), value: "INCOME" },
      { label: t("finance.expense"), value: "EXPENSE" },
    ],
    [t]
  );

  return (
    <Stack spacing={2.5}>
      <FilterSelect
        label={t("finance.cashBook.direction")}
        name="type"
        value={draft.type}
        options={typeOptions}
        isOpen={selectsOpen.type}
        allText={t("all")}
        onChange={setDraftFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />

      <Stack direction="row" spacing={1.5}>
        <FilterDate
          label={t("finance.cashBook.dateFrom")}
          name="date_from"
          value={draft.date_from}
          maxDate={draft.date_to ? dayjs(draft.date_to) : undefined}
          onChange={setDraftFilter}
        />
        <FilterDate
          label={t("finance.cashBook.dateTo")}
          name="date_to"
          value={draft.date_to}
          minDate={draft.date_from ? dayjs(draft.date_from) : undefined}
          onChange={setDraftFilter}
        />
      </Stack>

      <FilterSelect
        label={t("category", "Kategoriýa")}
        name="category_guid"
        value={draft.category_guid}
        options={categoryOptions}
        isOpen={selectsOpen.category_guid}
        allText={t("all")}
        onChange={setDraftFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />

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
        label={t("sidebar.office")}
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
    </Stack>
  );
};

export default memo(CashFlowFilter);
