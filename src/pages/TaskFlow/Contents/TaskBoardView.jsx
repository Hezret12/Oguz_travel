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
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import { useLocale } from "../../../hooks/useLocale";
import AppAvatarGroup from "../../../components/AppAvatarGroup";

const getPriorityBadgeProps = (priority) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return { bg: "#FEE2E2", color: "#DC2626" };
    case "medium":
    default:
      return { bg: "#DBEAFE", color: "#2563EB" };
  }
};

const getStatusInfo = (status, columns = []) => {
  const statusId = Number(status);
  const found = columns.find(
    (c) => c.id === statusId || c.id === status || String(c.id) === String(status)
  );
  if (found) return found;

  switch (statusId) {
    case 1:
      return {
        id: 1,
        title: "TO DO",
        color: "#64748B",
        bgLight: "#F8FAFC",
        borderLight: "#E2E8F0",
      };
    case 2:
      return {
        id: 2,
        title: "IN PROGRESS",
        color: "#2563EB",
        bgLight: "#EFF6FF",
        borderLight: "#BFDBFE",
      };
    case 3:
      return {
        id: 3,
        title: "COMPLETED",
        color: "#16A34A",
        bgLight: "#F0FDF4",
        borderLight: "#BBF7D0",
      };
    default:
      return {
        id: status,
        title: "TASK",
        color: "#64748B",
        bgLight: "#F8FAFC",
        borderLight: "#E2E8F0",
      };
  }
};

function TaskBoardView({
  tasks = [],
  columns = [],
  onMoveTaskStatus,
  onEditTask,
  onDeleteTask,
}) {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [activeTask, setActiveTask] = useState(null);
  const [taskMenuAnchor, setTaskMenuAnchor] = useState(null);

  const handleMenuClose = () => {
    setTaskMenuAnchor(null);
    setActiveTask(null);
  };

  const getPriorityLabel = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return t("task.priorityUrgent", "Urgent");
      case "medium":
      default:
        return t("task.priorityMedium", "Medium");
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflowY: "auto",
          pr: 0.5,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: isDark ? "#334155" : "#CBD5E1",
            borderRadius: "4px",
          },
        }}
      >
        {tasks.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: 300,
              color: isDark ? "#64748B" : "#94A3B8",
              gap: 1.5,
            }}
          >
            <AssignmentOutlinedIcon sx={{ fontSize: 48, opacity: 0.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t("task.noTasksFound", "Task tapylmady")}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2.5} sx={{ pb: 1 }}>
            {tasks.map((task) => {
              const taskId = task.guid || task.id;
              const statusInfo = getStatusInfo(task.status, columns);
              const priorityProps = getPriorityBadgeProps(task.priority);

              let formattedDate = "";
              const rawDate = task.due_date || task.dueDate;
              if (rawDate) {
                const d = new Date(rawDate);
                if (!isNaN(d.getTime())) {
                  formattedDate = d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }
              }

              let assigneesList = [];
              if (
                Array.isArray(task.empltaskAssignee) &&
                task.empltaskAssignee.length > 0
              ) {
                assigneesList = task.empltaskAssignee;
              } else if (
                Array.isArray(task.emplTaskAssignee) &&
                task.emplTaskAssignee.length > 0
              ) {
                assigneesList = task.emplTaskAssignee;
              } else if (
                Array.isArray(task.assignees) &&
                task.assignees.length > 0
              ) {
                assigneesList = task.assignees;
              } else if (
                Array.isArray(task.users) &&
                task.users.length > 0
              ) {
                assigneesList = task.users;
              } else if (task.employee || task.empluser || task.admuser) {
                assigneesList = [
                  task.employee || task.empluser || task.admuser,
                ];
              }

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={taskId}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: "12px",
                      border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
                      borderLeft: `4px solid ${statusInfo.color}`,
                      bgcolor: isDark ? "#1E293B" : "#FFFFFF",
                      height: 165,
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.15s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 6px 16px -2px rgba(0, 0, 0, 0.09)",
                        borderColor: isDark ? "#475569" : "#CBD5E1",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxSizing: "border-box",
                        "&:last-child": { pb: 1.5 },
                      }}
                    >
                      <Box>
                        {/* Top Bar: Status Badge & Options Menu */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Chip
                            label={statusInfo.title}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.675rem",
                              fontWeight: 700,
                              letterSpacing: "0.03em",
                              bgcolor: isDark ? "rgba(255,255,255,0.06)" : statusInfo.bgLight,
                              color: statusInfo.color,
                              border: `1px solid ${isDark ? "#334155" : statusInfo.borderLight}`,
                              borderRadius: "6px",
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setTaskMenuAnchor(e.currentTarget);
                              setActiveTask(task);
                            }}
                            sx={{
                              color: isDark ? "#64748B" : "#94A3B8",
                              p: 0.2,
                            }}
                          >
                            <MoreVertIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>

                        {/* Task Title */}
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 650,
                            fontSize: "0.875rem",
                            color: isDark ? "#F8FAFC" : "#0F172A",
                            lineHeight: 1.3,
                            cursor: "pointer",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            mb: 0.5,
                            "&:hover": { color: "primary.main" },
                          }}
                          onClick={() => onEditTask?.(task)}
                        >
                          {task.title || task.description || "Task"}
                        </Typography>

                        {/* Task Description */}
                        {task.description && task.title && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDark ? "#94A3B8" : "#64748B",
                              fontSize: "0.775rem",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: 1.35,
                            }}
                          >
                            {task.description}
                          </Typography>
                        )}
                      </Box>

                      {/* Card Footer: Priority Pill & Date & Assignees */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          pt: 0.5,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label={getPriorityLabel(task.priority)}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              bgcolor: priorityProps.bg,
                              color: priorityProps.color,
                              borderRadius: "5px",
                              px: 0.5,
                            }}
                          />
                          {formattedDate && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.3,
                                color: isDark ? "#64748B" : "#94A3B8",
                                fontSize: "0.725rem",
                                fontWeight: 500,
                              }}
                            >
                              <CalendarTodayIcon sx={{ fontSize: 11 }} />
                              <span>{formattedDate}</span>
                            </Box>
                          )}
                        </Box>

                        {/* Assignee Avatars */}
                        <AppAvatarGroup items={assigneesList} max={6} size={22} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Context Menu for Task Edit / Status Switch / Actions */}
      <Menu
        anchorEl={taskMenuAnchor}
        open={Boolean(taskMenuAnchor)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "10px",
              minWidth: 150,
              boxShadow: "0 8px 20px -4px rgba(0,0,0,0.12)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"}`,
              "& .MuiList-root": { py: 0.5 },
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeTask) onEditTask?.(activeTask);
            handleMenuClose();
          }}
          sx={{ py: 0.4, px: 1.25, minHeight: 30 }}
        >
          <ListItemIcon sx={{ minWidth: 26 }}>
            <EditOutlinedIcon sx={{ fontSize: 16, color: "#2563EB" }} />
          </ListItemIcon>
          <ListItemText
            primary={t("task.editTask", "Düzelt")}
            primaryTypographyProps={{ fontWeight: 600, fontSize: "0.775rem" }}
          />
        </MenuItem>

        <Divider sx={{ my: 0.3 }} />

        <MenuItem
          onClick={() => {
            if (activeTask)
              onMoveTaskStatus?.(activeTask.guid || activeTask.id, 1);
            handleMenuClose();
          }}
          selected={Number(activeTask?.status) === 1}
          sx={{ py: 0.4, px: 1.25, minHeight: 30 }}
        >
          <ListItemIcon sx={{ minWidth: 26 }}>
            <RadioButtonUncheckedIcon
              sx={{ fontSize: 15, color: "#64748B" }}
            />
          </ListItemIcon>
          <ListItemText
            primary={t("task.statusToDo", "TO DO")}
            primaryTypographyProps={{
              fontSize: "0.75rem",
              fontWeight: Number(activeTask?.status) === 1 ? 700 : 500,
            }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (activeTask)
              onMoveTaskStatus?.(activeTask.guid || activeTask.id, 2);
            handleMenuClose();
          }}
          selected={Number(activeTask?.status) === 2}
          sx={{ py: 0.4, px: 1.25, minHeight: 30 }}
        >
          <ListItemIcon sx={{ minWidth: 26 }}>
            <RadioButtonCheckedIcon
              sx={{ fontSize: 15, color: "#2563EB" }}
            />
          </ListItemIcon>
          <ListItemText
            primary={t("task.statusInProgress", "IN PROGRESS")}
            primaryTypographyProps={{
              fontSize: "0.75rem",
              fontWeight: Number(activeTask?.status) === 2 ? 700 : 500,
            }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (activeTask)
              onMoveTaskStatus?.(activeTask.guid || activeTask.id, 3);
            handleMenuClose();
          }}
          selected={Number(activeTask?.status) === 3}
          sx={{ py: 0.4, px: 1.25, minHeight: 30 }}
        >
          <ListItemIcon sx={{ minWidth: 26 }}>
            <CheckCircleRoundedIcon
              sx={{ fontSize: 15, color: "#16A34A" }}
            />
          </ListItemIcon>
          <ListItemText
            primary={t("task.statusCompleted", "COMPLETED")}
            primaryTypographyProps={{
              fontSize: "0.75rem",
              fontWeight: Number(activeTask?.status) === 3 ? 700 : 500,
            }}
          />
        </MenuItem>

        <Divider sx={{ my: 0.3 }} />

        <MenuItem
          onClick={() => {
            if (activeTask) onDeleteTask?.(activeTask.guid || activeTask.id);
            handleMenuClose();
          }}
          sx={{ py: 0.4, px: 1.25, minHeight: 30, color: "error.main" }}
        >
          <ListItemIcon sx={{ minWidth: 26 }}>
            <DeleteOutlinedIcon sx={{ fontSize: 16 }} color="error" />
          </ListItemIcon>
          <ListItemText
            primary={t("task.deleteTask", "Poz")}
            primaryTypographyProps={{
              fontWeight: 600,
              fontSize: "0.775rem",
              color: "error.main",
            }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default memo(TaskBoardView);
