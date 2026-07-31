import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Chip,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

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
import { getAllEmployeeApi } from "../../api/queries/getters";
import CustomDatePicker from "../../components/CustomDatePicker";


export default function CreateTaskModal({ open, onClose, onCreateTask }) {
  const { t, selectedLang } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const dispatch = useDispatch();

  const { data: employeesData } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const employeeOptions = useMemo(() => {
    if (!Array.isArray(employeesData)) return [];
    return employeesData.map((emp) => {
      const posName = selectedLang(emp.position?.name) || emp.position_name || "";
      return {
        value: emp.guid || emp.id,
        label: `${emp.fullName}${posName ? ` (${posName})` : ""}`,
        name: emp.fullName,
        initials: emp.fullName?.slice(0, 2)?.toUpperCase() || "EM",
        color: "#0E8584",
      };
    });
  }, [employeesData, selectedLang]);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      assignee_guid: "",
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
    [t]
  );

  const statusOptions = useMemo(
    () => [
      { value: "todo", label: t("task.statusToDo", "To Do") },
      { value: "inprogress", label: t("task.statusInProgress", "In Progress") },
      { value: "completed", label: t("task.statusCompleted", "Completed") },
    ],
    [t]
  );

  const [attachments, setAttachments] = useState([]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newFiles = selectedFiles.map((file) => ({
      id: `file-${dayjs().valueOf()}-${Math.random().toString(36).substr(2, 5)}`,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      file,
    }));

    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (id) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCloseDialog = () => {
    reset();
    setAttachments([]);
    onClose();
  };

  const onSubmit = (data) => {
    const assignedEmp = employeeOptions.find(
      (emp) => emp.value === (data.assignee_guid || data.assignee_id)
    );
    const assignees = assignedEmp
      ? [
        {
          id: assignedEmp.value,
          name: assignedEmp.name,
          initials: assignedEmp.initials,
          color: assignedEmp.color,
        },
      ]
      : [
        {
          id: "1",
          name: "Alex Rivard",
          initials: "RI",
          color: "#F59E0B",
        },
      ];

    const now = dayjs();
    dispatch(
      addCustomNotification({
        id: `notif-task-${now.valueOf()}`,
        title: `Täze Ýumuş: ${data.title}`,
        description: `${assignedEmp ? assignedEmp.name : "Işgär"}-a täze ýumuş bellenildi: "${data.title}"`,
        sender: "Task Manager",
        senderRole: "System",
        avatarBg: "#6366F1",
        date: now.toISOString(),
        isRead: false,
        type: "task",
      })
    );

    onCreateTask({
      id: `task-${now.valueOf()}`,
      title: data.title,
      description: data.description,
      attachments,
      assignees,
      priority: data.priority || "medium",
      status: data.status || "todo",
      dueDate: data.dueDate || "",
    });

    handleCloseDialog();
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

          {/* Description & File Upload Side by Side */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                name="description"
                control={control}
                label={t("columns.description")}
                placeholder={t("task.enterDescription")}
                multiline
                rows={5.3}
              />
            </Grid>

            {/* Attachments / File Upload */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {t("task.attachments") || "Faýllar (Attachments)"}
                </Typography>
                {attachments.length > 0 && (
                  <Chip
                    label={`${attachments.length} faýl`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      backgroundColor: isDark ? "rgba(20, 184, 166, 0.2)" : "rgba(14, 133, 132, 0.12)",
                      color: isDark ? "#14B8A6" : "#0E8584",
                      borderRadius: "6px",
                    }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  border: "1.5px dashed",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(14, 133, 132, 0.3)",
                  borderRadius: "12px",
                  p: 1.5,
                  height: 160,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "#FAFAFA",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: isDark ? "#14B8A6" : "#0E8584",
                    bgcolor: isDark ? "rgba(20, 184, 166, 0.04)" : "rgba(14, 133, 132, 0.02)",
                  },
                }}
              >
                {/* Uploaded Files Scrollable List or Dropzone Empty State */}
                <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    pr: 0.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.75,
                    "&::-webkit-scrollbar": { width: "4px" },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
                      borderRadius: "4px",
                    },
                  }}
                >
                  {attachments.length === 0 ? (
                    <Box
                      component="label"
                      htmlFor="task-file-input"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        cursor: "pointer",
                        textAlign: "center",
                        py: 2,
                      }}
                    >
                      <CloudUploadOutlinedIcon
                        sx={{ fontSize: 32, color: isDark ? "#14B8A6" : "#0E8584", mb: 0.5 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                        {t("task.dragDropHint") || "Faýly saýlamak üçin basyň ýa-da süýräň"}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.72rem", mt: 0.25 }}>
                        PDF, DOCX, PNG, JPG (Max 10MB)
                      </Typography>
                    </Box>
                  ) : (
                    attachments.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          px: 1.25,
                          py: 0.6,
                          borderRadius: "8px",
                          backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                          border: "1px solid",
                          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, overflow: "hidden" }}>
                          <InsertDriveFileOutlinedIcon
                            sx={{ fontSize: 20, color: isDark ? "#14B8A6" : "#0E8584" }}
                          />
                          <Box sx={{ overflow: "hidden" }}>
                            <Typography variant="body2" noWrap sx={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                              {item.size}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFile(item.id)}
                          sx={{ p: 0.3 }}
                        >
                          <DeleteOutlinedIcon sx={{ fontSize: 16, color: "error.main" }} />
                        </IconButton>
                      </Box>
                    ))
                  )}
                </Box>

                {/* Bottom Add File Action (When files exist) */}
                {attachments.length > 0 && (
                  <Box
                    component="label"
                    htmlFor="task-file-input"
                    sx={{
                      pt: 0.75,
                      borderTop: "1px solid",
                      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      cursor: "pointer",
                      color: isDark ? "#14B8A6" : "#0E8584",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    <AddIcon fontSize="small" />
                    {t("task.addMoreFiles") || "Täze faýl goşmak..."}
                  </Box>
                )}

                {/* Hidden native file input */}
                <input
                  id="task-file-input"
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <AppAutocomplete
                name="assignee_guid"
                control={control}
                label={t("task.assignEmployee")}
                options={employeeOptions}
                placeholder={t("task.selectEmployee")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <CustomSelect
                name="priority"
                control={control}
                label={t("task.priority")}
                options={priorityOptions}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <CustomSelect
                name="status"
                control={control}
                label={t("columns.status")}
                options={statusOptions}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
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
          />
        </Box>
      </form>
    </CustomDialog>
  );
}

