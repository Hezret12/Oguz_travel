import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Popover,
  Tooltip,
  Button,
  Chip,
  Avatar,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';
import { CheckSquare, MessageSquareText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PATHS } from '../routes/paths';
import { useLocale } from '../hooks/useLocale';
import { useDateFormat } from '../functions/generalHelpers';
import { useInfiniteGet } from '../hooks/CRUD/useInfiniteGet';
import { useUpdate } from '../hooks/CRUD/useUpdate';
import { useDelete } from '../hooks/CRUD/useDelete';
import { getAllNotificationsApi } from '../api/queries/getters';
import { markNotificationReadApi } from '../api/queries/patch';
import { deleteNotificationApi } from '../api/queries/delete';

const getTypeIcon = (isMessage) =>
  isMessage ? <MessageSquareText size={20} /> : <CheckSquare size={20} />;

const NotificationPopover = () => {
  const { t } = useLocale();
  const theme = useTheme();
  const navigate = useNavigate();
  const { formatChange } = useDateFormat();

  const [anchorEl, setAnchorEl] = useState(null);
  const isDark = theme.palette.mode === 'dark';

  const {
    data: notificationsList,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteGet({
    apiFn: getAllNotificationsApi,
    key: 'headerNotifications',
    params: { limit: 40, isRead: false },
  });

  // CRUD Mutation hooks for updating & deleting notifications
  const markReadMutation = useUpdate({
    apiFn: markNotificationReadApi,
    key: 'headerNotifications',
    idKey: 'guid',
  });

  const deleteMutation = useDelete({
    deleteFn: deleteNotificationApi,
    queryKey: 'headerNotifications',
    idKey: 'guid',
  });

  const handleOpen = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
      refetch();
    },
    [refetch]
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleViewAll = useCallback(() => {
    setAnchorEl(null);
    navigate(PATHS.NOTIFICATIONS);
  }, [navigate]);

  // Infinite scroll event handler for Popover container
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop - clientHeight < 30 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const unreadNotifications = useMemo(() => {
    if (!Array.isArray(notificationsList)) return [];
    return notificationsList.filter((n) => {
      const isReadVal = n.isRead ?? n.empltaskAssignee?.[0]?.isRead ?? false;
      return !isReadVal;
    });
  }, [notificationsList]);

  const unreadCount = unreadNotifications.length;

  const handleToggleRead = useCallback(
    async (id) => {
      try {
        await markReadMutation.mutateAsync({ guid: id, isRead: true });
        refetch();
      } catch (err) {
        console.warn('API mark notification read error:', err);
      }
    },
    [markReadMutation, refetch]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (err) {
        console.warn('API delete notification error:', err);
      }
    },
    [deleteMutation, refetch]
  );

  const isOpen = Boolean(anchorEl);

  return (
    <>
      {/* Notification Bell Button */}
      <Tooltip title={t('notifications.title')}>
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
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {t('notifications.title')}
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} ${t('notifications.new')}`}
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
        </Box>

        {/* Notification List Container with Infinite Scroll */}
        <Box
          onScroll={handleScroll}
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
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
              <CircularProgress size={28} sx={{ color: isDark ? '#14B8A6' : '#0E8584' }} />
            </Box>
          ) : unreadNotifications.length === 0 ? (
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
                {t('notifications.noUnread')}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {t('notifications.emptyDesc')}
              </Typography>
            </Box>
          ) : (
            /* List Items */
            <Stack spacing={0.8}>
              {unreadNotifications.map((item) => {
                const id = item.guid;
                const title =
                  item.title ||
                  (item.isMessage
                    ? t('notifications.message', 'Hat')
                    : t('notifications.task', 'Bildiriş'));
                const description = item.description || '';
                const isRead = item.isRead ?? item.empltaskAssignee?.[0]?.isRead ?? false;

                const sender =
                  item.admuser?.employee?.fullName ||
                  item.admuser?.phone_number ||
                  'Admin';

                const senderRole = item.admuser?.role || '';
                const date = item.createdAt || item.due_date;
                const avatarBg =
                  item.priority === 'urgent'
                    ? '#DC2626'
                    : item.isMessage
                      ? '#10B981'
                      : '#0E8584';

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
                          backgroundColor: alpha(avatarBg, 0.12),
                          color: avatarBg,
                          borderRadius: '10px',
                          flexShrink: 0,
                          mt: 0.2,
                        }}
                      >
                        {getTypeIcon(item.isMessage)}
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
                              ? t('notifications.markAsUnread')
                              : t('notifications.markAsRead')
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

                        <Tooltip title={t('notifications.delete')}>
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

              {isFetchingNextPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
                  <CircularProgress size={20} sx={{ color: isDark ? '#14B8A6' : '#0E8584' }} />
                </Box>
              )}
            </Stack>
          )}
        </Box>

        {/* Footer Bar */}
        <Box
          sx={{
            p: 1.2,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            borderTop: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
          }}
        >
          <Button
            fullWidth
            size="small"
            onClick={handleViewAll}
            endIcon={<ArrowForwardIcon sx={{ fontSize: '16px !important' }} />}
            sx={{
              fontSize: '0.80rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              color: isDark ? '#14B8A6' : '#0E8584',
              py: 0.5,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            {t('notifications.viewAll')}
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationPopover;
