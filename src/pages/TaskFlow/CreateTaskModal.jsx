import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Box, Grid } from "@mui/material";

import { useLocale } from "../../hooks/useLocale";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import FooterButton from "../../components/Dialog/FooterButton";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import AppAutocomplete from "../../components/AppAutocomplete";
import { useDispatch } from "react-redux";
import { addCustomNotification } from "../../store/slices/notificationSlice";
import dayjs from "dayjs";
import { useGet } from "../../hooks/CRUD/useGet";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { getAllUsersApi } from "../../api/queries/getters";
import { addTaskApi } from "../../api/queries/post";
import CustomDatePicker from "../../components/CustomDatePicker";
import toast from "react-hot-toast";

export default function CreateTaskModal({ open, onClose, onCreateTask }) {
  const { t } = useLocale();
  const dispatch = useDispatch();

  const { data: usersData } = useGet({
    apiFn: getAllUsersApi,
    key: "users",
  });

  const createMutation = useCreate({
    apiFn: addTaskApi,
    key: "tasks",
    onSuccess: () => {
      toast.success(t("task.addSuccess"));
      handleCloseDialog();
    },
  });

  const employeeOptions = useMemo(() => {
    const list = Array.isArray(usersData)
      ? usersData
      : Array.isArray(usersData?.data)
        ? usersData.data
        : Array.isArray(usersData?.data?.data)
          ? usersData.data.data
          : [];

    return list.map((usr) => {
      const emp = usr?.employee || usr;
      const assigneeGuid = usr?.employee_guid || emp?.guid || usr?.guid;
      const fullName = emp?.fullName || usr?.fullName || emp?.phone_number || usr?.phone_number || "User";
      return {
        value: assigneeGuid,
        userGuid: usr?.guid,
        employeeGuid: usr?.employee_guid || emp?.guid,
        label: fullName,
        name: fullName,
        initials: fullName.slice(0, 2).toUpperCase(),
        color: "#0E8584",
      };
    });
  }, [usersData]);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      assignee_guid: [],
      priority: "medium",
      status: "todo",
      dueDate: "",
    },
  });

  const priorityOptions = useMemo(
    () => [
      { value: "urgent", label: t("task.priorityUrgent") },
      { value: "medium", label: t("task.priorityMedium") },
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      { value: 1, label: t("task.statusToDo") },
      { value: 2, label: t("task.statusInProgress") },
      { value: 3, label: t("task.statusCompleted") },
    ],
    [t],
  );

  const [attachments, setAttachments] = useState([]);

  const handleCloseDialog = () => {
    reset();
    setAttachments([]);
    onClose();
  };

  const onSubmit = async (data) => {
    const selectedGuids = Array.isArray(data.assignee_guid)
      ? data.assignee_guid
      : data.assignee_guid
        ? [data.assignee_guid]
        : [];

    const assignedEmps = employeeOptions.filter(
      (emp) =>
        selectedGuids.includes(emp.value) ||
        selectedGuids.includes(emp.userGuid) ||
        selectedGuids.includes(emp.employeeGuid),
    );

    const assignees = assignedEmps.map((emp) => ({
      id: emp.value,
      name: emp.name,
      initials: emp.initials,
      color: emp.color,
    }));

    const assignedNames = assignedEmps.map((e) => e.name).join(", ");

    const now = dayjs();
    dispatch(
      addCustomNotification({
        id: `notif-task-${now.valueOf()}`,
        title: `Täze Ýumuş: ${data.title}`,
        description: `${assignedNames || "Işgär"}-a täze ýumuş bellenildi: "${data.title}"`,
        sender: "Task Manager",
        senderRole: "System",
        avatarBg: "#6366F1",
        date: now.toISOString(),
        isRead: false,
        type: "task",
      }),
    );

    onCreateTask?.({
      id: `task-${now.valueOf()}`,
      title: data.title,
      description: data.description,
      attachments,
      assignees,
      priority: data.priority || "medium",
      status: data.status || null,
      dueDate: data.dueDate || "",
    });

    const payload = {
      assignee_guid: selectedGuids.length === 1 ? selectedGuids[0] : selectedGuids,
      assignee_guids: selectedGuids,
      title: data.title,
      description: data.description || "",
      priority: data.priority || "medium",
      status: data.status || null,
      due_date: data.dueDate
        ? new Date(data.dueDate).toISOString()
        : new Date().toISOString(),
    };

    try {
      await createMutation.mutateAsync(payload);
    } catch (err) {
      console.warn("API addTask fallback to local state:", err);
      handleCloseDialog();
    }
  };

  return (
    <CustomDialog open={open} close={handleCloseDialog} widthX={720}>
      <CustomDialogHeader
        title={t("task.createTask")}
        onClose={handleCloseDialog}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {/* Title */}
          <CustomTextField
            name="title"
            control={control}
            label={t("task.taskTitle")}
            placeholder={t("task.enterTaskTitle")}
            required
          />

          <CustomTextField
            name="description"
            control={control}
            label={t("columns.description")}
            placeholder={t("task.enterDescription")}
            multiline
            rows={5.3}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <AppAutocomplete
                name="assignee_guid"
                control={control}
                label={t("task.assignEmployee")}
                options={employeeOptions}
                placeholder={t("task.selectEmployee")}
                multiple
                maxChips={3}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 4 }}>
              <CustomSelect
                name="priority"
                control={control}
                label={t("task.priority")}
                options={priorityOptions}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 4 }}>
              <CustomSelect
                name="status"
                control={control}
                label={t("columns.status")}
                options={statusOptions}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 4 }}>
              <CustomDatePicker
                name="dueDate"
                control={control}
                label={t("task.dueDate")}
              />
            </Grid>
          </Grid>

          {/* Dialog Action Buttons */}
          <FooterButton
            onCancel={handleCloseDialog}
            saveText={t("task.createTask")}
            cancelText={t("cancel")}
            type="submit"
            loading={createMutation.isPending}
          />
        </Box>
      </form>
    </CustomDialog>
  );
}
