import { useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useColorScheme, Box, List } from "@mui/material";
import SidebarItem from "./SidebarItem";
import SidebarFooter from "./SidebarFooter";
import { useAuth } from "../../context/useAuth";
import { useNavItems } from "../../hooks/useSidebarItems";
import OguzLogo from "../../assets/icons/OguzLogo";

const SIDEBAR_W = 280;
const SIDEBAR_CW = 68;

const sidebarSurfaceStyles = (theme, width) => ({
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  width,
  background: "#ffffff",
  borderRight: "1px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
  zIndex: 1200,
  transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden",
  boxShadow: "1px 0 12px rgba(0,0,0,0.06)",
  fontFamily: "'Inter', sans-serif",
  ...theme.applyStyles("dark", {
    background: "linear-gradient(180deg, #021819 0%, #022C45 100%)",
    borderRight: "1px solid rgba(45, 212, 191, 0.12)",
    boxShadow: "4px 0 30px rgba(0,0,0,0.45)",
  }),
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
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 94,
        px: collapsed ? 1 : 2.5,
        borderBottom: "1px solid",
        borderColor: "rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
        flexShrink: 0,
        transition: "padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        ...theme.applyStyles("dark", {
          borderColor: "rgba(45, 212, 191, 0.10)",
        }),
      })}
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
        {/* <OguzLogo
          iconOnly={collapsed}
          sx={{
            width: collapsed ? 36 : 175,
            height: collapsed ? 36 : 82,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        /> */}
      </Box>
    </Box>

    <List
      sx={(theme) => ({
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: "10px 0",
        "&::-webkit-scrollbar": {
          width: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0, 0, 0, 0.08)",
          borderRadius: "4px",
          ...theme.applyStyles("dark", {
            backgroundColor: "rgba(45, 212, 191, 0.16)",
          }),
        },
        "&:hover::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0, 0, 0, 0.16)",
          ...theme.applyStyles("dark", {
            backgroundColor: "rgba(45, 212, 191, 0.30)",
          }),
        },
      })}
    >
      {navItems.map((item) => {
        const itemKey = item.id || item.text;
        return (
          <SidebarItem
            key={itemKey}
            item={item}
            location={location}
            onSidebarClose={onSidebarClose}
            isExpanded={Boolean(openGroups[itemKey])}
            onToggleGroup={onToggleGroup}
            collapsed={collapsed}
            isDark={isDark}
          />
        );
      })}
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
    if (!user) return [];

    if (
      Array.isArray(user.permissions) &&
      user.permissions.includes("*")
    ) {
      return navItems;
    }

    if (Array.isArray(user.permissions)) {
      const isPathAllowed = (path) => {
        if (!path) return false;
        return user.permissions.some(
          (perm) => path === perm || (perm !== "/" && path.startsWith(perm + "/")),
        );
      };

      return navItems
        .map((item) => {
          if (item.alwaysVisible || item.openToAll) {
            return item;
          }
          if (item.isGroup && item.children) {
            const allowedChildren = item.children.filter((child) =>
              child.alwaysVisible || isPathAllowed(child.path),
            );
            if (allowedChildren.length === 0) return null;
            return { ...item, children: allowedChildren };
          }
          if (item.path && !isPathAllowed(item.path)) {
            return null;
          }
          return item;
        })
        .filter(Boolean);
    }

    return navItems;
  }, [navItems, user]);

  const autoOpenGroups = useMemo(() => {
    const result = {};
    const currentPath = location.pathname;
    filteredNavItems.forEach((item) => {
      if (!item.isGroup || !item.children) return;
      const key = item.id || item.text;
      if (
        item.children.some(
          (c) =>
            currentPath === c.path ||
            (c.path !== "/" && currentPath.startsWith(c.path + "/")),
        )
      ) {
        result[key] = true;
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
    (groupId) => {
      setManualOverrides((prev) => ({
        ...prev,
        [groupId]: !(prev[groupId] ?? autoOpenGroups[groupId] ?? false),
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
    () => (theme) => sidebarSurfaceStyles(theme, collapsed ? SIDEBAR_CW : SIDEBAR_W),
    [collapsed],
  );

  const mobileStyles = useMemo(
    () => (theme) => ({
      ...sidebarSurfaceStyles(theme, SIDEBAR_W),
      position: "fixed",
      zIndex: 1300,
    }),
    [],
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
