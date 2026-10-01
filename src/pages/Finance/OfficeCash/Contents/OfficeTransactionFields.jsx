import { useMemo } from "react";
import { useController, useWatch } from "react-hook-form";
import { Grid } from "@mui/material";
import CustomTextField from "../../../../components/CustomTextField";
import CurrencyAmount from "../../../../components/inputs/CurrencyAmount";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import AppAutocomplete from "../../../../components/AppAutocomplete";
import { useLocale } from "../../../../hooks/useLocale";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { getAllOfficeApi } from "../../../../api/queries/getters";
import CashTypeToggle from "../../CashFlow/Contents/CashTypeToggle";

// Shared by AddOfficeTransactionModal / EditOfficeTransactionModal.
const OfficeTransactionFields = ({ control }) => {
  const { t, selectedLang } = useLocale();
  // The currency picker lives inside the amount field (CurrencyAmount).
  const { field: currencyField } = useController({ name: "currency", control });
  const [type, amount, profit] = useWatch({ control, name: ["type", "amount", "profit"] });
  const isIncome = type === "INCOME";

  // Income: Çykdajy (money paid out) = price − profit, shown read-only.
  const price = parseFloat(amount);
  const profitValue = parseFloat(profit);
  const expense =
    isIncome && Number.isFinite(price) && Number.isFinite(profitValue)
      ? String(Math.round((price - profitValue) * 100) / 100)
      : "";

  const { data: officesData } = useGet({ apiFn: getAllOfficeApi, key: "all-offices-filter" });

  const officeOptions = useMemo(
    () =>
      (Array.isArray(officesData) ? officesData : []).map((o) => ({
        label: selectedLang(o.fullName) || selectedLang(o.shortName) || "—",
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
        <CurrencyAmount
          name="amount"
          control={control}
          label={isIncome ? t("finance.officeCash.price") : t("finance.amount")}
          currency={currencyField.value}
          onCurrencyChange={currencyField.onChange}
          allowNegative={false}
          placeholder=""
          required
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomDatePicker name="datetime" control={control} label={t("finance.cashBook.date")} showTime required />
      </Grid>

      {isIncome && (
        <>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CurrencyAmount
              name="profit"
              control={control}
              label={t("finance.profit")}
              currency={currencyField.value}
              onCurrencyChange={currencyField.onChange}
              allowNegative={false}
              placeholder=""
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CurrencyAmount
              label={t("finance.expense")}
              value={expense}
              currency={currencyField.value}
              placeholder=""
              disabled
            />
          </Grid>
        </>
      )}

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
