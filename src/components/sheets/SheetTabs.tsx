'use client';

import { useState, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SheetTab {
  id: string;
  name: string;
}

interface SheetTabsProps {
  sheets: SheetTab[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRename: (index: number, name: string) => void;
  onDelete: (index: number) => void;
}

/**
 * SheetTabs — Bottom tab bar for managing multiple sheets.
 */
export function SheetTabs({
  sheets,
  activeIndex,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: SheetTabsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleDoubleClick = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingIndex(index);
    setEditName(sheets[index].name);
  }, [sheets]);

  const handleRenameCommit = useCallback(() => {
    if (editingIndex !== null && editName.trim()) {
      onRename(editingIndex, editName.trim());
    }
    setEditingIndex(null);
    setEditName('');
  }, [editingIndex, editName, onRename]);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleRenameCommit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditingIndex(null);
        setEditName('');
      }
    },
    [handleRenameCommit],
  );

  return (
    <div className="flex items-center h-8 border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 shrink-0 overflow-x-auto">
      {sheets.map((sheet, index) => (
        <div
          key={sheet.id}
          className={cn(
            'group relative flex items-center gap-1 px-3 py-1 text-xs cursor-pointer select-none shrink-0 border-t-2 transition-colors',
            activeIndex === index
              ? 'border-t-[var(--color-accent)] text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)]'
              : 'border-t-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]/50',
          )}
          onClick={() => onSelect(index)}
          onDoubleClick={(e) => handleDoubleClick(index, e)}
        >
          {editingIndex === index ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRenameCommit}
              onKeyDown={handleRenameKeyDown}
              className="w-20 text-xs bg-white border border-[var(--color-accent)] rounded px-1 outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span>{sheet.name}</span>
          )}

          {/* Delete button (show on hover for non-active, always for non-first tabs) */}
          {sheets.length > 1 && (
            <button
              className={cn(
                'size-4 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 transition-opacity',
                'hover:bg-[var(--color-border-strong)] text-[var(--color-text-tertiary)]',
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (activeIndex === index && index > 0) {
                  onSelect(index - 1);
                }
                onDelete(index);
              }}
              tabIndex={-1}
              aria-label={`Delete ${sheet.name}`}
            >
              <X size={10} />
            </button>
          )}
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="size-6 shrink-0 ml-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
        onClick={onAdd}
        aria-label="Add new sheet"
      >
        <Plus size={14} strokeWidth={1.5} />
      </Button>
    </div>
  );
}
