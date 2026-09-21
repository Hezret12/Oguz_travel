import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Grid } from "@mui/material";

import { useLocale } from "../../hooks/useLocale";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import FooterButton from "../../components/Dialog/FooterButton";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import AppUserAutocomplete from "../../components/AppUserAutocomplete";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { addTaskApi } from "../../api/queries/post";
import CustomDatePicker from "../../components/CustomDatePicker";
import TaskFileUpload, { TaskFileList } from "../../components/inputs/TaskFileUpload";
import { useValidShema } from "../../functions/useValidShema";
import {
  TASK_STATUS_ITEMS,
  TASK_PRIORITY_ITEMS,
  DEFAULT_TASK_PRIORITY,
} from "./functions/taskMeta";

const datePickerSx = {
  "& .MuiPickersOutlinedInput-root, & .MuiOutlinedInput-root, & .MuiInputBase-root": {
    minHeight: "44px !important",
    height: "44px !important",
  },
  "& .MuiPickersInputBase-sectionsContainer, & .MuiInputBase-input": {
    paddingTop: "10px !important",
    paddingBottom: "10px !important",
  },
};

export default function CreateTaskModal({ open, onClose, onCreateTask }) {
  const { t } = useLocale();
  const { addTask } = useValidShema();

  const createMutation = useCreate({
    apiFn: addTaskApi,
    key: "tasks",
    invalidateQueries: ["tasks-board"],
    isPaginated: true,
    onSuccess: () => {
      onCreateTask?.();
      handleCloseDialog();
    },
  });

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(addTask),
    defaultValues: {
      title: "",
      description: "",
      assignee_guid: [],
      priority: DEFAULT_TASK_PRIORITY,
      status: TASK_STATUS_ITEMS[0].id,
      dueDate: "",
    },
  });

  const priorityOptions = useMemo(
    () =>
      TASK_PRIORITY_ITEMS.map((item) => ({
        value: item.value,
        label: t(item.labelKey),
      })),
    [t],
  );

  const statusOptions = useMemo(
    () =>
      TASK_STATUS_ITEMS.map((item) => ({
        value: item.id,
        label: t(item.labelKey),
      })),
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
      priority: data.priority || DEFAULT_TASK_PRIORITY,
      status: Number(data.status) || TASK_STATUS_ITEMS[0].id,
      // An empty due date means "no deadline" — never silently stamp today.
      due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
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

      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{ display: "flex", flexDirection: "column", gap: 1.8, pt: 0.5 }}
        >
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
                required
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
                inputSx={datePickerSx}
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

          <FooterButton
            onCancel={handleCloseDialog}
            type="submit"
            loading={isSubmitting}
          />
        </Box>
      </CustomForm>
    </CustomDialog>
  );
}
