'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Save, Send, Copy, Check, ChevronRight,
  Eye, Settings, ListChecks, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn, generateId } from '@/lib/utils';
import type { ExamQuestion, QuestionType, ExamSettings } from '@/lib/types';
import {
  QuestionEditorWrapper,
  createDefaultQuestion,
  QUESTION_TYPE_CONFIG,
} from '@/components/examiner/question-editors';

/* ── Animation ── */

const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const questionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/* ════════════════════════════════════════════════════
   EXAM CREATOR PAGE
   ════════════════════════════════════════════════════ */

export default function ExamCreatePage() {
  const router = useRouter();

  /* ── Exam State ── */
  const [title, setTitle] = useState('Introduction to Web Development');
  const [description, setDescription] = useState(
    'A foundational assessment covering HTML, CSS, and JavaScript concepts for entry-level developers.'
  );
  const [questions, setQuestions] = useState<ExamQuestion[]>(() => [
    createDefaultQuestion('multiple_choice'),
    createDefaultQuestion('true_false'),
    createDefaultQuestion('short_answer'),
  ]);

  const [settings, setSettings] = useState<ExamSettings>({
    timeLimit: 30,
    shuffleQuestions: false,
    showResults: true,
    allowRetake: false,
    maxAttempts: null,
    showCorrectAnswers: true,
    requireName: true,
    requireEmail: true,
  });

  const [isPublished, setIsPublished] = useState(false);
  const [shareToken, setShareToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [collapsedQuestions, setCollapsedQuestions] = useState<Set<string>>(new Set());

  /* ── Question CRUD ── */

  const addQuestion = useCallback((type?: QuestionType) => {
    setQuestions((prev) => [...prev, createDefaultQuestion(type || 'multiple_choice')]);
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setCollapsedQuestions((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<ExamQuestion>) => {
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, ...updates } : q));
  }, []);

  const duplicateQuestion = useCallback((id: string) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: generateId(), options: prev[idx].options?.map((o) => ({ ...o, id: generateId() })) };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, []);

  const moveQuestion = useCallback((index: number, direction: 'up' | 'down') => {
    setQuestions((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedQuestions((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  /* ── Computed ── */

  const gradableQuestions = questions.filter((q) => q.type !== 'section_header');
  const totalPoints = gradableQuestions.reduce((sum, q) => sum + q.points, 0);

  /* ── Publish ── */

  const handleSaveDraft = () => {
    /* Mock save */
  };

  const handlePublish = () => {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setShareToken(token);
    setIsPublished(true);
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/exam/${shareToken}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  /* ── Render ── */

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="pb-32"
    >
      {/* Breadcrumb */}
      <div className="px-6 pt-6 pb-2 sm:px-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/examiner" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                  Examiner
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Exam</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-8">
        {/* Title */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Exam"
          className="text-xl font-semibold border-0 border-b-0 bg-transparent rounded-none px-0 h-auto py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:ring-0 focus-visible:border-0"
        />

        {/* Description */}
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={2}
          className="mt-2 border-0 bg-transparent rounded-none px-0 resize-none text-[var(--color-text-secondary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:ring-0 focus-visible:border-0"
        />

        <Separator className="my-8 bg-[var(--color-border)]" />

        {/* Tabs: Questions / Settings */}
        <Tabs defaultValue="questions">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="questions">
                <ListChecks size={14} className="mr-1.5" />
                Questions
                <Badge variant="secondary" className="ml-1.5 text-[10px]">{questions.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings size={14} className="mr-1.5" />
                Settings
              </TabsTrigger>
            </TabsList>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus size={14} strokeWidth={2} className="mr-1.5" />
                  Add Question
                  <ChevronDown size={12} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {QUESTION_TYPE_CONFIG.map((qt) => (
                  <DropdownMenuItem
                    key={qt.value}
                    onClick={() => addQuestion(qt.value)}
                  >
                    <qt.icon size={14} className="mr-2 text-[var(--color-text-tertiary)]" />
                    {qt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ── Questions Tab ── */}
          <TabsContent value="questions" className="mt-0">
            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-xs text-[var(--color-text-secondary)]">
              <span>{gradableQuestions.length} gradable questions</span>
              <span className="text-[var(--color-text-tertiary)]">•</span>
              <span>{totalPoints} total points</span>
            </div>

            {/* Questions List */}
            <AnimatePresence mode="popLayout">
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  variants={questionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="mb-4"
                >
                  <QuestionEditorWrapper
                    question={question}
                    index={index}
                    onUpdate={(updates) => updateQuestion(question.id, updates)}
                    onDelete={() => removeQuestion(question.id)}
                    onDuplicate={() => duplicateQuestion(question.id)}
                    onMoveUp={() => moveQuestion(index, 'up')}
                    onMoveDown={() => moveQuestion(index, 'down')}
                    isFirst={index === 0}
                    isLast={index === questions.length - 1}
                    isCollapsed={collapsedQuestions.has(question.id)}
                    onToggleCollapse={() => toggleCollapse(question.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {questions.length === 0 && (
              <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4">No questions yet. Add your first question.</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button><Plus size={14} className="mr-1.5" /> Add Question</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-52">
                      {QUESTION_TYPE_CONFIG.map((qt) => (
                        <DropdownMenuItem key={qt.value} onClick={() => addQuestion(qt.value)}>
                          <qt.icon size={14} className="mr-2 text-[var(--color-text-tertiary)]" />
                          {qt.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Settings Tab ── */}
          <TabsContent value="settings" className="mt-0">
            <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              <CardContent className="p-6 space-y-5">
                {/* Time limit */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium text-[var(--color-text-primary)]">Time limit</Label>
                    <p className="text-xs text-[var(--color-text-tertiary)]">Set a maximum duration for the exam</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={settings.timeLimit !== null}
                      onCheckedChange={(checked) => setSettings((s) => ({ ...s, timeLimit: checked ? 30 : null }))}
                    />
                    {settings.timeLimit !== null && (
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number" min={1} max={180}
                          value={settings.timeLimit}
                          onChange={(e) => setSettings((s) => ({ ...s, timeLimit: Math.max(1, Math.min(180, Number(e.target.value) || 1)) }))}
                          className="w-16 h-8 text-center text-sm"
                        />
                        <span className="text-xs text-[var(--color-text-secondary)]">min</span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator className="bg-[var(--color-border)]" />

                {/* Shuffle */}
                <div className="flex items-center justify-between gap-4">
                  <div><Label className="text-sm font-medium text-[var(--color-text-primary)]">Shuffle questions</Label><p className="text-xs text-[var(--color-text-tertiary)]">Randomize question order for each respondent</p></div>
                  <Switch checked={settings.shuffleQuestions} onCheckedChange={(c) => setSettings((s) => ({ ...s, shuffleQuestions: c }))} />
                </div>
                <Separator className="bg-[var(--color-border)]" />

                {/* Show results */}
                <div className="flex items-center justify-between gap-4">
                  <div><Label className="text-sm font-medium text-[var(--color-text-primary)]">Show results to respondents</Label><p className="text-xs text-[var(--color-text-tertiary)]">Display the score after submission</p></div>
                  <Switch checked={settings.showResults} onCheckedChange={(c) => setSettings((s) => ({ ...s, showResults: c }))} />
                </div>
                <Separator className="bg-[var(--color-border)]" />

                {/* Show correct answers */}
                <div className="flex items-center justify-between gap-4">
                  <div><Label className="text-sm font-medium text-[var(--color-text-primary)]">Show correct answers</Label><p className="text-xs text-[var(--color-text-tertiary)]">Reveal correct answers after submission</p></div>
                  <Switch checked={settings.showCorrectAnswers} onCheckedChange={(c) => setSettings((s) => ({ ...s, showCorrectAnswers: c }))} />
                </div>
                <Separator className="bg-[var(--color-border)]" />

                {/* Allow retake */}
                <div className="flex items-center justify-between gap-4">
                  <div><Label className="text-sm font-medium text-[var(--color-text-primary)]">Allow retake</Label><p className="text-xs text-[var(--color-text-tertiary)]">Let respondents submit multiple times</p></div>
                  <Switch checked={settings.allowRetake} onCheckedChange={(c) => setSettings((s) => ({ ...s, allowRetake: c }))} />
                </div>
                <Separator className="bg-[var(--color-border)]" />

                {/* Require name */}
                <div className="flex items-center justify-between gap-4">
                  <div><Label className="text-sm font-medium text-[var(--color-text-primary)]">Require name</Label><p className="text-xs text-[var(--color-text-tertiary)]">Ask for respondent name before starting</p></div>
                  <Switch checked={settings.requireName} onCheckedChange={(c) => setSettings((s) => ({ ...s, requireName: c }))} />
                </div>
                <Separator className="bg-[var(--color-border)]" />

                {/* Require email */}
                <div className="flex items-center justify-between gap-4">
                  <div><Label className="text-sm font-medium text-[var(--color-text-primary)]">Require email</Label><p className="text-xs text-[var(--color-text-tertiary)]">Ask for respondent email before starting</p></div>
                  <Switch checked={settings.requireEmail} onCheckedChange={(c) => setSettings((s) => ({ ...s, requireEmail: c }))} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Published State */}
        <AnimatePresence>
          {isPublished && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="mt-6"
            >
              <Card className="rounded-xl border-[var(--color-success)] bg-emerald-50">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Check size={20} className="text-[var(--color-success)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-900">Exam published successfully!</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="text-xs bg-white/80 px-2 py-1 rounded border border-emerald-200 text-emerald-700 truncate max-w-[260px]">
                        /exam/{shareToken}
                      </code>
                      <Button variant="outline" size="sm" onClick={handleCopyLink} className="h-7 text-xs shrink-0">
                        {copied ? <Check size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
                        {copied ? 'Copied' : 'Copy Link'}
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/examiner/${shareToken}`)}>
                    View Results <ChevronRight size={14} className="ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Actions Bar */}
      <div className="sticky bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg-base)]/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isPublished}>
            <Save size={16} strokeWidth={2} className="mr-2" /> Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={isPublished || !title.trim() || gradableQuestions.length === 0}>
            <Send size={16} strokeWidth={2} className="mr-2" /> Publish
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
