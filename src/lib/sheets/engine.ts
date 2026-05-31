/* ═══════════════════════════════════════════════════════════
   SHEETS ENGINE — Core types, parsing, formatting, coords
   ═══════════════════════════════════════════════════════════ */

// ── Cell Value ──

export type CellType =
  | 'text'
  | 'number'
  | 'currency'
  | 'percent'
  | 'date'
  | 'boolean'
  | 'error'
  | 'formula'
  | 'empty';

export interface CellValue {
  raw: string; // What the user typed
  computed: string; // Evaluated result (formula output or parsed raw)
  type: CellType;
  format?: string; // Format string
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  textColor?: string;
  bgColor?: string;
  alignH?: 'left' | 'center' | 'right';
  alignV?: 'top' | 'middle' | 'bottom';
  fontSize?: number;
  fontFamily?: string;
}

// ── Sheet Data ──

export interface SheetData {
  cells: Map<string, CellValue>; // key = "A1", "B3", etc.
  colWidths: Map<number, number>; // column index -> width in px
  rowHeights: Map<number, number>; // row index -> height in px
  sheetName: string;
}

export interface SheetState {
  id: string;
  name: string;
  cells: Map<string, CellValue>;
  colWidths: Map<number, number>;
  rowHeights: Map<number, number>;
}

// ── Selection ──

export interface CellRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

// ── Coordinate helpers ──

/**
 * Convert a column letter (or letters) to a 0-based column index.
 * A=0, B=1, ..., Z=25, AA=26, AB=27, ...
 */
export function colToNum(col: string): number {
  let num = 0;
  for (let i = 0; i < col.length; i++) {
    num = num * 26 + (col.charCodeAt(i) - 65 + 1);
  }
  return num - 1;
}

/**
 * Convert a 0-based column index to a column letter.
 * 0=A, 1=B, ..., 25=Z, 26=AA, 27=AB, ...
 */
export function numToCol(num: number): string {
  let result = '';
  let n = num + 1;
  while (n > 0) {
    n -= 1;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

/**
 * Parse a cell reference like "A1", "BZ42" into [row, col] (both 0-based).
 * Returns null if the reference is invalid.
 */
export function cellRefToCoords(ref: string): [number, number] | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;
  const col = colToNum(match[1].toUpperCase());
  const row = parseInt(match[2], 10) - 1;
  if (row < 0) return null;
  return [row, col];
}

/**
 * Convert 0-based row and col to a cell reference string.
 * coordsToCellRef(0, 0) => "A1", coordsToCellRef(2, 25) => "Z3"
 */
export function coordsToCellRef(row: number, col: number): string {
  return `${numToCol(col)}${row + 1}`;
}

// ── Column list helper ──

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function getColumnLetters(count: number): string[] {
  const cols: string[] = [];
  for (let i = 0; i < count; i++) {
    cols.push(numToCol(i));
  }
  return cols;
}

// ── Constants ──

export const ROW_COUNT = 200;
export const COL_COUNT = 26;
export const DEFAULT_COL_WIDTH = 120;
export const DEFAULT_ROW_HEIGHT = 28;
export const HEADER_WIDTH = 48;
export const HEADER_HEIGHT = 28;
export const MIN_COL_WIDTH = 40;
export const MAX_COL_WIDTH = 500;
export const MIN_ROW_HEIGHT = 20;
export const MAX_ROW_HEIGHT = 400;

// ── Parse cell content ──

/**
 * Detect the type of a raw cell input and compute its display value.
 */
export function parseCellContent(
  raw: string,
): Pick<CellValue, 'type' | 'computed'> {
  if (!raw || raw.trim() === '') {
    return { type: 'empty', computed: '' };
  }

  const trimmed = raw.trim();

  // Formula — leave computation to HyperFormula
  if (trimmed.startsWith('=')) {
    return { type: 'formula', computed: trimmed };
  }

  // Boolean
  if (trimmed === 'TRUE' || trimmed === 'FALSE') {
    return { type: 'boolean', computed: trimmed };
  }

  // Currency: "$1,234.56" or "€1,234.56"
  if (/^[£$€¥][\d,]*\.?\d*$/.test(trimmed)) {
    const numStr = trimmed.substring(1).replace(/,/g, '');
    const num = Number(numStr);
    if (!isNaN(num)) {
      return { type: 'currency', computed: String(num) };
    }
  }

  // Percentage: "50%" or "50.5%"
  if (/^\d+\.?\d*%$/.test(trimmed)) {
    const num = Number(trimmed.replace('%', '')) / 100;
    if (!isNaN(num)) {
      return { type: 'percent', computed: String(num) };
    }
  }

  // Date: "2025-01-15", "1/15/2025", "Jan 15, 2025"
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // ISO
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // US
    /^\d{1,2}\/\d{1,2}\/\d{2}$/, // US short year
  ];
  for (const pat of datePatterns) {
    if (pat.test(trimmed)) {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        return { type: 'date', computed: d.toISOString() };
      }
    }
  }

  // Number (must come after currency/percent/date checks)
  if (!isNaN(Number(trimmed)) && trimmed !== '') {
    return { type: 'number', computed: trimmed };
  }

  // Default: text
  return { type: 'text', computed: trimmed };
}

// ── Format cell for display ──

/**
 * Format a CellValue for display in a cell.
 */
export function formatCellValue(value: CellValue): string {
  switch (value.type) {
    case 'number':
      return Number(value.computed).toLocaleString(undefined, {
        maximumFractionDigits: 10,
      });
    case 'currency': {
      const num = Number(value.computed);
      if (isNaN(num)) return value.computed;
      // Detect currency symbol from raw
      const sym = value.raw.match(/^[£$€¥]/)?.[0] || '$';
      return (
        sym +
        num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
    case 'percent': {
      const num = Number(value.computed);
      if (isNaN(num)) return value.computed;
      return (num * 100).toFixed(1) + '%';
    }
    case 'date': {
      try {
        const d = new Date(value.computed);
        if (isNaN(d.getTime())) return value.computed;
        return d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      } catch {
        return value.computed;
      }
    }
    case 'boolean':
      return value.computed;
    case 'error':
      return value.computed || '#ERROR';
    case 'formula':
      // Display the computed result of the formula
      return value.computed.startsWith('=') ? value.computed : value.computed;
    default:
      return value.computed;
  }
}

// ── Empty cell factory ──

export function createEmptyCell(): CellValue {
  return {
    raw: '',
    computed: '',
    type: 'empty',
  };
}

// ── Range helpers ──

/**
 * Check if a cell reference is within a selection range.
 * Normalizes start/end so start <= end.
 */
export function isCellInRange(
  row: number,
  col: number,
  range: CellRange,
): boolean {
  const minRow = Math.min(range.startRow, range.endRow);
  const maxRow = Math.max(range.startRow, range.endRow);
  const minCol = Math.min(range.startCol, range.endCol);
  const maxCol = Math.max(range.startCol, range.endCol);
  return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
}

/**
 * Get all cell refs in a range.
 */
export function getCellsInRange(range: CellRange): string[] {
  const minRow = Math.min(range.startRow, range.endRow);
  const maxRow = Math.max(range.startRow, range.endRow);
  const minCol = Math.min(range.startCol, range.endCol);
  const maxCol = Math.max(range.startCol, range.endCol);
  const refs: string[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      refs.push(coordsToCellRef(r, c));
    }
  }
  return refs;
}

/**
 * Move from a cell in a direction, wrapping/clamping within bounds.
 */
export function moveCell(
  row: number,
  col: number,
  direction: 'up' | 'down' | 'left' | 'right',
  maxRow: number,
  maxCol: number,
): [number, number] {
  switch (direction) {
    case 'up':
      return [Math.max(0, row - 1), col];
    case 'down':
      return [Math.min(maxRow - 1, row + 1), col];
    case 'left':
      return [row, Math.max(0, col - 1)];
    case 'right':
      return [row, Math.min(maxCol - 1, col + 1)];
  }
}

/**
 * Create a new blank SheetState.
 */
export function createSheetState(id: string, name: string): SheetState {
  return {
    id,
    name,
    cells: new Map(),
    colWidths: new Map(),
    rowHeights: new Map(),
  };
}
