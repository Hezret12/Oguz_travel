import { Grid } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import CustomTextField from "../../../../components/CustomTextField";
import CustomSelect from "../../../../components/CustomSelect";
import { TICKET_TYPE_OPTIONS, TRAIN_TYPE_OPTIONS } from "../../constants";

const RailwayFields = ({ control }) => {
  const { t } = useLocale();

  return (
    <>
      <Grid size={6}>
        <CustomTextField
          name="ticket_number"
          control={control}
          label={t("outbound.ticketNumber")}
        />
      </Grid>
      <Grid size={6}>
        <CustomSelect
          name="ticket_type"
          control={control}
          label={t("outbound.ticketType")}
          options={TICKET_TYPE_OPTIONS}
        />
      </Grid>
      <Grid size={6}>
        <CustomSelect
          name="train_type"
          control={control}
          label={t("outbound.trainType")}
          options={TRAIN_TYPE_OPTIONS}
        />
      </Grid>
      <Grid size={4}>
        <CustomTextField
          name="destination_country"
          control={control}
          label={t("outbound.destinationCountry")}
        />
      </Grid>
      <Grid size={4}>
        <CustomTextField
          name="route"
          control={control}
          label={t("outbound.route")}
        />
      </Grid>
      <Grid size={4}>
        <CustomTextField
          name="passenger_count"
          control={control}
          type="number"
          label={t("outbound.guestCount")}
        />
      </Grid>
    </>
  );
};

export default RailwayFields;
