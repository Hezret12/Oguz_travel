import { useLayoutEffect, useRef, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";

// Width of a container, kept in sync with ResizeObserver. Custom SVG charts
// draw at this width so text stays at its real size (no viewBox scaling).
export const useElementWidth = (initial = 720) => {
  const ref = useRef(null);
  const [width, setWidth] = useState(initial);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (next > 0) setWidth(next);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
};

// Floating tooltip for custom SVG charts, styled like the x-charts one
// (tooltipSlotProps). `tip` = { x, y, title, rows: [{ label, value, color }] }
// in container coordinates; it flips left near the right edge.
export const ChartTooltip = ({ tip, containerWidth }) => {
  if (!tip) return null;
  const flip = tip.x > containerWidth - 220;
  return (
    <Paper
      elevation={0}
      role="status"
      sx={(theme) => ({
        position: "absolute",
        left: tip.x,
        top: tip.y,
        transform: `translate(${flip ? "calc(-100% - 14px)" : "14px"}, -50%)`,
        pointerEvents: "none",
        zIndex: 2,
        minWidth: 170,
        px: 1.5,
        py: 1.1,
        borderRadius: "10px",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        backgroundImage: "none",
        boxShadow:
          theme.palette.mode === "dark" ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(15, 23, 42, 0.08)",
      })}
    >
      {tip.title && (
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5, whiteSpace: "nowrap" }}>
          {tip.title}
        </Typography>
      )}
      {tip.rows.map((row) => (
        <Box key={row.label} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.25 }}>
          {row.color && <Box sx={{ width: 12, height: 0, borderTop: `2px solid ${row.color}`, flexShrink: 0 }} />}
          {/* Values lead, labels follow */}
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, whiteSpace: "nowrap" }}>{row.value}</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", whiteSpace: "nowrap" }}>
            {row.label}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

// Pointer position relative to a container element.
export const pointerIn = (event, container) => {
  const rect = container.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
};
