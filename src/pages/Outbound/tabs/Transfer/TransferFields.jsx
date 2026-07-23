import { Grid } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import CustomTextField from "../../../../components/CustomTextField";
import CustomSelect from "../../../../components/CustomSelect";
import { TICKET_TYPE_OPTIONS, CAR_TYPE_OPTIONS } from "../../constants";

const TransferFields = ({ control }) => {
  const { t } = useLocale();

  return (
    <>
      <Grid size={4}>
        <CustomTextField
          name="destinationCountry"
          control={control}
          label={t("outbound.destinationCountry") || "Ugur ýurdy"}
        />
      </Grid>
      <Grid size={4}>
        <CustomSelect
          name="transferType"
          control={control}
          label={t("outbound.transferType") || "Transfer görnüşi"}
          options={TICKET_TYPE_OPTIONS}
        />
      </Grid>
      <Grid size={4}>
        <CustomSelect
          name="carType"
          control={control}
          label={t("outbound.carType") || "Maşyn görnüşi"}
          options={CAR_TYPE_OPTIONS}
        />
      </Grid>
      <Grid size={8}>
        <CustomTextField
          name="route"
          control={control}
          label={t("outbound.route") || "Ugur"}
        />
      </Grid>
      <Grid size={4}>
        <CustomTextField
          name="guestCount"
          control={control}
          type="number"
          label={t("outbound.guestCount") || "Myhmanlaryň sany"}
        />
      </Grid>
    </>
  );
};

export default TransferFields;
