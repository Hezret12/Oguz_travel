import { memo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  ListSubheader,
  Divider,
} from "@mui/material";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import BlockIcon from "@mui/icons-material/Block";
import GlobalSearchInput from "../../../components/GlobalSearchInput";

function TaskFlowHeader({
  viewMode,
  setViewMode,
  onOpenCreateModal,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ flexShrink: 0 }}>
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
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
                bgcolor:
                  viewMode === "board"
                    ? isDark
                      ? "#334155"
                      : "#F1F5F9"
                    : "transparent",
                color:
                  viewMode === "board"
                    ? isDark
                      ? "#F8FAFC"
                      : "#0F172A"
                    : isDark
                      ? "#94A3B8"
                      : "#64748B",
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
                bgcolor:
                  viewMode === "list"
                    ? isDark
                      ? "#334155"
                      : "#F1F5F9"
                    : "transparent",
                color:
                  viewMode === "list"
                    ? isDark
                      ? "#F8FAFC"
                      : "#0F172A"
                    : isDark
                      ? "#94A3B8"
                      : "#64748B",
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
            onClick={onOpenCreateModal}
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
        </Box>
      </Box>

      {/* Search & Select Filters Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
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
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      All Statuses
                    </Typography>
                  </Box>
                );
              }
              if (selected === "to do") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <RadioButtonUncheckedIcon
                      sx={{ color: "#64748B", fontSize: 18 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, fontSize: "0.8125rem" }}
                    >
                      TO DO
                    </Typography>
                  </Box>
                );
              }
              if (selected === "in progress") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <RadioButtonCheckedIcon
                      sx={{ color: "#2563EB", fontSize: 18 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, fontSize: "0.8125rem" }}
                    >
                      IN PROGRESS
                    </Typography>
                  </Box>
                );
              }
              if (selected === "completed") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleRoundedIcon
                      sx={{ color: "#16A34A", fontSize: 18 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, fontSize: "0.8125rem" }}
                    >
                      COMPLETED
                    </Typography>
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
            <ListSubheader
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                color: isDark ? "#94A3B8" : "#64748B",
                lineHeight: "24px",
                pt: 1,
                bgcolor: "transparent",
              }}
            >
              Not started
            </ListSubheader>
            <MenuItem value="to do">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <RadioButtonUncheckedIcon
                  sx={{ color: "#64748B", fontSize: 18 }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, fontSize: "0.8125rem" }}
                >
                  TO DO
                </Typography>
              </Box>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <ListSubheader
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                color: isDark ? "#94A3B8" : "#64748B",
                lineHeight: "24px",
                bgcolor: "transparent",
              }}
            >
              Active
            </ListSubheader>
            <MenuItem value="in progress">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <RadioButtonCheckedIcon
                  sx={{ color: "#2563EB", fontSize: 18 }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, fontSize: "0.8125rem" }}
                >
                  IN PROGRESS
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="completed">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <CheckCircleRoundedIcon
                  sx={{ color: "#16A34A", fontSize: 18 }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, fontSize: "0.8125rem" }}
                >
                  COMPLETED
                </Typography>
              </Box>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem value="all">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  color: "text.secondary",
                }}
              >
                <BlockIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  All Statuses
                </Typography>
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
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      All Priorities
                    </Typography>
                  </Box>
                );
              }
              if (selected === "urgent") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FlagRoundedIcon sx={{ color: "#DC2626", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Urgent
                    </Typography>
                  </Box>
                );
              }
              if (selected === "high") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FlagRoundedIcon sx={{ color: "#2563EB", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      High
                    </Typography>
                  </Box>
                );
              }
              if (selected === "medium") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FlagRoundedIcon sx={{ color: "#F59E0B", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Normal / Medium
                    </Typography>
                  </Box>
                );
              }
              if (selected === "low") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FlagRoundedIcon sx={{ color: "#64748B", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Low
                    </Typography>
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
            <ListSubheader
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                color: isDark ? "#94A3B8" : "#64748B",
                lineHeight: "24px",
                pt: 1,
                bgcolor: "transparent",
              }}
            >
              Task Priority
            </ListSubheader>
            <MenuItem value="urgent">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <FlagRoundedIcon sx={{ color: "#DC2626", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Urgent
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="high">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <FlagRoundedIcon sx={{ color: "#2563EB", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  High
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="medium">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <FlagRoundedIcon sx={{ color: "#F59E0B", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Normal / Medium
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="low">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <FlagRoundedIcon sx={{ color: "#64748B", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Low
                </Typography>
              </Box>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem value="all">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  color: "text.secondary",
                }}
              >
                <BlockIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Clear / All
                </Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

export default memo(TaskFlowHeader);
