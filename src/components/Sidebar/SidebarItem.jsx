import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { Tooltip, ListItemButton, ListItemIcon, ListItemText, Collapse, List, Box } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { PATHS } from '../../routes/paths';

const isPathActive = (targetPath, currentPath) => {
  if (!targetPath || !currentPath) return false;
  if (targetPath === '/' || targetPath === PATHS.ROOT) {
    return currentPath === '/' || currentPath === '';
  }
  const cleanTarget = targetPath.replace(/\/+$/, '');
  const cleanCurrent = currentPath.replace(/\/+$/, '');
  return cleanCurrent === cleanTarget || cleanCurrent.startsWith(`${cleanTarget}/`);
};

const getTokens = (isDark) => ({
  text: isDark ? '#94A3B8' : '#475569',
  textActive: isDark ? '#FFFFFF' : '#0E8584',
  icon: isDark ? '#64748B' : '#64748B',
  iconActive: isDark ? '#2DD4BF' : '#0E8584',
  activeBg: isDark
    ? 'linear-gradient(90deg, rgba(45, 212, 191, 0.16) 0%, rgba(45, 212, 191, 0.04) 100%)'
    : 'linear-gradient(90deg, rgba(14, 133, 132, 0.10) 0%, rgba(14, 133, 132, 0.03) 100%)',
  activeHoverBg: isDark
    ? 'linear-gradient(90deg, rgba(45, 212, 191, 0.22) 0%, rgba(45, 212, 191, 0.08) 100%)'
    : 'linear-gradient(90deg, rgba(14, 133, 132, 0.14) 0%, rgba(14, 133, 132, 0.05) 100%)',
  activeIndicator: isDark
    ? 'inset 3.5px 0 0 #2DD4BF'
    : 'inset 3.5px 0 0 #0E8584',
  childActiveIndicator: isDark
    ? 'inset 2.5px 0 0 #2DD4BF'
    : 'inset 2.5px 0 0 #0E8584',
  hoverBg: isDark ? 'rgba(255, 255, 255, 0.045)' : 'rgba(0, 0, 0, 0.035)',
  treeRail: isDark ? 'rgba(45, 212, 191, 0.14)' : 'rgba(0, 0, 0, 0.07)',
  expandIcon: isDark ? '#6B96A8' : '#94A3B8',
});

const FlatItem = ({ item, isActive, onSidebarClose, collapsed, isDark }) => {
  const t = getTokens(isDark);

  const el = (
    <ListItemButton
      component={NavLink}
      to={item.path}
      end={item.path === '/' || item.path === PATHS.ROOT}
      selected={isActive}
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
        background: isActive ? t.activeBg : 'transparent',
        boxShadow: isActive ? t.activeIndicator : 'none',
        fontFamily: "'Inter', sans-serif",
        '&.active, &.Mui-selected': {
          background: `${t.activeBg} !important`,
          color: `${t.textActive} !important`,
          boxShadow: `${t.activeIndicator} !important`,
          '& .MuiListItemIcon-root': {
            color: `${t.iconActive} !important`,
          },
        },
        '&:hover': {
          background: isActive ? t.activeHoverBg : t.hoverBg,
          color: t.textActive,
          '& .MuiListItemIcon-root': {
            color: t.iconActive,
          },
        },
        transition: 'all 0.18s ease',
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
                fontWeight: isActive ? 600 : 500,
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
        background: hasActiveChild && !isExpanded ? t.activeBg : 'transparent',
        boxShadow: hasActiveChild && !isExpanded ? t.activeIndicator : 'none',
        fontFamily: "'Inter', sans-serif",
        '&:hover': {
          background: hasActiveChild && !isExpanded ? t.activeHoverBg : t.hoverBg,
          color: t.textActive,
          '& .MuiListItemIcon-root': {
            color: t.iconActive,
          },
        },
        transition: 'all 0.18s ease',
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
                  fontWeight: hasActiveChild ? 600 : 500,
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
                end={child.path === '/' || child.path === PATHS.ROOT}
                selected={isChildActive}
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
                  background: isChildActive ? t.activeBg : 'transparent',
                  boxShadow: isChildActive ? t.childActiveIndicator : 'none',
                  fontFamily: "'Inter', sans-serif",
                  '&.active, &.Mui-selected': {
                    background: `${t.activeBg} !important`,
                    color: `${t.textActive} !important`,
                    boxShadow: `${t.childActiveIndicator} !important`,
                    '& .MuiListItemIcon-root': {
                      color: `${t.iconActive} !important`,
                    },
                  },
                  '&:hover': {
                    background: isChildActive ? t.activeHoverBg : t.hoverBg,
                    color: t.textActive,
                    '& .MuiListItemIcon-root': {
                      color: t.iconActive,
                    },
                  },
                  transition: 'all 0.18s ease',
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
                        fontWeight: isChildActive ? 600 : 500,
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
