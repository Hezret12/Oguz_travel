import { Grid } from "@mui/material";
import CustomTextField from "../../../../components/CustomTextField";
import CustomSelect from "../../../../components/CustomSelect";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import { useLocale } from "../../../../hooks/useLocale";
import CategoryAutocomplete from "./CategoryAutocomplete";
import CashTypeToggle from "./CashTypeToggle";
import { CURRENCY_OPTIONS } from "../functions/cashFlowHelpers";

// Shared by AddCashTransactionModal / EditCashTransactionModal.
const CashTransactionFields = ({ control }) => {
  const { t } = useLocale();

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12 }}>
        <CashTypeToggle control={control} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomTextField name="giver" control={control} label={t("finance.cashBook.giver")} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomTextField name="receiver" control={control} label={t("finance.cashBook.receiver")} />
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
        <CustomTextField name="company" control={control} label={t("finance.cashBook.company")} />
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
    </Grid>
  );
};

export default CashTransactionFields;
