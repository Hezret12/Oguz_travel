import { useState, useMemo, useCallback } from "react";
import { Box, useTheme } from "@mui/material";
import { useLocale } from "../../hooks/useLocale";

import CreateTaskModal from "./CreateTaskModal";
import TaskFlowHeader from "./Contents/TaskFlowHeader";
import TaskBoardView from "./Contents/TaskBoardView";
import TaskListTable from "./Contents/TaskListTable";

import { useGet } from "../../hooks/CRUD/useGet";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { getAllNotificationsApi } from "../../api/queries/getters";
import { updateTaskApi } from "../../api/queries/patch";
import { deleteTaskApi } from "../../api/queries/delete";


export default function TaskFlow() {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { data: apiTasksResponse, refetch } = useGet({
    apiFn: getAllNotificationsApi,
    key: "tasks",
    params: { isMessage: false },
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
        id: "To Do",
        title: t("task.statusToDo"),
        color: "#64748B",
        bgLight: "#F8FAFC",
        borderLight: "#E2E8F0",
      },
      {
        id: "In Progress",
        title: t("task.statusInProgress"),
        color: "#2563EB",
        bgLight: "#EFF6FF",
        borderLight: "#BFDBFE",
      },
      {
        id: "Completed",
        title: t("task.statusCompleted"),
        color: "#16A34A",
        bgLight: "#F0FDF4",
        borderLight: "#BBF7D0",
      },
    ],
    [t]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("board"); // 'board' | 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");



  const handleCreateTask = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleMoveTaskStatus = useCallback(async (taskId, newStatus) => {
    const statusMap = {
      "To Do": "todo",
      "In Progress": "inprogress",
      "Completed": "completed",
    };

    try {
      await updateTaskMutation.mutateAsync({
        guid: taskId,
        status: statusMap[newStatus] || newStatus.toLowerCase(),
      });
      refetch();
    } catch (err) {
      console.warn("API update task status error:", err);
    }
  }, [updateTaskMutation, refetch]);

  const handleDeleteTask = useCallback(async (taskId) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      refetch();
    } catch (err) {
      console.warn("API delete task error:", err);
    }
  }, [deleteTaskMutation, refetch]);

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
        setViewMode={setViewMode}
        onOpenCreateModal={() => setIsModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
      />

      {/* Scrollable Content Area below Fixed Header */}
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflowY: viewMode === "board" ? "auto" : "hidden",
          pr: 0.5,
        }}
      >
        {viewMode === "board" ? (
          <TaskBoardView
            tasks={[]}
            columns={columns}
            onMoveTaskStatus={handleMoveTaskStatus}
            onDeleteTask={handleDeleteTask}
            onOpenCreateModal={() => setIsModalOpen(true)}
          />
        ) : (
          <TaskListTable
            tasks={[]}
            onMoveTaskStatus={handleMoveTaskStatus}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </Box>

      {/* Create Task Modal */}
      <CreateTaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </Box>
  );
}
