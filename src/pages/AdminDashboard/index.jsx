import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LayersIcon from '@mui/icons-material/Layers';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const stats = [
    { title: t('admin.stats.totalRevenue'), value: '$124,500', change: t('admin.statsChanges.revenue'), icon: <TrendingUpIcon color="success" />, bg: '#E8F5E9' },
    { title: t('admin.stats.registeredUsers'), value: '1,482', change: t('admin.statsChanges.users'), icon: <PeopleIcon color="primary" />, bg: '#E3F2FD' },
    { title: t('admin.stats.activeAgents'), value: '45', change: t('admin.statsChanges.agents'), icon: <SupportAgentIcon color="warning" />, bg: '#FFF3E0' },
    { title: t('admin.stats.apiIntegrations'), value: '99.9%', change: t('admin.statsChanges.api'), icon: <LayersIcon color="secondary" />, bg: '#F3E5F5' },
  ];

  const recentLogs = [
    { id: 'LOG-001', event: t('admin.logs.newAgent'), user: 'Kerem Agent', time: '10 mins ago', status: 'success' },
    { id: 'LOG-002', event: t('admin.logs.priceUpdated'), user: 'Oğuzhan Admin', time: '1 hour ago', status: 'success' },
    { id: 'LOG-003', event: t('admin.logs.backupCreated'), user: 'System Cron', time: '3 hours ago', status: 'info' },
    { id: 'LOG-004', event: t('admin.logs.failedLogin'), user: 'IP: 192.168.1.45', time: '5 hours ago', status: 'warning' },
  ];

  return (
    <Box sx={{ py: 2 }}>
      <Helmet>
        <title>{t('admin.title') || 'Admin Dashboard'} | Oguz Travel</title>
      </Helmet>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {t('admin.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('admin.subtitle', { name: user?.name })}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card sx={{ borderRadius: '12px', boxShadow: '0px 4px 20px rgba(0,0,0,0.03)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {stat.change}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: stat.bg, width: 56, height: 56 }}>
                  {stat.icon}
                </Avatar>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Logs & System Table */}
      <Card sx={{ borderRadius: '12px', boxShadow: '0px 4px 20px rgba(0,0,0,0.03)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t('admin.logs.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('admin.logs.subtitle')}
              </Typography>
            </Box>
            <Button variant="outlined" size="small"> {t('admin.logs.viewAll')} </Button>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
            <Table aria-label="simple table">
              <TableHead sx={{ backgroundColor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('admin.logs.id')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('admin.logs.event')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('admin.logs.actor')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('admin.logs.time')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('admin.logs.status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentLogs.map((log) => (
                  <TableRow key={log.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                      {log.id}
                    </TableCell>
                    <TableCell>{log.event}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.time}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        size="small"
                        color={log.status === 'success' ? 'success' : log.status === 'warning' ? 'error' : 'info'}
                        sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

// Fake Avatar fallback just in case MUI Avatar isn't explicitly imported
import { Avatar } from '@mui/material';

export default AdminDashboard;
