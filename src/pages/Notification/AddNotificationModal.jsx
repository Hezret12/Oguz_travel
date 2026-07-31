import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import FooterButton from "../../components/Dialog/FooterButton";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import { useForm } from "react-hook-form";
import { Box, Stack } from "@mui/material";
import { useLocale } from "../../hooks/useLocale";

const TYPE_OPTIONS = [
  { label: "Bilet (Ticket)", value: "ticket" },
  { label: "Töleg (Payment)", value: "payment" },
  { label: "Tabşyryk (Task)", value: "task" },
  { label: "Terjime (Translation)", value: "translation" },
  { label: "Ulgam (System)", value: "system" },
];

const AddNotificationModal = ({ open, close, onAdd }) => {
  const { t } = useLocale();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      sender: "",
      senderRole: "Agent",
      type: "ticket",
    },
  });

  const onSubmit = (data) => {
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: data.title,
      description: data.description,
      sender: data.sender || "System Admin",
      senderRole: data.senderRole || "Admin",
      avatarBg:
        data.type === "ticket"
          ? "#0E8584"
          : data.type === "payment"
          ? "#10B981"
          : data.type === "task"
          ? "#6366F1"
          : data.type === "translation"
          ? "#F59E0B"
          : "#EC4899",
      date: new Date().toISOString(),
      isRead: false,
      type: data.type,
    };

    onAdd?.(newNotification);
    reset();
    close?.();
  };

  return (
    <CustomDialog open={open} close={close} widthX={550}>
      <CustomDialogHeader title={t("notifications.createNotification") || "Täze Bildiriş Döretmek"} />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <CustomTextField
            name="title"
            control={control}
            label={t("notifications.title") || "Bildiriş ady"}
            placeholder="Mes: Stambul reysine täze bilet sargydy..."
            required
          />

          <CustomTextField
            name="description"
            control={control}
            label={t("notifications.description") || "Bildiriş düşündirişi"}
            placeholder="Bildiriş barada giňişleýin maglumat..."
            multiline
            rows={3}
            required
          />

          <CustomSelect
            name="type"
            control={control}
            label={t("notifications.type") || "Bildiriş görnüşi (Type)"}
            options={TYPE_OPTIONS}
            required
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <CustomTextField
              name="sender"
              control={control}
              label={t("notifications.sender") || "Ugradan adam (Sender)"}
              placeholder="Mes: Merjen Atayeva"
              required
            />

            <CustomTextField
              name="senderRole"
              control={control}
              label={t("notifications.senderRole") || "Wezipesi (Role)"}
              placeholder="Mes: Agent, Manager, Finance..."
              required
            />
          </Stack>

          <FooterButton onCancel={close} saveText={t("save") || "Ýatda sakla"} />
        </Stack>
      </Box>
    </CustomDialog>
  );
};

export default AddNotificationModal;
