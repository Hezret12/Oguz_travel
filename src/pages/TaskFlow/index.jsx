import { useState, useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { useLocale } from "../../hooks/useLocale";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import TaskFlowHeader from "./Contents/TaskFlowHeader";
import TaskBoardView from "./Contents/TaskBoardView";
import TaskListTable from "./Contents/TaskListTable";
import TaskFilter from "./Contents/TaskFilter";
import FilterDrawer from "../../components/FilterDrawer";
import Pagination from "../../components/Pagination";
import DeleteDialog from "../../components/DeleteDialog";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";

import {
  taskFilterActions,
  taskFilterSelectors,
} from "../../store/slices/filters/taskFilterSlice";
import { useTableFilters, useDrawerFilters } from "../../hooks/usePageFilters";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { getAllTasksApi } from "../../api/queries/getters";
import { updateTaskApi } from "../../api/queries/patch";
import { deleteTaskApi } from "../../api/queries/delete";

const TaskFilterDrawer = () => {
  const {
    draft,
    isDrawerOpen,
    setDraftFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
    selectsOpen,
    openSelect,
    closeSelect,
  } = useDrawerFilters({
    actions: taskFilterActions,
    selectors: taskFilterSelectors,
  });

  return (
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
  );
};

export default function TaskFlow() {
  const { t } = useLocale();
  useDocumentTitle(t("sidebar.taskFlow"));

  const [viewMode, setViewMode] = useState("board");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    applied,
    openDrawer,
    searchQuery,
    setSearch,
    page,
    setPage,
    sortBy,
    sortOrder,
    setSort,
    queryParams,
  } = useTableFilters({
    actions: taskFilterActions,
    selectors: taskFilterSelectors,
  });

  const handleViewModeChange = useCallback(
    (mode) => {
      setViewMode(mode);
      setPage(1);
    },
    [setPage],
  );

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

  // The list view asks for a flat, paginated result set; the board view issues
  // its own per-column queries, so this one stays disabled there.
  const listQueryParams = useMemo(() => {
    const params = { ...queryParams, type: true };
    if (params.status && params.status !== "all") {
      params.status = Number(params.status) || params.status;
    }
    return params;
  }, [queryParams]);

  const {
    data: tasksList,
    totalItems,
    pageCount,
    refetch,
    isLoading,
    isFetching,
    isError,
  } = usePagginationGet({
    apiFn: getAllTasksApi,
    key: "tasks",
    params: listQueryParams,
    options: {
      enabled: viewMode === "list",
    },
  });

  const updateTaskMutation = useUpdate({
    apiFn: updateTaskApi,
    key: "tasks",
    idKey: "guid",
    invalidateQueries: ["tasks-board"],
    showSuccessMessage: false,
  });

  const deleteTaskMutation = useDelete({
    deleteFn: deleteTaskApi,
    queryKey: "tasks",
    idKey: "guid",
    invalidateQueries: ["tasks-board"],
    isPaginated: true,
  });

  const handleCreateTask = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  }, []);

  const handleMoveTaskStatus = useCallback(
    (taskId, newStatus) => {
      updateTaskMutation.mutate({
        guid: taskId,
        status: Number(newStatus) || newStatus,
      });
    },
    [updateTaskMutation],
  );

  const deleteDialog = useDeleteDialog({
    onConfirm: (target) => {
      const guid = typeof target === "string" ? target : target?.guid;
      if (guid) deleteTaskMutation.mutate(guid);
    },
  });

  const handleDeleteTask = useCallback(
    (taskOrGuid) => {
      deleteDialog.open(taskOrGuid);
    },
    [deleteDialog],
  );

  const queryClient = useQueryClient();
  const isBoardFetching = useIsFetching({ queryKey: ["tasks-board"] }) > 0;

  const handleRefetch = useCallback(() => {
    if (viewMode === "board") {
      queryClient.invalidateQueries({ queryKey: ["tasks-board"] });
    } else {
      refetch();
    }
  }, [viewMode, queryClient, refetch]);

  const isCurrentFetching = viewMode === "board" ? isBoardFetching : isFetching;

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        applied.status || applied.priority || applied.due_date || applied.opr_guid,
      ),
    [applied],
  );

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
        onRefetch={handleRefetch}
        isFetching={isCurrentFetching}
      />

      <TaskFilterDrawer />

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
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={setSort}
            onMoveTaskStatus={handleMoveTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </Box>

      {viewMode === "list" && (
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

      <CreateTaskModal
        open={isModalOpen}
        onClose={handleCloseCreateModal}
        onCreateTask={handleCreateTask}
      />

      <EditTaskModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        task={editingTask}
      />

      <DeleteDialog
        open={deleteDialog.isOpen}
        isLoading={deleteTaskMutation.isPending}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
      />
    </Box>
  );
}
