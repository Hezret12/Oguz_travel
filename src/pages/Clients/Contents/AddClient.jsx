import { useForm } from "react-hook-form";
import { Grid } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import PhoneNumberField from "../../../components/inputs/PhoneNumber";
import { addClientsApi } from "../../../api/queries/post";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import CustomDatePicker from "../../../components/CustomDatePicker";

const AddClient = ({ table }) => {
  const { t } = useLocale();
  const { clientValidShema } = useValidShema();

  const { mutate: createClient, isLoading } = useCreate({
    apiFn: addClientsApi,
    key: "clients",
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      fullName: "",
      phone_number: null,
      dateOfBirth: null,
      passport_number: null,
      passportExpiryDate: null,
      passportCountryOfIssue: null,
      gender: null,
    },
    resolver: yupResolver(clientValidShema),
    mode: "onSubmit",
  });

  const closeDialog = () => {
    if (table) {
      table.setCreatingRow(null);
    }
  };

  const submitHandler = async (data) => {
    try {
      await createClient(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CustomDialog widthX={700} open={true} close={closeDialog}>
      <CustomDialogHeader variant={"h5"} title={t("clients.add")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Grid container spacing={2}>
          <Grid size={6}>
            <CustomTextField
              name="fullName"
              control={control}
              label={t("columns.fullName")}
            />
          </Grid>

          <Grid size={6}>
            <PhoneNumberField
              control={control}
              name="phone_number"
              label={t("columns.phoneNumber")}
            />
          </Grid>
          <Grid size={6}>
            <CustomDatePicker
              name="dateOfBirth"
              control={control}
              label={t("columns.dateOfBirth")}
            />
          </Grid>
          <Grid size={6}>
            <CustomTextField
              name="passport_number"
              control={control}
              label={t("columns.passportNumber")}
            />
          </Grid>

          <Grid size={6}>
            <CustomDatePicker
              name="passportExpiryDate"
              control={control}
              label={t("columns.passportExpiryDate")}
            />
          </Grid>

          <Grid size={6}>
            <CustomTextField
              name="passportCountryOfIssue"
              control={control}
              label={t("columns.passportCountryOfIssue")}
            />
          </Grid>

          <Grid size={6}>
            <CustomSelect
              name="gender"
              control={control}
              label={t("columns.gender")}
              options={[
                { label: t("pages.clients.genderWomen"), value: "Female" },
                { label: t("pages.clients.genderMen"), value: "Male" },
              ]}
            />
          </Grid>
        </Grid>

        <FooterButton
          loading={isLoading}
          onCancel={closeDialog}
          type="submit"
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddClient;
