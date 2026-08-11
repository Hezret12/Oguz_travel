import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Box, Grid } from "@mui/material";
import toast from "react-hot-toast";

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
import TaskFileUpload, { TaskFileList } from "../../components/inputs/TaskFileUpload";
import { handleError } from "../../functions/generalHelpers";

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
      toast.success(
        t("task.taskCreatedSuccess"),
      );
      handleCloseDialog();
    },
    onError: (err) => {
      handleError(
        t("task.createError"),
        err,
      );
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
      const userGuid = usr?.guid;
      const emp = usr?.employee;
      const fullName =
        emp?.fullName || usr?.fullName || usr?.phone_number || "User";

      return {
        value: userGuid,
        userGuid: userGuid,
        employeeGuid: usr?.employee_guid || emp?.guid,
        label: fullName,
        name: fullName,
        initials: (fullName || "User").slice(0, 2).toUpperCase(),
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
      status: 1,
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
      { value: 1, label: t("task.statusToDo"), color: "#64748B" },
      { value: 2, label: t("task.statusInProgress"), color: "#2563EB" },
      { value: 3, label: t("task.statusCompleted"), color: "#16A34A" },
    ],
    [t],
  );

  const [attachments, setAttachments] = useState([]);

  const handleCloseDialog = () => {
    reset();
    setAttachments([]);
    createMutation.reset();
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

    const numericStatus =
      Number(data.status) ||
      (String(data.status).toLowerCase().includes("todo")
        ? 1
        : String(data.status).toLowerCase().includes("progress")
          ? 2
          : String(data.status).toLowerCase().includes("complet")
            ? 3
            : 1);

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
      status: numericStatus,
      dueDate: data.dueDate || "",
    });

    const payload = {
      assignee_guids: selectedGuids,
      title: data.title,
      description: data.description || "",
      priority: data.priority || "medium",
      status: numericStatus,
      due_date: data.dueDate
        ? new Date(data.dueDate).toISOString()
        : new Date().toISOString(),
      images: attachments,
    };

    try {
      await createMutation.mutateAsync(payload);
    } catch (err) {
      console.error("API addTask mutation error:", err);
    }
  };

  const isSubmitting = createMutation.isPending;

  return (
    <CustomDialog open={open} close={handleCloseDialog} widthX={650}>
      <CustomDialogHeader
        title={t("task.createTask")}
        onClose={handleCloseDialog}
        variant={"h6"}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{ display: "flex", flexDirection: "column", gap: 1.8, pt: 0.5 }}
        >
  
          {/* Title */}
          <CustomTextField
            name="title"
            control={control}
            label={t("task.taskTitle")}
            disabled={isSubmitting}
            required
          />

          <CustomTextField
            name="description"
            control={control}
            label={t("columns.description")}
            placeholder={t("task.enterDescription")}
            multiline
            rows={3}
            disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomSelect
                name="priority"
                control={control}
                label={t("task.priority")}
                options={priorityOptions}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomSelect
                name="status"
                control={control}
                label={t("columns.status")}
                options={statusOptions}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomDatePicker
                name="dueDate"
                control={control}
                label={t("task.dueDate")}
                disabled={isSubmitting}
                inputSx={{
                  "& .MuiPickersOutlinedInput-root, & .MuiOutlinedInput-root, & .MuiInputBase-root": {
                    minHeight: "44px !important",
                    height: "44px !important",
                  },
                  "& .MuiPickersInputBase-sectionsContainer, & .MuiInputBase-input": {
                    paddingTop: "10px !important",
                    paddingBottom: "10px !important",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TaskFileUpload
                files={attachments}
                onChange={setAttachments}
                disabled={isSubmitting}
                isSubmitting={isSubmitting}
                hideList
              />
            </Grid>

            {attachments.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <TaskFileList
                  files={attachments}
                  onChange={setAttachments}
                  disabled={isSubmitting}
                  isSubmitting={isSubmitting}
                />
              </Grid>
            )}
          </Grid>

          {/* Dialog Action Buttons */}
          <FooterButton
            onCancel={handleCloseDialog}
            type="submit"
            loading={isSubmitting}
          />
        </Box>
      </form>
    </CustomDialog>
  );
}
