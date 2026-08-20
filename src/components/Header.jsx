import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Tooltip,
  Divider,
  Button,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { ChevronDown, Home, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useSidebarItems } from '../hooks/useSidebarItems';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import NotificationPopover from './NotificationPopover';

function getRouteBreadcrumb(pathname, sidebarItems, defaultTitle) {
  for (const item of sidebarItems) {
    if (item.path && item.path === pathname) {
      return { text: item.text, parentText: null, path: item.path };
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.path === pathname) {
          return { text: child.text, parentText: item.text, path: child.path };
        }
      }
    }
  }

  let bestMatch = null;
  for (const item of sidebarItems) {
    if (item.path && item.path !== '/' && pathname.startsWith(item.path + '/')) {
      if (!bestMatch || item.path.length > bestMatch.path.length) {
        bestMatch = { text: item.text, parentText: null, path: item.path };
      }
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.path && child.path !== '/' && pathname.startsWith(child.path + '/')) {
          if (!bestMatch || child.path.length > bestMatch.path.length) {
            bestMatch = { text: child.text, parentText: item.text, path: child.path };
          }
        }
      }
    }
  }

  if (bestMatch) return bestMatch;
  if (pathname === '/') return { text: defaultTitle, parentText: null, path: '/' };
  return null;
}


const Header = ({ sidebarWidth = 100, onSidebarCollapse, sidebarCollapsed }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarItems = useSidebarItems();

  const [anchorElUser, setAnchorElUser] = useState(null);

  const currentRouteInfo = getRouteBreadcrumb(location.pathname, sidebarItems, t('sidebar.adminDashboard'));

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : '#e2e8f0',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(17, 25, 42, 0.88)'
            : 'rgba(255, 255, 255, 0.88)',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.25)'
            : '0 1px 3px rgba(0,0,0,0.04)',
        left: { xs: 0, md: sidebarWidth },
        width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.25 } }}>
          <IconButton
            onClick={onSidebarCollapse}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            sx={{
              height: 38,
              width: 38,
              borderRadius: '10px',
              color: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.7)'
                  : '#334155',
              '&:hover': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.06)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {sidebarCollapsed ? (
              <MenuIcon sx={{ fontSize: 22 }} />
            ) : (
              <MenuOpenIcon sx={{ fontSize: 22 }} />
            )}
          </IconButton>

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              height: 18,
              my: 'auto',
              borderColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.12)',
            }}
          />

          {/* Breadcrumbs Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Tooltip title={t('sidebar.adminDashboard') || 'Home'}>
              <IconButton
                size="small"
                onClick={() => navigate('/')}
                sx={{
                  p: '6px',
                  borderRadius: '8px',
                  color: location.pathname === '/'
                    ? (theme) => theme.palette.mode === 'dark' ? '#2DD4BF' : '#0E8584'
                    : 'text.secondary',
                  backgroundColor: location.pathname === '/'
                    ? (theme) => theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(14, 133, 132, 0.08)'
                    : 'transparent',
                  '&:hover': {
                    color: (theme) => theme.palette.mode === 'dark' ? '#2DD4BF' : '#0E8584',
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Home size={18} />
              </IconButton>
            </Tooltip>

            {currentRouteInfo && currentRouteInfo.path !== '/' && (
              <>
                <Typography
                  component="span"
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.25)'
                        : 'rgba(0, 0, 0, 0.25)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    userSelect: 'none',
                  }}
                >
                  /
                </Typography>

                {currentRouteInfo.parentText && currentRouteInfo.parentText !== currentRouteInfo.text && (
                  <>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.78rem', sm: '0.84rem' },
                        fontWeight: 500,
                        display: { xs: 'none', sm: 'inline-block' },
                      }}
                    >
                      {currentRouteInfo.parentText}
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        color: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.25)'
                            : 'rgba(0, 0, 0, 0.25)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        userSelect: 'none',
                        display: { xs: 'none', sm: 'inline-block' },
                      }}
                    >
                      /
                    </Typography>
                  </>
                )}

                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    color: 'text.primary',
                    fontWeight: 650,
                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                    letterSpacing: '-0.01em',
                    maxWidth: { xs: 120, sm: 200, md: 300 },
                  }}
                >
                  {currentRouteInfo.text}
                </Typography>
              </>
            )}
          </Box>
        </Box>

        {/* Right side items: Notifications, Language switcher, Dark/Light mode toggle, User menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationPopover />
          <LanguageSwitcher />
          <ThemeToggle />

          {user && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title={t('header.userMenuTooltip') || 'Profile'}>
                <Button
                  onClick={handleOpenUserMenu}
                  sx={{
                    p: '3px 8px 3px 4px',
                    borderRadius: '24px',
                    textTransform: 'none',
                    textAlign: 'left',
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.03)',
                    border: '1px solid',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)',
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(20, 184, 166, 0.3)'
                          : 'rgba(14, 133, 132, 0.25)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Modern Avatar with Online Status Indicator */}
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <Avatar
                        alt={user.name}
                        sx={{
                          width: 34,
                          height: 34,
                          background: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)'
                              : 'linear-gradient(135deg, #0E8584 0%, #14B8A6 100%)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          boxShadow: '0 2px 8px rgba(14, 133, 132, 0.25)',
                        }}
                      >
                        {(user.name || user.fullName || user.phone_number || '?').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 9,
                          height: 9,
                          bgcolor: '#10B981',
                          borderRadius: '50%',
                          border: (theme) =>
                            `2px solid ${theme.palette.mode === 'dark' ? '#11192A' : '#ffffff'
                            }`,
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: { xs: 'none', sm: 'flex' },
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        maxWidth: 130,
                      }}
                    >
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: 650,
                          fontSize: '0.825rem',
                          lineHeight: 1.2,
                          color: (theme) =>
                            theme.palette.mode === 'dark' ? '#F8FAFC' : '#0F172A',
                          maxWidth: '100%',
                        }}
                      >
                        {user.name || user.fullName || user.phone_number}
                      </Typography>
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.68rem',
                          lineHeight: 1.1,
                          color: (theme) =>
                            theme.palette.mode === 'dark' ? '#2DD4BF' : '#0E8584',
                          textTransform: 'capitalize',
                          maxWidth: '100%',
                        }}
                      >
                        {user.position || user.position_name || user.role || 'User'}
                      </Typography>
                    </Box>

                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: anchorElUser ? 'rotate(180deg)' : 'none',
                        ml: -0.25,
                      }}
                    >
                      <ChevronDown size={15} />
                    </Box>
                  </Box>
                </Button>
              </Tooltip>

              <Menu
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1.5,
                      borderRadius: '14px',
                      minWidth: 230,
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '#11192A'
                          : '#ffffff',
                      boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '0 12px 36px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)'
                          : '0 12px 36px rgba(15,23,42,0.12)',
                    },
                  },
                }}
              >
                {/* User Info Header in Dropdown */}
                <Box
                  sx={{
                    px: 1.5,
                    py: 1.2,
                    mb: 0.5,
                    borderRadius: '10px',
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(0,0,0,0.02)',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: 'text.primary',
                    }}
                  >
                    {user.name || user.fullName || user.phone_number}
                  </Typography>
                  {user.email ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ display: 'block', mt: 0.25 }}
                    >
                      {user.email}
                    </Typography>
                  ) : null}

                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      mt: 0.75,
                      px: 1,
                      py: 0.3,
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(20, 184, 166, 0.15)'
                          : 'rgba(14, 133, 132, 0.10)',
                      color: (theme) =>
                        theme.palette.mode === 'dark' ? '#2DD4BF' : '#0E8584',
                      textTransform: 'uppercase',
                    }}
                  >
                    {user.position || user.position_name || user.role || 'User'}
                  </Box>
                </Box>

                <Divider sx={{ my: 0.75 }} />

                <MenuItem
                  onClick={() => {
                    handleCloseUserMenu();
                    navigate('/profile');
                  }}
                  sx={{
                    borderRadius: '8px',
                    py: 1,
                    px: 1.5,
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    '&:hover': {
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(20, 184, 166, 0.12)'
                          : 'rgba(14, 133, 132, 0.08)',
                      color: (theme) =>
                        theme.palette.mode === 'dark' ? '#2DD4BF' : '#0E8584',
                    },
                    transition: 'all 0.15s ease',
                  }}
                >
                  <User size={18} style={{ marginRight: 12 }} />
                  {t('header.profile') || 'Profil & CV'}
                </MenuItem>

                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    borderRadius: '8px',
                    py: 1,
                    px: 1.5,
                    color: '#EF4444',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      color: '#DC2626',
                    },
                    transition: 'all 0.15s ease',
                  }}
                >
                  <LogoutIcon sx={{ mr: 1.5, fontSize: 18 }} />
                  {t('header.logout')}
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
