import { memo } from "react";
import { Grid } from "@mui/material";
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

  const {
    control,
    handleSubmit,
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
      reset({
        assignee_guids: [],
        title: "",
        description: "",
      });
      onClose?.();
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        assignee_guids: Array.isArray(data.assignee_guids)
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
          {/* Target Users / Assignees Multi-Select */}
          <Grid size={{ xs: 12 }}>
            <AppUserAutocomplete
              name="assignee_guids"
              control={control}
              label={t("notifications.assignees")}
              placeholder={t("notifications.selectUsers")}
              multiple
              required
            />
          </Grid>

          {/* Notification Title */}
          <Grid size={{ xs: 12 }}>
            <CustomTextField
              name="title"
              control={control}
              label={t("notifications.title")}
              placeholder={t("notifications.titlePlaceholder")}
              required
            />
          </Grid>

          {/* Notification Description */}
          <Grid size={{ xs: 12 }}>
            <CustomTextField
              name="description"
              control={control}
              label={t("notifications.description")}
              placeholder={t("notifications.descPlaceholder")}
              multiline
              rows={4}
              required
            />
          </Grid>

          {/* Action Buttons */}
          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
            <FooterButton
              loading={isPending || isSubmitting}
              onCancel={handleClose}
              saveText={t("send")}
              cancelText={t("cancel")}
            />
          </Grid>
        </Grid>
      </CustomForm>
    </CustomDialog>
  );
};

export default memo(AddNotificationModal);
