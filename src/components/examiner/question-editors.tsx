'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, GripVertical, Copy, ChevronDown, ChevronUp, Plus, Star,
  Hash, AlignLeft, Check, X as XIcon, Calendar, ArrowUpDown,
  Table, Heading, ListOrdered, CircleDot, ListChecks, Type, Upload,
  Minus, ToggleLeft, Library
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn, generateId } from '@/lib/utils';
import type { ExamQuestion, QuestionType, MCQOption, MatrixRow, MatrixColumn, RankingItem } from '@/lib/types';

/* ── Type Labels & Icons ── */

export const QUESTION_TYPE_CONFIG: { value: QuestionType; label: string; icon: React.ElementType }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice', icon: CircleDot },
  { value: 'multiple_select', label: 'Multiple Select', icon: ListChecks },
  { value: 'short_answer', label: 'Short Answer', icon: Type },
  { value: 'long_answer', label: 'Long Answer', icon: AlignLeft },
  { value: 'true_false', label: 'True / False', icon: ToggleLeft },
  { value: 'rating_scale', label: 'Rating Scale', icon: Star },
  { value: 'dropdown', label: 'Dropdown', icon: Minus },
  { value: 'ranking', label: 'Ranking', icon: ListOrdered },
  { value: 'file_upload', label: 'File Upload', icon: Upload },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'linear_scale', label: 'Linear Scale', icon: Minus },
  { value: 'matrix', label: 'Matrix', icon: Table },
  { value: 'section_header', label: 'Section Header', icon: Heading },
];

/* ── Helpers ── */

function createOption(id?: string, text?: string): MCQOption {
  return { id: id || generateId(), text: text || 'New Option' };
}

function createMatrixRow(id?: string, text?: string): MatrixRow {
  return { id: id || generateId(), text: text || 'Row' };
}

function createMatrixColumn(id?: string, text?: string): MatrixColumn {
  return { id: id || generateId(), text: text || 'Column' };
}

function createRankingItem(id?: string, text?: string): RankingItem {
  return { id: id || generateId(), text: text || 'Item' };
}

export function createDefaultQuestion(type: QuestionType = 'multiple_choice'): ExamQuestion {
  const base: ExamQuestion = {
    id: generateId(),
    type,
    text: '',
    points: 1,
    required: true,
  };

  switch (type) {
    case 'multiple_choice':
      return {
        ...base,
        text: 'Enter your question',
        options: [
          createOption(generateId(), 'Option A'),
          createOption(generateId(), 'Option B'),
          createOption(generateId(), 'Option C'),
          createOption(generateId(), 'Option D'),
        ],
        correctAnswer: '',
      };
    case 'multiple_select':
      return {
        ...base,
        text: 'Select all that apply',
        options: [
          createOption(generateId(), 'Option A'),
          createOption(generateId(), 'Option B'),
          createOption(generateId(), 'Option C'),
        ],
        correctAnswer: [],
      };
    case 'short_answer':
      return {
        ...base,
        text: 'Short answer question',
        maxLength: 500,
        correctAnswer: '',
      };
    case 'long_answer':
      return {
        ...base,
        text: 'Essay question',
        minWords: 50,
        maxWords: 1000,
        correctAnswer: '',
      };
    case 'true_false':
      return {
        ...base,
        text: 'True or false statement',
        correctAnswer: '',
      };
    case 'rating_scale':
      return {
        ...base,
        text: 'Rate the following',
        min: 1,
        max: 5,
        labels: ['Poor', 'Excellent'],
      };
    case 'dropdown':
      return {
        ...base,
        text: 'Choose from the list',
        options: [
          createOption(generateId(), 'Option A'),
          createOption(generateId(), 'Option B'),
          createOption(generateId(), 'Option C'),
        ],
        correctAnswer: '',
      };
    case 'ranking':
      return {
        ...base,
        text: 'Rank the following items',
        rankingItems: [
          createRankingItem(generateId(), 'Item 1'),
          createRankingItem(generateId(), 'Item 2'),
          createRankingItem(generateId(), 'Item 3'),
          createRankingItem(generateId(), 'Item 4'),
        ],
        correctAnswer: '',
      };
    case 'file_upload':
      return {
        ...base,
        text: 'Upload your file',
        allowedTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
        maxFileSize: 10,
      };
    case 'date':
      return {
        ...base,
        text: 'Select a date',
      };
    case 'linear_scale':
      return {
        ...base,
        text: 'Rate on a scale',
        min: 1,
        max: 10,
        step: 1,
        labels: ['Low', 'High'],
      };
    case 'matrix':
      return {
        ...base,
        text: 'Matrix question',
        matrixRows: [
          createMatrixRow(generateId(), 'Row 1'),
          createMatrixRow(generateId(), 'Row 2'),
          createMatrixRow(generateId(), 'Row 3'),
        ],
        matrixColumns: [
          createMatrixColumn(generateId(), 'Column 1'),
          createMatrixColumn(generateId(), 'Column 2'),
          createMatrixColumn(generateId(), 'Column 3'),
        ],
      };
    case 'section_header':
      return {
        ...base,
        type: 'section_header',
        text: '',
        sectionTitle: 'Section Title',
        sectionDescription: 'Section description goes here.',
        points: 0,
        required: false,
      };
    default:
      return base;
  }
}

/* ── Wrapper Props ── */

interface QuestionEditorProps {
  question: ExamQuestion;
  index: number;
  onUpdate: (updates: Partial<ExamQuestion>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/* ── Question Editor Wrapper ── */

export function QuestionEditorWrapper({
  question, index, onUpdate, onDelete, onDuplicate, onMoveUp, onMoveDown,
  isFirst, isLast, isCollapsed, onToggleCollapse,
}: QuestionEditorProps) {
  const typeConfig = QUESTION_TYPE_CONFIG.find((t) => t.value === question.type);
  const TypeIcon = typeConfig?.icon || CircleDot;
  const [saveToBank, setSaveToBank] = useState(true);

  return (
    <motion.div layout className="border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-surface)] overflow-hidden">
      {/* Header — always visible */}
      <div className="flex items-center gap-2 px-4 py-3">
        <GripVertical size={16} className="text-[var(--color-text-tertiary)] cursor-grab shrink-0" />
        <span className="text-xs font-semibold text-[var(--color-accent)] bg-[var(--color-accent-muted)] px-2 py-0.5 rounded">
          {index + 1}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
          <TypeIcon size={12} />
          <span>{typeConfig?.label || question.type}</span>
        </div>
        {question.required && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-[var(--color-warning)] text-[var(--color-warning)]">
            Required
          </Badge>
        )}
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-tertiary)]">
          <Library size={10} className="text-[#FF3333]" />
          <span>Bank</span>
          <Switch
            checked={saveToBank}
            onCheckedChange={setSaveToBank}
            className="scale-75"
          />
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={100}
            value={question.points}
            onChange={(e) => onUpdate({ points: Math.max(0, Number(e.target.value) || 0) })}
            className="w-10 text-right text-xs bg-[var(--color-bg-elevated)] rounded px-1 py-0.5 border border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <span className="text-xs text-[var(--color-text-tertiary)]">pts</span>
        </div>
        <button onClick={onToggleCollapse} className="p-1 rounded hover:bg-[var(--color-bg-overlay)] transition-colors">
          {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        <button onClick={onDuplicate} className="p-1 rounded hover:bg-[var(--color-bg-overlay)] transition-colors text-[var(--color-text-tertiary)]" title="Duplicate">
          <Copy size={14} />
        </button>
        <button onClick={onDelete} className="p-1 rounded hover:bg-red-50 transition-colors text-[var(--color-danger)]" title="Delete">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Content — expandable */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="flex gap-1">
                <button
                  onClick={onMoveUp}
                  disabled={isFirst}
                  className={cn(
                    'px-2 py-1 text-[10px] rounded border transition-colors',
                    isFirst
                      ? 'opacity-30 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-tertiary)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)]'
                  )}
                >
                  <ChevronUp size={12} className="inline mr-0.5" /> Up
                </button>
                <button
                  onClick={onMoveDown}
                  disabled={isLast}
                  className={cn(
                    'px-2 py-1 text-[10px] rounded border transition-colors',
                    isLast
                      ? 'opacity-30 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-tertiary)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)]'
                  )}
                >
                  <ChevronDown size={12} className="inline mr-0.5" /> Down
                </button>
              </div>

              {/* Type Selector */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-[var(--color-text-tertiary)] w-full mb-0.5">Type:</span>
                {QUESTION_TYPE_CONFIG.map((qt) => (
                  <button
                    key={qt.value}
                    onClick={() => {
                      if (qt.value !== question.type) {
                        const newQ = createDefaultQuestion(qt.value);
                        onUpdate({ ...newQ, id: question.id });
                      }
                    }}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors border',
                      question.type === qt.value
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)]'
                    )}
                  >
                    <qt.icon size={10} />
                    {qt.label}
                  </button>
                ))}
              </div>

              <Separator className="bg-[var(--color-border)]" />

              {question.type !== 'section_header' && (
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-[var(--color-text-secondary)]">Required</Label>
                  <Switch
                    checked={question.required}
                    onCheckedChange={(checked) => onUpdate({ required: checked })}
                  />
                </div>
              )}

              <QuestionTypeEditor question={question} onUpdate={onUpdate} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Question Type Router ── */

function QuestionTypeEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  switch (question.type) {
    case 'section_header': return <SectionHeaderEditor question={question} onUpdate={onUpdate} />;
    case 'multiple_choice': return <MultipleChoiceEditor question={question} onUpdate={onUpdate} />;
    case 'multiple_select': return <MultipleSelectEditor question={question} onUpdate={onUpdate} />;
    case 'short_answer': return <ShortAnswerEditor question={question} onUpdate={onUpdate} />;
    case 'long_answer': return <LongAnswerEditor question={question} onUpdate={onUpdate} />;
    case 'true_false': return <TrueFalseEditor question={question} onUpdate={onUpdate} />;
    case 'rating_scale': return <RatingScaleEditor question={question} onUpdate={onUpdate} />;
    case 'dropdown': return <DropdownEditor question={question} onUpdate={onUpdate} />;
    case 'ranking': return <RankingEditor question={question} onUpdate={onUpdate} />;
    case 'file_upload': return <FileUploadEditor question={question} onUpdate={onUpdate} />;
    case 'date': return <DateEditor question={question} onUpdate={onUpdate} />;
    case 'linear_scale': return <LinearScaleEditor question={question} onUpdate={onUpdate} />;
    case 'matrix': return <MatrixEditor question={question} onUpdate={onUpdate} />;
    default: return null;
  }
}

/* ── Question Text Input ── */
function QuestionTextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Enter your question...'}
      className="text-sm font-medium bg-[var(--color-bg-base)] border-[var(--color-border)]"
    />
  );
}

/* ════════════════════════════════════════════════════
   INDIVIDUAL QUESTION EDITORS
   ════════════════════════════════════════════════════ */

/* ── Section Header ── */
function SectionHeaderEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  return (
    <div className="space-y-3">
      <Input
        value={question.sectionTitle || ''}
        onChange={(e) => onUpdate({ sectionTitle: e.target.value })}
        placeholder="Section Title"
        className="text-base font-semibold bg-transparent border-0 border-b border-[var(--color-border)] rounded-none px-0 focus-visible:ring-0 focus-visible:border-[var(--color-accent)]"
      />
      <Textarea
        value={question.sectionDescription || ''}
        onChange={(e) => onUpdate({ sectionDescription: e.target.value })}
        placeholder="Section description (optional)"
        rows={2}
        className="text-sm bg-transparent border-0 border-b border-[var(--color-border)] rounded-none px-0 resize-none focus-visible:ring-0 focus-visible:border-[var(--color-accent)]"
      />
      <p className="text-[10px] text-[var(--color-text-tertiary)]">Section divider — does not require an answer.</p>
    </div>
  );
}

/* ── Multiple Choice ── */
function MultipleChoiceEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  const options = question.options || [];

  const updateOption = (idx: number, text: string) => {
    const newOpts = [...options];
    newOpts[idx] = { ...newOpts[idx], text };
    onUpdate({ options: newOpts });
  };

  const removeOption = (idx: number) => {
    onUpdate({ options: options.filter((_, i) => i !== idx) });
  };

  const addOption = () => {
    onUpdate({ options: [...options, createOption(generateId(), `Option ${String.fromCharCode(65 + options.length)}`)] });
  };

  return (
    <div className="space-y-3">
      <QuestionTextInput value={question.text} onChange={(v) => onUpdate({ text: v })} />
      <div className="space-y-1.5">
        <Label className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Options — Select Correct Answer</Label>
        <RadioGroup
          value={(question.correctAnswer as string) || ''}
          onValueChange={(v) => onUpdate({ correctAnswer: v })}
          className="space-y-1.5"
        >
          {options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            return (
              <Label
                key={opt.id}
                htmlFor={`mcq-opt-${question.id}-${idx}`}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                  (question.correctAnswer as string) === letter
                    ? 'border-[var(--color-success)] bg-emerald-50'
                    : 'border-[var(--color-border)] hover:bg-[var(--color-bg-overlay)]'
                )}
              >
                <RadioGroupItem value={letter} id={`mcq-opt-${question.id}-${idx}`} />
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-[10px] font-bold text-[var(--color-text-secondary)]">
                  {letter}
                </span>
                <Input
                  value={opt.text}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 h-7 text-sm border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
                />
                {options.length > 2 && (
                  <button type="button" onClick={(e) => { e.preventDefault(); removeOption(idx); }} className="p-1 rounded hover:bg-red-50 text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] shrink-0">
                    <Trash2 size={12} />
                  </button>
                )}
              </Label>
            );
          })}
        </RadioGroup>
        {options.length < 10 && (
          <Button variant="ghost" size="sm" onClick={addOption} className="text-xs text-[var(--color-text-secondary)]">
            <Plus size={12} className="mr-1" /> Add option
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── Multiple Select ── */
function MultipleSelectEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  const options = question.options || [];
  const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer as string[] : [];

  const updateOption = (idx: number, text: string) => {
    const newOpts = [...options];
    newOpts[idx] = { ...newOpts[idx], text };
    onUpdate({ options: newOpts });
  };

  const removeOption = (idx: number) => { onUpdate({ options: options.filter((_, i) => i !== idx) }); };

  const addOption = () => {
    onUpdate({ options: [...options, createOption(generateId(), `Option ${String.fromCharCode(65 + options.length)}`)] });
  };

  const toggleCorrect = (letter: string) => {
    const current = correctAnswers.includes(letter) ? correctAnswers.filter((a) => a !== letter) : [...correctAnswers, letter];
    onUpdate({ correctAnswer: current });
  };

  return (
    <div className="space-y-3">
      <QuestionTextInput value={question.text} onChange={(v) => onUpdate({ text: v })} />
      <div className="space-y-1.5">
        <Label className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Options — Check All Correct Answers</Label>
        {options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isCorrect = correctAnswers.includes(letter);
          return (
            <div key={opt.id} className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors', isCorrect ? 'border-[var(--color-success)] bg-emerald-50' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-overlay)]')}>
              <Checkbox checked={isCorrect} onCheckedChange={() => toggleCorrect(letter)} />
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-[10px] font-bold text-[var(--color-text-secondary)]">{letter}</span>
              <Input value={opt.text} onChange={(e) => updateOption(idx, e.target.value)} className="flex-1 h-7 text-sm border-0 bg-transparent shadow-none focus-visible:ring-0 px-0" />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(idx)} className="p-1 rounded hover:bg-red-50 text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] shrink-0"><Trash2 size={12} /></button>
              )}
            </div>
          );
        })}
        {options.length < 10 && (
          <Button variant="ghost" size="sm" onClick={addOption} className="text-xs text-[var(--color-text-secondary)]"><Plus size={12} className="mr-1" /> Add option</Button>
        )}
      </div>
      {correctAnswers.length > 0 && (
        <p className="text-[10px] text-[var(--color-success)]"><Check size={10} className="inline mr-1" /> {correctAnswers.length} correct: {correctAnswers.join(', ')}</p>
      )}
    </div>
  );
}

/* ── Short Answer ── */
function ShortAnswerEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  return (
    <div className="space-y-3">
      <QuestionTextInput value={question.text} onChange={(v) => onUpdate({ text: v })} />
      <Input value={(question.correctAnswer as string) || ''} onChange={(e) => onUpdate({ correctAnswer: e.target.value })} placeholder="Model answer (for auto-grading)" className="text-sm bg-[var(--color-bg-base)] border-[var(--color-border)]" />
      <div className="flex items-center gap-3">
        <Label className="text-xs text-[var(--color-text-secondary)] shrink-0">Max length</Label>
        <Input type="number" min={1} max={5000} value={question.maxLength || 500} onChange={(e) => onUpdate({ maxLength: Math.max(1, Number(e.target.value) || 1) })} className="w-20 h-7 text-xs" />
        <span className="text-[10px] text-[var(--color-text-tertiary)]">characters</span>
      </div>
    </div>
  );
}

/* ── Long Answer ── */
function LongAnswerEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  return (
    <div className="space-y-3">
      <QuestionTextInput value={question.text} onChange={(v) => onUpdate({ text: v })} />
      <Textarea value={(question.correctAnswer as string) || ''} onChange={(e) => onUpdate({ correctAnswer: e.target.value })} placeholder="Model answer or grading rubric" rows={3} className="text-sm bg-[var(--color-bg-base)] border-[var(--color-border)] resize-none" />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-[var(--color-text-secondary)] shrink-0">Min words</Label>
          <Input type="number" min={0} value={question.minWords || 0} onChange={(e) => onUpdate({ minWords: Math.max(0, Number(e.target.value) || 0) })} className="w-20 h-7 text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-[var(--color-text-secondary)] shrink-0">Max words</Label>
          <Input type="number" min={1} value={question.maxWords || 1000} onChange={(e) => onUpdate({ maxWords: Math.max(1, Number(e.target.value) || 1) })} className="w-20 h-7 text-xs" />
        </div>
      </div>
    </div>
  );
}

/* ── True / False ── */
function TrueFalseEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  return (
    <div className="space-y-3">
      <QuestionTextInput value={question.text} onChange={(v) => onUpdate({ text: v })} placeholder="Enter a true/false statement..." />
      <Label className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Correct Answer</Label>
      <RadioGroup value={(question.correctAnswer as string) || ''} onValueChange={(v) => onUpdate({ correctAnswer: v })} className="flex gap-3">
        {['true', 'false'].map((val) => (
          <Label key={val} htmlFor={`tf-${question.id}-${val}`} className={cn('flex items-center gap-2 px-6 py-3 rounded-lg border cursor-pointer transition-colors min-h-12 flex-1 justify-center', (question.correctAnswer as string) === val ? 'border-[var(--color-success)] bg-emerald-50 font-medium' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-overlay)]')}>
            <RadioGroupItem value={val} id={`tf-${question.id}-${val}`} />
            {val.charAt(0).toUpperCase() + val.slice(1)}
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}

/* ── Rating Scale ── */
function RatingScaleEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  const min = question.min || 1;
  const max = question.max || 5;
  return (
    <div className="space-y-3">
      <QuestionTextInput value={question.text} onChange={(v) => onUpdate({ text: v })} />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-[var(--color-text-secondary)]">Min</Label>
          <Input type="number" min={0} max={10} value={min} onChange={(e) => onUpdate({ min: Math.max(0, Number(e.target.value) || 0) })} className="w-16 h-7 text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-[var(--color-text-secondary)]">Max</Label>
          <Input type="number" min={min + 1} max={10} value={max} onChange={(e) => onUpdate({ max: Math.max(min + 1, Number(e.target.value) || min + 1) })} className="w-16 h-7 text-xs" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Label className="text-xs text-[var(--color-text-secondary)] shrink-0">Min label</Label>
          <Input value={(question.labels && question.labels[0]) || ''} onChange={(e) => { const l = [...(question.labels || ['', ''])]; l[0] = e.target.value; onUpdate({ labels: l }); }} placeholder="Poor" className="h-7 text-xs" />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Label className="text-xs text-[var(--color-text-secondary)] shrink-0">Max label</Label>
          <Input value={(question.labels && question.labels[1]) || ''} onChange={(e) => { const l = [...(question.labels || ['', ''])]; l[1] = e.target.value; onUpdate({ labels: l }); }} placeholder="Excellent" className="h-7 text-xs" />
        </div>
      </div>
      <div className="flex items-center gap-1 p-3 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border)]">
        <span className="text-[10px] text-[var(--color-text-tertiary)] mr-2">Preview:</span>
        {Array.from({ length: max - min + 1 }, (_, i) => (
          <Star key={i} size={20} className="text-[var(--color-warning)] fill-[var(--color-warning)]" />
        ))}
      </div>
    </div>
  );
}

/* ── Dropdown ── */
function DropdownEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  const options = question.options || [];
  const updateOption = (idx: number, text: string) => { const o = [...options]; o[idx] = { ...o[idx], text }; onUpdate({ options: o }); };
  const removeOption = (idx: number) => { onUpdate({ options: options.filter((_, i) => i !== idx) }); };
  const addOption = () => { onUpdate({ options: [...options, createOption(generateId(), `Option ${String.fromCharCode(65 + options.length)}`)] }); };

  return (
    <div className="space-y-3">
      <QuestionTextInput value={question.text} onChange={(v) => onUpdate({ text: v })} />
      <div className="space-y-1.5">
        <Label className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Options — Select Correct Answer</Label>
        <RadioGroup value={(question.correctAnswer as string) || ''} onValueChange={(v) => onUpdate({ correctAnswer: v })} className="space-y-1.5">
          {options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            return (
              <div key={opt.id} className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors', (question.correctAnswer as string) === letter ? 'border-[var(--color-success)] bg-emerald-50' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-overlay)]')}>
                <RadioGroupItem value={letter} />
                <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">{letter}.</span>
                <Input value={opt.text} onChange={(e) => updateOption(idx, e.target.value)} className="flex-1 h-7 text-sm border-0 bg-transparent shadow-none focus-visible:ring-0 px-0" />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(idx)} className="p-1 rounded hover:bg-red-50 text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] shrink-0"><Trash2 size={12} /></button>
                )}
              </div>
            );
          })}
        </RadioGroup>
        {options.length < 15 && (
          <Button variant="ghost" size="sm" onClick={addOption} className="text-xs text-[var(--color-text-secondary)]"><Plus size={12} className="mr-1" /> Add option</Button>
        )}
      </div>
    </div>
  );
}

/* ── Ranking ── */
function RankingEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  const items = question.rankingItems || [];
  const updateItem = (idx: number, text: string) => { const n = [...items]; n[idx] = { ...n[idx], text }; onUpdate({ rankingItems: n }); };
  const removeItem = (idx: number) => { onUpdate({ rankingItems: items.filter((_, i) => i !== idx) }); };
  const addItem = () => { onUpdate({ rankingItems: [...items, createRankingItem(generateId(), `Item ${items.length + 1}`)] }); };
  const moveItem = (idx: number, direction: 'up' | 'down') => {
    const n = [...items]; const t = direction === 'up' ? idx - 1 : idx + 1;
    if (t < 0 || t >= n.length) return;
    [n[idx], n[t]] = [n[t], n[idx]];
    onUpdate({ rankingItems: n });
  };

  return (
    <div className="space-y-3">
      <QuestionTextInput value={question.text} onChange={(v) => onUpdate({ text: v })} />
      <div className="space-y-1.5">
        <Label className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Ranking Items</Label>
        {items.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)]">
            <span className="flex size-5 shrink-0 items-center justify-center rounded bg-[var(--color-accent-muted)] text-[10px] font-bold text-[var(--color-accent)]">{idx + 1}</span>
            <Input value={item.text} onChange={(e) => updateItem(idx, e.target.value)} className="flex-1 h-7 text-sm border-0 bg-transparent shadow-none focus-visible:ring-0 px-0" />
            <button type="button" onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="p-0.5 disabled:opacity-30 text-[var(--color-text-tertiary)]"><ChevronUp size={12} /></button>
            <button type="button" onClick={() => moveItem(idx, 'down')} disabled={idx === items.length - 1} className="p-0.5 disabled:opacity-30 text-[var(--color-text-tertiary)]"><ChevronDown size={12} /></button>
            {items.length > 2 && <button type="button" onClick={() => removeItem(idx)} className="p-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)]"><Trash2 size={12} /></button>}
          </div>
        ))}
        {items.length < 10 && (
          <Button variant="ghost" size="sm" onClick={addItem} className="text-xs text-[var(--color-text-secondary)]"><Plus size={12} className="mr-1" /> Add item</Button>
        )}
      </div>
    </div>
  );
}

/* ── File Upload ── */
function FileUploadEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  return (
    <div className="space-y-3">
      <QuestionTextInput value={question.text} onChange={(v) => onUpdate({ text: v })} />
      <div className="space-y-2">
        <Label className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Allowed File Types (comma-separated)</Label>
        <Input value={(question.allowedTypes || []).join(', ')} onChange={(e) => onUpdate({ allowedTypes: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} placeholder="pdf, docx, jpg, png" className="h-7 text-xs" />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Max File Size</Label>
        <div className="flex items-center gap-2">
          <Input type="number" min={1} max={100} value={question.maxFileSize || 10} onChange={(e) => onUpdate({ maxFileSize: Math.max(1, Number(e.target.value) || 1) })} className="w-20 h-7 text-xs" />
          <span className="text-xs text-[var(--color-text-secondary)]">MB</span>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border)]">
        <p className="text-[10px] text-[var(--color-text-tertiary)]">File uploads are reviewed manually.</p>
      </div>
    </div>
  );
}

/* ── Date ── */
function DateEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  return (
    <div className="space-y-3">
      <QuestionTextInput value={question.text} onChange={(v) => onUpdate({ text: v })} />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Min Date</Label>
          <Input type="date" value={question.minDate || ''} onChange={(e) => onUpdate({ minDate: e.target.value })} className="h-8 text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Max Date</Label>
          <Input type="date" value={question.maxDate || ''} onChange={(e) => onUpdate({ maxDate: e.target.value })} className="h-8 text-xs" />
        </div>
      </div>
    </div>
  );
}

/* ── Linear Scale ── */
function LinearScaleEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  const min = question.min || 1;
  const max = question.max || 10;
  const step = question.step || 1;

  return (
    <div className="space-y-3">
      <QuestionTextInput value={question.text} onChange={(v) => onUpdate({ text: v })} />
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-[var(--color-text-secondary)]">Min</Label>
          <Input type="number" min={0} max={100} value={min} onChange={(e) => onUpdate({ min: Math.max(0, Number(e.target.value) || 0) })} className="w-16 h-7 text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-[var(--color-text-secondary)]">Max</Label>
          <Input type="number" min={min + 1} max={100} value={max} onChange={(e) => onUpdate({ max: Math.max(min + 1, Number(e.target.value) || min + 1) })} className="w-16 h-7 text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-[var(--color-text-secondary)]">Step</Label>
          <Input type="number" min={1} value={step} onChange={(e) => onUpdate({ step: Math.max(1, Number(e.target.value) || 1) })} className="w-16 h-7 text-xs" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Label className="text-xs text-[var(--color-text-secondary)] shrink-0">Left</Label>
          <Input value={(question.labels && question.labels[0]) || ''} onChange={(e) => { const l = [...(question.labels || ['', ''])]; l[0] = e.target.value; onUpdate({ labels: l }); }} placeholder="Low" className="h-7 text-xs" />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Label className="text-xs text-[var(--color-text-secondary)] shrink-0">Right</Label>
          <Input value={(question.labels && question.labels[1]) || ''} onChange={(e) => { const l = [...(question.labels || ['', ''])]; l[1] = e.target.value; onUpdate({ labels: l }); }} placeholder="High" className="h-7 text-xs" />
        </div>
      </div>
      <div className="p-3 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[var(--color-text-tertiary)]">{min}</span>
          <span className="text-[10px] text-[var(--color-text-tertiary)]">{max}</span>
        </div>
        <Slider min={min} max={max} step={step} value={[(min + max) / 2]} disabled className="pointer-events-none" />
      </div>
    </div>
  );
}

/* ── Matrix ── */
function MatrixEditor({ question, onUpdate }: { question: ExamQuestion; onUpdate: (u: Partial<ExamQuestion>) => void }) {
  const rows = question.matrixRows || [];
  const columns = question.matrixColumns || [];

  const addRow = () => onUpdate({ matrixRows: [...rows, createMatrixRow(generateId(), `Row ${rows.length + 1}`)] });
  const removeRow = (idx: number) => onUpdate({ matrixRows: rows.filter((_, i) => i !== idx) });
  const updateRow = (idx: number, text: string) => { const n = [...rows]; n[idx] = { ...n[idx], text }; onUpdate({ matrixRows: n }); };
  const addColumn = () => onUpdate({ matrixColumns: [...columns, createMatrixColumn(generateId(), `Column ${columns.length + 1}`)] });
  const removeColumn = (idx: number) => onUpdate({ matrixColumns: columns.filter((_, i) => i !== idx) });
  const updateColumn = (idx: number, text: string) => { const n = [...columns]; n[idx] = { ...n[idx], text }; onUpdate({ matrixColumns: n }); };

  return (
    <div className="space-y-3">
      <QuestionTextInput value={question.text} onChange={(v) => onUpdate({ text: v })} />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Rows ({rows.length})</Label>
          {rows.map((row, idx) => (
            <div key={row.id} className="flex items-center gap-1">
              <Input value={row.text} onChange={(e) => updateRow(idx, e.target.value)} className="flex-1 h-7 text-xs" />
              {rows.length > 1 && <button type="button" onClick={() => removeRow(idx)} className="p-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)]"><Trash2 size={12} /></button>}
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addRow} className="text-xs text-[var(--color-text-secondary)] w-full"><Plus size={12} className="mr-1" /> Add row</Button>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Columns ({columns.length})</Label>
          {columns.map((col, idx) => (
            <div key={col.id} className="flex items-center gap-1">
              <Input value={col.text} onChange={(e) => updateColumn(idx, e.target.value)} className="flex-1 h-7 text-xs" />
              {columns.length > 1 && <button type="button" onClick={() => removeColumn(idx)} className="p-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)]"><Trash2 size={12} /></button>}
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addColumn} className="text-xs text-[var(--color-text-secondary)] w-full"><Plus size={12} className="mr-1" /> Add column</Button>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border)] overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr>
              <th className="text-left text-[var(--color-text-tertiary)] p-1" />
              {columns.map((col) => <th key={col.id} className="text-center text-[var(--color-text-tertiary)] p-1 min-w-[40px]">{col.text}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="p-1 text-[var(--color-text-secondary)]">{row.text}</td>
                {columns.map((col) => (
                  <td key={col.id} className="text-center p-1">
                    <div className="w-3.5 h-3.5 rounded-full border border-[var(--color-border)] mx-auto" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
