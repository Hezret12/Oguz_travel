import { memo } from "react";
import { Box, Button, Paper, Badge } from "@mui/material";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AddIcon from "@mui/icons-material/Add";
import { Funnel } from "lucide-react";

import { useLocale } from "../../../hooks/useLocale";
import GlobalSearchInput from "../../../components/GlobalSearchInput";

const VIEW_MODES = [
  { mode: "board", labelKey: "task.board", Icon: ViewWeekIcon },
  { mode: "list", labelKey: "task.list", Icon: FormatListBulletedIcon },
];

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
                backgroundColor: "action.hover",
                boxShadow: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "action.selected",
                  borderColor: "text.secondary",
                  color: "text.primary",
                  transform: "translateY(-1px)",
                  boxShadow: 3,
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
              gap: 0.4,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            {VIEW_MODES.map(({ mode, labelKey, Icon }) => {
              const isActive = viewMode === mode;
              return (
                <Button
                  key={mode}
                  size="small"
                  aria-pressed={isActive}
                  startIcon={<Icon sx={{ fontSize: 18 }} />}
                  onClick={() => setViewMode(mode)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "6px",
                    bgcolor: isActive ? "action.selected" : "transparent",
                    color: isActive ? "text.primary" : "text.secondary",
                    "&:hover": {
                      bgcolor: isActive ? "action.selected" : "action.hover",
                    },
                  }}
                >
                  {t(labelKey)}
                </Button>
              );
            })}
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
