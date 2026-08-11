import { useState, useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import { useLocale } from "../../hooks/useLocale";
import { usePageFilters } from "../../hooks/usePageFilters";

import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import TaskFlowHeader from "./Contents/TaskFlowHeader";
import TaskBoardView from "./Contents/TaskBoardView";
import TaskListTable from "./Contents/TaskListTable";
import TaskFilter from "./Contents/TaskFilter";
import FilterDrawer from "../../components/FilterDrawer";
import Pagination from "../../components/Pagination";

import {
  taskFilterActions,
  taskFilterSelectors,
} from "../../store/slices/filters/taskFilterSlice";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { getAllTasksApi } from "../../api/queries/getters";
import { updateTaskApi } from "../../api/queries/patch";
import { deleteTaskApi } from "../../api/queries/delete";

export default function TaskFlow() {
  const { t } = useLocale();

  const [viewMode, setViewMode] = useState("board");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    applied,
    draft,
    isDrawerOpen,
    openDrawer,
    setDraftFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
    searchQuery,
    setSearch,
    page,
    setPage,
    selectsOpen,
    openSelect,
    closeSelect,
    queryParams,
  } = usePageFilters({
    actions: taskFilterActions,
    selectors: taskFilterSelectors,
  });

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    setPage(1);
  }, [setPage]);

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

  // Build params for API filtering matching Swagger MessagesController_getAll
  const finalQueryParams = useMemo(() => {
    const params = {
      ...queryParams,
      type: viewMode === "board" ? false : true,
    };
    if (params.status && params.status !== "all") {
      params.status = Number(params.status) || params.status;
    }
    return params;
  }, [queryParams, viewMode]);

  const {
    data: apiTasksResponse,
    totalItems,
    pageCount,
    refetch,
    isLoading,
    isFetching,
    isError,
  } = usePagginationGet({
    apiFn: getAllTasksApi,
    key: "tasks",
    params: finalQueryParams,
  });

  const updateTaskMutation = useUpdate({
    apiFn: updateTaskApi,
    key: "tasks",
    idKey: "guid",
    invalidateQueries: ["tasks"],
  });

  const deleteTaskMutation = useDelete({
    deleteFn: deleteTaskApi,
    queryKey: "tasks",
    idKey: "guid",
    invalidateQueries: ["tasks"],
  });

  const columns = useMemo(
    () => [
      {
        id: 1,
        title: t("task.statusToDo"),
        color: "#64748B",
        bgLight: "#F8FAFC",
        borderLight: "#E2E8F0",
      },
      {
        id: 2,
        title: t("task.statusInProgress"),
        color: "#2563EB",
        bgLight: "#EFF6FF",
        borderLight: "#BFDBFE",
      },
      {
        id: 3,
        title: t("task.statusCompleted"),
        color: "#16A34A",
        bgLight: "#F0FDF4",
        borderLight: "#BBF7D0",
      },
    ],
    [t],
  );

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
      } catch (err) {
        console.log(err);
      }
    },
    [updateTaskMutation],
  );

  const handleDeleteTask = useCallback(
    async (taskId) => {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
      } catch (err) {
        console.log(err);
      }
    },
    [deleteTaskMutation],
  );

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      applied.status || applied.priority || applied.due_date || applied.opr_guid
    );
  }, [applied]);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3.5 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      <TaskFlowHeader
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
        onOpenCreateModal={handleOpenCreateModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearch}
        onFilterClick={openDrawer}
        hasActiveFilters={hasActiveFilters}
      />

      <FilterDrawer
        open={isDrawerOpen}
        onClose={cancelFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        onCancel={cancelFilters}
      >
        <TaskFilter
          filters={draft}
          selectsOpen={selectsOpen}
          onFilterChange={setDraftFilter}
          onSelectOpen={openSelect}
          onSelectClose={closeSelect}
        />
      </FilterDrawer>

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
            searchQuery={queryParams.search || ""}
            filterStatus={applied.status}
            filterPriority={applied.priority}
            dueDate={applied.due_date}
            oprGuid={applied.opr_guid}
            onMoveTaskStatus={handleMoveTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onOpenCreateModal={handleOpenCreateModal}
          />
        ) : (
          <TaskListTable
            tasks={tasksList}
            isLoading={isLoading}
            isFetching={isFetching}
            isError={isError}
            onMoveTaskStatus={handleMoveTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </Box>

      {/* Shared App Pagination for Table View */}
      {viewMode === "list" && pageCount > 1 && (
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
