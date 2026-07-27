import { Grid } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import CustomTextField from "../../../../components/CustomTextField";

const PackageFields = ({ control }) => {
  const { t } = useLocale();

  return (
    <Grid size={6}>
      <CustomTextField
        name="destination_country"
        control={control}
        label={t("outbound.destinationCountry")}
      />
    </Grid>
  );
};

export default PackageFields;
