import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Grid, Box, Typography, IconButton, Paper, FormControlLabel, Switch } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale } from "../../../hooks/useLocale";
import { useAuth } from "../../../context/AuthContext";
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
  const isAdmin = user?.role === "admin" || user?.user_is_admin;

  const { clientValidShema } = useValidShema();
  const [selectedFiles, setSelectedFiles] = useState([]);

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const closeDialog = () => {
    if (table) {
      table.setEditingRow(null);
    }
  };

  const submitHandler = async (data) => {
    try {
      const payload = {
        ...data,
        vip: Boolean(data.vip),
      };

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            formData.append(key, value);
          }
        });
        selectedFiles.forEach((file) => {
          formData.append("images", file);
        });

        await updateClient(formData);
      } else {
        await updateClient(payload);
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
            <Grid size={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  px: 2,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 215, 0, 0.05)"
                      : "#FFFDF0",
                  borderColor: "#FFD700",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StarRoundedIcon sx={{ color: "#D97706", fontSize: 24 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#D97706" }}>
                      VIP Müşteri Statusı
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bu müşderini VIP hökmünde bellemek üçin açary açyň (Diňe Admin üçin)
                    </Typography>
                  </Box>
                </Box>
                <Controller
                  name="vip"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <FormControlLabel
                      control={
                        <Switch
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

          {/* Images File Upload Zone */}
          <Grid size={12}>
            <Typography
              variant="body2"
              sx={{ mb: 0.75, fontWeight: 600, color: "text.primary" }}
            >
              {t("clients.documents", "Resminamalar / Suratlar (images)")}
            </Typography>

            <Paper
              variant="outlined"
              component="label"
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                borderRadius: "10px",
                borderStyle: "dashed",
                borderColor: "divider",
                cursor: "pointer",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.02)"
                    : "#FAFAFA",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(37, 99, 235, 0.05)"
                      : "#EFF6FF",
                },
                transition: "all 0.2s ease",
                height: "44px",
              }}
            >
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <CloudUploadOutlinedIcon
                sx={{ color: "primary.main", fontSize: 22 }}
              />
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.85rem" }}
              >
                {t("uploadFile", "Faýl saýlaň (Suratlar / Resminamalar)")}
              </Typography>
            </Paper>

            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
                {selectedFiles.map((file, idx) => (
                  <Paper
                    key={`${file.name}-${idx}`}
                    variant="outlined"
                    sx={{
                      p: 1,
                      px: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderRadius: "10px",
                      borderColor: "primary.light",
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(37, 99, 235, 0.08)"
                          : "#EFF6FF",
                      height: "40px",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden" }}>
                      {file.type.startsWith("image/") ? (
                        <ImageIcon sx={{ color: "#10B981", fontSize: 20 }} />
                      ) : (
                        <InsertDriveFileIcon sx={{ color: "primary.main", fontSize: 20 }} />
                      )}
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ fontWeight: 500, fontSize: "0.85rem", maxWidth: "350px" }}
                      >
                        {file.name}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(idx)}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}
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
