import { useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useColorScheme, Box, List } from "@mui/material";
import SidebarItem from "./SidebarItem";
import SidebarFooter from "./SidebarFooter";
import OguzLogo from "../../assets/icons/OguzLogo";
import { useAuth } from "../../context/AuthContext";
import { useNavItems } from "../../hooks/useSidebarItems";

const SIDEBAR_W = 280;
const SIDEBAR_CW = 68;

const sidebarSurfaceStyles = (isDark, width) => ({
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  width,
  background: isDark
    ? "#11192A"
    : "#ffffff",
  borderRight: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
  zIndex: 1200,
  transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden",
  boxShadow: isDark
    ? "4px 0 24px rgba(0,0,0,0.30)"
    : "1px 0 12px rgba(0,0,0,0.06)",
  fontFamily: "'Inter', sans-serif",
});

const SidebarPanel = ({
  collapsed,
  isDark,
  navItems,
  location,
  onSidebarClose,
  openGroups,
  onToggleGroup,
  onLogout,
  onToggleTheme,
  i18n,
}) => (
  <>
    {/* Brand Header */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 64,
        px: collapsed ? 1 : 2.5,
        borderBottom: "1px solid",
        borderColor: isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
        flexShrink: 0,
        transition: "padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          cursor: "pointer",
        }}
      >
        <OguzLogo
          sx={{
            width: collapsed ? 38 : 136,
            height: collapsed ? 30 : 34,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </Box>
    </Box>

    {/* Scrollable Navigation List */}
    <List
      sx={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: "10px 0",
        "&::-webkit-scrollbar": {
          width: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
          borderRadius: "4px",
        },
        "&:hover::-webkit-scrollbar-thumb": {
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.16)",
        },
      }}
    >
      {navItems.map((item) => (
        <SidebarItem
          key={item.text}
          item={item}
          location={location}
          onSidebarClose={onSidebarClose}
          isExpanded={Boolean(openGroups[item.text])}
          onToggleGroup={onToggleGroup}
          collapsed={collapsed}
          isDark={isDark}
        />
      ))}
    </List>

    <SidebarFooter
      collapsed={collapsed}
      onLogout={onLogout}
      isDark={isDark}
      onToggleTheme={onToggleTheme}
      i18n={i18n}
    />
  </>
);

const Sidebar = ({ mobileOpen, onSidebarClose, collapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { mode, setMode } = useColorScheme();
  const navItems = useNavItems();
  const isDark = mode === "dark";

  const filteredNavItems = useMemo(() => {
    if (!user || !user.permissions) return navItems;

    return navItems
      .map((item) => {
        if (item.isGroup && item.children) {
          const allowedChildren = item.children.filter((child) =>
            user.permissions.includes(child.path),
          );
          if (allowedChildren.length === 0) return null;
          return { ...item, children: allowedChildren };
        }
        if (item.path && !user.permissions.includes(item.path)) {
          return null;
        }
        return item;
      })
      .filter(Boolean);
  }, [navItems, user]);

  const autoOpenGroups = useMemo(() => {
    const result = {};
    filteredNavItems.forEach((item) => {
      if (!item.isGroup || !item.children) return;
      if (item.children.some((c) => c.path === location.pathname)) {
        result[item.text] = true;
      }
    });
    return result;
  }, [filteredNavItems, location.pathname]);

  const [manualOverrides, setManualOverrides] = useState({});

  const openGroups = useMemo(
    () => ({ ...autoOpenGroups, ...manualOverrides }),
    [autoOpenGroups, manualOverrides],
  );

  const handleGroupToggle = useCallback(
    (groupText) => {
      setManualOverrides((prev) => ({
        ...prev,
        [groupText]: !(prev[groupText] ?? autoOpenGroups[groupText] ?? false),
      }));
    },
    [autoOpenGroups],
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const toggleTheme = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const desktopStyles = useMemo(
    () => sidebarSurfaceStyles(isDark, collapsed ? SIDEBAR_CW : SIDEBAR_W),
    [isDark, collapsed],
  );

  const mobileStyles = useMemo(
    () => ({
      ...sidebarSurfaceStyles(isDark, SIDEBAR_W),
      position: "fixed",
      zIndex: 1300,
    }),
    [isDark],
  );

  if (!user) return null;

  const panelProps = {
    isDark,
    navItems: filteredNavItems,
    location,
    openGroups,
    onToggleGroup: handleGroupToggle,
    onLogout: handleLogout,
    onToggleTheme: toggleTheme,
    i18n,
  };

  return (
    <>
      <Box sx={desktopStyles}>
        <SidebarPanel
          {...panelProps}
          collapsed={collapsed}
          onSidebarClose={onSidebarClose}
        />
      </Box>

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
          <Box sx={mobileStyles}>
            <SidebarPanel
              {...panelProps}
              collapsed={false}
              onSidebarClose={onSidebarClose}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default Sidebar;
