import { useState, useMemo, useCallback } from "react";
import { Box, useTheme } from "@mui/material";
import { useLocale } from "../../hooks/useLocale";
import { useDebounce } from "../../hooks/useDebounce";

import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import TaskFlowHeader from "./Contents/TaskFlowHeader";
import TaskBoardView from "./Contents/TaskBoardView";
import TaskListTable from "./Contents/TaskListTable";
import Pagination from "../../components/Pagination";

import { usePagginationGet } from "../../hooks/usePagginationGet";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { getAllTasksApi } from "../../api/queries/getters";
import { updateTaskApi } from "../../api/queries/patch";
import { deleteTaskApi } from "../../api/queries/delete";

export default function TaskFlow() {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [viewMode, setViewMode] = useState("board");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  const [page, setPage] = useState(1);
  const limit = 40;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [dueDate, setDueDate] = useState("");

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleFilterStatusChange = useCallback((status) => {
    setFilterStatus(status);
    setPage(1);
  }, []);

  const handleFilterPriorityChange = useCallback((priority) => {
    setFilterPriority(priority);
    setPage(1);
  }, []);

  const handleDueDateChange = useCallback((date) => {
    setDueDate(date);
    setPage(1);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  }, []);

  // Build params for API filtering (debounced search, priority, status, due_date, type)
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit,
      type: viewMode === "board" ? false : true,
    };

    if (debouncedSearch && debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    if (filterStatus && filterStatus !== "all") {
      params.status = Number(filterStatus) || filterStatus;
    }
    if (filterPriority && filterPriority !== "all") {
      params.priority = filterPriority;
    }
    if (dueDate) {
      params.due_date = dueDate;
    }

    return params;
  }, [page, limit, viewMode, debouncedSearch, filterStatus, filterPriority, dueDate]);

  // API Fetch for tasks with server-side pagination & query params
  const {
    data: apiTasksResponse,
    totalItems,
    pageCount,
    refetch,
  } = usePagginationGet({
    apiFn: getAllTasksApi,
    key: "tasks",
    params: queryParams,
  });

  const updateTaskMutation = useUpdate({
    apiFn: updateTaskApi,
    key: "tasks",
    idKey: "guid",
  });

  const deleteTaskMutation = useDelete({
    deleteFn: deleteTaskApi,
    queryKey: "tasks",
    idKey: "guid",
  });

  const columns = useMemo(
    () => [
      {
        id: 1,
        title: t("task.statusToDo", "TO DO"),
        color: "#64748B",
        bgLight: "#F8FAFC",
        borderLight: "#E2E8F0",
      },
      {
        id: 2,
        title: t("task.statusInProgress", "IN PROGRESS"),
        color: "#2563EB",
        bgLight: "#EFF6FF",
        borderLight: "#BFDBFE",
      },
      {
        id: 3,
        title: t("task.statusCompleted", "COMPLETED"),
        color: "#16A34A",
        bgLight: "#F0FDF4",
        borderLight: "#BBF7D0",
      },
    ],
    [t]
  );

  // Get raw tasks list directly from API (supports 1D flat array or 3-indexed 2D array: 0=ToDo, 1=InProgress, 2=Completed)
  const tasksList = useMemo(() => {
    let rawData = apiTasksResponse;

    if (!Array.isArray(rawData)) {
      if (Array.isArray(rawData?.data)) {
        rawData = rawData.data;
      } else if (Array.isArray(rawData?.data?.data)) {
        rawData = rawData.data.data;
      } else {
        return [];
      }
    }

    if (!Array.isArray(rawData) || rawData.length === 0) return [];

    if (Array.isArray(rawData[0])) {
      return rawData.flatMap((statusGroup, index) => {
        if (!Array.isArray(statusGroup)) return [];
        const expectedStatus = index + 1;
        return statusGroup.map((task) => ({
          ...task,
          status: task.status ?? expectedStatus,
        }));
      });
    }

    return rawData;
  }, [apiTasksResponse]);

  const handleCreateTask = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  }, []);

  const handleMoveTaskStatus = useCallback(
    async (taskId, newStatus) => {
      try {
        await updateTaskMutation.mutateAsync({
          guid: taskId,
          status: Number(newStatus) || newStatus,
        });
        refetch();
      } catch (err) {
        console.warn("API update task status error:", err);
      }
    },
    [updateTaskMutation, refetch]
  );

  const handleDeleteTask = useCallback(
    async (taskId) => {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        refetch();
      } catch (err) {
        console.warn("API delete task error:", err);
      }
    },
    [deleteTaskMutation, refetch]
  );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3.5 },
        bgcolor: isDark ? "#090D16" : "#F8FAFC",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Isolated TaskFlow Header Component */}
      <TaskFlowHeader
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
        onOpenCreateModal={handleOpenCreateModal}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        filterStatus={filterStatus}
        setFilterStatus={handleFilterStatusChange}
        filterPriority={filterPriority}
        setFilterPriority={handleFilterPriorityChange}
        dueDate={dueDate}
        setDueDate={handleDueDateChange}
      />

      {/* Scrollable Content Area below Fixed Header */}
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {viewMode === "board" ? (
          <TaskBoardView
            columns={columns}
            searchQuery={debouncedSearch}
            filterPriority={filterPriority}
            dueDate={dueDate}
            onMoveTaskStatus={handleMoveTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onOpenCreateModal={handleOpenCreateModal}
          />
        ) : (
          <TaskListTable
            tasks={tasksList}
            onMoveTaskStatus={handleMoveTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </Box>

      {/* Pagination Bar for Board View */}
      {viewMode === "board" && pageCount > 1 && (
        <Box
          sx={{
            pt: 1.5,
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Pagination
            pageIndex={page - 1}
            pageCount={pageCount}
            totalRows={totalItems}
            onPageChange={(newIndex) => setPage(newIndex + 1)}
          />
        </Box>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        open={isModalOpen}
        onClose={handleCloseCreateModal}
        onCreateTask={handleCreateTask}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        task={editingTask}
      />
    </Box>
  );
}
