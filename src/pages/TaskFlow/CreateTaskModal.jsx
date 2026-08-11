import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Box, Grid } from "@mui/material";

import { useLocale } from "../../hooks/useLocale";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import FooterButton from "../../components/Dialog/FooterButton";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import AppUserAutocomplete from "../../components/AppUserAutocomplete";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { addTaskApi } from "../../api/queries/post";
import CustomDatePicker from "../../components/CustomDatePicker";
import TaskFileUpload, { TaskFileList } from "../../components/inputs/TaskFileUpload";

export default function CreateTaskModal({ open, onClose, onCreateTask }) {
  const { t } = useLocale();

  const createMutation = useCreate({
    apiFn: addTaskApi,
    key: "tasks",
    onSuccess: () => {
      onCreateTask?.();
      handleCloseDialog();
    },
  });

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

  const onSubmit = (data) => {
    const selectedGuids = Array.isArray(data.assignee_guid)
      ? data.assignee_guid
      : data.assignee_guid
        ? [data.assignee_guid]
        : [];

    const payload = {
      assignee_guids: selectedGuids,
      title: data.title?.trim() || "",
      description: data.description?.trim() || "",
      priority: data.priority || "medium",
      status: Number(data.status) || 1,
      due_date: data.dueDate
        ? new Date(data.dueDate).toISOString()
        : new Date().toISOString(),
      images: attachments,
    };

    createMutation.mutate(payload);
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
            multiline
            rows={3}
            disabled={isSubmitting}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <AppUserAutocomplete
                name="assignee_guid"
                control={control}
                label={t("task.assignEmployee")}
                multiple
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
                label={t("notifications.endDate")}
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
