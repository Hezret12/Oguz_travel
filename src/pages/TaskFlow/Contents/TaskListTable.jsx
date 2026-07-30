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

function TaskListTable({ tasks = [], onMoveTaskStatus, onDeleteTask }) {
  const [activeTaskMenu, setActiveTaskMenu] = useState(null);
  const [taskMenuAnchor, setTaskMenuAnchor] = useState(null);

  const handleMenuClose = () => {
    setTaskMenuAnchor(null);
    setActiveTaskMenu(null);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Task Title",
        size: 260,
        Cell: ({ row }) => (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
              {row.original.title}
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
        header: "Status",
        size: 150,
        Cell: ({ cell }) => (
          <StatusChip status={cell.getValue()} config={TASK_STATUS_CONFIG} size="small" />
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        size: 130,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          const props = getPriorityBadgeProps(val);
          return (
            <Chip
              label={val}
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
        accessorKey: "assignees",
        header: "Assignees",
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => {
          const assignees = row.original.assignees || [];
          if (assignees.length === 0) return <Typography variant="caption" color="text.secondary">—</Typography>;
          return (
            <AvatarGroup max={3} sx={{ justifyContent: "flex-start" }}>
              {assignees.map((a, i) => (
                <Avatar
                  key={i}
                  sx={{
                    width: 26,
                    height: 26,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    bgcolor: a.color || "#2563EB",
                  }}
                >
                  {a.initials}
                </Avatar>
              ))}
            </AvatarGroup>
          );
        },
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        size: 130,
      },
      {
        id: "actions",
        header: "Actions",
        size: 90,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <IconButton
            size="small"
            onClick={(e) => {
              setTaskMenuAnchor(e.currentTarget);
              setActiveTaskMenu(row.original.id);
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    []
  );

  const defaultMrtOptions = getDefaultMRTOptions();

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: tasks,
    enablePagination: true,
    enableTopToolbar: false,
    enableBottomToolbar: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "14px",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      },
    },
  });

  return (
    <Box>
      <MaterialReactTable table={table} />

      {/* Task Context Menu */}
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
          Move to To Do
        </MenuItem>
        <MenuItem
          onClick={() => {
            onMoveTaskStatus(activeTaskMenu, "In Progress");
            handleMenuClose();
          }}
        >
          Move to In Progress
        </MenuItem>
        <MenuItem
          onClick={() => {
            onMoveTaskStatus(activeTaskMenu, "Completed");
            handleMenuClose();
          }}
        >
          Move to Completed
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDeleteTask(activeTaskMenu);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          Delete Task
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default memo(TaskListTable);
