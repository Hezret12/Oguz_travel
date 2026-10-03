import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Grid } from "@mui/material";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import CustomTextField from "../../../components/CustomTextField";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { addCategoryApi } from "../../../api/queries/post";
import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";

const AddCategoryModal = ({ table, open, close }) => {
  const { t } = useLocale();
  const { addCategory } = useValidShema();

  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && table.getState().creatingRow);

  const handleClose = () => {
    if (table) {
      table.setCreatingRow(null);
    }
    reset();
    close?.();
  };

  const { mutate: createCategory, isPending } = useCreate({
    apiFn: addCategoryApi,
    key: "categories",
    onSuccess: () => {
      reset();
      handleClose();
    },
  });

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(addCategory),
    defaultValues: {
      name_tk: "",
      name_ru: "",
      name_en: "",
    },
    mode: "onTouched",
  });

  const onSubmit = (data) => {
    const tkName = data.name_tk?.trim() || "";
    const payload = {
      name: {
        tk: tkName,
        ru: data.name_ru?.trim() || tkName,
        en: data.name_en?.trim() || tkName,
      },
    };
    createCategory(payload);
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={520}>
      <CustomDialogHeader
        variant="h6"
        title={t("professionalTranslation.category.addCategory")}
      />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ px: 3, py: 2 }}>
          <Grid container spacing={2}>
            {/* Türkmençe */}
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                name="name_tk"
                control={control}
                label={t("professionalTranslation.category.nameTk")}
                required
              />
            </Grid>

            {/* Русский */}
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                name="name_ru"
                control={control}
                label={t("professionalTranslation.category.nameRu")}
              />
            </Grid>

            {/* English */}
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                name="name_en"
                control={control}
                label={t("professionalTranslation.category.nameEn")}
              />
            </Grid>
          </Grid>
        </Box>

        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddCategoryModal;
