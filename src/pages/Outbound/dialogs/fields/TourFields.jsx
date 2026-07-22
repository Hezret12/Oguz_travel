import { Grid } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import CustomTextField from "../../../../components/CustomTextField";

const TourFields = ({ control }) => {
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
      <Grid size={5}>
        <CustomTextField
          name="tourName"
          control={control}
          label={t("outbound.tourName") || "Tur ady"}
        />
      </Grid>
      <Grid size={3}>
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

export default TourFields;
