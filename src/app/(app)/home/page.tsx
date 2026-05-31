'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, FileText, ChevronRight, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { useFileStore } from '@/stores/file-store';
import { getGreeting, cn } from '@/lib/utils';
import { QuickCreateBar } from '@/components/app/QuickCreateBar';
import { FileCard } from '@/components/app/FileCard';
import { EmptyState } from '@/components/app/EmptyState';
import type { FileItem } from '@/lib/types';

/* ── Animation variants ── */

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/* ── Mock shared files ── */

const MOCK_SHARED_FILES: FileItem[] = [
  {
    id: 'shared-1',
    name: 'Design System Guidelines',
    type: 'doc',
    content: {},
    owner_id: 'usr-shared-1',
    org_id: 'org-1',
    parent_id: null,
    is_deleted: false,
    is_starred: false,
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    owner: {
      id: 'usr-shared-1',
      email: 'sarah@avrythink.io',
      full_name: 'Sarah Chen',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'shared-2',
    name: 'Quarterly Revenue Report',
    type: 'sheet',
    content: {},
    owner_id: 'usr-shared-2',
    org_id: 'org-1',
    parent_id: null,
    is_deleted: false,
    is_starred: false,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    owner: {
      id: 'usr-shared-2',
      email: 'marcus@avrythink.io',
      full_name: 'Marcus Johnson',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'shared-3',
    name: 'Brand Identity Presentation',
    type: 'slide',
    content: {},
    owner_id: 'usr-shared-3',
    org_id: null,
    parent_id: null,
    is_deleted: false,
    is_starred: false,
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    owner: {
      id: 'usr-shared-3',
      email: 'aiko@avrythink.io',
      full_name: 'Aiko Tanaka',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'shared-4',
    name: 'Q3 Product Roadmap',
    type: 'canvas',
    content: {},
    owner_id: 'usr-shared-4',
    org_id: 'org-1',
    parent_id: null,
    is_deleted: false,
    is_starred: false,
    created_at: new Date(Date.now() - 96 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    owner: {
      id: 'usr-shared-4',
      email: 'lena@avrythink.io',
      full_name: 'Lena Morales',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

/* ── Stat card ── */

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' as const }}
      className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 transition-shadow duration-200 hover:shadow-[var(--shadow-sm)]"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tabular-nums text-[var(--color-text-primary)]">
          {value}
        </p>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-[var(--color-text-tertiary)]">{label}</p>
          {trend && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-[var(--color-success)]">
              <TrendingUp size={10} strokeWidth={2} />
              {trend}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Section header ── */

function SectionHeader({
  title,
  icon: Icon,
  action,
}: {
  title: string;
  icon?: React.ElementType;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            size={18}
            strokeWidth={1.5}
            className="text-[var(--color-accent)]"
          />
        )}
        <h2 className="text-lg font-medium text-[var(--color-text-primary)]">
          {title}
        </h2>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'flex items-center gap-1 text-sm text-[var(--color-text-secondary)]',
            'hover:text-[var(--color-text-primary)] transition-colors duration-150',
          )}
        >
          {action.label}
          <ChevronRight size={14} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   HOME PAGE — Personal Dashboard
   ════════════════════════════════════════════════════ */

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { recentFiles, starredFiles, createFile } = useFileStore();

  // Sort recent files by updated_at descending, take first 8
  const displayRecentFiles = useMemo(() => {
    return [...recentFiles]
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
      .slice(0, 8);
  }, [recentFiles]);

  // Format today's date
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Greeting
  const greeting = useMemo(() => {
    if (!user) return 'Welcome';
    return getGreeting(user.full_name ?? undefined);
  }, [user]);

  return (
    <div className="px-6 pb-16 pt-8 sm:px-10">
      {/* ── Greeting ── */}
      <section className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' as const }}
        >
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
            {greeting}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {formattedDate}
          </p>
        </motion.div>
      </section>

      {/* ── Quick Stats ── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        <StatCard icon={FileText} label="Total files" value={String(recentFiles.length)} trend="+3 this week" />
        <StatCard icon={Users} label="Shared with me" value={String(MOCK_SHARED_FILES.length)} />
        <StatCard icon={BarChart3} label="Starred" value={String(starredFiles.length)} />
      </div>

      {/* ── Quick Create Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' as const }}
      >
        <QuickCreateBar className="mt-2" />
      </motion.div>

      {/* ── Recent Files ── */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mt-8"
      >
        <SectionHeader
          title="Recent"
          action={{ label: 'See all', onClick: () => router.push('/docs') }}
        />

        {displayRecentFiles.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No files yet"
            description="Create your first document to get started"
            actionLabel="Create a document"
            onAction={() => {
              const f = createFile({
                name: 'Untitled Document',
                type: 'doc',
                owner_id: user?.id ?? 'usr-1',
                org_id: null,
                parent_id: null,
              });
              router.push(`/docs/${f.id}`);
            }}
          />
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {displayRecentFiles.map((file) => (
              <motion.div key={file.id} variants={cardVariants}>
                <FileCard file={file} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* ── Starred Files ── */}
      {starredFiles.length > 0 && (
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-10"
        >
          <SectionHeader title="Starred" icon={Star} />

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {starredFiles.map((file) => (
              <motion.div key={file.id} variants={cardVariants}>
                <FileCard file={file} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* ── Shared with me ── */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-50px' }}
        className="mt-10"
      >
        <SectionHeader title="Shared with me" />

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {MOCK_SHARED_FILES.map((file) => (
            <motion.div key={file.id} variants={cardVariants}>
              <FileCard file={file} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
}
