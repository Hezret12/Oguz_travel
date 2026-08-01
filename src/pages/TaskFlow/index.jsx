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
import { getAllTasksApi } from "../../api/queries/getters";
import { updateTaskApi } from "../../api/queries/patch";
import { deleteTaskApi } from "../../api/queries/delete";

export default function TaskFlow() {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [viewMode, setViewMode] = useState("board"); // 'board' | 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const isCardView = viewMode === "board";

  // API Fetch for tasks
  const { data: apiTasksResponse, refetch } = useGet({
    apiFn: getAllTasksApi,
    key: "tasks",
    params: { page: 1, limit: 10, type: isCardView },
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

  // Get raw tasks list directly from API
  const tasksList = useMemo(() => {
    return Array.isArray(apiTasksResponse)
      ? apiTasksResponse
      : Array.isArray(apiTasksResponse?.data)
      ? apiTasksResponse.data
      : Array.isArray(apiTasksResponse?.data?.data)
      ? apiTasksResponse.data.data
      : [];
  }, [apiTasksResponse]);

  // Filter tasks directly
  const filteredTasks = useMemo(() => {
    return tasksList.filter((task) => {
      const title = String(task.title || task.description || "").toLowerCase();
      const desc = String(task.description || "").toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = title.includes(query) || desc.includes(query);

      const statusVal = String(task.status ?? 1).toLowerCase();
      let matchesStatus = filterStatus === "all";
      if (!matchesStatus) {
        const filterStr = String(filterStatus).toLowerCase();
        if (filterStr === "1" || filterStr === "to do") {
          matchesStatus = statusVal === "1" || statusVal.includes("todo") || statusVal.includes("togo");
        } else if (filterStr === "2" || filterStr === "in progress") {
          matchesStatus = statusVal === "2" || statusVal.includes("progress");
        } else if (filterStr === "3" || filterStr === "completed") {
          matchesStatus = statusVal === "3" || statusVal.includes("complete");
        } else {
          matchesStatus = statusVal === filterStr;
        }
      }

      const priorityVal = String(task.priority || "medium").toLowerCase();
      const matchesPriority =
        filterPriority === "all" ||
        priorityVal.includes(String(filterPriority).toLowerCase());

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasksList, searchQuery, filterStatus, filterPriority]);

  const handleCreateTask = useCallback(() => {
    refetch();
  }, [refetch]);

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
            tasks={filteredTasks}
            columns={columns}
            onMoveTaskStatus={handleMoveTaskStatus}
            onDeleteTask={handleDeleteTask}
            onOpenCreateModal={() => setIsModalOpen(true)}
          />
        ) : (
          <TaskListTable
            tasks={filteredTasks}
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
