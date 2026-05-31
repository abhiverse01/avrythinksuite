'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Plus, LayoutGrid, List, Users, TrendingUp, Library } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { FileCard } from '@/components/app/FileCard';
import { EmptyState } from '@/components/app/EmptyState';
import { QuestionBank, type QuestionBankItem } from '@/components/examiner/QuestionBank';
import { ExamDuplicateButton } from '@/components/examiner/ExamDuplicateButton';
import { useFileStore } from '@/stores/file-store';
import { cn } from '@/lib/utils';
import type { FilterPreset, SortField, ViewMode, FileItem, ExamQuestion } from '@/lib/types';

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

const statVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
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

/* ── Stat Card ── */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <motion.div variants={statVariants}>
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
            <Icon size={20} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{value}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Exam Card with Actions ── */

function ExamCardWithActions({ file }: { file: FileItem }) {
  return (
    <div className="relative group">
      <FileCard file={file} />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <ExamDuplicateButton
          exam={{
            id: file.id,
            title: file.name,
            type: file.type,
            owner_id: file.owner_id,
            org_id: file.org_id,
            parent_id: file.parent_id,
          }}
        />
      </div>
    </div>
  );
}

/* ── Build mock question bank from exam files ── */

function buildQuestionBank(examFiles: FileItem[]): QuestionBankItem[] {
  const bank: QuestionBankItem[] = [];
  examFiles.forEach((file) => {
    const content = file.content as Record<string, unknown> | undefined;
    const questions = (content?.questions as ExamQuestion[]) || [];
    questions.forEach((q) => {
      if (q.type === 'section_header') return;
      // Check if already in bank
      const exists = bank.find((b) => b.question.text === q.text && b.question.type === q.type);
      if (exists) {
        exists.usedInExams += 1;
      } else {
        bank.push({
          question: q,
          createdAt: file.created_at,
          usedInExams: 1,
          sourceExamId: file.id,
          sourceExamName: file.name,
        });
      }
    });
  });
  return bank;
}

/* ════════════════════════════════════════════════════
   EXAMINER DASHBOARD
   ════════════════════════════════════════════════════ */

export default function ExaminerPage() {
  const router = useRouter();
  const { recentFiles, isLoading, createFile, updateFileContent } = useFileStore();

  const [mainTab, setMainTab] = useState<'exams' | 'bank'>('exams');
  const [filter, setFilter] = useState<FilterPreset>('all');
  const [sort, setSort] = useState<SortField>('updated_at');
  const [view, setView] = useState<ViewMode>('grid');

  const files = useMemo(() => {
    let result = recentFiles.filter((f: FileItem) => f.type === 'exam');

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

  /* Question Bank from exam files */
  const questionBankItems = useMemo(() => buildQuestionBank(files), [files]);

  /* Mock stats */
  const totalExams = files.length;
  const totalSubmissions = 47;
  const avgScore = 82;

  const handleCreate = () => {
    const file = createFile({
      name: 'Untitled Exam',
      type: 'exam',
      owner_id: 'usr-1',
      org_id: null,
      parent_id: null,
    });
    router.push(`/examiner/${file.id}`);
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
            Examiner
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Create assessments, collect submissions, and analyze results
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={16} strokeWidth={2} />
          New Exam
        </Button>
      </div>

      {/* ── Stats Row ── */}
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        <StatCard icon={ClipboardCheck} label="Total Exams" value={totalExams} />
        <StatCard icon={Users} label="Total Submissions" value={totalSubmissions} />
        <StatCard icon={TrendingUp} label="Average Score" value={`${avgScore}%`} />
      </motion.div>

      {/* ── Main Tabs: Exams / Question Bank ── */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'exams' | 'bank')} className="mb-6">
        <TabsList>
          <TabsTrigger value="exams" className="gap-1.5">
            <ClipboardCheck size={14} />
            Exams
          </TabsTrigger>
          <TabsTrigger value="bank" className="gap-1.5">
            <Library size={14} />
            Question Bank
            {questionBankItems.length > 0 && (
              <span className="ml-1 text-[10px] bg-[#FF3333]/10 text-[#FF3333] px-1.5 py-0.5 rounded-full">
                {questionBankItems.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        {mainTab === 'exams' ? (
          <motion.div
            key="exams"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
          >
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
                icon={ClipboardCheck}
                title="No exams yet"
                description="Create your first exam to start assessing knowledge and collecting responses."
                actionLabel="New Exam"
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
                    <ExamCardWithActions file={file} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="bank"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden" style={{ height: 'calc(100vh - 380px)', minHeight: 400 }}>
              <QuestionBank
                items={questionBankItems}
                onAddFromBank={(questions) => {
                  toast.success(`Added ${questions.length} question${questions.length > 1 ? 's' : ''} to new exam`);
                  const file = createFile({
                    name: 'Untitled Exam',
                    type: 'exam',
                    owner_id: 'usr-1',
                    org_id: null,
                    parent_id: null,
                  });
                  updateFileContent(file.id, {
                    title: 'Untitled Exam',
                    description: '',
                    questions: questions.map((q) => ({ ...q, id: Math.random().toString(36).substring(2, 15) })),
                    settings: {
                      timeLimit: null,
                      shuffleQuestions: false,
                      showResults: true,
                      allowRetake: true,
                      maxAttempts: null,
                      showCorrectAnswers: false,
                      requireName: true,
                      requireEmail: false,
                    },
                    share_token: Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18),
                    isPublished: false,
                  });
                  router.push(`/examiner/${file.id}`);
                }}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
