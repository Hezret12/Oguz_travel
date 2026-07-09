import { useForm } from "react-hook-form";
import { Box } from "@mui/material";
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

const AddClient = ({ table }) => {
  const { t } = useLocale();
  const { addClient } = useValidShema();

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
      phone_number: "",
      dateOfBirth: "",
      passport_number: "",
      passportExpiryDate: "",
      passportCountryOfIssue: "",
      gender: "",
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
      await createClient(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CustomDialog widthX={700} open={true} close={closeDialog}>
      <CustomDialogHeader variant={"h5"} title={t("pages.clients.add")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Box>
          <Box>
            <CustomTextField
              name="fullName"
              control={control}
              label={t("columns.fullName")}
            />
          </Box>

          <Box>
            <PhoneNumberField
              control={control}
              name="phoneNumber"
              label={t("columns.phoneNumber")}
            />
          </Box>

          <Box>
            <CustomTextField
              name="dateOfBirth"
              control={control}
              type="date"
              label={t("columns.dateOfBirth")}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box>
            <CustomTextField
              name="passportNumber"
              control={control}
              label={t("columns.passportNumber")}
            />
          </Box>

          <Box>
            <CustomTextField
              name="passportExpiryDate"
              control={control}
              type="date"
              label={t("columns.passportExpiryDate")}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box>
            <CustomTextField
              name="passportCountryOfIssue"
              control={control}
              label={t("columns.passportCountryOfIssue")}
            />
          </Box>

          <Box sx={{ maxWidth: "50%" }}>
            <CustomSelect
              name="gender"
              control={control}
              label={t("columns.gender")}
              options={[
                { label: t("pages.clients.genderWomen"), value: "Women" },
                { label: t("pages.clients.genderMen"), value: "Men" },
              ]}
            />
          </Box>
        </Box>

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
