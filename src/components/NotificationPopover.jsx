import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Popover,
  Divider,
  Tooltip,
  Button,
  Chip,
  Avatar,
  Stack,
  Tabs,
  Tab,
  useTheme,
  alpha,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';
import { useLocale } from '../hooks/useLocale';
import { useDateFormat } from '../functions/generalHelpers';
import { useSelector, useDispatch } from 'react-redux';
import {
  toggleNotificationRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../store/slices/notificationSlice';

// Initial Mock Notifications Data
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Täze Bilet Sargydy',
    description: 'Stambul - Aşgabat ugry boýunça täze bilet sargydy girizildi. Müşdere tassyklama ugradyldy.',
    sender: 'Merjen Atayeva',
    senderRole: 'Agent',
    avatarBg: '#0E8584',
    date: '2026-07-31T12:15:00',
    isRead: false,
    type: 'ticket',
  },
  {
    id: 'notif-2',
    title: 'Töleg Tassyklandy',
    description: 'Müşderi B2B bilet sargydy üçin 2,450 TMT möçberinde töleg geçirdi.',
    sender: 'Maliýe Bölümi',
    senderRole: 'Finance',
    avatarBg: '#10B981',
    date: '2026-07-31T11:30:00',
    isRead: false,
    type: 'payment',
  },
  {
    id: 'notif-3',
    title: 'Täze Tabşyryk Bellenildi',
    description: 'Viza resminamalaryny barlaň we konsullyk barlagy üçin taýýarlaň.',
    sender: 'Dawut Kakabaýew',
    senderRole: 'Manager',
    avatarBg: '#6366F1',
    date: '2026-07-31T09:45:00',
    isRead: false,
    type: 'task',
  },
  {
    id: 'notif-4',
    title: 'Terjime Taýýar Boldy',
    description: 'Pasport we şahsyýetnamanyň iňlis diline terjimesi üstünlikli tamamlandy.',
    sender: 'Gülşat Rejepowa',
    senderRole: 'Translator',
    avatarBg: '#F59E0B',
    date: '2026-07-30T16:20:00',
    isRead: true,
    type: 'translation',
  },
  {
    id: 'notif-5',
    title: 'Ulgam Täzelenmesi',
    description: 'Oguz Travel ulgamynda täze serwer durnuklylygy we awtomatiki bilet gözlegi girizildi.',
    sender: 'Oguz Admin',
    senderRole: 'System',
    avatarBg: '#EC4899',
    date: '2026-07-29T14:10:00',
    isRead: true,
    type: 'system',
  },
];

const getTypeIcon = (type) => {
  switch (type) {
    case 'comment':
      return <ChatBubbleOutlinedIcon sx={{ fontSize: 20 }} />;
    case 'task':
    default:
      return <AssignmentIcon sx={{ fontSize: 20 }} />;
  }
};

const NotificationPopover = () => {
  const { t } = useLocale();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { formatChange } = useDateFormat();

  const [anchorEl, setAnchorEl] = useState(null);
  const notifications = useSelector((state) => state.notifications.notifications);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'unread'

  const isDark = theme.palette.mode === 'dark';

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (filterTab === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filterTab]);

  const handleToggleRead = (id) => {
    dispatch(toggleNotificationRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  const isOpen = Boolean(anchorEl);

  return (
    <>
      {/* Notification Bell Button */}
      <Tooltip title={t('notifications.title') || 'Bildirişler'}>
        <IconButton
          onClick={handleOpen}
          sx={{
            height: 38,
            width: 38,
            borderRadius: '10px',
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
            color: isDark ? 'rgba(255,255,255,0.85)' : '#334155',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)',
              borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.68rem',
                fontWeight: 700,
                height: 18,
                minWidth: 18,
                px: 0.5,
                borderRadius: '10px',
                boxShadow: `0 0 0 2px ${isDark ? '#1e293b' : '#ffffff'}`,
                backgroundColor: '#EF4444',
              },
            }}
          >
            {unreadCount > 0 ? (
              <NotificationsActiveIcon
                sx={{
                  fontSize: 20,
                  color: isDark ? '#14B8A6' : '#0E8584',
                  animation: 'bellSwing 2s ease infinite',
                  '@keyframes bellSwing': {
                    '0%, 100%': { transform: 'rotate(0deg)' },
                    '10%': { transform: 'rotate(12deg)' },
                    '20%': { transform: 'rotate(-10deg)' },
                    '30%': { transform: 'rotate(8deg)' },
                    '40%': { transform: 'rotate(-5deg)' },
                    '50%': { transform: 'rotate(0deg)' },
                  },
                }}
              />
            ) : (
              <NotificationsIcon sx={{ fontSize: 20 }} />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Notification Popover Menu */}
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              width: { xs: 330, sm: 400 },
              maxHeight: 520,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: isDark
                ? '0px 20px 50px rgba(0, 0, 0, 0.6), 0px 0px 0px 1px rgba(255, 255, 255, 0.1)'
                : '0px 20px 40px rgba(0, 0, 0, 0.12), 0px 0px 0px 1px rgba(0, 0, 0, 0.05)',
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              backgroundImage: 'none',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {/* Header Bar */}
        <Box
          sx={{
            p: 2,
            pb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {t('notifications.title') || 'Bildirişler'}
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} ${t('notifications.new') || 'täze'}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  color: isDark ? '#14B8A6' : '#0E8584',
                  borderRadius: '6px',
                }}
              />
            )}
          </Box>

          {unreadCount > 0 && (
            <Tooltip title={t('notifications.markAllAsRead') || 'Ählisini okaldy etmek'}>
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: isDark ? '#14B8A6' : '#0E8584',
                  px: 1,
                  py: 0.2,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                {t('notifications.readAll') || 'Ählisini oka'}
              </Button>
            </Tooltip>
          )}
        </Box>

        {/* Filter Tabs */}
        <Box
          sx={{
            px: 2,
            pt: 0.5,
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }}
        >
          <Tabs
            value={filterTab}
            onChange={(e, val) => setFilterTab(val)}
            sx={{
              minHeight: 36,
              '& .MuiTabs-indicator': {
                backgroundColor: isDark ? '#14B8A6' : '#0E8584',
                height: 2.5,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab
              disableRipple
              value="all"
              label={`${t('notifications.all') || 'Ählisi'} (${notifications.length})`}
              sx={{
                minHeight: 36,
                py: 0.5,
                px: 1,
                fontSize: '0.80rem',
                fontWeight: filterTab === 'all' ? 700 : 500,
                textTransform: 'none',
                color: filterTab === 'all'
                  ? (isDark ? '#14B8A6' : '#0E8584')
                  : 'text.secondary',
              }}
            />
            <Tab
              disableRipple
              value="unread"
              label={`${t('notifications.unread') || 'Okalmadyklar'} (${unreadCount})`}
              sx={{
                minHeight: 36,
                py: 0.5,
                px: 1,
                fontSize: '0.80rem',
                fontWeight: filterTab === 'unread' ? 700 : 500,
                textTransform: 'none',
                color: filterTab === 'unread'
                  ? (isDark ? '#14B8A6' : '#0E8584')
                  : 'text.secondary',
              }}
            />
          </Tabs>
        </Box>

        {/* Notification List Container */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            maxHeight: 360,
            p: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
              borderRadius: '4px',
            },
          }}
        >
          {filteredNotifications.length === 0 ? (
            /* Empty State */
            <Box
              sx={{
                py: 5,
                px: 2,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  mb: 1.5,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  color: 'text.disabled',
                }}
              >
                <NotificationsOffOutlinedIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                {filterTab === 'unread'
                  ? (t('notifications.noUnread') || 'Täze okalmadyk bildiriş ýok')
                  : (t('notifications.empty') || 'Bildiriş tapylmady')}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {t('notifications.emptyDesc') || 'Täze bildirişler geleninde bärik çykar.'}
              </Typography>
            </Box>
          ) : (
            /* List Items */
            <Stack spacing={0.8}>
              {filteredNotifications.map((item) => {
                const { id, title, description, sender, senderRole, avatarBg, date, isRead, type } = item;

                return (
                  <Box
                    key={id}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      backgroundColor: isRead
                        ? 'transparent'
                        : isDark
                        ? 'rgba(20, 184, 166, 0.08)'
                        : 'rgba(14, 133, 132, 0.04)',
                      border: '1px solid',
                      borderColor: isRead
                        ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)')
                        : (isDark ? 'rgba(20, 184, 166, 0.2)' : 'rgba(14, 133, 132, 0.15)'),
                      '&:hover': {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        '& .action-buttons': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      {/* Category Icon Avatar */}
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          backgroundColor: alpha(avatarBg || '#0E8584', 0.12),
                          color: avatarBg || '#0E8584',
                          borderRadius: '10px',
                          flexShrink: 0,
                          mt: 0.2,
                        }}
                      >
                        {getTypeIcon(type)}
                      </Avatar>

                      {/* Notification Content Body */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: isRead ? 600 : 700,
                              fontSize: '0.85rem',
                              color: isDark ? '#F1F5F9' : '#1E293B',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.8,
                            }}
                          >
                            {!isRead && (
                              <Box
                                component="span"
                                sx={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: '50%',
                                  backgroundColor: isDark ? '#14B8A6' : '#0E8584',
                                  display: 'inline-block',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            {title}
                          </Typography>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.78rem',
                            color: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
                            lineHeight: 1.4,
                            mb: 1,
                          }}
                        >
                          {description}
                        </Typography>

                        {/* Metadata Footer: Sender & Date */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          {/* Sender Info */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: isDark ? '#CBD5E1' : '#334155',
                              }}
                            >
                              {sender}
                            </Typography>
                            {senderRole && (
                              <Chip
                                label={senderRole}
                                size="small"
                                sx={{
                                  height: 16,
                                  fontSize: '0.62rem',
                                  fontWeight: 600,
                                  px: 0.3,
                                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                                  color: 'text.secondary',
                                  borderRadius: '4px',
                                }}
                              />
                            )}
                          </Box>

                          {/* Date Info */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <AccessTimeIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.70rem',
                                color: 'text.disabled',
                                fontWeight: 500,
                              }}
                            >
                              {formatChange(date)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Action Buttons: Mark as Read & Delete */}
                      <Stack
                        direction="column"
                        spacing={0.5}
                        className="action-buttons"
                        sx={{
                          flexShrink: 0,
                          opacity: isRead ? 0.6 : 1,
                          transition: 'opacity 0.2s ease',
                        }}
                      >
                        <Tooltip
                          title={
                            isRead
                              ? t('notifications.markAsUnread') || 'Okalmadyk diýip bellemek'
                              : t('notifications.markAsRead') || 'Okaldy diýip bellemek'
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleToggleRead(id)}
                            sx={{
                              width: 28,
                              height: 28,
                              color: isRead
                                ? 'text.disabled'
                                : isDark
                                ? '#14B8A6'
                                : '#0E8584',
                              backgroundColor: !isRead
                                ? alpha(theme.palette.primary.main, 0.1)
                                : 'transparent',
                              '&:hover': {
                                backgroundColor: isDark
                                  ? 'rgba(255,255,255,0.1)'
                                  : 'rgba(0,0,0,0.06)',
                              },
                            }}
                          >
                            {isRead ? (
                              <CheckCircleIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={t('notifications.delete') || 'Pozmak'}>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(id)}
                            sx={{
                              width: 28,
                              height: 28,
                              color: 'text.disabled',
                              '&:hover': {
                                color: 'error.main',
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* Footer Bar */}
        {notifications.length > 0 && (
          <Box
            sx={{
              p: 1.2,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              borderTop: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(248, 250, 252, 0.6)',
            }}
          >
            <Typography variant="caption" color="text.disabled">
              {notifications.length} {t('notifications.totalCount') || 'bildiriş bar'}
            </Typography>

            <Button
              size="small"
              onClick={handleClearAll}
              color="error"
              sx={{
                fontSize: '0.72rem',
                fontWeight: 600,
                textTransform: 'none',
                py: 0.2,
                px: 1,
                borderRadius: '6px',
              }}
            >
              {t('notifications.clearAll') || 'Ählisini arassala'}
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationPopover;
