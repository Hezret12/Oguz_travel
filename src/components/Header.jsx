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
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import NotificationPopover from './NotificationPopover';


const Header = ({ sidebarWidth = 100, onSidebarCollapse, sidebarCollapsed }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorElUser, setAnchorElUser] = useState(null);

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
        {/* Sidebar collapse toggle */}
        <IconButton
          onClick={onSidebarCollapse}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          sx={{
            height: 38,
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
                            `2px solid ${
                              theme.palette.mode === 'dark' ? '#11192A' : '#ffffff'
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
