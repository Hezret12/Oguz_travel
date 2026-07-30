import { useState } from "react";
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

import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import FooterButton from "../../components/Dialog/FooterButton";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import AppAutocomplete from "../../components/AppAutocomplete";

const EMPLOYEES = [
  { value: "1", label: "Alex Rivard (RI)", color: "#F59E0B", initials: "RI", name: "Alex Rivard" },
  { value: "2", label: "Amelie Chen (AC)", color: "#EC4899", initials: "AC", name: "Amelie Chen" },
  { value: "3", label: "Kevin Taylor (KT)", color: "#8B5CF6", initials: "KT", name: "Kevin Taylor" },
  { value: "4", label: "David Wright (DW)", color: "#10B981", initials: "DW", name: "David Wright" },
  { value: "5", label: "Tom Cooper (TC)", color: "#06B6D4", initials: "TC", name: "Tom Cooper" },
  { value: "6", label: "Jessica Wong (JW)", color: "#F43F5E", initials: "JW", name: "Jessica Wong" },
  { value: "7", label: "Alice Green (AG)", color: "#A855F7", initials: "AG", name: "Alice Green" },
  { value: "8", label: "Mark White (MW)", color: "#F59E0B", initials: "MW", name: "Mark White" },
  { value: "9", label: "Beth Young (BY)", color: "#E11D48", initials: "BY", name: "Beth Young" },
];

const PRIORITY_OPTIONS = [
  { value: "Urgent", label: "Urgent" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium / Normal" },
  { value: "Low", label: "Low" },
];

const STATUS_OPTIONS = [
  { value: "To Do", label: "TO DO" },
  { value: "In Progress", label: "IN PROGRESS" },
  { value: "Completed", label: "COMPLETED" },
];

export default function CreateTaskModal({ open, onClose, onCreateTask }) {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      assignee_id: "",
      priority: "Medium",
      status: "To Do",
      dueDate: "Jul 30",
    },
  });

  const [todoList, setTodoList] = useState([]);
  const [newItemText, setNewItemText] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  const handleAddTodoItem = () => {
    if (!newItemText.trim()) return;
    setTodoList([
      ...todoList,
      { id: Date.now(), text: newItemText.trim(), done: false },
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
    const assignedEmp = EMPLOYEES.find((emp) => emp.value === data.assignee_id);
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
      <CustomDialogHeader variant="h5" title="Create New Task" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {/* Task Title */}
          <CustomTextField
            name="title"
            control={control}
            label="Task Title"
            placeholder="Enter task title..."
            required
            rules={{ required: "Task title is required" }}
          />

          {/* Description & To-Do List side by side */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                name="description"
                control={control}
                label="Description"
                placeholder="Enter task description..."
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
                To-Do List
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
                    No subtasks added yet.
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
                      placeholder="Subtask name..."
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
                      Add
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
                  Add subtask
                </Button>
              )}
            </Grid>
          </Grid>

          {/* Form Controls: Assignee, Priority, Status, Due Date */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppAutocomplete
                name="assignee_id"
                control={control}
                label="Assign Employee"
                options={EMPLOYEES}
                placeholder="Select employee..."
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomSelect
                name="priority"
                control={control}
                label="Priority"
                options={PRIORITY_OPTIONS}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomSelect
                name="status"
                control={control}
                label="Status"
                options={STATUS_OPTIONS}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                name="dueDate"
                control={control}
                label="Due Date"
                placeholder="Jul 30"
              />
            </Grid>
          </Grid>

          {/* Dialog Action Buttons */}
          <FooterButton
            onCancel={handleCloseDialog}
            saveText="Create Task"
            cancelText="Cancel"
            type="submit"
          />
        </Box>
      </form>
    </CustomDialog>
  );
}
