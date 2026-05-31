'use client';

import React from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Slide } from '@/lib/slides/types';
import { cn } from '@/lib/utils';

interface SlidePanelProps {
  slides: Slide[];
  activeSlideId: string;
  onSelectSlide: (id: string) => void;
  onAddSlide: () => void;
  onDeleteSlide: (id: string) => void;
  onDuplicateSlide: (id: string) => void;
  onReorderSlide?: (fromIndex: number, toIndex: number) => void;
}

export function SlidePanel({
  slides,
  activeSlideId,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
}: SlidePanelProps) {
  return (
    <div className="flex w-[200px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          Slides
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onAddSlide}
        >
          <Plus size={14} strokeWidth={2} />
        </Button>
      </div>

      {/* Thumbnails */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                'group relative cursor-pointer rounded-md border-2 transition-all',
                slide.id === activeSlideId
                  ? 'border-[var(--color-accent)] shadow-[0_0_0_1px_var(--color-accent-muted)]'
                  : 'border-transparent hover:border-[var(--color-border-strong)]',
              )}
              onClick={() => onSelectSlide(slide.id)}
            >
              {/* Mini slide preview */}
              <div
                className="relative w-full overflow-hidden rounded bg-white"
                style={{ aspectRatio: '16/9' }}
              >
                {/* Render a miniature version of the slide elements */}
                <div className="absolute inset-0" style={{ backgroundColor: slide.background }}>
                  {slide.elements.slice(0, 5).map((el) => (
                    <div
                      key={el.id}
                      className="absolute"
                      style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        width: `${el.width}%`,
                        height: `${el.height}%`,
                        transform: `rotate(${el.rotation}deg)`,
                        opacity: el.opacity,
                        backgroundColor: el.type === 'shape' ? el.fill : 'transparent',
                        borderRadius: el.shapeType === 'circle' ? '50%' : el.shapeType === 'rounded' ? '4px' : '0',
                      }}
                    >
                      {el.type === 'text' && (
                        <span className="text-[4px] leading-tight text-ellipsis overflow-hidden block" style={{ color: el.color }}>
                          {el.content}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Empty slide indicator */}
                  {slide.elements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] text-[var(--color-text-tertiary)]">Slide {index + 1}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Slide number */}
              <div className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-white tabular-nums">
                {index + 1}
              </div>

              {/* Action buttons — show on hover */}
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDuplicateSlide(slide.id); }}
                  className="flex h-5 w-5 items-center justify-center rounded bg-black/50 text-white hover:bg-black/70"
                >
                  <Copy size={10} />
                </button>
                {slides.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDeleteSlide(slide.id); }}
                    className="flex h-5 w-5 items-center justify-center rounded bg-black/50 text-white hover:bg-[var(--color-danger)]"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Slide count */}
      <div className="px-3 py-2 border-t border-[var(--color-border)]">
        <span className="text-[11px] text-[var(--color-text-tertiary)]">
          {slides.length} slide{slides.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
