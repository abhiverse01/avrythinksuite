// @ts-nocheck — Fabric.js v6 strict types require runtime casting; safe to suppress
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Grid3X3, Trash2, Ruler as RulerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Canvas as FabricCanvas } from 'fabric';

/* ── Types ── */

export interface Guide {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number;
}

interface CanvasGridProps {
  canvasRef: React.RefObject<FabricCanvas | null>;
  showGrid: boolean;
  onToggleGrid: () => void;
  guides: Guide[];
  onGuidesChange: (guides: Guide[]) => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
}

/* ── Constants ── */

const RULER_SIZE = 24;
const SNAP_THRESHOLD = 8;
const GUIDE_COLOR = '#00BCD4';
const GUIDE_DELETE_THRESHOLD = 6;

const GRID_SIZES = [
  { value: 10, label: '10px' },
  { value: 20, label: '20px' },
  { value: 40, label: '40px' },
  { value: 80, label: '80px' },
];

/* ── RulerBar Component ── */

function RulerBar({
  orientation,
  length,
  gridSize,
  canvasOffset,
  onDragStart,
}: {
  orientation: 'horizontal' | 'vertical';
  length: number;
  gridSize: number;
  canvasOffset: number;
  onDragStart: (e: React.MouseEvent, orientation: 'horizontal' | 'vertical') => void;
}) {
  const isHorizontal = orientation === 'horizontal';
  const ticks: React.ReactNode[] = [];

  for (let i = 0; i <= length; i += gridSize) {
    const isMajor = i % (gridSize * 5) === 0;
    const isMinor = i % gridSize === 0;

    if (isMinor) {
      const tickLength = isMajor ? (isHorizontal ? 12 : 12) : (isHorizontal ? 6 : 6);
      const style: React.CSSProperties = isHorizontal
        ? { left: i, top: RULER_SIZE - tickLength, width: 1, height: tickLength }
        : { top: i, left: RULER_SIZE - tickLength, height: 1, width: tickLength };

      ticks.push(
        <div
          key={i}
          className="absolute bg-[var(--color-text-tertiary)]"
          style={style}
        />,
      );

      if (isMajor) {
        const labelStyle: React.CSSProperties = isHorizontal
          ? { left: i + 2, top: 2, fontSize: 8 }
          : { top: i + 2, left: 2, fontSize: 8 };

        ticks.push(
          <span
            key={`label-${i}`}
            className="absolute text-[var(--color-text-tertiary)] select-none"
            style={labelStyle}
          >
            {i}
          </span>,
        );
      }
    }
  }

  return (
    <div
      className="shrink-0 bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] select-none overflow-hidden cursor-crosshair"
      style={{
        width: isHorizontal ? '100%' : RULER_SIZE,
        height: isHorizontal ? RULER_SIZE : '100%',
        position: 'relative',
      }}
      onMouseDown={(e) => onDragStart(e, orientation)}
    >
      {ticks}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   CANVAS GRID — Main component
   ════════════════════════════════════════════════════ */

export function CanvasGrid({
  canvasRef,
  showGrid,
  onToggleGrid,
  guides,
  onGuidesChange,
  gridSize,
  onGridSizeChange,
}: CanvasGridProps) {
  const [gridMode, setGridMode] = useState<'line' | 'dot'>('line');
  const [showRulers, setShowRulers] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrientation, setDragOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [dragPosition, setDragPosition] = useState(0);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 800 });
  const svgRef = useRef<SVGSVGElement>(null);
  const guideIdCounter = useRef(0);

  // Track canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateDimensions = () => {
      setCanvasDimensions({
        width: canvas.getWidth(),
        height: canvas.getHeight(),
      });
    };

    updateDimensions();
    canvas.on('resize', updateDimensions);
    canvas.on('after:render', updateDimensions);

    return () => {
      canvas.off('resize', updateDimensions);
      canvas.off('after:render', updateDimensions);
    };
  }, [canvasRef]);

  // Snap to guides
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || guides.length === 0) return;

    const handler = () => {
      const active = canvas.getActiveObject();
      if (!active) return;

      guides.forEach((guide) => {
        if (guide.orientation === 'vertical') {
          const left = active.left ?? 0;
          const boundLeft = left - active.getScaledWidth() / 2;
          const boundRight = left + active.getScaledWidth() / 2;
          if (Math.abs(left - guide.position) < SNAP_THRESHOLD) {
            active.set('left', guide.position);
          } else if (Math.abs(boundLeft - guide.position) < SNAP_THRESHOLD) {
            active.set('left', guide.position + active.getScaledWidth() / 2);
          } else if (Math.abs(boundRight - guide.position) < SNAP_THRESHOLD) {
            active.set('left', guide.position - active.getScaledWidth() / 2);
          }
        } else {
          const top = active.top ?? 0;
          const boundTop = top - active.getScaledHeight() / 2;
          const boundBottom = top + active.getScaledHeight() / 2;
          if (Math.abs(top - guide.position) < SNAP_THRESHOLD) {
            active.set('top', guide.position);
          } else if (Math.abs(boundTop - guide.position) < SNAP_THRESHOLD) {
            active.set('top', guide.position + active.getScaledHeight() / 2);
          } else if (Math.abs(boundBottom - guide.position) < SNAP_THRESHOLD) {
            active.set('top', guide.position - active.getScaledHeight() / 2);
          }
        }
      });

      active.setCoords();
    };

    canvas.on('object:moving', handler);
    return () => {
      canvas.off('object:moving', handler);
    };
  }, [canvasRef, guides]);

  // Handle guide dragging
  const handleRulerDragStart = useCallback(
    (e: React.MouseEvent, orientation: 'horizontal' | 'vertical') => {
      e.preventDefault();
      setIsDragging(true);
      setDragOrientation(orientation);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const svgEl = svgRef.current;
      if (!svgEl) return;

      const rect = svgEl.getBoundingClientRect();
      if (orientation === 'horizontal') {
        const y = e.clientY - rect.top;
        setDragPosition(Math.max(0, y));
      } else {
        const x = e.clientX - rect.left;
        setDragPosition(Math.max(0, x));
      }
    },
    [canvasRef],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const svgEl = svgRef.current;
      if (!svgEl) return;

      const rect = svgEl.getBoundingClientRect();
      if (dragOrientation === 'horizontal') {
        const y = e.clientY - rect.top;
        setDragPosition(Math.max(0, Math.min(canvasDimensions.height, y)));
      } else {
        const x = e.clientX - rect.left;
        setDragPosition(Math.max(0, Math.min(canvasDimensions.width, x)));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      const newGuide: Guide = {
        id: `guide-${++guideIdCounter.current}-${Date.now()}`,
        orientation: dragOrientation,
        position: Math.round(dragPosition),
      };
      onGuidesChange([...guides, newGuide]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOrientation, dragPosition, guides, onGuidesChange, canvasDimensions]);

  // Handle guide deletion (right-click)
  const handleGuideContextMenu = useCallback(
    (e: React.MouseEvent, guideId: string) => {
      e.preventDefault();
      onGuidesChange(guides.filter((g) => g.id !== guideId));
    },
    [guides, onGuidesChange],
  );

  // Handle guide double-click to edit position
  const [editingGuide, setEditingGuide] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleGuideDoubleClick = useCallback((guide: Guide) => {
    setEditingGuide(guide.id);
    setEditingValue(String(Math.round(guide.position)));
  }, []);

  const handleEditingSubmit = useCallback(() => {
    if (!editingGuide) return;
    const val = parseFloat(editingValue);
    if (!isNaN(val) && val >= 0) {
      onGuidesChange(
        guides.map((g) => (g.id === editingGuide ? { ...g, position: val } : g)),
      );
    }
    setEditingGuide(null);
  }, [editingGuide, editingValue, guides, onGuidesChange]);

  // Build SVG grid lines
  const buildGridContent = () => {
    if (!showGrid) return null;

    const lines: React.ReactNode[] = [];

    if (gridMode === 'line') {
      for (let x = 0; x <= canvasDimensions.width; x += gridSize) {
        lines.push(
          <line
            key={`v-${x}`}
            x1={x}
            y1={0}
            x2={x}
            y2={canvasDimensions.height}
            stroke="currentColor"
            strokeWidth={0.5}
            opacity={0.06}
          />,
        );
      }
      for (let y = 0; y <= canvasDimensions.height; y += gridSize) {
        lines.push(
          <line
            key={`h-${y}`}
            x1={0}
            y1={y}
            x2={canvasDimensions.width}
            y2={y}
            stroke="currentColor"
            strokeWidth={0.5}
            opacity={0.06}
          />,
        );
      }
    } else {
      for (let x = 0; x <= canvasDimensions.width; x += gridSize) {
        for (let y = 0; y <= canvasDimensions.height; y += gridSize) {
          lines.push(
            <circle
              key={`d-${x}-${y}`}
              cx={x}
              cy={y}
              r={1}
              fill="currentColor"
              opacity={0.15}
            />,
          );
        }
      }
    }

    return lines;
  };

  // Build guide lines in SVG
  const buildGuideLines = () => {
    return guides.map((guide) => {
      if (guide.orientation === 'vertical') {
        return (
          <g key={guide.id}>
            <line
              x1={guide.position}
              y1={0}
              x2={guide.position}
              y2={canvasDimensions.height}
              stroke={GUIDE_COLOR}
              strokeWidth={1}
              strokeDasharray="6 3"
              style={{ cursor: 'move' }}
              onContextMenu={(e) => handleGuideContextMenu(e, guide.id)}
              onDoubleClick={() => handleGuideDoubleClick(guide)}
            />
          </g>
        );
      } else {
        return (
          <g key={guide.id}>
            <line
              x1={0}
              y1={guide.position}
              x2={canvasDimensions.width}
              y2={guide.position}
              stroke={GUIDE_COLOR}
              strokeWidth={1}
              strokeDasharray="6 3"
              style={{ cursor: 'move' }}
              onContextMenu={(e) => handleGuideContextMenu(e, guide.id)}
              onDoubleClick={() => handleGuideDoubleClick(guide)}
            />
          </g>
        );
      }
    });
  };

  // Editing guide position input
  const renderEditingInput = () => {
    if (!editingGuide) return null;
    const guide = guides.find((g) => g.id === editingGuide);
    if (!guide) return null;

    const style: React.CSSProperties =
      guide.orientation === 'vertical'
        ? { left: guide.position, top: 8 }
        : { top: guide.position, left: 8 };

    return (
      <div
        className="absolute z-50 flex items-center gap-1"
        style={style}
      >
        <input
          type="number"
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleEditingSubmit();
            if (e.key === 'Escape') setEditingGuide(null);
          }}
          onBlur={handleEditingSubmit}
          className="w-20 h-6 text-xs px-1 border rounded bg-white text-black shadow-md outline-none"
          autoFocus
          style={{ position: 'relative' }}
        />
        <span className="text-xs text-[var(--color-text-tertiary)]">px</span>
      </div>
    );
  };

  // Drag preview
  const renderDragPreview = () => {
    if (!isDragging) return null;

    if (dragOrientation === 'vertical') {
      return (
        <line
          x1={dragPosition}
          y1={0}
          x2={dragPosition}
          y2={canvasDimensions.height}
          stroke={GUIDE_COLOR}
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.7}
        />
      );
    } else {
      return (
        <line
          x1={0}
          y1={dragPosition}
          x2={canvasDimensions.width}
          y2={dragPosition}
          stroke={GUIDE_COLOR}
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.7}
        />
      );
    }
  };

  const handleClearGuides = useCallback(() => {
    onGuidesChange([]);
  }, [onGuidesChange]);

  return (
    <>
      {/* Grid Settings Controls — rendered externally by toolbar */}
      {/* Exported as sub-component for toolbar integration */}
      <div className="flex items-center gap-1" id="canvas-grid-controls">
        <TooltipProvider delayDuration={400}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={onToggleGrid}
                style={
                  showGrid
                    ? { backgroundColor: 'rgba(255,51,51,0.12)', color: '#FF3333' }
                    : undefined
                }
              >
                <Grid3X3 size={14} strokeWidth={1.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{showGrid ? 'Hide Grid' : 'Show Grid'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {showGrid && (
          <>
            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setShowRulers(!showRulers)}
                    style={
                      showRulers
                        ? { backgroundColor: 'rgba(255,51,51,0.12)', color: '#FF3333' }
                        : undefined
                    }
                  >
                    <RulerIcon size={14} strokeWidth={1.5} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{showRulers ? 'Hide Rulers' : 'Show Rulers'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Select
              value={String(gridSize)}
              onValueChange={(v) => onGridSizeChange(Number(v))}
            >
              <SelectTrigger size="sm" className="h-7 w-16 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRID_SIZES.map((s) => (
                  <SelectItem key={s.value} value={String(s.value)}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-1.5 text-[11px]"
                    onClick={() => setGridMode(gridMode === 'line' ? 'dot' : 'line')}
                  >
                    {gridMode === 'line' ? 'Lines' : 'Dots'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Toggle grid mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {guides.length > 0 && (
              <TooltipProvider delayDuration={400}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-[var(--color-text-secondary)]"
                      onClick={handleClearGuides}
                    >
                      <Trash2 size={12} strokeWidth={1.5} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Clear All Guides</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        )}
      </div>

      {/* SVG Overlay for grid + guides — positioned over canvas */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          top: showRulers ? RULER_SIZE : 0,
          left: showRulers ? RULER_SIZE : 0,
        }}
      >
        <svg
          ref={svgRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          className="w-full h-full text-[var(--color-text-secondary)]"
          style={{ pointerEvents: 'none' }}
        >
          {buildGridContent()}
          {/* Guide lines need pointer events */}
          <g style={{ pointerEvents: 'stroke' }}>
            {buildGuideLines()}
          </g>
          {renderDragPreview()}
        </svg>
        {renderEditingInput()}
      </div>

      {/* Rulers */}
      {showRulers && (
        <>
          {/* Top ruler (horizontal) */}
          <div className="pointer-events-auto absolute top-0 left-0 right-0 z-20">
            <RulerBar
              orientation="horizontal"
              length={canvasDimensions.width}
              gridSize={gridSize}
              canvasOffset={0}
              onDragStart={handleRulerDragStart}
            />
          </div>
          {/* Left ruler (vertical) */}
          <div className="pointer-events-auto absolute top-0 left-0 bottom-0 z-20">
            <RulerBar
              orientation="vertical"
              length={canvasDimensions.height}
              gridSize={gridSize}
              canvasOffset={0}
              onDragStart={handleRulerDragStart}
            />
          </div>
          {/* Corner square */}
          <div
            className="absolute top-0 left-0 z-30 bg-[var(--color-bg-surface)] border-r border-b border-[var(--color-border)]"
            style={{ width: RULER_SIZE, height: RULER_SIZE }}
          />
        </>
      )}
    </>
  );
}
