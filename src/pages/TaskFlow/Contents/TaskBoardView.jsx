import { memo, useState, useMemo, useCallback, useRef } from "react";
import {
  Box,
  Button,
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
  CircularProgress,
  Skeleton,
  alpha,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddIcon from "@mui/icons-material/Add";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocale } from "../../../hooks/useLocale";
import { useDateFormat } from "../../../functions/generalHelpers";
import { getAllTasksApi } from "../../../api/queries/getters";
import AppAvatarGroup from "../../../components/AppAvatarGroup";
import {
  TASK_STATUS_ITEMS,
  getTaskPriority,
  getTaskAssignees,
  getTaskAttachments,
} from "../functions/taskMeta";

const COLUMN_PAGE_SIZE = 10;

/** The tasks endpoint has returned a few different envelopes over time. */
const extractItems = (responseBody) => {
  if (Array.isArray(responseBody?.data?.data)) return responseBody.data.data;
  if (Array.isArray(responseBody?.data)) return responseBody.data;
  if (Array.isArray(responseBody?.items)) return responseBody.items;
  if (Array.isArray(responseBody)) return responseBody;
  return [];
};

const extractTotalPages = (responseBody) =>
  responseBody?.data?.totalPages ??
  responseBody?.totalPages ??
  responseBody?.meta?.totalPages ??
  responseBody?.data?.meta?.totalPages;

const extractTotalItems = (responseBody) =>
  responseBody?.data?.totalItems ??
  responseBody?.totalItems ??
  responseBody?.meta?.totalItems ??
  responseBody?.data?.meta?.totalItems;

const TaskBoardColumn = memo(function TaskBoardColumn({
  col,
  filterParams,
  draggingTask,
  onEditTask,
  onDragStartTask,
  onDragEndTask,
  onDropTask,
  onOpenCreateModal,
  setTaskMenuAnchor,
  setActiveTask,
}) {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const scrollContainerRef = useRef(null);
  const [isDropTarget, setIsDropTarget] = useState(false);

  // Each column pages independently: asking the server for this status only is
  // what keeps a busy "To Do" column from starving the other two.
  const columnParams = useMemo(
    () => ({ ...filterParams, type: true, status: col.id, limit: COLUMN_PAGE_SIZE }),
    [filterParams, col.id],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["tasks-board", col.id, columnParams],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getAllTasksApi({ ...columnParams, page: pageParam });
      return res?.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = extractTotalPages(lastPage);
      if (totalPages !== undefined) {
        return allPages.length < totalPages ? allPages.length + 1 : undefined;
      }
      return extractItems(lastPage).length >= COLUMN_PAGE_SIZE
        ? allPages.length + 1
        : undefined;
    },
  });

  const tasks = useMemo(() => {
    if (!data?.pages) return [];
    const byGuid = new Map();
    data.pages.forEach((page) => {
      extractItems(page).forEach((task) => {
        if (task?.guid) byGuid.set(task.guid, task);
      });
    });
    return Array.from(byGuid.values());
  }, [data]);

  // Prefer the server's count so the badge does not only reflect what is loaded.
  const totalCount = useMemo(() => {
    const fromServer = data?.pages?.length
      ? extractTotalItems(data.pages[data.pages.length - 1])
      : undefined;
    return fromServer ?? tasks.length;
  }, [data, tasks.length]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasNextPage || isFetchingNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 80) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const canAcceptDrop =
    Boolean(draggingTask) && Number(draggingTask.status) !== col.id;

  const handleDragOver = (e) => {
    if (!canAcceptDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isDropTarget) setIsDropTarget(true);
  };

  const handleDragLeave = (e) => {
    // Ignore moves between children of this column.
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDropTarget(false);
  };

  const handleDrop = (e) => {
    if (!canAcceptDrop) return;
    e.preventDefault();
    setIsDropTarget(false);
    onDropTask(col.id);
  };

  const showSkeletons = isLoading && tasks.length === 0;
  const showEmptyState = !isLoading && tasks.length === 0;

  return (
    <Grid
      size={{ xs: 12, sm: 6, lg: 4 }}
      sx={{
        height: { xs: 520, lg: "100%" },
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={(theme) => ({
          bgcolor: isDropTarget
            ? alpha(col.color, 0.12)
            : alpha(theme.palette.text.primary, 0.025),
          border: isDropTarget ? "2px dashed" : "1px solid",
          borderColor: isDropTarget ? col.color : "divider",
          borderRadius: "12px",
          p: isDropTarget ? "11px" : 1.5,
          height: "100%",
          maxHeight: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          overflow: "hidden",
          transition: "background-color 0.15s ease, border-color 0.15s ease",
        })}
      >
        {/* Column header with counter */}
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
              {t(col.labelKey)}
            </Typography>
            <Chip
              label={totalCount}
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

          {isFetching && !isFetchingNextPage && (
            <CircularProgress size={14} sx={{ color: col.color }} />
          )}
        </Box>

        {/* Task cards — infinite scroll */}
        <Box
          ref={scrollContainerRef}
          onScroll={handleScroll}
          sx={(theme) => ({
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
            flexGrow: 1,
            minHeight: 0,
            overflowY: "auto",
            pr: 0.5,
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: alpha(theme.palette.text.secondary, 0.35),
              borderRadius: "10px",
              transition: "background-color 0.2s ease-in-out",
            },
            "&:hover::-webkit-scrollbar-thumb": {
              backgroundColor: alpha(theme.palette.text.secondary, 0.55),
            },
          })}
        >
          {showSkeletons && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              <Skeleton variant="rounded" height={145} sx={{ borderRadius: "10px" }} />
              <Skeleton variant="rounded" height={145} sx={{ borderRadius: "10px" }} />
            </Box>
          )}

          {showEmptyState && (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                py: 4,
                px: 1,
                textAlign: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontSize: "0.8rem" }}
              >
                {canAcceptDrop ? t("task.dropHere") : t("task.noTasksInColumn")}
              </Typography>
              {!canAcceptDrop && onOpenCreateModal && (
                <Button
                  size="small"
                  startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                  onClick={onOpenCreateModal}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.775rem",
                    color: col.color,
                  }}
                >
                  {t("task.addFirstTask")}
                </Button>
              )}
            </Box>
          )}

          {tasks.map((task) => {
            const priority = getTaskPriority(task.priority);
            const formattedDate = formatChange(task.due_date || task.dueDate, {
              dateOnly: true,
            });
            const assigneesList = getTaskAssignees(task);
            const attachmentCount = getTaskAttachments(task).length;
            const isDragging = draggingTask?.guid === task.guid;

            return (
              <Card
                key={task.guid}
                elevation={0}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", task.guid);
                  onDragStartTask(task);
                }}
                onDragEnd={onDragEndTask}
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
                  cursor: "grab",
                  opacity: isDragging ? 0.45 : 1,
                  transition: "all 0.15s ease-in-out",
                  "&:active": { cursor: "grabbing" },
                  "&:hover": {
                    boxShadow: 2,
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
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          "&:hover": { color: "primary.main" },
                        }}
                        onClick={() => onEditTask?.(task)}
                      >
                        {task.title || task.description}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setTaskMenuAnchor(e.currentTarget);
                          setActiveTask(task);
                        }}
                        sx={{ color: "text.secondary", p: 0.1, ml: 0.5 }}
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
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          lineHeight: 1.35,
                        }}
                      >
                        {task.description}
                      </Typography>
                    )}
                  </Box>

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
                        label={t(priority.labelKey)}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          bgcolor: alpha(priority.color, 0.12),
                          color: priority.color,
                          borderRadius: "5px",
                          px: 0.5,
                        }}
                      />
                      {formattedDate && (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.4,
                            color: "text.secondary",
                          }}
                        >
                          <CalendarTodayIcon sx={{ fontSize: 15 }} />
                          <Typography
                            component="span"
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              lineHeight: 1,
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {formattedDate}
                          </Typography>
                        </Box>
                      )}
                      {attachmentCount > 0 && (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.35,
                            color: "text.secondary",
                          }}
                        >
                          <AttachFileIcon
                            sx={{ fontSize: 17, color: "primary.main" }}
                          />
                          <Typography
                            component="span"
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              lineHeight: 1,
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {attachmentCount}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <AppAvatarGroup items={assigneesList} max={6} size={22} />
                  </Box>
                </CardContent>
              </Card>
            );
          })}

          {isFetchingNextPage && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 1.5,
                flexShrink: 0,
              }}
            >
              <CircularProgress size={20} sx={{ color: col.color }} />
            </Box>
          )}
        </Box>
      </Box>
    </Grid>
  );
});

function TaskBoardView({
  searchQuery = "",
  filterStatus = "",
  filterPriority = "",
  dueDate = "",
  oprGuid = "",
  onMoveTaskStatus,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal,
}) {
  const { t } = useLocale();

  const [activeTask, setActiveTask] = useState(null);
  const [taskMenuAnchor, setTaskMenuAnchor] = useState(null);
  const [draggingTask, setDraggingTask] = useState(null);

  const handleMenuClose = () => {
    setTaskMenuAnchor(null);
    setActiveTask(null);
  };

  // `status` is intentionally left out: each column pins its own.
  const filterParams = useMemo(() => {
    const params = {};
    if (searchQuery && searchQuery.trim()) params.search = searchQuery.trim();
    if (filterPriority && filterPriority !== "all") {
      params.priority = filterPriority;
    }
    if (dueDate) params.due_date = dueDate;
    if (oprGuid) params.opr_guid = oprGuid;
    return params;
  }, [searchQuery, filterPriority, dueDate, oprGuid]);

  const visibleColumns = useMemo(() => {
    if (!filterStatus || filterStatus === "all") return TASK_STATUS_ITEMS;
    return TASK_STATUS_ITEMS.filter(
      (col) => Number(filterStatus) === Number(col.id),
    );
  }, [filterStatus]);

  const handleDragStartTask = useCallback((task) => {
    setDraggingTask({ guid: task.guid, status: Number(task.status) || 1 });
  }, []);

  const handleDragEndTask = useCallback(() => {
    setDraggingTask(null);
  }, []);

  const handleDropTask = useCallback(
    (targetStatus) => {
      if (!draggingTask) return;
      if (Number(draggingTask.status) !== Number(targetStatus)) {
        onMoveTaskStatus?.(draggingTask.guid, targetStatus);
      }
      setDraggingTask(null);
    },
    [draggingTask, onMoveTaskStatus],
  );

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
        {visibleColumns.map((col) => (
          <TaskBoardColumn
            key={col.id}
            col={col}
            filterParams={filterParams}
            draggingTask={draggingTask}
            onEditTask={onEditTask}
            onDragStartTask={handleDragStartTask}
            onDragEndTask={handleDragEndTask}
            onDropTask={handleDropTask}
            onOpenCreateModal={onOpenCreateModal}
            setTaskMenuAnchor={setTaskMenuAnchor}
            setActiveTask={setActiveTask}
          />
        ))}
      </Grid>

      {/* Card context menu — the keyboard/touch path for what dragging does */}
      <Menu
        anchorEl={taskMenuAnchor}
        open={Boolean(taskMenuAnchor)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              minWidth: 190,
              boxShadow: 3,
              border: "1px solid",
              borderColor: "divider",
              "& .MuiList-root": { py: 0.75 },
              "& .MuiMenuItem-root": {
                transition: "background-color 0.15s ease",
                borderRadius: "6px",
                mx: 0.75,
              },
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeTask) onEditTask?.(activeTask);
            handleMenuClose();
          }}
          sx={{ py: 0.85, px: 1.5, minHeight: 36 }}
        >
          <ListItemIcon sx={{ minWidth: 30 }}>
            <EditOutlinedIcon sx={{ fontSize: 19, color: "primary.main" }} />
          </ListItemIcon>
          <ListItemText
            primary={t("task.editTask")}
            slotProps={{ primary: { fontWeight: 600, fontSize: "0.825rem" } }}
          />
        </MenuItem>

        <Divider sx={{ my: 0.5, mx: 1 }} />

        {TASK_STATUS_ITEMS.map((item) => {
          const isSelected = Number(activeTask?.status) === item.id;
          const Icon = item.Icon;

          return (
            <MenuItem
              key={item.id}
              onClick={() => {
                if (activeTask) onMoveTaskStatus?.(activeTask.guid, item.id);
                handleMenuClose();
              }}
              selected={isSelected}
              sx={{ py: 0.75, px: 1.5, minHeight: 36 }}
            >
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Icon sx={{ fontSize: 18, color: item.color }} />
              </ListItemIcon>
              <ListItemText
                primary={t(item.labelKey)}
                slotProps={{
                  primary: {
                    fontSize: "0.8rem",
                    fontWeight: isSelected ? 700 : 500,
                  },
                }}
              />
            </MenuItem>
          );
        })}

        <Divider sx={{ my: 0.5, mx: 1 }} />

        <MenuItem
          onClick={() => {
            if (activeTask) onDeleteTask?.(activeTask);
            handleMenuClose();
          }}
          sx={{ py: 0.85, px: 1.5, minHeight: 36, color: "error.main" }}
        >
          <ListItemIcon sx={{ minWidth: 30 }}>
            <DeleteOutlinedIcon sx={{ fontSize: 19 }} color="error" />
          </ListItemIcon>
          <ListItemText
            primary={t("task.deleteTask")}
            slotProps={{
              primary: {
                fontWeight: 600,
                fontSize: "0.825rem",
                color: "error.main",
              },
            }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default memo(TaskBoardView);
