import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { LogOut, MapPin } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../hooks/useLocale";

const SidebarFooter = ({ collapsed, onLogout }) => {
  const { user } = useAuth();
  const { selectedLang } = useLocale();

  const officeName =
    selectedLang(user?.office?.shortName) ||
    selectedLang(user?.office?.fullName) ||
    (typeof user?.office === "string" ? user.office : null);

  if (collapsed) {
    return (
      <Box
        sx={{
          py: 1.5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
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
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      {officeName && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
          <MapPin size={15} style={{ color: "#0E8584", flexShrink: 0 }} />
          <Typography
            variant="caption"
            noWrap
            sx={{
              fontSize: "0.76rem",
              fontWeight: 650,
              color: "text.primary",
              display: "block",
              lineHeight: 1.2,
            }}
          >
            {officeName}
          </Typography>
        </Box>
      )}

      <Tooltip title="Logout">
        <IconButton
          size="small"
          onClick={onLogout}
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            color: "text.secondary",
            ml: officeName ? 0 : "auto",
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
