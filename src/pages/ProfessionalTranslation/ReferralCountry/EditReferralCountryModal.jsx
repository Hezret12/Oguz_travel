import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Grid } from "@mui/material";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import CustomTextField from "../../../components/CustomTextField";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { updateReferralCountryApi } from "../../../api/queries/patch";
import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";

const EditReferralCountryModal = ({ table, row, open, close }) => {
  const { t } = useLocale();
  const { editReferralCountry } = useValidShema();

  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && table.getState().editingRow?.id === row?.id);

  const handleClose = () => {
    if (table) {
      table.setEditingRow(null);
    }
    close?.();
  };

  const { mutate: updateCountry, isPending } = useUpdate({
    apiFn: updateReferralCountryApi,
    key: "referralCountries",
    idKey: "guid",
    onSuccessUpdate: handleClose,
  });

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(editReferralCountry),
    defaultValues: { guid: "", name_tk: "", name_ru: "", name_en: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    if (row?.original && isModalOpen) {
      reset({
        guid: row.original.guid || "",
        name_tk: row.original.name?.tk || "",
        name_ru: row.original.name?.ru || "",
        name_en: row.original.name?.en || "",
      });
    }
  }, [row?.original, isModalOpen, reset]);

  // Empty RU/EN names fall back to the TK one.
  const onSubmit = (data) => {
    const tkName = data.name_tk?.trim() || "";
    updateCountry({
      guid: data.guid,
      name: {
        tk: tkName,
        ru: data.name_ru?.trim() || tkName,
        en: data.name_en?.trim() || tkName,
      },
    });
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={520}>
      <CustomDialogHeader variant="h6" title={t("professionalTranslation.referralCountry.edit")} />
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

export default EditReferralCountryModal;
