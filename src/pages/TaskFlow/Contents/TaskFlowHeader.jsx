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
                  <Funnel size={16} />
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
                fontSize: "0.875rem",
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
