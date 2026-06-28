import { useState } from "react";
import { useForm } from "react-hook-form";
import { Box } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale } from "../../../hooks/useLocale";
import { useValidSchema } from "../../../functions/useValidShema";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import PhoneNumberField from "../../../components/inputs/PhoneNumber";
import toast from "react-hot-toast";

const AddClient = ({ table, onCreate }) => {
  const { t } = useLocale();
  const { addClient } = useValidSchema();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      dateOfBirth: "",
      passportId: "",
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
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (typeof onCreate === "function") {
        onCreate(data);
      }

      toast.success(t("clients.addSuccess") ?? "Client added successfully!");
      reset();
      closeDialog();
    } catch (error) {
      console.error(error);
      toast.error(t("clients.addError") ?? "An error occurred while saving client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog widthX={820} open={true} close={closeDialog}>
      <CustomDialogHeader
        variant={"h5"}
        title={t("clients.add") ?? "Add Client"}
      />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Box
          sx={{
            mt: 3,
            display: "flex",
            flexWrap: "wrap",
            gap: 2.5,
          }}
        >
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomTextField
              name="fullName"
              control={control}
              label={t("clients.columns.fullName") ?? "Full Name"}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <PhoneNumberField
              control={control}
              name="phoneNumber"
              label={t("clients.columns.phoneNumber") ?? "Phone Number"}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomTextField
              name="dateOfBirth"
              control={control}
              type="date"
              label={t("clients.columns.dateOfBirth") ?? "Date of Birth"}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomTextField
              name="passportId"
              control={control}
              label={t("clients.columns.passportId") ?? "Passport ID"}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomTextField
              name="passportExpiryDate"
              control={control}
              type="date"
              label={t("clients.columns.passportExpiryDate") ?? "Passport Expiry Date"}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomTextField
              name="passportCountryOfIssue"
              control={control}
              label={t("clients.columns.passportCountryOfIssue") ?? "Passport Country of Issue"}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomSelect
              name="gender"
              control={control}
              label={t("clients.columns.gender") ?? "Gender"}
              options={[
                { label: t("clients.genderWomen") ?? "Women", value: "Women" },
                { label: t("clients.genderMen") ?? "Men", value: "Men" },
              ]}
            />
          </Box>
        </Box>

        <FooterButton loading={loading} onCancel={closeDialog} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddClient;
