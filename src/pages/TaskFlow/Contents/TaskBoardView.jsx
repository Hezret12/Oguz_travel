import { memo, useState, useMemo, useCallback, useEffect, useRef } from "react";
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
import ScheduleIcon from "@mui/icons-material/Schedule";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddIcon from "@mui/icons-material/Add";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocale } from "../../../hooks/useLocale";
import { getAllTasksApi } from "../../../api/queries/getters";
import AppAvatarGroup from "../../../components/AppAvatarGroup";
import TableErrorState from "../../../components/TableErrorState";
import {
  TASK_STATUS_ITEMS,
  getTaskPriority,
  getTaskAssignees,
  getTaskAttachments,
  getTaskWindowParts,
  isTaskOverdue,
  toTaskApiParams,
} from "../functions/taskMeta";
import { TASK_BOARD_KEY } from "../functions/taskBoardCache";

const COLUMN_PAGE_SIZE = 10;
const CARD_HEIGHT = 160;

/**
 * `/messages/get-all-tasks` keyset body: `{ data: Task[], meta: { nextCursor, totalItems? } }`.
 * `totalItems` only comes with the first page (the column badge).
 */
const extractItems = (responseBody) =>
  Array.isArray(responseBody?.data) ? responseBody.data : [];

const windowTextSx = {
  fontSize: "0.75rem",
  fontWeight: 600,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

/** `start → end` row; the end turns red once an unfinished task is past it. */
const TaskWindow = ({ timeWindow, isOverdue, t }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.6,
      alignSelf: "flex-start",
      px: 0.75,
      py: 0.4,
      borderRadius: "6px",
      bgcolor: "action.hover",
      color: "text.secondary",
      maxWidth: "100%",
      overflow: "hidden",
    }}
  >
    <ScheduleIcon sx={{ fontSize: 14 }} />
    {timeWindow.start && (
      <Typography component="span" sx={{ ...windowTextSx, color: "text.primary" }}>
        {timeWindow.start}
      </Typography>
    )}
    <ArrowForwardIcon sx={{ fontSize: 12, opacity: 0.7 }} />
    {timeWindow.end ? (
      <Typography
        component="span"
        sx={{ ...windowTextSx, color: isOverdue ? "error.main" : "text.primary" }}
      >
        {timeWindow.end}
      </Typography>
    ) : (
      <Typography component="span" sx={windowTextSx}>
        —
      </Typography>
    )}
    {isOverdue && (
      <Typography
        component="span"
        sx={{ ...windowTextSx, fontSize: "0.68rem", color: "error.main", ml: 0.25 }}
      >
        · {t("task.overdue")}
      </Typography>
    )}
  </Box>
);

/**
 * Memoized so a card only re-renders when its own task object changes: the cache
 * helpers replace just the patched card, and the other callbacks are stable.
 */
const TaskCard = memo(function TaskCard({ task, color, t, onEditTask, onOpenMenu }) {
  const priority = getTaskPriority(task.priority);
  const timeWindow = getTaskWindowParts(task);
  const isOverdue = isTaskOverdue(task);
  const assigneesList = getTaskAssignees(task);
  const attachmentCount = getTaskAttachments(task).length;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "10px",
        border: "1px solid",
        borderColor: "divider",
        borderLeft: `3.5px solid ${color}`,
        bgcolor: "background.paper",
        height: CARD_HEIGHT,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        // Off-screen cards skip layout and paint, so long scrolled columns stay cheap.
        contentVisibility: "auto",
        containIntrinsicSize: `auto ${CARD_HEIGHT}px`,
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
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
              onClick={(e) => onOpenMenu(e.currentTarget, task)}
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

        {timeWindow && <TaskWindow timeWindow={timeWindow} isOverdue={isOverdue} t={t} />}

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
            {attachmentCount > 0 && (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.35,
                  color: "text.secondary",
                }}
              >
                <AttachFileIcon sx={{ fontSize: 17, color: "primary.main" }} />
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
});

const TaskBoardColumn = memo(function TaskBoardColumn({
  col,
  filterParams,
  onEditTask,
  onOpenCreateModal,
  onOpenMenu,
}) {
  const { t } = useLocale();
  const scrollContainerRef = useRef(null);

  // Each column pages independently: asking the server for this status only is
  // what keeps a busy "To Do" column from starving the other two.
  // No `type`: `type=true` makes the backend return unpaginated status groups instead of tasks.
  const columnParams = useMemo(
    () => ({ ...filterParams, status: col.id, limit: COLUMN_PAGE_SIZE }),
    [filterParams, col.id],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
    isFetchNextPageError,
    refetch,
  } = useInfiniteQuery({
    queryKey: [TASK_BOARD_KEY, col.id, columnParams],
    // Keyset pagination: "" asks for the first page, then each page hands back the
    // cursor for the next. Moving cards never shifts pages, and deep scrolling stays O(page).
    queryFn: async ({ pageParam }) => {
      const res = await getAllTasksApi({ ...columnParams, cursor: pageParam });
      return res?.data;
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage?.meta?.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
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
  const totalCount = data?.pages?.[0]?.meta?.totalItems ?? tasks.length;

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasNextPage || isFetchingNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 80) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // The next page only loads on scroll, and a column with no overflow never scrolls. That
  // happens when cards are moved or deleted out of it, or on a tall screen: the rest of the
  // column would stay out of reach. So whenever the loaded cards do not fill the column and
  // the server has more, the next page is asked for here. A failed page is not retried in a
  // loop — the retry row below is for that.
  const loadedCount = tasks.length;
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasNextPage || isFetching || isFetchNextPageError) return;
    if (container.scrollHeight <= container.clientHeight + 80) fetchNextPage();
  }, [loadedCount, hasNextPage, isFetching, isFetchNextPageError, fetchNextPage]);

  const showSkeletons = isLoading && tasks.length === 0;
  // A failed request must not read as "no tasks": with nothing loaded the column shows the
  // error and a retry instead of the empty message.
  const showError = isError && tasks.length === 0;
  const showEmptyState = !isLoading && !isError && tasks.length === 0;

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
        sx={(theme) => ({
          bgcolor: alpha(theme.palette.text.primary, 0.025),
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "12px",
          p: 1.5,
          height: "100%",
          maxHeight: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          overflow: "hidden",
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
              <Skeleton variant="rounded" height={CARD_HEIGHT} sx={{ borderRadius: "10px" }} />
              <Skeleton variant="rounded" height={CARD_HEIGHT} sx={{ borderRadius: "10px" }} />
            </Box>
          )}

          {showError && <TableErrorState onRetry={refetch} isRetrying={isFetching} />}

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
                {t("task.noTasksInColumn")}
              </Typography>
              {onOpenCreateModal && (
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

          {tasks.map((task) => (
            <TaskCard
              key={task.guid}
              task={task}
              color={col.color}
              t={t}
              onEditTask={onEditTask}
              onOpenMenu={onOpenMenu}
            />
          ))}

          {/* The cards already loaded stay; only the page that failed is offered again. */}
          {isFetchNextPageError && !isFetchingNextPage && (
            <Box sx={{ flexShrink: 0 }}>
              <TableErrorState onRetry={fetchNextPage} isRetrying={isFetchingNextPage} />
            </Box>
          )}

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
  dateFrom = "",
  dateTo = "",
  oprGuid = "",
  onMoveTaskStatus,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal,
}) {
  const { t } = useLocale();

  const [activeTask, setActiveTask] = useState(null);
  const [taskMenuAnchor, setTaskMenuAnchor] = useState(null);

  const handleMenuClose = () => {
    setTaskMenuAnchor(null);
    setActiveTask(null);
  };

  const handleOpenMenu = useCallback((anchor, task) => {
    setTaskMenuAnchor(anchor);
    setActiveTask(task);
  }, []);

  // `status` is intentionally left out: each column pins its own.
  const filterParams = useMemo(() => {
    const params = {};
    if (searchQuery && searchQuery.trim()) params.search = searchQuery.trim();
    if (filterPriority && filterPriority !== "all") {
      params.priority = filterPriority;
    }
    return toTaskApiParams({
      ...params,
      date_from: dateFrom,
      date_to: dateTo,
      opr_guid: oprGuid,
    });
  }, [searchQuery, filterPriority, dateFrom, dateTo, oprGuid]);

  const visibleColumns = useMemo(() => {
    if (!filterStatus || filterStatus === "all") return TASK_STATUS_ITEMS;
    return TASK_STATUS_ITEMS.filter(
      (col) => Number(filterStatus) === Number(col.id),
    );
  }, [filterStatus]);

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
            onEditTask={onEditTask}
            onOpenCreateModal={onOpenCreateModal}
            onOpenMenu={handleOpenMenu}
          />
        ))}
      </Grid>

      {/* Card context menu: edit, status change and delete */}
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
