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
import { updateOfficeApi } from "../../../api/queries/patch";
import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";

const EditOfficeModal = ({ table, row, open, close }) => {
  const { t } = useLocale();
  const { editOffice } = useValidShema();

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

  const { mutate: updateOffice, isPending } = useUpdate({
    apiFn: updateOfficeApi,
    key: "office",
    idKey: "guid",
    onSuccessUpdate: () => {
      handleClose();
    },
  });

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(editOffice),
    defaultValues: {
      guid: "",
      fullName_tk: "",
      fullName_ru: "",
      fullName_en: "",
      shortName_tk: "",
      shortName_ru: "",
      shortName_en: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (row?.original && isModalOpen) {
      reset({
        guid: row.original.guid || "",
        fullName_tk: row.original.fullName?.tk || "",
        fullName_ru: row.original.fullName?.ru || "",
        fullName_en: row.original.fullName?.en || "",
        shortName_tk: row.original.shortName?.tk || "",
        shortName_ru: row.original.shortName?.ru || "",
        shortName_en: row.original.shortName?.en || "",
      });
    }
  }, [row?.original, isModalOpen, reset]);

  const onSubmit = (data) => {
    const tkFull = data.fullName_tk?.trim() || "";
    const payload = {
      guid: data.guid,
      fullName: {
        tk: tkFull,
        ru: data.fullName_ru?.trim() || tkFull,
        en: data.fullName_en?.trim() || tkFull,
      },
      shortName: {
        tk: data.shortName_tk?.trim() || "",
        ru: data.shortName_ru?.trim() || "",
        en: data.shortName_en?.trim() || "",
      },
    };
    updateOffice(payload);
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={600}>
      <CustomDialogHeader
        variant="h6"
        title={t("professionalTranslation.office.editOffice")}
      />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ px: 3, py: 2 }}>
          <Grid container spacing={2}>
            {/* Türkmençe */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <CustomTextField
                name="fullName_tk"
                control={control}
                label={t("professionalTranslation.office.fullNameTk")}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                name="shortName_tk"
                control={control}
                label={t("professionalTranslation.office.shortNameTk")}
              />
            </Grid>

            {/* Русский */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <CustomTextField
                name="fullName_ru"
                control={control}
                label={t("professionalTranslation.office.fullNameRu")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                name="shortName_ru"
                control={control}
                label={t("professionalTranslation.office.shortNameRu")}
              />
            </Grid>

            {/* English */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <CustomTextField
                name="fullName_en"
                control={control}
                label={t("professionalTranslation.office.fullNameEn")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                name="shortName_en"
                control={control}
                label={t("professionalTranslation.office.shortNameEn")}
              />
            </Grid>
          </Grid>
        </Box>

        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditOfficeModal;
