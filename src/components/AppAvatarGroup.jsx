import { memo } from "react";
import {
  Box,
  Avatar,
  AvatarGroup,
  Tooltip,
  useTheme,
  Typography,
} from "@mui/material";

// Vibrant solid modern palettes (Slack / Google style)
const VIBRANT_PALETTES = [
  "#2563EB", // Royal Blue
  "#7C3AED", // Vivid Violet
  "#059669", // Emerald Green
  "#D97706", // Warm Amber
  "#E11D48", // Rose Crimson
  "#0891B2", // Deep Cyan
  "#4F46E5", // Indigo
  "#DB2777", // Pink
  "#9333EA", // Purple
  "#EA580C", // Bright Orange
  "#0284C7", // Sky Blue
  "#16A34A", // Pure Green
];

function stringToColor(str) {
  if (!str) return VIBRANT_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % VIBRANT_PALETTES.length;
  return VIBRANT_PALETTES[index];
}

function getInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function AppAvatarGroup({ items = [], max = 6, size = 26, sx = {} }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!items || items.length === 0) {
    return null;
  }

  const parseAssignee = (a) => {
    const usr = a.user || a;
    const emp = usr.employee || a.employee;
    const name =
      emp?.fullName ||
      usr?.fullName ||
      a.fullName ||
      a.name ||
      usr?.username ||
      usr?.phone_number ||
      a.phone_number ||
      "User";

    const office = emp?.office?.shortName || emp?.office?.fullName || "";
    const key = a.guid || usr?.guid || name;
    const color = a.color || stringToColor(key);
    const initials = a.initials || getInitials(name);
    const photo = a.avatar || a.image || usr?.avatar || usr?.image || emp?.photo || null;

    return { name, initials, color, office, photo, original: a };
  };

  const parsedItems = items.map(parseAssignee);
  const limit = max > 0 ? max : 6;
  const hiddenItems = parsedItems.slice(limit);
  const surplus = parsedItems.length - limit;

  const fontSize = Math.max(9.5, Math.round(size * 0.38));

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", ...sx }}>
      <AvatarGroup
        max={max}
        sx={{
          justifyContent: "flex-start",
          "& .MuiAvatar-root": {
            width: size,
            height: size,
            fontSize: `${fontSize}px`,
            fontWeight: 700,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
            letterSpacing: "-0.01em",
            border: `2px solid`,
            borderColor: isDark ? "background.paper" : "#FFFFFF",
            ml: "-5px !important",
            boxShadow: isDark
              ? "0 2px 4px rgba(0,0,0,0.5)"
              : "0 1px 3px rgba(0,0,0,0.12)",
            transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:first-of-type": {
              ml: "0px !important",
            },
            "&:hover": {
              transform: "translateY(-2px) scale(1.12)",
              zIndex: 10,
              boxShadow: isDark
                ? "0 4px 12px rgba(0,0,0,0.7)"
                : "0 4px 10px rgba(0,0,0,0.22)",
            },
          },
        }}
        renderSurplus={() =>
          surplus > 0 ? (
            <Tooltip
              title={
                <Box sx={{ p: 0.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: isDark ? "#94A3B8" : "#64748B",
                      fontSize: "0.675rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    +{surplus} Başga
                  </Typography>
                  {hiddenItems.map((item, idx) => (
                    <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.25 }}>
                      <Avatar
                        src={item.photo}
                        sx={{
                          width: 20,
                          height: 20,
                          fontSize: "9px",
                          fontWeight: 700,
                          bgcolor: item.color,
                          color: "#FFFFFF",
                        }}
                      >
                        {item.initials}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#FFFFFF" }}>
                        {item.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              }
              arrow
              placement="top"
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: isDark ? "#0F172A" : "#1E293B",
                    borderRadius: "10px",
                    p: 1,
                    boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.4)",
                    border: `1px solid ${isDark ? "#334155" : "#475569"}`,
                  },
                },
                arrow: {
                  sx: {
                    color: isDark ? "#0F172A" : "#1E293B",
                  },
                },
              }}
            >
              <Avatar
                sx={{
                  width: size,
                  height: size,
                  fontSize: `${fontSize}px`,
                  fontWeight: 700,
                  cursor: "pointer",
                  bgcolor: isDark ? "#334155" : "#E2E8F0",
                  color: isDark ? "#F8FAFC" : "#334155",
                  border: `2px solid`,
                  borderColor: isDark ? "background.paper" : "#FFFFFF",
                }}
              >
                +{surplus}
              </Avatar>
            </Tooltip>
          ) : null
        }
      >
        {parsedItems.map((item, idx) => (
          <Tooltip
            key={idx}
            title={
              <Box sx={{ py: 0.25, px: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 650, fontSize: "0.8rem", color: "#FFFFFF" }}>
                  {item.name}
                </Typography>
                {item.office && (
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem", display: "block" }}>
                    {item.office}
                  </Typography>
                )}
              </Box>
            }
            arrow
            placement="top"
            slotProps={{
              tooltip: {
                sx: {
                  bgcolor: isDark ? "#0F172A" : "#1E293B",
                  borderRadius: "8px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                },
              },
            }}
          >
            <Avatar
              src={item.photo}
              sx={{
                width: size,
                height: size,
                fontSize: `${fontSize}px`,
                fontWeight: 700,
                bgcolor: item.color,
                color: "#FFFFFF",
              }}
            >
              {item.initials}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup>
    </Box>
  );
}

export default memo(AppAvatarGroup);



