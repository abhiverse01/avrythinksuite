'use client';

import { useRouter } from 'next/navigation';
import {
  FileText,
  Table,
  Presentation,
  Paintbrush,
  ClipboardCheck,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/stores/file-store';
import { cn } from '@/lib/utils';
import type { FileType } from '@/lib/types';

interface CreateAction {
  type: FileType;
  label: string;
  icon: LucideIcon;
  defaultName: string;
}

const CREATE_ACTIONS: CreateAction[] = [
  { type: 'doc', label: 'New Doc', icon: FileText, defaultName: 'Untitled Document' },
  { type: 'sheet', label: 'New Sheet', icon: Table, defaultName: 'Untitled Spreadsheet' },
  { type: 'slide', label: 'New Slide', icon: Presentation, defaultName: 'Untitled Presentation' },
  { type: 'canvas', label: 'New Canvas', icon: Paintbrush, defaultName: 'Untitled Canvas' },
  { type: 'exam', label: 'New Exam', icon: ClipboardCheck, defaultName: 'Untitled Exam' },
];

/**
 * Large pill-shaped bar with quick-create buttons.
 * Each button creates a new file and navigates to its editor.
 */
export function QuickCreateBar({ className }: { className?: string }) {
  const createFile = useFileStore((s) => s.createFile);
  const router = useRouter();

  const handleCreate = (action: CreateAction) => {
    const newFile = createFile({
      name: action.defaultName,
      type: action.type,
      owner_id: 'usr-1',
      org_id: null,
      parent_id: null,
    });
    router.push(`/${action.type}s/${newFile.id}`);
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-2',
        className
      )}
    >
      {CREATE_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.type}
            variant="outline"
            onClick={() => handleCreate(action)}
            className={cn(
              'gap-1.5 rounded-full border-dashed border-[var(--color-border)]',
              'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]',
              'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
              'hover:bg-[var(--color-accent-muted)] transition-all duration-200'
            )}
          >
            <Plus size={16} strokeWidth={1.5} />
            <Icon size={16} strokeWidth={1.5} />
            <span className="hidden sm:inline">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
