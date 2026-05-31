'use client';

import * as React from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Inbox, MessageSquare, Share2, ClipboardCheck, Settings, type LucideIcon } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification-store';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Notification } from '@/lib/types';

/* ── Tab config ── */

type NotificationTab = 'all' | 'unread' | 'mentions' | 'system';

interface TabConfig {
  id: NotificationTab;
  label: string;
  icon: LucideIcon;
}

const TABS: TabConfig[] = [
  { id: 'all', label: 'All', icon: Inbox },
  { id: 'unread', label: 'Unread', icon: Bell },
  { id: 'mentions', label: 'Mentions', icon: MessageSquare },
  { id: 'system', label: 'System', icon: Settings },
];

/* ── Helpers ── */

function filterByTab(notifications: Notification[], tab: NotificationTab): Notification[] {
  switch (tab) {
    case 'unread':
      return notifications.filter((n) => !n.read);
    case 'mentions':
      return notifications.filter((n) => n.type === 'comment' || n.type === 'share');
    case 'system':
      return notifications.filter((n) => n.type === 'system' || n.type === 'exam');
    default:
      return notifications;
  }
}

function getAvatarColor(name?: string): string {
  if (!name) return 'bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]';
  const colors = [
    'bg-[#FF3333]/15 text-[#FF3333]',
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

/* ── Single notification row ── */

function NotificationRow({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (!notification.read) onRead(notification.id);
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  }, [notification, onRead, router]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150',
        'hover:bg-[var(--color-bg-overlay)]',
        !notification.read && 'bg-[var(--brand-muted)]',
      )}
    >
      {/* Avatar circle */}
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
          notification.avatar && notification.avatar.length <= 2
            ? getAvatarColor(notification.actorName)
            : 'bg-[var(--color-bg-elevated)] text-base',
        )}
      >
        {notification.avatar ?? '?'}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[13px] leading-snug',
            !notification.read
              ? 'font-medium text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-secondary)]',
          )}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)] line-clamp-2">
            {notification.body}
          </p>
        )}
        <NotificationMeta type={notification.type} createdAt={notification.created_at} />
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#FF3333]" />
      )}
    </button>
  );
}

function NotificationMeta({ type, createdAt }: { type: Notification['type']; createdAt: string }) {
  return (
    <div className="mt-1 flex items-center gap-1.5">
      {type === 'comment' && <MessageSquare size={11} strokeWidth={1.5} className="text-[var(--color-text-tertiary)]" />}
      {type === 'share' && <Share2 size={11} strokeWidth={1.5} className="text-[var(--color-text-tertiary)]" />}
      {type === 'exam' && <ClipboardCheck size={11} strokeWidth={1.5} className="text-[var(--color-text-tertiary)]" />}
      {type === 'system' && <Settings size={11} strokeWidth={1.5} className="text-[var(--color-text-tertiary)]" />}
      <span className="text-[11px] text-[var(--color-text-tertiary)]">
        {formatRelativeTime(createdAt)}
      </span>
    </div>
  );
}

/* ── Empty state ── */

function EmptyTabState({ tab }: { tab: NotificationTab }) {
  const messages: Record<NotificationTab, { title: string; description: string }> = {
    all: { title: 'No notifications', description: 'You\'re all caught up!' },
    unread: { title: 'No unread notifications', description: 'Everything has been read.' },
    mentions: { title: 'No mentions', description: 'No one has mentioned you yet.' },
    system: { title: 'No system alerts', description: 'Everything is running smoothly.' },
  };

  const { title, description } = messages[tab];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[var(--color-bg-elevated)]">
        <Bell size={20} strokeWidth={1.5} className="text-[var(--color-text-tertiary)]" />
      </div>
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</p>
      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{description}</p>
    </div>
  );
}

/* ── Main panel ── */

interface NotificationPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function NotificationPanel({ isOpen, onToggle }: NotificationPanelProps) {
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  const [activeTab, setActiveTab] = useNotificationTab();
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered = filterByTab(notifications, activeTab);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onToggle();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onToggle]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onToggle();
      }
    }
    // Delay to avoid closing immediately
    const id = requestAnimationFrame(() => {
      document.addEventListener('mousedown', handleClick);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, onToggle]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[var(--z-notification)] bg-black/20 md:hidden"
            onClick={onToggle}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
            className={cn(
              'fixed top-12 right-0 z-[var(--z-notification)] flex h-[calc(100dvh-48px)] w-[360px] max-w-[100vw]',
              'flex-col border-l border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-xl)]',
              'md:absolute md:right-0 md:top-full md:h-auto md:max-h-[560px] md:rounded-b-xl md:shadow-[var(--shadow-lg)]',
            )}
            role="dialog"
            aria-label="Notifications panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell size={16} strokeWidth={1.5} className="text-[var(--color-accent)]" />
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-[#FF3333] text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--color-accent)] transition-colors duration-150 hover:bg-[var(--brand-muted)]"
                    aria-label="Mark all notifications as read"
                  >
                    <CheckCheck size={13} strokeWidth={1.5} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onToggle}
                  className="flex size-7 items-center justify-center rounded-md text-[var(--color-text-tertiary)] transition-colors duration-150 hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)]"
                  aria-label="Close notifications"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--color-border)] px-2 pt-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'relative flex items-center gap-1.5 rounded-t-md px-3 py-2.5 text-xs font-medium transition-colors duration-150',
                      isActive
                        ? 'text-[var(--color-accent)]'
                        : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
                    )}
                  >
                    <Icon size={13} strokeWidth={1.5} />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="notif-tab-indicator"
                        className="absolute inset-x-0 -bottom-px h-0.5 bg-[#FF3333]"
                        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <EmptyTabState tab={activeTab} />
              ) : (
                <ul className="divide-y divide-[var(--color-border)] p-2">
                  {filtered.map((notif) => (
                    <li key={notif.id}>
                      <NotificationRow notification={notif} onRead={markRead} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Small hook for tab state ── */

function useNotificationTab() {
  const [tab, setTab] = React.useState<NotificationTab>('all');
  return [tab, setTab] as const;
}
