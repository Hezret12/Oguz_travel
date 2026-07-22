import { Grid } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import CustomTextField from "../../../../components/CustomTextField";
import CustomSelect from "../../../../components/CustomSelect";
import { TICKET_TYPE_OPTIONS, TRAIN_TYPE_OPTIONS } from "../../constants";

const RailwayFields = ({ control }) => {
  const { t } = useLocale();

  return (
    <>
      <Grid size={4}>
        <CustomTextField
          name="ticketNumber"
          control={control}
          label={t("outbound.ticketNumber") || "Bilet belgisi"}
        />
      </Grid>
      <Grid size={4}>
        <CustomSelect
          name="ticketType"
          control={control}
          label={t("outbound.ticketType") || "Bilet görnüşi"}
          options={TICKET_TYPE_OPTIONS}
        />
      </Grid>
      <Grid size={4}>
        <CustomTextField
          name="destinationCountry"
          control={control}
          label={t("outbound.destinationCountry") || "Ugur ýurdy"}
        />
      </Grid>
      <Grid size={5}>
        <CustomTextField
          name="route"
          control={control}
          label={t("outbound.route") || "Ugur"}
        />
      </Grid>
      <Grid size={4}>
        <CustomSelect
          name="trainType"
          control={control}
          label={t("outbound.trainType") || "Otly görnüşi"}
          options={TRAIN_TYPE_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <CustomTextField
          name="quantity"
          control={control}
          type="number"
          label={t("outbound.quantity") || "Sany"}
        />
      </Grid>
    </>
  );
};

export default RailwayFields;
