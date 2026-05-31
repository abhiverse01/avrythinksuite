// @ts-nocheck — Fabric.js v6 strict types require runtime casting; safe to suppress
'use client';

import React, { useState, useCallback } from 'react';
import { Rect, Circle, Ellipse, Line, Group, IText, Polygon, Triangle, Path } from 'fabric';
import { Search, LayoutGrid, GitBranch, Shapes } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { Canvas as FabricCanvas, FabricObject } from 'fabric';

/* ── Types ── */

interface ComponentLibraryProps {
  canvasRef: React.RefObject<FabricCanvas | null>;
  isOpen: boolean;
  onToggle: () => void;
}

interface ComponentDef {
  id: string;
  name: string;
  category: 'wireframe' | 'flowchart' | 'shapes';
  create: () => FabricObject[];
}

/* ════════════════════════════════════════════════════
   WIREFRAME UI COMPONENTS
   ════════════════════════════════════════════════════ */

function createWireframeButton(): FabricObject[] {
  const bg = new Rect({
    width: 120, height: 36, fill: '#E5E7EB', stroke: '#9CA3AF', strokeWidth: 1,
    rx: 6, ry: 6, name: 'Button',
  });
  const label = new IText('Button', {
    left: 34, top: 10, fontSize: 12, fill: '#374151',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'Button Text',
  });
  return [bg, label];
}

function createWireframeInput(): FabricObject[] {
  const bg = new Rect({
    width: 160, height: 32, fill: '#FFFFFF', stroke: '#9CA3AF', strokeWidth: 1,
    rx: 4, ry: 4, name: 'Input',
  });
  const placeholder = new IText('Placeholder...', {
    left: 8, top: 8, fontSize: 11, fill: '#9CA3AF',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'Input Placeholder',
  });
  return [bg, placeholder];
}

function createWireframeCheckbox(): FabricObject[] {
  const box = new Rect({
    width: 16, height: 16, fill: '#FFFFFF', stroke: '#6B7280', strokeWidth: 1,
    rx: 3, ry: 3, name: 'Checkbox',
  });
  const label = new IText('Checkbox', {
    left: 22, top: 1, fontSize: 12, fill: '#374151',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'Checkbox Label',
  });
  return [box, label];
}

function createWireframeRadio(): FabricObject[] {
  const circle = new Circle({
    radius: 8, fill: '#FFFFFF', stroke: '#6B7280', strokeWidth: 1, name: 'Radio',
  });
  const dot = new Circle({
    radius: 4, left: 4, top: 4, fill: '#374151', name: 'Radio Dot',
  });
  const label = new IText('Radio Option', {
    left: 22, top: 1, fontSize: 12, fill: '#374151',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'Radio Label',
  });
  return [circle, dot, label];
}

function createWireframeToggle(): FabricObject[] {
  const track = new Rect({
    width: 36, height: 20, fill: '#E5E7EB', stroke: '#9CA3AF', strokeWidth: 1,
    rx: 10, ry: 10, name: 'Toggle',
  });
  const thumb = new Circle({
    radius: 7, left: 3, top: 3, fill: '#FFFFFF', stroke: '#9CA3AF',
    strokeWidth: 1, name: 'Toggle Thumb',
  });
  return [track, thumb];
}

function createWireframeCard(): FabricObject[] {
  const bg = new Rect({
    width: 200, height: 140, fill: '#FFFFFF', stroke: '#D1D5DB', strokeWidth: 1,
    rx: 8, ry: 8, name: 'Card',
  });
  const header = new Rect({
    width: 200, height: 6, top: 12, left: 12, fill: '#E5E7EB', rx: 3, ry: 3,
    name: 'Card Header',
  });
  const body1 = new Rect({
    width: 176, height: 6, top: 32, left: 12, fill: '#F3F4F6', rx: 3, ry: 3,
    name: 'Card Body 1',
  });
  const body2 = new Rect({
    width: 140, height: 6, top: 46, left: 12, fill: '#F3F4F6', rx: 3, ry: 3,
    name: 'Card Body 2',
  });
  const body3 = new Rect({
    width: 160, height: 6, top: 60, left: 12, fill: '#F3F4F6', rx: 3, ry: 3,
    name: 'Card Body 3',
  });
  const btn = new Rect({
    width: 60, height: 24, top: 84, left: 12, fill: '#E5E7EB', stroke: '#D1D5DB',
    strokeWidth: 1, rx: 4, ry: 4, name: 'Card Button',
  });
  return [bg, header, body1, body2, body3, btn];
}

function createWireframeModal(): FabricObject[] {
  const overlay = new Rect({
    width: 280, height: 200, fill: 'rgba(0,0,0,0.1)', rx: 0, ry: 0, name: 'Modal Overlay',
  });
  const modal = new Rect({
    width: 240, height: 160, left: 20, top: 20, fill: '#FFFFFF', stroke: '#D1D5DB',
    strokeWidth: 1, rx: 8, ry: 8, name: 'Modal',
  });
  const title = new Rect({
    width: 100, height: 8, left: 164, top: 32, fill: '#E5E7EB', rx: 4, ry: 4,
    name: 'Modal Title',
  });
  const closeBtn = new Rect({
    width: 16, height: 16, left: 240, top: 28, fill: 'none', stroke: '#9CA3AF',
    strokeWidth: 1, rx: 0, ry: 0, name: 'Modal Close',
  });
  const body = new Rect({
    width: 216, height: 8, left: 164, top: 56, fill: '#F3F4F6', rx: 3, ry: 3,
    name: 'Modal Body 1',
  });
  const body2 = new Rect({
    width: 180, height: 8, left: 164, top: 72, fill: '#F3F4F6', rx: 3, ry: 3,
    name: 'Modal Body 2',
  });
  const body3 = new Rect({
    width: 200, height: 8, left: 164, top: 88, fill: '#F3F4F6', rx: 3, ry: 3,
    name: 'Modal Body 3',
  });
  const cancelBtn = new Rect({
    width: 50, height: 28, left: 164, top: 120, fill: '#FFFFFF', stroke: '#D1D5DB',
    strokeWidth: 1, rx: 4, ry: 4, name: 'Modal Cancel',
  });
  const confirmBtn = new Rect({
    width: 60, height: 28, left: 222, top: 120, fill: '#E5E7EB', stroke: '#D1D5DB',
    strokeWidth: 1, rx: 4, ry: 4, name: 'Modal Confirm',
  });
  return [overlay, modal, title, closeBtn, body, body2, body3, cancelBtn, confirmBtn];
}

function createWireframeNavbar(): FabricObject[] {
  const bg = new Rect({
    width: 260, height: 40, fill: '#F9FAFB', stroke: '#E5E7EB', strokeWidth: 1,
    name: 'Navbar',
  });
  const logo = new Rect({
    width: 20, height: 20, top: 10, left: 12, fill: '#D1D5DB', rx: 4, ry: 4,
    name: 'Nav Logo',
  });
  const link1 = new Rect({
    width: 40, height: 6, top: 17, left: 44, fill: '#E5E7EB', rx: 3, ry: 3,
    name: 'Nav Link 1',
  });
  const link2 = new Rect({
    width: 40, height: 6, top: 17, left: 92, fill: '#E5E7EB', rx: 3, ry: 3,
    name: 'Nav Link 2',
  });
  const link3 = new Rect({
    width: 40, height: 6, top: 17, left: 140, fill: '#E5E7EB', rx: 3, ry: 3,
    name: 'Nav Link 3',
  });
  const avatar = new Circle({
    radius: 10, left: 232, top: 10, fill: '#E5E7EB', stroke: '#D1D5DB',
    strokeWidth: 1, name: 'Nav Avatar',
  });
  return [bg, logo, link1, link2, link3, avatar];
}

function createWireframeTable(): FabricObject[] {
  const header = new Rect({
    width: 200, height: 24, fill: '#F3F4F6', stroke: '#E5E7EB', strokeWidth: 1,
    name: 'Table Header',
  });
  const col1 = new IText('Name', {
    left: 12, top: 6, fontSize: 10, fill: '#6B7280',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'TH Name',
  });
  const col2 = new IText('Status', {
    left: 80, top: 6, fontSize: 10, fill: '#6B7280',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'TH Status',
  });
  const col3 = new IText('Action', {
    left: 150, top: 6, fontSize: 10, fill: '#6B7280',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'TH Action',
  });
  const rows = [28, 52, 76];
  const rowElements: FabricObject[] = [];
  rows.forEach((top, idx) => {
    const row = new Rect({
      width: 200, height: 24, top, fill: '#FFFFFF', stroke: '#E5E7EB',
      strokeWidth: 0.5, name: `Row ${idx + 1}`,
    });
    rowElements.push(row);
    const c1 = new IText(`Item ${idx + 1}`, {
      left: 12, top: top + 6, fontSize: 10, fill: '#374151',
      fontFamily: 'Inter, system-ui, sans-serif', name: `Row ${idx + 1} Col 1`,
    });
    rowElements.push(c1);
    const c2 = new Rect({
      width: 36, height: 14, left: 80, top: top + 5, fill: idx === 1 ? '#D1FAE5' : '#FEF3C7',
      rx: 7, ry: 7, name: `Row ${idx + 1} Badge`,
    });
    rowElements.push(c2);
  });

  return [header, col1, col2, col3, ...rowElements];
}

/* ════════════════════════════════════════════════════
   FLOWCHART COMPONENTS
   ════════════════════════════════════════════════════ */

function createFlowchartRect(): FabricObject[] {
  const rect = new Rect({
    width: 120, height: 60, fill: '#FFFFFF', stroke: '#6B7280', strokeWidth: 1.5,
    rx: 4, ry: 4, name: 'Process',
  });
  const text = new IText('Process', {
    left: 32, top: 22, fontSize: 12, fill: '#374151',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'Process Text',
  });
  return [rect, text];
}

function createFlowchartDiamond(): FabricObject[] {
  const diamond = new Polygon(
    [
      { x: 60, y: 0 },
      { x: 120, y: 40 },
      { x: 60, y: 80 },
      { x: 0, y: 40 },
    ],
    {
      fill: '#FFFFFF', stroke: '#6B7280', strokeWidth: 1.5, name: 'Decision',
    },
  );
  const text = new IText('Decision', {
    left: 18, top: 32, fontSize: 11, fill: '#374151',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'Decision Text',
  });
  return [diamond, text];
}

function createFlowchartOval(): FabricObject[] {
  const oval = new Ellipse({
    rx: 60, ry: 30, fill: '#FFFFFF', stroke: '#6B7280', strokeWidth: 1.5,
    name: 'Terminal',
  });
  const text = new IText('Start/End', {
    left: 16, top: 20, fontSize: 12, fill: '#374151',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'Terminal Text',
  });
  return [oval, text];
}

function createFlowchartParallelogram(): FabricObject[] {
  const shape = new Polygon(
    [
      { x: 20, y: 0 },
      { x: 140, y: 0 },
      { x: 120, y: 60 },
      { x: 0, y: 60 },
    ],
    {
      fill: '#FFFFFF', stroke: '#6B7280', strokeWidth: 1.5, name: 'Input/Output',
    },
  );
  const text = new IText('I/O', {
    left: 54, top: 22, fontSize: 12, fill: '#374151',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'I/O Text',
  });
  return [shape, text];
}

function createFlowchartCylinder(): FabricObject[] {
  const body = new Rect({
    width: 80, height: 60, fill: '#FFFFFF', stroke: '#6B7280', strokeWidth: 1.5,
    name: 'Database Body',
  });
  const topEllipse = new Ellipse({
    rx: 40, ry: 10, fill: '#FFFFFF', stroke: '#6B7280', strokeWidth: 1.5,
    name: 'Database Top',
  });
  const bottomArc = new Path(
    'M 0,60 Q 0,80 40,80 Q 80,80 80,60',
    { fill: 'transparent', stroke: '#6B7280', strokeWidth: 1.5, name: 'Database Bottom' },
  );
  const text = new IText('Database', {
    left: 12, top: 30, fontSize: 11, fill: '#374151',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'Database Text',
  });
  return [body, topEllipse, bottomArc, text];
}

function createFlowchartCloud(): FabricObject[] {
  const cloud = new Path(
    'M 25,70 Q 10,70 10,58 Q 10,48 20,45 Q 20,30 35,28 Q 45,20 55,28 Q 65,20 75,30 Q 90,28 90,42 Q 100,45 100,55 Q 100,70 85,70 Z',
    {
      fill: '#FFFFFF', stroke: '#6B7280', strokeWidth: 1.5, name: 'Cloud',
    },
  );
  const text = new IText('Cloud', {
    left: 32, top: 42, fontSize: 11, fill: '#374151',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'Cloud Text',
  });
  return [cloud, text];
}

function createFlowchartDocument(): FabricObject[] {
  const doc = new Path(
    'M 0,0 L 80,0 L 80,80 Q 40,65 0,80 Z',
    {
      fill: '#FFFFFF', stroke: '#6B7280', strokeWidth: 1.5, name: 'Document',
    },
  );
  const text = new IText('Doc', {
    left: 26, top: 30, fontSize: 12, fill: '#374151',
    fontFamily: 'Inter, system-ui, sans-serif', name: 'Document Text',
  });
  return [doc, text];
}

function createFlowchartArrow(): FabricObject[] {
  const line = new Line([0, 20, 80, 20], {
    stroke: '#6B7280', strokeWidth: 1.5, name: 'Arrow Line',
  });
  const head = new Triangle({
    width: 12, height: 12, left: 74, top: 14, fill: '#6B7280', name: 'Arrow Head',
    angle: 90,
  });
  return [line, head];
}

/* ════════════════════════════════════════════════════
   SHAPES COMPONENTS
   ════════════════════════════════════════════════════ */

function createShapeRoundedRect(): FabricObject[] {
  const rect = new Rect({
    width: 100, height: 60, fill: '#EFF6FF', stroke: '#3B82F6', strokeWidth: 1.5,
    rx: 12, ry: 12, name: 'Rounded Rect',
  });
  return [rect];
}

function createShapeCircle(): FabricObject[] {
  const circle = new Circle({
    radius: 30, fill: '#F0FDF4', stroke: '#22C55E', strokeWidth: 1.5, name: 'Circle',
  });
  return [circle];
}

function createShapeHexagon(): FabricObject[] {
  const hex = new Polygon(
    [
      { x: 30, y: 0 }, { x: 60, y: 15 }, { x: 60, y: 45 },
      { x: 30, y: 60 }, { x: 0, y: 45 }, { x: 0, y: 15 },
    ],
    {
      fill: '#FEF3C7', stroke: '#F59E0B', strokeWidth: 1.5, name: 'Hexagon',
    },
  );
  return [hex];
}

function createShapeStar(): FabricObject[] {
  const outerR = 30;
  const innerR = 15;
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push({
      x: 30 + r * Math.cos(angle),
      y: 30 + r * Math.sin(angle),
    });
  }
  const star = new Polygon(points, {
    fill: '#FCE7F3', stroke: '#EC4899', strokeWidth: 1.5, name: 'Star',
  });
  return [star];
}

function createShapePill(): FabricObject[] {
  const pill = new Rect({
    width: 100, height: 30, fill: '#EDE9FE', stroke: '#8B5CF6', strokeWidth: 1.5,
    rx: 15, ry: 15, name: 'Pill',
  });
  return [pill];
}

function createShapeBadge(): FabricObject[] {
  const badge = new Polygon(
    [
      { x: 10, y: 0 }, { x: 40, y: 0 }, { x: 50, y: 10 },
      { x: 50, y: 20 }, { x: 40, y: 30 }, { x: 10, y: 30 },
      { x: 0, y: 20 }, { x: 0, y: 10 },
    ],
    {
      fill: '#FFF7ED', stroke: '#F97316', strokeWidth: 1.5, name: 'Badge',
    },
  );
  return [badge];
}

/* ════════════════════════════════════════════════════
   COMPONENT DEFINITIONS
   ════════════════════════════════════════════════════ */

const COMPONENTS: ComponentDef[] = [
  // Wireframe UI
  { id: 'btn', name: 'Button', category: 'wireframe', create: createWireframeButton },
  { id: 'input', name: 'Input', category: 'wireframe', create: createWireframeInput },
  { id: 'checkbox', name: 'Checkbox', category: 'wireframe', create: createWireframeCheckbox },
  { id: 'radio', name: 'Radio', category: 'wireframe', create: createWireframeRadio },
  { id: 'toggle', name: 'Toggle', category: 'wireframe', create: createWireframeToggle },
  { id: 'card', name: 'Card', category: 'wireframe', create: createWireframeCard },
  { id: 'modal', name: 'Modal', category: 'wireframe', create: createWireframeModal },
  { id: 'navbar', name: 'Navigation', category: 'wireframe', create: createWireframeNavbar },
  { id: 'table', name: 'Table', category: 'wireframe', create: createWireframeTable },
  // Flowchart
  { id: 'fc-rect', name: 'Rectangle', category: 'flowchart', create: createFlowchartRect },
  { id: 'fc-diamond', name: 'Diamond', category: 'flowchart', create: createFlowchartDiamond },
  { id: 'fc-oval', name: 'Oval', category: 'flowchart', create: createFlowchartOval },
  { id: 'fc-parallel', name: 'Parallelogram', category: 'flowchart', create: createFlowchartParallelogram },
  { id: 'fc-cylinder', name: 'Cylinder', category: 'flowchart', create: createFlowchartCylinder },
  { id: 'fc-cloud', name: 'Cloud', category: 'flowchart', create: createFlowchartCloud },
  { id: 'fc-doc', name: 'Document', category: 'flowchart', create: createFlowchartDocument },
  { id: 'fc-arrow', name: 'Arrow', category: 'flowchart', create: createFlowchartArrow },
  // Shapes
  { id: 'sh-roundrect', name: 'Rounded Rect', category: 'shapes', create: createShapeRoundedRect },
  { id: 'sh-circle', name: 'Circle', category: 'shapes', create: createShapeCircle },
  { id: 'sh-hexagon', name: 'Hexagon', category: 'shapes', create: createShapeHexagon },
  { id: 'sh-star', name: 'Star', category: 'shapes', create: createShapeStar },
  { id: 'sh-pill', name: 'Pill', category: 'shapes', create: createShapePill },
  { id: 'sh-badge', name: 'Badge', category: 'shapes', create: createShapeBadge },
];

/* ── Component Thumbnail ── */

function ComponentThumbnail({
  component,
  onClick,
}: {
  component: ComponentDef;
  onClick: () => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create an offscreen fabric canvas to render thumbnail
    const offscreen = document.createElement('canvas');
    offscreen.width = 80;
    offscreen.height = 50;
    const ctx = offscreen.getContext('2d')!;

    // Import fabric dynamically for thumbnail rendering
    import('fabric').then(({ Canvas: FabricCanvas }) => {
      const fc = new FabricCanvas(offscreen, {
        width: 80,
        height: 50,
        selection: false,
        renderOnAddRemove: false,
      });
      const objects = component.create();

      // Scale objects to fit thumbnail
      const group = new Group(objects, {
        scaleX: 0.35,
        scaleY: 0.35,
      });

      const bounds = group.getBoundingRect();
      const scale = Math.min(
        (70 - 4) / (bounds.width / 0.35),
        (40 - 4) / (bounds.height / 0.35),
        0.6,
      );
      const scaledGroup = new Group(objects, {
        scaleX: scale,
        scaleY: scale,
        left: 40 - ((bounds.width / 0.35) * scale) / 2,
        top: 25 - ((bounds.height / 0.35) * scale) / 2,
      });

      fc.add(scaledGroup);
      fc.renderAll();

      ctx.drawImage(offscreen, 0, 0);
      canvas.width = 80;
      canvas.height = 50;
      ctx.drawImage(offscreen, 0, 0, 80, 50);

      fc.dispose();
    });
  }, [component]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)] cursor-pointer w-full"
    >
      <canvas
        ref={canvasRef}
        width={80}
        height={50}
        className="rounded border border-[var(--color-border)] bg-white"
      />
      <span className="text-[10px] leading-tight truncate w-full text-center">
        {component.name}
      </span>
    </button>
  );
}

/* ════════════════════════════════════════════════════
   COMPONENT LIBRARY — Main panel
   ════════════════════════════════════════════════════ */

export function ComponentLibrary({ canvasRef, isOpen, onToggle }: ComponentLibraryProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wireframe');

  const filteredComponents = COMPONENTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleInsert = useCallback(
    (component: ComponentDef) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const objects = component.create();
      const group = new Group(objects, {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        originX: 'center',
        originY: 'center',
        name: component.name,
      });

      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
    },
    [canvasRef],
  );

  if (!isOpen) return null;

  return (
    <div className="w-56 shrink-0 bg-[var(--color-bg-surface)] border-l border-[var(--color-border)] flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--color-border)] flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          Components
        </span>
        <button
          type="button"
          onClick={onToggle}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-[var(--color-border)]">
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-7 pl-7 text-xs bg-[var(--color-bg-elevated)] border-[var(--color-border)]"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
        <div className="px-3 pt-2">
          <TabsList className="w-full h-7 bg-[var(--color-bg-elevated)]">
            <TabsTrigger value="wireframe" className="flex-1 text-[10px] gap-1 h-6">
              <LayoutGrid size={10} />
              UI
            </TabsTrigger>
            <TabsTrigger value="flowchart" className="flex-1 text-[10px] gap-1 h-6">
              <GitBranch size={10} />
              Flow
            </TabsTrigger>
            <TabsTrigger value="shapes" className="flex-1 text-[10px] gap-1 h-6">
              <Shapes size={10} />
              Shapes
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          {['wireframe', 'flowchart', 'shapes'].map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-0">
              <div className="p-2 grid grid-cols-2 gap-1">
                {filteredComponents
                  .filter((c) => c.category === cat)
                  .map((comp) => (
                    <ComponentThumbnail
                      key={comp.id}
                      component={comp}
                      onClick={() => handleInsert(comp)}
                    />
                  ))}
                {filteredComponents.filter((c) => c.category === cat).length === 0 && (
                  <div className="col-span-2 flex flex-col items-center py-6 text-[var(--color-text-tertiary)]">
                    <p className="text-[10px]">No components found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </div>
  );
}
