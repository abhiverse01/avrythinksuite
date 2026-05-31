'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Files,
  FileText,
  Table,
  Presentation,
  Paintbrush,
  ClipboardCheck,
  Star,
  Users,
  Clock,
  Trash2,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List,
  MoreHorizontal,
  Download,
  StarOff,
  Trash,
  FolderOpen,
  ChevronRight,
  Pencil,
  Share2,
  ExternalLink,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumb } from '@/components/app/Breadcrumb';
import { useFileStore } from '@/stores/file-store';
import { cn, formatRelativeTime, getFileTypeColor, getFileTypeLabel } from '@/lib/utils';
import { cardHover, stagger } from '@/lib/animation';
import type { FileItem, FileType, ViewMode, SortField } from '@/lib/types';

/* ── Sidebar filter config ── */

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  filterType?: FileType;
  filterKey?: 'all' | 'starred' | 'shared' | 'recent' | 'trash';
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'all', label: 'All files', icon: Files, filterKey: 'all' },
  { id: 'doc', label: 'Docs', icon: FileText, filterType: 'doc' },
  { id: 'sheet', label: 'Sheets', icon: Table, filterType: 'sheet' },
  { id: 'slide', label: 'Slides', icon: Presentation, filterType: 'slide' },
  { id: 'canvas', label: 'Canvas', icon: Paintbrush, filterType: 'canvas' },
  { id: 'exam', label: 'Exams', icon: ClipboardCheck, filterType: 'exam' },
  { id: 'starred', label: 'Starred', icon: Star, filterKey: 'starred' },
  { id: 'shared', label: 'Shared', icon: Users, filterKey: 'shared' },
  { id: 'recent', label: 'Recent', icon: Clock, filterKey: 'recent' },
  { id: 'trash', label: 'Trash', icon: Trash2, filterKey: 'trash' },
];

const FILE_TYPE_ICONS: Record<FileType, LucideIcon> = {
  doc: FileText,
  sheet: Table,
  slide: Presentation,
  canvas: Paintbrush,
  exam: ClipboardCheck,
};

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: 'updated_at', label: 'Last modified' },
  { field: 'created_at', label: 'Date created' },
  { field: 'name', label: 'Name' },
];

const NEW_FILE_OPTIONS: { type: FileType; label: string }[] = [
  { type: 'doc', label: 'Document' },
  { type: 'sheet', label: 'Spreadsheet' },
  { type: 'slide', label: 'Presentation' },
  { type: 'canvas', label: 'Canvas' },
  { type: 'exam', label: 'Exam' },
];

/* ── File sizes (mock) ── */

function mockFileSize(): string {
  const sizes = ['24 KB', '156 KB', '1.2 MB', '890 KB', '3.4 MB', '45 KB', '220 KB'];
  return sizes[Math.floor(Math.random() * sizes.length)];
}

/* ── Grid file card ── */

function FileGridCard({
  file,
  isSelected,
  onSelect,
  onToggleSelect,
}: {
  file: FileItem;
  isSelected: boolean;
  onSelect: () => void;
  onToggleSelect: (e: React.MouseEvent) => void;
}) {
  const Icon = FILE_TYPE_ICONS[file.type];
  const colorClasses = getFileTypeColor(file.type);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.div
          className={cn(
            'group/file relative flex flex-col rounded-xl border bg-[var(--color-bg-surface)] p-4',
            'cursor-pointer transition-shadow duration-200 ease-[var(--ease-smooth)]',
            'hover:shadow-[var(--shadow-lg)] hover:border-[var(--color-border-strong)]',
            isSelected ? 'ring-2 ring-[#FF3333] border-[#FF3333]' : 'border-[var(--color-border)]',
          )}
          {...cardHover}
          onClick={onSelect}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onSelect(); }}
        >
          {/* Checkbox (appears on hover or when selected) */}
          <div
            className={cn(
              'absolute top-2 left-2 z-10 transition-opacity duration-150',
              isSelected ? 'opacity-100' : 'opacity-0 group-hover/file:opacity-100',
            )}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => {}}
              onClick={(e) => { e.stopPropagation(); onToggleSelect(e); }}
              className="size-5 border-[var(--color-border-strong)]"
            />
          </div>

          {/* Type icon */}
          <div className={cn('flex size-12 items-center justify-center rounded-lg', colorClasses)}>
            <Icon size={24} strokeWidth={1.5} />
          </div>

          {/* Name */}
          <h3 className="mt-3 truncate text-sm font-semibold text-[var(--color-text-primary)]">
            {file.name}
          </h3>

          {/* Type badge + date */}
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-md bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
              {getFileTypeLabel(file.type)}
            </span>
            {file.is_starred && (
              <Star size={11} className="fill-[var(--color-warning)] text-[var(--color-warning)]" />
            )}
          </div>
          <p className="mt-2 text-[11px] text-[var(--color-text-tertiary)]">
            {formatRelativeTime(file.updated_at)}
          </p>
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <FileContextActions file={file} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

/* ── List row ── */

function FileListRow({
  file,
  isSelected,
  onSelect,
  onToggleSelect,
}: {
  file: FileItem;
  isSelected: boolean;
  onSelect: () => void;
  onToggleSelect: (e: React.MouseEvent) => void;
}) {
  const Icon = FILE_TYPE_ICONS[file.type];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            'group/row flex items-center gap-3 border-b border-[var(--color-border)] px-3 py-2.5',
            'cursor-pointer transition-colors duration-150',
            'hover:bg-[var(--color-bg-overlay)]',
            isSelected && 'bg-[var(--brand-muted)]',
          )}
          onClick={onSelect}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onSelect(); }}
        >
          {/* Checkbox */}
          <div
            className={cn(
              'transition-opacity duration-150',
              isSelected ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100',
            )}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => {}}
              onClick={(e) => { e.stopPropagation(); onToggleSelect(e); }}
              className="size-4 border-[var(--color-border-strong)]"
            />
          </div>

          {/* Icon */}
          <Icon size={16} strokeWidth={1.5} className="shrink-0 text-[var(--color-text-tertiary)]" />

          {/* Name */}
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-text-primary)]">
            {file.name}
          </span>

          {/* Type badge */}
          <span className="hidden shrink-0 rounded-md bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)] sm:inline">
            {getFileTypeLabel(file.type)}
          </span>

          {/* Star */}
          {file.is_starred && (
            <Star size={13} className="shrink-0 fill-[var(--color-warning)] text-[var(--color-warning)]" />
          )}

          {/* Date */}
          <span className="hidden shrink-0 text-xs text-[var(--color-text-tertiary)] md:inline">
            {formatRelativeTime(file.updated_at)}
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <FileContextActions file={file} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

/* ── Shared context menu items ── */

function FileContextActions({ file }: { file: FileItem }) {
  const router = useRouter();
  const { starFile, unstarFile, deleteFile } = useFileStore();

  return (
    <>
      <ContextMenuItem onSelect={() => router.push(`/${file.type}s/${file.id}`)}>
        <ExternalLink size={14} /> Open
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => {/* rename placeholder */}}>
        <Pencil size={14} /> Rename
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => file.is_starred ? unstarFile(file.id) : starFile(file.id)}>
        {file.is_starred ? <StarOff size={14} /> : <Star size={14} />}
        {file.is_starred ? 'Unstar' : 'Star'}
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => {/* share placeholder */}}>
        <Share2 size={14} /> Share
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => {/* download placeholder */}}>
        <Download size={14} /> Download
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem variant="destructive" onSelect={() => deleteFile(file.id)}>
        <Trash size={14} /> Move to trash
      </ContextMenuItem>
    </>
  );
}

/* ── Empty state ── */

function EmptyFileManager({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-[var(--color-bg-elevated)]">
        <FolderOpen size={28} strokeWidth={1.5} className="text-[var(--color-text-tertiary)]" />
      </div>
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">
        No {label.toLowerCase()} files
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
        Create a new file or adjust your filter.
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   FILE MANAGER VIEW
   ════════════════════════════════════════════════════ */

export function FileManagerView() {
  const router = useRouter();
  const { recentFiles, starredFiles, createFile, starFile, unstarFile, deleteFile } = useFileStore();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const fileIdsRef = useRef<string[]>([]);

  // Determine breadcrumb + filtered files
  const { breadcrumbLabel, filteredFiles } = useMemo(() => {
    const item = SIDEBAR_ITEMS.find((s) => s.id === activeFilter);
    let label = item?.label ?? 'All files';
    let files = recentFiles;

    if (item?.filterType) {
      files = files.filter((f) => f.type === item.filterType);
    } else {
      switch (item?.filterKey) {
        case 'starred':
          files = starredFiles;
          break;
        case 'recent':
          files = [...files].sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          );
          break;
        case 'trash':
          files = [];
          label = 'Trash';
          break;
        case 'shared':
          // Mock: return a subset
          files = files.slice(0, 4);
          break;
      }
    }

    // Sort
    files = [...files].sort((a, b) => {
      switch (sortField) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return { breadcrumbLabel: label, filteredFiles: files };
  }, [activeFilter, recentFiles, starredFiles, sortField]);

  // Keep ref in sync for shift+click (useEffect to avoid setting ref during render)
  useEffect(() => {
    fileIdsRef.current = filteredFiles.map((f) => f.id);
  }, [filteredFiles]);

  const toggleSelect = useCallback(
    (fileId: string, e?: React.MouseEvent) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(fileId)) {
          next.delete(fileId);
        } else {
          next.add(fileId);
        }
        return next;
      });

      if (e && !e.shiftKey) {
        const idx = fileIdsRef.current.indexOf(fileId);
        setLastClickedIndex(idx);
      }
    },
    [],
  );

  const handleFileClick = useCallback(
    (fileId: string, e?: React.MouseEvent) => {
      // Shift+click for range selection
      if (e?.shiftKey && lastClickedIndex !== null) {
        const currentIdx = fileIdsRef.current.indexOf(fileId);
        const start = Math.min(lastClickedIndex, currentIdx);
        const end = Math.max(lastClickedIndex, currentIdx);
        const rangeIds = fileIdsRef.current.slice(start, end + 1);
        setSelectedIds((prev) => new Set([...prev, ...rangeIds]));
        return;
      }

      // If items are already selected, toggle this one
      if (selectedIds.size > 0) {
        toggleSelect(fileId, e);
        return;
      }

      // Navigate to file
      const file = recentFiles.find((f) => f.id === fileId);
      if (file) router.push(`/${file.type}s/${file.id}`);
    },
    [lastClickedIndex, selectedIds.size, toggleSelect, recentFiles, router],
  );

  const clearSelection = () => {
    setSelectedIds(new Set());
    setLastClickedIndex(null);
  };

  const handleNewFile = (type: FileType) => {
    const names: Record<FileType, string> = {
      doc: 'Untitled Document',
      sheet: 'Untitled Spreadsheet',
      slide: 'Untitled Presentation',
      canvas: 'Untitled Canvas',
      exam: 'Untitled Exam',
    };
    const f = createFile({
      name: names[type],
      type,
      owner_id: 'usr-1',
      org_id: null,
      parent_id: null,
    });
    router.push(`/${type}s/${f.id}`);
  };

  const handleBulkStar = () => {
    selectedIds.forEach((id) => starFile(id));
  };
  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteFile(id));
    clearSelection();
  };

  const hasSelection = selectedIds.size > 0;

  return (
    <div className="flex h-full">
      {/* ── Left sidebar ── */}
      <aside className="hidden w-[180px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] md:block">
        <nav className="flex flex-col gap-0.5 p-2" aria-label="File filters">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { setActiveFilter(item.id); clearSelection(); }}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-[var(--brand-muted)] text-[#FF3333]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)]',
                )}
              >
                <Icon size={16} strokeWidth={1.5} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Breadcrumb */}
        <div className="border-b border-[var(--color-border)] px-4 py-2.5">
          <Breadcrumb
            items={[
              { label: 'Files', href: '/files' },
              { label: breadcrumbLabel },
            ]}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-2">
          {/* New button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-lg bg-[#FF3333] px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-[var(--brand-primary-hover)]">
                <Plus size={14} strokeWidth={2} />
                New
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {NEW_FILE_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.type}
                  onSelect={() => handleNewFile(opt.type)}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-overlay)]">
                <ArrowUpDown size={13} strokeWidth={1.5} />
                Sort
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.field}
                  onSelect={() => setSortField(opt.field)}
                  className={sortField === opt.field ? 'text-[var(--color-accent)]' : ''}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View toggle */}
          <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-[var(--color-border)] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-md p-1.5 transition-colors duration-150',
                viewMode === 'grid'
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
              )}
              aria-label="Grid view"
            >
              <LayoutGrid size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-md p-1.5 transition-colors duration-150',
                viewMode === 'list'
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
              )}
              aria-label="List view"
            >
              <List size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Multi-select toolbar */}
        <AnimatePresence>
          {hasSelection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--brand-muted)] px-4 py-2"
            >
              <span className="text-xs font-semibold text-[#FF3333]">
                {selectedIds.size} selected
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={handleBulkStar}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-overlay)]"
                >
                  <Star size={13} strokeWidth={1.5} /> Star
                </button>
                <button
                  onClick={() => {/* bulk download placeholder */}}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-overlay)]"
                >
                  <Download size={13} strokeWidth={1.5} /> Download
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--color-danger)] transition-colors duration-150 hover:bg-[var(--color-bg-overlay)]"
                >
                  <Trash2 size={13} strokeWidth={1.5} /> Delete
                </button>
                <button
                  onClick={clearSelection}
                  className="flex size-6 items-center justify-center rounded-md text-[var(--color-text-tertiary)] transition-colors duration-150 hover:bg-[var(--color-bg-overlay)]"
                  aria-label="Clear selection"
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File content */}
        <div className="flex-1 overflow-y-auto">
          {filteredFiles.length === 0 ? (
            <EmptyFileManager label={breadcrumbLabel} />
          ) : viewMode === 'grid' ? (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredFiles.map((file) => (
                <FileGridCard
                  key={file.id}
                  file={file}
                  isSelected={selectedIds.has(file.id)}
                  onSelect={() => handleFileClick(file.id)}
                  onToggleSelect={(e) => toggleSelect(file.id, e)}
                />
              ))}
            </motion.div>
          ) : (
            <div>
              {filteredFiles.map((file) => (
                <FileListRow
                  key={file.id}
                  file={file}
                  isSelected={selectedIds.has(file.id)}
                  onSelect={() => handleFileClick(file.id)}
                  onToggleSelect={(e) => toggleSelect(file.id, e)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
