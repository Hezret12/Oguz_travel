import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Grid } from "@mui/material";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import CustomTextField from "../../../components/CustomTextField";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { addTranslatorApi } from "../../../api/queries/post";
import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";

const AddTranslatorModal = ({ table, open, close }) => {
  const { t } = useLocale();
  const { addTranslator } = useValidShema();

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

  const { mutate: createTranslator, isPending } = useCreate({
    apiFn: addTranslatorApi,
    key: "translators",
    onSuccess: () => {
      reset();
      handleClose();
    },
  });

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(addTranslator),
    defaultValues: {
      fullName: "",
    },
    mode: "onTouched",
  });

  const onSubmit = (data) => {
    const payload = {
      fullName: data.fullName?.trim() || "",
    };
    createTranslator(payload);
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={480}>
      <CustomDialogHeader
        variant="h6"
        title={t("professionalTranslation.translator.addTranslator")}
      />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ px: 3, py: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                name="fullName"
                control={control}
                label={t("professionalTranslation.translator.fullName")}
                required
              />
            </Grid>
          </Grid>
        </Box>

        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddTranslatorModal;
