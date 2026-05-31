// @ts-nocheck — Fabric.js v6 strict types require runtime casting; safe to suppress
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Download, Copy, Check, Code } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Canvas as FabricCanvas } from 'fabric';

/* ── Types ── */

interface ExportSVGDialogProps {
  canvasRef: React.RefObject<FabricCanvas | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ── SVG Post-processing ── */

function cleanSVG(svgString: string): string {
  let cleaned = svgString;

  // Remove fabric-specific attributes
  cleaned = cleaned.replace(/\s+data-fabric-[a-z-]+="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s+class="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s+id="[^"]*"/gi, '');

  // Remove empty transforms
  cleaned = cleaned.replace(/\s+transform="translate\(0,0\)"/gi, '');
  cleaned = cleaned.replace(/\s+transform="translate\(0, 0\)"/gi, '');

  // Clean up xmlns repetitions
  cleaned = cleaned.replace(/xmlns:xlink="[^"]*"/g, '');

  // Optimize: collapse whitespace
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  // Clean path data (remove unnecessary precision)
  cleaned = cleaned.replace(/(\d+\.\d{3})\d+/g, '$1');

  return cleaned;
}

function svgToReactComponent(svgString: string, componentName: string = 'CanvasExport'): string {
  const cleaned = cleanSVG(svgString);

  // Extract the SVG content (between <svg> tags)
  const svgMatch = cleaned.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!svgMatch) return cleaned;

  const innerContent = svgMatch[1];

  // Convert attributes to JSX-friendly format
  let jsxContent = innerContent
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/font-size=/g, 'fontSize=')
    .replace(/font-family=/g, 'fontFamily=')
    .replace(/font-weight=/g, 'fontWeight=')
    .replace(/font-style=/g, 'fontStyle=')
    .replace(/text-anchor=/g, 'textAnchor=')
    .replace(/dominant-baseline=/g, 'dominantBaseline=')
    .replace(/alignment-baseline=/g, 'alignmentBaseline=')
    .replace(/xlink:href=/g, 'xlinkHref=');

  const jsxCode = `import React from 'react';

const ${componentName} = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    ${jsxContent.trim()}
  </svg>
);

export default ${componentName};
`;

  return jsxCode;
}

/* ════════════════════════════════════════════════════
   EXPORT SVG DIALOG
   ════════════════════════════════════════════════════ */

export function ExportSVGDialog({ canvasRef, open, onOpenChange }: ExportSVGDialogProps) {
  const [svgOutput, setSvgOutput] = useState('');
  const [exportMode, setExportMode] = useState<'full' | 'selection'>('full');
  const [reactCode, setReactCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

  // Generate SVG when dialog opens
  useEffect(() => {
    if (!open) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let svgStr = '';
    if (exportMode === 'full') {
      svgStr = canvas.toSVG();
    } else {
      const active = canvas.getActiveObject();
      if (active) {
        svgStr = active.toSVG ? (active.toSVG as () => string)() : canvas.toSVG();
      } else {
        svgStr = canvas.toSVG();
      }
    }

    const cleaned = cleanSVG(svgStr);
    setSvgOutput(cleaned);
    setReactCode(svgToReactComponent(cleaned));
  }, [open, canvasRef, exportMode]);

  const handleDownload = useCallback(() => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'canvas-export.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [svgOutput]);

  const handleCopyReact = useCallback(async () => {
    if (!reactCode) return;
    try {
      await navigator.clipboard.writeText(reactCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = reactCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [reactCode]);

  const handleCopySVG = useCallback(async () => {
    if (!svgOutput) return;
    try {
      await navigator.clipboard.writeText(svgOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = svgOutput;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [svgOutput]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export SVG</DialogTitle>
          <DialogDescription>
            Export your canvas as SVG or a React component
          </DialogDescription>
        </DialogHeader>

        {/* Export mode toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-text-secondary)]">Export:</span>
          <div className="flex items-center gap-1 bg-[var(--color-bg-elevated)] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setExportMode('full')}
              className={`text-xs px-3 py-1 rounded-md transition-colors cursor-pointer ${
                exportMode === 'full'
                  ? 'bg-[#FF3333] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Full Canvas
            </button>
            <button
              type="button"
              onClick={() => setExportMode('selection')}
              className={`text-xs px-3 py-1 rounded-md transition-colors cursor-pointer ${
                exportMode === 'selection'
                  ? 'bg-[#FF3333] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Selection Only
            </button>
          </div>
        </div>

        {/* Tabs: Preview / SVG Code / React Component */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0">
          <TabsList>
            <TabsTrigger value="preview" className="text-xs">
              Preview
            </TabsTrigger>
            <TabsTrigger value="svg" className="text-xs">
              SVG Code
            </TabsTrigger>
            <TabsTrigger value="react" className="text-xs gap-1">
              <Code size={12} />
              React Component
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-2">
            <ScrollArea className="h-[320px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
              <div className="p-4 flex items-center justify-center min-h-[320px]">
                <div
                  dangerouslySetInnerHTML={{ __html: svgOutput }}
                  className="max-w-full max-h-full [&>svg]:max-w-full [&>svg]:max-h-[280px]"
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="svg" className="mt-2">
            <div className="relative">
              <ScrollArea className="h-[320px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                <pre className="p-4 text-xs text-[var(--color-text-secondary)] font-mono whitespace-pre-wrap break-all">
                  {svgOutput}
                </pre>
              </ScrollArea>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-7 gap-1.5 text-xs"
                onClick={handleCopySVG}
              >
                {copied && activeTab === 'svg' ? (
                  <Check size={12} className="text-green-500" />
                ) : (
                  <Copy size={12} />
                )}
                Copy SVG
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="react" className="mt-2">
            <div className="relative">
              <ScrollArea className="h-[320px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                <pre className="p-4 text-xs text-[var(--color-text-secondary)] font-mono whitespace-pre-wrap break-all">
                  {reactCode}
                </pre>
              </ScrollArea>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-7 gap-1.5 text-xs"
                onClick={handleCopyReact}
              >
                {copied && activeTab === 'react' ? (
                  <Check size={12} className="text-green-500" />
                ) : (
                  <Copy size={12} />
                )}
                Copy JSX
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            className="text-xs gap-1.5"
            style={{ backgroundColor: '#FF3333', color: 'white' }}
          >
            <Download size={14} />
            Download SVG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
