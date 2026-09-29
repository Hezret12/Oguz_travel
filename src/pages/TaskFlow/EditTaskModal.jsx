import { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQueryClient } from "@tanstack/react-query";
import { Box, Grid } from "@mui/material";

import { useLocale } from "../../hooks/useLocale";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import FooterButton from "../../components/Dialog/FooterButton";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import AppUserAutocomplete from "../../components/AppUserAutocomplete";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { updateTaskApi } from "../../api/queries/patch";
import TaskFileUpload, { TaskFileList } from "../../components/inputs/TaskFileUpload";
import { useValidShema } from "../../functions/useValidShema";
import TaskWindowFields from "./Contents/TaskWindowFields";
import {
  TASK_STATUS_ITEMS,
  TASK_PRIORITY_ITEMS,
  DEFAULT_TASK_PRIORITY,
  toSelectablePriority,
  getTaskAssignees,
  getAssigneeUserGuid,
  getTaskAssigneeGuids,
  getTaskAttachments,
  getTaskStart,
  getTaskEnd,
  toIsoOrNull,
} from "./functions/taskMeta";
import { patchTaskInBoardCache } from "./functions/taskBoardCache";

export default function EditTaskModal({ open, onClose, task }) {
  const { t } = useLocale();
  const { editTask } = useValidShema();
  const queryClient = useQueryClient();

  const updateMutation = useUpdate({
    apiFn: updateTaskApi,
    key: "tasks",
    isPaginated: true,
    idKey: "guid",
    // The board card is patched (or moved, if the status changed) in place instead of
    // refetching every loaded board page.
    onSuccessUpdate: (updatedTask) => {
      if (updatedTask?.guid) patchTaskInBoardCache(queryClient, updatedTask.guid, updatedTask);
      handleCloseModal();
    },
  });

  const initialUserOptions = useMemo(() => {
    if (!task) return [];

    return getTaskAssignees(task)
      .map((a) => {
        const usr = a?.user || a;
        const emp = usr?.employee || a?.employee;
        const userGuid = getAssigneeUserGuid(a);
        const fullName =
          emp?.fullName ||
          usr?.fullName ||
          usr?.username ||
          usr?.phone_number ||
          a?.name ||
          "";

        return {
          value: userGuid,
          userGuid: userGuid,
          label: fullName,
          name: fullName,
        };
      })
      .filter((opt) => Boolean(opt.value));
  }, [task]);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(editTask),
    defaultValues: {
      title: "",
      description: "",
      assignee_guid: [],
      priority: DEFAULT_TASK_PRIORITY,
      status: TASK_STATUS_ITEMS[0].id,
      startDate: null,
      endDate: null,
    },
  });

  const [prevTaskKey, setPrevTaskKey] = useState(null);
  const [attachments, setAttachments] = useState([]);

  const currentTaskKey = open && task ? task.guid : null;
  if (currentTaskKey !== prevTaskKey) {
    setPrevTaskKey(currentTaskKey);
    setAttachments(getTaskAttachments(task));
  }

  const handleCloseModal = () => {
    updateMutation.reset();
    setPrevTaskKey(null);
    onClose();
  };

  useEffect(() => {
    if (task && open) {
      reset({
        title: task.title || "",
        description: task.description || "",
        assignee_guid: getTaskAssigneeGuids(task),
        priority: toSelectablePriority(task.priority),
        status: Number(task.status) || TASK_STATUS_ITEMS[0].id,
        startDate: getTaskStart(task),
        endDate: getTaskEnd(task),
      });
    }
  }, [task, open, reset]);

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

  const onSubmit = (formData) => {
    const selectedGuids = Array.isArray(formData.assignee_guid)
      ? formData.assignee_guid
      : formData.assignee_guid
        ? [formData.assignee_guid]
        : [];

    const payload = {
      guid: task.guid,
      assignee_guids: selectedGuids,
      title: formData.title?.trim() || "",
      description: formData.description?.trim() || "",
      priority: formData.priority || DEFAULT_TASK_PRIORITY,
      status: Number(formData.status) || TASK_STATUS_ITEMS[0].id,
      // A cleared field clears that side of the window; the backend mirrors end_date into due_date.
      start_date: toIsoOrNull(formData.startDate),
      end_date: toIsoOrNull(formData.endDate),
      images: attachments,
    };

    updateMutation.mutate(payload);
  };

  const isSubmitting = updateMutation.isPending;

  return (
    <CustomDialog open={open} close={handleCloseModal} widthX={650}>
      <CustomDialogHeader
        title={t("task.editTask")}
        onClose={handleCloseModal}
      />

      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8, pt: 0.5 }}>
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
                initialOptions={initialUserOptions}
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

            <TaskWindowFields control={control} disabled={isSubmitting} />

            <Grid size={{ xs: 12 }}>
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
            onCancel={handleCloseModal}
            type="submit"
            loading={isSubmitting}
          />
        </Box>
      </CustomForm>
    </CustomDialog>
  );
}
