import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  TextField,
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputAdornment,
  Checkbox,
  Chip,
  OutlinedInput,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

const EMPLOYEES = [
  { id: "1", name: "Alex Rivard", initials: "AR", color: "#F59E0B" },
  { id: "2", name: "Amelie Chen", initials: "AC", color: "#EC4899" },
  { id: "3", name: "Kevin Taylor", initials: "KT", color: "#8B5CF6" },
  { id: "4", name: "David Wright", initials: "DW", color: "#10B981" },
  { id: "5", name: "Tom Cooper", initials: "TC", color: "#06B6D4" },
  { id: "6", name: "Jessica Wong", initials: "JW", color: "#F43F5E" },
  { id: "7", name: "Beth Young", initials: "BY", color: "#3B82F6" },
  { id: "8", name: "Mark White", initials: "MW", color: "#6366F1" },
];

export default function CreateTaskModal({ open, onClose, onCreateTask }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [todoList, setTodoList] = useState([]);
  const [newItemText, setNewItemText] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("To Do");
  const [dueDate, setDueDate] = useState("");

  const [errors, setErrors] = useState({});

  const handleAddTodoItem = () => {
    if (!newItemText.trim()) return;
    setTodoList([...todoList, { id: Date.now(), text: newItemText.trim(), done: false }]);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Task title is required";
    if (selectedEmployees.length === 0) newErrors.employees = "Assign at least one employee";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const assignedObjs = EMPLOYEES.filter((emp) => selectedEmployees.includes(emp.id));

    onCreateTask({
      id: `task-${title.toLowerCase().replace(/[^a-z0-9]/g, "")}-${selectedEmployees.join("") || "1"}`,
      title,
      description,
      todoList,
      assignees: assignedObjs,
      priority,
      status,
      dueDate: dueDate || "Jul 30",
    });

    handleReset();
    onClose();
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setTodoList([]);
    setNewItemText("");
    setIsAddingTodo(false);
    setSelectedEmployees([]);
    setPriority("Medium");
    setStatus("To Do");
    setDueDate("");
    setErrors({});
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        handleReset();
        onClose();
      }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          padding: "8px 12px",
          backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
          backgroundImage: "none",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 700,
          fontSize: "1.25rem",
          color: isDark ? "#F8FAFC" : "#0F172A",
          pb: 1,
        }}
      >
        Create Task
        <IconButton
          onClick={() => {
            handleReset();
            onClose();
          }}
          size="small"
          sx={{ color: isDark ? "#94A3B8" : "#64748B" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ py: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Task Title */}
            <Box>
              <Typography
                component="label"
                sx={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  mb: 0.8,
                  color: isDark ? "#E2E8F0" : "#334155",
                }}
              >
                Task Title <span style={{ color: "#EF4444" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter task title..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: null });
                }}
                error={Boolean(errors.title)}
                helperText={errors.title}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    bgcolor: isDark ? "#1E293B" : "#FFFFFF",
                  },
                }}
              />
            </Box>

            {/* Description & To-Do List side by side */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              {/* Description */}
              <Box>
                <Typography
                  component="label"
                  sx={{
                    display: "block",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    mb: 0.8,
                    color: isDark ? "#E2E8F0" : "#334155",
                  }}
                >
                  Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Enter task description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: isDark ? "#1E293B" : "#FFFFFF",
                    },
                  }}
                />
              </Box>

              {/* To-Do List */}
              <Box>
                <Typography
                  component="label"
                  sx={{
                    display: "block",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    mb: 0.8,
                    color: isDark ? "#E2E8F0" : "#334155",
                  }}
                >
                  To-Do List
                </Typography>
                <Box
                  sx={{
                    border: `1px solid ${isDark ? "#334155" : "#E2E8F0"}`,
                    borderRadius: "8px",
                    p: 1.5,
                    height: 124,
                    overflowY: "auto",
                    bgcolor: isDark ? "#1E293B" : "#FFFFFF",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {todoList.length === 0 && !isAddingTodo && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        pt: 0.5,
                      }}
                    >
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => setIsAddingTodo(true)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          color: "#2563EB",
                          p: 0,
                          "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                        }}
                      >
                        Add item
                      </Button>
                    </Box>
                  )}

                  {todoList.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 0.3,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Checkbox
                          size="small"
                          checked={item.done}
                          onChange={() => handleToggleTodo(item.id)}
                          sx={{ p: 0.5, color: "#2563EB" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: item.done ? "line-through" : "none",
                            color: item.done
                              ? isDark
                                ? "#64748B"
                                : "#94A3B8"
                              : isDark
                              ? "#F8FAFC"
                              : "#1E293B",
                            ml: 0.5,
                          }}
                        >
                          {item.text}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTodo(item.id)}
                        sx={{ p: 0.2 }}
                      >
                        <DeleteOutlineIcon fontSize="small" sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))}

                  {isAddingTodo && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                      <TextField
                        size="small"
                        autoFocus
                        placeholder="New item..."
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTodoItem();
                          }
                        }}
                        sx={{ flexGrow: 1 }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleAddTodoItem}
                        sx={{ bgcolor: "#2563EB" }}
                      >
                        Add
                      </Button>
                    </Box>
                  )}

                  {todoList.length > 0 && !isAddingTodo && (
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => setIsAddingTodo(true)}
                      size="small"
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        color: "#2563EB",
                        alignSelf: "flex-start",
                        mt: 1,
                        p: 0,
                      }}
                    >
                      Add item
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Assign Employee */}
            <Box>
              <Typography
                component="label"
                sx={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  mb: 0.8,
                  color: isDark ? "#E2E8F0" : "#334155",
                }}
              >
                Assign Employee <span style={{ color: "#EF4444" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={Boolean(errors.employees)}>
                <Select
                  multiple
                  displayEmpty
                  value={selectedEmployees}
                  onChange={(e) => {
                    setSelectedEmployees(e.target.value);
                    if (errors.employees) setErrors({ ...errors, employees: null });
                  }}
                  input={
                    <OutlinedInput
                      sx={{
                        borderRadius: "8px",
                        bgcolor: isDark ? "#1E293B" : "#FFFFFF",
                      }}
                    />
                  }
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return (
                        <Typography sx={{ color: isDark ? "#64748B" : "#94A3B8", fontSize: "0.875rem" }}>
                          Select employees...
                        </Typography>
                      );
                    }
                    return (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((val) => {
                          const emp = EMPLOYEES.find((e) => e.id === val);
                          return (
                            <Chip
                              key={val}
                              label={emp?.name || val}
                              size="small"
                              sx={{
                                height: 24,
                                bgcolor: "#EFF6FF",
                                color: "#2563EB",
                                fontWeight: 600,
                              }}
                            />
                          );
                        })}
                      </Box>
                    );
                  }}
                >
                  {EMPLOYEES.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      <Checkbox checked={selectedEmployees.indexOf(emp.id) > -1} size="small" />
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            bgcolor: emp.color,
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                          }}
                        >
                          {emp.initials}
                        </Box>
                        <Typography variant="body2">{emp.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.employees && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.employees}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Priority, Status, Due Date */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                gap: 2,
              }}
            >
              {/* Priority */}
              <Box>
                <Typography
                  component="label"
                  sx={{
                    display: "block",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    mb: 0.8,
                    color: isDark ? "#E2E8F0" : "#334155",
                  }}
                >
                  Priority
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    sx={{
                      borderRadius: "8px",
                      bgcolor: isDark ? "#1E293B" : "#FFFFFF",
                    }}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Status */}
              <Box>
                <Typography
                  component="label"
                  sx={{
                    display: "block",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    mb: 0.8,
                    color: isDark ? "#E2E8F0" : "#334155",
                  }}
                >
                  Status
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    sx={{
                      borderRadius: "8px",
                      bgcolor: isDark ? "#1E293B" : "#FFFFFF",
                    }}
                  >
                    <MenuItem value="To Do">To Do</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Due Date */}
              <Box>
                <Typography
                  component="label"
                  sx={{
                    display: "block",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    mb: 0.8,
                    color: isDark ? "#E2E8F0" : "#334155",
                  }}
                >
                  Due Date
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="дд.мм.гггг"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarTodayIcon sx={{ fontSize: 18, color: isDark ? "#64748B" : "#94A3B8" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: isDark ? "#1E293B" : "#FFFFFF",
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1.5 }}>
          <Button
            onClick={() => {
              handleReset();
              onClose();
            }}
            variant="outlined"
            sx={{
              borderColor: isDark ? "#475569" : "#CBD5E1",
              color: isDark ? "#CBD5E1" : "#475569",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 2.5,
              py: 0.8,
              "&:hover": {
                borderColor: isDark ? "#64748B" : "#94A3B8",
                bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disableElevation
            sx={{
              bgcolor: "#2563EB",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              py: 0.8,
              "&:hover": {
                bgcolor: "#1D4ED8",
              },
            }}
          >
            Create Task
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
