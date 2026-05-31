'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw, FileText, Table, Presentation, Paintbrush, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/app/EmptyState';
import { cn, formatRelativeTime, getFileTypeColor } from '@/lib/utils';
import type { FileType } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';

/* ── Types ── */

interface DeletedFile {
  id: string;
  name: string;
  type: FileType;
  deletedAt: string;
}

/* ── Animation ── */

const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

/* ── Icon map ── */

const fileTypeIcons: Record<FileType, LucideIcon> = {
  doc: FileText,
  sheet: Table,
  slide: Presentation,
  canvas: Paintbrush,
  exam: ClipboardCheck,
};

/* ── Mock deleted files ── */

const MOCK_DELETED_FILES: DeletedFile[] = [
  {
    id: 'del-1',
    name: 'Old Project Notes',
    type: 'doc',
    deletedAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
  },
  {
    id: 'del-2',
    name: 'Budget Template 2024',
    type: 'sheet',
    deletedAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
  },
  {
    id: 'del-3',
    name: 'Marketing Strategy v1',
    type: 'slide',
    deletedAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
  },
  {
    id: 'del-4',
    name: 'Sprint Retrospective Notes',
    type: 'canvas',
    deletedAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
  },
  {
    id: 'del-5',
    name: 'Legacy API Docs',
    type: 'doc',
    deletedAt: new Date(Date.now() - 21 * 24 * 3600000).toISOString(),
  },
];

/* ── Deleted File Row ── */

function DeletedFileRow({ file, onRestore }: { file: DeletedFile; onRestore: (id: string) => void }) {
  const Icon = fileTypeIcons[file.type];
  const colorClasses = getFileTypeColor(file.type);

  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 transition-colors hover:bg-[var(--color-bg-elevated)]"
    >
      {/* File type icon */}
      <div
        className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', colorClasses)}
      >
        <Icon size={18} strokeWidth={1.5} />
      </div>

      {/* Name + info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
          {file.name}
        </p>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Deleted {formatRelativeTime(file.deletedAt)}
        </p>
      </div>

      {/* Type badge */}
      <Badge variant="outline" className="shrink-0 capitalize text-xs">
        {file.type}
      </Badge>

      {/* Restore button */}
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 gap-1.5 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent)]"
        onClick={() => onRestore(file.id)}
      >
        <RotateCcw size={14} strokeWidth={1.5} />
        Restore
      </Button>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════
   TRASH PAGE
   ════════════════════════════════════════════════════ */

export default function TrashPage() {
  const router = useRouter();
  const [deletedFiles, setDeletedFiles] = useState<DeletedFile[]>(MOCK_DELETED_FILES);

  const handleRestore = (id: string) => {
    setDeletedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleEmptyTrash = () => {
    setDeletedFiles([]);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="pb-16 pt-8 px-6 sm:px-10 max-w-3xl"
    >
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Trash
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Files in trash are automatically deleted after 30 days
          </p>
        </div>

        {deletedFiles.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-red-600 hover:text-red-600 hover:bg-red-50">
                <Trash2 size={14} strokeWidth={1.5} />
                Empty trash
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Empty trash?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {deletedFiles.length} item{deletedFiles.length !== 1 ? 's' : ''} in
                  trash. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleEmptyTrash}
                >
                  Empty trash
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* ── File List ── */}
      {deletedFiles.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="Trash is empty"
          description="Files you delete will appear here for 30 days before being permanently removed."
          actionLabel="Go to home"
          onAction={() => {
            router.push('/home');
          }}
        />
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2"
        >
          {deletedFiles.map((file) => (
            <DeletedFileRow
              key={file.id}
              file={file}
              onRestore={handleRestore}
            />
          ))}
        </motion.div>
      )}

      {/* ── Trash policy notice ── */}
      {deletedFiles.length > 0 && (
        <p className="mt-6 text-xs text-[var(--color-text-tertiary)] text-center">
          {deletedFiles.length} item{deletedFiles.length !== 1 ? 's' : ''} in trash · Automatically deleted after 30 days
        </p>
      )}
    </motion.div>
  );
}
