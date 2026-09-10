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
import { updateClientApi } from "../../../api/queries/patch";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import CustomDatePicker from "../../../components/CustomDatePicker";

const EditClient = ({ table, row, queryParams }) => {
  const { t } = useLocale();
  const { user } = useAuth();
  const isAdmin = Boolean(user?.role === "admin" || user?.user_is_admin || user?.isAdmin);

  const { clientValidShema } = useValidShema();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [prevRowKey, setPrevRowKey] = useState(null);

  const isVip = Boolean(row?.original?.vip);
  const canAccessFiles = isAdmin || !isVip;

  const currentRowKey = row?.original?.guid || null;
  if (currentRowKey !== prevRowKey) {
    setPrevRowKey(currentRowKey);
    if (!canAccessFiles) {
      setSelectedFiles([]);
    } else {
      const rawImages = row?.original?.images || row?.original?.attachments;
      let existingImages = [];
      if (Array.isArray(rawImages)) {
        existingImages = rawImages;
      } else if (typeof rawImages === "string" && rawImages.trim()) {
        try {
          const parsed = JSON.parse(rawImages);
          existingImages = Array.isArray(parsed) ? parsed : [rawImages];
        } catch {
          existingImages = [rawImages];
        }
      }
      setSelectedFiles(existingImages);
    }
  }

  const { mutate: updateClient, isPending } = useUpdate({
    apiFn: updateClientApi,
    key: ["clients", queryParams],
    idKey: "guid",
    onSuccessUpdate: () => {
      table.setEditingRow(null);
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      guid: row?.original?.guid || '',
      fullName: row?.original?.fullName || "",
      phone_number: row?.original?.phone_number || null,
      dateOfBirth: row?.original?.dateOfBirth || null,
      passport_number: row?.original?.passport_number || null,
      passportIssueDate: row?.original?.passportIssueDate || row?.original?.passport_issue_date || null,
      passportExpiryDate: row?.original?.passportExpiryDate || null,
      passportCountryOfIssue: row?.original?.passportCountryOfIssue || null,
      gender: row?.original?.gender || null,
      vip: Boolean(row?.original?.vip),
    },
    resolver: yupResolver(clientValidShema),
    mode: "onSubmit",
  });

  const closeDialog = () => {
    if (table) {
      table.setEditingRow(null);
    }
  };

  const submitHandler = async (data) => {
    try {
      const payload = {
        ...data,
        vip: isAdmin ? Boolean(data.vip) : Boolean(row?.original?.vip),
      };

      if (!canAccessFiles) {
        // When non-admin edits a VIP client, preserve original files and VIP status
        const preservedImages = Array.isArray(row?.original?.images)
          ? row.original.images
          : [];
        await updateClient({ ...payload, images: preservedImages, vip: true });
        return;
      }

      const rawFiles = selectedFiles.filter((f) => f instanceof File);
      if (rawFiles.length > 0) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            formData.append(key, value);
          }
        });
        rawFiles.forEach((file) => {
          formData.append("images", file);
        });

        await updateClient(formData);
      } else {
        await updateClient({ ...payload, images: selectedFiles });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CustomDialog widthX={700} open={true} close={closeDialog}>
      <CustomDialogHeader variant={"h5"} title={t("clients.edit")} />
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

          {/* Admin-only VIP Client Switch */}
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

          {/* Task-style File Upload - Hidden for non-admin when client is VIP */}
          {canAccessFiles && (
            <Grid size={{ xs: 12, sm: isAdmin ? 6 : 12 }}>
              <TaskFileUpload
                files={selectedFiles}
                onChange={setSelectedFiles}
                label={t("clients.documents", "Resminamalar / Suratlar")}
                maxFiles={10}
                disabled={isPending}
                isSubmitting={isPending}
                hideList
              />
            </Grid>
          )}

          {/* Task-style File List Previews - Hidden for non-admin when client is VIP */}
          {canAccessFiles && selectedFiles.length > 0 && (
            <Grid size={12}>
              <TaskFileList
                files={selectedFiles}
                onChange={setSelectedFiles}
                maxFiles={10}
                disabled={isPending}
                isSubmitting={isPending}
              />
            </Grid>
          )}
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
