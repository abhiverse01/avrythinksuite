'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Presentation, Plus, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';
import { FileCard } from '@/components/app/FileCard';
import { EmptyState } from '@/components/app/EmptyState';
import { useFileStore } from '@/stores/file-store';
import { cn } from '@/lib/utils';
import type { FilterPreset, SortField, ViewMode, FileItem } from '@/lib/types';

/* ── Animation ── */

const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const gridVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-[180px] rounded-xl bg-[var(--color-bg-elevated)]" />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SLIDES LIST PAGE
   ════════════════════════════════════════════════════ */

export default function SlidesPage() {
  const router = useRouter();
  const { recentFiles, isLoading, createFile } = useFileStore();

  const [filter, setFilter] = useState<FilterPreset>('all');
  const [sort, setSort] = useState<SortField>('updated_at');
  const [view, setView] = useState<ViewMode>('grid');

  const files = useMemo(() => {
    let result = recentFiles.filter((f: FileItem) => f.type === 'slide');

    if (filter === 'mine') result = result.filter((f: FileItem) => f.owner_id === 'usr-1');
    else if (filter === 'shared') result = result.filter((f: FileItem) => f.org_id !== null);
    else if (filter === 'starred') result = result.filter((f: FileItem) => f.is_starred);

    result.sort((a: FileItem, b: FileItem) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return result;
  }, [recentFiles, filter, sort]);

  const handleCreate = () => {
    const file = createFile({
      name: 'Untitled Presentation',
      type: 'slide',
      owner_id: 'usr-1',
      org_id: null,
      parent_id: null,
    });
    router.push(`/slides/${file.id}`);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="pb-16 pt-8 px-6 sm:px-10"
    >
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Slides
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Design beautiful presentations and pitch decks
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={16} strokeWidth={2} />
          New Presentation
        </Button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterPreset)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mine">Mine</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={sort} onValueChange={(v) => setSort(v as SortField)}>
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Modified</SelectItem>
            <SelectItem value="created_at">Created</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as ViewMode)}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid size={16} strokeWidth={1.5} />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List size={16} strokeWidth={1.5} />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <SkeletonGrid />
      ) : files.length === 0 ? (
        <EmptyState
          icon={Presentation}
          title="No presentations yet"
          description="Create your first presentation to share your ideas and tell compelling stories."
          actionLabel="New Presentation"
          onAction={handleCreate}
        />
      ) : (
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className={cn(
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'flex flex-col gap-3'
          )}
        >
          {files.map((file: FileItem) => (
            <motion.div key={file.id} variants={itemVariants}>
              <FileCard file={file} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
