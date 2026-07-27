import { Grid } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import CustomTextField from "../../../../components/CustomTextField";

const TourFields = ({ control }) => {
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
        <CustomTextField
          name="tour_name"
          control={control}
          label={t("outbound.tourName")}
        />
      </Grid>
      <Grid size={6}>
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

export default TourFields;
