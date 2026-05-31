'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  FileCode,
  Minus,
  Image,
  Table,
  Columns3,
  Pilcrow,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Command Definitions ── */

export interface SlashCommandDef {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: 'text' | 'list' | 'block' | 'insert';
}

const COMMANDS: SlashCommandDef[] = [
  { id: 'paragraph', label: 'Paragraph', description: 'Plain text block', icon: Pilcrow, category: 'text' },
  { id: 'h1', label: 'Heading 1', description: 'Large section heading', icon: Heading1, category: 'text' },
  { id: 'h2', label: 'Heading 2', description: 'Medium section heading', icon: Heading2, category: 'text' },
  { id: 'h3', label: 'Heading 3', description: 'Small section heading', icon: Heading3, category: 'text' },
  { id: 'h4', label: 'Heading 4', description: 'Subsection heading', icon: Type, category: 'text' },
  { id: 'bullet-list', label: 'Bullet List', description: 'Unordered list with bullets', icon: List, category: 'list' },
  { id: 'ordered-list', label: 'Numbered List', description: 'Ordered list with numbers', icon: ListOrdered, category: 'list' },
  { id: 'task-list', label: 'Task List', description: 'To-do list with checkboxes', icon: CheckSquare, category: 'list' },
  { id: 'blockquote', label: 'Blockquote', description: 'Quote or callout block', icon: Quote, category: 'block' },
  { id: 'code-block', label: 'Code Block', description: 'Syntax-highlighted code', icon: FileCode, category: 'block' },
  { id: 'divider', label: 'Divider', description: 'Horizontal rule', icon: Minus, category: 'block' },
  { id: 'details', label: 'Toggle / Accordion', description: 'Collapsible content block', icon: Columns3, category: 'block' },
  { id: 'image', label: 'Image', description: 'Insert an image from URL', icon: Image, category: 'insert' },
  { id: 'table', label: 'Table', description: 'Insert a 3×3 table', icon: Table, category: 'insert' },
];

const CATEGORY_LABELS: Record<string, string> = {
  text: 'Text Types',
  list: 'Lists',
  block: 'Blocks',
  insert: 'Insert',
};

/* ── Fuzzy match helper ── */

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

/* ── Slash Command Menu Component ── */

interface SlashCommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (commandId: string) => void;
  query: string;
}

export function SlashCommandMenu({
  isOpen,
  onClose,
  onSelect,
  query,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = query
    ? COMMANDS.filter(
        (cmd) =>
          fuzzyMatch(query, cmd.label) || fuzzyMatch(query, cmd.description),
      )
    : COMMANDS;

  // Group by category, maintaining order
  const grouped = filteredCommands.reduce<
    Record<string, SlashCommandDef[]>
  >((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const flatCommands = filteredCommands;

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, filteredCommands.length]);

  // Keyboard navigation — captures keys on the document level
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || flatCommands.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) =>
            prev < flatCommands.length - 1 ? prev + 1 : 0,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatCommands.length - 1,
          );
          break;
        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          if (flatCommands[selectedIndex]) {
            onSelect(flatCommands[selectedIndex].id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          onClose();
          break;
      }
    },
    [isOpen, flatCommands, selectedIndex, onSelect, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [isOpen, handleKeyDown]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (!menuRef.current) return;
    const selected = menuRef.current.querySelector('[data-selected="true"]');
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen || flatCommands.length === 0) return null;

  let runningIndex = -1;

  return (
    <div
      ref={menuRef}
      className="z-[100] w-72 max-h-80 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-lg"
      style={{ scrollbarWidth: 'thin' }}
    >
      {Object.entries(grouped).map(([category, cmds]) => (
        <div key={category}>
          <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            {CATEGORY_LABELS[category] ?? category}
          </div>
          {cmds.map((cmd) => {
            runningIndex++;
            const isActive = runningIndex === selectedIndex;
            return (
              <button
                key={cmd.id}
                type="button"
                data-selected={isActive}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-[var(--color-bg-overlay)] text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]',
                )}
                onClick={() => onSelect(cmd.id)}
                onMouseEnter={() => setSelectedIndex(runningIndex)}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-md',
                    isActive
                      ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                      : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]',
                  )}
                >
                  <cmd.icon size={16} strokeWidth={1.5} />
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-[13px]">{cmd.label}</div>
                  <div className="text-[11px] text-[var(--color-text-tertiary)] truncate">
                    {cmd.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
