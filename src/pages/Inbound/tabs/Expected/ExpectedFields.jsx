import { Grid } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import CustomTextField from "../../../../components/CustomTextField";
import CustomDatePicker from "../../../../components/CustomDatePicker";

const ExpectedFields = ({ control }) => {
  const { t } = useLocale();

  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid size={{ xs: 12, sm: 8 }}>
        <CustomTextField
          name="country"
          control={control}
          label={t("inbound.fields.country")}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomTextField
          name="tourists_count"
          control={control}
          type="number"
          allowNegative={false}
          label={t("inbound.fields.touristsCount")}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomDatePicker
          name="start_date"
          validateFormat
          control={control}
          label={t("inbound.fields.tripStart")}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomDatePicker
          name="end_date"
          validateFormat
          control={control}
          label={t("inbound.fields.tripEnd")}
          required
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CustomTextField
          name="route"
          control={control}
          label={t("inbound.fields.route")}
          placeholder={t("inbound.placeholders.route")}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CustomTextField
          name="transport"
          control={control}
          label={t("inbound.fields.transport")}
          placeholder={t("inbound.placeholders.transport")}
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

export default ExpectedFields;
