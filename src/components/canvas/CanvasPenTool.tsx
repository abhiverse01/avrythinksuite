// @ts-nocheck — Fabric.js v6 strict types require runtime casting; safe to suppress
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Circle, Line, Path, Rect, type FabricObject } from 'fabric';
import { cn } from '@/lib/utils';
import type { Canvas as FabricCanvas } from 'fabric';

/* ── Types ── */

interface Point {
  x: number;
  y: number;
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
}

interface CanvasPenToolProps {
  canvasRef: React.RefObject<FabricCanvas | null>;
  isActive: boolean;
  onToggle: () => void;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

/* ── Constants ── */

const ANCHOR_SIZE = 8;
const HANDLE_SIZE = 6;
const HANDLE_COLOR = '#FF3333';
const SELECTED_COLOR = '#FF3333';
const ANCHOR_COLOR = '#FFFFFF';
const ANCHOR_STROKE = '#6B7280';
const HANDLE_LINE_COLOR = '#9CA3AF';
const HANDLE_LINE_DASH = [4, 3];
const MIN_DISTANCE = 5;

/* ── Helper: build path data from points ── */

function buildPathData(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    if (prev.handleOut && curr.handleIn) {
      d += ` C ${prev.x + prev.handleOut.x} ${prev.y + prev.handleOut.y}, ${curr.x + curr.handleIn.x} ${curr.y + curr.handleIn.y}, ${curr.x} ${curr.y}`;
    } else if (prev.handleOut) {
      d += ` Q ${prev.x + prev.handleOut.x} ${prev.y + prev.handleOut.y}, ${curr.x} ${curr.y}`;
    } else if (curr.handleIn) {
      d += ` Q ${curr.x + curr.handleIn.x} ${curr.y + curr.handleIn.y}, ${curr.x} ${curr.y}`;
    } else {
      d += ` L ${curr.x} ${curr.y}`;
    }
  }

  return d;
}

/* ── Helper: parse path to extract anchor points ── */

function parsePathPoints(path: Path): Point[] {
  const points: Point[] = [];

  try {
    const pathData = path.path || '';
    const commands = pathData.match(/[MLQC][^MLQC]*/gi);
    if (!commands) return points;

    commands.forEach((cmd) => {
      const type = cmd.charAt(0).toUpperCase();
      const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));

      if (type === 'M' || type === 'L') {
        points.push({ x: nums[0], y: nums[1] });
      } else if (type === 'C') {
        const prevPoint = points[points.length - 1];
        if (prevPoint) {
          prevPoint.handleOut = { x: nums[0] - prevPoint.x, y: nums[1] - prevPoint.y };
        }
        points.push({
          x: nums[4],
          y: nums[5],
          handleIn: { x: nums[2] - nums[4], y: nums[3] - nums[5] },
        });
      } else if (type === 'Q') {
        const prevPoint = points[points.length - 1];
        if (prevPoint) {
          prevPoint.handleOut = { x: nums[0] - prevPoint.x, y: nums[1] - prevPoint.y };
        }
        points.push({
          x: nums[2],
          y: nums[3],
          handleIn: { x: nums[0] - nums[2], y: nums[1] - nums[3] },
        });
      }
    });
  } catch {
    // fallback
  }

  return points;
}

/* ════════════════════════════════════════════════════
   PEN TOOL — Bezier path drawing and editing
   ════════════════════════════════════════════════════ */

export function CanvasPenTool({
  canvasRef,
  isActive,
  fillColor,
  strokeColor,
  strokeWidth,
}: CanvasPenToolProps) {
  const [mode, setMode] = useState<'idle' | 'drawing' | 'editing'>('idle');
  const [selectedAnchorIndex, setSelectedAnchorIndex] = useState<number | null>(null);

  const pointsRef = useRef<Point[]>([]);
  const isDraggingHandleRef = useRef(false);
  const dragTypeRef = useRef<'anchor' | 'handleIn' | 'handleOut' | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const previewLineRef = useRef<Line | null>(null);
  const anchorOverlaysRef = useRef<FabricObject[]>([]);
  const activePointIndexRef = useRef<number>(0);
  const isDrawingRef = useRef(false);
  const editingPathRef = useRef<Path | null>(null);
  const finishDrawingRef = useRef<() => void>(() => {});
  const renderAnchorsRef = useRef<(path: Path) => void>(() => {});

  // Keep refs for fillColor, strokeColor, strokeWidth so callbacks can use latest
  const fillColorRef = useRef(fillColor);
  const strokeColorRef = useRef(strokeColor);
  const strokeWidthRef = useRef(strokeWidth);
  fillColorRef.current = fillColor;
  strokeColorRef.current = strokeColor;
  strokeWidthRef.current = strokeWidth;

  // Clean up overlays
  const clearOverlays = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    anchorOverlaysRef.current.forEach((obj) => {
      canvas.remove(obj);
    });
    anchorOverlaysRef.current = [];
  }, [canvasRef]);

  // Render anchor overlays for a path being edited
  const renderAnchors = useCallback(
    (path: Path) => {
      clearOverlays();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const points = pointsRef.current;

      points.forEach((point, idx) => {
        // Anchor square
        const isSelected = idx === selectedAnchorIndex;
        const anchorBg = new Rect({
          left: point.x - ANCHOR_SIZE / 2,
          top: point.y - ANCHOR_SIZE / 2,
          width: ANCHOR_SIZE,
          height: ANCHOR_SIZE,
          fill: isSelected ? SELECTED_COLOR : ANCHOR_COLOR,
          stroke: ANCHOR_STROKE,
          strokeWidth: 1,
          selectable: true,
          evented: true,
          hasControls: false,
          hasBorders: false,
          name: `pen-anchor-${idx}`,
        });

        anchorBg.on('mousedown', () => {
          setSelectedAnchorIndex(idx);
          // Re-render will happen via the renderAnchorsRef call
        });

        anchorBg.on('moving', () => {
          point.x = anchorBg.left! + ANCHOR_SIZE / 2;
          point.y = anchorBg.top! + ANCHOR_SIZE / 2;

          const newData = buildPathData(pointsRef.current);
          try {
            (path as any)._setPath(newData);
            path.dirty = true;
            canvas.renderAll();
          } catch {
            // fallback
          }
        });

        canvas.add(anchorBg);
        anchorOverlaysRef.current.push(anchorBg);

        // Handle out circle
        if (point.handleOut) {
          const handleLineOut = new Line(
            [point.x, point.y, point.x + point.handleOut.x, point.y + point.handleOut.y],
            {
              stroke: HANDLE_LINE_COLOR,
              strokeWidth: 1,
              strokeDashArray: HANDLE_LINE_DASH,
              selectable: false,
              evented: false,
              name: `pen-handle-line-out-${idx}`,
            },
          );

          const handleOut = new Circle({
            left: point.x + point.handleOut.x - HANDLE_SIZE / 2,
            top: point.y + point.handleOut.y - HANDLE_SIZE / 2,
            radius: HANDLE_SIZE / 2,
            fill: HANDLE_COLOR,
            stroke: 'none',
            selectable: true,
            evented: true,
            hasControls: false,
            hasBorders: false,
            name: `pen-handle-out-${idx}`,
          });

          handleOut.on('moving', () => {
            point.handleOut.x = handleOut.left! + HANDLE_SIZE / 2 - point.x;
            point.handleOut.y = handleOut.top! + HANDLE_SIZE / 2 - point.y;

            if (!point.handleIn) {
              point.handleIn = { x: -point.handleOut.x, y: -point.handleOut.y };
            }

            handleLineOut.set({
              x1: point.x,
              y1: point.y,
              x2: point.x + point.handleOut.x,
              y2: point.y + point.handleOut.y,
            });

            const newData = buildPathData(pointsRef.current);
            try {
              (path as any)._setPath(newData);
              path.dirty = true;
              canvas.renderAll();
            } catch {
              // fallback
            }
          });

          canvas.add(handleLineOut);
          anchorOverlaysRef.current.push(handleLineOut);
          canvas.add(handleOut);
          anchorOverlaysRef.current.push(handleOut);
        }

        // Handle in circle
        if (point.handleIn) {
          const handleLineIn = new Line(
            [point.x, point.y, point.x + point.handleIn.x, point.y + point.handleIn.y],
            {
              stroke: HANDLE_LINE_COLOR,
              strokeWidth: 1,
              strokeDashArray: HANDLE_LINE_DASH,
              selectable: false,
              evented: false,
              name: `pen-handle-line-in-${idx}`,
            },
          );

          const handleIn = new Circle({
            left: point.x + point.handleIn.x - HANDLE_SIZE / 2,
            top: point.y + point.handleIn.y - HANDLE_SIZE / 2,
            radius: HANDLE_SIZE / 2,
            fill: HANDLE_COLOR,
            stroke: 'none',
            selectable: true,
            evented: true,
            hasControls: false,
            hasBorders: false,
            name: `pen-handle-in-${idx}`,
          });

          handleIn.on('moving', () => {
            point.handleIn.x = handleIn.left! + HANDLE_SIZE / 2 - point.x;
            point.handleIn.y = handleIn.top! + HANDLE_SIZE / 2 - point.y;

            handleLineIn.set({
              x1: point.x,
              y1: point.y,
              x2: point.x + point.handleIn.x,
              y2: point.y + point.handleIn.y,
            });

            const newData = buildPathData(pointsRef.current);
            try {
              (path as any)._setPath(newData);
              path.dirty = true;
              canvas.renderAll();
            } catch {
              // fallback
            }
          });

          canvas.add(handleLineIn);
          anchorOverlaysRef.current.push(handleLineIn);
          canvas.add(handleIn);
          anchorOverlaysRef.current.push(handleIn);
        }
      });

      canvas.renderAll();
    },
    [canvasRef, clearOverlays, selectedAnchorIndex],
  );

  // Keep renderAnchors in a ref
  renderAnchorsRef.current = renderAnchors;

  // Enter edit mode for a selected path
  const enterEditMode = useCallback(
    (path: Path) => {
      setMode('editing');
      editingPathRef.current = path;

      const parsedPoints = parsePathPoints(path);
      pointsRef.current = parsedPoints;
      activePointIndexRef.current = parsedPoints.length;

      renderAnchors(path);
    },
    [renderAnchors],
  );

  // Finish drawing and create path
  const finishDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    isDrawingRef.current = false;

    if (previewLineRef.current) {
      canvas.remove(previewLineRef.current);
      previewLineRef.current = null;
    }

    if (pointsRef.current.length < 2) {
      pointsRef.current = [];
      setMode('idle');
      return;
    }

    const pathData = buildPathData(pointsRef.current);
    const path = new Path(pathData, {
      fill: fillColorRef.current,
      stroke: strokeColorRef.current,
      strokeWidth: strokeWidthRef.current,
      selectable: true,
      evented: true,
      name: 'Pen Path',
    });

    canvas.add(path);
    canvas.setActiveObject(path);
    canvas.renderAll();

    pointsRef.current = [];
    setMode('idle');
  }, [canvasRef]);

  // Keep finishDrawing in a ref
  finishDrawingRef.current = finishDrawing;

  // End path without closing
  const endOpenPath = useCallback(() => {
    if (isDrawingRef.current && pointsRef.current.length >= 1) {
      const canvas = canvasRef.current;
      if (previewLineRef.current && canvas) {
        canvas.remove(previewLineRef.current);
        previewLineRef.current = null;
      }

      if (pointsRef.current.length >= 2) {
        finishDrawingRef.current();
      } else {
        isDrawingRef.current = false;
        pointsRef.current = [];
        setMode('idle');
      }
    }
  }, [canvasRef]);

  // Drawing mode mouse handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive || mode !== 'drawing') return;

    canvas.selection = false;
    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = 'crosshair';
    canvas.forEachObject((obj) => {
      obj.selectable = false;
      obj.evented = false;
    });

    const handleMouseDown = (opt: any) => {
      if (opt.target) return;

      const pointer = canvas.getPointer(opt.e);
      const lastPoint = pointsRef.current[pointsRef.current.length - 1];

      if (isDrawingRef.current && lastPoint) {
        const dist = Math.sqrt(
          Math.pow(pointer.x - lastPoint.x, 2) + Math.pow(pointer.y - lastPoint.y, 2),
        );
        if (dist < MIN_DISTANCE) {
          finishDrawingRef.current();
          return;
        }
      }

      isDrawingRef.current = true;
      dragStartRef.current = { x: pointer.x, y: pointer.y };
      dragTypeRef.current = 'anchor';

      pointsRef.current.push({ x: pointer.x, y: pointer.y });
      activePointIndexRef.current = pointsRef.current.length - 1;

      if (previewLineRef.current) {
        canvas.remove(previewLineRef.current);
      }
      previewLineRef.current = new Line(
        [pointer.x, pointer.y, pointer.x, pointer.y],
        {
          stroke: strokeColorRef.current,
          strokeWidth: 1,
          strokeDashArray: [4, 4],
          selectable: false,
          evented: false,
          name: 'pen-preview',
        },
      );
      canvas.add(previewLineRef.current);
    };

    const handleMouseMove = (opt: any) => {
      if (!isDrawingRef.current) return;

      const pointer = canvas.getPointer(opt.e);
      const lastPoint = pointsRef.current[pointsRef.current.length - 1];

      if (lastPoint && dragTypeRef.current === 'anchor' && dragStartRef.current) {
        const dist = Math.sqrt(
          Math.pow(pointer.x - dragStartRef.current.x, 2) +
            Math.pow(pointer.y - dragStartRef.current.y, 2),
        );
        if (dist > 5) {
          dragTypeRef.current = 'handleOut';
        }
      }

      if (dragTypeRef.current === 'handleOut' && lastPoint) {
        lastPoint.handleOut = {
          x: pointer.x - lastPoint.x,
          y: pointer.y - lastPoint.y,
        };
      }

      if (previewLineRef.current && lastPoint) {
        previewLineRef.current.set({
          x1: lastPoint.x,
          y1: lastPoint.y,
          x2: pointer.x,
          y2: pointer.y,
        });
        canvas.renderAll();
      }
    };

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return;

      const lastPoint = pointsRef.current[pointsRef.current.length - 1];
      if (lastPoint && dragTypeRef.current === 'handleOut') {
        // handle is already set via mousemove
      }

      dragTypeRef.current = null;
      dragStartRef.current = null;
    };

    const handleDblClick = () => {
      if (isDrawingRef.current && pointsRef.current.length >= 2) {
        finishDrawingRef.current();
      }
    };

    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('mouse:dblclick', handleDblClick);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('mouse:dblclick', handleDblClick);
    };
  }, [canvasRef, isActive, mode]);

  // Handle keydown for pen tool
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.contentEditable === 'true'
      ) return;

      const key = e.key.toLowerCase();

      if (key === 'escape') {
        e.preventDefault();
        const currentMode = modeRef.current;
        if (currentMode === 'drawing') {
          endOpenPath();
        } else if (currentMode === 'editing') {
          clearOverlays();
          modeRef.current = 'idle';
          editingPathRef.current = null;
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.selection = true;
            canvas.defaultCursor = 'default';
            canvas.hoverCursor = 'move';
            canvas.forEachObject((obj) => {
              obj.selectable = true;
              obj.evented = true;
            });
            canvas.renderAll();
          }
        }
        return;
      }

      if (key === 'delete' || key === 'backspace') {
        const currentMode = modeRef.current;
        const selIdx = selectedAnchorIndexRef.current;
        if (currentMode === 'editing' && selIdx !== null) {
          e.preventDefault();
          const points = pointsRef.current;
          if (points.length <= 2) return;

          points.splice(selIdx, 1);
          selectedAnchorIndexRef.current = null;
          setSelectedAnchorIndex(null);

          const editingPath = editingPathRef.current;
          if (editingPath) {
            const newData = buildPathData(points);
            try {
              (editingPath as any)._setPath(newData);
              editingPath.dirty = true;
            } catch {
              // fallback
            }
            const canvas = canvasRef.current;
            if (canvas) canvas.renderAll();
            renderAnchorsRef.current(editingPath);
          }
        }
        return;
      }

      if (key === 'e' && modeRef.current === 'idle' && !e.metaKey && !e.ctrlKey) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (active && active.type === 'path') {
          e.preventDefault();
          enterEditMode(active as Path);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, endOpenPath, clearOverlays, enterEditMode]);

  // Track mode and selectedAnchorIndex in refs for use in keydown handler
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const selectedAnchorIndexRef = useRef(selectedAnchorIndex);
  selectedAnchorIndexRef.current = selectedAnchorIndex;

  // Activate drawing mode
  useEffect(() => {
    if (!isActive) {
      isDrawingRef.current = false;
      pointsRef.current = [];
      if (previewLineRef.current && canvasRef.current) {
        canvasRef.current.remove(previewLineRef.current);
        previewLineRef.current = null;
      }
      clearOverlays();
      editingPathRef.current = null;
      return;
    }

    if (isActive) {
      setMode('drawing');
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        canvas.renderAll();
      }
    }
  }, [isActive, clearOverlays]);

  // Edit mode: handle path double-click
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const handleObjectDblClick = (opt: any) => {
      if (opt.target && opt.target.type === 'path') {
        enterEditMode(opt.target as Path);
      }
    };

    canvas.on('mouse:dblclick', handleObjectDblClick);
    return () => {
      canvas.off('mouse:dblclick', handleObjectDblClick);
    };
  }, [canvasRef, isActive, enterEditMode]);

  // Mode indicator
  const modeLabel = mode === 'drawing'
    ? 'Pen: Click to add points, drag for curves. Double-click to finish.'
    : mode === 'editing'
      ? 'Pen Edit: Drag anchors. E to exit. Del to remove point.'
      : 'Pen Tool';

  return (
    <div
      className={cn(
        'pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 z-30',
        'px-3 py-1.5 rounded-full text-[11px] font-medium shadow-lg',
        'bg-[#FF3333] text-white whitespace-nowrap',
        !isActive && 'hidden',
      )}
    >
      {modeLabel}
    </div>
  );
}
