import { Box, Paper, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import { BarChart3, Table2 } from "lucide-react";

// Shared shell for every block on the finance report.
const SectionCard = ({ title, subtitle, action, children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      borderRadius: "14px",
      border: "1px solid",
      borderColor: "divider",
      backgroundColor: "background.paper",
      overflow: "hidden",
      ...sx,
    }}
  >
    {(title || action) && (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 2.5,
          pt: 2,
          pb: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: "0.95rem", color: "text.primary", lineHeight: 1.4 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography noWrap sx={{ fontSize: "0.78rem", color: "text.secondary", lineHeight: 1.4 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>{action}</Box>}
      </Box>
    )}
    <Box sx={{ px: 2.5, pb: 2.5, display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
      {children}
    </Box>
  </Paper>
);

// Thin horizontal magnitude bar (one hue), used inside tables and lists.
export const ShareBar = ({ value, color }) => (
  <Box sx={{ height: 4, borderRadius: 2, backgroundColor: "action.hover", overflow: "hidden" }}>
    <Box
      sx={{
        width: `${Math.max(0, Math.min(100, value))}%`,
        height: "100%",
        borderRadius: 2,
        backgroundColor: color,
        transition: "width 0.3s ease",
      }}
    />
  </Box>
);

// Legend for multi-series charts: identity is never colour-only.
export const LegendRow = ({ items }) => (
  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
    {items.map((item) => (
      <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Box
          sx={{
            width: item.shape === "bar" ? 8 : 12,
            height: item.shape === "bar" ? 8 : 2,
            borderRadius: item.shape === "bar" ? "2px" : 1,
            backgroundColor: item.color,
          }}
        />
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{item.label}</Typography>
      </Box>
    ))}
  </Box>
);

// Compact icon switch between chart and table (the table is the accessible
// view of every chart).
export const ViewToggle = ({ value, onChange, chartLabel, tableLabel }) => (
  <ToggleButtonGroup
    exclusive
    size="small"
    value={value}
    onChange={(_e, next) => next && onChange(next)}
    sx={{
      "& .MuiToggleButton-root": {
        width: 30,
        height: 28,
        p: 0,
        color: "text.secondary",
        borderColor: "divider",
        "&.Mui-selected": { color: "text.primary", backgroundColor: "action.selected" },
      },
    }}
  >
    <ToggleButton value="chart" aria-label={chartLabel}>
      <Tooltip title={chartLabel} arrow>
        <Box sx={{ display: "flex" }}>
          <BarChart3 size={15} />
        </Box>
      </Tooltip>
    </ToggleButton>
    <ToggleButton value="table" aria-label={tableLabel}>
      <Tooltip title={tableLabel} arrow>
        <Box sx={{ display: "flex" }}>
          <Table2 size={15} />
        </Box>
      </Tooltip>
    </ToggleButton>
  </ToggleButtonGroup>
);

// Small uppercase-free group heading with a hairline.
export const GroupTitle = ({ children }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.5 }}>
    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "text.primary", whiteSpace: "nowrap" }}>
      {children}
    </Typography>
    <Box sx={{ flex: 1, height: "1px", backgroundColor: "divider" }} />
  </Box>
);

export const EmptyState = ({ children }) => (
  <Box sx={{ py: 5, textAlign: "center", color: "text.secondary", fontSize: "0.85rem" }}>
    {children}
  </Box>
);

export default SectionCard;
