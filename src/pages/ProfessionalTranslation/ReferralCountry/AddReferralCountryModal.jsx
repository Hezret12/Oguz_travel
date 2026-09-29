import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box } from "@mui/material";
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
    defaultValues: { name: "" },
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

  // The name is Turkmen only; the backend stores a plain string under every language.
  const onSubmit = (data) => {
    createCountry({ name: data.name.trim() });
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={460}>
      <CustomDialogHeader variant="h6" title={t("professionalTranslation.referralCountry.add")} />
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

export default AddReferralCountryModal;
