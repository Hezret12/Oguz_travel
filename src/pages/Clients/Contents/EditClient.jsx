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
import { updateClientApi } from "../../../api/queries/patch";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import CustomDatePicker from "../../../components/CustomDatePicker";

const EditClient = ({ table, row }) => {
  const { t } = useLocale();
  const { addClient } = useValidShema();

  const { mutate: updateClient, isPending } = useUpdate({
    apiFn: updateClientApi,
    key: "clients",
    idKey: "client_guid",
    onSuccessUpdate: () => {
      table.setEditingRow(null);
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      fullName: row?.original?.fullName || "",
      phone_number: row?.original?.phone_number || "",
      dateOfBirth: row?.original?.dateOfBirth || "",
      passport_number: row?.original?.passport_number || "",
      passportExpiryDate: row?.original?.passportExpiryDate || "",
      passportCountryOfIssue: row?.original?.passportCountryOfIssue || "",
      gender: row?.original?.gender || "",
    },
    resolver: yupResolver(addClient),
    mode: "onSubmit",
  });

  const closeDialog = () => {
    if (table) {
      table.setCreatingRow(null);
    }
  };

  const submitHandler = async (data) => {
    try {
      await updateClient(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CustomDialog widthX={700} open={true} close={closeDialog}>
      <CustomDialogHeader variant={"h5"} title={t("pages.clients.edit")} />
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
              name="passportNumber"
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
                { label: t("pages.clients.genderWomen"), value: "Women" },
                { label: t("pages.clients.genderMen"), value: "Men" },
              ]}
            />
          </Grid>
        </Grid>

        <FooterButton
          loading={isPending}
          onCancel={closeDialog}
          type="submit"
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditClient;
