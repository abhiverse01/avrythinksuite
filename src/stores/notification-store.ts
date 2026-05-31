import { create } from 'zustand';
import type { Notification } from '@/lib/types';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   NOTIFICATION STORE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  setNotifications: (notifications: Notification[]) => void;
}

const seedNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'usr-1',
    title: 'Welcome to AvrythinkSuite',
    body: 'Start by creating your first document or explore the suite.',
    type: 'system',
    read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    avatar: '🚀',
    actorName: 'AvrythinkSuite',
    category: 'system',
  },
  {
    id: 'notif-2',
    user_id: 'usr-1',
    title: 'Sarah Chen shared "Q3 Product Roadmap" with you',
    body: 'A document has been shared with your organization.',
    type: 'share',
    read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    action_url: '/docs/file-roadmap',
    avatar: 'SC',
    actorName: 'Sarah Chen',
    category: 'share',
  },
  {
    id: 'notif-3',
    user_id: 'usr-1',
    title: 'Marcus Johnson commented on "Marketing Budget 2025"',
    body: '"Can we review the Q4 allocation numbers?"',
    type: 'comment',
    read: false,
    created_at: new Date(Date.now() - 10800000).toISOString(),
    action_url: '/sheets/file-budget',
    avatar: 'MJ',
    actorName: 'Marcus Johnson',
    category: 'comment',
  },
  {
    id: 'notif-4',
    user_id: 'usr-1',
    title: '12 responses to your exam "Frontend Developer Assessment"',
    body: 'New submissions are ready for review.',
    type: 'exam',
    read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    action_url: '/examiner/exam-assessment',
    avatar: '📝',
    actorName: 'Examiner',
    category: 'exam',
  },
  {
    id: 'notif-5',
    user_id: 'usr-1',
    title: 'Aiko Tanaka commented on "Design System Guidelines"',
    body: '"Updated the color token section — please take a look."',
    type: 'comment',
    read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    action_url: '/docs/file-guidelines',
    avatar: 'AT',
    actorName: 'Aiko Tanaka',
    category: 'comment',
  },
  {
    id: 'notif-6',
    user_id: 'usr-1',
    title: 'Lena Morales shared "Brand Identity Presentation" with you',
    body: 'A presentation has been shared with you.',
    type: 'share',
    read: true,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    action_url: '/slides/file-brand',
    avatar: 'LM',
    actorName: 'Lena Morales',
    category: 'share',
  },
  {
    id: 'notif-7',
    user_id: 'usr-1',
    title: 'Storage is 80% full',
    body: 'You are using 4.0 GB of 5.0 GB. Consider upgrading your plan or removing unused files.',
    type: 'system',
    read: false,
    created_at: new Date(Date.now() - 43200000).toISOString(),
    avatar: '⚠️',
    actorName: 'System',
    category: 'system',
  },
  {
    id: 'notif-8',
    user_id: 'usr-1',
    title: '5 responses to your exam "User Research Survey"',
    body: 'New submissions received.',
    type: 'exam',
    read: true,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    action_url: '/examiner/exam-survey',
    avatar: '📝',
    actorName: 'Examiner',
    category: 'exam',
  },
  {
    id: 'notif-9',
    user_id: 'usr-1',
    title: 'Sarah Chen commented on "Team Standup Deck"',
    body: '"I added the Q3 OKRs slide — check it out!"',
    type: 'comment',
    read: true,
    created_at: new Date(Date.now() - 432000000).toISOString(),
    action_url: '/slides/file-standup',
    avatar: 'SC',
    actorName: 'Sarah Chen',
    category: 'comment',
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: seedNotifications,
  unreadCount: seedNotifications.filter((n) => !n.read).length,

  addNotification: (partial) => {
    const notification: Notification = {
      ...partial,
      id: `notif-${Date.now()}`,
      created_at: new Date().toISOString(),
      read: false,
    };
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markRead: (id) =>
    set((state) => {
      const wasUnread = state.notifications.find((n) => n.id === id && !n.read);
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
        unreadCount: wasUnread
          ? state.unreadCount - 1
          : state.unreadCount,
      };
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  dismiss: (id) =>
    set((state) => {
      const notif = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notif && !notif.read
          ? state.unreadCount - 1
          : state.unreadCount,
      };
    }),

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
}));
