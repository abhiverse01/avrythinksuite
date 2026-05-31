'use client';

import React from 'react';
import {
  Type,
  ImagePlus,
  Square,
  Circle,
  RectangleHorizontal,
  Table2,
  Minus,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Lock,
  Unlock,
  LayoutGrid,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SlidesTool } from '@/lib/slides/types';
import { cn } from '@/lib/utils';

/* ── Tool definitions ── */

export interface ToolDef {
  id: SlidesTool;
  icon: React.ElementType;
  label: string;
  shortcut?: string;
}

export const INSERT_TOOLS: ToolDef[] = [
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'shape-rect', icon: RectangleHorizontal, label: 'Rectangle' },
  { id: 'shape-rounded', icon: Square, label: 'Rounded Rectangle' },
  { id: 'shape-circle', icon: Circle, label: 'Circle' },
  { id: 'image', icon: ImagePlus, label: 'Image' },
  { id: 'table', icon: Table2, label: 'Table' },
];

/* ── Toolbar Button ── */

function TBtn({
  icon: Icon,
  label,
  active = false,
  disabled = false,
  onClick,
  shortcut,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  shortcut?: string;
  accent?: boolean;
}) {
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)]',
              'disabled:opacity-40 disabled:pointer-events-none',
              active && accent
                ? 'bg-[var(--brand-muted)] text-[#FF3333]'
                : active && 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
            )}
          >
            <Icon size={16} strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {label}
          {shortcut && (
            <kbd className="ml-1.5 inline-flex h-4 items-center rounded border border-[var(--color-border)] px-1 font-mono text-[10px]">
              {shortcut}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ── Slide Toolbar Props ── */

interface SlideToolbarProps {
  activeTool: SlidesTool;
  onToolChange: (tool: SlidesTool) => void;
  hasSelection: boolean;
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleLock?: () => void;
  isLocked?: boolean;
  selectedFontSize?: number;
  onFontSizeChange?: (size: number) => void;
  onOpenLayouts?: () => void;
  onPresent?: () => void;
}

export function SlideToolbar({
  activeTool,
  onToolChange,
  hasSelection,
  onBold,
  onItalic,
  onUnderline,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleLock,
  isLocked,
  selectedFontSize,
  onFontSizeChange,
  onOpenLayouts,
  onPresent,
}: SlideToolbarProps) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-0.5 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 overflow-x-auto">
      {/* Insert tools */}
      {INSERT_TOOLS.map((tool) => (
        <TBtn
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          active={activeTool === tool.id}
          shortcut={tool.shortcut}
          onClick={() => onToolChange(tool.id)}
        />
      ))}

      <Separator orientation="vertical" className="mx-1.5 h-6" />

      {/* Layout button */}
      <TBtn
        icon={LayoutGrid}
        label="Layout"
        active={false}
        accent
        onClick={onOpenLayouts}
      />

      {/* Present button */}
      <TBtn
        icon={Play}
        label="Present (F5)"
        active={false}
        accent
        onClick={onPresent}
      />

      <Separator orientation="vertical" className="mx-1.5 h-6" />

      {/* Text formatting — only when something is selected */}
      {hasSelection && (
        <>
          {/* Font size */}
          <select
            value={selectedFontSize ?? 16}
            onChange={(e) => onFontSizeChange?.(Number(e.target.value))}
            className="h-7 w-16 rounded border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-1 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          >
            {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72].map((s) => (
              <option key={s} value={s}>{s}px</option>
            ))}
          </select>

          <TBtn icon={Bold} label="Bold" onClick={onBold} />
          <TBtn icon={Italic} label="Italic" onClick={onItalic} />
          <TBtn icon={Underline} label="Underline" onClick={onUnderline} />

          <Separator orientation="vertical" className="mx-1.5 h-6" />

          <TBtn icon={AlignLeft} label="Align Left" onClick={onAlignLeft} />
          <TBtn icon={AlignCenter} label="Align Center" onClick={onAlignCenter} />
          <TBtn icon={AlignRight} label="Align Right" onClick={onAlignRight} />

          <Separator orientation="vertical" className="mx-1.5 h-6" />

          <TBtn icon={MoveUp} label="Bring Forward" onClick={onMoveUp} />
          <TBtn icon={MoveDown} label="Send Backward" onClick={onMoveDown} />

          <TBtn icon={isLocked ? Lock : Unlock} label={isLocked ? 'Unlock' : 'Lock'} onClick={onToggleLock} />

          <TBtn icon={Copy} label="Duplicate" onClick={onDuplicate} />
          <TBtn icon={Trash2} label="Delete" onClick={onDelete} />
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Deselect tool indicator */}
      <span className="text-[11px] text-[var(--color-text-tertiary)]">
        {activeTool !== 'select' ? `Tool: ${INSERT_TOOLS.find(t => t.id === activeTool)?.label ?? activeTool}` : 'Select mode'}
      </span>
    </div>
  );
}
