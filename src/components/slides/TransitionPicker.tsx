'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';
import type { SlideTransition } from '@/lib/slides/types';
import { TRANSITION_TYPES, EASING_OPTIONS } from '@/lib/slides/transitions';
import { cn } from '@/lib/utils';

interface TransitionPickerProps {
  transition: SlideTransition;
  onChange: (t: SlideTransition) => void;
  onApplyToAll: () => void;
}

export function TransitionPicker({ transition, onChange, onApplyToAll }: TransitionPickerProps) {
  return (
    <div className="space-y-3">
      {/* Transition type grid — 2 columns */}
      <div className="grid grid-cols-2 gap-1.5">
        {TRANSITION_TYPES.map((t) => (
          <button
            key={t.type}
            type="button"
            title={t.description}
            onClick={() => onChange({ ...transition, type: t.type })}
            className={cn(
              'flex flex-col items-start gap-0 rounded-md px-2.5 py-2 text-left transition-colors',
              transition.type === t.type
                ? 'bg-[var(--brand-muted)] text-[#FF3333] border border-[var(--brand-border)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] border border-transparent',
            )}
          >
            <span className="text-[11px] font-medium leading-tight">{t.label}</span>
            <span className="text-[9px] text-[var(--color-text-tertiary)] leading-tight mt-0.5">{t.description}</span>
          </button>
        ))}
      </div>

      {/* Duration slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--color-text-secondary)]">Duration</span>
          <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] tabular-nums">
            {transition.duration}ms
          </span>
        </div>
        <Slider
          value={[transition.duration]}
          min={200}
          max={1500}
          step={50}
          onValueChange={([v]) => onChange({ ...transition, duration: v })}
          className="w-full"
        />
      </div>

      {/* Easing dropdown */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-[var(--color-text-secondary)]">Easing</span>
        <select
          value={transition.easing}
          onChange={(e) =>
            onChange({ ...transition, easing: e.target.value as SlideTransition['easing'] })
          }
          className="w-full h-7 rounded border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        >
          {EASING_OPTIONS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </div>

      {/* Apply to all */}
      <button
        type="button"
        onClick={onApplyToAll}
        className="w-full mt-1 rounded-md bg-[var(--brand-muted)] px-3 py-1.5 text-[11px] font-medium text-[#FF3333] hover:bg-[var(--brand-muted-hover)] transition-colors border border-[var(--brand-border)]"
      >
        Apply to all slides
      </button>
    </div>
  );
}
