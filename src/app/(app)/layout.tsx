'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useFileStore } from '@/stores/file-store';
import { AppShell } from '@/components/app/AppShell';
import { CommandPalette } from '@/components/app/CommandPalette';
import { KeyboardShortcutsModal } from '@/components/app/KeyboardShortcutsModal';
import { keyboardRegistry } from '@/lib/keyboard-registry';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard';

const SECTIONS = [
  { index: 1, route: '/home' },
  { index: 2, route: '/docs' },
  { index: 3, route: '/sheets' },
  { index: 4, route: '/slides' },
  { index: 5, route: '/canvas' },
  { index: 6, route: '/examiner' },
] as const;

function GlobalShortcutsRegistrar() {
  const router = useRouter();
  const openCommandPalette = useUIStore((s) => s.openCommandPalette);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleKeyboardShortcuts = useUIStore((s) => s.toggleKeyboardShortcuts);
  const createFile = useFileStore((s) => s.createFile);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (registeredRef.current) return;
    registeredRef.current = true;

    // cmd+k → open command palette
    keyboardRegistry.register({
      keys: 'cmd+k',
      description: 'Open command palette',
      category: 'global',
      action: () => openCommandPalette(),
    });

    // cmd+\ → toggle sidebar
    keyboardRegistry.register({
      keys: 'cmd+\\',
      description: 'Toggle sidebar',
      category: 'global',
      action: () => toggleSidebar(),
    });

    // cmd+, → navigate to settings
    keyboardRegistry.register({
      keys: 'cmd+,',
      description: 'Open settings',
      category: 'global',
      action: () => router.push('/settings'),
    });

    // cmd+n → new file (opens command palette in action mode)
    keyboardRegistry.register({
      keys: 'cmd+n',
      description: 'Create new file',
      category: 'global',
      action: () => {
        const newFile = createFile({
          name: 'Untitled Document',
          type: 'doc',
          owner_id: 'usr-1',
          org_id: null,
          parent_id: null,
        });
        router.push(`/docs/${newFile.id}`);
      },
    });

    // cmd+? → toggle keyboard shortcuts modal
    keyboardRegistry.register({
      keys: 'cmd+/',
      description: 'Show keyboard shortcuts',
      category: 'global',
      action: () => toggleKeyboardShortcuts(),
    });

    // alt+1 through alt+6 → switch to app section
    for (const section of SECTIONS) {
      keyboardRegistry.register({
        keys: `alt+${section.index}`,
        description: `Switch to ${section.route.replace('/', '')}`,
        category: 'global',
        action: () => router.push(section.route),
      });
    }

    // Bind all registered shortcuts to hotkeys-js
    keyboardRegistry.bindAll();
  }, [router, openCommandPalette, toggleSidebar, toggleKeyboardShortcuts, createFile]);

  // Activate hotkeys-js bindings
  useKeyboardShortcuts();

  return null;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { hydrate, isAuthenticated, isLoading } = useAuthStore();

  // Hydrate auth on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Redirect to login if unauthenticated after hydration
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show nothing while checking auth
  if (isLoading) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-[var(--color-bg-base)]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-pulse opacity-40">
            <Image src="/avrythink-logo.png" alt="Loading" width={40} height={40} />
          </div>
          <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">Just a moment...</p>
        </div>
      </div>
    );
  }

  // Don't render shell until authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppShell>
      {children}
      <CommandPalette />
      <KeyboardShortcutsModal />
      <GlobalShortcutsRegistrar />
    </AppShell>
  );
}
