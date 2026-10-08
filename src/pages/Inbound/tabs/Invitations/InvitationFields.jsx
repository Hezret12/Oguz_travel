import { Grid } from "@mui/material";
import { useWatch } from "react-hook-form";
import { useLocale } from "../../../../hooks/useLocale";
import CustomTextField from "../../../../components/CustomTextField";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import { toCount } from "../../constants";

// Applications submitted is not typed in: the report form defines it as the sum.
const SubmittedTotal = ({ control }) => {
  const { t } = useLocale();
  const counts = useWatch({
    control,
    name: ["granted_count", "refused_count", "pending_count"],
  });
  const total = counts.reduce((sum, value) => sum + toCount(value), 0);

  return (
    <CustomTextField
      name="submitted_count"
      control={control}
      label={t("inbound.fields.submittedCount")}
      value={total}
      disabled
    />
  );
};

const InvitationFields = ({ control }) => {
  const { t } = useLocale();

  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid size={{ xs: 12, sm: 5 }}>
        <CustomDatePicker
          name="report_month"
          validateFormat
          control={control}
          label={t("inbound.fields.reportMonth")}
          views={["year", "month"]}
          format="MM.YYYY"
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 7 }}>
        <CustomTextField
          name="country"
          control={control}
          label={t("inbound.fields.country")}
          required
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomTextField
          name="granted_count"
          control={control}
          type="number"
          allowNegative={false}
          label={t("inbound.fields.grantedCount")}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomTextField
          name="refused_count"
          control={control}
          type="number"
          allowNegative={false}
          label={t("inbound.fields.refusedCount")}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomTextField
          name="pending_count"
          control={control}
          type="number"
          allowNegative={false}
          label={t("inbound.fields.pendingCount")}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <SubmittedTotal control={control} />
      </Grid>
      {/* Of those granted: not one of the three results, so not in the sum. */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomTextField
          name="not_arrived_count"
          control={control}
          type="number"
          allowNegative={false}
          label={t("inbound.fields.notArrivedCount")}
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

export default InvitationFields;
