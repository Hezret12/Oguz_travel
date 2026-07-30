import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  Grid,
  FormControl,
  Select,
  MenuItem,
  ListSubheader,
  Divider,
} from "@mui/material";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AddIcon from "@mui/icons-material/Add";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import BlockIcon from "@mui/icons-material/Block";

import GlobalSearchInput from "../../components/GlobalSearchInput";
import CreateTaskModal from "./CreateTaskModal";
import TaskBoardView from "./Contents/TaskBoardView";
import TaskListTable from "./Contents/TaskListTable";

// Initial Task Data based on image_0.png
const INITIAL_TASKS = [
  // TO DO
  {
    id: "task-1",
    title: "Website accessibility compliance review",
    description: "Ensure all UI components meet WCAG 2.1 AA accessibility standards...",
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
    assignees: [{ id: "7", name: "Alice Green", initials: "AG", color: "#A855F7" }],
  },
  {
    id: "task-3",
    title: "Annual security audit preparation",
    description:
      "Gather all compliance documentation and prepare for the external security...",
    status: "To Do",
    priority: "High",
    dueDate: "Aug 30",
    assignees: [{ id: "4", name: "David Wright", initials: "DW", color: "#10B981" }],
  },
  {
    id: "task-11",
    title: "Setup Redis caching layer",
    description: "Implement distributed Redis cache for frequent API endpoints to reduce load...",
    status: "To Do",
    priority: "Urgent",
    dueDate: "Aug 2",
    assignees: [{ id: "4", name: "David Wright", initials: "DW", color: "#10B981" }],
  },
  {
    id: "task-12",
    title: "Optimize database query indexes",
    description: "Analyze slow query logs and add composite indexes to PostgreSQL tables...",
    status: "To Do",
    priority: "High",
    dueDate: "Aug 5",
    assignees: [{ id: "1", name: "Alex Rivard", initials: "RI", color: "#F59E0B" }],
  },
  {
    id: "task-13",
    title: "Design landing page hero section",
    description: "Figma mockups for the new interactive marketing hero section with animations...",
    status: "To Do",
    priority: "Medium",
    dueDate: "Aug 10",
    assignees: [{ id: "2", name: "Amelie Chen", initials: "AC", color: "#EC4899" }],
  },
  {
    id: "task-14",
    title: "Draft privacy policy update",
    description: "Review new GDPR and CCPA guidelines with legal counsel and update site text...",
    status: "To Do",
    priority: "Low",
    dueDate: "Aug 15",
    assignees: [{ id: "3", name: "Kevin Taylor", initials: "KT", color: "#8B5CF6" }],
  },
  {
    id: "task-15",
    title: "Configure CI/CD deployment pipeline",
    description: "Setup GitHub Actions workflows for automated staging deployment and tests...",
    status: "To Do",
    priority: "High",
    dueDate: "Aug 18",
    assignees: [{ id: "5", name: "Tom Cooper", initials: "TC", color: "#06B6D4" }],
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
    assignees: [{ id: "5", name: "Tom Cooper", initials: "TC", color: "#06B6D4" }],
  },
  {
    id: "task-5",
    title: "Customer feedback dashboard",
    description:
      "Build a dashboard to visualize customer satisfaction scores and feedback trend...",
    status: "In Progress",
    priority: "Medium",
    dueDate: "Aug 8",
    assignees: [{ id: "3", name: "Kevin Taylor", initials: "KT", color: "#8B5CF6" }],
  },
  {
    id: "task-6",
    title: "Design social media graphics pack",
    description:
      "Create a set of branded social media graphics for the upcoming product...",
    status: "In Progress",
    priority: "Medium",
    dueDate: "Aug 6",
    assignees: [{ id: "8", name: "Mark White", initials: "MW", color: "#F59E0B" }],
  },
  {
    id: "task-16",
    title: "Refactor authentication state management",
    description: "Migrate auth context tokens to secure HTTP-only cookies with auto refresh...",
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
    description: "Enhance UX by optimistically updating UI before server mutation responds...",
    status: "In Progress",
    priority: "High",
    dueDate: "Aug 7",
    assignees: [{ id: "7", name: "Alice Green", initials: "AG", color: "#A855F7" }],
  },
  {
    id: "task-18",
    title: "Build real-time notifications service",
    description: "WebSocket connection handler for instantaneous user alerts and badge counts...",
    status: "In Progress",
    priority: "Medium",
    dueDate: "Aug 9",
    assignees: [{ id: "8", name: "Mark White", initials: "MW", color: "#F59E0B" }],
  },
  {
    id: "task-19",
    title: "Dark mode theme contrast audit",
    description: "Adjust slate color palettes for WCAG high contrast compatibility across pages...",
    status: "In Progress",
    priority: "Low",
    dueDate: "Aug 11",
    assignees: [{ id: "9", name: "Beth Young", initials: "BY", color: "#E11D48" }],
  },
  {
    id: "task-20",
    title: "Upgrade React 19 dependencies",
    description: "Test compatibility of third-party libraries and refactor deprecated APIs...",
    status: "In Progress",
    priority: "High",
    dueDate: "Aug 14",
    assignees: [{ id: "4", name: "David Wright", initials: "DW", color: "#10B981" }],
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
    assignees: [{ id: "6", name: "Jessica Wong", initials: "JW", color: "#F43F5E" }],
  },
  {
    id: "task-8",
    title: "Update employee handbook",
    description:
      "Revise the employee handbook with updated remote work policies and new...",
    status: "Completed",
    priority: "Low",
    dueDate: "Jul 20",
    assignees: [{ id: "7", name: "Alice Green", initials: "AG", color: "#A855F7" }],
  },
  {
    id: "task-9",
    title: "Review and close Q2 financials",
    description:
      "Finalize Q2 financial statements, reconcile accounts, and prepare the...",
    status: "Completed",
    priority: "High",
    dueDate: "Jul 22",
    assignees: [{ id: "9", name: "Beth Young", initials: "BY", color: "#E11D48" }],
  },
  {
    id: "task-21",
    title: "Migrate legacy user data schemas",
    description: "Successfully converted all legacy DB records to unified UUID schema without downtime...",
    status: "Completed",
    priority: "Urgent",
    dueDate: "Jul 15",
    assignees: [{ id: "5", name: "Tom Cooper", initials: "TC", color: "#06B6D4" }],
  },
  {
    id: "task-22",
    title: "Audit third-party npm packages",
    description: "Removed unused packages and resolved security vulnerabilities from npm audit report...",
    status: "Completed",
    priority: "High",
    dueDate: "Jul 18",
    assignees: [{ id: "3", name: "Kevin Taylor", initials: "KT", color: "#8B5CF6" }],
  },
  {
    id: "task-23",
    title: "Add export to Excel feature",
    description: "Integrated xlsx library for downloading formatted data tables with one click...",
    status: "Completed",
    priority: "Medium",
    dueDate: "Jul 21",
    assignees: [{ id: "2", name: "Amelie Chen", initials: "AC", color: "#EC4899" }],
  },
  {
    id: "task-24",
    title: "Setup error monitoring with Sentry",
    description: "Configured Sentry SDK for client and server exception logging and stack tracing...",
    status: "Completed",
    priority: "High",
    dueDate: "Jul 24",
    assignees: [{ id: "1", name: "Alex Rivard", initials: "RI", color: "#F59E0B" }],
  },
  {
    id: "task-25",
    title: "Clean up obsolete CSS stylesheets",
    description: "Removed legacy stylesheet files and unified design tokens into theme system...",
    status: "Completed",
    priority: "Low",
    dueDate: "Jul 28",
    assignees: [{ id: "7", name: "Alice Green", initials: "AG", color: "#A855F7" }],
  },
];

const COLUMNS = [
  { id: "To Do", title: "TO DO", color: "#64748B", bgLight: "#F8FAFC", borderLight: "#E2E8F0" },
  { id: "In Progress", title: "IN PROGRESS", color: "#2563EB", bgLight: "#EFF6FF", borderLight: "#BFDBFE" },
  { id: "Completed", title: "COMPLETED", color: "#16A34A", bgLight: "#F0FDF4", borderLight: "#BBF7D0" },
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
        filterStatus === "all" || t.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesPriority =
        filterPriority === "all" || t.priority.toLowerCase() === filterPriority.toLowerCase();
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  const handleCreateTask = useCallback((newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const handleMoveTaskStatus = useCallback((taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
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
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Main Title Bar & Action Controls */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontSize: { xs: "1.5rem", md: "1.75rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Task Management
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: isDark ? "#94A3B8" : "#64748B", mt: 0.5 }}
          >
            Track, assign, and manage your team's tasks in one place.
          </Typography>
        </Box>

        {/* Control Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          {/* View Toggle */}
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              p: 0.4,
              borderRadius: "8px",
              border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
              bgcolor: isDark ? "#1E293B" : "#FFFFFF",
            }}
          >
            <Button
              size="small"
              startIcon={<ViewWeekIcon sx={{ fontSize: 18 }} />}
              onClick={() => setViewMode("board")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8125rem",
                px: 1.5,
                py: 0.5,
                borderRadius: "6px",
                bgcolor: viewMode === "board" ? (isDark ? "#334155" : "#F1F5F9") : "transparent",
                color: viewMode === "board" ? (isDark ? "#F8FAFC" : "#0F172A") : isDark ? "#94A3B8" : "#64748B",
              }}
            >
              Board
            </Button>
            <Button
              size="small"
              startIcon={<FormatListBulletedIcon sx={{ fontSize: 18 }} />}
              onClick={() => setViewMode("list")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8125rem",
                px: 1.5,
                py: 0.5,
                borderRadius: "6px",
                bgcolor: viewMode === "list" ? (isDark ? "#334155" : "#F1F5F9") : "transparent",
                color: viewMode === "list" ? (isDark ? "#F8FAFC" : "#0F172A") : isDark ? "#94A3B8" : "#64748B",
              }}
            >
              List
            </Button>
          </Paper>

          {/* + New Task Primary Button */}
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{
              bgcolor: "#2563EB",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              borderRadius: "8px",
              px: 2.2,
              py: 0.9,
              boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
              "&:hover": {
                bgcolor: "#1D4ED8",
              },
            }}
          >
            New Task
          </Button>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              sx={{
                border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
                bgcolor: isDark ? "#1E293B" : "#FFFFFF",
                borderRadius: "8px",
                p: 1,
              }}
            >
              <Badge badgeContent={8} color="error">
                <NotificationsNoneIcon sx={{ fontSize: 20, color: isDark ? "#CBD5E1" : "#64748B" }} />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search & Select Filters Row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
        <GlobalSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search tasks..."
        />

        {/* Status Select Filter */}
        <FormControl size="small" sx={{ minWidth: 175 }}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              if (selected === "all" || !selected) {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BlockIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>All Statuses</Typography>
                  </Box>
                );
              }
              if (selected === "to do") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <RadioButtonUncheckedIcon sx={{ color: "#64748B", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>TO DO</Typography>
                  </Box>
                );
              }
              if (selected === "in progress") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <RadioButtonCheckedIcon sx={{ color: "#2563EB", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>IN PROGRESS</Typography>
                  </Box>
                );
              }
              if (selected === "completed") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleRoundedIcon sx={{ color: "#16A34A", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>COMPLETED</Typography>
                  </Box>
                );
              }
              return selected;
            }}
            sx={{
              borderRadius: "8px",
              bgcolor: isDark ? "#1E293B" : "#FFFFFF",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            <ListSubheader sx={{ fontWeight: 600, fontSize: "0.75rem", color: isDark ? "#94A3B8" : "#64748B", lineHeight: "24px", pt: 1, bgcolor: "transparent" }}>
              Not started
            </ListSubheader>
            <MenuItem value="to do">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <RadioButtonUncheckedIcon sx={{ color: "#64748B", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>TO DO</Typography>
              </Box>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <ListSubheader sx={{ fontWeight: 600, fontSize: "0.75rem", color: isDark ? "#94A3B8" : "#64748B", lineHeight: "24px", bgcolor: "transparent" }}>
              Active
            </ListSubheader>
            <MenuItem value="in progress">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <RadioButtonCheckedIcon sx={{ color: "#2563EB", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>IN PROGRESS</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="completed">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <CheckCircleRoundedIcon sx={{ color: "#16A34A", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>COMPLETED</Typography>
              </Box>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem value="all">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, color: "text.secondary" }}>
                <BlockIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>All Statuses</Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Priority Select Filter */}
        <FormControl size="small" sx={{ minWidth: 175 }}>
          <Select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              if (selected === "all" || !selected) {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BlockIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>All Priorities</Typography>
                  </Box>
                );
              }
              if (selected === "urgent") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FlagRoundedIcon sx={{ color: "#DC2626", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Urgent</Typography>
                  </Box>
                );
              }
              if (selected === "high") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FlagRoundedIcon sx={{ color: "#2563EB", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>High</Typography>
                  </Box>
                );
              }
              if (selected === "medium") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FlagRoundedIcon sx={{ color: "#F59E0B", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Normal / Medium</Typography>
                  </Box>
                );
              }
              if (selected === "low") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FlagRoundedIcon sx={{ color: "#64748B", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Low</Typography>
                  </Box>
                );
              }
              return selected;
            }}
            sx={{
              borderRadius: "8px",
              bgcolor: isDark ? "#1E293B" : "#FFFFFF",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            <ListSubheader sx={{ fontWeight: 600, fontSize: "0.75rem", color: isDark ? "#94A3B8" : "#64748B", lineHeight: "24px", pt: 1, bgcolor: "transparent" }}>
              Task Priority
            </ListSubheader>
            <MenuItem value="urgent">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <FlagRoundedIcon sx={{ color: "#DC2626", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Urgent</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="high">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <FlagRoundedIcon sx={{ color: "#2563EB", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>High</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="medium">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <FlagRoundedIcon sx={{ color: "#F59E0B", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Normal / Medium</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="low">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <FlagRoundedIcon sx={{ color: "#64748B", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Low</Typography>
              </Box>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem value="all">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, color: "text.secondary" }}>
                <BlockIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Clear / All</Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tab Views: Board View vs List (Material React Table) View */}
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

      {/* Create Task Modal */}
      <CreateTaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </Box>
  );
}
