import { useState, useMemo, useCallback } from "react";
import { Box, useTheme } from "@mui/material";

import CreateTaskModal from "./CreateTaskModal";
import TaskFlowHeader from "./Contents/TaskFlowHeader";
import TaskBoardView from "./Contents/TaskBoardView";
import TaskListTable from "./Contents/TaskListTable";

// Initial Task Data based on image_0.png
const INITIAL_TASKS = [
  // TO DO
  {
    id: "task-1",
    title: "Website accessibility compliance review",
    description:
      "Ensure all UI components meet WCAG 2.1 AA accessibility standards...",
    status: "To Do",
    priority: "Medium",
    dueDate: "Jul 30",
    assignees: [
      { id: "1", name: "Alex Rivard", initials: "RI", color: "#F59E0B" },
      { id: "2", name: "Amelie Chen", initials: "AC", color: "#EC4899" },
    ],
  },
  {
    id: "task-2",
    title: "Onboard new sales hires",
    description:
      "Prepare onboarding materials and schedule training sessions for 3 new...",
    status: "To Do",
    priority: "Medium",
    dueDate: "Aug 17",
    assignees: [
      { id: "7", name: "Alice Green", initials: "AG", color: "#A855F7" },
    ],
  },
  {
    id: "task-3",
    title: "Annual security audit preparation",
    description:
      "Gather all compliance documentation and prepare for the external security...",
    status: "To Do",
    priority: "High",
    dueDate: "Aug 30",
    assignees: [
      { id: "4", name: "David Wright", initials: "DW", color: "#10B981" },
    ],
  },
  {
    id: "task-11",
    title: "Setup Redis caching layer",
    description:
      "Implement distributed Redis cache for frequent API endpoints to reduce load...",
    status: "To Do",
    priority: "Urgent",
    dueDate: "Aug 2",
    assignees: [
      { id: "4", name: "David Wright", initials: "DW", color: "#10B981" },
    ],
  },
  {
    id: "task-12",
    title: "Optimize database query indexes",
    description:
      "Analyze slow query logs and add composite indexes to PostgreSQL tables...",
    status: "To Do",
    priority: "High",
    dueDate: "Aug 5",
    assignees: [
      { id: "1", name: "Alex Rivard", initials: "RI", color: "#F59E0B" },
    ],
  },
  {
    id: "task-13",
    title: "Design landing page hero section",
    description:
      "Figma mockups for the new interactive marketing hero section with animations...",
    status: "To Do",
    priority: "Medium",
    dueDate: "Aug 10",
    assignees: [
      { id: "2", name: "Amelie Chen", initials: "AC", color: "#EC4899" },
    ],
  },
  {
    id: "task-14",
    title: "Draft privacy policy update",
    description:
      "Review new GDPR and CCPA guidelines with legal counsel and update site text...",
    status: "To Do",
    priority: "Low",
    dueDate: "Aug 15",
    assignees: [
      { id: "3", name: "Kevin Taylor", initials: "KT", color: "#8B5CF6" },
    ],
  },
  {
    id: "task-15",
    title: "Configure CI/CD deployment pipeline",
    description:
      "Setup GitHub Actions workflows for automated staging deployment and tests...",
    status: "To Do",
    priority: "High",
    dueDate: "Aug 18",
    assignees: [
      { id: "5", name: "Tom Cooper", initials: "TC", color: "#06B6D4" },
    ],
  },

  // IN PROGRESS
  {
    id: "task-4",
    title: "Mobile app push notifications",
    description:
      "Integrate Firebase Cloud Messaging for push notifications on iOS and Android...",
    status: "In Progress",
    priority: "Medium",
    dueDate: "Aug 12",
    assignees: [
      { id: "5", name: "Tom Cooper", initials: "TC", color: "#06B6D4" },
    ],
  },
  {
    id: "task-5",
    title: "Customer feedback dashboard",
    description:
      "Build a dashboard to visualize customer satisfaction scores and feedback trend...",
    status: "In Progress",
    priority: "Medium",
    dueDate: "Aug 8",
    assignees: [
      { id: "3", name: "Kevin Taylor", initials: "KT", color: "#8B5CF6" },
    ],
  },
  {
    id: "task-6",
    title: "Design social media graphics pack",
    description:
      "Create a set of branded social media graphics for the upcoming product...",
    status: "In Progress",
    priority: "Medium",
    dueDate: "Aug 6",
    assignees: [
      { id: "8", name: "Mark White", initials: "MW", color: "#F59E0B" },
    ],
  },
  {
    id: "task-16",
    title: "Refactor authentication state management",
    description:
      "Migrate auth context tokens to secure HTTP-only cookies with auto refresh...",
    status: "In Progress",
    priority: "Urgent",
    dueDate: "Aug 3",
    assignees: [
      { id: "1", name: "Alex Rivard", initials: "RI", color: "#F59E0B" },
      { id: "6", name: "Jessica Wong", initials: "JW", color: "#F43F5E" },
    ],
  },
  {
    id: "task-17",
    title: "Implement React Query optimistic updates",
    description:
      "Enhance UX by optimistically updating UI before server mutation responds...",
    status: "In Progress",
    priority: "High",
    dueDate: "Aug 7",
    assignees: [
      { id: "7", name: "Alice Green", initials: "AG", color: "#A855F7" },
    ],
  },
  {
    id: "task-18",
    title: "Build real-time notifications service",
    description:
      "WebSocket connection handler for instantaneous user alerts and badge counts...",
    status: "In Progress",
    priority: "Medium",
    dueDate: "Aug 9",
    assignees: [
      { id: "8", name: "Mark White", initials: "MW", color: "#F59E0B" },
    ],
  },
  {
    id: "task-19",
    title: "Dark mode theme contrast audit",
    description:
      "Adjust slate color palettes for WCAG high contrast compatibility across pages...",
    status: "In Progress",
    priority: "Low",
    dueDate: "Aug 11",
    assignees: [
      { id: "9", name: "Beth Young", initials: "BY", color: "#E11D48" },
    ],
  },
  {
    id: "task-20",
    title: "Upgrade React 19 dependencies",
    description:
      "Test compatibility of third-party libraries and refactor deprecated APIs...",
    status: "In Progress",
    priority: "High",
    dueDate: "Aug 14",
    assignees: [
      { id: "4", name: "David Wright", initials: "DW", color: "#10B981" },
    ],
  },

  // COMPLETED
  {
    id: "task-7",
    title: "Fix payment gateway integration bug",
    description:
      "Users are experiencing failed transactions on checkout. Investigate...",
    status: "Completed",
    priority: "High",
    dueDate: "Jul 25",
    assignees: [
      { id: "6", name: "Jessica Wong", initials: "JW", color: "#F43F5E" },
    ],
  },
  {
    id: "task-8",
    title: "Update employee handbook",
    description:
      "Revise the employee handbook with updated remote work policies and new...",
    status: "Completed",
    priority: "Low",
    dueDate: "Jul 20",
    assignees: [
      { id: "7", name: "Alice Green", initials: "AG", color: "#A855F7" },
    ],
  },
  {
    id: "task-9",
    title: "Review and close Q2 financials",
    description:
      "Finalize Q2 financial statements, reconcile accounts, and prepare the...",
    status: "Completed",
    priority: "High",
    dueDate: "Jul 22",
    assignees: [
      { id: "9", name: "Beth Young", initials: "BY", color: "#E11D48" },
    ],
  },
  {
    id: "task-21",
    title: "Migrate legacy user data schemas",
    description:
      "Successfully converted all legacy DB records to unified UUID schema without downtime...",
    status: "Completed",
    priority: "Urgent",
    dueDate: "Jul 15",
    assignees: [
      { id: "5", name: "Tom Cooper", initials: "TC", color: "#06B6D4" },
    ],
  },
  {
    id: "task-22",
    title: "Audit third-party npm packages",
    description:
      "Removed unused packages and resolved security vulnerabilities from npm audit report...",
    status: "Completed",
    priority: "High",
    dueDate: "Jul 18",
    assignees: [
      { id: "3", name: "Kevin Taylor", initials: "KT", color: "#8B5CF6" },
    ],
  },
  {
    id: "task-23",
    title: "Add export to Excel feature",
    description:
      "Integrated xlsx library for downloading formatted data tables with one click...",
    status: "Completed",
    priority: "Medium",
    dueDate: "Jul 21",
    assignees: [
      { id: "2", name: "Amelie Chen", initials: "AC", color: "#EC4899" },
    ],
  },
  {
    id: "task-24",
    title: "Setup error monitoring with Sentry",
    description:
      "Configured Sentry SDK for client and server exception logging and stack tracing...",
    status: "Completed",
    priority: "High",
    dueDate: "Jul 24",
    assignees: [
      { id: "1", name: "Alex Rivard", initials: "RI", color: "#F59E0B" },
    ],
  },
  {
    id: "task-25",
    title: "Clean up obsolete CSS stylesheets",
    description:
      "Removed legacy stylesheet files and unified design tokens into theme system...",
    status: "Completed",
    priority: "Low",
    dueDate: "Jul 28",
    assignees: [
      { id: "7", name: "Alice Green", initials: "AG", color: "#A855F7" },
    ],
  },
];

const COLUMNS = [
  {
    id: "To Do",
    title: "TO DO",
    color: "#64748B",
    bgLight: "#F8FAFC",
    borderLight: "#E2E8F0",
  },
  {
    id: "In Progress",
    title: "IN PROGRESS",
    color: "#2563EB",
    bgLight: "#EFF6FF",
    borderLight: "#BFDBFE",
  },
  {
    id: "Completed",
    title: "COMPLETED",
    color: "#16A34A",
    bgLight: "#F0FDF4",
    borderLight: "#BBF7D0",
  },
];

export default function TaskFlow() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("board"); // 'board' | 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        t.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesPriority =
        filterPriority === "all" ||
        t.priority.toLowerCase() === filterPriority.toLowerCase();
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  const handleCreateTask = useCallback((newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const handleMoveTaskStatus = useCallback((taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
  }, []);

  const handleDeleteTask = useCallback((taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

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
            columns={COLUMNS}
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
