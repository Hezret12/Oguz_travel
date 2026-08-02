import { memo, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StatusChip from "../../../components/StatusChip";
import { TASK_STATUS_CONFIG } from "../../../functions/statusChipConfigs";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
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

function TaskListTable({ tasks = [], onMoveTaskStatus, onEditTask, onDeleteTask }) {
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

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: t("task.title", "Task Title"),
        size: 260,
        Cell: ({ row }) => (
          <Box
            sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
            onClick={() => onEditTask?.(row.original)}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
              {row.original.title || row.original.description || "Task"}
            </Typography>
            {row.original.description && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {row.original.description}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        accessorKey: "status",
        header: t("columns.status", "Status"),
        size: 150,
        Cell: ({ cell }) => (
          <StatusChip status={cell.getValue()} config={TASK_STATUS_CONFIG} size="small" />
        ),
      },
      {
        accessorKey: "priority",
        header: t("task.priority", "Priority"),
        size: 130,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          const props = getPriorityBadgeProps(val);
          return (
            <Chip
              label={getPriorityLabel(val)}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                bgcolor: props.bg,
                color: props.color,
                borderRadius: "6px",
              }}
            />
          );
        },
      },
      {
        id: "assignees",
        header: t("task.assignees", "Assignees"),
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => {
          const item = row.original;
          let assigneesList = [];
          if (Array.isArray(item.empltaskAssignee) && item.empltaskAssignee.length > 0) {
            assigneesList = item.empltaskAssignee;
          } else if (Array.isArray(item.emplTaskAssignee) && item.emplTaskAssignee.length > 0) {
            assigneesList = item.emplTaskAssignee;
          } else if (Array.isArray(item.assignees) && item.assignees.length > 0) {
            assigneesList = item.assignees;
          } else if (Array.isArray(item.users) && item.users.length > 0) {
            assigneesList = item.users;
          } else if (item.employee || item.empluser || item.admuser) {
            assigneesList = [item.employee || item.empluser || item.admuser];
          }

          if (assigneesList.length === 0)
            return (
              <Typography variant="caption" color="text.secondary">
                —
              </Typography>
            );

          return (
            <AvatarGroup max={3} sx={{ justifyContent: "flex-start" }}>
              {assigneesList.map((a, i) => {
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
                  a.initials || (name ? name.slice(0, 2).toUpperCase() : "US");
                return (
                  <Tooltip key={i} title={name} arrow placement="top">
                    <Avatar
                      sx={{
                        width: 26,
                        height: 26,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        bgcolor: a.color || "#2563EB",
                      }}
                    >
                      {initials}
                    </Avatar>
                  </Tooltip>
                );
              })}
            </AvatarGroup>
          );
        },
      },
      {
        id: "dueDate",
        header: t("task.dueDate", "Due Date"),
        size: 130,
        Cell: ({ row }) => {
          const rawDate = row.original.due_date || row.original.dueDate;
          if (!rawDate) return "—";
          const d = new Date(rawDate);
          return !isNaN(d.getTime())
            ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : rawDate;
        },
      },
      {
        id: "actions",
        header: t("columns.actions", "Actions"),
        size: 90,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <IconButton
            size="small"
            onClick={(e) => {
              setTaskMenuAnchor(e.currentTarget);
              setActiveTask(row.original);
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, onEditTask]
  );

  const defaultMrtOptions = getDefaultMRTOptions();

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: tasks,
    enablePagination: true,
    enableStickyHeader: true,
    enableTopToolbar: false,
    enableBottomToolbar: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    muiTableContainerProps: {
      sx: {
        flexGrow: 1,
        maxHeight: "calc(100vh - 200px)",
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
      },
    },
  });

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <MaterialReactTable table={table} />

      {/* Task Context Menu */}
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

export default memo(TaskListTable);

