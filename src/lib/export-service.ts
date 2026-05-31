export type ExportFormat = 'pdf' | 'docx' | 'csv' | 'pptx' | 'markdown' | 'png';

interface ExportOptions {
  fileId: string;
  fileName: string;
  format: ExportFormat;
  content?: string;
}

export async function exportFile(options: ExportOptions): Promise<Blob> {
  const timestamp = new Date().toISOString().slice(0, 10);
  const fileName = `${options.fileName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;

  switch (options.format) {
    case 'markdown':
      return exportMarkdown(options.content || '', fileName);
    case 'csv':
      return exportCsv(options.content || '', fileName);
    case 'pdf':
      return exportPdf(options.content || '', fileName);
    case 'docx':
      return exportDocx(options.content || '', fileName);
    case 'png':
      return exportPng(fileName);
    case 'pptx':
      return exportPptx(options.content || '', fileName);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

function exportMarkdown(content: string, _fileName: string): Blob {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  return blob;
}

function exportCsv(content: string, _fileName: string): Blob {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  return blob;
}

async function exportPdf(content: string, _fileName: string): Promise<Blob> {
  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(content, 180);
  doc.setFont('helvetica');
  doc.setFontSize(12);
  let y = 20;
  for (const line of lines) {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.text(line, 15, y);
    y += 7;
  }
  return doc.output('blob') as Blob;
}

async function exportDocx(content: string, _fileName: string): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun } = await import('docx');
  const paragraphs = content.split('\n').map(line => new Paragraph({ children: [new TextRun(line)] }));
  const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  const buffer = await Packer.toBlob(doc);
  return buffer as Blob;
}

function exportPng(_fileName: string): Blob {
  // Placeholder — canvas/PNG export needs canvas element
  return new Blob([''], { type: 'image/png' });
}

async function exportPptx(_content: string, _fileName: string): Promise<Blob> {
  // Placeholder — PPTX export needs pptxgenjs
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.addSlide();
  return (await pptx.write({ outputType: 'blob' })) as Blob;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  pdf: '.pdf',
  docx: '.docx',
  csv: '.csv',
  pptx: '.pptx',
  markdown: '.md',
  png: '.png',
};
