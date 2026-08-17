import { memo, useState, useCallback } from "react";
import {
  Grid,
  Box,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import CustomTextField from "../../../components/CustomTextField";
import AppUserAutocomplete from "../../../components/AppUserAutocomplete";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { addNotificationApi } from "../../../api/queries/post";
import { useValidShema } from "../../../functions/useValidShema";
import { useLocale } from "../../../hooks/useLocale";

const AddNotificationModal = ({ open, onClose }) => {
  const { t } = useLocale();
  const { addNotification } = useValidShema();
  const [isSendToAll, setIsSendToAll] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      assignee_guids: [],
      title: "",
      description: "",
    },
    resolver: yupResolver(addNotification),
    mode: "onSubmit",
  });

  const { mutateAsync: createNotification, isPending } = useCreate({
    apiFn: addNotificationApi,
    key: "notificationsPage",
    invalidateQueries: ["notifications", "notificationsPage"],
    onSuccess: () => {
      handleClose();
    },
  });

  const handleToggleSendToAll = useCallback(
    (e) => {
      const checked = e.target.checked;
      setIsSendToAll(checked);
      if (checked) {
        setValue("assignee_guids", true, { shouldValidate: true });
      } else {
        setValue("assignee_guids", [], { shouldValidate: true });
      }
    },
    [setValue],
  );

  const onSubmit = async (data) => {
    try {
      const payload = {
        assignee_guids: isSendToAll
          ? true
          : Array.isArray(data.assignee_guids)
            ? data.assignee_guids
            : [data.assignee_guids],
        title: data.title?.trim(),
        description: data.description?.trim(),
      };

      await createNotification(payload);
    } catch (err) {
      console.error("Add notification error:", err);
    }
  };

  const handleClose = () => {
    setIsSendToAll(false);
    reset({
      assignee_guids: [],
      title: "",
      description: "",
    });
    onClose?.();
  };

  return (
    <CustomDialog widthX={620} open={open} close={handleClose}>
      <CustomDialogHeader
        variant="h5"
        title={t("notifications.create")}
      />
      <CustomForm handleSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "text.primary",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span>{t("notifications.assignees")}</span>
                <Box
                  component="span"
                  sx={{
                    color: "#ef4444",
                    ml: "4px",
                    fontSize: "15px",
                    lineHeight: 1,
                  }}
                >
                  *
                </Box>
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={isSendToAll}
                    onChange={handleToggleSendToAll}
                    color="primary"
                  />
                }
                label={
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: isSendToAll ? "primary.main" : "text.secondary",
                      userSelect: "none",
                    }}
                  >
                    {t("notifications.sendToAll")}
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Box>

            {isSendToAll ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: "primary.main",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(20, 184, 166, 0.12)"
                      : "rgba(14, 133, 132, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                  {t("notifications.allUsersSelected")}
                </Typography>
              </Box>
            ) : (
              <AppUserAutocomplete
                name="assignee_guids"
                control={control}
                label={false}
                placeholder={t("notifications.selectUsers")}
                multiple
                required
              />
            )}
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomTextField
              name="title"
              control={control}
              label={t("notifications.title")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomTextField
              name="description"
              control={control}
              label={t("columns.description")}
              multiline
              rows={4}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
            <FooterButton
              loading={isPending || isSubmitting}
              onCancel={handleClose}
            />
          </Grid>
        </Grid>
      </CustomForm>
    </CustomDialog>
  );
};

export default memo(AddNotificationModal);
