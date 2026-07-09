import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const SIDEBAR_W  = 280;
const SIDEBAR_CW = 68;

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  // We track collapsed state here so the main content shifts accordingly
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleDrawerClose  = () => setMobileOpen(false);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_CW : SIDEBAR_W;

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />

      <Header
        onSidebarToggle={handleDrawerToggle}
        sidebarWidth={sidebarWidth}
      />

      <Sidebar
        mobileOpen={mobileOpen}
        onSidebarClose={handleDrawerClose}
        onCollapsedChange={setSidebarCollapsed}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          ml: { xs: 0, md: `${sidebarWidth}px` },
          mt: '64px', // header height
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '' : '#F0F4F8',
          height: 'calc(100vh - 64px)',
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
