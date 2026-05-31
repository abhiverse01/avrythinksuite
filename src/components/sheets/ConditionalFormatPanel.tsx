'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Bold, Italic, Underline } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ── Types ──

export interface ConditionalFormatRule {
  id: string;
  range: string;
  condition:
    | 'greater-than'
    | 'less-than'
    | 'between'
    | 'equal-to'
    | 'text-contains'
    | 'is-empty'
    | 'is-not-empty';
  value: string;
  value2?: string; // for 'between'
  format: {
    textColor: string;
    bgColor: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
}

interface ConditionalFormatPanelProps {
  rules: ConditionalFormatRule[];
  onRulesChange: (rules: ConditionalFormatRule[]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const CONDITIONS: { value: ConditionalFormatRule['condition']; label: string }[] = [
  { value: 'greater-than', label: 'Greater than' },
  { value: 'less-than', label: 'Less than' },
  { value: 'between', label: 'Between' },
  { value: 'equal-to', label: 'Equal to' },
  { value: 'text-contains', label: 'Text contains' },
  { value: 'is-empty', label: 'Is empty' },
  { value: 'is-not-empty', label: 'Is not empty' },
];

function createDefaultRule(): ConditionalFormatRule {
  return {
    id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    range: 'A1:A10',
    condition: 'greater-than',
    value: '0',
    format: {
      textColor: '#FF3333',
      bgColor: 'rgba(255, 51, 51, 0.1)',
      bold: false,
      italic: false,
      underline: false,
    },
  };
}

function RulePreview({ format }: { format: ConditionalFormatRule['format'] }) {
  return (
    <div
      className="flex items-center justify-center rounded border border-[var(--color-border)] text-sm px-3 py-1.5 min-w-[80px]"
      style={{
        color: format.textColor,
        backgroundColor: format.bgColor,
        fontWeight: format.bold ? 700 : 400,
        fontStyle: format.italic ? 'italic' : 'normal',
        textDecoration: format.underline ? 'underline' : undefined,
      }}
    >
      Sample
    </div>
  );
}

/**
 * ConditionalFormatPanel — Right-side panel for managing conditional formatting rules.
 */
export function ConditionalFormatPanel({
  rules,
  onRulesChange,
  isOpen,
}: ConditionalFormatPanelProps) {
  // ── Add Rule ──
  const handleAddRule = useCallback(() => {
    const newRule = createDefaultRule();
    onRulesChange([...rules, newRule]);
  }, [rules, onRulesChange]);

  // ── Delete Rule ──
  const handleDeleteRule = useCallback(
    (id: string) => {
      onRulesChange(rules.filter((r) => r.id !== id));
    },
    [rules, onRulesChange],
  );

  // ── Update Rule ──
  const handleUpdateRule = useCallback(
    (id: string, patch: Partial<ConditionalFormatRule>) => {
      onRulesChange(
        rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      );
    },
    [rules, onRulesChange],
  );

  // ── Update Format ──
  const handleUpdateFormat = useCallback(
    (id: string, patch: Partial<ConditionalFormatRule['format']>) => {
      onRulesChange(
        rules.map((r) =>
          r.id === id ? { ...r, format: { ...r.format, ...patch } } : r,
        ),
      );
    },
    [rules, onRulesChange],
  );

  // ── Move Rule (reorder) ──
  const handleMoveRule = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const idx = rules.findIndex((r) => r.id === id);
      if (idx === -1) return;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= rules.length) return;
      const next = [...rules];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      onRulesChange(next);
    },
    [rules, onRulesChange],
  );

  if (!isOpen) return null;

  return (
    <div className="w-72 shrink-0 border-l border-[var(--color-border)] bg-[var(--color-bg-surface)] flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="px-3 py-2.5 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Conditional Formatting
        </h3>
        <Button
          size="sm"
          className="h-6 text-xs gap-1 px-2"
          onClick={handleAddRule}
        >
          <Plus size={12} />
          Add Rule
        </Button>
      </div>

      {/* ── Rules List ── */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {rules.length === 0 && (
          <p className="text-xs text-[var(--color-text-tertiary)] text-center py-8">
            No rules yet. Click &quot;Add Rule&quot; to create one.
          </p>
        )}

        {rules.map((rule, idx) => (
          <div
            key={rule.id}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 flex flex-col gap-2.5"
          >
            {/* ── Rule Header with move controls ── */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                Rule {idx + 1}
              </span>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5"
                  disabled={idx === 0}
                  onClick={() => handleMoveRule(rule.id, 'up')}
                >
                  <ChevronUp size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5"
                  disabled={idx === rules.length - 1}
                  onClick={() => handleMoveRule(rule.id, 'down')}
                >
                  <ChevronDown size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-[var(--color-destructive)]"
                  onClick={() => handleDeleteRule(rule.id)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>

            {/* ── Range ── */}
            <div className="flex flex-col gap-1">
              <Label className="text-[11px] text-[var(--color-text-tertiary)]">
                Apply to
              </Label>
              <Input
                className="h-7 text-xs font-mono"
                value={rule.range}
                onChange={(e) => handleUpdateRule(rule.id, { range: e.target.value })}
                placeholder="A1:D10"
              />
            </div>

            {/* ── Condition ── */}
            <div className="flex flex-col gap-1">
              <Label className="text-[11px] text-[var(--color-text-tertiary)]">
                Format cells if
              </Label>
              <Select
                value={rule.condition}
                onValueChange={(v) =>
                  handleUpdateRule(rule.id, {
                    condition: v as ConditionalFormatRule['condition'],
                  })
                }
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Value inputs ── */}
            {rule.condition !== 'is-empty' && rule.condition !== 'is-not-empty' && (
              <div className="flex flex-col gap-1">
                <Label className="text-[11px] text-[var(--color-text-tertiary)]">
                  {rule.condition === 'between' ? 'Value 1' : 'Value'}
                </Label>
                <Input
                  className="h-7 text-xs"
                  value={rule.value}
                  onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                  placeholder="0"
                />
              </div>
            )}

            {rule.condition === 'between' && (
              <div className="flex flex-col gap-1">
                <Label className="text-[11px] text-[var(--color-text-tertiary)]">
                  Value 2
                </Label>
                <Input
                  className="h-7 text-xs"
                  value={rule.value2 || ''}
                  onChange={(e) => handleUpdateRule(rule.id, { value2: e.target.value })}
                  placeholder="100"
                />
              </div>
            )}

            {/* ── Format Options ── */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] text-[var(--color-text-tertiary)]">
                Format
              </Label>

              <div className="flex items-center gap-2">
                {/* Text Color */}
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="color"
                    value={rule.format.textColor}
                    onChange={(e) =>
                      handleUpdateFormat(rule.id, { textColor: e.target.value })
                    }
                    className="w-6 h-6 rounded border border-[var(--color-border)] cursor-pointer"
                  />
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">Text</span>
                </label>

                {/* BG Color */}
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="color"
                    value={rule.format.bgColor.startsWith('rgba')
                      ? '#FF3333'
                      : rule.format.bgColor}
                    onChange={(e) =>
                      handleUpdateFormat(rule.id, { bgColor: e.target.value })
                    }
                    className="w-6 h-6 rounded border border-[var(--color-border)] cursor-pointer"
                  />
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">Fill</span>
                </label>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant={rule.format.bold ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn('size-6 shrink-0', rule.format.bold && 'bg-[var(--color-accent)]/20')}
                  onClick={() =>
                    handleUpdateFormat(rule.id, { bold: !rule.format.bold })
                  }
                >
                  <Bold size={12} />
                </Button>
                <Button
                  variant={rule.format.italic ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn('size-6 shrink-0', rule.format.italic && 'bg-[var(--color-accent)]/20')}
                  onClick={() =>
                    handleUpdateFormat(rule.id, { italic: !rule.format.italic })
                  }
                >
                  <Italic size={12} />
                </Button>
                <Button
                  variant={rule.format.underline ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn('size-6 shrink-0', rule.format.underline && 'bg-[var(--color-accent)]/20')}
                  onClick={() =>
                    handleUpdateFormat(rule.id, { underline: !rule.format.underline })
                  }
                >
                  <Underline size={12} />
                </Button>
              </div>
            </div>

            {/* ── Preview ── */}
            <div className="flex flex-col gap-1">
              <Label className="text-[11px] text-[var(--color-text-tertiary)]">
                Preview
              </Label>
              <RulePreview format={rule.format} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
