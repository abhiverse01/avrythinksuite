'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Search } from 'lucide-react';
import { keyboardRegistry } from '@/lib/keyboard-registry';
import { useUIStore } from '@/stores/ui-store';
import type { ShortcutDefinition } from '@/lib/keyboard-registry';

/* ── Display name mapping for modifier keys ── */

const KEY_DISPLAY: Record<string, string> = {
  cmd: '⌘',
  command: '⌘',
  ctrl: '⌃',
  alt: '⌥',
  option: '⌥',
  shift: '⇧',
  mod: '⌘',
  enter: '↵',
  tab: '⇥',
  backspace: '⌫',
  delete: '⌦',
  escape: 'esc',
  esc: 'esc',
  left: '←',
  right: '→',
  up: '↑',
  down: '↓',
  space: '␣',
};

const CATEGORY_LABELS: Record<ShortcutDefinition['category'], string> = {
  global: 'Global',
  docs: 'Documents',
  sheets: 'Spreadsheets',
  slides: 'Presentations',
  canvas: 'Canvas',
  examiner: 'Examiner',
};

const CATEGORY_ORDER: ShortcutDefinition['category'][] = [
  'global',
  'docs',
  'sheets',
  'slides',
  'canvas',
  'examiner',
];

/* ── Kbd component ── */

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-2 py-0.5 text-xs font-mono text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] min-w-[24px]">
      {children}
    </kbd>
  );
}

/* ── Parse shortcut keys string into display parts ── */

function parseKeys(keysStr: string): string[] {
  return keysStr.split('+').map((key) => {
    const normalized = key.trim().toLowerCase();
    return KEY_DISPLAY[normalized] || key.trim().toUpperCase();
  });
}

/* ── Shortcut Row ── */

function ShortcutRow({ def }: { def: ShortcutDefinition }) {
  const parts = parseKeys(def.keys);
  return (
    <div className="flex items-center justify-between py-2 px-1">
      <span className="text-sm text-[var(--color-text-secondary)]">
        {def.description}
      </span>
      <div className="flex items-center gap-1">
        {parts.map((part, i) => (
          <span key={`${def.keys}-${i}`} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-xs text-[var(--color-text-tertiary)]">+</span>
            )}
            <Kbd>{part}</Kbd>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS MODAL
   ════════════════════════════════════════════════════ */

export function KeyboardShortcutsModal() {
  const open = useUIStore((s) => s.keyboardShortcutsOpen);
  const toggle = useUIStore((s) => s.toggleKeyboardShortcuts);
  const close = useUIStore((s) => s.closeKeyboardShortcuts);

  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset search when dialog opens
  useEffect(() => {
    if (open) {
      setSearch('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Filter shortcuts by search query
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const all = keyboardRegistry.getAll();
    if (!q) return all;

    return all.filter(
      (def) =>
        def.description.toLowerCase().includes(q) ||
        def.keys.toLowerCase().includes(q) ||
        def.category.toLowerCase().includes(q),
    );
  }, [search]);

  // Group by category
  const grouped = useMemo(() => {
    const groups = new Map<ShortcutDefinition['category'], ShortcutDefinition[]>();
    for (const cat of CATEGORY_ORDER) {
      const items = filtered.filter((def) => def.category === cat);
      if (items.length > 0) {
        groups.set(cat, items);
      }
    }
    return groups;
  }, [filtered]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) close();
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[80dvh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Press a shortcut key to navigate or perform actions quickly.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2">
            <Search
              size={14}
              strokeWidth={1.5}
              className="shrink-0 text-[var(--color-text-tertiary)]"
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search shortcuts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
            />
          </div>
        </div>

        {/* Shortcuts list */}
        <div className="overflow-y-auto px-6 pb-2 flex-1">
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">
              No shortcuts found for &ldquo;{search}&rdquo;
            </div>
          )}

          {Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category} className="mb-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1">
                {CATEGORY_LABELS[category]}
              </h3>
              <div className="divide-y divide-[var(--color-border)]">
                {items.map((def) => (
                  <ShortcutRow key={def.keys} def={def} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] px-6 py-3 text-[11px] text-[var(--color-text-tertiary)]">
          <span>Press <Kbd>Esc</Kbd> to close</span>
          <span>
            <Kbd>⌘</Kbd><span className="mx-1">+</span><Kbd>?</Kbd> to toggle
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
