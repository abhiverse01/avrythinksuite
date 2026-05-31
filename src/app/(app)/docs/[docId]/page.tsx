'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { DocsEditor } from '@/components/editor/DocsEditor';
import { useFileStore } from '@/stores/file-store';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animation';

/* ════════════════════════════════════════════════════
   DOC EDITOR PAGE
   ════════════════════════════════════════════════════ */

export default function DocEditorPage() {
  const params = useParams<{ docId: string }>();
  const docId = params.docId;
  const { recentFiles, createFile } = useFileStore();

  const file = recentFiles.find((f) => f.id === docId);
  const [content, setContent] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  /* ── If no file found, create a placeholder so the editor still works ── */
  useEffect(() => {
    if (!file) {
      createFile({
        name: 'Untitled Document',
        type: 'doc',
        owner_id: 'usr-1',
        org_id: null,
        parent_id: null,
      });
    }
  }, [file, createFile]);

  /* ── Simulate brief load ── */
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, [docId]);

  /* ── Loading state ── */
  if (!isLoaded) {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="flex h-full flex-col"
      >
        {/* Title skeleton */}
        <div className="border-b border-[var(--color-border)] px-12 py-4">
          <Skeleton className="h-9 w-72" />
        </div>
        {/* Toolbar skeleton */}
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} className="size-7 rounded" />
          ))}
        </div>
        {/* Content skeleton */}
        <div className="flex-1 overflow-y-auto bg-[var(--color-bg-elevated)] p-12">
          <div className="mx-auto max-w-[860px] space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-32 mt-6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col"
    >
      {/* ── Editor fills remaining space (no extra header — AppShell provides it) ── */}
      <DocsEditor
        docId={docId}
        initialContent={content}
        initialTitle={file?.name || 'Untitled Document'}
      />
    </motion.div>
  );
}
