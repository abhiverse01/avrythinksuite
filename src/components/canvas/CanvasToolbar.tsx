'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  MousePointer2,
  Square,
  Circle,
  Minus,
  ArrowUpRight,
  Pen,
  Type,
  StickyNote,
  ImagePlus,
  Eraser,
  Hand,
  Grid3X3,
  Shapes,
  Download,
  Spline,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Tool Definitions ── */

export interface CanvasToolDef {
  id: string;
  icon: LucideIcon;
  label: string;
  shortcut: string;
}

export const CANVAS_TOOLS: CanvasToolDef[] = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)', shortcut: 'V' },
  { id: 'rect', icon: Square, label: 'Rectangle (R)', shortcut: 'R' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse (E)', shortcut: 'E' },
  { id: 'line', icon: Minus, label: 'Line (L)', shortcut: 'L' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Arrow (A)', shortcut: 'A' },
  { id: 'pen', icon: Pen, label: 'Pen (P)', shortcut: 'P' },
  { id: 'text', icon: Type, label: 'Text (T)', shortcut: 'T' },
  { id: 'sticky', icon: StickyNote, label: 'Sticky (S)', shortcut: 'S' },
  { id: 'image', icon: ImagePlus, label: 'Image (I)', shortcut: 'I' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: '⌫' },
  { id: 'pan', icon: Hand, label: 'Pan (H)', shortcut: 'H' },
];

/* ── Advanced Tool Definitions ── */

export interface AdvancedToolDef {
  id: string;
  icon: LucideIcon;
  label: string;
}

export const ADVANCED_TOOLS: AdvancedToolDef[] = [
  { id: 'bezier-pen', icon: Spline, label: 'Bezier Pen (B)' },
  { id: 'grid', icon: Grid3X3, label: 'Grid & Rulers' },
  { id: 'components', icon: Shapes, label: 'Components' },
  { id: 'export-svg', icon: Download, label: 'Export SVG' },
];

export function getToolById(id: string): CanvasToolDef | undefined {
  return CANVAS_TOOLS.find((t) => t.id === id);
}

/* ── Keyboard shortcut mapping ── */

export const SHORTCUT_TO_TOOL: Record<string, string> = {
  v: 'select',
  r: 'rect',
  e: 'ellipse',
  l: 'line',
  a: 'arrow',
  p: 'pen',
  t: 'text',
  s: 'sticky',
  h: 'pan',
};

/* ── Tool Rail Button ── */

export function ToolRailButton({
  tool,
  active,
  onClick,
}: {
  tool: CanvasToolDef;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tool.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150',
        active
          ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)]',
      )}
      title={tool.label}
    >
      <Icon size={18} strokeWidth={1.5} />
    </button>
  );
}

/* ── Advanced Tool Rail Button ── */

export function AdvancedToolButton({
  tool,
  active,
  onClick,
}: {
  tool: AdvancedToolDef;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tool.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150',
        active
          ? 'bg-[rgba(255,51,51,0.12)] text-[#FF3333]'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)]',
      )}
      title={tool.label}
    >
      <Icon size={18} strokeWidth={1.5} />
    </button>
  );
}
