'use client';

import {
  ExternalLink,
  FileText,
  Home,
  LayoutGrid,
  Paintbrush,
  Presentation,
  Search,
  Table,
  ClipboardCheck,
  Plus,
  Settings,
  Command,
  File,
  Files,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUIStore } from '@/stores/ui-store';
import { useFileStore } from '@/stores/file-store';
import { useRouter, usePathname } from 'next/navigation';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { CommandItemType } from '@/lib/types';

/** Icon map for string names → Lucide components */
const iconMap: Record<string, LucideIcon> = {
  'layout-grid': LayoutGrid,
  'file-text': FileText,
  table: Table,
  presentation: Presentation,
  paintbrush: Paintbrush,
  'clipboard-check': ClipboardCheck,
  home: Home,
  search: Search,
  settings: Settings,
  'external-link': ExternalLink,
  plus: Plus,
  command: Command,
  file: File,
  files: Files,
};

function resolveIcon(name?: string): LucideIcon {
  if (!name) return Search;
  return iconMap[name.toLowerCase()] ?? Search;
}

type PaletteMode = 'commands' | 'files' | 'content';

const MODE_CONFIG: { id: PaletteMode; label: string; icon: string }[] = [
  { id: 'commands', label: 'Commands', icon: 'command' },
  { id: 'files', label: 'Files', icon: 'files' },
  { id: 'content', label: 'Content', icon: 'search' },
];

interface InternalCommandItem {
  id: string;
  type: CommandItemType;
  label: string;
  secondaryText?: string;
  icon?: string;
  keywords?: string[];
}

/** Navigation items */
const NAV_ITEMS: InternalCommandItem[] = [
  { id: 'nav-home', type: 'navigation', label: 'Home', icon: 'layout-grid', secondaryText: 'Dashboard', keywords: ['home', 'dashboard'] },
  { id: 'nav-docs', type: 'navigation', label: 'Docs', icon: 'file-text', secondaryText: 'All documents', keywords: ['documents', 'docs', 'write'] },
  { id: 'nav-sheets', type: 'navigation', label: 'Sheets', icon: 'table', secondaryText: 'Spreadsheets', keywords: ['spreadsheets', 'sheets', 'data'] },
  { id: 'nav-slides', type: 'navigation', label: 'Slides', icon: 'presentation', secondaryText: 'Presentations', keywords: ['slides', 'presentations', 'deck'] },
  { id: 'nav-canvas', type: 'navigation', label: 'Canvas', icon: 'paintbrush', secondaryText: 'Design canvas', keywords: ['canvas', 'design', 'draw'] },
  { id: 'nav-examiner', type: 'navigation', label: 'Examiner', icon: 'clipboard-check', secondaryText: 'Exams & quizzes', keywords: ['exam', 'quiz', 'test', 'assess'] },
  { id: 'nav-files', type: 'navigation', label: 'Files', icon: 'files', secondaryText: 'File manager', keywords: ['files', 'file manager', 'browse', 'all files'] },
  { id: 'nav-settings', type: 'navigation', label: 'Settings', icon: 'settings', secondaryText: 'Preferences', keywords: ['settings', 'preferences', 'config'] },
];

/** Action items */
const ACTION_ITEMS: InternalCommandItem[] = [
  { id: 'action-new-doc', type: 'action', label: 'New Document', icon: 'file-text', secondaryText: 'Create a new document', keywords: ['create', 'new', 'document', 'doc'] },
  { id: 'action-new-sheet', type: 'action', label: 'New Spreadsheet', icon: 'table', secondaryText: 'Create a new spreadsheet', keywords: ['create', 'new', 'spreadsheet', 'sheet'] },
  { id: 'action-new-slide', type: 'action', label: 'New Presentation', icon: 'presentation', secondaryText: 'Create a new presentation', keywords: ['create', 'new', 'presentation', 'slide', 'deck'] },
  { id: 'action-new-canvas', type: 'action', label: 'New Canvas', icon: 'paintbrush', secondaryText: 'Create a new canvas', keywords: ['create', 'new', 'canvas', 'design'] },
  { id: 'action-new-exam', type: 'action', label: 'New Exam', icon: 'clipboard-check', secondaryText: 'Create a new exam', keywords: ['create', 'new', 'exam', 'quiz', 'test'] },
];

/** Theme commands */
const THEME_ITEMS: InternalCommandItem[] = [
  { id: 'cmd-dark', type: 'navigation', label: 'Switch to Dark', icon: 'command', secondaryText: 'Apply dark theme', keywords: ['dark', 'theme', 'mode', 'night'] },
  { id: 'cmd-light', type: 'navigation', label: 'Switch to Light', icon: 'command', secondaryText: 'Apply light theme', keywords: ['light', 'theme', 'mode', 'day'] },
];

const NAV_ROUTE_MAP: Record<string, string> = {
  'nav-home': '/home',
  'nav-docs': '/docs',
  'nav-sheets': '/sheets',
  'nav-slides': '/slides',
  'nav-canvas': '/canvas',
  'nav-examiner': '/examiner',
  'nav-files': '/files',
  'nav-settings': '/settings',
  'cmd-dark': '__theme_dark__',
  'cmd-light': '__theme_light__',
};

const ACTION_TYPE_MAP: Record<string, { type: 'doc' | 'sheet' | 'slide' | 'canvas' | 'exam'; name: string }> = {
  'action-new-doc': { type: 'doc', name: 'Untitled Document' },
  'action-new-sheet': { type: 'sheet', name: 'Untitled Spreadsheet' },
  'action-new-slide': { type: 'slide', name: 'Untitled Presentation' },
  'action-new-canvas': { type: 'canvas', name: 'Untitled Canvas' },
  'action-new-exam': { type: 'exam', name: 'Untitled Exam' },
};

const FILE_TYPE_ICONS: Record<string, string> = {
  doc: 'file-text',
  sheet: 'table',
  slide: 'presentation',
  canvas: 'paintbrush',
  exam: 'clipboard-check',
};

const FILE_TYPE_LABELS: Record<string, string> = {
  doc: 'Document',
  sheet: 'Sheet',
  slide: 'Slide',
  canvas: 'Canvas',
  exam: 'Exam',
};

type GroupedResults = {
  files: InternalCommandItem[];
  actions: InternalCommandItem[];
  navigation: InternalCommandItem[];
};

/** Highlight matching text in a string */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-[var(--color-accent-muted)] text-[var(--color-accent)] px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/**
 * Global command palette overlay dialog.
 * Supports 3 modes: Commands, Files, Content.
 * Fuzzy search across files, actions, and navigation with keyboard nav.
 */
export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const close = useUIStore((s) => s.closeCommandPalette);
  const recentFiles = useFileStore((s) => s.recentFiles);
  const createFile = useFileStore((s) => s.createFile);
  const setTheme = useUIStore((s) => s.setTheme);
  const router = useRouter();
  const pathname = usePathname();

  const [mode, setMode] = useState<PaletteMode>('commands');
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build file command items from store
  const fileCommands: InternalCommandItem[] = useMemo(
    () =>
      recentFiles.map((f) => ({
        id: `file-${f.id}`,
        type: 'file' as CommandItemType,
        label: f.name,
        secondaryText: f.type.charAt(0).toUpperCase() + f.type.slice(1),
        icon: FILE_TYPE_ICONS[f.type] ?? 'file-text',
        keywords: [f.type, f.name],
      })),
    [recentFiles],
  );

  // ── Commands mode results ──
  const commandResults = useMemo<GroupedResults>(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return {
        files: fileCommands.slice(0, 5),
        actions: ACTION_ITEMS,
        navigation: [...THEME_ITEMS, ...NAV_ITEMS],
      };
    }

    const filter = (items: InternalCommandItem[]) =>
      items.filter((item) => {
        const haystack = `${item.label} ${item.secondaryText ?? ''} ${item.keywords?.join(' ') ?? ''}`.toLowerCase();
        return haystack.includes(q);
      });

    return {
      files: filter(fileCommands),
      actions: filter(ACTION_ITEMS),
      navigation: filter([...THEME_ITEMS, ...NAV_ITEMS]),
    };
  }, [query, fileCommands]);

  // ── Files mode results ──
  const filesResults = useMemo<InternalCommandItem[]>(() => {
    const q = query.toLowerCase().trim();
    let files = recentFiles;
    if (q) {
      files = files.filter((f) => {
        const haystack = `${f.name} ${f.type} ${FILE_TYPE_LABELS[f.type] ?? ''}`.toLowerCase();
        return haystack.includes(q);
      });
    }
    return files.map((f) => ({
      id: `file-${f.id}`,
      type: 'file' as CommandItemType,
      label: f.name,
      secondaryText: formatRelativeTime(f.updated_at),
      icon: FILE_TYPE_ICONS[f.type] ?? 'file-text',
      keywords: [f.type, FILE_TYPE_LABELS[f.type] ?? ''],
    }));
  }, [query, recentFiles]);

  // ── Content mode results ──
  const contentResults = useMemo<InternalCommandItem[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) return fileCommands.slice(0, 10);
    // Search in file name as proxy for content search
    return fileCommands.filter((item) => {
      return item.label.toLowerCase().includes(q);
    });
  }, [query, fileCommands]);

  // Flat list for keyboard navigation (depends on mode)
  const flatItems = useMemo(() => {
    if (mode === 'files') return filesResults;
    if (mode === 'content') return contentResults;
    return [...commandResults.files, ...commandResults.actions, ...commandResults.navigation];
  }, [mode, commandResults, filesResults, contentResults]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setMode('commands');
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  // Reset active index when mode or query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [mode, query]);

  // Execute a command item
  const executeItem = useCallback(
    (item: InternalCommandItem) => {
      if (item.type === 'navigation') {
        const route = NAV_ROUTE_MAP[item.id];
        if (route === '__theme_dark__') {
          setTheme('dark');
        } else if (route === '__theme_light__') {
          setTheme('light');
        } else if (route) {
          router.push(route);
        }
      } else if (item.type === 'action') {
        const action = ACTION_TYPE_MAP[item.id];
        if (action) {
          const newFile = createFile({
            name: action.name,
            type: action.type,
            owner_id: 'usr-1',
            org_id: null,
            parent_id: null,
          });
          router.push(`/${action.type}s/${newFile.id}`);
        }
      } else if (item.type === 'file') {
        const fileId = item.id.replace('file-', '');
        const file = recentFiles.find((f) => f.id === fileId);
        if (file) {
          router.push(`/${file.type}s/${file.id}`);
        }
      }
      close();
    },
    [router, createFile, close, recentFiles, setTheme],
  );

  // Cycle mode with Tab key
  const cycleMode = useCallback(() => {
    setMode((prev) => {
      const idx = MODE_CONFIG.findIndex((m) => m.id === prev);
      return MODE_CONFIG[(idx + 1) % MODE_CONFIG.length].id;
    });
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && flatItems[activeIndex]) {
        e.preventDefault();
        executeItem(flatItems[activeIndex]);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        cycleMode();
      }
    },
    [flatItems, activeIndex, executeItem, cycleMode],
  );

  // Scroll active item into view
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const active = container.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const groupLabels: Record<string, string> = {
    files: 'Files',
    actions: 'Actions',
    navigation: 'Navigation',
  };

  const placeholderText = {
    commands: 'Search files, actions, navigation…',
    files: 'Search files by name, type…',
    content: 'Search inside file content…',
  };

  let runningIndex = 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) close();
      }}
    >
      <DialogContent
        className={cn(
          'overflow-hidden p-0',
          mode === 'content' ? 'sm:max-w-[600px]' : 'sm:max-w-xl',
        )}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Command Palette</DialogTitle>

        {/* Mode tabs */}
        <div className="flex items-center gap-1 border-b border-[var(--color-border)] px-4 pt-3 pb-0">
          {MODE_CONFIG.map((m) => {
            const Icon = resolveIcon(m.icon);
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  setQuery('');
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-t-md px-3 py-2 text-xs font-medium transition-colors duration-150',
                  isActive
                    ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-muted)]'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)]',
                )}
              >
                <Icon size={13} strokeWidth={1.5} />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="flex items-center border-b border-[var(--color-border)] px-4">
          <Search
            className="mr-2 shrink-0 text-[var(--color-text-tertiary)]"
            size={18}
            strokeWidth={1.5}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholderText[mode]}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-tertiary)] sm:inline">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className={cn(
            'overflow-y-auto p-2',
            mode === 'content' ? 'max-h-[60vh]' : 'max-h-80',
          )}
          role="listbox"
        >
          {flatItems.length === 0 && (
            <div className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">
              No results found
            </div>
          )}

          {/* ── Commands mode: grouped results ── */}
          {mode === 'commands' && (
            <>
              {(['files', 'actions', 'navigation'] as const).map((group) => {
                const items = commandResults[group];
                if (items.length === 0) return null;

                return (
                  <div key={group} className="mb-1">
                    <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      {groupLabels[group]}
                    </div>
                    {items.map((item) => {
                      const currentIndex = runningIndex;
                      runningIndex++;
                      const isActive = currentIndex === activeIndex;
                      const Icon = resolveIcon(item.icon);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          data-active={isActive}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors duration-150',
                            isActive
                              ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)]',
                          )}
                          onClick={() => executeItem(item)}
                          onMouseEnter={() => setActiveIndex(currentIndex)}
                        >
                          <Icon size={16} strokeWidth={1.5} className="shrink-0" />
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.secondaryText && (
                            <span className="truncate text-xs text-[var(--color-text-tertiary)]">
                              {item.secondaryText}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}

          {/* ── Files mode: flat list with type badge ── */}
          {mode === 'files' && (
            <div className="flex flex-col gap-0.5">
              {filesResults.map((item, idx) => {
                const isActive = idx === activeIndex;
                const Icon = resolveIcon(item.icon);
                const fileId = item.id.replace('file-', '');
                const file = recentFiles.find((f) => f.id === fileId);
                const typeLabel = file ? (FILE_TYPE_LABELS[file.type] ?? file.type) : '';

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    data-active={isActive}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors duration-150',
                      isActive
                        ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)]',
                    )}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <Icon size={16} strokeWidth={1.5} className="shrink-0" />
                    <span className="flex-1 truncate">
                      {query ? <HighlightMatch text={item.label} query={query} /> : item.label}
                    </span>
                    {item.secondaryText && (
                      <span className="shrink-0 text-xs text-[var(--color-text-tertiary)]">
                        {item.secondaryText}
                      </span>
                    )}
                    {typeLabel && (
                      <Badge variant="outline" className="ml-auto shrink-0 text-[10px] px-1.5 py-0">
                        {typeLabel}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Content mode: file name + snippet with highlight ── */}
          {mode === 'content' && (
            <div className="flex flex-col gap-0.5">
              {contentResults.map((item, idx) => {
                const isActive = idx === activeIndex;
                const Icon = resolveIcon(item.icon);
                const fileId = item.id.replace('file-', '');
                const file = recentFiles.find((f) => f.id === fileId);

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    data-active={isActive}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors duration-150',
                      isActive
                        ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)]',
                    )}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <Icon size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        <HighlightMatch text={item.label} query={query} />
                      </div>
                      <div className="mt-0.5 truncate text-xs text-[var(--color-text-tertiary)]">
                        {file ? (FILE_TYPE_LABELS[file.type] ?? file.type) : ''}
                        {file && file.updated_at ? ` · ${formatRelativeTime(file.updated_at)}` : ''}
                        {query ? ` · Matched in: name` : ''}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t border-[var(--color-border)] px-4 py-2 text-[11px] text-[var(--color-text-tertiary)]">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-1 py-0.5 font-mono text-[10px]">
              ↑↓
            </kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-1 py-0.5 font-mono text-[10px]">
              ↵
            </kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-1 py-0.5 font-mono text-[10px]">
              Tab
            </kbd>
            Switch mode
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-1 py-0.5 font-mono text-[10px]">
              esc
            </kbd>
            Close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
