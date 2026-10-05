import { useMemo } from "react";
import { Grid } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import CustomTextField from "../../../../components/CustomTextField";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import CustomSelect from "../../../../components/CustomSelect";
import { getGenderOptions } from "../../constants";

const ArrivalFields = ({ control }) => {
  const { t } = useLocale();
  const genderOptions = useMemo(() => getGenderOptions(t), [t]);

  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid size={{ xs: 12, sm: 8 }}>
        <CustomTextField
          name="full_name"
          control={control}
          label={t("inbound.fields.fullName")}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          name="gender"
          control={control}
          label={t("columns.gender")}
          options={genderOptions}
          required
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomDatePicker
          name="birth_date"
          validateFormat
          disableFuture
          control={control}
          label={t("columns.dateOfBirth")}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomTextField
          name="passport_number"
          control={control}
          label={t("inbound.fields.passport")}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomTextField
          name="citizenship"
          control={control}
          label={t("inbound.fields.citizenship")}
          placeholder={t("inbound.placeholders.citizenship")}
          required
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomTextField
          name="invitation_number"
          control={control}
          label={t("inbound.fields.invitationNumber")}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomTextField
          name="voucher_number"
          control={control}
          label={t("inbound.fields.voucherNumber")}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomDatePicker
          name="entry_date"
          validateFormat
          control={control}
          label={t("inbound.fields.entryDate")}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomDatePicker
          name="exit_date"
          validateFormat
          control={control}
          label={t("inbound.fields.exitDate")}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomTextField
          name="entry_border"
          control={control}
          label={t("inbound.fields.entryBorder")}
          placeholder={t("inbound.placeholders.border")}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomTextField
          name="exit_border"
          control={control}
          label={t("inbound.fields.exitBorder")}
          placeholder={t("inbound.placeholders.border")}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CustomTextField
          name="note"
          control={control}
          label={t("columns.note")}
          multiline
          rows={2}
        />
      </Grid>
    </Grid>
  );
};

export default ArrivalFields;
