import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box } from "@mui/material";
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
    // Referral letters show the country name from their cached relation.
    invalidateQueries: ["referralLetters"],
    onSuccessUpdate: handleClose,
  });

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(editReferralCountry),
    defaultValues: { guid: "", name: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    if (row?.original && isModalOpen) {
      reset({
        guid: row.original.guid || "",
        name: row.original.name?.tk || "",
      });
    }
  }, [row?.original, isModalOpen, reset]);

  // The name is Turkmen only; the backend stores a plain string under every language.
  const onSubmit = (data) => {
    updateCountry({ guid: data.guid, name: data.name.trim() });
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={460}>
      <CustomDialogHeader variant="h6" title={t("professionalTranslation.referralCountry.edit")} />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ px: 3, py: 2 }}>
          <CustomTextField
            name="name"
            control={control}
            label={t("professionalTranslation.referralCountry.name")}
            required
          />
        </Box>

        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditReferralCountryModal;
