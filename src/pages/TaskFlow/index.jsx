import { useState, useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { useLocale } from "../../hooks/useLocale";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import TaskFlowHeader from "./Contents/TaskFlowHeader";
import TaskBoardView from "./Contents/TaskBoardView";
import TaskFilter from "./Contents/TaskFilter";
import FilterDrawer from "../../components/FilterDrawer";
import DeleteDialog from "../../components/DeleteDialog";
import { useDeleteDialog } from "../../hooks/useDeleteDialog";

import {
  taskFilterActions,
  taskFilterSelectors,
} from "../../store/slices/filters/taskFilterSlice";
import { useTableFilters, useDrawerFilters } from "../../hooks/usePageFilters";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { updateTaskApi } from "../../api/queries/patch";
import { deleteTaskApi } from "../../api/queries/delete";
import { TASK_STATUS_ITEMS } from "./functions/taskMeta";
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    applied,
    openDrawer,
    searchQuery,
    setSearch,
    queryParams,
  } = useTableFilters({
    actions: taskFilterActions,
    selectors: taskFilterSelectors,
  });

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
          },
          // Roll the optimistic move back to the server's truth.
          onError: () => resetTaskBoard(queryClient),
        },
      );
    },
    [updateTaskMutation, queryClient],
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

  // `open` never changes, so the boards below keep the same `onDeleteTask` prop
  // instead of getting a new one every time the delete dialog opens or closes.
  const handleDeleteTask = deleteDialog.open;

  const isBoardFetching = useIsFetching({ queryKey: [TASK_BOARD_KEY] }) > 0;

  const handleRefetch = useCallback(() => resetTaskBoard(queryClient), [queryClient]);

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
        onOpenCreateModal={handleOpenCreateModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearch}
        onFilterClick={openDrawer}
        hasActiveFilters={hasActiveFilters}
        onRefetch={handleRefetch}
        isFetching={isBoardFetching}
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
