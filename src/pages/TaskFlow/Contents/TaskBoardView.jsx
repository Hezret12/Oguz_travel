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

import { useLocale } from "../../../hooks/useLocale";

const getPriorityBadgeProps = (priority) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return { bg: "#FEE2E2", color: "#DC2626" };
    case "medium":
    default:
      return { bg: "#DBEAFE", color: "#2563EB" };
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
    <Box>
      <Grid container spacing={2.5}>
        {columns.map((col) => {
          const colTasks = tasks.filter(
            (t) =>
              t.status === col.id ||
              Number(t.status) === col.id ||
              t.statusId === col.id,
          );

          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={col.id}>
              <Box
                sx={{
                  bgcolor: isDark ? "#0F172A" : col.bgLight,
                  border: `1px solid ${isDark ? "#1E293B" : col.borderLight}`,
                  borderRadius: "12px",
                  p: 1.5,
                  height: "calc(100vh - 210px)",
                  minHeight: 580,
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                }}
              >
                {/* Column Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
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
                        fontSize: "0.8rem",
                        letterSpacing: "0.04em",
                        color: isDark ? "#F8FAFC" : "#1E293B",
                        textTransform: "uppercase",
                      }}
                    >
                      {col.title}
                    </Typography>
                    <Chip
                      label={colTasks.length}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        bgcolor: isDark ? "#1E293B" : "#FFFFFF",
                        color: col.color,
                        border: `1px solid ${isDark ? "#334155" : "#E2E8F0"}`,
                      }}
                    />
                  </Box>
                </Box>

                {/* Task Cards Stack with Smooth Internal Scrollbar */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.25,
                    flexGrow: 1,
                    overflowY: "auto",
                    pr: 0.5,
                    "&::-webkit-scrollbar": {
                      width: "4px",
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
                  {colTasks.map((task) => {
                    const taskId = task.guid || task.id;
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
                      <Card
                        key={taskId}
                        elevation={0}
                        sx={{
                          borderRadius: "10px",
                          border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
                          borderLeft: `3.5px solid ${col.color}`,
                          bgcolor: isDark ? "#1E293B" : "#FFFFFF",
                          height: 145,
                          display: "flex",
                          flexDirection: "column",
                          transition: "all 0.15s ease-in-out",
                          "&:hover": {
                            boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08)",
                            borderColor: isDark ? "#475569" : "#CBD5E1",
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
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 650,
                                  fontSize: "0.85rem",
                                  color: isDark ? "#F8FAFC" : "#0F172A",
                                  lineHeight: 1.3,
                                  cursor: "pointer",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  "&:hover": { color: "primary.main" },
                                }}
                                onClick={() => onEditTask?.(task)}
                              >
                                {task.title || task.description || "Task"}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  setTaskMenuAnchor(e.currentTarget);
                                  setActiveTask(task);
                                }}
                                sx={{
                                  color: isDark ? "#64748B" : "#94A3B8",
                                  p: 0.1,
                                  ml: 0.5,
                                }}
                              >
                                <MoreVertIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>

                            {task.description && (
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
                            {assigneesList.length > 0 && (
                              <AvatarGroup
                                max={3}
                                sx={{
                                  "& .MuiAvatar-root": {
                                    width: 22,
                                    height: 22,
                                    fontSize: "0.6rem",
                                    fontWeight: 700,
                                    border: `1.5px solid ${isDark ? "#1E293B" : "#FFFFFF"}`,
                                  },
                                }}
                              >
                                {assigneesList.map((a, idx) => {
                                  const name =
                                    a.user?.employee?.fullName ||
                                    a.employee?.fullName ||
                                    a.user?.fullName ||
                                    a.fullName ||
                                    a.name ||
                                    a.user?.phone_number ||
                                    a.phone_number ||
                                    "User";
                                  const initials =
                                    a.initials ||
                                    (name
                                      ? name.slice(0, 2).toUpperCase()
                                      : "US");
                                  return (
                                    <Tooltip key={idx} title={name} arrow placement="top">
                                      <Avatar
                                        sx={{
                                          bgcolor: a.color || "#2563EB",
                                          color: "#fff",
                                        }}
                                      >
                                        {initials}
                                      </Avatar>
                                    </Tooltip>
                                  );
                                })}
                              </AvatarGroup>
                            )}
                          </Box>
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

      {/* Context Menu for Task Edit / Status Switch / Actions */}
      <Menu
        anchorEl={taskMenuAnchor}
        open={Boolean(taskMenuAnchor)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              minWidth: 180,
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"}`,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeTask) onEditTask?.(activeTask);
            handleMenuClose();
          }}
          sx={{ py: 1, px: 2 }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" sx={{ color: "#2563EB" }} />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ fontWeight: 600, fontSize: "0.875rem" }}
          >
            {t("task.editTask", "Düzelt")}
          </ListItemText>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            if (activeTask)
              onMoveTaskStatus?.(activeTask.guid || activeTask.id, 1);
            handleMenuClose();
          }}
          selected={Number(activeTask?.status) === 1}
          sx={{ py: 0.8, px: 2 }}
        >
          <ListItemIcon>
            <RadioButtonUncheckedIcon
              fontSize="small"
              sx={{ color: "#64748B" }}
            />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{
              fontSize: "0.8125rem",
              fontWeight: Number(activeTask?.status) === 1 ? 700 : 500,
            }}
          >
            {t("task.statusToDo", "TO DO")}
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (activeTask)
              onMoveTaskStatus?.(activeTask.guid || activeTask.id, 2);
            handleMenuClose();
          }}
          selected={Number(activeTask?.status) === 2}
          sx={{ py: 0.8, px: 2 }}
        >
          <ListItemIcon>
            <RadioButtonCheckedIcon
              fontSize="small"
              sx={{ color: "#2563EB" }}
            />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{
              fontSize: "0.8125rem",
              fontWeight: Number(activeTask?.status) === 2 ? 700 : 500,
            }}
          >
            {t("task.statusInProgress", "IN PROGRESS")}
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (activeTask)
              onMoveTaskStatus?.(activeTask.guid || activeTask.id, 3);
            handleMenuClose();
          }}
          selected={Number(activeTask?.status) === 3}
          sx={{ py: 0.8, px: 2 }}
        >
          <ListItemIcon>
            <CheckCircleRoundedIcon
              fontSize="small"
              sx={{ color: "#16A34A" }}
            />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{
              fontSize: "0.8125rem",
              fontWeight: Number(activeTask?.status) === 3 ? 700 : 500,
            }}
          >
            {t("task.statusCompleted", "COMPLETED")}
          </ListItemText>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            if (activeTask) onDeleteTask?.(activeTask.guid || activeTask.id);
            handleMenuClose();
          }}
          sx={{ py: 1, px: 2, color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteOutlinedIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{
              fontWeight: 600,
              fontSize: "0.875rem",
              color: "error.main",
            }}
          >
            {t("task.deleteTask", "Poz")}
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default memo(TaskBoardView);
