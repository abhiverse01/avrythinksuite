'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Library,
  X,
  Plus,
  CircleDot,
  Type,
  AlignLeft,
  ToggleLeft,
  Star,
  Table,
  ListOrdered,
  ClipboardCheck,
  Check,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatRelativeTime, truncate } from '@/lib/utils';
import { QUESTION_TYPE_CONFIG } from './question-editors';
import type { ExamQuestion, QuestionType } from '@/lib/types';

/* ── Filter Types ── */

type QuestionFilter = 'all' | QuestionType;

const FILTER_PILLS: { value: QuestionFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'multiple_choice', label: 'MCQ' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'long_answer', label: 'Long Answer' },
  { value: 'true_false', label: 'True/False' },
  { value: 'rating_scale', label: 'Rating' },
  { value: 'matrix', label: 'Matrix' },
  { value: 'ranking', label: 'Ranking' },
];

/* ── Question Bank Item ── */

export interface QuestionBankItem {
  question: ExamQuestion;
  createdAt: string;
  usedInExams: number;
  sourceExamId?: string;
  sourceExamName?: string;
}

/* ── Props ── */

interface QuestionBankProps {
  items: QuestionBankItem[];
  onSelect?: (questions: ExamQuestion[]) => void;
  onAddFromBank?: (questions: ExamQuestion[]) => void;
}

/* ════════════════════════════════════════════════════
   QUESTION BANK PANEL
   ════════════════════════════════════════════════════ */

export function QuestionBank({ items, onSelect, onAddFromBank }: QuestionBankProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<QuestionFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /* ── Fuzzy search ── */
  const filteredItems = useMemo(() => {
    let result = items.filter((item) => item.question.type !== 'section_header');

    if (filter !== 'all') {
      result = result.filter((item) => item.question.type === filter);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.question.text.toLowerCase().includes(query) ||
          item.question.type.toLowerCase().includes(query) ||
          (item.sourceExamName && item.sourceExamName.toLowerCase().includes(query))
      );
    }

    return result;
  }, [items, filter, search]);

  /* ── Selection ── */
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.question.id)));
    }
  };

  const handleAddSelected = () => {
    const selected = filteredItems.filter((i) => selectedIds.has(i.question.id)).map((i) => i.question);
    if (selected.length > 0 && onAddFromBank) {
      onAddFromBank(selected);
      setSelectedIds(new Set());
    }
  };

  /* ── Type badge ── */
  const getTypeBadge = (type: QuestionType) => {
    const config = QUESTION_TYPE_CONFIG.find((t) => t.value === type);
    if (!config) return null;
    const Icon = config.icon;
    return (
      <Badge
        variant="outline"
        className="text-[10px] gap-1 border-[var(--color-border)] text-[var(--color-text-tertiary)]"
      >
        <Icon size={10} />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
          <Library size={16} className="text-[#FF3333]" />
          Question Bank
          <Badge variant="outline" className="text-[10px]">
            {items.length}
          </Badge>
        </div>
        {selectedIds.size > 0 && (
          <Button size="sm" onClick={handleAddSelected} className="h-7 text-xs bg-[#FF3333] hover:bg-[#FF3333]/90 text-white">
            <Plus size={12} className="mr-1" />
            Add selected ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* ── Search ── */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="pl-9 h-8 text-xs bg-[var(--color-bg-base)] border-[var(--color-border)]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Pills ── */}
      <div className="px-4 py-2 border-b border-[var(--color-border)]">
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setFilter(pill.value)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors border',
                filter === pill.value
                  ? 'bg-[#FF3333]/10 border-[#FF3333]/30 text-[#FF3333]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)]'
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Select All (when items exist) ── */}
      {filteredItems.length > 0 && (
        <div className="px-4 py-2 border-b border-[var(--color-border)] flex items-center gap-2">
          <Checkbox
            checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-[10px] text-[var(--color-text-tertiary)]">
            {selectedIds.size === filteredItems.length ? 'Deselect all' : 'Select all'}
          </span>
        </div>
      )}

      {/* ── Question List ── */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-1">
          <AnimatePresence>
            {filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 px-4"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] mb-4">
                  <ClipboardCheck size={24} />
                </div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">No questions in bank yet</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1 text-center">
                  Create questions in your exams and they&apos;ll automatically appear here.
                </p>
              </motion.div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = selectedIds.has(item.question.id);
                return (
                  <motion.div
                    key={item.question.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className={cn(
                      'group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-[#FF3333]/5 border border-[#FF3333]/20'
                        : 'hover:bg-[var(--color-bg-overlay)]/50 border border-transparent'
                    )}
                    onClick={() => toggleSelect(item.question.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(item.question.id)}
                      className="mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--color-text-primary)] truncate">
                        {truncate(item.question.text || 'Untitled question', 80)}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {getTypeBadge(item.question.type)}
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                        {item.usedInExams > 0 && (
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">
                            Used in {item.usedInExams} exam{item.usedInExams > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* ── Footer: Add Selected ── */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          className="border-t border-[var(--color-border)] px-4 py-3"
        >
          <Button
            onClick={handleAddSelected}
            className="w-full bg-[#FF3333] hover:bg-[#FF3333]/90 text-white"
          >
            <Plus size={14} className="mr-1.5" />
            Add selected ({selectedIds.size}) to exam
          </Button>
        </motion.div>
      )}
    </div>
  );
}
