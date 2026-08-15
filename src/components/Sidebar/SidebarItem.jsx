import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { Tooltip, ListItemButton, ListItemIcon, ListItemText, Collapse, List, Box } from '@mui/material';
import { ChevronDown } from 'lucide-react';

const isPathActive = (targetPath, currentPath) => {
  if (!targetPath || !currentPath) return false;
  return currentPath === targetPath;
};

const getTokens = (isDark) => ({
  text: isDark ? '#94A3B8' : '#475569',
  textActive: isDark ? '#F8FAFC' : '#0F172A',
  icon: isDark ? '#64748B' : '#64748B',
  iconActive: isDark ? '#2DD4BF' : '#0E8584',
  activeBg: isDark ? 'rgba(20, 184, 166, 0.12)' : 'rgba(14, 133, 132, 0.08)',
  activeHoverBg: isDark ? 'rgba(20, 184, 166, 0.18)' : 'rgba(14, 133, 132, 0.12)',
  hoverBg: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  treeRail: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.07)',
  expandIcon: isDark ? '#64748B' : '#94A3B8',
});

const FlatItem = ({ item, isActive, onSidebarClose, collapsed, isDark }) => {
  const t = getTokens(isDark);

  const el = (
    <ListItemButton
      component={NavLink}
      to={item.path}
      end
      onClick={onSidebarClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : '12px',
        padding: collapsed ? '11px 0' : '10px 14px',
        margin: collapsed ? '3px auto' : '2px 10px',
        borderRadius: '10px',
        width: collapsed ? '44px' : 'calc(100% - 20px)',
        minWidth: collapsed ? '44px' : 'auto',
        justifyContent: collapsed ? 'center' : 'flex-start',
        color: isActive ? t.textActive : t.text,
        backgroundColor: isActive ? t.activeBg : 'transparent',
        fontFamily: "'Inter', sans-serif",
        '&:hover': {
          backgroundColor: isActive ? t.activeHoverBg : t.hoverBg,
          color: t.textActive,
          '& .MuiListItemIcon-root': {
            color: t.iconActive,
          },
        },
        transition: 'all 0.15s ease',
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 'auto',
          color: isActive ? t.iconActive : (item.iconColor || t.icon),
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          flexShrink: 0,
          transition: 'color 0.15s ease',
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
                fontSize: '0.915rem',
                fontWeight: isActive ? 650 : 500,
                fontFamily: "'Inter', sans-serif",
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            },
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
  const itemKey = item.id || item.text;
  const hasActiveChild = item.children?.some((c) => isPathActive(c.path, location.pathname));

  const headerEl = (
    <ListItemButton
      onClick={() => onToggleGroup(itemKey)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : '12px',
        padding: collapsed ? '11px 0' : '10px 14px',
        margin: collapsed ? '3px auto' : '2px 10px',
        borderRadius: '10px',
        width: collapsed ? '44px' : 'calc(100% - 20px)',
        minWidth: collapsed ? '44px' : 'auto',
        justifyContent: collapsed ? 'center' : 'flex-start',
        color: hasActiveChild ? t.textActive : t.text,
        backgroundColor: hasActiveChild && !isExpanded ? t.activeBg : 'transparent',
        fontFamily: "'Inter', sans-serif",
        '&:hover': {
          backgroundColor: t.hoverBg,
          color: t.textActive,
          '& .MuiListItemIcon-root': {
            color: t.iconActive,
          },
        },
        transition: 'all 0.15s ease',
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 'auto',
          color: hasActiveChild ? t.iconActive : (item.iconColor || t.icon),
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          flexShrink: 0,
          transition: 'color 0.15s ease',
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
                  fontSize: '0.915rem',
                  fontWeight: hasActiveChild ? 650 : 500,
                  fontFamily: "'Inter', sans-serif",
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'left',
                },
              },
            }}
            sx={{ margin: 0 }}
          />
          <Box
            sx={{
              color: t.expandIcon,
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isExpanded ? 'rotate(180deg)' : 'none',
            }}
          >
            <ChevronDown size={16} />
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

      <Collapse in={!collapsed && isExpanded} timeout="auto" unmountOnExit>
        <List
          component="div"
          disablePadding
          sx={{
            overflow: 'hidden',
            mt: 0.5,
            mb: 0.5,
            ml: '22px',
            pl: '10px',
            borderLeft: `1.5px solid ${t.treeRail}`,
          }}
        >
          {item.children?.map((child) => {
            const childKey = child.id || child.path || child.text;
            const isChildActive = isPathActive(child.path, location.pathname);
            return (
              <ListItemButton
                key={childKey}
                component={NavLink}
                to={child.path}
                end
                onClick={onSidebarClose}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  margin: '2px 0',
                  borderRadius: '8px',
                  width: '100%',
                  color: isChildActive ? t.textActive : t.text,
                  backgroundColor: isChildActive ? t.activeBg : 'transparent',
                  fontFamily: "'Inter', sans-serif",
                  '&:hover': {
                    backgroundColor: isChildActive ? t.activeHoverBg : t.hoverBg,
                    color: t.textActive,
                    '& .MuiListItemIcon-root': {
                      color: t.iconActive,
                    },
                  },
                  transition: 'all 0.15s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    color: isChildActive ? t.iconActive : (child.iconColor || t.icon),
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    flexShrink: 0,
                    transition: 'color 0.15s ease',
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
                        fontSize: '0.865rem',
                        fontWeight: isChildActive ? 650 : 500,
                        fontFamily: "'Inter', sans-serif",
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                    },
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

  const isActive = isPathActive(item.path, location.pathname);
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
