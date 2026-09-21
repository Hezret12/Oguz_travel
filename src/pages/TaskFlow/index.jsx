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
import { toTaskApiParams, TASK_STATUS_ITEMS } from "./functions/taskMeta";

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
  // (see `moveTaskInBoardCache`), so a successful move costs zero refetches.
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
    invalidateQueries: ["tasks-board"],
    isPaginated: true,
  });

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  }, []);

  const queryClient = useQueryClient();

  // Moves a card between the board's per-column infinite queries (key
  // `["tasks-board", statusId, params]`) and shifts each column's `meta.totalItems`
  // badge by one, so a drop needs no refetch. No-op when the card isn't loaded on the board.
  const moveTaskInBoardCache = useCallback(
    (guid, targetStatus, patch = {}) => {
      const entries = queryClient.getQueriesData({ queryKey: ["tasks-board"] });
      const task = entries
        .flatMap(([, data]) => data?.pages ?? [])
        .flatMap((page) => (Array.isArray(page?.data) ? page.data : []))
        .find((item) => item?.guid === guid);
      if (!task) return;

      const sourceStatus = Number(task.status);
      const movedTask = { ...task, ...patch, status: targetStatus };
      entries.forEach(([queryKey, data]) => {
        if (!data?.pages) return;
        const columnStatus = Number(queryKey[1]);
        const isTarget = columnStatus === targetStatus;
        const countDelta =
          sourceStatus === targetStatus ? 0 : isTarget ? 1 : columnStatus === sourceStatus ? -1 : 0;

        queryClient.setQueryData(queryKey, {
          ...data,
          pages: data.pages.map((page, index) => {
            const items = (Array.isArray(page?.data) ? page.data : []).filter(
              (item) => item?.guid !== guid,
            );
            const totalItems = Number(page?.meta?.totalItems);
            return {
              ...page,
              data: isTarget && index === 0 ? [movedTask, ...items] : items,
              ...(page?.meta && Number.isFinite(totalItems) && {
                meta: { ...page.meta, totalItems: Math.max(0, totalItems + countDelta) },
              }),
            };
          }),
        });
      });
    },
    [queryClient],
  );

  const handleMoveTaskStatus = useCallback(
    (taskId, newStatus) => {
      const status = Number(newStatus);
      if (!taskId || !TASK_STATUS_ITEMS.some((item) => item.id === status)) return;

      queryClient.cancelQueries({ queryKey: ["tasks-board"] });
      moveTaskInBoardCache(taskId, status);

      updateTaskMutation.mutate(
        { guid: taskId, status },
        {
          onSuccess: ({ updatedItem }) => {
            // Put the server's copy (fresh assignees, updatedAt) into the card. The board
            // pages by keyset cursor, so moving a card never shifts other pages — no refetch.
            if (updatedItem?.guid) moveTaskInBoardCache(taskId, status, updatedItem);
            // A status-filtered list must drop the row that no longer matches.
            if (viewMode === "list" && applied.status) {
              queryClient.invalidateQueries({ queryKey: ["tasks"] });
            }
          },
          // Roll the optimistic move back to the server's truth.
          onError: () => queryClient.invalidateQueries({ queryKey: ["tasks-board"] }),
        },
      );
    },
    [updateTaskMutation, moveTaskInBoardCache, queryClient, viewMode, applied.status],
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
