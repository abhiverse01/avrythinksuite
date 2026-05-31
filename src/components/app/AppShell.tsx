'use client';

import { type ReactNode, useEffect, useState, useCallback } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { NavRail } from './NavRail';
import { Header } from './Header';
import { Announcer } from './Announcer';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppShellProps {
  children: ReactNode;
  /** Document title displayed next to the wordmark in the header */
  docTitle?: string;
}

/**
 * Full application shell layout.
 * Desktop: 48px sticky Header + NavRail sidebar (64px collapsed / 240px expanded) + main content area.
 * Mobile (<768px): Header + hamburger drawer overlay + full-width content.
 */
export function AppShell({ children, docTitle }: AppShellProps) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Close drawer on resize to desktop
  useEffect(() => {
    if (!isMobile) setMobileDrawerOpen(false);
  }, [isMobile]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileDrawerOpen]);

  // Generate announcer message from pathname
  const announcerMessage =
    pathname === '/home'
      ? 'Home'
      : pathname
          .split('/')
          .filter(Boolean)
          .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '))
          .join(' › ');

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-[var(--color-bg-base)]">
      {/* ── Desktop Sidebar ── */}
      {!isMobile && <NavRail />}

      {/* ── Mobile Drawer Overlay ── */}
      {isMobile && mobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 z-50 w-[260px] animate-in slide-in-from-left duration-200 ease-out shadow-xl">
            <NavRail />
          </div>
        </>
      )}

      {/* ── Right column: Header + Content ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header — renders its own right-side controls internally */}
        <Header
          docTitle={docTitle}
          onMenuToggle={() => setMobileDrawerOpen((prev) => !prev)}
          isMobile={isMobile}
        />

        {/* Main content area */}
        <main
          id="avry-main-content"
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden bg-[var(--color-bg-base)]',
            '[overscroll-behavior:none]',
          )}
          style={{ zIndex: 'var(--z-base)' }}
        >
          {children}
        </main>
      </div>

      {/* Global overlays */}
      <Announcer message={announcerMessage} />
    </div>
  );
}
