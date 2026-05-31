'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  SlideElement,
  Slide,
  DeckSettings,
  SlidesTool,
  SlideTransition,
  DEFAULT_TRANSITION,
  createDefaultSlide,
  createDefaultElement,
} from '@/lib/slides/types';
import {
  getTransitionFromState,
  getTransitionToState,
} from '@/lib/slides/transitions';
import { SlidePanel } from './SlidePanel';
import { SlideToolbar } from './SlideToolbar';
import { SlideProperties } from './SlideProperties';
import { SmartLayouts, LAYOUTS } from './SmartLayouts';

/* ── Helpers ── */

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createInitialDeck(): { slides: Slide[]; settings: DeckSettings } {
  const slideId = generateId('slide');
  const slide: Slide = {
    id: slideId,
    elements: [
      createDefaultElement('text', {
        id: generateId('el'),
        x: 8,
        y: 8,
        width: 84,
        height: 15,
        content: 'Welcome to AvryThink Slides',
        fontSize: 32,
        fontWeight: 600,
        textAlign: 'center',
        color: '#1C1B19',
      }),
      createDefaultElement('text', {
        id: generateId('el'),
        x: 20,
        y: 30,
        width: 60,
        height: 10,
        content: 'Click elements to select, drag to move, and use the toolbar to add shapes and text.',
        fontSize: 14,
        textAlign: 'center',
        color: '#6B6A63',
      }),
      createDefaultElement('shape', {
        id: generateId('el'),
        x: 35,
        y: 55,
        width: 30,
        height: 20,
        shapeType: 'rounded',
        fill: '#FF3333',
      }),
    ],
    background: '#FFFFFF',
    transition: { ...DEFAULT_TRANSITION },
    notes: 'Welcome slide — introduce your topic here.',
    hidden: false,
  };
  return {
    slides: [slide],
    settings: { theme: 'default', aspectRatio: '16:9' },
  };
}

/* ── Resize Handle ── */

function ResizeHandles({
  onResizeStart,
}: {
  onResizeStart: (handle: string, e: React.MouseEvent) => void;
}) {
  const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'] as const;
  const cursorMap: Record<string, string> = {
    nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
    n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
  };
  const posMap: Record<string, string> = {
    nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
    ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
    se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
    n: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    s: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    e: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
    w: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <>
      {handles.map((h) => (
        <div
          key={h}
          className={cn('absolute size-2.5 rounded-full bg-white border-2 border-[var(--color-accent)] z-50', posMap[h])}
          style={{ cursor: cursorMap[h] }}
          onMouseDown={(e) => { e.stopPropagation(); onResizeStart(h, e); }}
        />
      ))}
    </>
  );
}

/* ── Element Renderer (used in both editor & present mode) ── */

function SlideElementRenderer({
  element,
  isSelected = false,
  isEditing = false,
  isPresentMode = false,
  onSelect,
  onDragStart,
  onResizeStart,
  onDoubleClick,
  onContentChange,
}: {
  element: SlideElement;
  isSelected?: boolean;
  isEditing?: boolean;
  isPresentMode?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onResizeStart?: (handle: string, e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  onContentChange?: (content: string) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync contentEditable
  useEffect(() => {
    if (contentRef.current && element.type === 'text' && !isEditing) {
      contentRef.current.textContent = element.content ?? '';
    }
  }, [element.content, element.type, isEditing]);

  return (
    <div
      className={cn(
        'absolute',
        isSelected ? 'ring-2 ring-[var(--color-accent)] ring-offset-1' : '',
        !isPresentMode && !element.locked ? 'cursor-move' : 'cursor-default',
      )}
      style={{
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${element.width}%`,
        height: `${element.height}%`,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity,
        zIndex: element.zIndex,
      }}
      onClick={(e) => { e.stopPropagation(); onSelect?.(e); }}
      onMouseDown={(e) => { if (!isEditing && !isPresentMode) onDragStart?.(e); }}
      onDoubleClick={onDoubleClick}
    >
      {/* Element content */}
      {element.type === 'text' && (
        <div
          ref={contentRef}
          contentEditable={isEditing && !isPresentMode}
          suppressContentEditableWarning
          onBlur={(e) => {
            if (isEditing) {
              onContentChange?.(e.currentTarget.textContent ?? '');
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              (e.target as HTMLElement).blur();
            }
            e.stopPropagation();
          }}
          className="w-full h-full outline-none overflow-hidden p-1"
          style={{
            fontSize: `${(element.fontSize ?? 16) * 0.28}px`,
            fontFamily: element.fontFamily ?? 'Inter, system-ui, sans-serif',
            fontWeight: element.fontWeight ?? 400,
            color: element.color ?? '#1C1B19',
            textAlign: element.textAlign as React.CSSProperties['textAlign'] ?? 'left',
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}
        >
          {element.content}
        </div>
      )}

      {element.type === 'shape' && (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: element.fill ?? '#FF3333',
            border: element.stroke && element.stroke !== 'transparent'
              ? `${element.strokeWidth ?? 2}px solid ${element.stroke}`
              : 'none',
            borderRadius: element.shapeType === 'circle' ? '50%'
              : element.shapeType === 'rounded' ? '12px'
              : element.shapeType === 'diamond' ? '4px'
              : '0',
            transform: element.shapeType === 'diamond' ? 'rotate(45deg) scale(0.75)' : 'none',
          }}
        />
      )}

      {element.type === 'image' && element.src && (
        <img
          src={element.src}
          className="w-full h-full object-cover pointer-events-none"
          alt=""
          draggable={false}
        />
      )}

      {element.type === 'image' && !element.src && (
        <div className="w-full h-full bg-[var(--color-bg-overlay)] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
      )}

      {element.type === 'table' && (
        <div className="w-full h-full overflow-hidden border border-[var(--color-border)]">
          <table className="w-full h-full border-collapse text-[8px]">
            <tbody>
              {Array.from({ length: element.rows ?? 3 }).map((_, r) => (
                <tr key={r}>
                  {Array.from({ length: element.cols ?? 3 }).map((_, c) => (
                    <td key={c} className="border border-[var(--color-border)] p-0.5">
                      {r === 0 && <span className="font-semibold">H{c + 1}</span>}
                      {r !== 0 && <span className="text-[var(--color-text-tertiary)]">{r},{c}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selection UI — only in editor mode */}
      {isSelected && !isPresentMode && onResizeStart && (
        <ResizeHandles onResizeStart={onResizeStart} />
      )}
    </div>
  );
}

/* ── Presentation Mode Overlay ── */

function PresentationOverlay({
  slides,
  initialSlideIndex,
  onClose,
}: {
  slides: Slide[];
  initialSlideIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [transitionPhase, setTransitionPhase] = useState<'entering' | 'idle'>('idle');
  const slideRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentIndex] ?? slides[0];

  const goToSlide = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= slides.length || newIndex === currentIndex || isTransitioning) return;

      setIsTransitioning(true);
      setPrevIndex(currentIndex);
      setTransitionPhase('entering');

      const duration = currentSlide.transition?.duration ?? 300;

      // After transition completes, finalize
      setTimeout(() => {
        setCurrentIndex(newIndex);
        setTransitionPhase('idle');
        setPrevIndex(null);
        setTimeout(() => setIsTransitioning(false), 50);
      }, duration);
    },
    [currentIndex, slides.length, isTransitioning, currentSlide.transition?.duration],
  );

  const goNext = useCallback(() => goToSlide(currentIndex + 1), [currentIndex, goToSlide]);
  const goPrev = useCallback(() => goToSlide(currentIndex - 1), [currentIndex, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          goPrev();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose]);

  const transition = currentSlide.transition ?? DEFAULT_TRANSITION;

  // Compute the animated style for the entering slide
  let animStyle: React.CSSProperties = {};
  if (transitionPhase === 'entering' && transition.type !== 'none') {
    animStyle = getTransitionToState(transition);
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 flex size-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        aria-label="Exit presentation"
      >
        <X size={20} />
      </button>

      {/* Slide counter */}
      <div className="absolute top-4 left-4 z-50 text-white/60 text-sm tabular-nums">
        {currentIndex + 1} / {slides.length}
      </div>

      {/* Previous slide (exiting, if transitioning) */}
      {prevIndex !== null && slides[prevIndex] && (
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{
            ...getTransitionToState(slides[prevIndex].transition ?? DEFAULT_TRANSITION),
            transition: `all ${transition.duration}ms ${
              transition.easing === 'spring'
                ? 'cubic-bezier(0.16, 1, 0.3, 1)'
                : transition.easing
            }`,
            animationDirection: 'reverse',
          }}
        >
          <div
            ref={slideRef}
            className="relative overflow-hidden shadow-2xl"
            style={{
              aspectRatio: '16/9',
              maxWidth: '100vw',
              maxHeight: '100vh',
              width: '100vw',
              height: '56.25vw',
              backgroundColor: slides[prevIndex].background,
            }}
          >
            <div className="absolute inset-0" style={{ backgroundColor: slides[prevIndex].background }} />
            {slides[prevIndex].elements.map((el) => (
              <SlideElementRenderer key={el.id} element={el} isPresentMode />
            ))}
          </div>
        </div>
      )}

      {/* Current slide */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={
          transitionPhase === 'entering' && transition.type !== 'none'
            ? {
                ...getTransitionFromState(transition),
                transition: `all ${transition.duration}ms ${
                  transition.easing === 'spring'
                    ? 'cubic-bezier(0.16, 1, 0.3, 1)'
                    : transition.easing
                }`,
                ...animStyle,
              }
            : {}
        }
      >
        <div
          className="relative overflow-hidden shadow-2xl"
          style={{
            aspectRatio: '16/9',
            maxWidth: '100vw',
            maxHeight: '100vh',
            width: '100vw',
            height: '56.25vw',
            backgroundColor: currentSlide.background,
          }}
        >
          <div className="absolute inset-0" style={{ backgroundColor: currentSlide.background }} />
          {currentSlide.elements.map((el) => (
            <SlideElementRenderer key={el.id} element={el} isPresentMode />
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex size-12 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {currentIndex < slides.length - 1 && (
        <button
          type="button"
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex size-12 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full bg-[#FF3333] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SLIDES EDITOR — Main component
   ════════════════════════════════════════════════════ */

interface SlidesEditorProps {
  fileId: string;
  fileName?: string;
}

export function SlidesEditor({ fileId, fileName }: SlidesEditorProps) {
  // Mobile detection
  const isMobile = useIsMobile();

  // Deck state
  const [slides, setSlides] = useState<Slide[]>(() => createInitialDeck().slides);
  const [settings, setSettings] = useState<DeckSettings>(() => createInitialDeck().settings);
  const [activeSlideId, setActiveSlideId] = useState<string>(() => createInitialDeck().slides[0].id);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<SlidesTool>('select');
  const [notesExpanded, setNotesExpanded] = useState(true);
  const [layoutsOpen, setLayoutsOpen] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);

  // Transition animation state for slide navigation in the editor
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'entering'>('idle');
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Drag/resize state
  const dragRef = useRef<{
    elementId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const resizeRef = useRef<{
    elementId: string;
    handle: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

  // Derived state
  const activeSlide = slides.find((s) => s.id === activeSlideId) ?? slides[0];
  const selectedElement = activeSlide?.elements.find((el) => el.id === selectedElementId) ?? null;
  const activeSlideIndex = slides.findIndex((s) => s.id === activeSlideId);

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    };
  }, []);

  // ── Slide navigation with transitions ──

  const navigateToSlide = useCallback(
    (newSlideId: string) => {
      if (newSlideId === activeSlideId || isAnimating) return;

      const currentSlideObj = slides.find((s) => s.id === activeSlideId);
      const transition = currentSlideObj?.transition ?? DEFAULT_TRANSITION;

      if (transition.type === 'none') {
        setActiveSlideId(newSlideId);
        setSelectedElementId(null);
        setEditingElementId(null);
        return;
      }

      // Start animation
      setIsAnimating(true);
      setAnimationPhase('entering');

      // After transition, switch slide
      animTimeoutRef.current = setTimeout(() => {
        setActiveSlideId(newSlideId);
        setSelectedElementId(null);
        setEditingElementId(null);
        setAnimationPhase('idle');
        setIsAnimating(false);
      }, transition.duration + 50);
    },
    [activeSlideId, slides, isAnimating],
  );

  // ── Slide CRUD ──

  const handleAddSlide = useCallback(() => {
    const newSlide = createDefaultSlide(generateId('slide'));
    setSlides((prev) => [...prev, newSlide]);
    navigateToSlide(newSlide.id);
  }, [navigateToSlide]);

  const handleDeleteSlide = useCallback(
    (id: string) => {
      if (slides.length <= 1) return;
      setSlides((prev) => {
        const idx = prev.findIndex((s) => s.id === id);
        const next = prev.filter((s) => s.id !== id);
        if (activeSlideId === id) {
          const newIdx = Math.min(idx, next.length - 1);
          const newId = next[newIdx]?.id ?? '';
          // Use direct set to avoid animation when auto-switching
          setActiveSlideId(newId);
        }
        return next;
      });
      setSelectedElementId(null);
      setEditingElementId(null);
    },
    [slides.length, activeSlideId],
  );

  const handleDuplicateSlide = useCallback(
    (id: string) => {
      const source = slides.find((s) => s.id === id);
      if (!source) return;
      const dup: Slide = {
        ...source,
        id: generateId('slide'),
        elements: source.elements.map((el) => ({ ...el, id: generateId('el') })),
      };
      setSlides((prev) => {
        const idx = prev.findIndex((s) => s.id === id);
        const next = [...prev];
        next.splice(idx + 1, 0, dup);
        return next;
      });
    },
    [slides],
  );

  // ── Element CRUD ──

  const handleUpdateElement = useCallback(
    (updates: Partial<SlideElement>) => {
      if (!selectedElementId) return;
      setSlides((prev) =>
        prev.map((s) =>
          s.id === activeSlideId
            ? {
                ...s,
                elements: s.elements.map((el) =>
                  el.id === selectedElementId ? { ...el, ...updates } : el,
                ),
              }
            : s,
        ),
      );
    },
    [selectedElementId, activeSlideId],
  );

  const handleAddElement = useCallback(
    (type: SlideElement['type'], overrides: Partial<SlideElement> = {}) => {
      const newEl = createDefaultElement(type, {
        ...overrides,
        id: generateId('el'),
        zIndex: (activeSlide?.elements.length ?? 0) + 1,
      });
      setSlides((prev) =>
        prev.map((s) =>
          s.id === activeSlideId
            ? { ...s, elements: [...s.elements, newEl] }
            : s,
        ),
      );
      setSelectedElementId(newEl.id);
      setActiveTool('select');
    },
    [activeSlideId, activeSlide],
  );

  const handleDeleteElement = useCallback(() => {
    if (!selectedElementId) return;
    setSlides((prev) =>
      prev.map((s) =>
        s.id === activeSlideId
          ? { ...s, elements: s.elements.filter((el) => el.id !== selectedElementId) }
          : s,
      ),
    );
    setSelectedElementId(null);
    setEditingElementId(null);
  }, [selectedElementId, activeSlideId]);

  const handleDuplicateElement = useCallback(() => {
    if (!selectedElement) return;
    const dup: SlideElement = {
      ...selectedElement,
      id: generateId('el'),
      x: Math.min(selectedElement.x + 3, 80),
      y: Math.min(selectedElement.y + 3, 70),
      zIndex: (activeSlide?.elements.length ?? 0) + 1,
    };
    setSlides((prev) =>
      prev.map((s) =>
        s.id === activeSlideId
          ? { ...s, elements: [...s.elements, dup] }
          : s,
      ),
    );
    setSelectedElementId(dup.id);
  }, [selectedElement, activeSlideId, activeSlide]);

  // ── Slide updates ──

  const handleUpdateSlide = useCallback(
    (updates: Partial<Slide>) => {
      setSlides((prev) =>
        prev.map((s) => (s.id === activeSlideId ? { ...s, ...updates } : s)),
      );
    },
    [activeSlideId],
  );

  // ── Apply transition to all slides ──

  const handleApplyTransitionToAll = useCallback(
    (transition: SlideTransition) => {
      setSlides((prev) =>
        prev.map((s) => ({ ...s, transition: { ...transition } })),
      );
    },
    [],
  );

  // ── Apply layout to current slide ──

  const handleSelectLayout = useCallback(
    (layoutId: string) => {
      const layout = LAYOUTS.find((l) => l.id === layoutId);
      if (!layout) return;

      const elements = layout.getElements();
      setSlides((prev) =>
        prev.map((s) =>
          s.id === activeSlideId
            ? { ...s, elements }
            : s,
        ),
      );
      setSelectedElementId(null);
      setEditingElementId(null);
    },
    [activeSlideId],
  );

  // ── Tool handler — click on canvas to add element ──

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvasBg) {
        setSelectedElementId(null);
        setEditingElementId(null);

        if (activeTool !== 'select') {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;

          const toolTypeMap: Record<string, SlideElement['type']> = {
            'text': 'text',
            'shape-rect': 'shape',
            'shape-rounded': 'shape',
            'shape-circle': 'shape',
            'image': 'image',
            'table': 'table',
          };

          const shapeTypeMap: Record<string, SlideElement['shapeType']> = {
            'shape-rect': 'rectangle',
            'shape-rounded': 'rounded',
            'shape-circle': 'circle',
          };

          const elType = toolTypeMap[activeTool];
          if (elType) {
            handleAddElement(elType, {
              x: Math.max(0, x - 15),
              y: Math.max(0, y - 10),
              ...(activeTool.startsWith('shape-') ? { shapeType: shapeTypeMap[activeTool] } : {}),
            });
          }
        }
      }
    },
    [activeTool, handleAddElement],
  );

  // ── Drag handling ──

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (!selectedElement || selectedElement.locked) return;
      e.preventDefault();
      dragRef.current = {
        elementId: selectedElement.id,
        startX: e.clientX,
        startY: e.clientY,
        origX: selectedElement.x,
        origY: selectedElement.y,
      };

      const handleMouseMove = (me: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ((me.clientX - dragRef.current.startX) / (window.innerWidth * 0.5)) * 100;
        const dy = ((me.clientY - dragRef.current.startY) / (window.innerHeight * 0.5)) * 100;
        setSlides((prev) =>
          prev.map((s) =>
            s.id === activeSlideId
              ? {
                  ...s,
                  elements: s.elements.map((el) =>
                    el.id === dragRef.current!.elementId
                      ? {
                          ...el,
                          x: Math.max(0, Math.min(95, dragRef.current!.origX + dx)),
                          y: Math.max(0, Math.min(95, dragRef.current!.origY + dy)),
                        }
                      : el,
                  ),
                }
              : s,
          ),
        );
      };

      const handleMouseUp = () => {
        dragRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [selectedElement, activeSlideId],
  );

  // ── Resize handling ──

  const handleResizeStart = useCallback(
    (handle: string, e: React.MouseEvent) => {
      if (!selectedElement || selectedElement.locked) return;
      e.preventDefault();
      e.stopPropagation();

      resizeRef.current = {
        elementId: selectedElement.id,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        origX: selectedElement.x,
        origY: selectedElement.y,
        origW: selectedElement.width,
        origH: selectedElement.height,
      };

      const handleMouseMove = (me: MouseEvent) => {
        if (!resizeRef.current) return;
        const r = resizeRef.current;
        const dx = ((me.clientX - r.startX) / (window.innerWidth * 0.5)) * 100;
        const dy = ((me.clientY - r.startY) / (window.innerHeight * 0.5)) * 100;

        let newX = r.origX;
        let newY = r.origY;
        let newW = r.origW;
        let newH = r.origH;

        if (handle.includes('e')) newW = Math.max(5, r.origW + dx);
        if (handle.includes('w')) { newX = r.origX + dx; newW = Math.max(5, r.origW - dx); }
        if (handle.includes('s')) newH = Math.max(3, r.origH + dy);
        if (handle.includes('n')) { newY = r.origY + dy; newH = Math.max(3, r.origH - dy); }

        setSlides((prev) =>
          prev.map((s) =>
            s.id === activeSlideId
              ? {
                  ...s,
                  elements: s.elements.map((el) =>
                    el.id === r.elementId
                      ? {
                          ...el,
                          x: Math.max(0, Math.min(95, newX)),
                          y: Math.max(0, Math.min(95, newY)),
                          width: Math.max(5, Math.min(100, newW)),
                          height: Math.max(3, Math.min(100, newH)),
                        }
                      : el,
                  ),
                }
              : s,
          ),
        );
      };

      const handleMouseUp = () => {
        resizeRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [selectedElement, activeSlideId],
  );

  // ── Element content change (for text) ──

  const handleContentChange = useCallback(
    (content: string) => {
      if (!selectedElementId) return;
      handleUpdateElement({ content });
    },
    [selectedElementId, handleUpdateElement],
  );

  // ── Text formatting shortcuts ──

  const handleBold = useCallback(() => {
    if (!selectedElement) return;
    handleUpdateElement({ fontWeight: selectedElement.fontWeight === 700 ? 400 : 700 });
  }, [selectedElement, handleUpdateElement]);

  const handleItalic = useCallback(() => {
    if (!selectedElement) return;
    const current = selectedElement.fontFamily ?? 'Inter, system-ui, sans-serif';
    if (current.includes('italic')) {
      handleUpdateElement({ fontFamily: current.replace(', italic', '').replace('italic, ', '') });
    } else {
      handleUpdateElement({ fontFamily: `italic, ${current}` });
    }
  }, [selectedElement, handleUpdateElement]);

  const handleUnderline = useCallback(() => {
    // Not natively supported in CSS text content, just a stub
  }, []);

  const handleAlignLeft = useCallback(() => handleUpdateElement({ textAlign: 'left' }), [handleUpdateElement]);
  const handleAlignCenter = useCallback(() => handleUpdateElement({ textAlign: 'center' }), [handleUpdateElement]);
  const handleAlignRight = useCallback(() => handleUpdateElement({ textAlign: 'right' }), [handleUpdateElement]);

  const handleMoveUp = useCallback(() => {
    if (!selectedElement) return;
    handleUpdateElement({ zIndex: selectedElement.zIndex + 1 });
  }, [selectedElement, handleUpdateElement]);

  const handleMoveDown = useCallback(() => {
    if (!selectedElement) return;
    handleUpdateElement({ zIndex: Math.max(0, selectedElement.zIndex - 1) });
  }, [selectedElement, handleUpdateElement]);

  const handleToggleLock = useCallback(() => {
    if (!selectedElement) return;
    handleUpdateElement({ locked: !selectedElement.locked });
  }, [selectedElement, handleUpdateElement]);

  // ── Canvas aspect ratio ──

  const canvasAspectRatio = settings.aspectRatio === '4:3' ? '4/3' : '16/9';

  // ── Keyboard shortcuts (F5 for present) ──

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        setIsPresenting(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Compute transition animation styles for the canvas ──

  const transition = activeSlide?.transition ?? DEFAULT_TRANSITION;
  let canvasAnimStyle: React.CSSProperties = {};
  if (animationPhase === 'entering' && transition.type !== 'none') {
    canvasAnimStyle = {
      ...getTransitionFromState(transition),
      transition: `all ${transition.duration}ms ${
        transition.easing === 'spring'
          ? 'cubic-bezier(0.16, 1, 0.3, 1)'
          : transition.easing
      }`,
      ...getTransitionToState(transition),
    };
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel — Slide Thumbnails (hidden on mobile) */}
      {!isMobile && (
        <SlidePanel
          slides={slides}
          activeSlideId={activeSlideId}
          onSelectSlide={navigateToSlide}
          onAddSlide={handleAddSlide}
          onDeleteSlide={handleDeleteSlide}
          onDuplicateSlide={handleDuplicateSlide}
        />
      )}

      {/* Center — Canvas + Toolbar + Notes */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Toolbar */}
        <SlideToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          hasSelection={!!selectedElement}
          onBold={handleBold}
          onItalic={handleItalic}
          onUnderline={handleUnderline}
          onAlignLeft={handleAlignLeft}
          onAlignCenter={handleAlignCenter}
          onAlignRight={handleAlignRight}
          onDuplicate={handleDuplicateElement}
          onDelete={handleDeleteElement}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onToggleLock={handleToggleLock}
          isLocked={selectedElement?.locked ?? false}
          selectedFontSize={selectedElement?.fontSize}
          onFontSizeChange={(size) => handleUpdateElement({ fontSize: size })}
          onOpenLayouts={() => setLayoutsOpen(true)}
          onPresent={() => setIsPresenting(true)}
        />

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-[var(--color-bg-elevated)] flex items-center justify-center p-6">
          <div
            className={cn(
              'relative bg-white shadow-[var(--shadow-lg)] rounded-lg overflow-hidden',
            )}
            style={{
              aspectRatio: canvasAspectRatio,
              width: '100%',
              maxWidth: '960px',
              ...canvasAnimStyle,
            }}
            onClick={handleCanvasClick}
            data-canvas-bg="true"
          >
            {/* Background color */}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: activeSlide.background }}
            />

            {/* Elements */}
            {activeSlide.elements.map((el) => (
              <SlideElementRenderer
                key={el.id}
                element={el}
                isSelected={selectedElementId === el.id}
                isEditing={editingElementId === el.id}
                onSelect={(e) => {
                  e.stopPropagation();
                  setSelectedElementId(el.id);
                }}
                onDragStart={handleDragStart}
                onResizeStart={handleResizeStart}
                onDoubleClick={() => {
                  if (el.type === 'text') {
                    setEditingElementId(el.id);
                  }
                }}
                onContentChange={handleContentChange}
              />
            ))}

            {/* Empty slide hint */}
            {activeSlide.elements.length === 0 && activeTool === 'select' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm text-[var(--color-text-tertiary)]">Click the toolbar to add elements</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom — Collapsible notes */}
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <button
            type="button"
            onClick={() => setNotesExpanded((p) => !p)}
            className="flex w-full items-center gap-2 px-4 py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {notesExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            Speaker Notes
          </button>
          {notesExpanded && (
            <textarea
              value={activeSlide.notes}
              onChange={(e) => handleUpdateSlide({ notes: e.target.value })}
              placeholder="Add speaker notes for this slide..."
              className="w-full border-t border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-text-secondary)] bg-transparent resize-none outline-none min-h-[60px] max-h-[120px]"
            />
          )}
        </div>
      </div>

      {/* Right Panel — Properties (hidden on mobile) */}
      {!isMobile && (
        <SlideProperties
          selectedElement={selectedElement}
          slide={activeSlide}
          deckSettings={settings}
          onUpdateElement={handleUpdateElement}
          onUpdateSlide={handleUpdateSlide}
          onUpdateDeckSettings={(updates) =>
            setSettings((prev) => ({ ...prev, ...updates }))
          }
          onApplyTransitionToAll={handleApplyTransitionToAll}
        />
      )}

      {/* Smart Layouts Dialog */}
      <SmartLayouts
        open={layoutsOpen}
        onOpenChange={setLayoutsOpen}
        onSelectLayout={handleSelectLayout}
      />

      {/* Presentation Mode Overlay */}
      {isPresenting && (
        <PresentationOverlay
          slides={slides}
          initialSlideIndex={Math.max(0, activeSlideIndex)}
          onClose={() => setIsPresenting(false)}
        />
      )}
    </div>
  );
}
