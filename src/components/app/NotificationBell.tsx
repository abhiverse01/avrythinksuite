'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotificationStore } from '@/stores/notification-store';
import { formatRelativeTime, cn } from '@/lib/utils';

const typeColorMap: Record<string, string> = {
  info: 'bg-[var(--color-accent)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  error: 'bg-[var(--color-danger)]',
};

/**
 * Notification bell icon with unread count badge.
 * Opens a Popover listing notifications with mark-all-read support.
 */
export function NotificationBell() {
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 hover:text-[#FF3333]"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell size={18} strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#FF3333] text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              className="text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors duration-150"
            >
              Mark all read
            </button>
          )}
        </div>

        <Separator />

        {/* List */}
        <ScrollArea className="max-h-72">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">
              No notifications
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) markRead(notif.id);
                  }}
                  className={cn(
                    'flex gap-3 px-4 py-3 transition-colors duration-150 cursor-pointer',
                    'hover:bg-[var(--color-bg-overlay)]',
                    !notif.read && 'bg-[var(--color-bg-elevated)]'
                  )}
                >
                  {/* Type indicator dot */}
                  <span
                    className={cn(
                      'mt-1.5 size-2 shrink-0 rounded-full',
                      typeColorMap[notif.type] ?? 'bg-[var(--color-text-tertiary)]'
                    )}
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm leading-tight',
                        notif.read
                          ? 'text-[var(--color-text-secondary)]'
                          : 'font-medium text-[var(--color-text-primary)]'
                      )}
                    >
                      {notif.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)] line-clamp-2">
                      {notif.body}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
                      {formatRelativeTime(notif.created_at)}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {!notif.read && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
