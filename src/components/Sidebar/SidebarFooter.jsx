import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { LogOut, MapPin } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../hooks/useLocale";

const APP_VERSION = `v${import.meta.env.VITE_APP_VERSION}`;

const SidebarFooter = ({ collapsed, onLogout, isDark }) => {
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
          borderColor: isDark ? "rgba(45, 212, 191, 0.10)" : "divider",
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
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            fontSize: "0.62rem",
            fontWeight: 500,
            color: "text.secondary",
            lineHeight: 1.2,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {APP_VERSION}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: "12px 14px",
        borderTop: "1px solid",
        borderColor: isDark ? "rgba(45, 212, 191, 0.10)" : "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4, minWidth: 0 }}>
        {officeName && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
            <MapPin size={15} style={{ color: isDark ? "#2DD4BF" : "#0E8584", flexShrink: 0 }} />
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
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.68rem",
            fontWeight: 500,
            color: "text.secondary",
            lineHeight: 1.2,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {APP_VERSION}
        </Typography>
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
