'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { Upload, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ── Types ──

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: string[][], firstRowHeader: boolean) => void;
  onExportCSV: () => void;
  cellCount: number;
}

// ── CSV Parser (simple client-side) ──

function parseCSV(text: string, delimiter: string = ','): string[][] {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        row.push(current.trim());
        current = '';
      } else if (char === '\n' || (char === '\r' && next === '\n')) {
        row.push(current.trim());
        current = '';
        if (row.length > 0) rows.push(row);
        row = [];
        if (char === '\r') i++; // skip \n in \r\n
      } else {
        current += char;
      }
    }
  }

  // Push last cell and row
  row.push(current.trim());
  if (row.length > 0 && row.some((c) => c !== '')) rows.push(row);

  return rows;
}

/**
 * ImportExportDialog — Dialog for importing and exporting sheet data.
 */
export function ImportExportDialog({
  open,
  onOpenChange,
  onImport,
  onExportCSV,
  cellCount,
}: ImportExportDialogProps) {
  // ── Import state ──
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<string[][]>([]);
  const [importError, setImportError] = useState('');
  const [firstRowHeader, setFirstRowHeader] = useState(true);
  const [delimiter, setDelimiter] = useState(',');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // ── Read file ──
  const readFile = useCallback((file: File) => {
    if (!file.name.match(/\.(csv|tsv|txt)$/i)) {
      setImportError('Only .csv, .tsv, and .txt files are supported.');
      setImportFile(null);
      setImportData([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const autoDelimiter = file.name.endsWith('.tsv') ? '\t' : delimiter;
      try {
        const parsed = parseCSV(text, autoDelimiter);
        if (parsed.length === 0) {
          setImportError('File is empty or could not be parsed.');
          setImportData([]);
        } else {
          setImportData(parsed);
          setImportError('');
          // Auto-detect delimiter from file extension
          if (file.name.endsWith('.tsv')) {
            setDelimiter('\t');
          }
        }
      } catch {
        setImportError('Failed to parse the file.');
        setImportData([]);
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read the file.');
    };
    reader.readAsText(file);
    setImportFile(file);
  }, [delimiter]);

  // ── Parse with selected delimiter ──
  const reParseData = useCallback(
    (newDelimiter: string) => {
      setDelimiter(newDelimiter);
      if (importFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          try {
            const parsed = parseCSV(text, newDelimiter);
            setImportData(parsed);
            setImportError('');
          } catch {
            setImportError('Failed to re-parse with selected delimiter.');
          }
        };
        reader.readAsText(importFile);
      }
    },
    [importFile],
  );

  // ── Drag & drop ──
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    },
    [readFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  // ── Preview rows (first 5) ──
  const previewRows = useMemo(() => importData.slice(0, 5), [importData]);

  // ── Import action ──
  const handleImport = useCallback(() => {
    if (importData.length === 0) return;
    onImport(importData, firstRowHeader);
    onOpenChange(false);
    // Reset state
    setImportFile(null);
    setImportData([]);
    setImportError('');
    setFirstRowHeader(true);
    setDelimiter(',');
  }, [importData, firstRowHeader, onImport, onOpenChange]);

  // ── Reset on close ──
  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setImportFile(null);
        setImportData([]);
        setImportError('');
        setFirstRowHeader(true);
        setDelimiter(',');
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import / Export</DialogTitle>
          <DialogDescription>Import data from a file or export your sheet.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="import" className="flex-1 gap-1.5">
              <Upload size={14} />
              Import
            </TabsTrigger>
            <TabsTrigger value="export" className="flex-1 gap-1.5">
              <Download size={14} />
              Export
            </TabsTrigger>
          </TabsList>

          {/* ── Import Tab ── */}
          <TabsContent value="import" className="flex flex-col gap-4 py-2">
            {/* Drag-drop zone */}
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors',
                isDragOver
                  ? 'border-[#FF3333] bg-[rgba(255,51,51,0.05)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} className="text-[var(--color-text-tertiary)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                Drop a file here or click to browse
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Accepts .csv, .tsv, .txt
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) readFile(file);
                }}
              />
            </div>

            {importError && (
              <p className="text-xs text-[var(--color-destructive)]">{importError}</p>
            )}

            {/* File info */}
            {importFile && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <FileText size={14} />
                <span className="truncate">{importFile.name}</span>
                <span className="text-[var(--color-text-tertiary)]">
                  ({importData.length} rows)
                </span>
              </div>
            )}

            {/* Delimiter select */}
            {importData.length > 0 && (
              <div className="flex items-center gap-3">
                <Label className="text-xs shrink-0">Delimiter:</Label>
                <Select value={delimiter} onValueChange={reParseData}>
                  <SelectTrigger className="h-7 text-xs w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=",">Comma (,)</SelectItem>
                    <SelectItem value=";">Semicolon (;)</SelectItem>
                    <SelectItem value="\t">Tab</SelectItem>
                    <SelectItem value="|">Pipe (|)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Preview table */}
            {previewRows.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Preview (first 5 rows)</Label>
                <div className="border border-[var(--color-border)] rounded-md overflow-auto max-h-40">
                  <table className="w-full text-xs">
                    {previewRows.map((row, ri) => (
                      <tr key={ri} className={ri === 0 && firstRowHeader ? 'bg-[var(--color-bg-elevated)] font-semibold' : ''}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="px-2 py-1 border-b border-r border-[var(--color-border)] whitespace-nowrap max-w-[120px] truncate"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </table>
                </div>
              </div>
            )}

            {/* First row is header */}
            {importData.length > 0 && (
              <div className="flex items-center gap-2">
                <Switch checked={firstRowHeader} onCheckedChange={setFirstRowHeader} />
                <Label className="text-xs">First row is header</Label>
              </div>
            )}
          </TabsContent>

          {/* ── Export Tab ── */}
          <TabsContent value="export" className="flex flex-col gap-4 py-2">
            <div className="rounded-lg border border-[var(--color-border)] p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <FileSpreadsheet size={16} />
                <span>Current sheet data</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                <span>{cellCount} filled cells</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                className="w-full gap-2 bg-[#FF3333] hover:bg-[#e62e2e]"
                onClick={() => {
                  onExportCSV();
                  onOpenChange(false);
                }}
              >
                <Download size={16} />
                Export as CSV
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 opacity-60 cursor-not-allowed"
                disabled
              >
                <FileText size={16} />
                Export as PDF (coming soon)
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {importData.length > 0 && (
            <Button
              className="bg-[#FF3333] hover:bg-[#e62e2e]"
              onClick={handleImport}
            >
              Import {importData.length} rows
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
