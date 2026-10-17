import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAllNotificationsApi } from '../api/queries/getters';
import { markNotificationReadApi } from '../api/queries/patch';
import { showNotificationToast } from '../components/NotificationToast';
import { PATHS } from '../routes/paths';
import { useLocale } from './useLocale';
import { resetTaskBoard } from '../pages/TaskFlow/functions/taskBoardCache';

const WATCHER_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
const LAST_CHECK_KEY = 'oguz_last_notification_check_time';
const SEEN_IDS_KEY = 'oguz_seen_notification_ids';

const getStoredLastCheckTime = () => {
  try {
    const val = sessionStorage.getItem(LAST_CHECK_KEY);
    return val ? Number(val) : null;
  } catch {
    return null;
  }
};

const saveStoredLastCheckTime = (timestamp) => {
  try {
    sessionStorage.setItem(LAST_CHECK_KEY, String(timestamp));
  } catch {
    // Ignore storage quota errors
  }
};

const getStoredSeenIds = () => {
  try {
    const raw = sessionStorage.getItem(SEEN_IDS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const saveStoredSeenIds = (set) => {
  try {
    sessionStorage.setItem(SEEN_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Ignore storage quota errors
  }
};

export const useNotificationWatcher = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useLocale();

  const isInitialMountRef = useRef(true);
  const lastCheckTimeRef = useRef(getStoredLastCheckTime());
  const seenGuidsRef = useRef(getStoredSeenIds());

  const { data: rawResponse, refetch } = useQuery({
    queryKey: ['notificationsWatcher'],
    queryFn: () => getAllNotificationsApi({ limit: 30 }),
    refetchInterval: WATCHER_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: 60 * 1000,
  });

  // Re-check on window/tab focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  const handleNavigateToNotifications = useCallback(() => {
    navigate(PATHS.NOTIFICATIONS);
  }, [navigate]);

  const handleQuickMarkRead = useCallback(
    async (guid) => {
      try {
        await markNotificationReadApi({ task_guids: [guid], isRead: true });
        queryClient.invalidateQueries({ queryKey: ['headerNotifications'] });
        queryClient.invalidateQueries({ queryKey: ['notificationsPage'] });
        queryClient.invalidateQueries({ queryKey: ['notificationsWatcher'] });
      } catch (err) {
        console.warn('Mark read error:', err);
      }
    },
    [queryClient]
  );

  useEffect(() => {
    let list = rawResponse?.data;
    if (Array.isArray(list?.data?.data)) {
      list = list.data.data;
    } else if (Array.isArray(list?.data)) {
      list = list.data;
    } else if (Array.isArray(list?.items)) {
      list = list.items;
    } else if (!Array.isArray(list)) {
      list = [];
    }

    if (!Array.isArray(list) || list.length === 0) return;

    const allCurrentGuids = list.map((item) => item.guid).filter(Boolean);

    // Initial Load handling:
    // If opening app for the first time in this session, save the baseline timestamp and IDs
    // without triggering notification toasts for historical unread items.
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;

      if (!lastCheckTimeRef.current) {
        const latestCreatedAt = list.reduce((max, item) => {
          const itemTime = new Date(item.createdAt || item.updatedAt || 0).getTime();
          return itemTime > max ? itemTime : max;
        }, Date.now());

        lastCheckTimeRef.current = latestCreatedAt;
        saveStoredLastCheckTime(latestCreatedAt);
      }

      allCurrentGuids.forEach((id) => seenGuidsRef.current.add(id));
      saveStoredSeenIds(seenGuidsRef.current);
      return;
    }

    const baselineTime = lastCheckTimeRef.current || Date.now();

    // Check for newly created notifications since baselineTime
    const newUnreadItems = list.filter((item) => {
      const isUnread = !(item.isRead ?? item.empltaskAssignee?.[0]?.isRead ?? false);
      if (!isUnread || !item.guid) return false;

      const itemCreatedTime = new Date(item.createdAt || item.updatedAt || 0).getTime();
      const isNewerThanBaseline = itemCreatedTime > baselineTime;
      const isNotYetSeen = !seenGuidsRef.current.has(item.guid);

      return isNewerThanBaseline || isNotYetSeen;
    });

    if (newUnreadItems.length > 0) {
      // Invalidate queries so Header bell count and NotificationPage update immediately
      queryClient.invalidateQueries({ queryKey: ['headerNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsPage'] });

      // Check if any of the new unread notifications is related to a task
      // In backend, tasks are explicitly created with `isMessage: false`, and have status/priority
      const hasTaskNotification = newUnreadItems.some(
        (item) => item.isMessage === false || (item.status !== undefined && item.status !== null)
      );

      if (hasTaskNotification) {
        resetTaskBoard(queryClient);
      }

      // Update baseline check time to the latest item timestamp or now
      const latestTimestamp = newUnreadItems.reduce((max, item) => {
        const itemTime = new Date(item.createdAt || item.updatedAt || 0).getTime();
        return itemTime > max ? itemTime : max;
      }, Date.now());

      lastCheckTimeRef.current = latestTimestamp;
      saveStoredLastCheckTime(latestTimestamp);

      // Trigger bottom-right popup toast for the latest unread item
      const newest = newUnreadItems[0];
      const isNewestTask =
        newest.isMessage === false || (newest.status !== undefined && newest.status !== null);
      const title =
        newest.title || (isNewestTask ? t('notifications.task') : t('notifications.title'));
      const description = newest.description || '';
      const sender =
        newest.admuser?.employee?.fullName ||
        newest.admuser?.phone_number ||
        '';

      const handleToastView = () => {
        if (isNewestTask) {
          navigate(PATHS.TASKS);
        } else {
          handleNavigateToNotifications();
        }
      };

      showNotificationToast({
        title,
        description,
        sender,
        onView: handleToastView,
        onMarkRead: () => handleQuickMarkRead(newest.guid),
      });

      // Mark IDs as seen
      newUnreadItems.forEach((item) => seenGuidsRef.current.add(item.guid));
      saveStoredSeenIds(seenGuidsRef.current);
    }
  }, [rawResponse, queryClient, handleNavigateToNotifications, handleQuickMarkRead, navigate, t]);
};
