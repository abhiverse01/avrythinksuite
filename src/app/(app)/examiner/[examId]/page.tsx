'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, BarChart3, ClipboardCheck, ChevronRight, Settings, Edit, Trash2, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from '@/components/ui/breadcrumb';

/* ── Animation ── */
const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

/* ── Mock Data ── */
const MOCK_EXAM = {
  id: 'exam-001',
  title: 'Introduction to Web Development',
  description: 'A foundational assessment covering HTML, CSS, and JavaScript concepts.',
  isPublished: true,
  share_token: 'a1b2c3d4e5f6',
  questions: [],
  settings: {
    timeLimit: 30,
    shuffleQuestions: false,
    showResults: true,
    allowRetake: false,
  },
  created_at: '2025-01-10T10:00:00Z',
  updated_at: '2025-01-15T14:30:00Z',
  totalSubmissions: 5,
  avgScore: 82,
};

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/exam/${MOCK_EXAM.share_token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="pb-16 pt-8 px-6 sm:px-10"
    >
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/examiner" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Examiner</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate max-w-[200px]">{MOCK_EXAM.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              {MOCK_EXAM.title}
            </h1>
            {MOCK_EXAM.isPublished ? (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Published</Badge>
            ) : (
              <Badge variant="outline" className="text-[var(--color-text-tertiary)] text-xs">Draft</Badge>
            )}
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">{MOCK_EXAM.description}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" size="sm" onClick={() => router.push(`/examiner/create?edit=${examId}`)}>
          <Edit size={14} className="mr-1.5" /> Edit
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          {copied ? <ClipboardCheck size={14} className="mr-1.5" /> : <Share2 size={14} className="mr-1.5" />}
          {copied ? 'Copied!' : 'Share'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="results">
            Results <Badge variant="secondary" className="ml-1 text-[10px]">{MOCK_EXAM.totalSubmissions}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                  <Users size={20} strokeWidth={1.5} />
                </div>
                <div><p className="text-2xl font-semibold text-[var(--color-text-primary)]">{MOCK_EXAM.totalSubmissions}</p><p className="text-xs text-[var(--color-text-secondary)]">Total Responses</p></div>
              </CardContent>
            </Card>
            <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <BarChart3 size={20} strokeWidth={1.5} />
                </div>
                <div><p className="text-2xl font-semibold text-[var(--color-text-primary)]">{MOCK_EXAM.avgScore}%</p><p className="text-xs text-[var(--color-text-secondary)]">Average Score</p></div>
              </CardContent>
            </Card>
            <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ClipboardCheck size={20} strokeWidth={1.5} />
                </div>
                <div><p className="text-2xl font-semibold text-[var(--color-text-primary)]">{MOCK_EXAM.settings.timeLimit || '—'}</p><p className="text-xs text-[var(--color-text-secondary)]">Time Limit (min)</p></div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Summary */}
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <Settings size={14} /> Exam Settings
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[var(--color-border)]/50">
                  <span className="text-[var(--color-text-secondary)]">Time Limit</span>
                  <span className="text-[var(--color-text-primary)]">{MOCK_EXAM.settings.timeLimit ? `${MOCK_EXAM.settings.timeLimit} min` : 'None'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--color-border)]/50">
                  <span className="text-[var(--color-text-secondary)]">Shuffle</span>
                  <span className="text-[var(--color-text-primary)]">{MOCK_EXAM.settings.shuffleQuestions ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--color-border)]/50">
                  <span className="text-[var(--color-text-secondary)]">Show Results</span>
                  <span className="text-[var(--color-text-primary)]">{MOCK_EXAM.settings.showResults ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--color-border)]/50">
                  <span className="text-[var(--color-text-secondary)]">Allow Retake</span>
                  <span className="text-[var(--color-text-primary)]">{MOCK_EXAM.settings.allowRetake ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="mt-6">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">Edit questions in the exam creator.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push(`/examiner/create?edit=${examId}`)}>
                <Edit size={14} className="mr-1.5" /> Edit Questions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={() => router.push(`/examiner/${examId}/results`)}>
              View All Results <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <ClipboardCheck size={32} className="text-[var(--color-text-tertiary)] mb-3" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                {MOCK_EXAM.totalSubmissions} submissions collected
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.push(`/examiner/${examId}/results`)}>
                View Detailed Results <ChevronRight size={14} className="ml-1" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
