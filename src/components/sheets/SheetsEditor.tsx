'use client';

import {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  type KeyboardEvent,
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CellEditor } from './CellEditor';
import { SheetToolbar } from './SheetToolbar';
import { SheetTabs } from './SheetTabs';
import { ConditionalFormatPanel, type ConditionalFormatRule } from './ConditionalFormatPanel';
import { DataValidationDialog, type DataValidationRule } from './DataValidationDialog';
import { ImportExportDialog } from './ImportExportDialog';
import {
  type CellValue,
  type CellRange,
  type SheetState,
  ROW_COUNT,
  COL_COUNT,
  DEFAULT_COL_WIDTH,
  DEFAULT_ROW_HEIGHT,
  HEADER_WIDTH,
  HEADER_HEIGHT,
  numToCol,
  cellRefToCoords,
  coordsToCellRef,
  parseCellContent,
  formatCellValue,
  isCellInRange,
  moveCell,
  createSheetState,
  createEmptyCell,
} from '@/lib/sheets/engine';
import { evaluateAll, destroyHyperFormula } from '@/lib/sheets/formulas';
import { cn } from '@/lib/utils';

// ── Props ──

interface SheetsEditorProps {
  sheetId?: string;
}


// ── Pre-generate column labels ──

const COL_LABELS: string[] = [];
for (let i = 0; i < COL_COUNT; i++) {
  COL_LABELS.push(numToCol(i));
}

// ── Conditional formatting evaluator ──

function evaluateConditionalFormat(
  cell: CellValue | undefined,
  rule: ConditionalFormatRule,
): boolean {
  if (!cell || cell.type === 'empty') {
    // Empty cells match is-empty / is-not-empty
    if (rule.condition === 'is-empty') return true;
    if (rule.condition === 'is-not-empty') return false;
    return false;
  }

  const computed = cell.computed;
  const numVal = Number(computed);

  switch (rule.condition) {
    case 'greater-than':
      return !isNaN(numVal) && numVal > Number(rule.value);
    case 'less-than':
      return !isNaN(numVal) && numVal < Number(rule.value);
    case 'between':
      return !isNaN(numVal) && numVal >= Number(rule.value) && numVal <= Number(rule.value2 || rule.value);
    case 'equal-to':
      return computed === rule.value || String(numVal) === rule.value;
    case 'text-contains':
      return computed.toLowerCase().includes(rule.value.toLowerCase());
    case 'is-empty':
      return cell.type === 'empty' || computed === '';
    case 'is-not-empty':
      return cell.type !== 'empty' && computed !== '';
    default:
      return false;
  }
}

// ── Parse range string (e.g. "A1:D10") to row/col bounds ──

function parseRangeString(
  rangeStr: string,
): { minRow: number; maxRow: number; minCol: number; maxCol: number } | null {
  const parts = rangeStr.toUpperCase().split(':');
  if (parts.length !== 2) return null;
  const start = cellRefToCoords(parts[0]);
  const end = cellRefToCoords(parts[1]);
  if (!start || !end) return null;
  return {
    minRow: Math.min(start[0], end[0]),
    maxRow: Math.max(start[0], end[0]),
    minCol: Math.min(start[1], end[1]),
    maxCol: Math.max(start[1], end[1]),
  };
}

function isCellInRuleRange(row: number, col: number, rangeStr: string): boolean {
  const range = parseRangeString(rangeStr);
  if (!range) return false;
  return row >= range.minRow && row <= range.maxRow && col >= range.minCol && col <= range.maxCol;
}

// ── CSV Export helper ──

function generateCSV(cells: Map<string, CellValue>): string {
  const rows: string[] = [];
  for (let r = 0; r < ROW_COUNT; r++) {
    const rowCells: string[] = [];
    let hasContent = false;
    for (let c = 0; c < COL_COUNT; c++) {
      const ref = coordsToCellRef(r, c);
      const cell = cells.get(ref);
      const val = cell ? formatCellValue(cell) : '';
      if (val) hasContent = true;
      // Escape quotes and wrap if needed
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        rowCells.push(`"${val.replace(/"/g, '""')}"`);
      } else {
        rowCells.push(val);
      }
    }
    if (hasContent) rows.push(rowCells.join(','));
  }
  return rows.join('\n');
}

// ── Main Component ──

export function SheetsEditor({ sheetId: _sheetId }: SheetsEditorProps) {
  // ── Sheet state ──
  const [sheets, setSheets] = useState<SheetState[]>([
    createSheetState('sheet-1', 'Sheet1'),
  ]);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);

  // ── Grid state ──
  const [cells, setCells] = useState<Map<string, CellValue>>(new Map());
  const [colWidths, setColWidths] = useState<Map<number, number>>(new Map());
  const [rowHeights, setRowHeights] = useState<Map<number, number>>(new Map());

  // ── Selection state ──
  const [activeCell, setActiveCell] = useState<string>('A1');
  const [selectionRange, setSelectionRange] = useState<CellRange | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionStartRef = useRef<{ row: number; col: number } | null>(null);

  // ── Editing state ──
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // ── Formula bar state ──
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const formulaInputRef = useRef<HTMLInputElement>(null);

  // ── Scroll container ref ──
  const scrollParentRef = useRef<HTMLDivElement>(null);
  const colScrollRef = useRef<HTMLDivElement>(null);

  // ── Advanced: Conditional Formatting ──
  const [conditionalFormats, setConditionalFormats] = useState<ConditionalFormatRule[]>([]);
  const [cfPanelOpen, setCfPanelOpen] = useState(false);

  // ── Advanced: Data Validation ──
  const [dvDialogOpen, setDvDialogOpen] = useState(false);
  const [dataValidations, setDataValidations] = useState<Map<string, DataValidationRule>>(new Map());

  // ── Advanced: Freeze ──
  const [freezeState, setFreezeState] = useState<{ rows: number; cols: number }>({ rows: 0, cols: 0 });

  // ── Advanced: Import/Export ──
  const [ieDialogOpen, setIeDialogOpen] = useState(false);

  // ── Get active cell data ──
  const activeCellValue = cells.get(activeCell) || null;

  // ── Column total width ──
  const getTotalWidth = useCallback(() => {
    let total = 0;
    for (let c = 0; c < COL_COUNT; c++) {
      total += colWidths.get(c) || DEFAULT_COL_WIDTH;
    }
    return total;
  }, [colWidths]);

  // ── Row virtualizer ──
  const rowVirtualizer = useVirtualizer({
    count: ROW_COUNT,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: (index) => rowHeights.get(index) || DEFAULT_ROW_HEIGHT,
    overscan: 20,
  });

  // ── Scroll sync between column headers and grid ──
  const handleGridScroll = useCallback(() => {
    if (colScrollRef.current && scrollParentRef.current) {
      colScrollRef.current.scrollLeft = scrollParentRef.current.scrollLeft;
    }
  }, []);

  // ── Re-evaluate formulas when cells change ──
  useEffect(() => {
    const rawData = new Map<string, string>();
    for (const [ref, cell] of cells) {
      if (cell.type !== 'empty') {
        rawData.set(ref, cell.raw);
      }
    }

    // Check if there are any formula cells
    let hasFormulas = false;
    for (const cell of cells.values()) {
      if (cell.type === 'formula') {
        hasFormulas = true;
        break;
      }
    }

    if (hasFormulas) {
      const computed = evaluateAll(rawData);
      setCells((prev) => {
        const next = new Map(prev);
        for (const [ref, computedVal] of computed) {
          const existing = next.get(ref);
          if (existing && existing.type === 'formula') {
            next.set(ref, { ...existing, computed: computedVal });
          }
        }
        return next;
      });
    }
  }, [cells.size]);

  // ── Cleanup HyperFormula on unmount ──
  useEffect(() => {
    return () => {
      destroyHyperFormula();
    };
  }, []);

  // ── Cell click handler ──
  const handleCellClick = useCallback(
    (ref: string, e?: React.MouseEvent) => {
      // Commit any in-progress editing
      if (editingCell) {
        commitEdit();
      }

      setActiveCell(ref);
      setFormulaBarValue(cells.get(ref)?.raw || '');

      if (e?.shiftKey && selectionStartRef.current) {
        const coords = cellRefToCoords(ref);
        if (coords) {
          setSelectionRange({
            startRow: selectionStartRef.current.row,
            startCol: selectionStartRef.current.col,
            endRow: coords[0],
            endCol: coords[1],
          });
        }
      } else {
        const coords = cellRefToCoords(ref);
        if (coords) {
          selectionStartRef.current = { row: coords[0], col: coords[1] };
        }
        setSelectionRange(null);
      }
    },
    [cells, editingCell],
  );

  // ── Mouse down on cell for range selection ──
  const handleCellMouseDown = useCallback(
    (ref: string, e: React.MouseEvent) => {
      if (e.shiftKey) {
        setIsSelecting(true);
      }
      handleCellClick(ref, e);
    },
    [handleCellClick],
  );

  // ── Mouse move for extending selection ──
  const handleCellMouseEnter = useCallback(
    (ref: string) => {
      if (isSelecting && selectionStartRef.current) {
        const coords = cellRefToCoords(ref);
        if (coords) {
          setSelectionRange({
            startRow: selectionStartRef.current.row,
            startCol: selectionStartRef.current.col,
            endRow: coords[0],
            endCol: coords[1],
          });
        }
      }
    },
    [isSelecting],
  );

  // ── Global mouse up ──
  useEffect(() => {
    const handler = () => setIsSelecting(false);
    window.addEventListener('mouseup', handler);
    return () => window.removeEventListener('mouseup', handler);
  }, []);

  // ── Start editing a cell ──
  const startEditing = useCallback(
    (ref: string, initialValue?: string) => {
      const existing = cells.get(ref);
      const val = initialValue !== undefined ? initialValue : existing?.raw || '';
      setEditingCell(ref);
      setEditValue(val);
      setFormulaBarValue(val);
    },
    [cells],
  );

  // ── Commit edit ──
  const commitEdit = useCallback(() => {
    if (editingCell) {
      const parsed = parseCellContent(editValue);
      const newCell: CellValue = {
        raw: editValue,
        computed: parsed.computed,
        type: parsed.type,
      };

      // Preserve existing formatting
      const existing = cells.get(editingCell);
      if (existing) {
        newCell.bold = existing.bold;
        newCell.italic = existing.italic;
        newCell.underline = existing.underline;
        newCell.strike = existing.strike;
        newCell.textColor = existing.textColor;
        newCell.bgColor = existing.bgColor;
        newCell.alignH = existing.alignH;
        newCell.alignV = existing.alignV;
        newCell.fontSize = existing.fontSize;
        newCell.fontFamily = existing.fontFamily;
        newCell.format = existing.format;
      }

      setCells((prev) => {
        const next = new Map(prev);
        if (parsed.type === 'empty') {
          next.delete(editingCell);
        } else {
          next.set(editingCell, newCell);
        }
        return next;
      });

      // Re-evaluate formulas if this was a formula
      if (parsed.type === 'formula') {
        const rawData = new Map<string, string>();
        const tempCells = new Map(cells);
        tempCells.set(editingCell, newCell);
        for (const [r, c] of tempCells) {
          if (c.type !== 'empty') {
            rawData.set(r, c.raw);
          }
        }
        const computed = evaluateAll(rawData);
        setCells((prev) => {
          const next = new Map(prev);
          for (const [ref, computedVal] of computed) {
            const existing = next.get(ref);
            if (existing && existing.type === 'formula') {
              next.set(ref, { ...existing, computed: computedVal });
            }
          }
          return next;
        });
      }

      setFormulaBarValue(editValue);
      setEditingCell(null);
      setEditValue('');
    }
  }, [editingCell, editValue, cells]);

  // ── Cancel edit ──
  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
    setFormulaBarValue(cells.get(activeCell)?.raw || '');
  }, [activeCell, cells]);

  // ── Cell navigation ──
  const handleNavigate = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (editingCell) {
        commitEdit();
      }
      const coords = cellRefToCoords(activeCell);
      if (coords) {
        const [newRow, newCol] = moveCell(coords[0], coords[1], direction, ROW_COUNT, COL_COUNT);
        const newRef = coordsToCellRef(newRow, newCol);
        setActiveCell(newRef);
        setFormulaBarValue(cells.get(newRef)?.raw || '');
        setSelectionRange(null);
        selectionStartRef.current = { row: newRow, col: newCol };
      }
    },
    [activeCell, editingCell, cells, commitEdit],
  );

  // ── Keyboard handler for the grid ──
  const handleGridKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      // If editing, let the cell editor handle keys
      if (editingCell) return;

      // If formula bar is focused, let it handle keys
      if (
        document.activeElement === formulaInputRef.current
      )
        return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (e.shiftKey) {
            // Extend selection
            const coords = cellRefToCoords(activeCell);
            if (coords && selectionRange) {
              setSelectionRange({
                ...selectionRange,
                endRow: Math.max(0, selectionRange.endRow - 1),
              });
            } else if (coords) {
              setSelectionRange({
                startRow: coords[0],
                startCol: coords[1],
                endRow: Math.max(0, coords[0] - 1),
                endCol: coords[1],
              });
            }
          } else {
            handleNavigate('up');
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (e.shiftKey) {
            const coords = cellRefToCoords(activeCell);
            if (coords && selectionRange) {
              setSelectionRange({
                ...selectionRange,
                endRow: Math.min(ROW_COUNT - 1, selectionRange.endRow + 1),
              });
            } else if (coords) {
              setSelectionRange({
                startRow: coords[0],
                startCol: coords[1],
                endRow: Math.min(ROW_COUNT - 1, coords[0] + 1),
                endCol: coords[1],
              });
            }
          } else {
            handleNavigate('down');
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            const coords = cellRefToCoords(activeCell);
            if (coords && selectionRange) {
              setSelectionRange({
                ...selectionRange,
                endCol: Math.max(0, selectionRange.endCol - 1),
              });
            } else if (coords) {
              setSelectionRange({
                startRow: coords[0],
                startCol: coords[1],
                endRow: coords[0],
                endCol: Math.max(0, coords[1] - 1),
              });
            }
          } else {
            handleNavigate('left');
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            const coords = cellRefToCoords(activeCell);
            if (coords && selectionRange) {
              setSelectionRange({
                ...selectionRange,
                endCol: Math.min(COL_COUNT - 1, selectionRange.endCol + 1),
              });
            } else if (coords) {
              setSelectionRange({
                startRow: coords[0],
                startCol: coords[1],
                endRow: coords[0],
                endCol: Math.min(COL_COUNT - 1, coords[1] + 1),
              });
            }
          } else {
            handleNavigate('right');
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (e.shiftKey) {
            handleNavigate('up');
          } else {
            handleNavigate('down');
          }
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            handleNavigate('left');
          } else {
            handleNavigate('right');
          }
          break;
        case 'F2':
          e.preventDefault();
          startEditing(activeCell);
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          setCells((prev) => {
            const next = new Map(prev);
            next.delete(activeCell);
            return next;
          });
          setFormulaBarValue('');
          break;
        case 'a':
          if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
            e.preventDefault();
            // Select all
            setSelectionRange({
              startRow: 0,
              startCol: 0,
              endRow: ROW_COUNT - 1,
              endCol: COL_COUNT - 1,
            });
            selectionStartRef.current = { row: 0, col: 0 };
          }
          break;
        case 'b':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFormat('bold');
          }
          break;
        case 'i':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFormat('italic');
          }
          break;
        case 'u':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFormat('underline');
          }
          break;
        default:
          // Start typing to edit cell
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            startEditing(activeCell, e.key);
          }
          break;
      }
    },
    [activeCell, editingCell, selectionRange, handleNavigate, startEditing],
  );

  // ── Format toggle ──
  const toggleFormat = useCallback(
    (property: keyof CellValue) => {
      const current = cells.get(activeCell) || createEmptyCell();
      const newVal = !current[property];
      setCells((prev) => {
        const next = new Map(prev);
        const cell = next.get(activeCell) || createEmptyCell();
        next.set(activeCell, { ...cell, [property]: newVal });
        return next;
      });

      // Apply to all cells in selection range if any
      if (selectionRange) {
        const { startRow, startCol, endRow, endCol } = selectionRange;
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);
        setCells((prev) => {
          const next = new Map(prev);
          for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
              const ref = coordsToCellRef(r, c);
              const cell = next.get(ref) || createEmptyCell();
              next.set(ref, { ...cell, [property]: newVal });
            }
          }
          return next;
        });
      }
    },
    [activeCell, selectionRange],
  );

  // ── Format change from toolbar ──
  const handleFormatChange = useCallback(
    (property: keyof CellValue, value: unknown) => {
      setCells((prev) => {
        const next = new Map(prev);
        const cell = next.get(activeCell) || createEmptyCell();
        next.set(activeCell, { ...cell, [property]: value });
        return next;
      });

      // Apply to selection range if any
      if (selectionRange) {
        const { startRow, startCol, endRow, endCol } = selectionRange;
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);
        setCells((prev) => {
          const next = new Map(prev);
          for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
              const ref = coordsToCellRef(r, c);
              const cell = next.get(ref) || createEmptyCell();
              next.set(ref, { ...cell, [property]: value });
            }
          }
          return next;
        });
      }
    },
    [activeCell, selectionRange],
  );

  // ── Sheet tab handlers ──
  const handleSheetSelect = useCallback((index: number) => {
    setActiveSheetIdx(index);
  }, []);

  const handleSheetAdd = useCallback(() => {
    const id = `sheet-${Date.now()}`;
    const name = `Sheet${sheets.length + 1}`;
    setSheets((prev) => [...prev, createSheetState(id, name)]);
  }, [sheets.length]);

  const handleSheetRename = useCallback((index: number, name: string) => {
    setSheets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name };
      return next;
    });
  }, []);

  const handleSheetDelete = useCallback(
    (index: number) => {
      setSheets((prev) => prev.filter((_, i) => i !== index));
      if (activeSheetIdx >= index && activeSheetIdx > 0) {
        setActiveSheetIdx(activeSheetIdx - 1);
      }
    },
    [activeSheetIdx],
  );

  // ── Formula bar change ──
  const handleFormulaBarChange = useCallback(
    (value: string) => {
      if (editingCell) {
        setEditValue(value);
        setFormulaBarValue(value);
      } else {
        // Start editing the active cell with the new value
        startEditing(activeCell, value);
      }
    },
    [editingCell, activeCell, startEditing],
  );

  const handleFormulaBarFocus = useCallback(() => {
    if (!editingCell) {
      startEditing(activeCell);
    }
  }, [editingCell, activeCell, startEditing]);

  // ── Conditional format style resolver for a given cell ──
  const getConditionalStyles = useCallback(
    (row: number, col: number) => {
      const ref = coordsToCellRef(row, col);
      const cell = cells.get(ref);
      for (const rule of conditionalFormats) {
        if (
          isCellInRuleRange(row, col, rule.range) &&
          evaluateConditionalFormat(cell, rule)
        ) {
          return rule.format;
        }
      }
      return null;
    },
    [cells, conditionalFormats],
  );

  // ── Data validation handlers ──
  const handleDataValidationApply = useCallback(
    (rule: DataValidationRule) => {
      setDataValidations((prev) => {
        const next = new Map(prev);
        next.set(rule.range, rule);
        return next;
      });
    },
    [],
  );

  const handleDataValidationRemove = useCallback(() => {
    setDataValidations((prev) => {
      const next = new Map(prev);
      next.delete(activeCell);
      return next;
    });
  }, [activeCell]);

  // ── Import handler ──
  const handleImport = useCallback(
    (data: string[][], firstRowHeader: boolean) => {
      const newCells = new Map<string, CellValue>();
      const startRow = firstRowHeader ? 0 : 0;
      for (let r = 0; r < data.length; r++) {
        for (let c = 0; c < data[r].length; c++) {
          const val = data[r][c];
          if (val !== undefined && val !== '') {
            const ref = coordsToCellRef(startRow + r, c);
            if (c < COL_COUNT) {
              const parsed = parseCellContent(val);
              newCells.set(ref, {
                raw: val,
                computed: parsed.computed,
                type: parsed.type,
                bold: firstRowHeader && r === 0,
              });
            }
          }
        }
      }
      setCells(newCells);
    },
    [],
  );

  // ── Export CSV handler ──
  const handleExportCSV = useCallback(() => {
    const csv = generateCSV(cells);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sheet-export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [cells]);

  // ── Selection info for status bar ──
  const selectionInfo = useMemo(() => {
    if (!selectionRange) return null;
    const minRow = Math.min(selectionRange.startRow, selectionRange.endRow);
    const maxRow = Math.max(selectionRange.startRow, selectionRange.endRow);
    const minCol = Math.min(selectionRange.startCol, selectionRange.endCol);
    const maxCol = Math.max(selectionRange.startCol, selectionRange.endCol);
    const count = (maxRow - minRow + 1) * (maxCol - minCol + 1);

    // Compute sum/average of numeric cells in selection
    let sum = 0;
    let numCount = 0;
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const ref = coordsToCellRef(r, c);
        const cell = cells.get(ref);
        if (cell && (cell.type === 'number' || cell.type === 'currency' || cell.type === 'percent')) {
          const n = Number(cell.computed);
          if (!isNaN(n)) {
            sum += n;
            numCount++;
          }
        }
      }
    }

    return { count, sum, avg: numCount > 0 ? sum / numCount : 0 };
  }, [selectionRange, cells]);

  // ── Status bar stats ──
  const totalCells = cells.size;

  // ── Compute freeze dimensions ──
  const frozenRowHeight = useMemo(() => {
    let h = 0;
    for (let i = 0; i < freezeState.rows; i++) {
      h += rowHeights.get(i) || DEFAULT_ROW_HEIGHT;
    }
    return h;
  }, [freezeState.rows, rowHeights]);

  const frozenColWidth = useMemo(() => {
    let w = 0;
    for (let i = 0; i < freezeState.cols; i++) {
      w += colWidths.get(i) || DEFAULT_COL_WIDTH;
    }
    return w;
  }, [freezeState.cols, colWidths]);

  // ── Current data validation for active cell ──
  const currentDV = useMemo(() => {
    return dataValidations.get(activeCell) || null;
  }, [dataValidations, activeCell]);

  // ── Render ──

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--color-bg-base)]" onKeyDown={handleGridKeyDown} tabIndex={0}>
      {/* ── Formatting Toolbar ── */}
      <SheetToolbar
        activeCell={activeCellValue}
        onFormatChange={handleFormatChange}
        onConditionalFormatToggle={() => setCfPanelOpen((prev) => !prev)}
        conditionalFormatActive={cfPanelOpen}
        onDataValidationOpen={() => setDvDialogOpen(true)}
        freezeState={freezeState}
        onFreezeChange={setFreezeState}
        onImportExportOpen={() => setIeDialogOpen(true)}
      />

      {/* ── Formula Bar ── */}
      <div className="flex items-center border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] h-8 shrink-0">
        <div className="w-16 flex items-center justify-center text-xs font-mono text-[var(--color-text-secondary)] border-r border-[var(--color-border)] shrink-0 font-medium">
          {activeCell}
        </div>
        <div className="flex-1 flex items-center px-2 gap-1.5 min-w-0">
          <span className="text-sm text-[var(--color-text-tertiary)] italic select-none shrink-0">
            fx
          </span>
          <input
            ref={formulaInputRef}
            value={editingCell ? editValue : (cells.get(activeCell)?.raw || '')}
            onChange={(e) => handleFormulaBarChange(e.target.value)}
            onFocus={handleFormulaBarFocus}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitEdit();
                formulaInputRef.current?.blur();
                handleNavigate('down');
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
                formulaInputRef.current?.blur();
              }
            }}
            className="flex-1 text-sm font-mono bg-transparent outline-none text-[var(--color-text-primary)] min-w-0"
            placeholder="Enter value or formula..."
          />
        </div>
      </div>

      {/* ── Main area: grid + optional conditional format panel ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── Grid Area ── */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Column headers (scrolls horizontally with grid) */}
          <div
            ref={colScrollRef}
            className="flex shrink-0 overflow-hidden"
            style={{
              marginLeft: HEADER_WIDTH,
              height: HEADER_HEIGHT,
            }}
          >
            <div
              style={{
                width: getTotalWidth(),
                display: 'flex',
              }}
            >
              {Array.from({ length: COL_COUNT }, (_, i) => {
                const width = colWidths.get(i) || DEFAULT_COL_WIDTH;
                const isFrozenCol = i < freezeState.cols;
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-center text-xs text-[var(--color-text-tertiary)] bg-[var(--color-bg-elevated)] border-b border-r border-[var(--color-border)] select-none shrink-0',
                      isFrozenCol && 'sticky z-10 bg-[var(--color-bg-elevated)]',
                    )}
                    style={{
                      width,
                      height: HEADER_HEIGHT,
                      minWidth: 40,
                      ...(isFrozenCol
                        ? { left: i === 0 ? 0 : undefined }
                        : {}),
                    }}
                  >
                    {COL_LABELS[i]}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row area with sticky row headers */}
          <div className="flex flex-1 overflow-hidden">
            {/* Row number column (sticky left) */}
            <div
              className="shrink-0 overflow-hidden bg-[var(--color-bg-elevated)] z-10"
              style={{ width: HEADER_WIDTH }}
            >
              <div
                style={{
                  height: rowVirtualizer.getTotalSize(),
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const height = rowHeights.get(virtualRow.index) || DEFAULT_ROW_HEIGHT;
                  const isFrozenRow = virtualRow.index < freezeState.rows;
                  return (
                    <div
                      key={virtualRow.index}
                      className={cn(
                        'absolute top-0 left-0 w-full flex items-center justify-center text-xs text-[var(--color-text-tertiary)] border-r border-b border-[var(--color-border)] select-none',
                        isFrozenRow && 'sticky top-0 z-20 bg-[var(--color-bg-elevated)]',
                      )}
                      style={{
                        height,
                        transform: `translateY(${virtualRow.start}px)`,
                        ...(isFrozenRow
                          ? { top: virtualRow.index === 0 ? 0 : virtualRow.start }
                          : {}),
                      }}
                    >
                      {virtualRow.index + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main grid (scrollable) */}
            <div
              ref={scrollParentRef}
              className="flex-1 overflow-auto"
              onScroll={handleGridScroll}
            >
              <div
                style={{
                  height: rowVirtualizer.getTotalSize(),
                  width: getTotalWidth(),
                  position: 'relative',
                }}
              >
                {/* Row backgrounds */}
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const rowH = rowHeights.get(virtualRow.index) || DEFAULT_ROW_HEIGHT;
                  const isFrozenRow = virtualRow.index < freezeState.rows;
                  return (
                    <div
                      key={`bg-${virtualRow.index}`}
                      className={cn(
                        'absolute left-0 w-full',
                        isFrozenRow && 'sticky top-0 z-10',
                      )}
                      style={{
                        height: rowH,
                        top: virtualRow.start,
                        ...(isFrozenRow
                          ? { top: virtualRow.start }
                          : {}),
                      }}
                    >
                      {/* Cells in this row */}
                      {Array.from({ length: COL_COUNT }, (_, colIdx) => {
                        const ref = `${COL_LABELS[colIdx]}${virtualRow.index + 1}`;
                        const cell = cells.get(ref);
                        const isActive = activeCell === ref;
                        const isSelected =
                          selectionRange &&
                          isCellInRange(
                            virtualRow.index,
                            colIdx,
                            selectionRange,
                          );
                        const isEditing = editingCell === ref;
                        const colW = colWidths.get(colIdx) || DEFAULT_COL_WIDTH;
                        const isFrozenCol = colIdx < freezeState.cols;

                        // Compute horizontal position
                        let left = 0;
                        for (let c = 0; c < colIdx; c++) {
                          left += colWidths.get(c) || DEFAULT_COL_WIDTH;
                        }

                        // ── Evaluate conditional formatting ──
                        const cfStyle = getConditionalStyles(virtualRow.index, colIdx);

                        return (
                          <div
                            key={ref}
                            className={cn(
                              'absolute top-0 border-r border-b border-[var(--color-border)]',
                              isActive && !isEditing && 'ring-2 ring-[var(--color-accent)] ring-inset z-10',
                              isSelected && !isActive && 'bg-[var(--color-accent)]/10',
                              isFrozenCol && 'sticky z-[5] bg-[var(--color-bg-base)]',
                              cell?.bgColor && 'z-0',
                            )}
                            style={{
                              width: colW,
                              height: rowH,
                              left,
                              backgroundColor: cfStyle?.bgColor || cell?.bgColor || undefined,
                              ...(isFrozenCol ? { left } : {}),
                            }}
                            onMouseDown={(e) => handleCellMouseDown(ref, e)}
                            onMouseEnter={() => handleCellMouseEnter(ref)}
                            onDoubleClick={() => {
                              if (!isEditing) startEditing(ref);
                            }}
                          >
                            {isEditing ? (
                              <CellEditor
                                value={editValue}
                                onChange={setEditValue}
                                onCommit={commitEdit}
                                onCancel={cancelEdit}
                                onNavigate={handleNavigate}
                                cellStyle={cell || undefined}
                                width={colW}
                                height={rowH}
                              />
                            ) : (
                              <span
                                className="text-sm px-1.5 truncate block leading-tight select-none"
                                style={{
                                  color: cfStyle?.textColor || cell?.textColor,
                                  fontWeight: (cfStyle?.bold || cell?.bold) ? 700 : 400,
                                  fontStyle: (cfStyle?.italic || cell?.italic) ? 'italic' : 'normal',
                                  textDecoration: [
                                    cfStyle?.underline || cell?.underline ? 'underline' : '',
                                    cell?.strike ? 'line-through' : '',
                                  ]
                                    .filter(Boolean)
                                    .join(' ') || undefined,
                                  textAlign: cell?.alignH || 'left',
                                  fontSize: cell?.fontSize,
                                  fontFamily: cell?.fontFamily,
                                  lineHeight: `${rowH}px`,
                                }}
                              >
                                {cell ? formatCellValue(cell) : ''}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Conditional Formatting Panel (right side) ── */}
        <ConditionalFormatPanel
          rules={conditionalFormats}
          onRulesChange={setConditionalFormats}
          isOpen={cfPanelOpen}
          onToggle={() => setCfPanelOpen((prev) => !prev)}
        />
      </div>

      {/* ── Sheet Tabs ── */}
      <SheetTabs
        sheets={sheets.map((s) => ({ id: s.id, name: s.name }))}
        activeIndex={activeSheetIdx}
        onSelect={handleSheetSelect}
        onAdd={handleSheetAdd}
        onRename={handleSheetRename}
        onDelete={handleSheetDelete}
      />

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 h-7 shrink-0 text-xs text-[var(--color-text-tertiary)]">
        <div className="flex items-center gap-3">
          <span>
            {selectionInfo
              ? `${selectionInfo.count} cells selected`
              : `${totalCells} filled`}
          </span>
          {selectionInfo && selectionInfo.count > 1 && (
            <>
              <span>Sum: {selectionInfo.sum.toLocaleString()}</span>
              <span>Avg: {selectionInfo.avg.toFixed(2)}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {freezeState.rows > 0 && (
            <span className="text-[#FF3333]">{freezeState.rows} row(s) frozen</span>
          )}
          {freezeState.cols > 0 && (
            <span className="text-[#FF3333]">{freezeState.cols} col(s) frozen</span>
          )}
          <span>Sheets: {sheets.length}</span>
          <span>{sheets[activeSheetIdx]?.name || 'Sheet1'}</span>
        </div>
      </div>

      {/* ── Data Validation Dialog ── */}
      <DataValidationDialog
        open={dvDialogOpen}
        onOpenChange={setDvDialogOpen}
        selectedCell={activeCell}
        currentRule={currentDV}
        onApply={handleDataValidationApply}
        onRemove={handleDataValidationRemove}
      />

      {/* ── Import/Export Dialog ── */}
      <ImportExportDialog
        open={ieDialogOpen}
        onOpenChange={setIeDialogOpen}
        onImport={handleImport}
        onExportCSV={handleExportCSV}
        cellCount={totalCells}
      />
    </div>
  );
}
