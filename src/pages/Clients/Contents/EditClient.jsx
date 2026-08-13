import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Grid, Box, Typography, IconButton, Paper, FormControlLabel, Switch } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
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
  const isAdmin = Boolean(user?.role === "admin" || user?.user_is_admin || user?.isAdmin);

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
        vip: isAdmin ? Boolean(data.vip) : Boolean(row?.original?.vip),
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 1,
                  px: 2,
                  borderRadius: "10px",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(0, 0, 0, 0.02)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    VIP Müşteri
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (Diňe Admin üçin)
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
              </Box>
            </Grid>
          )}

          {/* Images File Upload Zone */}
          <Grid size={12}>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
            >
              {t("clients.documents", "Resminamalar / Suratlar (images)")}
            </Typography>

            <Paper
              variant="outlined"
              component="label"
              sx={{
                py: 2.5,
                px: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                borderRadius: "12px",
                borderStyle: "dashed",
                borderWidth: 1.5,
                borderColor: (theme) =>
                  theme.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
                cursor: "pointer",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.015)"
                    : "#FAFBFD",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(37, 99, 235, 0.06)"
                      : "rgba(37, 99, 235, 0.03)",
                  "& .upload-icon": {
                    transform: "scale(1.1)",
                    color: "primary.main",
                  },
                },
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <Box
                className="upload-icon"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(37, 99, 235, 0.15)"
                      : "rgba(37, 99, 235, 0.08)",
                  color: "primary.main",
                  transition: "all 0.2s ease",
                }}
              >
                <CloudUploadOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                  {t("uploadFileClick", "Faýllary saýlamak üçin basyň")}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.25, display: "block" }}>
                  PNG, JPG, PDF, DOC, XLS
                </Typography>
              </Box>
            </Paper>

            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
                {selectedFiles.map((file, idx) => {
                  const isImage = file.type.startsWith("image/");
                  const fileSizeKb = (file.size / 1024).toFixed(1);
                  return (
                    <Paper
                      key={`${file.name}-${idx}`}
                      variant="outlined"
                      sx={{
                        p: 1.25,
                        px: 1.75,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderRadius: "10px",
                        borderColor: "divider",
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.03)"
                            : "#F9FAFB",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: "primary.light",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, overflow: "hidden" }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: isImage
                              ? "rgba(16, 185, 129, 0.1)"
                              : "rgba(37, 99, 235, 0.1)",
                            color: isImage ? "#10B981" : "primary.main",
                            flexShrink: 0,
                          }}
                        >
                          {isImage ? (
                            <ImageIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <InsertDriveFileIcon sx={{ fontSize: 18 }} />
                          )}
                        </Box>
                        <Box sx={{ overflow: "hidden" }}>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ fontWeight: 600, fontSize: "0.85rem", maxWidth: "340px" }}
                          >
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fileSizeKb} KB
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(idx)}
                        sx={{
                          color: "text.secondary",
                          borderRadius: "6px",
                          "&:hover": {
                            color: "error.main",
                            bgcolor: "rgba(239, 68, 68, 0.08)",
                          },
                        }}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  );
                })}
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
