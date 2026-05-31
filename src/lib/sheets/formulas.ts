/* ═══════════════════════════════════════════════════════════
   SHEETS FORMULAS — HyperFormula integration + fallback evaluator
   ═══════════════════════════════════════════════════════════ */

import { HyperFormula } from 'hyperformula';
import { cellRefToCoords, numToCol, ROW_COUNT, COL_COUNT } from './engine';

let hf: HyperFormula | null = null;

/**
 * Initialize (or return existing) HyperFormula instance.
 */
export function initHyperFormula(): HyperFormula {
  if (!hf) {
    hf = HyperFormula.buildEmpty({ licenseKey: 'gpl-v3' });
  }
  return hf;
}

export function getHyperFormula(): HyperFormula {
  return initHyperFormula();
}

/**
 * Destroy the HyperFormula instance (e.g. on unmount).
 */
export function destroyHyperFormula(): void {
  if (hf) {
    hf.destroy();
    hf = null;
  }
}

/**
 * Build a 2D grid of raw strings from a cell map for HyperFormula consumption.
 * Returns an array of arrays where grid[row][col] = raw string value.
 */
function buildGrid(cells: Map<string, string>): string[][] {
  const grid: string[][] = [];
  for (let r = 0; r < ROW_COUNT; r++) {
    grid[r] = [];
    for (let c = 0; c < COL_COUNT; c++) {
      grid[r][c] = '';
    }
  }
  for (const [ref, raw] of cells) {
    const coords = cellRefToCoords(ref);
    if (coords && coords[0] < ROW_COUNT && coords[1] < COL_COUNT) {
      grid[coords[0]][coords[1]] = raw;
    }
  }
  return grid;
}

/**
 * Parse a formula expression for cell references, e.g. "SUM(A1:A10)" or "A1+B1".
 * Returns a list of cell references found.
 */
function extractCellRefs(expr: string): string[] {
  const refs: string[] = [];
  // Match cell references: uppercase letters followed by digits
  const cellRefPattern = /\b([A-Z]{1,3}\d+)\b/g;
  let match: RegExpExecArray | null;
  while ((match = cellRefPattern.exec(expr.toUpperCase())) !== null) {
    refs.push(match[1]);
  }
  return refs;
}

/**
 * Parse a range like "A1:B5" into start/end cell refs.
 */
function parseRange(rangeStr: string): { start: string; end: string } | null {
  const parts = rangeStr.toUpperCase().split(':');
  if (parts.length === 2) {
    return { start: parts[0], end: parts[1] };
  }
  return null;
}

/**
 * Get all cell references in a range like "A1:C3".
 */
function expandRange(start: string, end: string): string[] {
  const s = cellRefToCoords(start);
  const e = cellRefToCoords(end);
  if (!s || !e) return [];
  const minRow = Math.min(s[0], e[0]);
  const maxRow = Math.max(s[0], e[0]);
  const minCol = Math.min(s[1], e[1]);
  const maxCol = Math.max(s[1], e[1]);
  const refs: string[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      refs.push(`${numToCol(c)}${r + 1}`);
    }
  }
  return refs;
}

/**
 * Resolve a cell reference to its numeric value from the data map.
 */
function resolveNumeric(ref: string, data: Map<string, string>): number {
  const raw = data.get(ref.toUpperCase());
  if (raw === undefined || raw === '') return 0;
  // Strip currency symbols, percent signs
  const cleaned = raw.replace(/^[£$€¥]/, '').replace(/%$/, '').replace(/,/g, '').trim();
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Simple formula evaluator (fallback when HyperFormula isn't needed for a quick eval).
 * Supports: SUM, AVERAGE, MIN, MAX, COUNT and basic arithmetic with cell references.
 */
function evaluateSimpleFormula(
  expr: string,
  data: Map<string, string>,
): string | null {
  const upper = expr.toUpperCase().trim();

  // ── Built-in functions ──

  // SUM(range) or SUM(ref1, ref2, ...)
  const sumMatch = upper.match(/^SUM\((.+)\)$/);
  if (sumMatch) {
    const args = sumMatch[1];
    let total = 0;
    // Check for range notation
    const range = parseRange(args);
    if (range) {
      const refs = expandRange(range.start, range.end);
      for (const ref of refs) {
        total += resolveNumeric(ref, data);
      }
    } else {
      // Individual refs
      const refs = args.split(',').map((r) => r.trim());
      for (const ref of refs) {
        total += resolveNumeric(ref, data);
      }
    }
    return String(total);
  }

  // AVERAGE(range)
  const avgMatch = upper.match(/^AVERAGE\((.+)\)$/);
  if (avgMatch) {
    const args = avgMatch[1];
    const range = parseRange(args);
    let sum = 0;
    let count = 0;
    if (range) {
      const refs = expandRange(range.start, range.end);
      for (const ref of refs) {
        sum += resolveNumeric(ref, data);
        count++;
      }
    } else {
      const refs = args.split(',').map((r) => r.trim());
      for (const ref of refs) {
        sum += resolveNumeric(ref, data);
        count++;
      }
    }
    return count > 0 ? String(sum / count) : '0';
  }

  // MIN(range)
  const minMatch = upper.match(/^MIN\((.+)\)$/);
  if (minMatch) {
    const args = minMatch[1];
    const range = parseRange(args);
    let min = Infinity;
    if (range) {
      const refs = expandRange(range.start, range.end);
      for (const ref of refs) {
        const v = resolveNumeric(ref, data);
        if (v < min) min = v;
      }
    }
    return min === Infinity ? '0' : String(min);
  }

  // MAX(range)
  const maxMatch = upper.match(/^MAX\((.+)\)$/);
  if (maxMatch) {
    const args = maxMatch[1];
    const range = parseRange(args);
    let max = -Infinity;
    if (range) {
      const refs = expandRange(range.start, range.end);
      for (const ref of refs) {
        const v = resolveNumeric(ref, data);
        if (v > max) max = v;
      }
    }
    return max === -Infinity ? '0' : String(max);
  }

  // COUNT(range)
  const countMatch = upper.match(/^COUNT\((.+)\)$/);
  if (countMatch) {
    const args = countMatch[1];
    const range = parseRange(args);
    let count = 0;
    if (range) {
      const refs = expandRange(range.start, range.end);
      for (const ref of refs) {
        const raw = data.get(ref.toUpperCase());
        if (raw && raw.trim() !== '') {
          const n = Number(raw.replace(/^[£$€¥]/, '').replace(/%$/, '').replace(/,/g, '').trim());
          if (!isNaN(n)) count++;
        }
      }
    }
    return String(count);
  }

  // ── Basic arithmetic with cell references ──
  // Replace cell references with their values, then evaluate
  try {
    let evalExpr = expr;
    // Replace range references (A1:B5) with SUM of that range
    evalExpr = evalExpr.replace(
      /([A-Z]{1,3}\d+):([A-Z]{1,3}\d+)/gi,
      (_match, start, end) => {
        const range = expandRange(start.toUpperCase(), end.toUpperCase());
        return range.map((ref) => resolveNumeric(ref, data)).join('+');
      },
    );
    // Replace individual cell refs with their numeric values
    evalExpr = evalExpr.replace(
      /\b([A-Z]{1,3}\d+)\b/gi,
      (match) => String(resolveNumeric(match.toUpperCase(), data)),
    );
    // Evaluate the expression (only allow safe math chars)
    if (/^[\d\s+\-*/().%^]+$/.test(evalExpr)) {
      const result = Function('"use strict"; return (' + evalExpr + ')')();
      if (typeof result === 'number' && isFinite(result)) {
        return String(result);
      }
    }
  } catch {
    // Fall through to error
  }

  return '#ERROR';
}

/**
 * Evaluate all cells in a sheet using HyperFormula.
 * Takes a map of cellRef -> raw string, returns a map of cellRef -> computed string.
 */
export function evaluateAll(
  rawData: Map<string, string>,
): Map<string, string> {
  const results = new Map<string, string>();

  // Find the maximum row and column to size the grid
  let maxRow = 0;
  let maxCol = 0;
  for (const ref of rawData.keys()) {
    const coords = cellRefToCoords(ref);
    if (coords) {
      maxRow = Math.max(maxRow, coords[0] + 1);
      maxCol = Math.max(maxCol, coords[1] + 1);
    }
  }

  // Add some padding
  maxRow = Math.max(maxRow + 10, 50);
  maxCol = Math.max(maxCol + 5, 26);

  const grid = buildGrid(rawData);

  try {
    const instance = getHyperFormula();
    // Destroy and rebuild to avoid sheet conflicts
    hf?.destroy();
    hf = HyperFormula.buildFromArray(grid, { licenseKey: 'gpl-v3' });

    // Calculate all values
    const sheetName = hf.getSheetName(0);
    if (sheetName) {
      for (let r = 0; r < Math.min(grid.length, maxRow); r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const val = hf.getCellValue({ sheet: 0, row: r, col: c });
          const ref = `${numToCol(c)}${r + 1}`;
          if (val !== null && val !== undefined) {
            if (typeof val === 'object' && 'value' in (val as object)) {
              // CellError
              const err = val as { value: string };
              results.set(ref, `#${err.value || 'ERROR'}`);
            } else {
              results.set(ref, String(val));
            }
          } else {
            // If raw data exists but HF returned null, it might be empty
            if (rawData.has(ref) && rawData.get(ref) !== '') {
              results.set(ref, rawData.get(ref)!);
            }
          }
        }
      }
    }
  } catch {
    // Fallback to simple evaluator
    for (const [ref, raw] of rawData) {
      if (raw.startsWith('=')) {
        const expr = raw.substring(1);
        results.set(ref, evaluateSimpleFormula(expr, rawData) || '#ERROR');
      } else {
        results.set(ref, raw);
      }
    }
  }

  // Also evaluate any formula cells that HF might have missed
  for (const [ref, raw] of rawData) {
    if (raw.startsWith('=') && !results.has(ref)) {
      const expr = raw.substring(1);
      results.set(ref, evaluateSimpleFormula(expr, rawData) || '#ERROR');
    }
  }

  return results;
}

/**
 * Evaluate a single formula expression given the current sheet data.
 */
export function evaluateFormula(
  expr: string,
  rawData: Map<string, string>,
): string {
  try {
    const fullExpr = '=' + expr;
    // Create a temp data map with the formula at a dummy location
    const tempData = new Map(rawData);
    tempData.set('ZZ9999', fullExpr);
    const results = evaluateAll(tempData);
    return results.get('ZZ9999') || '#ERROR';
  } catch {
    return evaluateSimpleFormula(expr, rawData) || '#ERROR';
  }
}
