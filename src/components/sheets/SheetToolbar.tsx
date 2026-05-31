'use client';

import { useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  DollarSign,
  Percent,
  Hash,
  PaintBucket,
  Palette,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { CellValue } from '@/lib/sheets/engine';
import { FreezeControl, type FreezeState } from './FreezeControl';

interface SheetToolbarProps {
  activeCell: CellValue | null;
  onFormatChange: (property: keyof CellValue, value: unknown) => void;
  // New advanced feature props
  onConditionalFormatToggle?: () => void;
  conditionalFormatActive?: boolean;
  onDataValidationOpen?: () => void;
  freezeState?: FreezeState;
  onFreezeChange?: (state: FreezeState) => void;
  onImportExportOpen?: () => void;
}

const FONT_FAMILIES = [
  'Inter',
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
];

const FONT_SIZES = ['10', '11', '12', '14', '16', '18', '20', '24', '28', '36', '48'];

function ToolbarBtn({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={active ? 'secondary' : 'ghost'}
            size="icon"
            className="size-7 shrink-0"
            onClick={onClick}
          >
            <Icon size={14} strokeWidth={active ? 2.5 : 1.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ToolbarDivider() {
  return <Separator orientation="vertical" className="h-5 mx-1" />;
}

/**
 * SheetToolbar — Formatting toolbar for the spreadsheet editor.
 */
export function SheetToolbar({
  activeCell,
  onFormatChange,
  onConditionalFormatToggle,
  conditionalFormatActive,
  onDataValidationOpen,
  freezeState,
  onFreezeChange,
  onImportExportOpen,
}: SheetToolbarProps) {
  const handleToggle = useCallback(
    (property: keyof CellValue) => {
      if (!activeCell) return;
      onFormatChange(property, !activeCell[property]);
    },
    [activeCell, onFormatChange],
  );

  const handleAlign = useCallback(
    (align: 'left' | 'center' | 'right') => {
      onFormatChange('alignH', align);
    },
    [onFormatChange],
  );

  const handleFormat = useCallback(
    (format: 'number' | 'currency' | 'percent') => {
      // We just set the type - the formula evaluator will handle computed values
      onFormatChange('format', format);
    },
    [onFormatChange],
  );

  return (
    <div className="flex items-center gap-0.5 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 h-9 overflow-x-auto shrink-0">
      {/* Font Family */}
      <Select
        value={activeCell?.fontFamily || 'Inter'}
        onValueChange={(v) => onFormatChange('fontFamily', v)}
      >
        <SelectTrigger className="h-7 w-[120px] text-xs shrink-0" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((f) => (
            <SelectItem key={f} value={f} className="text-xs">
              {f}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size */}
      <Select
        value={String(activeCell?.fontSize || 13)}
        onValueChange={(v) => onFormatChange('fontSize', Number(v))}
      >
        <SelectTrigger className="h-7 w-[56px] text-xs shrink-0 ml-0.5" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ToolbarDivider />

      {/* Bold */}
      <ToolbarBtn
        icon={Bold}
        label="Bold (Ctrl+B)"
        active={activeCell?.bold || false}
        onClick={() => handleToggle('bold')}
      />

      {/* Italic */}
      <ToolbarBtn
        icon={Italic}
        label="Italic (Ctrl+I)"
        active={activeCell?.italic || false}
        onClick={() => handleToggle('italic')}
      />

      {/* Underline */}
      <ToolbarBtn
        icon={Underline}
        label="Underline (Ctrl+U)"
        active={activeCell?.underline || false}
        onClick={() => handleToggle('underline')}
      />

      {/* Strikethrough */}
      <ToolbarBtn
        icon={Strikethrough}
        label="Strikethrough"
        active={activeCell?.strike || false}
        onClick={() => handleToggle('strike')}
      />

      <ToolbarDivider />

      {/* Text Color */}
      <ToolbarBtn
        icon={Type}
        label="Text Color"
        onClick={() => {
          onFormatChange(
            'textColor',
            activeCell?.textColor ? undefined : '#D63B3B',
          );
        }}
      />

      {/* Background Color */}
      <ToolbarBtn
        icon={PaintBucket}
        label="Fill Color"
        onClick={() => {
          onFormatChange(
            'bgColor',
            activeCell?.bgColor ? undefined : 'rgba(255, 51, 51, 0.08)',
          );
        }}
      />

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarBtn
        icon={AlignLeft}
        label="Align Left"
        active={activeCell?.alignH === 'left' || !activeCell?.alignH}
        onClick={() => handleAlign('left')}
      />
      <ToolbarBtn
        icon={AlignCenter}
        label="Align Center"
        active={activeCell?.alignH === 'center'}
        onClick={() => handleAlign('center')}
      />
      <ToolbarBtn
        icon={AlignRight}
        label="Align Right"
        active={activeCell?.alignH === 'right'}
        onClick={() => handleAlign('right')}
      />

      <ToolbarDivider />

      {/* Number Format */}
      <ToolbarBtn
        icon={Hash}
        label="Number Format"
        onClick={() => handleFormat('number')}
      />
      <ToolbarBtn
        icon={DollarSign}
        label="Currency Format"
        onClick={() => handleFormat('currency')}
      />
      <ToolbarBtn
        icon={Percent}
        label="Percent Format"
        onClick={() => handleFormat('percent')}
      />

      {/* ── Advanced Features Separator ── */}
      <ToolbarDivider />

      {/* Conditional Formatting */}
      {onConditionalFormatToggle && (
        <ToolbarBtn
          icon={Palette}
          label="Conditional Formatting"
          active={conditionalFormatActive || false}
          onClick={onConditionalFormatToggle}
        />
      )}

      {/* Data Validation */}
      {onDataValidationOpen && (
        <ToolbarBtn
          icon={ShieldCheck}
          label="Data Validation"
          onClick={onDataValidationOpen}
        />
      )}

      {/* Freeze Control */}
      {freezeState && onFreezeChange && (
        <FreezeControl freezeState={freezeState} onFreezeChange={onFreezeChange} />
      )}

      {/* Import/Export */}
      {onImportExportOpen && (
        <ToolbarBtn
          icon={Download}
          label="Import / Export"
          onClick={onImportExportOpen}
        />
      )}
    </div>
  );
}
