import { memo, useMemo, useState, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Typography,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  ButtonBase,
  alpha,
} from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import dayjs from "dayjs";

import AppAvatarGroup from "../../../components/AppAvatarGroup";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import { useDateFormat } from "../../../functions/generalHelpers";
import {
  TASK_STATUS_ITEMS,
  getTaskStatus,
  getTaskPriority,
  getTaskAssignees,
  getTaskAttachments,
} from "../functions/taskMeta";

function TaskListTable({
  tasks = [],
  isLoading = false,
  isFetching = false,
  isError = false,
  sortBy = "",
  sortOrder = "asc",
  onSortChange,
  onMoveTaskStatus,
  onEditTask,
  onDeleteTask,
}) {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [statusTask, setStatusTask] = useState(null);

  const handleStatusMenuClose = useCallback(() => {
    setStatusMenuAnchor(null);
    setStatusTask(null);
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: t("task.title"),
        size: 300,
        Cell: ({ row }) => {
          const task = row.original;
          const attachmentsCount = getTaskAttachments(task).length;

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
                        bgcolor: "action.hover",
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
          const statusInfo = getTaskStatus(task.status);
          const StatusIcon = statusInfo.Icon;

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
                borderColor: alpha(statusInfo.color, 0.25),
                bgcolor: alpha(statusInfo.color, 0.08),
                color: statusInfo.color,
                fontSize: "0.775rem",
                fontWeight: 650,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: alpha(statusInfo.color, 0.14),
                  transform: "translateY(-1px)",
                },
              }}
            >
              <StatusIcon sx={{ fontSize: 15 }} />
              <span>{t(statusInfo.labelKey)}</span>
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
          const priority = getTaskPriority(cell.getValue());

          return (
            <Chip
              label={t(priority.labelKey)}
              size="small"
              sx={{
                fontWeight: 650,
                fontSize: "0.75rem",
                height: 24,
                bgcolor: alpha(priority.color, 0.1),
                color: priority.color,
                border: "1px solid",
                borderColor: alpha(priority.color, 0.25),
                borderRadius: "6px",
              }}
            />
          );
        },
      },
      {
        id: "assignees",
        header: t("task.assignees"),
        size: 185,
        minSize: 175,
        enableSorting: false,
        Cell: ({ row }) => {
          const assigneesList = getTaskAssignees(row.original);

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
        accessorKey: "due_date",
        header: t("task.dueDate"),
        size: 140,
        Cell: ({ row }) => {
          const task = row.original;
          const rawDate = task.due_date || task.dueDate;
          const formatted = formatChange(rawDate, { dateOnly: true });

          if (!formatted) {
            return (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                —
              </Typography>
            );
          }

          const parsed = dayjs(rawDate);
          const isDone = Number(task.status) === 3;
          const isOverdue = !isDone && parsed.isBefore(dayjs(), "day");
          const isToday = !isDone && parsed.isSame(dayjs(), "day");

          return (
            <Box
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}
            >
              <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: isOverdue || isToday ? 650 : 500,
                }}
              >
                {formatted}
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
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
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
        header: t("columns.actions"),
        size: 110,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ),
      },
    ],
    [t, formatChange, onEditTask, onDeleteTask],
  );

  const defaultMrtOptions = getDefaultMRTOptions();

  const sorting = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : []),
    [sortBy, sortOrder],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: tasks,
    getRowId: (row) => row.guid,
    enablePagination: false,
    enableStickyHeader: true,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableRowHover: true,
    enableSorting: true,
    manualSorting: true,
    manualFiltering: true,
    state: {
      isLoading,
      showSkeletons: isLoading,
      showAlertBanner: isError,
      showProgressBars: isFetching,
      sorting,
    },
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(sorting) : updater;
      if (next && next.length > 0) {
        onSortChange?.(next[0].id, next[0].desc ? "desc" : "asc");
      } else {
        onSortChange?.("", "asc");
      }
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
            bgcolor: "action.hover",
            color: "text.secondary",
          }}
        >
          <AssignmentOutlinedIcon sx={{ fontSize: 26 }} />
        </Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 650, color: "text.primary" }}
        >
          {t("task.noTasksFound")}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", maxWidth: 360 }}
        >
          {t("task.noTasksDesc")}
        </Typography>
      </Box>
    ),
  });

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <MaterialReactTable table={table} />

      {/* Quick status switcher, opened from the status cell */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              minWidth: 170,
              boxShadow: 3,
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
          {t("task.changeStatus")}
        </Typography>

        {TASK_STATUS_ITEMS.map((item) => {
          const isSelected = Number(statusTask?.status) === item.id;
          const Icon = item.Icon;

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
                  bgcolor: alpha(item.color, 0.12),
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
                {t(item.labelKey)}
              </Typography>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}

export default memo(TaskListTable);
