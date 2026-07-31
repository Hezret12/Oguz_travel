import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Checkbox,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

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


export default function CreateTaskModal({ open, onClose, onCreateTask }) {
  const { t, selectedLang } = useLocale();
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
      { value: "urgent", label: t("task.priorityUrgent", "Urgent") },
      { value: "high", label: t("task.priorityHigh", "High") },
      { value: "medium", label: t("task.priorityMedium", "Medium / Normal") },
      { value: "low", label: t("task.priorityLow", "Low") },
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

  const [todoList, setTodoList] = useState([]);
  const [newItemText, setNewItemText] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  const handleAddTodoItem = () => {
    if (!newItemText.trim()) return;
    setTodoList([
      ...todoList,
      { id: Date.now().toString(), text: newItemText.trim(), done: false },
    ]);
    setNewItemText("");
    setIsAddingTodo(false);
  };

  const handleToggleTodo = (id) => {
    setTodoList(
      todoList.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleDeleteTodo = (id) => {
    setTodoList(todoList.filter((item) => item.id !== id));
  };

  const handleCloseDialog = () => {
    reset();
    setTodoList([]);
    setNewItemText("");
    setIsAddingTodo(false);
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
      id: `task-${Date.now()}`,
      title: data.title,
      description: data.description,
      todoList,
      assignees,
      priority: data.priority || "Medium",
      status: data.status || "To Do",
      dueDate: data.dueDate || "Jul 30",
    });

    handleCloseDialog();
  };

  return (
    <CustomDialog open={open} close={handleCloseDialog} widthX={750}>
      <CustomDialogHeader variant="h5" title={t("task.createNewTask", "Create New Task")} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {/* Task Title */}
          <CustomTextField
            name="title"
            control={control}
            label={t("task.title", "Task Title")}
            placeholder={t("task.enterTitle", "Enter task title...")}
            required
            rules={{ required: t("validation.required", "Task title is required") }}
          />

          {/* Description & To-Do List side by side */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                name="description"
                control={control}
                label={t("columns.description", "Description")}
                placeholder={t("task.enterDescription", "Enter task description...")}
                multiline
                rows={4}
              />
            </Grid>

            {/* To-Do Checklist */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="body2"
                sx={{ mb: 0.75, fontWeight: 600, fontSize: "0.875rem" }}
              >
                {t("task.todoList", "To-Do List")}
              </Typography>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "7px",
                  p: 1.5,
                  height: 124,
                  overflowY: "auto",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "#ffffff",
                }}
              >
                {todoList.length === 0 && !isAddingTodo && (
                  <Typography variant="caption" color="text.secondary">
                    {t("task.noSubtasks", "No subtasks added yet.")}
                  </Typography>
                )}

                {todoList.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 0.2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Checkbox
                        size="small"
                        checked={item.done}
                        onChange={() => handleToggleTodo(item.id)}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.8125rem",
                          textDecoration: item.done ? "line-through" : "none",
                          color: item.done ? "text.disabled" : "text.primary",
                        }}
                      >
                        {item.text}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTodo(item.id)}
                    >
                      <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}

                {isAddingTodo && (
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                  >
                    <TextField
                      size="small"
                      autoFocus
                      placeholder={t("task.subtaskName", "Subtask name...")}
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTodoItem();
                        }
                      }}
                      sx={{ "& .MuiOutlinedInput-input": { py: 0.5 } }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleAddTodoItem}
                      sx={{ textTransform: "none" }}
                    >
                      {t("task.add", "Add")}
                    </Button>
                  </Box>
                )}
              </Box>

              {!isAddingTodo && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddingTodo(true)}
                  sx={{ mt: 1, textTransform: "none", fontSize: "0.8125rem" }}
                >
                  {t("task.addSubtask", "Add subtask")}
                </Button>
              )}
            </Grid>
          </Grid>

          {/* Form Controls: Assignee, Priority, Status, Due Date */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppAutocomplete
                name="assignee_guid"
                control={control}
                label={t("task.assignEmployee", "Assign Employee")}
                options={employeeOptions}
                placeholder={t("task.selectEmployee", "Select employee...")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomSelect
                name="priority"
                control={control}
                label={t("task.priority", "Priority")}
                options={priorityOptions}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomSelect
                name="status"
                control={control}
                label={t("columns.status", "Status")}
                options={statusOptions}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                name="dueDate"
                control={control}
                label={t("task.dueDate", "Due Date")}
                placeholder="Jul 30"
              />
            </Grid>
          </Grid>

          {/* Dialog Action Buttons */}
          <FooterButton
            onCancel={handleCloseDialog}
            saveText={t("task.createTask", "Create Task")}
            cancelText={t("cancel", "Cancel")}
            type="submit"
          />
        </Box>
      </form>
    </CustomDialog>
  );
}

