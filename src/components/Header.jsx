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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';


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
            ? 'rgba(20,184,166,0.15)'
            : '#e2e8f0',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark'
            ? theme.palette.background.paper
            : '#ffffff',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? 'none'
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

        {/* Right side items: Language switcher, Dark/Light mode toggle, User menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LanguageSwitcher />
          <ThemeToggle />

          {user && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title={t('header.userMenuTooltip') || 'User Menu'}>
                <Button
                  onClick={handleOpenUserMenu}
                  sx={{
                    p: 0.5,
                    px: 1.2,
                    borderRadius: '10px',
                    textTransform: 'none',
                    textAlign: 'left',
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                    border: '1px solid',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                    '&:hover': {
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)',
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      alt={user.name}
                      sx={{
                        width: 34,
                        height: 34,
                        border: '2px solid #0E8584',
                        bgcolor: 'rgba(14,133,132,0.1)',
                        color: '#0E8584',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}
                    >
                      {(user.name || '?').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-start', mr: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.825rem',
                          lineHeight: 1.2,
                          color: (theme) =>
                            theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                        }}
                      >
                        {user.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.70rem',
                          lineHeight: 1.1,
                          color: (theme) =>
                            theme.palette.mode === 'dark' ? '#14B8A6' : '#0E8584',
                          textTransform: 'capitalize',
                        }}
                      >
                        {user.position || user.position_name || user.role || user.job_title || 'User'}
                      </Typography>
                    </Box>
                    <KeyboardArrowDownIcon
                      sx={{
                        fontSize: 16,
                        color: (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : '#64748b',
                        transition: 'transform 0.2s',
                        transform: anchorElUser ? 'rotate(180deg)' : 'none',
                      }}
                    />
                  </Box>
                </Button>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                slotProps={{
                  paper: {
                    sx: {
                      boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
                      borderRadius: '12px',
                      minWidth: 200,
                      p: 1,
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {user.name}
                  </Typography>
                  {user.email ? (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      {user.email}
                    </Typography>
                  ) : null}
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.25,
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color:
                        user.role === 'admin'
                          ? 'error.contrastText'
                          : user.role === 'agent'
                            ? 'warning.contrastText'
                            : 'primary.contrastText',
                    }}
                  >
                    {user.position || user.position_name || user.role}
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleCloseUserMenu}>
                  <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  {t('header.profile')}
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
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
