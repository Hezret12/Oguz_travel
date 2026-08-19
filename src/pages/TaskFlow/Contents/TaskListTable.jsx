import { memo, useMemo, useState, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  ButtonBase,
  alpha,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import dayjs from "dayjs";
import AppAvatarGroup from "../../../components/AppAvatarGroup";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";

const STATUS_ITEMS = [
  {
    id: 1,
    key: "toDo",
    label: "To Do",
    color: "#64748B",
    icon: RadioButtonUncheckedIcon,
  },
  {
    id: 2,
    key: "inProgress",
    label: "In Progress",
    color: "#2563EB",
    icon: RadioButtonCheckedIcon,
  },
  {
    id: 3,
    key: "completed",
    label: "Completed",
    color: "#16A34A",
    icon: CheckCircleRoundedIcon,
  },
];

const getStatusItem = (statusId) => {
  const num = Number(statusId) || 1;
  return STATUS_ITEMS.find((s) => s.id === num) || STATUS_ITEMS[0];
};

const getPriorityTheme = (priority) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return {
        color: "#DC2626",
        bgLight: "rgba(220, 38, 38, 0.08)",
        bgDark: "rgba(239, 68, 68, 0.16)",
        borderLight: "rgba(220, 38, 38, 0.2)",
        borderDark: "rgba(239, 68, 68, 0.3)",
      };
    case "low":
      return {
        color: "#059669",
        bgLight: "rgba(5, 150, 105, 0.08)",
        bgDark: "rgba(16, 185, 129, 0.16)",
        borderLight: "rgba(5, 150, 105, 0.2)",
        borderDark: "rgba(16, 185, 129, 0.3)",
      };
    case "medium":
    default:
      return {
        color: "#2563EB",
        bgLight: "rgba(37, 99, 235, 0.08)",
        bgDark: "rgba(59, 130, 246, 0.16)",
        borderLight: "rgba(37, 99, 235, 0.2)",
        borderDark: "rgba(59, 130, 246, 0.3)",
      };
  }
};

function TaskListTable({
  tasks = [],
  isLoading = false,
  isFetching = false,
  isError = false,
  onMoveTaskStatus,
  onEditTask,
  onDeleteTask,
}) {
  const { t } = useLocale();
  const [activeTask, setActiveTask] = useState(null);
  const [taskMenuAnchor, setTaskMenuAnchor] = useState(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [statusTask, setStatusTask] = useState(null);

  const handleMenuClose = () => {
    setTaskMenuAnchor(null);
    setActiveTask(null);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
    setStatusTask(null);
  };

  const getPriorityLabel = useCallback(
    (priority) => {
      switch (priority?.toLowerCase()) {
        case "urgent":
          return t("task.priorityUrgent", "Urgent");
        case "low":
          return t("task.priorityLow", "Low");
        case "medium":
        default:
          return t("task.priorityMedium", "Medium");
      }
    },
    [t],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: t("task.title", "Task Title"),
        size: 300,
        Cell: ({ row }) => {
          const task = row.original;
          const attachmentsCount =
            (Array.isArray(task.images) ? task.images.length : 0) ||
            (Array.isArray(task.attachments) ? task.attachments.length : 0);

          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                py: 0.5,
                cursor: "pointer",
              }}
              onClick={() => onEditTask?.(task)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 650,
                    fontSize: "0.875rem",
                    color: "text.primary",
                    "&:hover": { color: "primary.main" },
                    transition: "color 0.15s ease",
                  }}
                >
                  {task.title || task.description}
                </Typography>

                {attachmentsCount > 0 && (
                  <Tooltip
                    title={`${attachmentsCount} ${t("task.attachments")}`}
                  >
                    <Chip
                      icon={
                        <AttachFileOutlinedIcon
                          style={{ fontSize: 13, marginRight: -4 }}
                        />
                      }
                      label={attachmentsCount}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        borderRadius: "6px",
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.08)"
                            : "rgba(0, 0, 0, 0.05)",
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  </Tooltip>
                )}
              </Box>

              {task.description && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    maxWidth: "90%",
                  }}
                >
                  {task.description}
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("columns.status"),
        size: 170,
        Cell: ({ row }) => {
          const task = row.original;
          const statusInfo = getStatusItem(task.status);
          const StatusIcon = statusInfo.icon;

          return (
            <ButtonBase
              onClick={(e) => {
                e.stopPropagation();
                setStatusMenuAnchor(e.currentTarget);
                setStatusTask(task);
              }}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                borderRadius: "8px",
                border: "1px solid",
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? alpha(statusInfo.color, 0.3)
                    : alpha(statusInfo.color, 0.25),
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? alpha(statusInfo.color, 0.15)
                    : alpha(statusInfo.color, 0.08),
                color: statusInfo.color,
                fontSize: "0.775rem",
                fontWeight: 650,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? alpha(statusInfo.color, 0.25)
                      : alpha(statusInfo.color, 0.14),
                  transform: "translateY(-1px)",
                },
              }}
            >
              <StatusIcon sx={{ fontSize: 15 }} />
              <span>
                {t(
                  `task.status${statusInfo.key.charAt(0).toUpperCase() + statusInfo.key.slice(1)}`,
                  statusInfo.label,
                )}
              </span>
              <KeyboardArrowDownIcon
                sx={{ fontSize: 14, opacity: 0.7, ml: -0.25 }}
              />
            </ButtonBase>
          );
        },
      },
      {
        accessorKey: "priority",
        header: t("task.priority"),
        size: 130,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          const pTheme = getPriorityTheme(val);

          return (
            <Chip
              label={getPriorityLabel(val)}
              size="small"
              sx={{
                fontWeight: 650,
                fontSize: "0.75rem",
                height: 24,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? pTheme.bgDark
                    : pTheme.bgLight,
                color: pTheme.color,
                border: "1px solid",
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? pTheme.borderDark
                    : pTheme.borderLight,
                borderRadius: "6px",
              }}
            />
          );
        },
      },
      {
        id: "assignees",
        header: t("task.assignees", "Assignees"),
        size: 185,
        minSize: 175,
        enableSorting: false,
        Cell: ({ row }) => {
          const item = row.original;
          let assigneesList = [];
          if (
            Array.isArray(item.empltaskAssignee) &&
            item.empltaskAssignee.length > 0
          ) {
            assigneesList = item.empltaskAssignee;
          } else if (
            Array.isArray(item.emplTaskAssignee) &&
            item.emplTaskAssignee.length > 0
          ) {
            assigneesList = item.emplTaskAssignee;
          } else if (
            Array.isArray(item.assignees) &&
            item.assignees.length > 0
          ) {
            assigneesList = item.assignees;
          } else if (Array.isArray(item.users) && item.users.length > 0) {
            assigneesList = item.users;
          } else if (item.employee || item.empluser || item.admuser) {
            assigneesList = [item.employee || item.empluser || item.admuser];
          }

          if (assigneesList.length === 0) {
            return (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: "0.8rem" }}
              >
                —
              </Typography>
            );
          }

          return <AppAvatarGroup items={assigneesList} max={6} size={26} />;
        },
      },
      {
        id: "dueDate",
        header: t("task.dueDate"),
        size: 140,
        Cell: ({ row }) => {
          const task = row.original;
          const rawDate = task.due_date || task.dueDate;
          if (!rawDate)
            return (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                —
              </Typography>
            );

          const d = dayjs(rawDate);
          if (!d.isValid()) return rawDate;

          const isDone = Number(task.status) === 3;
          const isOverdue = !isDone && d.isBefore(dayjs(), "day");
          const isToday = !isDone && d.isSame(dayjs(), "day");

          return (
            <Box
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}
            >
              <CalendarTodayOutlinedIcon
                sx={{
                  fontSize: 14,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: isOverdue || isToday ? 650 : 500,
                }}
              >
                {d.format("DD.MM.YYYY")}
              </Typography>
              {isOverdue && (
                <Chip
                  label={t("task.overdue")}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    borderRadius: "4px",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(220, 38, 38, 0.1)",
                    color: "error.main",
                    "& .MuiChip-label": { px: 0.5 },
                  }}
                />
              )}
            </Box>
          );
        },
      },
      {
        id: "actions",
        header: t("columns.actions", "Actions"),
        size: 110,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const task = row.original;

          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  setTaskMenuAnchor(e.currentTarget);
                  setActiveTask(task);
                }}
              >
                <MoreVertIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              </IconButton>
            </Box>
          );
        },
      },
    ],
    [t, onEditTask, getPriorityLabel],
  );

  const defaultMrtOptions = getDefaultMRTOptions();

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: tasks,
    enablePagination: false,
    enableStickyHeader: true,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableRowHover: true,
    state: {
      isLoading,
      showSkeletons: isLoading,
      showAlertBanner: isError,
      showProgressBars: isFetching,
    },
    muiTableContainerProps: {
      sx: {
        flexGrow: 1,
        minHeight: 0,
        overflowY: "auto",
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "14px",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.paper",
      },
    },
    renderEmptyRowsFallback: () => (
      <Box
        sx={{
          py: 8,
          px: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.03)",
            color: "text.secondary",
          }}
        >
          <AssignmentOutlinedIcon sx={{ fontSize: 26 }} />
        </Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 650, color: "text.primary" }}
        >
          {t("task.noTasksFound", "Tabşyryk tapylmady")}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", maxWidth: 360 }}
        >
          {t(
            "task.noTasksDesc",
            "Gözleg şertleriňize gabat gelýän tabşyryk ýok ýa-da entek täze tabşyryk goşulmady.",
          )}
        </Typography>
      </Box>
    ),
  });

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <MaterialReactTable table={table} />

      {/* Quick Status Switcher Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              minWidth: 170,
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 10px 28px rgba(0,0,0,0.6)"
                  : "0 8px 24px rgba(0,0,0,0.12)",
              border: "1px solid",
              borderColor: "divider",
              p: 0.5,
            },
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            py: 0.75,
            display: "block",
            fontWeight: 700,
            color: "text.secondary",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {t("task.changeStatus", "Ýagdaýy üýtget")}
        </Typography>

        {STATUS_ITEMS.map((item) => {
          const isSelected = Number(statusTask?.status) === item.id;
          const Icon = item.icon;

          return (
            <MenuItem
              key={item.id}
              onClick={() => {
                if (statusTask) onMoveTaskStatus?.(statusTask.guid, item.id);
                handleStatusMenuClose();
              }}
              selected={isSelected}
              sx={{
                py: 0.6,
                px: 1.25,
                borderRadius: "8px",
                my: 0.25,
                gap: 1.25,
                "&.Mui-selected": {
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? alpha(item.color, 0.2)
                      : alpha(item.color, 0.1),
                },
              }}
            >
              <Icon sx={{ fontSize: 16, color: item.color }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: "0.8125rem",
                  color: isSelected ? item.color : "text.primary",
                }}
              >
                {t(
                  `task.status${item.key.charAt(0).toUpperCase() + item.key.slice(1)}`,
                  item.label,
                )}
              </Typography>
            </MenuItem>
          );
        })}
      </Menu>

      {/* Task Context Menu */}
      <Menu
        anchorEl={taskMenuAnchor}
        open={Boolean(taskMenuAnchor)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              minWidth: 170,
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 10px 28px rgba(0,0,0,0.6)"
                  : "0 8px 24px rgba(0,0,0,0.12)",
              border: "1px solid",
              borderColor: "divider",
              p: 0.5,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeTask) onEditTask?.(activeTask);
            handleMenuClose();
          }}
          sx={{ py: 0.6, px: 1.25, borderRadius: "8px" }}
        >
          <ListItemIcon sx={{ minWidth: 26 }}>
            <EditOutlinedIcon sx={{ fontSize: 17, color: "primary.main" }} />
          </ListItemIcon>
          <ListItemText
            primary={t("task.editTask", "Düzelt")}
            slotProps={{ primary: { fontWeight: 600, fontSize: "0.8125rem" } }}
          />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <Typography
          variant="caption"
          sx={{
            px: 1.25,
            py: 0.25,
            display: "block",
            fontWeight: 700,
            color: "text.secondary",
            fontSize: "0.675rem",
            textTransform: "uppercase",
          }}
        >
          {t("task.status", "Ýagdaý")}
        </Typography>

        {STATUS_ITEMS.map((item) => (
          <MenuItem
            key={item.id}
            onClick={() => {
              if (activeTask) onMoveTaskStatus?.(activeTask.guid, item.id);
              handleMenuClose();
            }}
            selected={Number(activeTask?.status) === item.id}
            sx={{ py: 0.5, px: 1.25, borderRadius: "6px" }}
          >
            <ListItemIcon sx={{ minWidth: 26 }}>
              <item.icon sx={{ fontSize: 16, color: item.color }} />
            </ListItemIcon>
            <ListItemText
              primary={t(
                `task.status${item.key.charAt(0).toUpperCase() + item.key.slice(1)}`,
                item.label,
              )}
              slotProps={{
                primary: {
                  fontSize: "0.775rem",
                  fontWeight:
                    Number(activeTask?.status) === item.id ? 700 : 500,
                },
              }}
            />
          </MenuItem>
        ))}

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            if (activeTask) onDeleteTask?.(activeTask.guid);
            handleMenuClose();
          }}
          sx={{ py: 0.6, px: 1.25, borderRadius: "8px", color: "error.main" }}
        >
          <ListItemIcon sx={{ minWidth: 26 }}>
            <DeleteOutlinedIcon sx={{ fontSize: 17 }} color="error" />
          </ListItemIcon>
          <ListItemText
            primary={t("task.deleteTask", "Poz")}
            slotProps={{
              primary: {
                fontWeight: 600,
                fontSize: "0.8125rem",
                color: "error.main",
              },
            }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default memo(TaskListTable);
