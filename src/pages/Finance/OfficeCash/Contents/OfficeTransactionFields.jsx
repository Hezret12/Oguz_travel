import { useMemo } from "react";
import { Grid } from "@mui/material";
import CustomTextField from "../../../../components/CustomTextField";
import CustomSelect from "../../../../components/CustomSelect";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import AppAutocomplete from "../../../../components/AppAutocomplete";
import { useLocale } from "../../../../hooks/useLocale";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { getAllOfficeApi } from "../../../../api/queries/getters";
import CashTypeToggle from "../../CashFlow/Contents/CashTypeToggle";
import { CURRENCY_OPTIONS } from "../../CashFlow/functions/cashFlowHelpers";

// Shared by AddOfficeTransactionModal / EditOfficeTransactionModal.
const OfficeTransactionFields = ({ control }) => {
  const { t, selectedLang } = useLocale();

  const { data: officesData } = useGet({ apiFn: getAllOfficeApi, key: "all-offices-filter" });

  const officeOptions = useMemo(
    () =>
      (Array.isArray(officesData) ? officesData : []).map((o) => ({
        label: selectedLang(o.shortName) || selectedLang(o.fullName) || "—",
        value: o.guid,
      })),
    [officesData, selectedLang],
  );

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12 }}>
        <AppAutocomplete
          name="office_guid"
          control={control}
          label={t("finance.officeCash.office")}
          options={officeOptions}
          required
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CashTypeToggle control={control} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomTextField name="amount" control={control} label={t("finance.amount")} type="number" required />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect name="currency" control={control} label={t("currency")} options={CURRENCY_OPTIONS} required />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CustomDatePicker name="datetime" control={control} label={t("finance.cashBook.date")} showTime required />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CustomTextField
          name="description"
          control={control}
          label={t("finance.cashBook.description")}
          multiline
          rows={3}
          required
        />
      </Grid>
    </Grid>
  );
};

export default OfficeTransactionFields;
