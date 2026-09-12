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
import { updateTranslatorApi } from "../../../api/queries/patch";
import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";

const EditTranslatorModal = ({ table, row, open, close }) => {
  const { t } = useLocale();
  const { editTranslator } = useValidShema();

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

  const { mutate: updateTranslator, isPending } = useUpdate({
    apiFn: updateTranslatorApi,
    key: "translators",
    idKey: "guid",
    onSuccessUpdate: () => {
      handleClose();
    },
  });

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(editTranslator),
    defaultValues: {
      guid: "",
      fullName: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (row?.original && isModalOpen) {
      reset({
        guid: row.original.guid || "",
        fullName: row.original.fullName || "",
      });
    }
  }, [row?.original, isModalOpen, reset]);

  const onSubmit = (data) => {
    const payload = {
      guid: data.guid,
      fullName: data.fullName?.trim() || "",
    };
    updateTranslator(payload);
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={480}>
      <CustomDialogHeader
        variant="h6"
        title={t("professionalTranslation.translator.editTranslator")}
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

export default EditTranslatorModal;
