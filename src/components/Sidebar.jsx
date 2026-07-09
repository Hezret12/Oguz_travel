import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  useColorScheme,
  Box,
  Button,
  Divider,
  IconButton,
  Typography,
  List,
} from "@mui/material";
import { useNavItems } from "../hooks/useSidebarItems";
import SidebarItem from "./SidebarItem";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import PlaceIcon from "@mui/icons-material/Place";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const SIDEBAR_W = 280;
const SIDEBAR_CW = 68;

const SidebarLogo = ({ collapsed }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: collapsed ? "20px 0" : "20px 20px",
      justifyContent: collapsed ? "center" : "flex-start",
      transition: "all 0.3s ease",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "2px solid rgba(20,184,166,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        background: "rgba(20,184,166,0.12)",
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#14B8A6"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    </Box>

    {!collapsed && (
      <Box sx={{ overflow: "hidden" }}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "0.06em",
            lineHeight: 1.15,
            whiteSpace: "nowrap",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          OGUZ
        </Typography>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 500,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.12em",
            whiteSpace: "nowrap",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          TRAVEL
        </Typography>
      </Box>
    )}
  </Box>
);

const SidebarFooter = ({ collapsed, onLogout, mode, onToggleTheme, i18n }) => {
  const langs = ["TM", "EN", "RU"];
  const currentLang = (i18n.language || "tk").toUpperCase().slice(0, 2);
  const activeLang = langs.includes(currentLang) ? currentLang : "TM";

  const changeLang = (l) => {
    const map = { TM: "tk", EN: "en", RU: "ru" };
    i18n.changeLanguage(map[l]);
    localStorage.setItem("language", map[l]);
  };

  const isDark = mode === "dark";

  if (collapsed) {
    return (
      <Box
        sx={{
          padding: "12px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          borderTop: "1px solid rgba(20,184,166,0.15)",
        }}
      >
        {/* Lang pill (collapsed - show current) */}
        <Button
          onClick={() => {
            const idx = langs.indexOf(activeLang);
            changeLang(langs[(idx + 1) % langs.length]);
          }}
          sx={{
            width: 40,
            height: 28,
            minWidth: 40,
            borderRadius: "20px",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            padding: 0,
            textTransform: "none",
            "&:hover": {
              background: "rgba(255,255,255,0.2)",
            },
          }}
        >
          {activeLang}
        </Button>

        {/* Theme toggle */}
        <IconButton
          onClick={onToggleTheme}
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.8)",
            "&:hover": {
              background: "rgba(255,255,255,0.15)",
            },
          }}
        >
          {isDark ? (
            <LightModeIcon sx={{ fontSize: 17 }} />
          ) : (
            <DarkModeIcon sx={{ fontSize: 17 }} />
          )}
        </IconButton>

        {/* Logout */}
        <IconButton
          onClick={onLogout}
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444",
            "&:hover": {
              background: "rgba(239,68,68,0.25)",
            },
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
        borderTop: "1px solid rgba(20,184,166,0.15)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Location */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          color: "#14B8A6",
          fontSize: 12,
          fontWeight: 500,
          marginBottom: "2px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <PlaceIcon sx={{ fontSize: 15 }} />
        Aşgabat
      </Box>

      {/* Language switcher pill */}
      <Box
        sx={{
          display: "flex",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "3px",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {langs.map((l) => (
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
              background:
                activeLang === l ? "rgba(255,255,255,0.18)" : "transparent",
              color: activeLang === l ? "#ffffff" : "rgba(255,255,255,0.5)",
              "&:hover": {
                background:
                  activeLang === l
                    ? "rgba(255,255,255,0.22)"
                    : "rgba(255,255,255,0.05)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {l}
          </Button>
        ))}
      </Box>

      {/* Theme toggle pill */}
      <Box
        sx={{
          display: "flex",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "3px",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* Light */}
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
            background: !isDark ? "rgba(255,255,255,0.18)" : "transparent",
            color: !isDark ? "#ffffff" : "rgba(255,255,255,0.45)",
            "&:hover": {
              background: !isDark
                ? "rgba(255,255,255,0.22)"
                : "rgba(255,255,255,0.05)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <LightModeIcon sx={{ fontSize: 16 }} />
        </Button>
        {/* Dark */}
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
            background: isDark ? "rgba(255,255,255,0.18)" : "transparent",
            color: isDark ? "#ffffff" : "rgba(255,255,255,0.45)",
            "&:hover": {
              background: isDark
                ? "rgba(255,255,255,0.22)"
                : "rgba(255,255,255,0.05)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <DarkModeIcon sx={{ fontSize: 16 }} />
        </Button>
      </Box>

      {/* Logout */}
      <Button
        onClick={onLogout}
        sx={{
          width: "100%",
          height: 38,
          borderRadius: "24px",
          border: "1px solid rgba(239,68,68,0.35)",
          background: "rgba(239,68,68,0.1)",
          color: "#ef4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontSize: 13,
          fontWeight: 600,
          textTransform: "none",
          "&:hover": {
            background: "rgba(239,68,68,0.2)",
            border: "1px solid rgba(239,68,68,0.45)",
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

const Sidebar = ({ mobileOpen, onSidebarClose, onCollapsedChange }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { mode, setMode } = useColorScheme();
  const navItems = useNavItems();

  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
  };
  const [openGroups, setOpenGroups] = useState(() => {
    const init = {};
    navItems.forEach((item) => {
      if (item.isGroup && item.children) {
        if (item.children.some((c) => c.path === location.pathname)) {
          init[item.text] = true;
        }
      }
    });
    return init;
  });

  const handleGroupToggle = useCallback((groupText) => {
    setOpenGroups((prev) => ({ ...prev, [groupText]: !prev[groupText] }));
  }, []);

  useEffect(() => {
    navItems.forEach((item) => {
      if (item.isGroup && item.children) {
        const hasActiveChild = item.children.some(
          (c) => c.path === location.pathname,
        );
        if (hasActiveChild) {
          setOpenGroups((prev) => {
            if (prev[item.text] === undefined) {
              return { ...prev, [item.text]: true };
            }
            return prev;
          });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const toggleTheme = () => setMode(mode === "dark" ? "light" : "dark");

  if (!user) return null;

  const sidebarStyles = (isCol) => ({
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: isCol ? SIDEBAR_CW : SIDEBAR_W,
    background:
      mode === "dark"
        ? "linear-gradient(180deg, #021819 0%, #022C45 100%)"
        : "linear-gradient(180deg, #042F2E 0%, #0C4A6E 100%)",
    borderRight: "1px solid #14B8A633",
    display: "flex",
    flexDirection: "column",
    zIndex: 1200,
    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "hidden",
    boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
    fontFamily: "'Inter', sans-serif",
  });

  const collapseButtonStyles = {
    position: "absolute",
    top: 22,
    right: 8,
    width: 26,
    height: 26,
    minWidth: 26,
    borderRadius: "50%",
    background:
      mode === "dark"
        ? "linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)"
        : "linear-gradient(135deg, #0F766E, #0E7490)",
    border: "2px solid #042F2E",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    "&:hover": {
      transform: "scale(1.1)",
      background:
        mode === "dark"
          ? "linear-gradient(135deg, #0B7F74 0%, #0891B2 100%)"
          : "linear-gradient(135deg, #0F766E, #0E7490)",
    },
    transition: "all 0.2s ease",
    padding: 0,
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <Box sx={sidebarStyles(collapsed)}>
        {/* Collapse toggle */}
        <IconButton
          sx={collapseButtonStyles}
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRightIcon sx={{ fontSize: 15 }} />
          ) : (
            <ChevronLeftIcon sx={{ fontSize: 15 }} />
          )}
        </IconButton>

        {/* Logo */}
        <SidebarLogo collapsed={collapsed} />

        {/* Divider */}
        <Divider
          sx={{ borderColor: "rgba(20,184,166,0.2)", marginBottom: "8px" }}
        />

        {/* Nav items */}
        <List
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "8px 0",
          }}
        >
          {navItems.map((item) => (
            <SidebarItem
              key={item.text}
              item={item}
              location={location}
              onSidebarClose={onSidebarClose}
              isExpanded={Boolean(openGroups[item.text])}
              onToggleGroup={handleGroupToggle}
              collapsed={collapsed}
            />
          ))}
        </List>

        {/* Footer */}
        <SidebarFooter
          collapsed={collapsed}
          onLogout={handleLogout}
          mode={mode}
          onToggleTheme={toggleTheme}
          i18n={i18n}
        />
      </Box>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <>
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 1199,
            }}
            onClick={onSidebarClose}
          />
          <Box
            sx={{
              ...sidebarStyles(false),
              width: SIDEBAR_W,
              position: "fixed",
              zIndex: 1300,
            }}
          >
            <SidebarLogo collapsed={false} />
            <Divider
              sx={{ borderColor: "rgba(20,184,166,0.2)", marginBottom: "8px" }}
            />
            <List sx={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {navItems.map((item) => (
                <SidebarItem
                  key={item.text}
                  item={item}
                  location={location}
                  onSidebarClose={onSidebarClose}
                  isExpanded={Boolean(openGroups[item.text])}
                  onToggleGroup={handleGroupToggle}
                  collapsed={false}
                />
              ))}
            </List>
            <SidebarFooter
              collapsed={false}
              onLogout={handleLogout}
              mode={mode}
              onToggleTheme={toggleTheme}
              i18n={i18n}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default Sidebar;
