import { memo, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

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

function TaskBoardView({
  tasks = [],
  columns = [],
  onMoveTaskStatus,
  onEditTask,
  onDeleteTask,
}) {
  const { t } = useLocale();

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
      <Grid
        container
        spacing={2.5}
        sx={{
          flexGrow: 1,
          minHeight: 0,
          height: "100%",
          alignItems: "stretch",
          overflowY: { xs: "auto", lg: "hidden" },
          pb: 0.5,
        }}
      >
        {columns.map((col) => {
          const colTasks = tasks.filter(
            (t) =>
              t.status === col.id ||
              Number(t.status) === col.id ||
              t.statusId === col.id
          );

          return (
            <Grid
              size={{ xs: 12, sm: 6, lg: 4 }}
              key={col.id}
              sx={{
                height: { xs: 520, lg: "100%" },
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "background.default"
                      : col.bgLight,
                  border: "1px solid",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark" ? "divider" : col.borderLight,
                  borderRadius: "12px",
                  p: 1.5,
                  height: "100%",
                  maxHeight: "100%",
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                  overflow: "hidden",
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
                    flexShrink: 0,
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
                        color: "text.primary",
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
                        bgcolor: "background.paper",
                        color: col.color,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  </Box>
                </Box>

                {/* Task Cards Stack with Smooth Custom Internal Scrollbar */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.25,
                    flexGrow: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    pr: 0.5,
                    scrollbarWidth: "thin",
                    scrollbarColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(100, 116, 139, 0.4) transparent"
                        : "rgba(148, 163, 184, 0.4) transparent",
                    "&::-webkit-scrollbar": {
                      width: "4px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(100, 116, 139, 0.35)"
                          : "rgba(148, 163, 184, 0.35)",
                      borderRadius: "10px",
                      transition: "background-color 0.2s ease-in-out",
                    },
                    "&:hover::-webkit-scrollbar-thumb": {
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(148, 163, 184, 0.6)"
                          : "rgba(100, 116, 139, 0.5)",
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
                          border: "1px solid",
                          borderColor: "divider",
                          borderLeft: `3.5px solid ${col.color}`,
                          bgcolor: "background.paper",
                          height: 145,
                          flexShrink: 0,
                          display: "flex",
                          flexDirection: "column",
                          transition: "all 0.15s ease-in-out",
                          "&:hover": {
                            boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08)",
                            borderColor: "primary.main",
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
                                  color: "text.primary",
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
                                  color: "text.secondary",
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
                                  color: "text.secondary",
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
                                    color: "text.secondary",
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
              borderRadius: "10px",
              minWidth: 150,
              boxShadow: "0 8px 20px -4px rgba(0,0,0,0.12)",
              border: "1px solid",
              borderColor: "divider",
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
