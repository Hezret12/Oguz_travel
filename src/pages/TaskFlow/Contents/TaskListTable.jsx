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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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

function TaskListTable({ tasks = [], onMoveTaskStatus, onDeleteTask }) {
  const { t } = useLocale();
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
          <Box>
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
          if (Array.isArray(item.assignees) && item.assignees.length > 0) {
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
                  a.name ||
                  a.fullName ||
                  a.employee?.fullName ||
                  a.phone_number ||
                  "User";
                const initials =
                  a.initials || name.slice(0, 2).toUpperCase();
                return (
                  <Avatar
                    key={i}
                    sx={{
                      width: 26,
                      height: 26,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      bgcolor: a.color || "#2563EB",
                    }}
                    title={name}
                  >
                    {initials}
                  </Avatar>
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
              setActiveTaskMenu(row.original.guid || row.original.id);
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
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
      >
        <MenuItem
          onClick={() => {
            onMoveTaskStatus(activeTaskMenu, 1);
            handleMenuClose();
          }}
        >
          {t("task.moveToToDo", "Move to To Do")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onMoveTaskStatus(activeTaskMenu, 2);
            handleMenuClose();
          }}
        >
          {t("task.moveToInProgress", "Move to In Progress")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onMoveTaskStatus(activeTaskMenu, 3);
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

export default memo(TaskListTable);

