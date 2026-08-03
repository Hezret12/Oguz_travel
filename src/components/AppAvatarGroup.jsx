import { memo } from "react";
import {
  Box,
  Avatar,
  AvatarGroup,
  Tooltip,
  useTheme,
  Typography,
} from "@mui/material";

function AppAvatarGroup({
  items = [],
  max = 6,
  size = 26,
  sx = {},
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!items || items.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        —
      </Typography>
    );
  }

  const parseAssignee = (a) => {
    const name =
      a.user?.employee?.fullName ||
      a.employee?.fullName ||
      a.user?.fullName ||
      a.fullName ||
      a.name ||
      a.user?.phone_number ||
      a.phone_number ||
      "User";
    const initials =
      a.initials || (name ? name.slice(0, 2).toUpperCase() : "US");
    const color = a.color || "#2563EB";
    return { name, initials, color, original: a };
  };

  const parsedItems = items.map(parseAssignee);
  const limit = max > 0 ? max - 1 : 2;
  const hiddenItems = parsedItems.slice(limit);

  return (
    <Box sx={{ display: "flex", alignItems: "center", ...sx }}>
      <AvatarGroup
        max={max}
        sx={{
          justifyContent: "flex-start",
          "& .MuiAvatar-root": {
            width: size,
            height: size,
            fontSize: `${size * 0.42}px`,
            fontWeight: 700,
            border: `1.5px solid ${isDark ? "#1E293B" : "#FFFFFF"}`,
            ml: "-4px !important",
            "&:first-of-type": {
              ml: "0px !important",
            },
          },
        }}
        renderSurplus={(surplus) => (
          <Tooltip
            title={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 0.5,
                }}
              >
                {hiddenItems.map((item, idx) => (
                  <Tooltip key={idx} title={item.name} arrow placement="top">
                    <Avatar
                      sx={{
                        width: size + 2,
                        height: size + 2,
                        fontSize: `${size * 0.42}px`,
                        fontWeight: 700,
                        bgcolor: item.color,
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                        transition: "transform 0.15s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.15)",
                          zIndex: 2,
                        },
                      }}
                    >
                      {item.initials}
                    </Avatar>
                  </Tooltip>
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
                  p: 0.75,
                  boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.3)",
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
                fontSize: `${size * 0.42}px`,
                fontWeight: 700,
                cursor: "pointer",
                bgcolor: isDark ? "#334155" : "#E2E8F0",
                color: isDark ? "#F8FAFC" : "#475569",
              }}
            >
              +{surplus}
            </Avatar>
          </Tooltip>
        )}
      >
        {parsedItems.map((item, idx) => (
          <Tooltip key={idx} title={item.name} arrow placement="top">
            <Avatar
              sx={{
                width: size,
                height: size,
                fontSize: `${size * 0.42}px`,
                fontWeight: 700,
                bgcolor: item.color,
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
