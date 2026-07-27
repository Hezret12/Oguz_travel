import { Grid } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import CustomTextField from "../../../../components/CustomTextField";
import CustomSelect from "../../../../components/CustomSelect";
import { TICKET_TYPE_OPTIONS, CAR_TYPE_OPTIONS } from "../../constants";

const TransferFields = ({ control }) => {
  const { t } = useLocale();

  return (
    <>
      <Grid size={6}>
        <CustomTextField
          name="destination_country"
          control={control}
          label={t("outbound.destinationCountry")}
        />
      </Grid>
      <Grid size={6}>
        <CustomSelect
          name="transfer_type"
          control={control}
          label={t("outbound.transferType") || "Transfer görnüşi"}
          options={TICKET_TYPE_OPTIONS}
        />
      </Grid>
      <Grid size={6}>
        <CustomTextField
          name="route"
          control={control}
          label={t("outbound.route")}
        />
      </Grid>
      <Grid size={6}>
        <CustomSelect
          name="machine_type"
          control={control}
          label={t("outbound.carType") || "Maşyn görnüşi"}
          options={CAR_TYPE_OPTIONS}
        />
      </Grid>
      <Grid size={4}>
        <CustomTextField
          name="guests_count"
          control={control}
          type="number"
          label={t("outbound.guestCount")}
        />
      </Grid>
    </>
  );
};

export default TransferFields;
