import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { Tooltip, ListItemButton, ListItemIcon, ListItemText, Collapse, List, Box } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// ── Shared palette helper ──
const getTokens = (isDark) => ({
  text: isDark ? 'rgba(255,255,255,0.65)' : '#111827',
  textActive: isDark ? '#ffffff' : '#030712',
  icon: isDark ? 'rgba(255,255,255,0.5)' : '#334155',
  iconActive: isDark ? '#14B8A6' : '#0E8584',
  activeBg: isDark ? 'rgba(20,184,166,0.13)' : 'rgba(14,133,132,0.08)',
  activeHoverBg: isDark ? 'rgba(20,184,166,0.16)' : 'rgba(14,133,132,0.12)',
  hoverBg: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
  borderActive: isDark ? '#14B8A6' : '#0E8584',
  borderHover: isDark ? 'rgba(20,184,166,0.4)' : 'rgba(14,133,132,0.25)',
  shadow: isDark ? '0 2px 12px rgba(20,184,166,0.15)' : '0 2px 8px rgba(14,133,132,0.08)',
  expandIcon: isDark ? 'rgba(255,255,255,0.4)' : '#334155',
});

const FlatItem = ({ item, isActive, onSidebarClose, collapsed, isDark }) => {
  const t = getTokens(isDark);

  const el = (
    <ListItemButton
      component={NavLink}
      to={item.path}
      onClick={onSidebarClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : '12px',
        padding: collapsed ? '10px 0' : '10px 14px',
        margin: collapsed ? '2px auto' : '2px 10px',
        borderRadius: '10px',
        width: collapsed ? '44px' : 'calc(100% - 20px)',
        minWidth: collapsed ? '44px' : 'auto',
        justifyContent: collapsed ? 'center' : 'flex-start',
        color: isActive ? t.textActive : t.text,
        backgroundColor: isActive ? t.activeBg : 'transparent',
        borderLeft: collapsed
          ? 'none'
          : isActive
          ? `3px solid ${t.borderActive}`
          : '3px solid transparent',
        boxShadow: isActive ? t.shadow : 'none',
        fontFamily: "'Inter', sans-serif",
        '&:hover': {
          backgroundColor: isActive ? t.activeHoverBg : t.hoverBg,
          color: t.textActive,
          borderLeft: collapsed ? 'none' : isActive ? `3px solid ${t.borderActive}` : `3px solid ${t.borderHover}`,
          '& .MuiListItemIcon-root': {
            color: t.iconActive,
          }
        },
        transition: 'all 0.2s ease',
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 'auto',
          color: isActive ? t.iconActive : t.icon,
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          flexShrink: 0,
          transition: 'color 0.2s ease',
        }}
      >
        {item.icon}
      </ListItemIcon>
      {!collapsed && (
        <ListItemText
          primary={item.text}
          slotProps={{
            primary: {
              noWrap: true,
              sx: {
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                fontFamily: "'Inter', sans-serif",
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }
          }}
          sx={{ margin: 0 }}
        />
      )}
    </ListItemButton>
  );

  if (collapsed) {
    return (
      <Tooltip title={item.text} placement="right" arrow>
        {el}
      </Tooltip>
    );
  }

  return el;
};

const GroupItem = ({ item, location, onSidebarClose, isExpanded, onToggleGroup, collapsed, isDark }) => {
  const t = getTokens(isDark);
  const hasActiveChild = item.children?.some((c) => c.path === location.pathname);

  const headerEl = (
    <ListItemButton
      onClick={() => onToggleGroup(item.text)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : '12px',
        padding: collapsed ? '10px 0' : '10px 14px',
        margin: collapsed ? '2px auto' : '2px 10px',
        borderRadius: '10px',
        width: collapsed ? '44px' : 'calc(100% - 20px)',
        minWidth: collapsed ? '44px' : 'auto',
        justifyContent: collapsed ? 'center' : 'flex-start',
        color: hasActiveChild ? t.textActive : t.text,
        fontFamily: "'Inter', sans-serif",
        '&:hover': {
          backgroundColor: hasActiveChild ? t.activeHoverBg : t.hoverBg,
          color: t.textActive,
          borderLeft: collapsed ? 'none' : hasActiveChild ? `3px solid ${t.borderActive}` : `3px solid ${t.borderHover}`,
          '& .MuiListItemIcon-root': {
            color: t.iconActive,
          }
        },
        transition: 'all 0.2s ease',
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 'auto',
          color: hasActiveChild ? t.iconActive : t.icon,
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          flexShrink: 0,
          transition: 'color 0.2s ease',
        }}
      >
        {item.icon}
      </ListItemIcon>
      {!collapsed && (
        <>
          <ListItemText
            primary={item.text}
            slotProps={{
              primary: {
                noWrap: true,
                sx: {
                  fontSize: 13.5,
                  fontWeight: hasActiveChild ? 600 : 500,
                  fontFamily: "'Inter', sans-serif",
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'left',
                },
              }
            }}
            sx={{ margin: 0 }}
          />
          <Box sx={{ color: t.expandIcon, display: 'flex', alignItems: 'center' }}>
            {isExpanded
              ? <ExpandLessIcon sx={{ fontSize: 16 }} />
              : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
          </Box>
        </>
      )}
    </ListItemButton>
  );

  return (
    <div>
      {collapsed
        ? <Tooltip title={item.text} placement="right" arrow>{headerEl}</Tooltip>
        : headerEl
      }

      {/* Children (using MUI Collapse and List components) */}
      <Collapse in={!collapsed && isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ overflow: 'hidden', marginTop: '2px' }}>
          {item.children?.map((child) => {
            const isChildActive = location.pathname === child.path;
            return (
              <ListItemButton
                key={child.text}
                component={NavLink}
                to={child.path}
                onClick={onSidebarClose}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 14px 8px 46px',
                  margin: '2px 10px',
                  borderRadius: '10px',
                  width: 'calc(100% - 20px)',
                  color: isChildActive ? t.textActive : t.text,
                  backgroundColor: isChildActive ? t.activeBg : 'transparent',
                  borderLeft: isChildActive ? `3px solid ${t.borderActive}` : '3px solid transparent',
                  boxShadow: isChildActive ? t.shadow : 'none',
                  fontFamily: "'Inter', sans-serif",
                  '&:hover': {
                    backgroundColor: isChildActive ? t.activeHoverBg : t.hoverBg,
                    color: t.textActive,
                    borderLeft: isChildActive ? `3px solid ${t.borderActive}` : `3px solid ${t.borderHover}`,
                    '& .MuiListItemIcon-root': {
                      color: t.iconActive,
                    }
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    color: isChildActive ? t.iconActive : t.icon,
                    fontSize: 17,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 18,
                    flexShrink: 0,
                    transition: 'color 0.2s ease',
                  }}
                >
                  {child.icon}
                </ListItemIcon>
                <ListItemText
                  primary={child.text}
                  slotProps={{
                    primary: {
                      noWrap: true,
                      sx: {
                        fontSize: 13,
                        fontWeight: isChildActive ? 600 : 500,
                        fontFamily: "'Inter', sans-serif",
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                    }
                  }}
                  sx={{ margin: 0 }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Collapse>
    </div>
  );
};

const SidebarItem = ({ item, location, onSidebarClose, isExpanded, onToggleGroup, collapsed, isDark }) => {
  if (item.isGroup) {
    return (
      <GroupItem
        item={item}
        location={location}
        onSidebarClose={onSidebarClose}
        isExpanded={isExpanded}
        onToggleGroup={onToggleGroup}
        collapsed={collapsed}
        isDark={isDark}
      />
    );
  }

  const isActive = location.pathname === item.path;
  return (
    <FlatItem
      item={item}
      isActive={isActive}
      onSidebarClose={onSidebarClose}
      collapsed={collapsed}
      isDark={isDark}
    />
  );
};

export default memo(SidebarItem, (prev, next) =>
  prev.isExpanded === next.isExpanded &&
  prev.location.pathname === next.location.pathname &&
  prev.item === next.item &&
  prev.onSidebarClose === next.onSidebarClose &&
  prev.onToggleGroup === next.onToggleGroup &&
  prev.collapsed === next.collapsed &&
  prev.isDark === next.isDark
);
