import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Button,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const AgentDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const stats = [
    { title: t('agent.stats.activeTours'), value: '18', icon: <WorkIcon color="primary" />, color: 'primary.main' },
    { title: t('agent.stats.earnedCommission'), value: '$3,850', icon: <AttachMoneyIcon color="success" />, color: 'success.main' },
    { title: t('agent.stats.clientSatisfaction'), value: '4.9 / 5', icon: <StarIcon color="warning" />, color: 'warning.main' },
  ];

  const clients = [
    { name: 'Ahmet Yılmaz', destination: 'Paris, Fransa', status: t('agent.clients.statusProposal'), avatar: 'A' },
    { name: 'Merve Demir', destination: 'Tokyo, Japonya', status: t('agent.clients.statusPaid'), avatar: 'M' },
    { name: 'Caner Kaya', destination: 'Roma, İtalya', status: t('agent.clients.statusFlightPending'), avatar: 'C' },
  ];

  return (
    <Box sx={{ py: 2 }}>
      <Helmet>
        <title>{t('agent.title') || 'Agent Dashboard'} | Oguz Travel</title>
      </Helmet>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {t('agent.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('agent.subtitle', { name: user?.name })}
        </Typography>
      </Box>

      {/* Agent Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card sx={{ borderRadius: '12px', boxShadow: '0px 4px 20px rgba(0,0,0,0.03)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3 }}>
                <Avatar sx={{ bgcolor: 'action.hover', width: 50, height: 50 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: stat.color }}>
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Left Side: Recent Clients */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: '12px', height: '100%', boxShadow: '0px 4px 20px rgba(0,0,0,0.03)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {t('agent.clients.title')}
                </Typography>
                <Button size="small" variant="text" startIcon={<AddIcon />}>
                  {t('agent.clients.addClient')}
                </Button>
              </Box>

              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {clients.map((client, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      alignItems="flex-start"
                      secondaryAction={
                        <Chip
                          label={client.status}
                          size="small"
                          color={
                            client.status === t('agent.clients.statusPaid')
                              ? 'success'
                              : client.status === t('agent.clients.statusFlightPending')
                              ? 'primary'
                              : 'default'
                          }
                          sx={{ fontWeight: 600 }}
                        />
                      }
                      sx={{ px: 0, py: 1.5 }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 600 }}>
                          {client.avatar}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={client.name}
                        secondary={
                          <Typography component="span" variant="body2" color="text.secondary">
                            {t('agent.clients.destination', { destination: client.destination })}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Quick Proposal Form */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: '12px', boxShadow: '0px 4px 20px rgba(0,0,0,0.03)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {t('agent.proposal.title')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label={t('agent.proposal.clientName')} variant="outlined" size="small" fullWidth />
                <TextField label={t('agent.proposal.destination')} variant="outlined" size="small" fullWidth />
                <TextField
                  label={t('agent.proposal.details')}
                  variant="outlined"
                  multiline
                  rows={3}
                  size="small"
                  fullWidth
                />
                <Button variant="contained" color="primary" fullWidth sx={{ py: 1, fontWeight: 600 }}>
                  {t('agent.proposal.submit')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgentDashboard;
