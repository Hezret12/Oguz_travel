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
import { toTaskApiParams, TASK_STATUS_ITEMS } from "./functions/taskMeta";
import {
  TASK_BOARD_KEY,
  patchTaskInBoardCache,
  removeTaskFromBoardCache,
  resetTaskBoard,
} from "./functions/taskBoardCache";

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
    limit,
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
  // `type` is never sent: `type=true` makes the backend return unpaginated status groups.
  const listQueryParams = useMemo(() => toTaskApiParams(queryParams), [queryParams]);

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

  // No board invalidation here: a status move is applied to the board cache directly
  // (see `patchTaskInBoardCache`), so a successful move costs zero refetches.
  const updateTaskMutation = useUpdate({
    apiFn: updateTaskApi,
    key: "tasks",
    idKey: "guid",
    showSuccessMessage: false,
  });

  const deleteTaskMutation = useDelete({
    deleteFn: deleteTaskApi,
    queryKey: "tasks",
    idKey: "guid",
    isPaginated: true,
  });

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  }, []);

  const queryClient = useQueryClient();

  const handleMoveTaskStatus = useCallback(
    (taskId, newStatus) => {
      const status = Number(newStatus);
      if (!taskId || !TASK_STATUS_ITEMS.some((item) => item.id === status)) return;

      queryClient.cancelQueries({ queryKey: [TASK_BOARD_KEY] });
      patchTaskInBoardCache(queryClient, taskId, { status });

      updateTaskMutation.mutate(
        { guid: taskId, status },
        {
          onSuccess: ({ updatedItem }) => {
            // Put the server's copy (fresh assignees, updatedAt) into the card. The board
            // pages by keyset cursor, so moving a card never shifts other pages — no refetch.
            if (updatedItem?.guid) {
              patchTaskInBoardCache(queryClient, taskId, { ...updatedItem, status });
            }
            // A status-filtered list must drop the row that no longer matches.
            if (viewMode === "list" && applied.status) {
              queryClient.invalidateQueries({ queryKey: ["tasks"] });
            }
          },
          // Roll the optimistic move back to the server's truth.
          onError: () => resetTaskBoard(queryClient),
        },
      );
    },
    [updateTaskMutation, queryClient, viewMode, applied.status],
  );

  const deleteDialog = useDeleteDialog({
    onConfirm: (target) => {
      const guid = typeof target === "string" ? target : target?.guid;
      if (!guid) return;
      deleteTaskMutation.mutate(guid, {
        onSuccess: () => removeTaskFromBoardCache(queryClient, guid),
      });
    },
  });

  const handleDeleteTask = useCallback(
    (taskOrGuid) => {
      deleteDialog.open(taskOrGuid);
    },
    [deleteDialog],
  );

  const isBoardFetching = useIsFetching({ queryKey: [TASK_BOARD_KEY] }) > 0;

  const handleRefetch = useCallback(() => {
    if (viewMode === "board") {
      resetTaskBoard(queryClient);
    } else {
      refetch();
    }
  }, [viewMode, queryClient, refetch]);

  const isCurrentFetching = viewMode === "board" ? isBoardFetching : isFetching;

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        applied.status ||
          applied.priority ||
          applied.date_from ||
          applied.date_to ||
          applied.opr_guid,
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
            dateFrom={applied.date_from}
            dateTo={applied.date_to}
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
            page={page}
            limit={limit}
            pageCount={pageCount}
            totalItems={totalItems}
            onPageChange={setPage}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={setSort}
            onMoveTaskStatus={handleMoveTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </Box>

      <CreateTaskModal
        open={isModalOpen}
        onClose={handleCloseCreateModal}
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
