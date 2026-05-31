'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { type Editor } from '@tiptap/react';
import { X, ListTree } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Types ── */

interface HeadingItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

interface DocOutlinePanelProps {
  editor: Editor | null;
  docId: string;
  isOpen: boolean;
  onToggle: () => void;
}

/* ── Indent map: H1=0, H2=16, H3=32, H4=48 ── */

const LEVEL_INDENT: Record<number, number> = {
  1: 0,
  2: 16,
  3: 32,
  4: 48,
};

/* ── Storage helpers ── */

function getStoredState(docId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const val = localStorage.getItem(`doc-outline-${docId}`);
    return val === 'true';
  } catch {
    return false;
  }
}

function setStoredState(docId: string, open: boolean) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`doc-outline-${docId}`, String(open));
  } catch {
    // ignore
  }
}

/* ── Extract headings from editor document ── */

function extractHeadings(ed: Editor): HeadingItem[] {
  const headings: HeadingItem[] = [];
  ed.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading' && node.attrs.level >= 1 && node.attrs.level <= 4) {
      const text = node.textContent || 'Untitled';
      headings.push({
        id: `heading-${pos}`,
        level: node.attrs.level as number,
        text,
        pos,
      });
    }
  });
  return headings;
}

/* ════════════════════════════════════════════════════
   DOC OUTLINE PANEL
   ════════════════════════════════════════════════════ */

export function DocOutlinePanel({ editor, docId, isOpen, onToggle }: DocOutlinePanelProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);

  /* ── Initialise from localStorage ── */
  useEffect(() => {
    const stored = getStoredState(docId);
    if (stored !== isOpen) {
      onToggle();
    }
  }, [docId, isOpen, onToggle]);

  /* ── Persist open/closed state ── */
  useEffect(() => {
    setStoredState(docId, isOpen);
  }, [docId, isOpen]);

  /* ── Listen to editor updates ── */
  useEffect(() => {
    if (!editor || !isOpen) return;

    const updateHeadings = () => {
      setHeadings(extractHeadings(editor));
    };

    updateHeadings();

    editor.on('update', updateHeadings);
    editor.on('selectionUpdate', updateHeadings);

    return () => {
      editor.off('update', updateHeadings);
      editor.off('selectionUpdate', updateHeadings);
    };
  }, [editor, isOpen]);

  /* ── Track active heading based on cursor position ── */
  const activeId = useMemo(() => {
    if (!editor || !isOpen || headings.length === 0) return null;

    const { from } = editor.state.selection;
    let currentId: string | null = null;

    // Find the last heading before the cursor
    for (let i = headings.length - 1; i >= 0; i--) {
      if (headings[i].pos <= from) {
        currentId = headings[i].id;
        break;
      }
    }

    return currentId;
  }, [editor, isOpen, headings]);

  /* ── Scroll to heading on click ── */
  const handleHeadingClick = useCallback(
    (pos: number) => {
      if (!editor) return;

      const editorContainer = document.querySelector('[id="editor-scroll"]');
      if (editorContainer) {
        const coords = editor.view.coordsAtPos(pos);
        const containerRect = editorContainer.getBoundingClientRect();

        editorContainer.scrollTo({
          top: editorContainer.scrollTop + (coords.top - containerRect.top - 60),
          behavior: 'smooth',
        });

        editor.chain().focus().setTextSelection(pos).run();
      }
    },
    [editor],
  );

  /* ── Don't render if closed ── */
  if (!isOpen) return null;

  return (
    <aside className="flex h-full w-[200px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      {/* ── Panel Header ── */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-3">
        <div className="flex items-center gap-1.5">
          <ListTree size={14} className="text-[var(--color-text-secondary)]" />
          <span className="text-xs font-medium text-[var(--color-text-primary)]">Outline</span>
          {headings.length > 0 && (
            <span className="ml-1 rounded-full bg-[var(--color-bg-overlay)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-tertiary)]">
              {headings.length}
            </span>
          )}
        </div>
        <button
          type="button"
          className="flex size-6 items-center justify-center rounded-md text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text-secondary)]"
          onClick={onToggle}
          aria-label="Close outline"
        >
          <X size={13} />
        </button>
      </div>

      {/* ── Headings list ── */}
      <div className="flex-1 overflow-y-auto py-2">
        {headings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 pt-8 text-center">
            <ListTree size={24} className="text-[var(--color-text-tertiary)] opacity-40" />
            <span className="text-xs text-[var(--color-text-tertiary)]">
              No headings yet
            </span>
            <span className="text-[10px] leading-snug text-[var(--color-text-tertiary)] opacity-60">
              Add H1–H4 headings to see them here
            </span>
          </div>
        ) : (
          <nav className="flex flex-col" aria-label="Document outline">
            {headings.map((heading) => (
              <button
                key={heading.id}
                type="button"
                className={cn(
                  'w-full cursor-pointer truncate rounded-md px-3 py-1.5 text-left text-xs transition-colors',
                  activeId === heading.id
                    ? 'bg-[var(--brand-muted)] text-[#FF3333] font-medium'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)]',
                )}
                style={{ paddingLeft: `${12 + (LEVEL_INDENT[heading.level] || 0)}px` }}
                onClick={() => handleHeadingClick(heading.pos)}
                title={heading.text}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        )}
      </div>
    </aside>
  );
}
