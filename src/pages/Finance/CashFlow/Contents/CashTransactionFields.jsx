import { useMemo } from "react";
import { Controller } from "react-hook-form";
import { Grid, ToggleButton, ToggleButtonGroup, alpha } from "@mui/material";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import CustomTextField from "../../../../components/CustomTextField";
import CustomSelect from "../../../../components/CustomSelect";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import AppAutocomplete from "../../../../components/AppAutocomplete";
import { useLocale } from "../../../../hooks/useLocale";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { getAllEmployeeApi } from "../../../../api/queries/getters";
import CategoryAutocomplete from "./CategoryAutocomplete";
import { CURRENCY_OPTIONS } from "../functions/cashFlowHelpers";

const TYPE_COLORS = { INCOME: "#16a34a", EXPENSE: "#dc2626" };

// Shared by AddCashTransactionModal / EditCashTransactionModal.
const CashTransactionFields = ({ control }) => {
  const { t } = useLocale();

  const { data: employeesData } = useGet({
    apiFn: getAllEmployeeApi,
    key: "all-employees-modal",
    params: { limit: 100 },
  });

  const employeeOptions = useMemo(() => {
    const list = Array.isArray(employeesData) ? employeesData : [];
    return list.map((emp) => ({ label: emp.fullName || emp.name || "—", value: emp.guid }));
  }, [employeesData]);

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={field.value}
              onChange={(_, v) => v && field.onChange(v)}
              sx={{ "& .MuiToggleButton-root": { py: 1, gap: 1, fontWeight: 600, textTransform: "none", borderRadius: "10px" } }}
            >
              {[
                { value: "INCOME", label: t("finance.income"), Icon: ArrowDownLeft },
                { value: "EXPENSE", label: t("finance.expense"), Icon: ArrowUpRight },
              ].map(({ value, label, Icon }) => (
                <ToggleButton
                  key={value}
                  value={value}
                  sx={{
                    "&.Mui-selected, &.Mui-selected:hover": {
                      color: TYPE_COLORS[value],
                      bgcolor: alpha(TYPE_COLORS[value], 0.12),
                      borderColor: alpha(TYPE_COLORS[value], 0.5),
                    },
                  }}
                >
                  <Icon size={18} />
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomTextField name="amount" control={control} label={t("finance.amount")} type="number" required />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect name="currency" control={control} label={t("currency")} options={CURRENCY_OPTIONS} required />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CategoryAutocomplete name="category_guid" control={control} label={t("category")} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomDatePicker name="datetime" control={control} label={t("finance.cashBook.date")} showTime required />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CustomTextField
          name="description"
          control={control}
          label={t("finance.cashBook.description")}
          multiline
          rows={2}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomTextField name="giver" control={control} label={t("finance.cashBook.giver")} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomTextField name="receiver" control={control} label={t("finance.cashBook.receiver")} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomTextField name="company" control={control} label={t("finance.cashBook.company")} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <AppAutocomplete
          name="receiver_opr_guid"
          control={control}
          label={t("operator")}
          options={employeeOptions}
        />
      </Grid>
    </Grid>
  );
};

export default CashTransactionFields;
