import { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Grid, Alert } from "@mui/material";
import toast from "react-hot-toast";

import { useLocale } from "../../hooks/useLocale";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import FooterButton from "../../components/Dialog/FooterButton";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import AppAutocomplete from "../../components/AppAutocomplete";
import { useGet } from "../../hooks/CRUD/useGet";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { getAllUsersApi } from "../../api/queries/getters";
import { updateTaskApi } from "../../api/queries/patch";
import CustomDatePicker from "../../components/CustomDatePicker";
import TaskFileUpload from "../../components/inputs/TaskFileUpload";
import { handleError } from "../../functions/generalHelpers";

export default function EditTaskModal({ open, onClose, task }) {
  const { t } = useLocale();

  const { data: usersData } = useGet({
    apiFn: getAllUsersApi,
    key: "users",
  });

  const updateMutation = useUpdate({
    apiFn: updateTaskApi,
    key: "tasks",
    idKey: "guid",
    onSuccessUpdate: () => {
      toast.success(t("task.taskUpdatedSuccess"));
      handleCloseModal();
    },
    onError: (err) => {
      handleError(t("task.updateError"), err);
    },
  });

  const employeeOptions = useMemo(() => {
    const list = Array.isArray(usersData?.data?.data) ? usersData.data.data : [];

    return list.map((usr) => {
      const userGuid = usr?.guid;
      const emp = usr?.employee;
      const fullName =
        emp?.fullName ||
        usr?.fullName ||
        usr?.phone_number ||
        "User";

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

  const [prevTaskKey, setPrevTaskKey] = useState(null);
  const [attachments, setAttachments] = useState([]);

  const currentTaskKey = open && task ? task.guid : null;
  if (currentTaskKey !== prevTaskKey) {
    setPrevTaskKey(currentTaskKey);
    const existingImages = Array.isArray(task?.images)
      ? task.images
      : Array.isArray(task?.attachments)
      ? task.attachments
      : [];
    setAttachments(existingImages);
  }

  const handleCloseModal = () => {
    updateMutation.reset();
    setPrevTaskKey(null);
    onClose();
  };

  useEffect(() => {
    if (task && open) {
      const rawAssignees = Array.isArray(task.assignees)
        ? task.assignees
        : Array.isArray(task.empltaskAssignee)
        ? task.empltaskAssignee
        : [];

      const currentAssignees = rawAssignees
        .map((a) => a?.guid || a?.user?.guid || a?.assignee_guid || a?.id || a)
        .filter(Boolean);

      reset({
        title: task.title || "",
        description: task.description || "",
        assignee_guid: currentAssignees,
        priority: task.priority || "medium",
        status: Number(task.status) || 1,
        dueDate: task.due_date || task.dueDate || "",
      });
    }
  }, [task, open, reset]);

  const priorityOptions = useMemo(
    () => [
      { value: "urgent", label: t("task.priorityUrgent") },
      { value: "medium", label: t("task.priorityMedium") },
    ],
    [t]
  );

  const statusOptions = useMemo(
    () => [
      { value: 1, label: t("task.statusToDo"), color: "#64748B" },
      { value: 2, label: t("task.statusInProgress"), color: "#2563EB" },
      { value: 3, label: t("task.statusCompleted"), color: "#16A34A" },
    ],
    [t]
  );

  const onSubmit = async (formData) => {
    const selectedGuids = Array.isArray(formData.assignee_guid)
      ? formData.assignee_guid
      : formData.assignee_guid
        ? [formData.assignee_guid]
        : [];

    const payload = {
      guid: task.guid,
      assignee_guids: selectedGuids,
      title: formData.title,
      description: formData.description || "",
      priority: formData.priority || "medium",
      status: Number(formData.status) || 1,
      due_date: formData.dueDate
        ? new Date(formData.dueDate).toISOString()
        : new Date().toISOString(),
      images: attachments,
    };

    try {
      await updateMutation.mutateAsync(payload);
    } catch (err) {
      console.error("API updateTask error:", err);
    }
  };

  const isSubmitting = updateMutation.isPending;

  return (
    <CustomDialog open={open} close={handleCloseModal} widthX={600}>
      <CustomDialogHeader
        title={t("task.editTask", "Edit Task")}
        onClose={handleCloseModal}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8, pt: 0.5 }}>
          {/* Error Alert Display */}
          {updateMutation.isError && (
            <Alert
              severity="error"
              sx={{
                borderRadius: "10px",
                fontSize: "0.825rem",
                fontWeight: 500,
              }}
            >
              {updateMutation.error?.response?.data?.message ||
                updateMutation.error?.message ||
                t("task.updateError")}
            </Alert>
          )}

          <CustomTextField
            name="title"
            control={control}
            label={t("task.taskTitle")}
            placeholder={t("task.enterTaskTitle")}
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

            <Grid size={{ xs: 12, sm: 4, md: 4 }}>
              <CustomSelect
                name="priority"
                control={control}
                label={t("task.priority")}
                options={priorityOptions}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 4 }}>
              <CustomSelect
                name="status"
                control={control}
                label={t("columns.status")}
                options={statusOptions}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 4 }}>
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
          </Grid>

          <TaskFileUpload
            files={attachments}
            onChange={setAttachments}
            disabled={isSubmitting}
            isSubmitting={isSubmitting}
          />

          <FooterButton
            onCancel={handleCloseModal}
            saveText={t("save", "Save")}
            cancelText={t("cancel", "Cancel")}
            type="submit"
            loading={isSubmitting}
          />
        </Box>
      </form>
    </CustomDialog>
  );
}
