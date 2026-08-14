import { useMemo } from "react";
import { Box, Button, IconButton } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PlaceIcon from "@mui/icons-material/Place";

const getFooterTokens = (isDark) => ({
  border: isDark ? "rgba(20,184,166,0.15)" : "#e2e8f0",
  locationText: isDark ? "#14B8A6" : "#0E8584",
});

const SidebarFooter = ({
  collapsed,
  onLogout,
  isDark,
}) => {
  const t = useMemo(() => getFooterTokens(isDark), [isDark]);

  if (collapsed) {
    return (
      <Box
        sx={{
          padding: "12px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          borderTop: `1px solid ${t.border}`,
        }}
      >
        <IconButton
          onClick={onLogout}
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#ef4444",
            "&:hover": { background: "rgba(239,68,68,0.16)" },
          }}
        >
          <LogoutIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: "12px 14px 16px",
        borderTop: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          color: t.locationText,
          fontSize: 12,
          fontWeight: 600,
          marginBottom: "2px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <PlaceIcon sx={{ fontSize: 15 }} />
        Aşgabat
      </Box>

      <Button
        onClick={onLogout}
        sx={{
          width: "100%",
          height: 38,
          borderRadius: "24px",
          border: "1px solid rgba(239,68,68,0.25)",
          background: "rgba(239,68,68,0.06)",
          color: "#ef4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontSize: 13,
          fontWeight: 600,
          textTransform: "none",
          "&:hover": {
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.35)",
          },
          transition: "all 0.2s ease",
        }}
      >
        <LogoutIcon sx={{ fontSize: 16 }} />
        Logout
      </Button>
    </Box>
  );
};

export default SidebarFooter;
