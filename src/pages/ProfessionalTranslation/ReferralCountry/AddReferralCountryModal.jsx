import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Grid } from "@mui/material";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import CustomTextField from "../../../components/CustomTextField";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { addReferralCountryApi } from "../../../api/queries/post";
import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";

const AddReferralCountryModal = ({ table, open, close }) => {
  const { t } = useLocale();
  const { addReferralCountry } = useValidShema();

  const isModalOpen =
    open !== undefined ? Boolean(open) : Boolean(table && table.getState().creatingRow);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(addReferralCountry),
    defaultValues: { name_tk: "", name_ru: "", name_en: "" },
    mode: "onTouched",
  });

  const handleClose = () => {
    if (table) {
      table.setCreatingRow(null);
    }
    reset();
    close?.();
  };

  const { mutate: createCountry, isPending } = useCreate({
    apiFn: addReferralCountryApi,
    key: "referralCountries",
    onSuccess: handleClose,
  });

  // Empty RU/EN names fall back to the TK one.
  const onSubmit = (data) => {
    const tkName = data.name_tk?.trim() || "";
    createCountry({
      name: {
        tk: tkName,
        ru: data.name_ru?.trim() || tkName,
        en: data.name_en?.trim() || tkName,
      },
    });
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={520}>
      <CustomDialogHeader variant="h6" title={t("professionalTranslation.referralCountry.add")} />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ px: 3, py: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                name="name_tk"
                control={control}
                label={t("professionalTranslation.referralCountry.nameTk")}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                name="name_ru"
                control={control}
                label={t("professionalTranslation.referralCountry.nameRu")}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                name="name_en"
                control={control}
                label={t("professionalTranslation.referralCountry.nameEn")}
              />
            </Grid>
          </Grid>
        </Box>

        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddReferralCountryModal;
