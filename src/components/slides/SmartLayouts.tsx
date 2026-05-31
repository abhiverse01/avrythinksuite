'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { SlideElement } from '@/lib/slides/types';
import { createDefaultElement } from '@/lib/slides/types';
import { cn } from '@/lib/utils';

/* ── Layout definitions ── */

interface LayoutDef {
  id: string;
  name: string;
  description: string;
  getElements: () => SlideElement[];
}

function gid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const LAYOUTS: LayoutDef[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Empty slide',
    getElements: () => [],
  },
  {
    id: 'title-only',
    name: 'Title Only',
    description: 'Centered title',
    getElements: () => [
      createDefaultElement('text', {
        id: gid('el'),
        x: 10, y: 30, width: 80, height: 20,
        content: 'Slide Title',
        fontSize: 40, fontWeight: 700, textAlign: 'center', color: '#1C1B19',
      }),
    ],
  },
  {
    id: 'title-content',
    name: 'Title + Content',
    description: 'Title with body text',
    getElements: () => [
      createDefaultElement('text', {
        id: gid('el'),
        x: 8, y: 6, width: 84, height: 12,
        content: 'Slide Title',
        fontSize: 32, fontWeight: 700, textAlign: 'left', color: '#1C1B19',
      }),
      createDefaultElement('shape', {
        id: gid('el'),
        x: 8, y: 18, width: 30, height: 0.5,
        shapeType: 'rectangle',
        fill: '#FF3333',
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 8, y: 22, width: 84, height: 50,
        content: 'Add your content here. This text block supports editing for longer descriptions.',
        fontSize: 18, fontWeight: 400, textAlign: 'left', color: '#6B6A63',
      }),
    ],
  },
  {
    id: 'two-columns',
    name: 'Two Columns',
    description: 'Side by side content',
    getElements: () => [
      createDefaultElement('text', {
        id: gid('el'),
        x: 5, y: 5, width: 90, height: 10,
        content: 'Two Columns',
        fontSize: 28, fontWeight: 700, textAlign: 'center', color: '#1C1B19',
      }),
      createDefaultElement('shape', {
        id: gid('el'),
        x: 4, y: 17, width: 42, height: 60,
        shapeType: 'rounded', fill: '#FFF0F0', stroke: '#FFCCCC', strokeWidth: 1,
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 7, y: 20, width: 36, height: 54,
        content: 'Left column content goes here',
        fontSize: 16, fontWeight: 400, textAlign: 'center', color: '#1C1B19',
      }),
      createDefaultElement('shape', {
        id: gid('el'),
        x: 54, y: 17, width: 42, height: 60,
        shapeType: 'rounded', fill: '#FFF0F0', stroke: '#FFCCCC', strokeWidth: 1,
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 57, y: 20, width: 36, height: 54,
        content: 'Right column content goes here',
        fontSize: 16, fontWeight: 400, textAlign: 'center', color: '#1C1B19',
      }),
    ],
  },
  {
    id: 'title-image-left',
    name: 'Title + Image Left',
    description: 'Image on left, text right',
    getElements: () => [
      createDefaultElement('text', {
        id: gid('el'),
        x: 8, y: 6, width: 84, height: 10,
        content: 'Title',
        fontSize: 28, fontWeight: 700, textAlign: 'left', color: '#1C1B19',
      }),
      createDefaultElement('image', {
        id: gid('el'),
        x: 5, y: 20, width: 42, height: 55,
        src: '',
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 52, y: 22, width: 43, height: 50,
        content: 'Add your descriptive text alongside the image.',
        fontSize: 16, fontWeight: 400, textAlign: 'left', color: '#6B6A63',
      }),
    ],
  },
  {
    id: 'title-image-right',
    name: 'Title + Image Right',
    description: 'Text left, image right',
    getElements: () => [
      createDefaultElement('text', {
        id: gid('el'),
        x: 8, y: 6, width: 84, height: 10,
        content: 'Title',
        fontSize: 28, fontWeight: 700, textAlign: 'left', color: '#1C1B19',
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 5, y: 22, width: 43, height: 50,
        content: 'Add your descriptive text alongside the image.',
        fontSize: 16, fontWeight: 400, textAlign: 'left', color: '#6B6A63',
      }),
      createDefaultElement('image', {
        id: gid('el'),
        x: 53, y: 20, width: 42, height: 55,
        src: '',
      }),
    ],
  },
  {
    id: 'image-full-bleed',
    name: 'Image Full Bleed',
    description: 'Full-slide image with overlay text',
    getElements: () => [
      createDefaultElement('image', {
        id: gid('el'),
        x: 0, y: 0, width: 100, height: 100,
        src: '',
      }),
      createDefaultElement('shape', {
        id: gid('el'),
        x: 0, y: 0, width: 100, height: 100,
        shapeType: 'rectangle',
        fill: 'rgba(0,0,0,0.35)',
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 8, y: 30, width: 84, height: 15,
        content: 'Image Overlay Title',
        fontSize: 36, fontWeight: 700, textAlign: 'center', color: '#FFFFFF',
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 15, y: 50, width: 70, height: 10,
        content: 'Subtitle text',
        fontSize: 18, fontWeight: 400, textAlign: 'center', color: '#FFFFFFCC',
      }),
    ],
  },
  {
    id: 'three-columns',
    name: 'Three Columns',
    description: 'Three equal columns',
    getElements: () => [
      createDefaultElement('text', {
        id: gid('el'),
        x: 5, y: 5, width: 90, height: 10,
        content: 'Three Columns',
        fontSize: 28, fontWeight: 700, textAlign: 'center', color: '#1C1B19',
      }),
      ...['Column 1', 'Column 2', 'Column 3'].map((label, i) => [
        createDefaultElement('shape', {
          id: gid('el'),
          x: 3 + i * 32, y: 18, width: 28, height: 58,
          shapeType: 'rounded', fill: i === 1 ? '#FFF0F0' : '#F5F5F4', stroke: '#E0E0E0', strokeWidth: 1,
        }),
        createDefaultElement('text', {
          id: gid('el'),
          x: 5 + i * 32, y: 21, width: 24, height: 52,
          content: `${label}\n\nContent goes here`,
          fontSize: 14, fontWeight: 500, textAlign: 'center', color: '#1C1B19',
        }),
      ]).flat(),
    ],
  },
  {
    id: 'comparison',
    name: 'Comparison',
    description: 'Before/after or vs layout',
    getElements: () => [
      createDefaultElement('text', {
        id: gid('el'),
        x: 5, y: 5, width: 90, height: 10,
        content: 'Comparison',
        fontSize: 28, fontWeight: 700, textAlign: 'center', color: '#1C1B19',
      }),
      createDefaultElement('shape', {
        id: gid('el'),
        x: 4, y: 18, width: 42, height: 60,
        shapeType: 'rounded', fill: '#E8F5E9', stroke: '#A5D6A7', strokeWidth: 1,
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 7, y: 20, width: 36, height: 8,
        content: 'BEFORE',
        fontSize: 20, fontWeight: 700, textAlign: 'center', color: '#2E7D32',
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 7, y: 32, width: 36, height: 42,
        content: 'Describe the previous state',
        fontSize: 14, fontWeight: 400, textAlign: 'center', color: '#6B6A63',
      }),
      createDefaultElement('shape', {
        id: gid('el'),
        x: 54, y: 18, width: 42, height: 60,
        shapeType: 'rounded', fill: '#FFF0F0', stroke: '#FFCCCC', strokeWidth: 1,
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 57, y: 20, width: 36, height: 8,
        content: 'AFTER',
        fontSize: 20, fontWeight: 700, textAlign: 'center', color: '#FF3333',
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 57, y: 32, width: 36, height: 42,
        content: 'Describe the new state',
        fontSize: 14, fontWeight: 400, textAlign: 'center', color: '#6B6A63',
      }),
    ],
  },
  {
    id: 'title-bullets',
    name: 'Title + Bullets',
    description: 'Title with bullet points',
    getElements: () => [
      createDefaultElement('text', {
        id: gid('el'),
        x: 8, y: 6, width: 84, height: 12,
        content: 'Key Points',
        fontSize: 32, fontWeight: 700, textAlign: 'left', color: '#1C1B19',
      }),
      createDefaultElement('shape', {
        id: gid('el'),
        x: 8, y: 18, width: 30, height: 0.5,
        shapeType: 'rectangle', fill: '#FF3333',
      }),
      ...['First point', 'Second point', 'Third point', 'Fourth point', 'Fifth point'].map(
        (text, i) => [
          createDefaultElement('shape', {
            id: gid('el'),
            x: 10, y: 24 + i * 10, width: 1.5, height: 1.5,
            shapeType: 'circle', fill: '#FF3333',
          }),
          createDefaultElement('text', {
            id: gid('el'),
            x: 15, y: 22 + i * 10, width: 75, height: 8,
            content: text,
            fontSize: 16, fontWeight: 400, textAlign: 'left', color: '#1C1B19',
          }),
        ],
      ).flat(),
    ],
  },
  {
    id: 'quote',
    name: 'Quote',
    description: 'Large quotation slide',
    getElements: () => [
      createDefaultElement('shape', {
        id: gid('el'),
        x: 8, y: 20, width: 4, height: 30,
        shapeType: 'rectangle', fill: '#FF3333',
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 16, y: 20, width: 76, height: 25,
        content: '"Great things are done by a series of small things brought together."',
        fontSize: 22, fontWeight: 400, textAlign: 'left', color: '#1C1B19',
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 16, y: 52, width: 76, height: 8,
        content: '— Vincent Van Gogh',
        fontSize: 16, fontWeight: 600, textAlign: 'left', color: '#FF3333',
      }),
    ],
  },
  {
    id: 'section-header',
    name: 'Section Header',
    description: 'Section divider',
    getElements: () => [
      createDefaultElement('shape', {
        id: gid('el'),
        x: 42, y: 30, width: 16, height: 3,
        shapeType: 'rounded', fill: '#FF3333',
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 8, y: 38, width: 84, height: 15,
        content: 'Section Title',
        fontSize: 42, fontWeight: 700, textAlign: 'center', color: '#1C1B19',
      }),
      createDefaultElement('text', {
        id: gid('el'),
        x: 25, y: 56, width: 50, height: 8,
        content: 'Brief description of this section',
        fontSize: 16, fontWeight: 400, textAlign: 'center', color: '#6B6A63',
      }),
    ],
  },
];

/* ── Mini preview thumbnail for each layout ── */

function LayoutPreview({ layout }: { layout: LayoutDef }) {
  const elements = layout.getElements();
  return (
    <div className="relative w-full bg-white rounded-sm overflow-hidden" style={{ aspectRatio: '16/9' }}>
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: `${el.width}%`,
            height: `${el.height}%`,
            backgroundColor: el.type === 'shape' ? el.fill : 'transparent',
            borderRadius: el.shapeType === 'circle' ? '50%' : el.shapeType === 'rounded' ? '2px' : '0',
            opacity: el.type === 'image' ? 0.3 : el.opacity,
          }}
        >
          {el.type === 'text' && el.content && (
            <span
              className="block text-ellipsis overflow-hidden leading-tight"
              style={{
                fontSize: el.fontSize && el.fontSize >= 30 ? '5px' : el.fontSize && el.fontSize >= 20 ? '4px' : '3px',
                color: el.color,
                fontWeight: el.fontWeight,
                textAlign: el.textAlign as React.CSSProperties['textAlign'],
                whiteSpace: 'pre-line',
              }}
            >
              {el.content}
            </span>
          )}
          {el.type === 'image' && (
            <div className="w-full h-full bg-[var(--color-bg-elevated)] flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#A09F99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── SmartLayouts Dialog ── */

interface SmartLayoutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLayout: (layoutId: string) => void;
}

export function SmartLayouts({ open, onOpenChange, onSelectLayout }: SmartLayoutsProps) {
  const handleSelect = (layoutId: string) => {
    onSelectLayout(layoutId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Apply Layout</DialogTitle>
          <DialogDescription>
            Choose a layout to apply to the current slide. Existing elements will be replaced.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 overflow-y-auto pr-1 flex-1 py-1">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              type="button"
              onClick={() => handleSelect(layout.id)}
              className={cn(
                'group flex flex-col gap-1.5 rounded-lg border border-[var(--color-border)] p-2 text-left transition-all hover:border-[var(--brand-border)] hover:shadow-sm hover:ring-1 hover:ring-[var(--brand-muted)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
              )}
            >
              <LayoutPreview layout={layout} />
              <div className="min-h-0">
                <span className="text-[11px] font-medium text-[var(--color-text-primary)] block leading-tight">
                  {layout.name}
                </span>
                <span className="text-[9px] text-[var(--color-text-tertiary)] leading-tight">
                  {layout.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { LAYOUTS };
export type { LayoutDef };
