import { memo, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  AvatarGroup,
  Grid,
  Card,
  CardContent,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useLocale } from "../../../hooks/useLocale";

const getPriorityBadgeProps = (priority) => {
  switch (priority) {
    case "Urgent":
      return { bg: "#FEE2E2", color: "#DC2626" };
    case "High":
      return { bg: "#FFEDD5", color: "#EA580C" };
    case "Medium":
      return { bg: "#DBEAFE", color: "#2563EB" };
    case "Low":
      return { bg: "#F1F5F9", color: "#475569" };
    default:
      return { bg: "#F1F5F9", color: "#475569" };
  }
};

function TaskBoardView({
  tasks = [],
  columns = [],
  onMoveTaskStatus,
  onDeleteTask,
  onOpenCreateModal,
}) {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [activeTaskMenu, setActiveTaskMenu] = useState(null);
  const [taskMenuAnchor, setTaskMenuAnchor] = useState(null);

  const handleMenuClose = () => {
    setTaskMenuAnchor(null);
    setActiveTaskMenu(null);
  };

  const getPriorityLabel = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return t("task.priorityUrgent", "Urgent");
      case "high":
        return t("task.priorityHigh", "High");
      case "medium":
        return t("task.priorityMedium", "Medium / Normal");
      case "low":
        return t("task.priorityLow", "Low");
      default:
        return priority;
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={col.id}>
              <Box
                sx={{
                  bgcolor: isDark ? "#0F172A" : col.bgLight,
                  border: `1px solid ${isDark ? "#1E293B" : col.borderLight}`,
                  borderRadius: "16px",
                  p: 2,
                  minHeight: 540,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Column Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                    px: 0.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: col.color,
                      }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                        letterSpacing: "0.05em",
                        color: isDark ? "#F8FAFC" : "#1E293B",
                      }}
                    >
                      {col.title}
                    </Typography>
                    <Chip
                      label={colTasks.length}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        bgcolor: isDark ? "#1E293B" : "#FFFFFF",
                        color: col.color,
                        border: `1px solid ${isDark ? "#334155" : "#E2E8F0"}`,
                      }}
                    />
                  </Box>

                  <IconButton
                    size="small"
                    onClick={onOpenCreateModal}
                    sx={{ color: isDark ? "#94A3B8" : "#64748B" }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Task Cards Stack */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}>
                  {colTasks.map((task) => {
                    const priorityProps = getPriorityBadgeProps(task.priority);

                    return (
                      <Card
                        key={task.id}
                        elevation={0}
                        sx={{
                          borderRadius: "12px",
                          border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
                          bgcolor: isDark ? "#1E293B" : "#FFFFFF",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.08)",
                            borderColor: isDark ? "#475569" : "#CBD5E1",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.9375rem",
                                color: isDark ? "#F8FAFC" : "#0F172A",
                                lineHeight: 1.3,
                              }}
                            >
                              {task.title}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setTaskMenuAnchor(e.currentTarget);
                                setActiveTaskMenu(task.id);
                              }}
                              sx={{ color: isDark ? "#64748B" : "#94A3B8", p: 0.2 }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          {task.description && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: isDark ? "#94A3B8" : "#64748B",
                                fontSize: "0.8125rem",
                                mb: 2,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.4,
                              }}
                            >
                              {task.description}
                            </Typography>
                          )}

                          {/* Card Footer: Priority Pill & Date */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 1.5,
                            }}
                          >
                            <Chip
                              label={getPriorityLabel(task.priority)}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                bgcolor: priorityProps.bg,
                                color: priorityProps.color,
                                borderRadius: "6px",
                              }}
                            />
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                color: isDark ? "#64748B" : "#94A3B8",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                              }}
                            >
                              <CalendarTodayIcon sx={{ fontSize: 13 }} />
                              <span>{task.dueDate}</span>
                            </Box>
                          </Box>

                          {/* Assignee Avatars */}
                          {task.assignees && task.assignees.length > 0 && (
                            <Box sx={{ display: "flex", justifyContent: "flex-start", pt: 0.5 }}>
                              <AvatarGroup
                                max={4}
                                sx={{
                                  "& .MuiAvatar-root": {
                                    width: 24,
                                    height: 24,
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    border: `2px solid ${isDark ? "#1E293B" : "#FFFFFF"}`,
                                  },
                                }}
                              >
                                {task.assignees.map((a, idx) => (
                                  <Avatar
                                    key={idx}
                                    sx={{ bgcolor: a.color || "#2563EB", color: "#fff" }}
                                  >
                                    {a.initials}
                                  </Avatar>
                                ))}
                              </AvatarGroup>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Context Menu for Task Status / Actions */}
      <Menu
        anchorEl={taskMenuAnchor}
        open={Boolean(taskMenuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            onMoveTaskStatus(activeTaskMenu, "To Do");
            handleMenuClose();
          }}
        >
          {t("task.moveToToDo", "Move to To Do")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onMoveTaskStatus(activeTaskMenu, "In Progress");
            handleMenuClose();
          }}
        >
          {t("task.moveToInProgress", "Move to In Progress")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onMoveTaskStatus(activeTaskMenu, "Completed");
            handleMenuClose();
          }}
        >
          {t("task.moveToCompleted", "Move to Completed")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDeleteTask(activeTaskMenu);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          {t("task.deleteTask", "Delete Task")}
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default memo(TaskBoardView);
