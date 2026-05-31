'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ArrowLeft, User, Mail, Clock, Star,
  ChevronUp, ChevronDown, AlertTriangle, Upload, GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn, isValidEmail, generateId } from '@/lib/utils';
import type { ExamQuestion, QuestionType } from '@/lib/types';

/* ── Types ── */
type ExamPhase = 'intro' | 'exam' | 'submitted';

/* ── Mock Exam with ALL question types ── */
const MOCK_EXAM = {
  id: 'demo-exam-001',
  title: 'Introduction to Web Development',
  description: 'A comprehensive assessment covering HTML, CSS, JavaScript, and general web development concepts. This exam tests multiple question formats.',
  showResults: true,
  showCorrectAnswers: true,
  timeLimit: 45,
  settings: {
    shuffleQuestions: false,
    showResults: true,
    showCorrectAnswers: true,
  },
  questions: [
    {
      id: generateId(), type: 'section_header' as QuestionType, text: '',
      sectionTitle: 'Part 1: Fundamentals',
      sectionDescription: 'Basic web development knowledge',
      points: 0, required: false,
    },
    {
      id: generateId(), type: 'multiple_choice' as QuestionType, text: 'Which HTML element is used to define the largest heading?',
      options: [
        { id: 'o1', text: '<heading>' },
        { id: 'o2', text: '<h6>' },
        { id: 'o3', text: '<h1>' },
        { id: 'o4', text: '<head>' },
      ],
      correctAnswer: 'C', points: 1, required: true,
    },
    {
      id: generateId(), type: 'true_false' as QuestionType, text: 'JavaScript is the same language as Java.',
      correctAnswer: 'false', points: 1, required: true,
    },
    {
      id: generateId(), type: 'short_answer' as QuestionType, text: 'What CSS property is used to change the text color of an element?',
      maxLength: 200, correctAnswer: 'color', points: 1, required: true,
    },
    {
      id: generateId(), type: 'multiple_select' as QuestionType, text: 'Which of the following are valid CSS units? (Select all that apply)',
      options: [
        { id: 'ms1', text: 'px' },
        { id: 'ms2', text: 'em' },
        { id: 'ms3', text: 'db' },
        { id: 'ms4', text: 'rem' },
        { id: 'ms5', text: 'hz' },
      ],
      correctAnswer: ['A', 'B', 'D'], points: 2, required: true,
    },
    {
      id: generateId(), type: 'dropdown' as QuestionType, text: 'Select the correct HTTP status code for "Not Found".',
      options: [
        { id: 'dd1', text: '200 OK' },
        { id: 'dd2', text: '301 Moved Permanently' },
        { id: 'dd3', text: '404 Not Found' },
        { id: 'dd4', text: '500 Internal Server Error' },
      ],
      correctAnswer: 'C', points: 1, required: true,
    },
    {
      id: generateId(), type: 'section_header' as QuestionType, text: '',
      sectionTitle: 'Part 2: Intermediate',
      sectionDescription: 'More advanced concepts',
      points: 0, required: false,
    },
    {
      id: generateId(), type: 'rating_scale' as QuestionType, text: 'How would you rate your understanding of responsive design?',
      min: 1, max: 5, labels: ['Beginner', 'Expert'],
      points: 1, required: true,
    },
    {
      id: generateId(), type: 'linear_scale' as QuestionType, text: 'On a scale of 1 to 10, how confident are you in writing JavaScript?',
      min: 1, max: 10, step: 1, labels: ['Not confident', 'Very confident'],
      points: 1, required: true,
    },
    {
      id: generateId(), type: 'ranking' as QuestionType, text: 'Rank the following CSS concepts from most important to least important for layout.',
      rankingItems: [
        { id: 'r1', text: 'Flexbox' },
        { id: 'r2', text: 'Grid' },
        { id: 'r3', text: 'Float' },
        { id: 'r4', text: 'Position' },
      ],
      points: 2, required: true,
    },
    {
      id: generateId(), type: 'date' as QuestionType, text: 'When did you start learning web development?',
      points: 0, required: false,
    },
    {
      id: generateId(), type: 'file_upload' as QuestionType, text: 'Upload a screenshot of your best web project (optional).',
      allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'], maxFileSize: 5,
      points: 0, required: false,
    },
    {
      id: generateId(), type: 'long_answer' as QuestionType, text: 'Explain the difference between CSS Flexbox and CSS Grid. When would you use each?',
      minWords: 50, maxWords: 500, correctAnswer: 'Flexbox is one-dimensional layout for rows or columns. Grid is two-dimensional for rows and columns.',
      points: 3, required: true,
    },
    {
      id: generateId(), type: 'matrix' as QuestionType, text: 'Rate your familiarity with each technology.',
      matrixRows: [
        { id: 'mr1', text: 'HTML' },
        { id: 'mr2', text: 'CSS' },
        { id: 'mr3', text: 'JavaScript' },
      ],
      matrixColumns: [
        { id: 'mc1', text: 'Beginner' },
        { id: 'mc2', text: 'Intermediate' },
        { id: 'mc3', text: 'Advanced' },
      ],
      points: 1, required: true,
    },
  ] as ExamQuestion[],
};

/* ── Animation ── */
const pageVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };
const cardVariants = { hidden: { opacity: 0, y: 16 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.05 } }) };

/* ════════════════════════════════════════════════════
   PUBLIC EXAM PORTAL
   ════════════════════════════════════════════════════ */

export default function PublicExamPage() {
  const [phase, setPhase] = useState<ExamPhase>('intro');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [timeRemaining, setTimeRemaining] = useState(MOCK_EXAM.timeLimit * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ── Handlers (declared before effects) ── */
  const handleSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setPhase('submitted'); }, 500);
  }, []);

  /* ── Timer ── */
  useEffect(() => {
    if (phase !== 'exam') return;
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, handleSubmit]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  /* ── Answer Handlers ── */
  const handleAnswer = useCallback((questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleRankingMove = useCallback((questionId: string, fromIdx: number, toIdx: number) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || MOCK_EXAM.questions.find((q) => q.id === questionId)?.rankingItems?.map((_, i) => String.fromCharCode(65 + i)) || [];
      const arr = [...current];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return { ...prev, [questionId]: arr };
    });
  }, []);

  /* ── Validation ── */
  const requiredQuestions = MOCK_EXAM.questions.filter((q) => q.required && q.type !== 'section_header');
  const canSubmit = useMemo(() => {
    return requiredQuestions.every((q) => {
      const ans = answers[q.id];
      if (ans === undefined || ans === null || ans === '') return false;
      if (Array.isArray(ans) && ans.length === 0) return false;
      if (typeof ans === 'string' && ans.trim() === '') return false;
      return true;
    });
  }, [answers]);

  /* ── Score ── */
  const score = useMemo(() => {
    let correct = 0;
    let total = 0;
    for (const q of MOCK_EXAM.questions) {
      if (q.type === 'section_header') continue;
      total += q.points;
      const ans = answers[q.id];
      if (!ans) continue;
      if (q.correctAnswer === undefined || q.correctAnswer === '') continue;

      if (q.type === 'short_answer') {
        if (String(ans).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
          correct += q.points;
        }
      } else if (q.type === 'multiple_choice' || q.type === 'true_false' || q.type === 'dropdown') {
        if (String(ans) === String(q.correctAnswer)) {
          correct += q.points;
        }
      } else if (q.type === 'multiple_select') {
        const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
        const ansArr = Array.isArray(ans) ? ans : [];
        if (correctArr.length === ansArr.length && correctArr.every((c) => ansArr.includes(c))) {
          correct += q.points;
        }
      }
    }
    return { correct, total, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 };
  }, [answers]);

  /* ── Progress ── */
  const answerableQuestions = MOCK_EXAM.questions.filter((q) => q.type !== 'section_header');
  const answeredCount = useMemo(
    () => answerableQuestions.filter((q) => {
      const a = answers[q.id];
      return a !== undefined && a !== null && a !== '' && !(Array.isArray(a) && a.length === 0);
    }).length,
    [answers]
  );
  const progressPercent = answerableQuestions.length > 0 ? (answeredCount / answerableQuestions.length) * 100 : 0;

  /* ── Handlers ── */
  const handleBegin = () => {
    let valid = true;
    setNameError('');
    setEmailError('');
    if (!name.trim()) { setNameError('Name is required'); valid = false; }
    if (!email.trim() || !isValidEmail(email)) { setEmailError('Valid email is required'); valid = false; }
    if (valid) setPhase('exam');
  };

  /* ── Button submit (checks canSubmit) ── */
  const handleButtonClickSubmit = () => {
    if (!canSubmit) return;
    handleSubmit();
  };

  /* ── Current question index for navigation ── */
  const [currentQIndex, setCurrentQIndex] = useState(0);

  const visibleQuestions = MOCK_EXAM.questions;
  const currentQuestion = visibleQuestions[currentQIndex];

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg-base)]/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors">
            AvrythinkSuite
          </Link>
          {phase === 'exam' && (
            <div className={cn('flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-mono font-medium', timeRemaining < 300 ? 'bg-red-50 text-red-600' : timeRemaining < 600 ? 'bg-amber-50 text-amber-600' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]')}>
              <Clock size={14} />
              {formatTimer(timeRemaining)}
            </div>
          )}
        </div>
      </header>

      <motion.main variants={pageVariants} initial="hidden" animate="visible" className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ══════════════════════════════════════════ PHASE: INTRO ══════════════════════════════════════════ */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="py-8 sm:py-12">
                <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--color-text-primary)]">{MOCK_EXAM.title}</h1>
                <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">{MOCK_EXAM.description}</p>

                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <div className="size-2 rounded-full bg-[var(--color-accent)]" />
                    {answerableQuestions.length} questions
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <div className="size-2 rounded-full bg-[var(--color-warning)]" />
                    {MOCK_EXAM.timeLimit} minutes
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <div className="size-2 rounded-full bg-emerald-400" />
                    Auto-graded
                  </div>
                </div>

                <Card className="mt-8 rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Your Information</h2>
                    <div className="space-y-3">
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="pl-9 bg-[var(--color-bg-base)] border-[var(--color-border)]" />
                        {nameError && <p className="text-xs text-[var(--color-danger)] mt-1">{nameError}</p>}
                      </div>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="pl-9 bg-[var(--color-bg-base)] border-[var(--color-border)]" />
                        {emailError && <p className="text-xs text-[var(--color-danger)] mt-1">{emailError}</p>}
                      </div>
                    </div>
                    <Button className="w-full mt-2" size="lg" onClick={handleBegin}>Begin Exam</Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════ PHASE: EXAM ══════════════════════════════════════════ */}
          {phase === 'exam' && (
            <motion.div key="exam" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--color-text-secondary)]">Progress</span>
                  <span className="text-xs font-medium text-[var(--color-text-secondary)]">{answeredCount} / {answerableQuestions.length}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--color-border)] overflow-hidden">
                  <motion.div className="h-full rounded-full bg-[var(--color-accent)]" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.3 }} />
                </div>
              </div>

              {/* Question navigation dots */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {visibleQuestions.map((q, idx) => {
                  const isAnswered = q.type === 'section_header' ? true : answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '';
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIndex(idx)}
                      className={cn(
                        'size-8 rounded-lg text-[10px] font-semibold flex items-center justify-center transition-colors',
                        q.type === 'section_header' ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] cursor-default' :
                        idx === currentQIndex ? 'bg-[var(--color-accent)] text-white' :
                        isAnswered ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]' :
                        'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)]'
                      )}
                    >
                      {q.type === 'section_header' ? '—' : idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Current question */}
              <AnimatePresence mode="wait">
                <motion.div key={currentQIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  {currentQuestion.type === 'section_header' ? (
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{currentQuestion.sectionTitle}</h2>
                      {currentQuestion.sectionDescription && (
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{currentQuestion.sectionDescription}</p>
                      )}
                      <Separator className="mt-4 bg-[var(--color-border)]" />
                    </div>
                  ) : (
                    <Card className={cn('rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)] transition-colors', answers[currentQuestion.id] != null && 'ring-1 ring-[var(--color-accent)]/30') as string}>
                      <CardContent className="p-5 sm:p-6 gap-4">
                        {/* Question header */}
                        <div className="flex items-start gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-[10px] font-bold text-[var(--color-accent)]">
                            {currentQIndex + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm sm:text-base font-medium text-[var(--color-text-primary)] leading-relaxed">{currentQuestion.text}</p>
                            {currentQuestion.points > 0 && <Badge variant="outline" className="text-[10px] mt-1">{currentQuestion.points} pts</Badge>}
                          </div>
                        </div>

                        <div className="ml-10">
                          <StudentQuestionInput question={currentQuestion} answer={answers[currentQuestion.id]} onAnswer={handleAnswer} onRankingMove={handleRankingMove} />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pb-8">
                <Button variant="outline" disabled={currentQIndex === 0} onClick={() => setCurrentQIndex((i) => i - 1)}>
                  <ChevronUp size={14} className="mr-1" /> Previous
                </Button>
                {currentQIndex < visibleQuestions.length - 1 ? (
                  <Button onClick={() => setCurrentQIndex((i) => i + 1)}>
                    Next <ChevronDown size={14} className="ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleButtonClickSubmit} disabled={!canSubmit || submitting}>
                    {submitting ? 'Submitting...' : 'Submit Exam'}
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════ PHASE: SUBMITTED ══════════════════════════════════════════ */}
          {phase === 'submitted' && (
            <motion.div key="submitted" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col items-center text-center py-12 sm:py-20">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}>
                <CheckCircle2 size={64} className="text-[var(--color-success)]" strokeWidth={1.5} />
              </motion.div>
              <h1 className="mt-6 text-2xl sm:text-3xl font-semibold text-[var(--color-text-primary)]">Thank you for completing the exam!</h1>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Your response has been recorded.</p>

              {MOCK_EXAM.showResults && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
                  <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)] px-10 py-8">
                    <p className="text-sm text-[var(--color-text-secondary)]">Your score</p>
                    <p className="mt-1 text-4xl font-bold text-[var(--color-text-primary)]">{score.correct}/{score.total}</p>
                    <p className={cn('mt-1 text-lg font-semibold', score.percentage >= 70 ? 'text-[var(--color-success)]' : score.percentage >= 50 ? 'text-amber-600' : 'text-red-600')}>
                      {score.percentage}%
                    </p>
                  </Card>
                </motion.div>
              )}

              {/* Review answers */}
              {MOCK_EXAM.showCorrectAnswers && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 w-full max-w-lg text-left space-y-3">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Review Your Answers</h3>
                  {MOCK_EXAM.questions.filter((q) => q.type !== 'section_header').map((q, idx) => (
                    <ReviewAnswer key={q.id} question={q} answer={answers[q.id]} index={idx} />
                  ))}
                </motion.div>
              )}

              <Link href="/" className="mt-10">
                <Button variant="outline"><ArrowLeft size={16} className="mr-2" />Back to home</Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   STUDENT QUESTION INPUT COMPONENT
   ════════════════════════════════════════════════════ */

function StudentQuestionInput({ question, answer, onAnswer, onRankingMove }: {
  question: ExamQuestion;
  answer: unknown;
  onAnswer: (id: string, value: unknown) => void;
  onRankingMove: (id: string, from: number, to: number) => void;
}) {
  const strAnswer = typeof answer === 'string' ? answer : '';
  const arrAnswer = Array.isArray(answer) ? answer : [];

  switch (question.type) {
    case 'multiple_choice':
      return (
        <RadioGroup value={strAnswer} onValueChange={(v) => onAnswer(question.id, v)} className="space-y-2 mt-4">
          {(question.options || []).map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            return (
              <Label key={opt.id} htmlFor={`a-${question.id}-${letter}`} className={cn('flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all min-h-12', strAnswer === letter ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/50' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-overlay)]')}>
                <RadioGroupItem value={letter} id={`a-${question.id}-${letter}`} />
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-xs font-bold text-[var(--color-text-secondary)]">{letter}</span>
                <span className="text-sm text-[var(--color-text-primary)]">{opt.text}</span>
              </Label>
            );
          })}
        </RadioGroup>
      );

    case 'multiple_select':
      return (
        <div className="space-y-2 mt-4">
          {(question.options || []).map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const checked = arrAnswer.includes(letter);
            return (
              <div key={opt.id} className={cn('flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all min-h-12', checked ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/50' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-overlay)]')}>
                <Checkbox checked={checked} onCheckedChange={() => {
                  const current = [...arrAnswer];
                  if (checked) current.splice(current.indexOf(letter), 1);
                  else current.push(letter);
                  onAnswer(question.id, current);
                }} />
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-xs font-bold text-[var(--color-text-secondary)]">{letter}</span>
                <span className="text-sm text-[var(--color-text-primary)]">{opt.text}</span>
              </div>
            );
          })}
        </div>
      );

    case 'short_answer':
      return (
        <div className="mt-4">
          <Input value={strAnswer} onChange={(e) => onAnswer(question.id, e.target.value)} placeholder="Type your answer..." maxLength={question.maxLength} className="bg-[var(--color-bg-base)] border-[var(--color-border)] text-sm" />
          {question.maxLength && <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1 text-right">{strAnswer.length}/{question.maxLength} characters</p>}
        </div>
      );

    case 'long_answer':
      return (
        <div className="mt-4">
          <Textarea value={strAnswer} onChange={(e) => onAnswer(question.id, e.target.value)} placeholder="Write your answer..." rows={5} className="bg-[var(--color-bg-base)] border-[var(--color-border)] text-sm resize-none" />
          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1 text-right">{strAnswer.split(/\s+/).filter(Boolean).length} words</p>
        </div>
      );

    case 'true_false':
      return (
        <RadioGroup value={strAnswer} onValueChange={(v) => onAnswer(question.id, v)} className="flex gap-3 mt-4">
          {['true', 'false'].map((val) => (
            <Label key={val} htmlFor={`tf-${question.id}-${val}`} className={cn('flex items-center gap-3 px-6 py-4 rounded-lg border cursor-pointer transition-all min-h-12 flex-1 justify-center', strAnswer === val ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/50 font-medium' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-overlay)]')}>
              <RadioGroupItem value={val} id={`tf-${question.id}-${val}`} />
              <span className="text-sm">{val.charAt(0).toUpperCase() + val.slice(1)}</span>
            </Label>
          ))}
        </RadioGroup>
      );

    case 'rating_scale': {
      const min = question.min || 1;
      const max = question.max || 5;
      const numVal = typeof answer === 'number' ? answer : 0;
      return (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--color-text-tertiary)]">{question.labels?.[0] || ''}</span>
            <span className="text-xs text-[var(--color-text-tertiary)]">{question.labels?.[1] || ''}</span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
              <button key={n} onClick={() => onAnswer(question.id, n)} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border transition-all hover:bg-[var(--color-bg-overlay)]" style={numVal >= n ? { borderColor: 'var(--color-accent)', background: 'var(--color-accent-muted)' } : { borderColor: 'var(--color-border)' }}>
                <Star size={20} className={numVal >= n ? 'text-amber-400 fill-amber-400' : 'text-[var(--color-text-tertiary)]'} />
                <span className="text-[10px] text-[var(--color-text-secondary)]">{n}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    case 'dropdown':
      return (
        <div className="mt-4">
          <select value={strAnswer} onChange={(e) => onAnswer(question.id, e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]">
            <option value="">Select an answer...</option>
            {(question.options || []).map((opt, idx) => (
              <option key={opt.id} value={String.fromCharCode(65 + idx)}>{opt.text}</option>
            ))}
          </select>
        </div>
      );

    case 'ranking': {
      const items = question.rankingItems || [];
      const rankingOrder = arrAnswer.length > 0 ? arrAnswer : items.map((_, i) => String.fromCharCode(65 + i));
      return (
        <div className="mt-4 space-y-1.5">
          <p className="text-[10px] text-[var(--color-text-tertiary)]">Click arrows to reorder:</p>
          {rankingOrder.map((letter, idx) => {
            const itemIdx = letter.charCodeAt(0) - 65;
            const item = items[itemIdx];
            if (!item) return null;
            return (
              <div key={letter} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)]">
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-[var(--color-accent-muted)] text-[10px] font-bold text-[var(--color-accent)]">{idx + 1}</span>
                <span className="flex-1 text-sm">{item.text}</span>
                <button onClick={() => idx > 0 && onRankingMove(question.id, idx, idx - 1)} disabled={idx === 0} className="p-0.5 disabled:opacity-20 text-[var(--color-text-tertiary)]"><ChevronUp size={14} /></button>
                <button onClick={() => idx < rankingOrder.length - 1 && onRankingMove(question.id, idx, idx + 1)} disabled={idx === rankingOrder.length - 1} className="p-0.5 disabled:opacity-20 text-[var(--color-text-tertiary)]"><ChevronDown size={14} /></button>
              </div>
            );
          })}
        </div>
      );
    }

    case 'file_upload':
      return (
        <div className="mt-4">
          <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 text-center hover:border-[var(--color-accent)] transition-colors">
            <Upload size={24} className="mx-auto text-[var(--color-text-tertiary)] mb-2" />
            <p className="text-sm text-[var(--color-text-secondary)]">Click to upload or drag and drop</p>
            <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">
              {question.allowedTypes?.join(', ').toUpperCase()} (max {question.maxFileSize || 10}MB)
            </p>
            <input type="file" className="hidden" id={`file-${question.id}`} accept={question.allowedTypes?.map((t) => `.${t}`).join(',')} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onAnswer(question.id, file.name);
            }} />
            <Button variant="outline" size="sm" className="mt-3" onClick={() => document.getElementById(`file-${question.id}`)?.click()}>
              Choose File
            </Button>
            {strAnswer && <p className="text-xs text-[var(--color-accent)] mt-2">{strAnswer}</p>}
          </div>
        </div>
      );

    case 'date':
      return (
        <div className="mt-4">
          <Input type="date" value={strAnswer} onChange={(e) => onAnswer(question.id, e.target.value)} min={question.minDate} max={question.maxDate} className="bg-[var(--color-bg-base)] border-[var(--color-border)] text-sm" />
        </div>
      );

    case 'linear_scale': {
      const min = question.min || 1;
      const max = question.max || 10;
      const step = question.step || 1;
      const numVal = typeof answer === 'number' ? answer : Math.round((min + max) / 2);
      return (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-text-tertiary)]">{question.labels?.[0] || min}</span>
            <span className="text-sm font-semibold text-[var(--color-accent)]">{numVal}</span>
            <span className="text-xs text-[var(--color-text-tertiary)]">{question.labels?.[1] || max}</span>
          </div>
          <Slider min={min} max={max} step={step} value={[numVal]} onValueChange={([v]) => onAnswer(question.id, v)} className="w-full" />
        </div>
      );
    }

    case 'matrix': {
      const rows = question.matrixRows || [];
      const columns = question.matrixColumns || [];
      const matrixAnswers = typeof answer === 'object' && answer !== null && !Array.isArray(answer) ? answer as Record<string, string> : {};
      return (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-[var(--color-text-tertiary)] p-2 text-xs" />
                {columns.map((col) => (
                  <th key={col.id} className="text-center text-[var(--color-text-secondary)] p-2 text-xs min-w-[60px]">{col.text}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-[var(--color-border)]/50">
                  <td className="p-2 text-[var(--color-text-secondary)] text-xs">{row.text}</td>
                  {columns.map((col) => {
                    const key = `${row.id}-${col.id}`;
                    const selected = matrixAnswers[key] || '';
                    return (
                      <td key={col.id} className="text-center p-2">
                        <button onClick={() => onAnswer(question.id, { ...matrixAnswers, [key]: col.id })} className="mx-auto">
                          <div className={cn('size-5 rounded-full border-2 flex items-center justify-center transition-colors', selected === col.id ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]')}>
                            {selected === col.id && <div className="size-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    default:
      return null;
  }
}

/* ════════════════════════════════════════════════════
   REVIEW ANSWER COMPONENT
   ════════════════════════════════════════════════════ */

function ReviewAnswer({ question, answer, index }: { question: ExamQuestion; answer: unknown; index: number }) {
  const isCorrect = useMemo(() => {
    if (question.correctAnswer === undefined || question.correctAnswer === '') return null;
    const ans = answer;
    if (ans === undefined || ans === null) return false;
    if (question.type === 'short_answer') return String(ans).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
    if (question.type === 'multiple_choice' || question.type === 'true_false' || question.type === 'dropdown') return String(ans) === String(question.correctAnswer);
    if (question.type === 'multiple_select') {
      const ca = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
      const a = Array.isArray(ans) ? ans : [];
      return ca.length === a.length && ca.every((c) => a.includes(c));
    }
    return null;
  }, [question, answer]);

  return (
    <Card className={cn('rounded-lg border p-4', isCorrect === true ? 'border-emerald-200 bg-emerald-50/50' : isCorrect === false ? 'border-red-200 bg-red-50/50' : 'border-[var(--color-border)] bg-[var(--color-bg-surface)]')}>
      <div className="flex items-start gap-2">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-[10px] font-bold text-[var(--color-text-secondary)]">{index + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--color-text-primary)]">{question.text}</p>
          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
            Your answer: {answer !== undefined && answer !== null && String(answer).trim() !== '' ? String(answer) : <span className="text-[var(--color-warning)]">No answer</span>}
          </p>
          {isCorrect !== null && question.correctAnswer && (
            <p className="text-[10px] mt-0.5">
              Correct: <span className="text-emerald-600 font-medium">{Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : String(question.correctAnswer)}</span>
            </p>
          )}
        </div>
        {isCorrect === true && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
        {isCorrect === false && <AlertTriangle size={16} className="text-red-500 shrink-0" />}
      </div>
    </Card>
  );
}
