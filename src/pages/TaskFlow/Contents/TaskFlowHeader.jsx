import { memo } from "react";
import {
  Box,
  Button,
  Paper,
  useTheme,
  Badge,
} from "@mui/material";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AddIcon from "@mui/icons-material/Add";
import { Funnel } from "lucide-react";

import { useLocale } from "../../../hooks/useLocale";
import GlobalSearchInput from "../../../components/GlobalSearchInput";

function TaskFlowHeader({
  viewMode,
  setViewMode,
  onOpenCreateModal,
  searchQuery,
  setSearchQuery,
  onFilterClick,
  hasActiveFilters = false,
  onRefetch,
  isFetching = false,
}) {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ flexShrink: 0, mb: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
            flexGrow: 1,
          }}
        >
          <GlobalSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onRefetch={onRefetch}
            isFetching={isFetching}
          />
          {onFilterClick && (
            <Button
              variant="outlined"
              startIcon={
                <Badge
                  color="primary"
                  variant="dot"
                  invisible={!hasActiveFilters}
                >
                  <Funnel size={16} style={{ opacity: 0.8 }} />
                </Badge>
              }
              onClick={onFilterClick}
              disableElevation
              sx={{
                height: "40px",
                px: 2.5,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                letterSpacing: "0.1px",
                borderColor: "divider",
                color: "text.primary",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.04)"
                    : "rgba(0, 0, 0, 0.02)",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 2px 8px rgba(0, 0, 0, 0.32)"
                    : "0 1px 4px rgba(0, 0, 0, 0.04)",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.05)",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.20)"
                      : "rgba(0, 0, 0, 0.18)",
                  color: "text.primary",
                  transform: "translateY(-1px)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 4px 14px rgba(0, 0, 0, 0.45)"
                      : "0 4px 12px rgba(0, 0, 0, 0.08)",
                },
              }}
            >
              {t("filter")}
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
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
              {t("task.board")}
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
              {t("task.list")}
            </Button>
          </Paper>

          {/* + New Task Primary Button */}
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            onClick={onOpenCreateModal}
            sx={{
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              borderRadius: "8px",
              px: 2.2,
              py: 0.9,
            }}
          >
            {t("task.newTask")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(TaskFlowHeader);
