import { Grid } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import CustomTextField from "../../../../components/CustomTextField";
import CustomSelect from "../../../../components/CustomSelect";
import { MEAL_PLAN_OPTIONS } from "../../constants";

const HotelFields = ({ control }) => {
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
        <CustomTextField
          name="hotelName"
          control={control}
          label={t("outbound.hotelName") || "Otel ady"}
        />
      </Grid>
      <Grid size={4}>
        <CustomTextField
          name="roomType"
          control={control}
          label={t("outbound.roomType") || "Otag görnüşi"}
        />
      </Grid>
      <Grid size={4}>
        <CustomSelect
          name="mealPlan"
          control={control}
          label={t("outbound.mealPlan") || "Iýmit"}
          options={MEAL_PLAN_OPTIONS}
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

export default HotelFields;
