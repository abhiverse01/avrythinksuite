'use client';

import { useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react';
import type { CellValue } from '@/lib/sheets/engine';

interface CellEditorProps {
  /** The raw value being edited */
  value: string;
  /** Callback when the value changes */
  onChange: (value: string) => void;
  /** Callback to confirm the edit */
  onCommit: () => void;
  /** Callback to cancel the edit */
  onCancel: () => void;
  /** Callback for arrow keys (navigate without committing) */
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right') => void;
  /** Cell styling for the editor */
  cellStyle?: Partial<Pick<CellValue, 'textColor' | 'fontSize' | 'fontFamily' | 'bold' | 'italic'>>;
  /** Width of the cell */
  width: number;
  /** Height of the cell */
  height: number;
}

/**
 * CellEditor — An input overlay that appears when a cell enters edit mode.
 * Positioned absolutely over the cell being edited.
 */
export function CellEditor({
  value,
  onChange,
  onCommit,
  onCancel,
  onNavigate,
  cellStyle,
  width,
  height,
}: CellEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input and place cursor at end
    const el = inputRef.current;
    if (el) {
      el.focus();
      // Place cursor at end of input
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        onCommit();
        break;
      case 'Tab':
        e.preventDefault();
        e.stopPropagation();
        onCommit();
        onNavigate(e.shiftKey ? 'left' : 'right');
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        onCancel();
        break;
      case 'ArrowUp':
        // Only navigate if cursor is at start
        if (inputRef.current?.selectionStart === 0) {
          e.preventDefault();
          e.stopPropagation();
          onCommit();
          onNavigate('up');
        }
        break;
      case 'ArrowDown':
        // Only navigate if cursor is at end
        if (
          inputRef.current &&
          inputRef.current.selectionStart === inputRef.current.value.length
        ) {
          e.preventDefault();
          e.stopPropagation();
          onCommit();
          onNavigate('down');
        }
        break;
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="absolute inset-0 w-full h-full px-1 outline-none text-sm bg-white border-2 border-[var(--color-accent)] z-20"
      style={{
        minWidth: width,
        minHeight: height,
        color: cellStyle?.textColor,
        fontSize: cellStyle?.fontSize,
        fontFamily: cellStyle?.fontFamily,
        fontWeight: cellStyle?.bold ? 700 : 400,
        fontStyle: cellStyle?.italic ? 'italic' : 'normal',
      }}
      onBlur={onCommit}
    />
  );
}
