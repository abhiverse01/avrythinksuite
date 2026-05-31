'use client';

import { useMemo, useState, useEffect } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Stop words list ── */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
  'should', 'may', 'might', 'must', 'can', 'could', 'of', 'in', 'to',
  'for', 'with', 'on', 'at', 'from', 'by', 'about', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because',
  'but', 'and', 'or', 'if', 'while', 'it', 'its', 'this', 'that',
  'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he',
  'him', 'his', 'she', 'her', 'they', 'them', 'their', 'what', 'which',
  'who',
]);

/* ── Types ── */

interface DocStatsPopoverProps {
  editor: Editor | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface WordFreq {
  word: string;
  count: number;
  pct: number;
}

/* ── Stat computation helpers ── */

function computeStats(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/) : [];
  const wordCount = words.length;
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s/g, '').length;

  // Sentences: split on '.', '!', '?'
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const sentenceCount = sentences.length || 1;

  // Paragraphs: non-empty lines
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const paragraphCount = paragraphs.length || 1;

  // Pages (500 words/page)
  const pages = Math.max(1, Math.ceil(wordCount / 500));

  // Reading time (200 wpm)
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Speaking time (130 wpm)
  const speakingTime = Math.max(1, Math.ceil(wordCount / 130));

  // Syllable count (rough estimate)
  function countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const match = word.match(/[aeiouy]{1,2}/g);
    return match ? match.length : 1;
  }

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  // Flesch-Kincaid Grade Level
  // FKGL = 0.39 * (total words / total sentences) + 11.8 * (total syllables / total words) - 15.59
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;
  const fleschKincaidGrade =
    0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

  // Flesch Reading Ease
  // FRE = 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const fleschReadingEase =
    206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  // Average sentence length (words)
  const avgSentenceLength = avgWordsPerSentence;

  // Top words (filter stop words)
  const freqMap = new Map<string, number>();
  for (const w of words) {
    const lower = w.toLowerCase().replace(/[^a-z0-9'-]/g, '');
    if (lower.length < 2 || STOP_WORDS.has(lower)) continue;
    freqMap.set(lower, (freqMap.get(lower) || 0) + 1);
  }

  const topWords: WordFreq[] = Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      pct: wordCount > 0 ? (count / wordCount) * 100 : 0,
    }));

  const maxFreq = topWords.length > 0 ? topWords[0].count : 1;

  return {
    wordCount,
    charCount,
    charNoSpaces,
    sentenceCount,
    paragraphCount,
    pages,
    readingTime,
    speakingTime,
    fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
    fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    topWords,
    maxFreq,
  };
}

/* ── Stat row component ── */

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
      <span className="text-xs font-medium tabular-nums text-[var(--color-text-primary)]">
        {value}
      </span>
    </div>
  );
}

/* ── Readability label helper ── */

function getReadabilityLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Very Easy', color: '#22C55E' };
  if (score >= 70) return { label: 'Easy', color: '#22C55E' };
  if (score >= 50) return { label: 'Moderate', color: '#EAB308' };
  if (score >= 30) return { label: 'Difficult', color: '#F97316' };
  return { label: 'Very Difficult', color: '#EF4444' };
}

/* ════════════════════════════════════════════════════
   DOC STATS POPOVER
   ════════════════════════════════════════════════════ */

export function DocStatsPopover({ editor, open, onOpenChange }: DocStatsPopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled && onOpenChange ? onOpenChange : setInternalOpen;

  const stats = useMemo(() => {
    if (!editor) return null;
    return computeStats(editor.getText());
  }, [editor, isOpen]); // recompute when popover opens

  /* ── ⌘⇧I shortcut ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, setOpen]);

  if (!editor) return null;

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-md text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)]"
          aria-label="Document statistics"
        >
          <BarChart3 size={15} strokeWidth={1.75} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="end" sideOffset={8}>
        {stats && (
          <div className="flex flex-col">
            {/* ── Header ── */}
            <div className="border-b border-[var(--color-border)] px-4 py-2.5">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Document Statistics
              </span>
            </div>

            {/* ── Overview ── */}
            <div className="px-4 py-3">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Overview
              </span>
              <div className="grid grid-cols-2 gap-x-4">
                <StatRow label="Words" value={stats.wordCount.toLocaleString()} />
                <StatRow label="Characters" value={stats.charCount.toLocaleString()} />
                <StatRow label="No spaces" value={stats.charNoSpaces.toLocaleString()} />
                <StatRow label="Sentences" value={stats.sentenceCount.toLocaleString()} />
                <StatRow label="Paragraphs" value={stats.paragraphCount.toLocaleString()} />
                <StatRow label="Pages" value={`${stats.pages} (~500 w/page)`} />
                <StatRow label="Reading time" value={`~${stats.readingTime} min`} />
                <StatRow label="Speaking time" value={`~${stats.speakingTime} min`} />
              </div>
            </div>

            {/* ── Top Words ── */}
            {stats.topWords.length > 0 && (
              <div className="border-t border-[var(--color-border)] px-4 py-3">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  Top Words
                </span>
                <div className="flex flex-col gap-1.5">
                  {stats.topWords.map((item) => (
                    <div key={item.word} className="flex items-center gap-2">
                      <span className="w-[72px] shrink-0 truncate text-xs text-[var(--color-text-secondary)]">
                        {item.word}
                      </span>
                      <div className="h-3.5 flex-1 overflow-hidden rounded-sm bg-[var(--color-bg-overlay)]">
                        <div
                          className="h-full rounded-sm bg-[#FF3333] transition-all duration-300"
                          style={{
                            width: `${Math.max(4, (item.count / stats.maxFreq) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-[var(--color-text-tertiary)]">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Readability ── */}
            <div className="border-t border-[var(--color-border)] px-4 py-3">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Readability
              </span>
              {(() => {
                const readability = getReadabilityLabel(stats.fleschReadingEase);
                return (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        Flesch Reading Ease
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-medium tabular-nums">
                        <span
                          className="inline-block size-2 rounded-full"
                          style={{ backgroundColor: readability.color }}
                        />
                        {stats.fleschReadingEase}
                      </span>
                    </div>
                    <div className="text-[10px] text-[var(--color-text-tertiary)] pl-0">
                      {readability.label}
                    </div>
                    <StatRow label="FK Grade Level" value={stats.fleschKincaidGrade} />
                    <StatRow label="Avg sentence length" value={`${stats.avgSentenceLength} words`} />
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
