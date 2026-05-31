'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

/* ── Types ── */

interface DocWordGoalsProps {
  wordCount: number;
  docId: string;
}

/* ── Storage helpers ── */

function getStoredGoal(docId: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(`doc-goal-${docId}`);
    return val ? parseInt(val, 10) : null;
  } catch {
    return null;
  }
}

function setStoredGoal(docId: string, goal: number) {
  if (typeof window === 'undefined') return;
  try {
    if (goal > 0) {
      localStorage.setItem(`doc-goal-${docId}`, String(goal));
    } else {
      localStorage.removeItem(`doc-goal-${docId}`);
    }
  } catch {
    // ignore
  }
}

/* ════════════════════════════════════════════════════
   DOC WORD GOALS
   ════════════════════════════════════════════════════ */

export function DocWordGoals({ wordCount, docId }: DocWordGoalsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const hasCelebrated = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Load goal from localStorage (lazy initializer) ── */
  const [goal, setGoal] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = getStoredGoal(docId);
    return stored && stored > 0 ? stored : null;
  });

  /* ── Focus input when editing ── */
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  /* ── Save goal ── */
  const saveGoal = useCallback(
    (value: string) => {
      const num = parseInt(value, 10);
      if (num > 0) {
        setGoal(num);
        setStoredGoal(docId, num);
        hasCelebrated.current = wordCount >= num;
      } else {
        setGoal(null);
        setStoredGoal(docId, 0);
      }
      setIsEditing(false);
    },
    [docId, wordCount],
  );

  /* ── Celebration when goal is reached ── */
  useEffect(() => {
    if (!goal || hasCelebrated.current) return;
    if (wordCount >= goal) {
      hasCelebrated.current = true;
      const timer = setTimeout(() => {
        setIsPulsing(true);
        toast.success('Goal reached! 🎉', {
          description: `You hit your ${goal.toLocaleString()} word target!`,
        });
        setTimeout(() => setIsPulsing(false), 2000);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [wordCount, goal]);

  /* ── Computed values ── */
  const progress = goal && goal > 0 ? Math.min(wordCount / goal, 1) : 0;
  const circumference = 2 * Math.PI * 9; // radius=9 → ~56.55
  const strokeDashoffset = circumference * (1 - progress);

  /* ── No goal set: show a button to set one ── */
  if (!goal) {
    return (
      <button
        type="button"
        className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-secondary)]"
        onClick={() => {
          setInputValue('');
          setIsEditing(true);
        }}
        title="Set word goal"
      >
        <Target size={12} />
        <span>Set goal</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          min={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => saveGoal(inputValue)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveGoal(inputValue);
            if (e.key === 'Escape') setIsEditing(false);
          }}
          className="w-16 rounded border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-1.5 py-0.5 text-[11px] text-[var(--color-text-primary)] outline-none focus:ring-1 focus:ring-[var(--color-accent)] tabular-nums"
        />
      ) : (
        <button
          type="button"
          className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-secondary)]"
          onClick={() => {
            setInputValue(String(goal));
            setIsEditing(true);
          }}
          title="Edit word goal"
        >
          {/* ── Progress Ring ── */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            className={cn(
              'shrink-0 transition-transform',
              isPulsing && 'animate-[pulse_0.6s_ease-in-out_3]',
            )}
          >
            {/* Background circle */}
            <circle
              cx="10"
              cy="10"
              r="9"
              fill="none"
              stroke="var(--color-bg-overlay)"
              strokeWidth="2"
            />
            {/* Progress circle */}
            <circle
              cx="10"
              cy="10"
              r="9"
              fill="none"
              stroke="#FF3333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 10 10)"
              className="transition-all duration-500 ease-out"
            />
            {/* Goal reached checkmark */}
            {wordCount >= goal && (
              <CheckCircle2
                x="4"
                y="4"
                width="12"
                height="12"
                className="text-[#FF3333]"
                style={{ fill: '#FF3333' }}
              />
            )}
          </svg>

          <span className="tabular-nums">
            {wordCount.toLocaleString()} / {goal.toLocaleString()} words
          </span>
        </button>
      )}
    </div>
  );
}
