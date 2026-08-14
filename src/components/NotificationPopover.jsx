import { useState, useMemo, useCallback, memo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Popover,
  Tooltip,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Bell, CheckCheck, Trash2, ArrowRight, Inbox, Check } from 'lucide-react';
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

const NotificationItem = memo(({ item, onToggleRead, onDelete, formatChange, t }) => {
  const isRead = item.isRead ?? item.empltaskAssignee?.[0]?.isRead ?? false;
  const title =
    item.title ||
    (item.isMessage ? t('notifications.message', 'Hat') : t('notifications.task', 'Bildiriş'));
  const sender =
    item.admuser?.employee?.fullName || item.admuser?.phone_number || 'Admin';
  const senderRole = item.admuser?.role || '';
  const date = item.createdAt || item.due_date;

  return (
    <Box
      sx={{
        p: '11px 14px',
        borderRadius: '10px',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        backgroundColor: isRead ? 'transparent' : (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.05)' : 'rgba(14, 133, 132, 0.03)',
        border: '1px solid',
        borderColor: isRead ? 'transparent' : 'divider',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
        '&:hover': {
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
          '& .item-actions': {
            opacity: 1,
            pointerEvents: 'auto',
          },
        },
      }}
    >
      {/* Unread Status Dot */}
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          mt: '6px',
          flexShrink: 0,
          backgroundColor: isRead ? 'transparent' : 'primary.main',
        }}
      />

      {/* Content */}
      <Box sx={{ flexGrow: 1, minWidth: 0, pr: 2 }}>
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontWeight: isRead ? 550 : 650,
            fontSize: '0.835rem',
            color: 'text.primary',
            lineHeight: 1.3,
            mb: 0.3,
          }}
        >
          {title}
        </Typography>

        {item.description && (
          <Typography
            variant="caption"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.76rem',
              color: 'text.secondary',
              lineHeight: 1.4,
              mb: 0.6,
            }}
          >
            {item.description}
          </Typography>
        )}

        {/* Minimal Footer: Sender & Time */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="caption"
            noWrap
            sx={{
              fontSize: '0.70rem',
              fontWeight: 600,
              color: 'text.secondary',
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
                fontSize: '0.60rem',
                fontWeight: 600,
                px: 0.2,
                borderRadius: '4px',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.04)',
                color: 'text.secondary',
              }}
            />
          )}

          <Typography
            variant="caption"
            sx={{
              fontSize: '0.68rem',
              color: 'text.secondary',
              opacity: 0.8,
              ml: 'auto',
            }}
          >
            {formatChange(date)}
          </Typography>
        </Box>
      </Box>

      {/* Quick Action Buttons (Hover Only) */}
      <Box
        className="item-actions"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          opacity: { xs: 1, sm: 0 },
          pointerEvents: { xs: 'auto', sm: 'none' },
          backgroundColor: 'background.paper',
          p: '2px',
          borderRadius: '6px',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'opacity 0.15s ease',
        }}
      >
        <Tooltip title={isRead ? t('notifications.markAsUnread') : t('notifications.markAsRead')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleRead(item.guid);
            }}
            sx={{
              width: 24,
              height: 24,
              color: isRead ? 'text.secondary' : 'primary.main',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Check size={14} />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('notifications.delete')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.guid);
            }}
            sx={{
              width: 24,
              height: 24,
              color: 'text.secondary',
              '&:hover': {
                color: 'error.main',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
              },
            }}
          >
            <Trash2 size={13} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
});

NotificationItem.displayName = 'NotificationItem';

const NotificationPopover = () => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { formatChange } = useDateFormat();

  const [anchorEl, setAnchorEl] = useState(null);

  const unreadParams = useMemo(() => ({ limit: 40, isRead: false }), []);

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
    params: unreadParams,
  });

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

  const handleOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
    refetch();
  }, [refetch]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleViewAll = useCallback(() => {
    setAnchorEl(null);
    navigate(PATHS.NOTIFICATIONS);
  }, [navigate]);

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
        await markReadMutation.mutateAsync({ task_guids: [id], guid: id, isRead: true });
        refetch();
      } catch (err) {
        console.warn('API mark notification read error:', err);
      }
    },
    [markReadMutation, refetch]
  );

  const handleMarkAllRead = useCallback(async () => {
    if (unreadNotifications.length === 0) return;
    try {
      const allGuids = unreadNotifications.map((n) => n.guid);
      await markReadMutation.mutateAsync({ task_guids: allGuids, isRead: true });
      refetch();
    } catch (err) {
      console.warn('API mark all read error:', err);
    }
  }, [unreadNotifications, markReadMutation, refetch]);

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteMutation.mutateAsync({ guid: id });
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
      {/* Bell Button Trigger */}
      <Tooltip title={t('notifications.title')}>
        <IconButton
          onClick={handleOpen}
          sx={{
            height: 38,
            width: 38,
            borderRadius: '10px',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            color: 'text.primary',
            '&:hover': {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              borderColor: 'primary.main',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <Badge
            badgeContent={unreadCount}
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.65rem',
                fontWeight: 700,
                height: 18,
                minWidth: 18,
                px: 0.5,
                borderRadius: '10px',
                backgroundColor: '#EF4444',
                color: '#ffffff',
              },
            }}
          >
            <Bell size={19} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Popover Window */}
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
              width: { xs: 320, sm: 380 },
              maxHeight: 500,
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0px 20px 40px rgba(0, 0, 0, 0.5), 0px 0px 0px 1px rgba(255, 255, 255, 0.06)'
                  : '0px 16px 36px rgba(15, 23, 42, 0.10)',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {/* Header Bar */}
        <Box
          sx={{
            p: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: '0.90rem',
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              {t('notifications.title')}
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} ${t('notifications.new')}`}
                size="small"
                sx={{
                  height: 19,
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(20, 184, 166, 0.15)'
                      : 'rgba(14, 133, 132, 0.10)',
                  color: 'primary.main',
                  borderRadius: '5px',
                }}
              />
            )}
          </Box>

          {unreadCount > 0 && (
            <Tooltip title={t('notifications.markAsRead')}>
              <Button
                size="small"
                onClick={handleMarkAllRead}
                startIcon={<CheckCheck size={14} />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  p: '2px 6px',
                  borderRadius: '6px',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    color: 'text.primary',
                  },
                }}
              >
                {t('notifications.markAsRead')}
              </Button>
            </Tooltip>
          )}
        </Box>

        {/* Scrollable Notification List */}
        <Box
          onScroll={handleScroll}
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            maxHeight: 340,
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.6,
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'divider',
              borderRadius: '4px',
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
              <CircularProgress size={24} sx={{ color: 'primary.main' }} />
            </Box>
          ) : unreadNotifications.length === 0 ? (
            /* Clean Minimalist Empty State */
            <Box
              sx={{
                py: 5,
                px: 2,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              <Inbox size={32} strokeWidth={1.5} style={{ marginBottom: 8, opacity: 0.6 }} />
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 650, color: 'text.primary', mb: 0.2, fontSize: '0.84rem' }}
              >
                {t('notifications.noUnread')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                {t('notifications.emptyDesc')}
              </Typography>
            </Box>
          ) : (
            unreadNotifications.map((item) => (
              <NotificationItem
                key={item.guid}
                item={item}
                onToggleRead={handleToggleRead}
                onDelete={handleDelete}
                formatChange={formatChange}
                t={t}
              />
            ))
          )}

          {isFetchingNextPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <CircularProgress size={18} sx={{ color: 'primary.main' }} />
            </Box>
          )}
        </Box>

        {/* Footer Bar */}
        <Box
          sx={{
            p: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button
            fullWidth
            size="small"
            onClick={handleViewAll}
            endIcon={<ArrowRight size={14} />}
            sx={{
              fontSize: '0.78rem',
              fontWeight: 650,
              textTransform: 'none',
              borderRadius: '6px',
              color: 'primary.main',
              py: 0.5,
              '&:hover': {
                backgroundColor: 'action.hover',
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
