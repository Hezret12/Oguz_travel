import { Box, Paper, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import { BarChart3, Table2 } from "lucide-react";

// Shared shell for every block on the finance report.
const SectionCard = ({ title, subtitle, action, children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      // Grow to fill a flex parent (equal heights inside a flex Grid item),
      // never shrink: `height: 100%` resolved against the page's fixed-height
      // scroll area and, with overflow hidden, clipped the card's bottom rows.
      flex: "1 0 auto",
      display: "flex",
      flexDirection: "column",
      borderRadius: "12px",
      border: "1px solid",
      borderColor: "divider",
      backgroundColor: "background.paper",
      boxShadow: "none",
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
          px: 3,
          pt: 2.5,
          pb: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 600, fontSize: "0.95rem", color: "text.primary", lineHeight: 1.4 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography noWrap sx={{ fontSize: "0.8rem", color: "text.secondary", lineHeight: 1.5, mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>{action}</Box>}
      </Box>
    )}
    <Box sx={{ px: 3, pb: 3, display: "flex", flexDirection: "column", gap: 2.5, flex: 1, minWidth: 0 }}>
      {children}
    </Box>
  </Paper>
);

// Thin horizontal magnitude bar (one hue), used inside tables and lists.
export const ShareBar = ({ value, color }) => (
  <Box sx={{ height: 3, borderRadius: 2, backgroundColor: "action.hover", overflow: "hidden" }}>
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
            width: item.shape === "bar" ? 8 : 14,
            height: item.shape === "bar" ? 8 : 0,
            borderRadius: item.shape === "bar" ? "2px" : 0,
            backgroundColor: item.shape === "bar" ? item.color : "transparent",
            // Line swatches mirror the series stroke, dashed included.
            borderTop: item.shape === "bar" ? "none" : `2px ${item.dashed ? "dashed" : "solid"} ${item.color}`,
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

// Vertical gradients for area fills, referenced by id from chartSx(areas).
// SVG url(#id) references resolve document-wide, so one hidden <svg> is enough.
export const ChartGradients = ({ gradients }) => (
  <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
    <defs>
      {gradients.map(({ id, color, opacity = 0.22 }) => (
        <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      ))}
    </defs>
  </svg>
);

export const EmptyState = ({ children }) => (
  <Box sx={{ py: 5, textAlign: "center", color: "text.secondary", fontSize: "0.85rem" }}>
    {children}
  </Box>
);

export default SectionCard;
