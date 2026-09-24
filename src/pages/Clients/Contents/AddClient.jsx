import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Grid, Box, Typography, Paper, FormControlLabel, Switch } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import TaskFileUpload, { TaskFileList } from "../../../components/inputs/TaskFileUpload";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale } from "../../../hooks/useLocale";
import { useAuth } from "../../../context/useAuth";
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
  const { user } = useAuth();
  const isAdmin = Boolean(user?.role === "admin" || user?.user_is_admin || user?.isAdmin);

  const { clientValidShema } = useValidShema();
  const [selectedFiles, setSelectedFiles] = useState([]);

  const { mutate: createClient, isLoading } = useCreate({
    apiFn: addClientsApi,
    key: "clients",
    // The list is paginated server side, so the new record is fetched back
    // rather than pushed into the cached page (which would leave a wrong count).
    isPaginated: true,
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
      passportIssueDate: null,
      passportExpiryDate: null,
      passportCountryOfIssue: null,
      gender: null,
      vip: false,
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
      const payload = {
        ...data,
        vip: isAdmin ? Boolean(data.vip) : false,
      };

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            formData.append(key, value);
          }
        });
        selectedFiles.forEach((file) => {
          if (file instanceof File) {
            formData.append("images", file);
          }
        });

        await createClient(formData);
      } else {
        await createClient(payload);
      }
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
              name="passportIssueDate"
              control={control}
              label={t("columns.passportIssueDate")}
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
                { label: t("clients.genderWomen"), value: "Female" },
                { label: t("clients.genderMen"), value: "Male" },
              ]}
            />
          </Grid>

          {isAdmin && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.75,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "text.primary",
                  }}
                >
                  VIP Müşteri
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("onlyAdmin", "Diňe Admin üçin")}
                </Typography>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  minHeight: "44px",
                  height: "44px",
                  borderRadius: "7px",
                  px: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                  borderColor: "divider",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.02)"
                      : "rgba(0, 0, 0, 0.015)",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    borderColor: "warning.main",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StarRoundedIcon sx={{ fontSize: 20, color: "warning.main" }} />
                  <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: 500, color: "text.primary" }}>
                    VIP Status
                  </Typography>
                </Box>
                <Controller
                  name="vip"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={Boolean(value)}
                          onChange={(e) => onChange(e.target.checked)}
                          color="warning"
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                    />
                  )}
                />
              </Paper>
            </Grid>
          )}

          {/* Task-style File Upload */}
          <Grid size={{ xs: 12, sm: isAdmin ? 6 : 12 }}>
            <TaskFileUpload
              files={selectedFiles}
              onChange={setSelectedFiles}
              label={t("clients.documents", "Resminamalar / Suratlar")}
              maxFiles={10}
              hideList
            />
          </Grid>

          {/* Task-style File List Previews */}
          {selectedFiles.length > 0 && (
            <Grid size={12}>
              <TaskFileList
                files={selectedFiles}
                onChange={setSelectedFiles}
                maxFiles={10}
              />
            </Grid>
          )}
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
