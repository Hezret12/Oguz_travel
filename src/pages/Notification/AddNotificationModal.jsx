import { useMemo } from "react";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import FooterButton from "../../components/Dialog/FooterButton";
import CustomTextField from "../../components/CustomTextField";
import AppAutocomplete from "../../components/AppAutocomplete";
import { useForm } from "react-hook-form";
import { Box, Stack } from "@mui/material";
import { useLocale } from "../../hooks/useLocale";
import dayjs from "dayjs";
import { useGet } from "../../hooks/CRUD/useGet";
import { getAllEmployeeApi } from "../../api/queries/getters";
import CustomSelect from "../../components/CustomSelect";

const TYPE_OPTIONS = [
  { label: "Tabşyryk (Task)", value: "task" },
  { label: "Kommentariýa (Comment)", value: "comment" },
];

const AddNotificationModal = ({ open, close, onAdd }) => {
  const { t, selectedLang } = useLocale();

  const { data: employeesData } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const employeeOptions = useMemo(() => {
    if (!Array.isArray(employeesData)) return [];
    return employeesData.map((emp) => {
      const posName =
        selectedLang(emp.position?.name) || emp.position_name || "";
      const deptName = selectedLang(emp.department?.name) || "";
      return {
        label: `${emp.fullName}${posName ? ` — ${posName}` : ""}${deptName ? ` (${deptName})` : ""}`,
        value: emp.guid || emp.id,
        raw: emp,
      };
    });
  }, [employeesData, selectedLang]);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      recipient_guids: [],
      type: "task",
      sender: "System Admin",
      senderRole: "Admin",
    },
  });

  const onSubmit = (data) => {
    const now = dayjs();
    const selectedEmps = employeeOptions.filter((opt) =>
      data.recipient_guids?.includes(opt.value),
    );

    const recipientNames =
      selectedEmps.length > 0
        ? selectedEmps.map((opt) => opt.raw.fullName).join(", ")
        : "Ähli Işgärler";

    const newNotification = {
      id: `notif-${now.valueOf()}`,
      title: data.title,
      description: `${data.description}${
        selectedEmps.length > 0 ? ` (Ugradyldy: ${recipientNames})` : ""
      }`,
      sender: data.sender || "System Admin",
      senderRole: data.senderRole || "Admin",
      recipientGuids: data.recipient_guids,
      recipientNames: recipientNames,
      avatarBg: data.type === "comment" ? "#10B981" : "#6366F1",
      date: now.toISOString(),
      isRead: false,
      type: data.type || "task",
    };

    onAdd?.(newNotification);
    reset();
    close?.();
  };

  return (
    <CustomDialog open={open} close={close} widthX={600}>
      <CustomDialogHeader variant={"h6"} title={t("notifications.createNotification")} />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          <AppAutocomplete
            name="recipient_guids"
            control={control}
            label={t("notifications.selectRecipients")}
            options={employeeOptions}
            multiple={true}
            required
          />

          <CustomTextField
            name="title"
            control={control}
            label={t("notifications.title")}
            required
          />

          <CustomTextField
            name="description"
            control={control}
            label={t("notifications.description")}
            multiline
            rows={3}
            required
          />

          <CustomSelect
            name="type"
            control={control}
            label={t("notifications.typeFilter") || "Görnüşi (Type)"}
            options={TYPE_OPTIONS}
            required
          />

          <FooterButton onCancel={close} saveText={t("save")} />
        </Stack>
      </Box>
    </CustomDialog>
  );
};

export default AddNotificationModal;
