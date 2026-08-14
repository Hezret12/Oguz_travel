import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { LogOut, MapPin } from "lucide-react";

const SidebarFooter = ({ collapsed, onLogout, isDark }) => {
  if (collapsed) {
    return (
      <Box
        sx={{
          py: 1.5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.06)",
        }}
      >
        <Tooltip title="Logout" placement="right">
          <IconButton
            onClick={onLogout}
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              color: "#EF4444",
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.08)",
              },
              transition: "all 0.15s ease",
            }}
          >
            <LogOut size={17} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: "12px 14px",
        borderTop: "1px solid",
        borderColor: isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
        <MapPin size={15} style={{ color: isDark ? "#2DD4BF" : "#0E8584", flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            noWrap
            sx={{
              fontSize: "0.76rem",
              fontWeight: 650,
              color: isDark ? "#F8FAFC" : "#0F172A",
              display: "block",
              lineHeight: 1.2,
            }}
          >
            Aşgabat
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{
              fontSize: "0.66rem",
              color: "text.secondary",
              display: "block",
              lineHeight: 1.1,
            }}
          >
            Baş Ofis
          </Typography>
        </Box>
      </Box>

      <Tooltip title="Logout">
        <IconButton
          size="small"
          onClick={onLogout}
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            color: "text.secondary",
            "&:hover": {
              color: "#EF4444",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
            },
            transition: "all 0.15s ease",
          }}
        >
          <LogOut size={16} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default SidebarFooter;
