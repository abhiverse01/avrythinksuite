// @ts-nocheck — Fabric.js v6 strict types require runtime casting; safe to suppress
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Canvas,
  Rect,
  Circle,
  Line,
  IText,
  PencilBrush,
  FabricImage,
  type FabricObject,
  type CanvasEvents,
} from 'fabric';
import { Trash2, Lock, Unlock, Copy, BringToFront, SendToBack, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CANVAS_TOOLS, SHORTCUT_TO_TOOL, ToolRailButton, ADVANCED_TOOLS, AdvancedToolButton } from './CanvasToolbar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { CanvasGrid, type Guide } from './CanvasGrid';
import { ComponentLibrary } from './ComponentLibrary';
import { ExportSVGDialog } from './ExportSVGDialog';
import { CanvasPenTool } from './CanvasPenTool';

/* ── Layer Item ── */

function LayerItem({
  obj,
  isSelected,
  onSelect,
  onDelete,
  onToggleVisibility,
  onToggleLock,
}: {
  obj: FabricObject;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
}) {
  const name = obj.name || obj.type || 'Object';
  const isLocked = obj.lockMovementX && obj.lockMovementY;

  return (
    <div
      className={cn(
        'group flex items-center gap-1.5 rounded-md px-2 py-1.5 cursor-pointer transition-colors',
        isSelected
          ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)]',
      )}
      onClick={onSelect}
    >
      {/* Type icon */}
      <div className="size-5 shrink-0 rounded bg-[var(--color-bg-elevated)] flex items-center justify-center text-[10px] uppercase font-bold text-[var(--color-text-tertiary)]">
        {obj.type?.charAt(0) ?? '?'}
      </div>

      {/* Name */}
      <span className="flex-1 truncate text-xs">{name}</span>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          className="size-5 flex items-center justify-center rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
        >
          {obj.visible !== false ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
          )}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
          className="size-5 flex items-center justify-center rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
        >
          {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="size-5 flex items-center justify-center rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)]"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   CANVAS EDITOR — Main component with Fabric.js
   ════════════════════════════════════════════════════ */

interface CanvasEditorProps {
  fileId: string;
  fileName?: string;
}

export function CanvasEditor({ fileId }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const [activeTool, setActiveTool] = useState<string>('select');
  const [fillColor, setFillColor] = useState('#FF3333');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [layers, setLayers] = useState<FabricObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Advanced feature states
  const [showGrid, setShowGrid] = useState(false);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [gridSize, setGridSize] = useState(20);
  const [showComponents, setShowComponents] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [bezierPenActive, setBezierPenActive] = useState(false);

  // Drawing state for shapes
  const drawingRef = useRef<{
    isDrawing: boolean;
    startX: number;
    startY: number;
    currentObj: FabricObject | null;
  } | null>(null);

  // ── Initialize Fabric Canvas ──

  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: '#FFFFFF',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricRef.current = fabricCanvas;

    // Listen for selection and layer changes
    const updateLayers = () => {
      setLayers([...fabricCanvas.getObjects()].reverse());
    };

    fabricCanvas.on('selection:created' as keyof CanvasEvents, () => {
      updateLayers();
      const active = fabricCanvas.getActiveObject();
      if (active) setSelectedObjectId(active.objectId || null);
    });

    fabricCanvas.on('selection:updated' as keyof CanvasEvents, () => {
      updateLayers();
      const active = fabricCanvas.getActiveObject();
      if (active) setSelectedObjectId(active.objectId || null);
    });

    fabricCanvas.on('selection:cleared' as keyof CanvasEvents, () => {
      setSelectedObjectId(null);
    });

    fabricCanvas.on('object:added' as keyof CanvasEvents, updateLayers);
    fabricCanvas.on('object:removed' as keyof CanvasEvents, updateLayers);
    fabricCanvas.on('object:modified' as keyof CanvasEvents, updateLayers);

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && fabricCanvas) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        fabricCanvas.setDimensions({ width: w, height: h });
        fabricCanvas.renderAll();
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
      handleResize();
    }

    return () => {
      observer.disconnect();
      fabricCanvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // ── Tool switching ──

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Don't override tools when bezier pen is active
    if (bezierPenActive) return;

    // Remove old handlers
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');

    // Remove any existing drawing mode
    canvas.isDrawingMode = false;

    switch (activeTool) {
      case 'select':
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'move';
        canvas.forEachObject((obj) => {
          obj.selectable = true;
          obj.evented = true;
        });
        break;

      case 'pen':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new PencilBrush(canvas);
        (canvas.freeDrawingBrush as PencilBrush).color = strokeColor;
        (canvas.freeDrawingBrush as PencilBrush).width = strokeWidth;
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;

      case 'eraser':
        // Eraser mode: click to delete objects
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = true;
        });
        canvas.on('mouse:down' as keyof CanvasEvents, (opt) => {
          if (opt.target) {
            canvas.remove(opt.target);
            canvas.renderAll();
          }
        });
        break;

      case 'pan':
        canvas.selection = false;
        canvas.defaultCursor = 'grab';
        canvas.hoverCursor = 'grab';
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        canvas.on('mouse:down' as keyof CanvasEvents, (opt) => {
          canvas.defaultCursor = 'grabbing';
          const evt = opt.e;
          canvas.on('mouse:move' as keyof CanvasEvents, (moveOpt) => {
            const vpt = canvas.viewportTransform!;
            vpt[4] += moveOpt.e.clientX - evt.clientX;
            vpt[5] += moveOpt.e.clientY - evt.clientY;
            canvas.requestRenderAll();
            evt.clientX = moveOpt.e.clientX;
            evt.clientY = moveOpt.e.clientY;
          });
          canvas.on('mouse:up' as keyof CanvasEvents, () => {
            canvas.defaultCursor = 'grab';
            canvas.off('mouse:move');
            canvas.off('mouse:up');
          });
        });
        break;

      case 'rect':
      case 'ellipse':
      case 'line':
      case 'arrow': {
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });

        canvas.on('mouse:down' as keyof CanvasEvents, (opt) => {
          const pointer = canvas.getPointer(opt.e);
          drawingRef.current = {
            isDrawing: true,
            startX: pointer.x,
            startY: pointer.y,
            currentObj: null,
          };

          let obj: FabricObject;
          if (activeTool === 'rect') {
            obj = new Rect({
              left: pointer.x,
              top: pointer.y,
              width: 0,
              height: 0,
              fill: fillColor,
              stroke: strokeColor,
              strokeWidth,
              selectable: false,
              evented: false,
              name: 'Rectangle',
            });
          } else if (activeTool === 'ellipse') {
            obj = new Circle({
              left: pointer.x,
              top: pointer.y,
              radius: 0,
              fill: fillColor,
              stroke: strokeColor,
              strokeWidth,
              selectable: false,
              evented: false,
              name: 'Ellipse',
            });
          } else {
            // line or arrow
            obj = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
              stroke: strokeColor,
              strokeWidth,
              selectable: false,
              evented: false,
              name: activeTool === 'arrow' ? 'Arrow' : 'Line',
            });
          }

          canvas.add(obj);
          drawingRef.current.currentObj = obj;
        });

        canvas.on('mouse:move' as keyof CanvasEvents, (opt) => {
          if (!drawingRef.current?.isDrawing || !drawingRef.current.currentObj) return;
          const pointer = canvas.getPointer(opt.e);
          const obj = drawingRef.current.currentObj;

          if (activeTool === 'rect') {
            const left = Math.min(drawingRef.current.startX, pointer.x);
            const top = Math.min(drawingRef.current.startY, pointer.y);
            const w = Math.abs(pointer.x - drawingRef.current.startX);
            const h = Math.abs(pointer.y - drawingRef.current.startY);
            obj.set({ left, top, width: w, height: h });
          } else if (activeTool === 'ellipse') {
            const radius = Math.max(
              Math.abs(pointer.x - drawingRef.current.startX),
              Math.abs(pointer.y - drawingRef.current.startY),
            ) / 2;
            obj.set({ radius });
          } else {
            (obj as Line).set({
              x2: pointer.x,
              y2: pointer.y,
            });
          }

          canvas.renderAll();
        });

        canvas.on('mouse:up' as keyof CanvasEvents, () => {
          if (drawingRef.current?.currentObj) {
            const obj = drawingRef.current.currentObj;
            obj.set({ selectable: true, evented: true });
            canvas.setActiveObject(obj);
            canvas.renderAll();
          }
          drawingRef.current = null;
        });

        break;
      }

      case 'text': {
        canvas.selection = false;
        canvas.defaultCursor = 'text';
        canvas.hoverCursor = 'text';
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });

        canvas.on('mouse:down' as keyof CanvasEvents, (opt) => {
          const pointer = canvas.getPointer(opt.e);
          const text = new IText('Type here', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 24,
            fill: fillColor,
            fontFamily: 'Inter, system-ui, sans-serif',
            name: 'Text',
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          text.enterEditing();
          canvas.renderAll();

          // Switch back to select after adding text
          setActiveTool('select');
        });
        break;
      }

      case 'sticky': {
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });

        canvas.on('mouse:down' as keyof CanvasEvents, (opt) => {
          const pointer = canvas.getPointer(opt.e);
          const stickyGroup = new Rect({
            left: pointer.x,
            top: pointer.y,
            width: 160,
            height: 120,
            fill: '#FEF08A',
            stroke: '#EAB308',
            strokeWidth: 1,
            rx: 4,
            ry: 4,
            name: 'Sticky Note',
          });
          canvas.add(stickyGroup);

          const text = new IText('Notes...', {
            left: pointer.x + 12,
            top: pointer.y + 12,
            width: 136,
            fontSize: 14,
            fill: '#713F12',
            fontFamily: 'Inter, system-ui, sans-serif',
            name: 'Sticky Text',
          });
          canvas.add(text);
          canvas.setActiveObject(stickyGroup);
          canvas.renderAll();
          setActiveTool('select');
        });
        break;
      }

      case 'image': {
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });

        canvas.on('mouse:down' as keyof CanvasEvents, (opt) => {
          const pointer = canvas.getPointer(opt.e);
          const rect = new Rect({
            left: pointer.x,
            top: pointer.y,
            width: 200,
            height: 150,
            fill: '#F5F5F4',
            stroke: '#D4D4D4',
            strokeWidth: 1,
            strokeDashArray: [5, 5],
            rx: 4,
            ry: 4,
            name: 'Image Placeholder',
          });
          canvas.add(rect);

          // Add placeholder text
          const text = new IText('Image', {
            left: pointer.x + 80,
            top: pointer.y + 68,
            fontSize: 16,
            fill: '#A09F99',
            fontFamily: 'Inter, system-ui, sans-serif',
            name: 'Image Label',
          });
          canvas.add(text);
          canvas.setActiveObject(rect);
          canvas.renderAll();
          setActiveTool('select');
        });
        break;
      }
    }
  }, [activeTool, fillColor, strokeColor, strokeWidth, bezierPenActive]);

  // ── Keyboard shortcuts ──

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.contentEditable === 'true'
      ) return;

      // Don't interfere with text editing
      const active = canvas.getActiveObject();
      if (active && 'isEditing' in active && (active as IText).isEditing) return;

      const key = e.key.toLowerCase();

      // B key — toggle bezier pen
      if (key === 'b' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setBezierPenActive((prev) => !prev);
        if (bezierPenActive) {
          setActiveTool('select');
        }
        return;
      }

      // Escape — deactivate bezier pen
      if (key === 'escape' && bezierPenActive) {
        e.preventDefault();
        setBezierPenActive(false);
        setActiveTool('select');
        // Restore canvas interactivity
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'move';
        canvas.forEachObject((obj) => {
          obj.selectable = true;
          obj.evented = true;
        });
        canvas.renderAll();
        return;
      }

      // Don't trigger tool shortcuts when bezier pen is active
      if (bezierPenActive) return;

      // Tool shortcuts
      if (SHORTCUT_TO_TOOL[key] && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setActiveTool(SHORTCUT_TO_TOOL[key]);
        return;
      }

      // Delete
      if ((key === 'delete' || key === 'backspace') && !e.metaKey && !e.ctrlKey) {
        if (active) {
          e.preventDefault();
          canvas.remove(active);
          canvas.renderAll();
        }
        return;
      }

      // Select All
      if (key === 'a' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        canvas.discardActiveObject();
        const sel = new (canvas.constructor as any).ActiveSelection(canvas.getObjects(), { canvas });
        canvas.setActiveObject(sel);
        canvas.requestRenderAll();
        return;
      }

      // Duplicate
      if (key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (active && !active.isEditing) {
          active.clone().then((cloned) => {
            cloned.set({
              left: (cloned.left ?? 0) + 10,
              top: (cloned.top ?? 0) + 10,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bezierPenActive]);

  // ── Zoom ──

  const handleZoom = useCallback((delta: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    let newZoom = zoom + delta;
    newZoom = Math.min(3, Math.max(0.25, newZoom));
    canvas.setZoom(newZoom);
    setZoom(newZoom);
  }, [zoom]);

  const handleFitZoom = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(1);
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    canvas.renderAll();
    setZoom(1);
  }, []);

  // ── Layer actions ──

  const handleDeleteLayer = useCallback((obj: FabricObject) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.remove(obj);
    canvas.renderAll();
  }, []);

  const handleToggleVisibility = useCallback((obj: FabricObject) => {
    obj.visible = !obj.visible;
    const canvas = fabricRef.current;
    if (canvas) canvas.renderAll();
    setLayers([...(canvasRef.current ? fabricRef.current!.getObjects() : [])].reverse());
  }, []);

  const handleToggleLock = useCallback((obj: FabricObject) => {
    const locked = obj.lockMovementX && obj.lockMovementY;
    obj.set({
      lockMovementX: !locked,
      lockMovementY: !locked,
      lockScalingX: !locked,
      lockScalingY: !locked,
      lockRotation: !locked,
      hasControls: locked,
    });
    obj.selectable = locked;
    const canvas = fabricRef.current;
    if (canvas) canvas.renderAll();
  }, []);

  const handleSelectLayer = useCallback((obj: FabricObject) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (bezierPenActive) setBezierPenActive(false);
    setActiveTool('select');
    canvas.setActiveObject(obj);
    canvas.renderAll();
    setSelectedObjectId(obj.objectId || null);
  }, [bezierPenActive]);

  // ── Toolbar action buttons ──

  const handleDuplicate = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && 'clone' in active) {
      (active as IText).clone().then((cloned: FabricObject) => {
        cloned.set({ left: (cloned.left ?? 0) + 10, top: (cloned.top ?? 0) + 10 });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
      });
    }
  }, []);

  const handleDelete = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.remove(active);
      canvas.renderAll();
    }
  }, []);

  const handleBringFront = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.bringToFront(active);
      canvas.renderAll();
    }
  }, []);

  const handleSendBack = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.sendToBack(active);
      canvas.renderAll();
    }
  }, []);

  // ── Advanced tool toggle handler ──

  const handleAdvancedTool = useCallback((toolId: string) => {
    switch (toolId) {
      case 'bezier-pen':
        setBezierPenActive((prev) => {
          const next = !prev;
          if (!next) setActiveTool('select');
          return next;
        });
        break;
      case 'grid':
        setShowGrid((prev) => !prev);
        break;
      case 'components':
        setShowComponents((prev) => !prev);
        break;
      case 'export-svg':
        setShowExportDialog(true);
        break;
    }
  }, []);

  return (
    <div className="flex h-full bg-[var(--color-bg-elevated)]">
      {/* ── Left Tool Rail ── */}
      <div className={cn(
        'flex flex-col items-center gap-1 py-2 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)]',
        isMobile ? 'w-10' : 'w-12',
      )}>
        {CANVAS_TOOLS.map((tool) => (
          <ToolRailButton
            key={tool.id}
            tool={tool}
            active={activeTool === tool.id && !bezierPenActive}
            onClick={() => {
              setBezierPenActive(false);
              setActiveTool(tool.id);
            }}
          />
        ))}

        {/* Separator */}
        <div className="w-6 h-px bg-[var(--color-border)] my-1" />

        {/* Advanced tools */}
        {ADVANCED_TOOLS.map((tool) => (
          <AdvancedToolButton
            key={tool.id}
            tool={tool}
            active={
              (tool.id === 'bezier-pen' && bezierPenActive) ||
              (tool.id === 'grid' && showGrid) ||
              (tool.id === 'components' && showComponents)
            }
            onClick={() => handleAdvancedTool(tool.id)}
          />
        ))}
      </div>

      {/* ── Canvas Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top toolbar */}
        <div className="h-10 shrink-0 flex items-center gap-2 px-3 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-x-auto">
          {/* Fill color */}
          <label className="flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)] cursor-pointer">
            Fill
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="h-6 w-6 rounded cursor-pointer border border-[var(--color-border)]"
            />
          </label>

          {/* Stroke color */}
          <label className="flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)] cursor-pointer">
            Stroke
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="h-6 w-6 rounded cursor-pointer border border-[var(--color-border)]"
            />
          </label>

          {/* Stroke width */}
          <label className="flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)]">
            W
            <input
              type="range"
              min={1}
              max={20}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-16 h-1 accent-[var(--color-accent)]"
            />
            <span className="tabular-nums w-4 text-center">{strokeWidth}</span>
          </label>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Actions */}
          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleBringFront}
                  className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)]"
                >
                  <BringToFront size={14} strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p className="text-xs">Bring to Front</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleSendBack}
                  className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)]"
                >
                  <SendToBack size={14} strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p className="text-xs">Send to Back</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)]"
                >
                  <Copy size={14} strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p className="text-xs">Duplicate (⌘D)</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-danger)]"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p className="text-xs">Delete</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex-1" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleZoom(-0.1)}
                    className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)]"
                  >
                    <ZoomOut size={14} strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p className="text-xs">Zoom Out</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span className="text-[11px] text-[var(--color-text-secondary)] w-10 text-center tabular-nums font-mono">
              {Math.round(zoom * 100)}%
            </span>

            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleZoom(0.1)}
                    className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)]"
                  >
                    <ZoomIn size={14} strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p className="text-xs">Zoom In</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleFitZoom}
                    className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)]"
                  >
                    <Maximize2 size={14} strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p className="text-xs">Fit</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Fabric Canvas Container */}
        <div ref={containerRef} className="flex-1 overflow-hidden relative">
          <canvas ref={canvasRef} />

          {/* Grid Overlay */}
          {showGrid && (
            <CanvasGrid
              canvasRef={fabricRef}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(false)}
              guides={guides}
              onGuidesChange={setGuides}
              gridSize={gridSize}
              onGridSizeChange={setGridSize}
            />
          )}

          {/* Pen Tool Mode Indicator */}
          <CanvasPenTool
            canvasRef={fabricRef}
            isActive={bezierPenActive}
            onToggle={() => setBezierPenActive((prev) => !prev)}
            fillColor={fillColor}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
          />
        </div>

        {/* Status bar */}
        <div className="h-7 shrink-0 flex items-center justify-between px-3 border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[11px] text-[var(--color-text-tertiary)]">
          <span>
            Tool:{' '}
            {bezierPenActive
              ? 'Bezier Pen'
              : CANVAS_TOOLS.find((t) => t.id === activeTool)?.label.split(' (')[0] ?? activeTool}
            {showGrid && ' · Grid On'}
          </span>
          <span className="flex items-center gap-3">
            <span>Objects: {layers.length}</span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
          </span>
        </div>
      </div>

      {/* ── Right Panel: Layers / Components (hidden on mobile) ── */}
      {!isMobile && (
        showComponents ? (
          <ComponentLibrary
            canvasRef={fabricRef}
            isOpen={showComponents}
            onToggle={() => setShowComponents(false)}
          />
        ) : (
          <div className="w-56 shrink-0 bg-[var(--color-bg-surface)] border-l border-[var(--color-border)] flex flex-col">
            <div className="px-3 py-2 border-b border-[var(--color-border)]">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                Layers
              </span>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-0.5">
                {layers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] mb-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        <circle cx="9" cy="9" r="2" />
                      </svg>
                    </div>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      No objects yet
                    </p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
                      Use tools on the left to add elements
                    </p>
                  </div>
                ) : (
                  layers.map((obj) => (
                    <LayerItem
                      key={obj.objectId || layers.indexOf(obj)}
                      obj={obj}
                      isSelected={selectedObjectId === obj.objectId}
                      onSelect={() => handleSelectLayer(obj)}
                      onDelete={() => handleDeleteLayer(obj)}
                      onToggleVisibility={() => handleToggleVisibility(obj)}
                      onToggleLock={() => handleToggleLock(obj)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )
      )}

      {/* Export SVG Dialog */}
      <ExportSVGDialog
        canvasRef={fabricRef}
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
      />
    </div>
  );
}
