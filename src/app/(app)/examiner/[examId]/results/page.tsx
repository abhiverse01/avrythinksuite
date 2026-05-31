'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, BarChart3, CheckCircle2, Download, ClipboardCheck,
  FileText, Clock, ChevronDown, ChevronUp, Search, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { cn, formatDate, formatTime } from '@/lib/utils';

/* ── Types ── */
interface Submission {
  id: string;
  respondent_name: string;
  respondent_email: string;
  score: number | null;
  totalPoints: number;
  submitted_at: string;
}

interface QuestionStat {
  questionId: string;
  questionText: string;
  questionType: string;
  totalResponses: number;
  correctResponses: number;
  correctPercentage: number;
  optionBreakdown?: { label: string; count: number; percentage: number }[];
}

/* ── Mock Data ── */
const MOCK_EXAM_TITLE = 'Introduction to Web Development';

const MOCK_SUBMISSIONS: Submission[] = [
  { id: 'sub-001', respondent_name: 'Emily Zhang', respondent_email: 'emily.z@university.edu', score: 9, totalPoints: 10, submitted_at: '2025-01-15T14:32:00Z' },
  { id: 'sub-002', respondent_name: 'Marcus Johnson', respondent_email: 'marcus.j@techcorp.io', score: 8, totalPoints: 10, submitted_at: '2025-01-15T13:45:00Z' },
  { id: 'sub-003', respondent_name: 'Sarah Mitchell', respondent_email: 'sarah.m@designlab.co', score: 10, totalPoints: 10, submitted_at: '2025-01-14T22:18:00Z' },
  { id: 'sub-004', respondent_name: 'David Park', respondent_email: 'david.park@inbox.dev', score: 7, totalPoints: 10, submitted_at: '2025-01-14T18:05:00Z' },
  { id: 'sub-005', respondent_name: 'Olivia Brown', respondent_email: 'olivia.b@school.edu', score: null, totalPoints: 10, submitted_at: '2025-01-14T11:20:00Z' },
  { id: 'sub-006', respondent_name: 'James Wilson', respondent_email: 'james.w@college.edu', score: 6, totalPoints: 10, submitted_at: '2025-01-13T16:50:00Z' },
  { id: 'sub-007', respondent_name: 'Sophia Lee', respondent_email: 'sophia.l@university.edu', score: 9, totalPoints: 10, submitted_at: '2025-01-13T09:15:00Z' },
  { id: 'sub-008', respondent_name: 'Liam Chen', respondent_email: 'liam.c@techcorp.io', score: 8, totalPoints: 10, submitted_at: '2025-01-12T20:30:00Z' },
];

const MOCK_QUESTION_STATS: QuestionStat[] = [
  {
    questionId: 'q1', questionText: 'Which HTML element defines the largest heading?', questionType: 'multiple_choice',
    totalResponses: 8, correctResponses: 7, correctPercentage: 88,
    optionBreakdown: [
      { label: '<heading>', count: 0, percentage: 0 },
      { label: '<h6>', count: 1, percentage: 12 },
      { label: '<h1>', count: 7, percentage: 88 },
      { label: '<head>', count: 0, percentage: 0 },
    ],
  },
  {
    questionId: 'q2', questionText: 'What CSS property changes text color?', questionType: 'short_answer',
    totalResponses: 8, correctResponses: 6, correctPercentage: 75,
  },
  {
    questionId: 'q3', questionText: 'JavaScript is the same as Java.', questionType: 'true_false',
    totalResponses: 8, correctResponses: 8, correctPercentage: 100,
    optionBreakdown: [
      { label: 'True', count: 0, percentage: 0 },
      { label: 'False', count: 8, percentage: 100 },
    ],
  },
];

/* ── Animation ── */
const pageVariants = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } } };
const statVariants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <motion.div variants={statVariants}>
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <CardContent className="flex items-center gap-4 p-4 sm:p-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
            <Icon size={20} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{value}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{label}{sub && <span className="ml-1 text-[var(--color-text-tertiary)]">({sub})</span>}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════
   RESULTS DASHBOARD
   ════════════════════════════════════════════════════ */

export default function ExamResultsPage() {
  const params = useParams();
  const examId = params.examId as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('responses');

  const submissions = MOCK_SUBMISSIONS;
  const questionStats = MOCK_QUESTION_STATS;

  /* Stats */
  const stats = useMemo(() => {
    const totalCount = submissions.length;
    const scoredSubs = submissions.filter((s) => s.score !== null);
    const avgScore = scoredSubs.length > 0
      ? Math.round(scoredSubs.reduce((sum, s) => sum + (s.score as number), 0) / scoredSubs.length)
      : 0;
    const completionRate = Math.round((totalCount / 12) * 100);
    const highestScore = scoredSubs.length > 0 ? Math.max(...scoredSubs.map((s) => s.score as number)) : 0;
    return { totalCount, avgScore, completionRate, highestScore };
  }, [submissions]);

  /* Filter */
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return submissions.filter(
      (s) => s.respondent_name.toLowerCase().includes(q) || s.respondent_email.toLowerCase().includes(q)
    );
  }, [submissions, searchQuery]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()),
    [filtered]
  );

  /* CSV Export */
  const handleExportCSV = () => {
    const headers = ['#', 'Name', 'Email', 'Score', 'Total', 'Submitted At'];
    const rows = sorted.map((s, i) => [
      i + 1, s.respondent_name, s.respondent_email,
      s.score !== null ? `${s.score}/${s.totalPoints}` : 'Pending',
      new Date(s.submitted_at).toISOString(),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${MOCK_EXAM_TITLE.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
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
            <BreadcrumbLink asChild>
              <Link href={`/examiner/${examId}`} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] truncate max-w-[200px]">{MOCK_EXAM_TITLE}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Results</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">Results</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Review submissions for &ldquo;{MOCK_EXAM_TITLE}&rdquo;
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download size={16} strokeWidth={2} className="mr-2" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <motion.div initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Responses" value={stats.totalCount} />
        <StatCard icon={BarChart3} label="Average Score" value={`${stats.avgScore}%`} />
        <StatCard icon={CheckCircle2} label="Highest Score" value={`${stats.highestScore}/${10}`} />
        <StatCard icon={CheckCircle2} label="Completion Rate" value={`${stats.completionRate}%`} sub="12 invited" />
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="responses">
            Responses <Badge variant="secondary" className="ml-1.5 text-[10px]">{submissions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics">Question Analytics</TabsTrigger>
        </TabsList>

        {/* ── Responses Tab ── */}
        <TabsContent value="responses" className="mt-6">
          {/* Search */}
          <div className="relative mb-4 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 h-9 text-sm"
            />
          </div>

          {sorted.length > 0 ? (
            <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[var(--color-border)] hover:bg-transparent">
                      <TableHead className="w-12 text-[var(--color-text-secondary)]">#</TableHead>
                      <TableHead className="text-[var(--color-text-secondary)]">Name</TableHead>
                      <TableHead className="text-[var(--color-text-secondary)] hidden sm:table-cell">Email</TableHead>
                      <TableHead className="text-[var(--color-text-secondary)]">Score</TableHead>
                      <TableHead className="text-[var(--color-text-secondary)] hidden md:table-cell">Submitted</TableHead>
                      <TableHead className="text-[var(--color-text-secondary)] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((sub, idx) => (
                      <TableRow key={sub.id} className="border-b border-[var(--color-border)]/50">
                        <TableCell className="text-[var(--color-text-tertiary)] font-medium">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-[10px] font-bold text-[var(--color-accent)]">
                              {sub.respondent_name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{sub.respondent_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-[var(--color-text-secondary)] text-sm">{sub.respondent_email}</TableCell>
                        <TableCell>
                          {sub.score !== null ? (
                            <Badge variant="secondary" className={cn('font-mono', sub.score >= 9 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : sub.score >= 7 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200')}>
                              {sub.score}/{sub.totalPoints}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[var(--color-text-tertiary)]">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-[var(--color-text-secondary)] text-sm">
                          <div className="flex items-center gap-1.5"><Clock size={12} />{formatDate(sub.submitted_at)}, {formatTime(sub.submitted_at)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-[var(--color-accent)]">
                            <FileText size={14} className="mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                <ClipboardCheck size={32} className="text-[var(--color-text-tertiary)] mb-3" />
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">No submissions found</h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {searchQuery ? 'Try a different search term.' : 'Share the exam link to start collecting submissions.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Analytics Tab ── */}
        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-3">
            {questionStats.map((qs, idx) => (
              <Card key={qs.questionId} className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden">
                <CardContent className="p-0">
                  {/* Question header */}
                  <button
                    onClick={() => toggleQuestion(qs.questionId)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--color-bg-overlay)] transition-colors"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-[10px] font-bold text-[var(--color-accent)]">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{qs.questionText}</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
                        {qs.questionType.replace(/_/g, ' ')} • {qs.totalResponses} responses
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className={cn('text-sm font-semibold', qs.correctPercentage >= 80 ? 'text-emerald-600' : qs.correctPercentage >= 60 ? 'text-amber-600' : 'text-red-600')}>
                          {qs.correctPercentage}%
                        </p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">correct</p>
                      </div>
                      <div className="w-16 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', qs.correctPercentage >= 80 ? 'bg-emerald-500' : qs.correctPercentage >= 60 ? 'bg-amber-500' : 'bg-red-500')}
                          style={{ width: `${qs.correctPercentage}%` }}
                        />
                      </div>
                      {expandedQuestions.has(qs.questionId) ? <ChevronUp size={14} className="text-[var(--color-text-tertiary)]" /> : <ChevronDown size={14} className="text-[var(--color-text-tertiary)]" />}
                    </div>
                  </button>

                  {/* Option breakdown (expandable) */}
                  {expandedQuestions.has(qs.questionId) && qs.optionBreakdown && (
                    <div className="px-5 pb-4 pt-2 border-t border-[var(--color-border)]/50">
                      <div className="space-y-2">
                        {qs.optionBreakdown.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-3">
                            <span className="text-xs text-[var(--color-text-secondary)] w-24 truncate shrink-0">{opt.label}</span>
                            <div className="flex-1 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                                style={{ width: `${opt.percentage}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-[var(--color-text-tertiary)] w-16 text-right shrink-0">
                              {opt.count} ({opt.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
