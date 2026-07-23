import { Grid } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import CustomTextField from "../../../../components/CustomTextField";

const PackageFields = ({ control }) => {
  const { t } = useLocale();

  return (
    <Grid size={12}>
      <CustomTextField
        name="destinationCountry"
        control={control}
        label={t("outbound.destinationCountry") || "Ugur ýurdy"}
      />
    </Grid>
  );
};

export default PackageFields;
