import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, Grid } from "@mui/material";

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
      onClose();
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

  useEffect(() => {
    if (task && open) {
      let currentAssignees = [];
      if (Array.isArray(task.empltaskAssignee) && task.empltaskAssignee.length > 0) {
        currentAssignees = task.empltaskAssignee
          .map((a) => a.assignee_guid || a.user?.guid || a.guid)
          .filter(Boolean);
      } else if (Array.isArray(task.emplTaskAssignee) && task.emplTaskAssignee.length > 0) {
        currentAssignees = task.emplTaskAssignee
          .map((a) => a.assignee_guid || a.user?.guid || a.guid)
          .filter(Boolean);
      } else if (Array.isArray(task.assignees) && task.assignees.length > 0) {
        currentAssignees = task.assignees.map((a) => a.id || a.guid || a.value).filter(Boolean);
      } else if (Array.isArray(task.assignee_guids)) {
        currentAssignees = task.assignee_guids;
      } else if (task.assignee_guid) {
        currentAssignees = Array.isArray(task.assignee_guid)
          ? task.assignee_guid
          : [task.assignee_guid];
      }

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
      { value: 1, label: t("task.statusToDo") },
      { value: 2, label: t("task.statusInProgress") },
      { value: 3, label: t("task.statusCompleted") },
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
      guid: task.guid || task.id,
      assignee_guids: selectedGuids,
      title: formData.title,
      description: formData.description || "",
      priority: formData.priority || "medium",
      status: Number(formData.status) || 1,
      due_date: formData.dueDate
        ? new Date(formData.dueDate).toISOString()
        : new Date().toISOString(),
    };

    try {
      await updateMutation.mutateAsync(payload);
    } catch (err) {
      console.warn("API updateTask error:", err);
      onClose();
    }
  };

  return (
    <CustomDialog open={open} close={onClose} widthX={580}>
      <CustomDialogHeader
        title={t("task.editTask", "Edit Task")}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8, pt: 0.5 }}>
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
            rows={3}
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

          <FooterButton
            onCancel={onClose}
            saveText={t("save", "Save")}
            cancelText={t("cancel", "Cancel")}
            type="submit"
            loading={updateMutation.isPending}
          />
        </Box>
      </form>
    </CustomDialog>
  );
}
