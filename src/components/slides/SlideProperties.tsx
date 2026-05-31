'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SlideElement, Slide, DeckSettings, SlideTransition } from '@/lib/slides/types';
import { DEFAULT_TRANSITION } from '@/lib/slides/types';
import { TransitionPicker } from './TransitionPicker';
import { cn } from '@/lib/utils';

/* ── Property Section ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">
        {title}
      </h4>
      {children}
    </div>
  );
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-[11px] text-[var(--color-text-secondary)] w-10 shrink-0">{label}</Label>
      {children}
    </div>
  );
}

/* ── Slide Properties Panel ── */

interface SlidePropertiesProps {
  selectedElement: SlideElement | null;
  slide: Slide | null;
  deckSettings: DeckSettings;
  onUpdateElement: (updates: Partial<SlideElement>) => void;
  onUpdateSlide: (updates: Partial<Slide>) => void;
  onUpdateDeckSettings: (updates: Partial<DeckSettings>) => void;
  onApplyTransitionToAll?: (transition: SlideTransition) => void;
}

export function SlideProperties({
  selectedElement,
  slide,
  deckSettings,
  onUpdateElement,
  onUpdateSlide,
  onUpdateDeckSettings,
  onApplyTransitionToAll,
}: SlidePropertiesProps) {
  // Ensure transition is always a valid SlideTransition object
  const currentTransition: SlideTransition = slide?.transition ?? { ...DEFAULT_TRANSITION };

  return (
    <div className="flex w-[260px] shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--color-border)]">
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          Properties
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          {/* ── Deck Settings ── */}
          <Section title="Deck">
            <PropRow label="Theme">
              <select
                value={deckSettings.theme}
                onChange={(e) => onUpdateDeckSettings({ theme: e.target.value })}
                className="flex-1 h-7 rounded border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              >
                <option value="default">Default</option>
                <option value="minimal">Minimal</option>
                <option value="bold">Bold</option>
                <option value="elegant">Elegant</option>
              </select>
            </PropRow>
            <PropRow label="Ratio">
              <select
                value={deckSettings.aspectRatio}
                onChange={(e) => onUpdateDeckSettings({ aspectRatio: e.target.value as '16:9' | '4:3' })}
                className="flex-1 h-7 rounded border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              >
                <option value="16:9">16:9</option>
                <option value="4:3">4:3</option>
              </select>
            </PropRow>
          </Section>

          <Separator />

          {/* ── Slide Properties ── */}
          {slide && (
            <Section title="Slide">
              <PropRow label="BG">
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={slide.background}
                    onChange={(e) => onUpdateSlide({ background: e.target.value })}
                    className="h-6 w-6 rounded cursor-pointer border border-[var(--color-border)]"
                  />
                  <Input
                    value={slide.background}
                    onChange={(e) => onUpdateSlide({ background: e.target.value })}
                    className="h-7 text-xs font-mono"
                  />
                </div>
              </PropRow>
            </Section>
          )}

          <Separator />

          {/* ── Transition Section ── */}
          {slide && (
            <Section title="Transition">
              <TransitionPicker
                transition={currentTransition}
                onChange={(t) => onUpdateSlide({ transition: t })}
                onApplyToAll={() => onApplyTransitionToAll?.(currentTransition)}
              />
            </Section>
          )}

          <Separator />

          {/* ── Element Properties ── */}
          {selectedElement ? (
            <Section title={`Element (${selectedElement.type})`}>
              {/* Position & Size */}
              <div className="grid grid-cols-2 gap-2">
                <PropRow label="X">
                  <Input
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => onUpdateElement({ x: Number(e.target.value) })}
                    className="h-7 text-xs"
                    min={0}
                    max={100}
                  />
                </PropRow>
                <PropRow label="Y">
                  <Input
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => onUpdateElement({ y: Number(e.target.value) })}
                    className="h-7 text-xs"
                    min={0}
                    max={100}
                  />
                </PropRow>
                <PropRow label="W">
                  <Input
                    type="number"
                    value={Math.round(selectedElement.width)}
                    onChange={(e) => onUpdateElement({ width: Number(e.target.value) })}
                    className="h-7 text-xs"
                    min={1}
                    max={100}
                  />
                </PropRow>
                <PropRow label="H">
                  <Input
                    type="number"
                    value={Math.round(selectedElement.height)}
                    onChange={(e) => onUpdateElement({ height: Number(e.target.value) })}
                    className="h-7 text-xs"
                    min={1}
                    max={100}
                  />
                </PropRow>
              </div>

              {/* Transform */}
              <div className="grid grid-cols-2 gap-2">
                <PropRow label="Rot">
                  <Input
                    type="number"
                    value={Math.round(selectedElement.rotation)}
                    onChange={(e) => onUpdateElement({ rotation: Number(e.target.value) })}
                    className="h-7 text-xs"
                    step={5}
                  />
                </PropRow>
                <PropRow label="Opac">
                  <Input
                    type="number"
                    value={Math.round(selectedElement.opacity * 100)}
                    onChange={(e) => onUpdateElement({ opacity: Number(e.target.value) / 100 })}
                    className="h-7 text-xs"
                    min={0}
                    max={100}
                  />
                </PropRow>
              </div>

              <Separator />

              {/* Text-specific */}
              {selectedElement.type === 'text' && (
                <>
                  <PropRow label="Color">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedElement.color ?? '#1C1B19'}
                        onChange={(e) => onUpdateElement({ color: e.target.value })}
                        className="h-6 w-6 rounded cursor-pointer border border-[var(--color-border)]"
                      />
                      <Input
                        value={selectedElement.color ?? '#1C1B19'}
                        onChange={(e) => onUpdateElement({ color: e.target.value })}
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                  </PropRow>
                  <PropRow label="Align">
                    <select
                      value={selectedElement.textAlign ?? 'left'}
                      onChange={(e) => onUpdateElement({ textAlign: e.target.value })}
                      className="flex-1 h-7 rounded border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </PropRow>
                </>
              )}

              {/* Shape-specific */}
              {selectedElement.type === 'shape' && (
                <>
                  <PropRow label="Fill">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedElement.fill ?? '#FF3333'}
                        onChange={(e) => onUpdateElement({ fill: e.target.value })}
                        className="h-6 w-6 rounded cursor-pointer border border-[var(--color-border)]"
                      />
                      <Input
                        value={selectedElement.fill ?? '#FF3333'}
                        onChange={(e) => onUpdateElement({ fill: e.target.value })}
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                  </PropRow>
                  <PropRow label="Stroke">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedElement.stroke ?? 'transparent'}
                        onChange={(e) => onUpdateElement({ stroke: e.target.value })}
                        className="h-6 w-6 rounded cursor-pointer border border-[var(--color-border)]"
                      />
                      <Input
                        value={selectedElement.stroke ?? 'transparent'}
                        onChange={(e) => onUpdateElement({ stroke: e.target.value })}
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                  </PropRow>
                  <PropRow label="Stroke W">
                    <Input
                      type="number"
                      value={selectedElement.strokeWidth ?? 0}
                      onChange={(e) => onUpdateElement({ strokeWidth: Number(e.target.value) })}
                      className="h-7 text-xs"
                      min={0}
                      max={20}
                    />
                  </PropRow>
                  <PropRow label="Shape">
                    <select
                      value={selectedElement.shapeType ?? 'rectangle'}
                      onChange={(e) => onUpdateElement({ shapeType: e.target.value as SlideElement['shapeType'] })}
                      className="flex-1 h-7 rounded border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    >
                      <option value="rectangle">Rectangle</option>
                      <option value="rounded">Rounded</option>
                      <option value="circle">Circle</option>
                      <option value="diamond">Diamond</option>
                    </select>
                  </PropRow>
                </>
              )}

              {/* Table-specific */}
              {selectedElement.type === 'table' && (
                <div className="grid grid-cols-2 gap-2">
                  <PropRow label="Rows">
                    <Input
                      type="number"
                      value={selectedElement.rows ?? 3}
                      onChange={(e) => onUpdateElement({ rows: Number(e.target.value) })}
                      className="h-7 text-xs"
                      min={1}
                      max={20}
                    />
                  </PropRow>
                  <PropRow label="Cols">
                    <Input
                      type="number"
                      value={selectedElement.cols ?? 3}
                      onChange={(e) => onUpdateElement({ cols: Number(e.target.value) })}
                      className="h-7 text-xs"
                      min={1}
                      max={10}
                    />
                  </PropRow>
                </div>
              )}

              {/* Image-specific */}
              {selectedElement.type === 'image' && (
                <PropRow label="URL">
                  <Input
                    value={selectedElement.src ?? ''}
                    onChange={(e) => onUpdateElement({ src: e.target.value })}
                    placeholder="https://..."
                    className="h-7 text-xs"
                  />
                </PropRow>
              )}

              {/* Z-Index */}
              <PropRow label="z-Idx">
                <Input
                  type="number"
                  value={selectedElement.zIndex}
                  onChange={(e) => onUpdateElement({ zIndex: Number(e.target.value) })}
                  className="h-7 text-xs"
                />
              </PropRow>
            </Section>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </div>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Select an element to edit its properties
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── Presenter Notes ── */}
      {slide && (
        <div className="border-t border-[var(--color-border)] p-3">
          <Label className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-1.5 block">
            Speaker Notes
          </Label>
          <Textarea
            value={slide.notes}
            onChange={(e) => onUpdateSlide({ notes: e.target.value })}
            placeholder="Add speaker notes..."
            className="min-h-[60px] max-h-[120px] text-xs resize-none"
          />
        </div>
      )}
    </div>
  );
}
