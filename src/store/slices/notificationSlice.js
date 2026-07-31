import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

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

const INITIAL_COMMENTS = [
  {
    id: 'comment-1',
    employee_guid: 'emp-101',
    position_guid: 'pos-agent-1',
    position_name: 'Agent',
    employee_name: 'Merjen Atayeva',
    author: 'Dawut Kakabaýew',
    authorRole: 'Manager',
    text: 'Stambul reysleri boýunça müşderileriň hatlaryna çalt jogap bermeli.',
    createdAt: '2026-07-31T11:00:00',
  },
  {
    id: 'comment-2',
    employee_guid: 'emp-102',
    position_guid: 'pos-translator-1',
    position_name: 'Translator',
    employee_name: 'Gülşat Rejepowa',
    author: 'Oguz Admin',
    authorRole: 'Admin',
    text: 'Resminamalaryň iňlis dili terjimelerinde möhür belgisini barlaň.',
    createdAt: '2026-07-30T14:30:00',
  },
];

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: INITIAL_NOTIFICATIONS,
    comments: INITIAL_COMMENTS,
  },
  reducers: {
    addCommentAndNotification: (state, action) => {
      const { employee, author, authorRole, commentText } = action.payload;

      const positionGuid = employee?.position_guid || employee?.position?.guid || 'pos-default';
      const positionName = employee?.position?.name || employee?.position_name || 'Agent';
      const now = dayjs();

      // 1. Create Comment tied to the Position (so new replacement employees see it!)
      const newComment = {
        id: `comment-${now.valueOf()}`,
        employee_guid: employee?.guid,
        position_guid: positionGuid,
        position_name: positionName,
        employee_name: employee?.fullName || 'Işgär',
        author: author || 'Dawut Kakabaýew',
        authorRole: authorRole || 'Manager',
        text: commentText,
        createdAt: now.toISOString(),
      };

      state.comments.unshift(newComment);

      // 2. Create Notification sent to that Employee / Position
      const newNotification = {
        id: `notif-${now.valueOf()}`,
        title: `Täze Kommentariýa: ${positionName}`,
        description: `${author || 'Manager'}: "${commentText}"`,
        sender: author || 'Manager',
        senderRole: authorRole || 'Manager',
        targetEmployeeGuid: employee?.guid,
        targetPositionGuid: positionGuid,
        positionName: positionName,
        avatarBg: '#6366F1',
        date: now.toISOString(),
        isRead: false,
        type: 'task',
      };

      state.notifications.unshift(newNotification);
    },

    toggleNotificationRead: (state, action) => {
      const id = action.payload;
      const notif = state.notifications.find((n) => n.id === id);
      if (notif) {
        notif.isRead = !notif.isRead;
      }
    },

    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
    },

    deleteNotification: (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.filter((n) => n.id !== id);
    },

    clearAllNotifications: (state) => {
      state.notifications = [];
    },

    addCustomNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
  },
});

export const {
  addCommentAndNotification,
  toggleNotificationRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  addCustomNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
