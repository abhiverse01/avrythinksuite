'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, Bell, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { useNotificationStore } from '@/stores/notification-store';
import { OfflineIndicator } from './OfflineIndicator';
import { NotificationPanel } from './NotificationPanel';
import { OrgSwitcher } from './OrgSwitcher';
import { UserAvatar } from './UserAvatar';
import { cn } from '@/lib/utils';

interface HeaderProps {
  /** Document title shown next to the wordmark */
  docTitle?: string;
  /** Mobile hamburger toggle */
  onMenuToggle?: () => void;
  /** Whether the viewport is mobile */
  isMobile?: boolean;
}

/**
 * 48px sticky header with blurred backdrop.
 * Contains: logo + doc title (left), search bar (center), controls (right).
 */
export function Header({ docTitle, onMenuToggle, isMobile }: HeaderProps) {
  const headerScrolled = useUIStore((s) => s.headerScrolled);
  const setHeaderScrolled = useUIStore((s) => s.setHeaderScrolled);
  const openCommandPalette = useUIStore((s) => s.openCommandPalette);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const [notifOpen, setNotifOpen] = useState(false);

  // Listen for scroll on the main content area
  useEffect(() => {
    const mainEl = document.getElementById('avry-main-content');
    if (!mainEl) return;

    const handleScroll = () => {
      setHeaderScrolled(mainEl.scrollTop > 0);
    };

    mainEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainEl.removeEventListener('scroll', handleScroll);
  }, [setHeaderScrolled]);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-3 sm:px-4',
        'bg-white/85 dark:bg-[#0A0A0A]/90 backdrop-blur-xl',
        'transition-shadow duration-200',
        headerScrolled && 'shadow-[var(--shadow-md)]',
      )}
    >
      {/* ── Mobile: Hamburger ── */}
      {isMobile && (
        <button
          onClick={onMenuToggle}
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)]"
          aria-label="Open navigation menu"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      )}

      {/* ── Left: Logo + brand text + doc title ── */}
      <Link href="/home" className="flex min-w-0 shrink-0 items-center gap-2">
        <Image
          src="/avrythink-logo.png"
          alt="Avrythink Suite"
          width={28}
          height={28}
          className="shrink-0"
          priority
        />
        {!sidebarCollapsed && !isMobile && (
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">avrythink</span>
            <span className="text-sm font-light text-[var(--color-text-secondary)]">suite</span>
          </div>
        )}
        {docTitle && !sidebarCollapsed && !isMobile && (
          <>
            <span className="h-4 w-px bg-[var(--color-border-strong)]" />
            <span className="max-w-[200px] truncate text-sm text-[var(--color-text-secondary)]">
              {docTitle}
            </span>
          </>
        )}
      </Link>

      {/* ── Center: Search bar ── */}
      <div className="flex flex-1 justify-center">
        <button
          onClick={openCommandPalette}
          aria-label="Search files and commands"
          className={cn(
            'flex w-full max-w-md items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1.5 sm:px-4',
            'text-[var(--color-text-tertiary)] transition-colors duration-150',
            'hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-overlay)]',
            isMobile && 'max-w-none',
          )}
        >
          <Search size={16} strokeWidth={1.5} className="shrink-0" />
          <span className="hidden text-sm sm:inline">Search…</span>
          <kbd className="ml-auto hidden shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-tertiary)] md:inline">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ── Right: Controls ── */}
      <div className="relative flex shrink-0 items-center gap-0.5">
        <OfflineIndicator />

        {/* Bell icon — toggles notification panel */}
        <button
          onClick={() => setNotifOpen((prev) => !prev)}
          className="relative flex size-9 items-center justify-center rounded-md text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-hover)] hover:text-[#FF3333]"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell size={18} strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#FF3333] text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification panel */}
        <NotificationPanel isOpen={notifOpen} onToggle={() => setNotifOpen(false)} />

        {/* OrgSwitcher hidden on very small screens */}
        <div className={cn(isMobile && 'hidden')}>
          <OrgSwitcher />
        </div>
        <UserAvatar />
      </div>
    </header>
  );
}
