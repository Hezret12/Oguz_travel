import { useMemo, useCallback } from "react";
import { Box, Button, IconButton } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import PlaceIcon from "@mui/icons-material/Place";

const LANGS = ["TM", "EN", "RU"];
const LANG_MAP = { TM: "tk", EN: "en", RU: "ru" };

const getFooterTokens = (isDark) => ({
  border: isDark ? "rgba(20,184,166,0.15)" : "#e2e8f0",
  pill: {
    bg: isDark ? "rgba(255,255,255,0.08)" : "rgba(14,133,132,0.06)",
    border: isDark ? "rgba(255,255,255,0.12)" : "rgba(14,133,132,0.12)",
    activeBg: isDark ? "rgba(255,255,255,0.18)" : "rgba(14,133,132,0.14)",
    activeText: isDark ? "#ffffff" : "#0E8584",
    inactiveText: isDark ? "rgba(255,255,255,0.5)" : "#475569",
    hoverActiveBg: isDark ? "rgba(255,255,255,0.22)" : "rgba(14,133,132,0.18)",
    hoverInactiveBg: isDark
      ? "rgba(255,255,255,0.05)"
      : "rgba(14,133,132,0.04)",
  },
  iconBtn: {
    bg: isDark ? "rgba(255,255,255,0.08)" : "rgba(14,133,132,0.06)",
    border: isDark ? "rgba(255,255,255,0.12)" : "rgba(14,133,132,0.12)",
    color: isDark ? "rgba(255,255,255,0.8)" : "#1e293b",
    hover: isDark ? "rgba(255,255,255,0.15)" : "rgba(14,133,132,0.1)",
  },
  locationText: isDark ? "#14B8A6" : "#0E8584",
});

const SidebarFooter = ({
  collapsed,
  onLogout,
  isDark,
  onToggleTheme,
  i18n,
}) => {
  const t = useMemo(() => getFooterTokens(isDark), [isDark]);

  const activeLang = useMemo(() => {
    const current = (i18n.language || "tk").toUpperCase().slice(0, 2);
    return LANGS.includes(current) ? current : "TM";
  }, [i18n.language]);

  const changeLang = useCallback(
    (l) => {
      i18n.changeLanguage(LANG_MAP[l]);
      localStorage.setItem("language", LANG_MAP[l]);
    },
    [i18n],
  );

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
        <Button
          onClick={() => {
            const idx = LANGS.indexOf(activeLang);
            changeLang(LANGS[(idx + 1) % LANGS.length]);
          }}
          sx={{
            width: 40,
            height: 28,
            minWidth: 40,
            borderRadius: "20px",
            background: t.pill.bg,
            border: `1px solid ${t.pill.border}`,
            color: t.pill.activeText,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            padding: 0,
            textTransform: "none",
            "&:hover": { background: t.pill.hoverActiveBg },
          }}
        >
          {activeLang}
        </Button>

        <IconButton
          onClick={onToggleTheme}
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: t.iconBtn.bg,
            border: `1px solid ${t.iconBtn.border}`,
            color: t.iconBtn.color,
            "&:hover": { background: t.iconBtn.hover },
          }}
        >
          {isDark ? (
            <LightModeIcon sx={{ fontSize: 17 }} />
          ) : (
            <DarkModeIcon sx={{ fontSize: 17 }} />
          )}
        </IconButton>

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

      <Box
        sx={{
          display: "flex",
          background: t.pill.bg,
          borderRadius: "24px",
          padding: "3px",
          border: `1px solid ${t.pill.border}`,
        }}
      >
        {LANGS.map((l) => {
          const active = activeLang === l;
          return (
            <Button
              key={l}
              onClick={() => changeLang(l)}
              sx={{
                flex: 1,
                height: 30,
                borderRadius: "20px",
                border: "none",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "none",
                background: active ? t.pill.activeBg : "transparent",
                color: active ? t.pill.activeText : t.pill.inactiveText,
                "&:hover": {
                  background: active
                    ? t.pill.hoverActiveBg
                    : t.pill.hoverInactiveBg,
                },
                transition: "all 0.2s ease",
              }}
            >
              {l}
            </Button>
          );
        })}
      </Box>

      <Box
        sx={{
          display: "flex",
          background: t.pill.bg,
          borderRadius: "24px",
          padding: "3px",
          border: `1px solid ${t.pill.border}`,
        }}
      >
        <Button
          onClick={onToggleTheme}
          sx={{
            flex: 1,
            height: 30,
            borderRadius: "20px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: !isDark ? t.pill.activeBg : "transparent",
            color: !isDark ? t.pill.activeText : t.pill.inactiveText,
            "&:hover": {
              background: !isDark
                ? t.pill.hoverActiveBg
                : t.pill.hoverInactiveBg,
            },
            transition: "all 0.2s ease",
          }}
        >
          <LightModeIcon sx={{ fontSize: 16 }} />
        </Button>
        <Button
          onClick={onToggleTheme}
          sx={{
            flex: 1,
            height: 30,
            borderRadius: "20px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isDark ? t.pill.activeBg : "transparent",
            color: isDark ? t.pill.activeText : t.pill.inactiveText,
            "&:hover": {
              background: isDark
                ? t.pill.hoverActiveBg
                : t.pill.hoverInactiveBg,
            },
            transition: "all 0.2s ease",
          }}
        >
          <DarkModeIcon sx={{ fontSize: 16 }} />
        </Button>
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
