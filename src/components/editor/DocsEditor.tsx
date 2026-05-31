'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import Gapcursor from '@tiptap/extension-gapcursor';
import Dropcursor from '@tiptap/extension-dropcursor';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import FontFamily from '@tiptap/extension-font-family';
import { common, createLowlight } from 'lowlight';
import { Extension } from '@tiptap/core';
import { motion } from 'framer-motion';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';
import { SlashCommandMenu } from './SlashCommandMenu';
import { DocOutlinePanel } from './DocOutlinePanel';
import { DocStatsPopover } from './DocStatsPopover';
import { DocTemplatesModal } from './DocTemplatesModal';
import { DocWordGoals } from './DocWordGoals';
import { useFileStore } from '@/stores/file-store';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { fadeIn } from '@/lib/animation';
import { toast } from '@/hooks/use-toast';

/* ── Lowlight instance ── */

const lowlight = createLowlight(common);

/* ── Custom FontSize extension ── */

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: (attrs: Record<string, string>) => {
              if (!attrs.fontSize) return {};
              return { style: `font-size: ${attrs.fontSize}px` };
            },
          },
        },
      },
    ];
  },
});

/* ── Props ── */

interface DocsEditorProps {
  docId: string;
  initialContent?: string;
  initialTitle: string;
}

/* ════════════════════════════════════════════════════
   DOCS EDITOR — Full-featured Tiptap rich text editor
   ════════════════════════════════════════════════════ */

export function DocsEditor({ docId, initialContent, initialTitle }: DocsEditorProps) {
  const { updateFileContent, renameFile } = useFileStore();
  const { save: autoSave, syncStatus } = useOfflineSync(docId);

  /* ── Title ── */
  const [title, setTitle] = useState(initialTitle);

  /* ── Outline panel state ── */
  const [outlineOpen, setOutlineOpen] = useState(false);

  /* ── Templates modal state ── */
  const [templatesOpen, setTemplatesOpen] = useState(false);

  /* ── Slash command state ── */
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const slashStartRef = useRef<number | null>(null);

  /* ── Counts ── */
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  /* ── Content tracking for auto-save ── */
  const lastHtmlRef = useRef('');

  /* ── Ref to editor for callbacks ── */
  const editorRef = useRef<ReturnType<typeof useEditor> | null>(null);

  /* ── Helper: get text before cursor in current node ── */
  const getTextBeforeCursor = useCallback((ed: NonNullable<ReturnType<typeof useEditor>>) => {
    const { $from } = ed.state.selection;
    return $from.parent.textContent.slice(0, $from.parentOffset);
  }, []);

  /* ── Delete slash command text from editor ── */
  const deleteSlashText = useCallback((ed: NonNullable<ReturnType<typeof useEditor>>) => {
    const { $from } = ed.state.selection;
    const text = getTextBeforeCursor(ed);
    const slashIdx = text.lastIndexOf('/');
    if (slashIdx >= 0) {
      const deleteFrom = $from.pos - text.length + slashIdx;
      ed.chain().focus().deleteRange({ from: deleteFrom, to: $from.pos }).run();
    }
  }, [getTextBeforeCursor]);

  /* ── Execute a slash command by ID ── */
  const executeCommand = useCallback(
    (commandId: string) => {
      const ed = editorRef.current;
      if (!ed) return;

      // Delete the slash text first
      deleteSlashText(ed);

      const chain = ed.chain().focus();

      switch (commandId) {
        case 'paragraph':
          chain.setParagraph().run();
          break;
        case 'h1':
          chain.toggleHeading({ level: 1 }).run();
          break;
        case 'h2':
          chain.toggleHeading({ level: 2 }).run();
          break;
        case 'h3':
          chain.toggleHeading({ level: 3 }).run();
          break;
        case 'h4':
          chain.toggleHeading({ level: 4 }).run();
          break;
        case 'bullet-list':
          chain.toggleBulletList().run();
          break;
        case 'ordered-list':
          chain.toggleOrderedList().run();
          break;
        case 'task-list':
          chain.toggleTaskList().run();
          break;
        case 'blockquote':
          chain.toggleBlockquote().run();
          break;
        case 'code-block':
          chain.toggleCodeBlock().run();
          break;
        case 'divider':
          chain.setHorizontalRule().run();
          break;
        case 'details':
          chain.setDetails().run();
          break;
        case 'image': {
          const url = window.prompt('Enter image URL:');
          if (url) chain.setImage({ src: url }).run();
          break;
        }
        case 'table':
          chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          break;
      }

      setSlashOpen(false);
      setSlashQuery('');
      slashStartRef.current = null;
    },
    [deleteSlashText],
  );

  /* ── Close slash menu ── */
  const closeSlashMenu = useCallback(() => {
    setSlashOpen(false);
    setSlashQuery('');
    slashStartRef.current = null;
  }, []);

  /* ── Editor setup ── */
  const editor = useEditor({
    extensions: [
      Document,
      StarterKit.configure({
        codeBlock: false,
        bold: { HTMLAttributes: { class: 'font-bold' } },
        italic: { HTMLAttributes: { class: 'italic' } },
        strike: { HTMLAttributes: { class: 'line-through' } },
        bulletList: { HTMLAttributes: { class: 'list-disc' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal' } },
        blockquote: { HTMLAttributes: { class: 'border-l-3 border-gray-300 pl-4' } },
      }),
      Underline,
      Superscript,
      Subscript,
      TextStyle,
      FontSize,
      Color,
      FontFamily.configure({ types: ['textStyle'] }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Image.configure({ HTMLAttributes: { class: 'editor-image rounded-lg' } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: 'Start writing, or press / for commands...',
      }),
      CharacterCount,
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'plaintext' }),
      Details,
      DetailsContent,
      DetailsSummary,
      Gapcursor,
      Dropcursor.configure({ width: 2, color: '#FF3333' }),
      Heading.configure({ levels: [1, 2, 3, 4] }),
    ],
    content: initialContent || '<p></p>',
    editorProps: {
      attributes: { class: 'prose-editor' },
    },
    onUpdate: ({ editor: ed }) => {
      const text = ed.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);

      const html = ed.getHTML();
      if (html !== lastHtmlRef.current) {
        lastHtmlRef.current = html;
        autoSave(html);
        updateFileContent(docId, { content: html });
      }
    },
    onCreate: ({ editor: ed }) => {
      editorRef.current = ed;
      const text = ed.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
      lastHtmlRef.current = ed.getHTML();
    },
  });

  // Keep the ref in sync
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  /* ── Keyboard handler for slash commands ── */
  useEffect(() => {
    if (!editor) return;

    const handleKey = (_view: any, event: KeyboardEvent) => {
      // Ignore if a modal/dialog is open
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).closest('[role="dialog"]')
      ) {
        return false;
      }

      if (event.key === '/' && !slashOpen) {
        // Check if this is at the beginning of the line or after whitespace
        const { $from } = editor.state.selection;
        const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
        const charBeforeSlash = textBefore.length > 1 ? textBefore[textBefore.length - 2] : '';
        if (textBefore.endsWith('/') && (charBeforeSlash === '' || charBeforeSlash === ' ' || $from.parentOffset <= 1)) {
          slashStartRef.current = $from.pos;
          setSlashOpen(true);
          setSlashQuery('');
          const coords = editor.view.coordsAtPos($from.pos);
          setSlashPos({ top: coords.bottom + 4, left: coords.left });
          return true;
        }
      }

      return false;
    };

    // We need to handle this more carefully
    // Use a DOM-level keydown listener instead
    const handleDOMKeyDown = (e: KeyboardEvent) => {
      if (!editor) return;

      // Check if editor is focused
      const editorEl = editor.view.dom;
      if (!editorEl.contains(e.target as Node)) return;

      // Slash command: detect "/"
      if (e.key === '/' && !slashOpen && !e.ctrlKey && !e.metaKey) {
        const { $from } = editor.state.selection;
        const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);

        // Only trigger if "/" is the start of the line or after a space
        if ($from.parentOffset === 0 || textBefore.endsWith(' ')) {
          slashStartRef.current = $from.pos;
          setSlashOpen(true);
          setSlashQuery('');
          const coords = editor.view.coordsAtPos($from.pos);
          setSlashPos({ top: coords.bottom + 4, left: coords.left });
          return;
        }
      }

      // Update slash query while typing
      if (slashOpen) {
        if (e.key === 'Backspace') {
          const textBefore = getTextBeforeCursor(editor);
          const slashIdx = textBefore.lastIndexOf('/');
          if (slashIdx === -1) {
            closeSlashMenu();
          } else {
            setSlashQuery(textBefore.slice(slashIdx + 1));
          }
          return;
        }

        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          closeSlashMenu();
          return;
        }

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
          // Let SlashCommandMenu handle these (it has its own keydown listener)
          return;
        }

        // Regular character input — update query
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          // Use setTimeout to read the text AFTER the character is inserted
          setTimeout(() => {
            if (!editor) return;
            const textBefore = getTextBeforeCursor(editor);
            const slashIdx = textBefore.lastIndexOf('/');
            if (slashIdx >= 0) {
              setSlashQuery(textBefore.slice(slashIdx + 1));
            }
          }, 0);
        }
      }
    };

    document.addEventListener('keydown', handleDOMKeyDown);
    return () => document.removeEventListener('keydown', handleDOMKeyDown);
  }, [editor, slashOpen, closeSlashMenu, getTextBeforeCursor]);

  /* ── Cmd+S manual save ── */
  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (editor) {
          const html = editor.getHTML();
          autoSave(html);
          updateFileContent(docId, { content: html });
          toast.success('Document saved');
        }
      }
    };
    window.addEventListener('keydown', handleSave);
    return () => window.removeEventListener('keydown', handleSave);
  }, [editor, docId, autoSave, updateFileContent]);

  /* ── Title change ── */
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setTitle(val);
      renameFile(docId, val || 'Untitled Document');
    },
    [docId, renameFile],
  );

  /* ── Handle template selection ── */
  const handleTemplateSelect = useCallback(
    (html: string) => {
      if (!editor) return;
      editor.commands.setContent(html);
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
      lastHtmlRef.current = html;
      autoSave(html);
      updateFileContent(docId, { content: html });
      toast.success('Template applied');
    },
    [editor, docId, autoSave, updateFileContent],
  );

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col"
    >
      {/* ── Document Title ── */}
      <div className="shrink-0 border-b border-[var(--color-border)] px-5 py-3 sm:px-12 sm:py-4">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="w-full bg-transparent text-2xl font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] sm:text-3xl"
          placeholder="Untitled document"
        />
      </div>

      {/* ── Toolbar with stats + tools ── */}
      <div className="flex items-center">
        <div className="flex-1 overflow-x-auto">
          <EditorToolbar
            editor={editor}
            outlineOpen={outlineOpen}
            onToggleOutline={() => setOutlineOpen(!outlineOpen)}
            onOpenTemplates={() => setTemplatesOpen(true)}
          />
        </div>
        <div className="shrink-0 px-2">
          <DocStatsPopover editor={editor} />
        </div>
      </div>

      {/* ── Editor Body (Outline + Canvas) ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Outline Panel (left side) ── */}
        <DocOutlinePanel
          editor={editor}
          docId={docId}
          isOpen={outlineOpen}
          onToggle={() => setOutlineOpen(!outlineOpen)}
        />

        {/* ── Editor Canvas ── */}
        <div className="flex-1 overflow-y-auto bg-[var(--color-bg-elevated)]" id="editor-scroll">
          <div className="mx-auto min-h-full bg-[var(--color-bg-surface)] px-5 py-10 shadow-[var(--shadow-sm)] sm:max-w-[860px] sm:px-12 sm:py-16">
            {editor && <EditorContent editor={editor} />}
          </div>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="flex h-7 shrink-0 items-center border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 text-[11px] text-[var(--color-text-tertiary)] select-none">
        <EditorStatusBar
          wordCount={wordCount}
          charCount={charCount}
          syncStatus={syncStatus}
        />
        <div className="ml-auto flex items-center gap-4">
          <DocWordGoals wordCount={wordCount} docId={docId} />
        </div>
      </div>

      {/* ── Templates Modal ── */}
      <DocTemplatesModal
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        onSelect={handleTemplateSelect}
      />

      {/* ── Slash Command Menu ── */}
      {slashOpen && (
        <div
          className="fixed z-[100]"
          style={{
            top: slashPos.top,
            left: Math.min(slashPos.left, typeof window !== 'undefined' ? window.innerWidth - 300 : 0),
          }}
        >
          <SlashCommandMenu
            isOpen={slashOpen}
            query={slashQuery}
            onSelect={executeCommand}
            onClose={closeSlashMenu}
          />
        </div>
      )}

      {/* ── ProseMirror Editor Styles ── */}
      <style jsx global>{`
        /* Base editor styles */
        .prose-editor {
          outline: none;
          min-height: 600px;
          padding: 0;
          font-family: var(--font-sans);
          font-size: 15px;
          line-height: 1.7;
          color: var(--color-text-primary);
        }

        /* Headings */
        .prose-editor h1 { font-size: 2em; font-weight: 700; letter-spacing: -0.02em; margin: 1.5em 0 0.5em; line-height: 1.2; }
        .prose-editor h1:first-child { margin-top: 0; }
        .prose-editor h2 { font-size: 1.5em; font-weight: 600; letter-spacing: -0.02em; margin: 1.3em 0 0.4em; line-height: 1.3; }
        .prose-editor h3 { font-size: 1.25em; font-weight: 600; margin: 1.2em 0 0.3em; }
        .prose-editor h4 { font-size: 1.1em; font-weight: 600; margin: 1em 0 0.3em; }
        .prose-editor p { margin: 0.5em 0; }

        /* Lists */
        .prose-editor ul, .prose-editor ol { padding-left: 1.5em; margin: 0.5em 0; }
        .prose-editor li { margin: 0.25em 0; }

        /* Blockquote */
        .prose-editor blockquote { border-left: 3px solid var(--color-border-strong); padding-left: 1em; margin: 1em 0; color: var(--color-text-secondary); }

        /* Code */
        .prose-editor pre { background: var(--color-code-bg); border-radius: 8px; padding: 1em; margin: 1em 0; font-family: 'JetBrains Mono', monospace; font-size: 13px; overflow-x: auto; }
        .prose-editor code { font-family: 'JetBrains Mono', monospace; font-size: 0.9em; background: var(--color-code-bg); padding: 0.15em 0.4em; border-radius: 4px; }
        .prose-editor pre code { background: none; padding: 0; }

        /* Horizontal rule */
        .prose-editor hr { border: none; border-top: 1px solid var(--color-border); margin: 2em 0; }

        /* Links */
        .prose-editor a { color: #FF3333; text-decoration: underline; cursor: pointer; }

        /* Images */
        .prose-editor img { max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0; cursor: pointer; }
        .prose-editor img.ProseMirror-selectednode { outline: 2px solid #FF3333; }

        /* Tables */
        .prose-editor table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        .prose-editor th { background: var(--color-bg-elevated); font-weight: 600; }
        .prose-editor td, .prose-editor th { border: 1px solid var(--color-border); padding: 8px 12px; min-width: 80px; }
        .prose-editor .selectedCell { background: rgba(255, 51, 51, 0.08); }
        .prose-editor .tableWrapper { overflow-x: auto; margin: 1em 0; }

        /* Task list */
        .prose-editor .task-list { list-style: none; padding-left: 0; }
        .prose-editor .task-list li { display: flex; align-items: flex-start; gap: 0.5em; }
        .prose-editor .task-list input[type="checkbox"] { margin-top: 0.35em; accent-color: #FF3333; }

        /* Details / Accordion */
        .prose-editor details { border: 1px solid var(--color-border); border-radius: 8px; padding: 0.5em 1em; margin: 0.5em 0; }
        .prose-editor summary { cursor: pointer; font-weight: 500; }
        .prose-editor summary::marker { color: #FF3333; }

        /* Placeholder */
        .prose-editor p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: var(--color-text-tertiary); float: left; height: 0; pointer-events: none; }
        .prose-editor .is-empty:first-child::before { content: attr(data-placeholder); color: var(--color-text-tertiary); float: left; height: 0; pointer-events: none; }

        /* Selection */
        .prose-editor .selection { background: rgba(255, 51, 51, 0.12); }

        /* Gap cursor */
        .ProseMirror-gapcursor::after { border-top: 1px solid var(--color-text-primary); }

        /* Drop cursor */
        .prose-editor .dropcursor { color: #FF3333; }

        /* Table resize handle */
        .prose-editor .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: -2px; width: 4px; background-color: #FF3333; pointer-events: none; }
        .prose-editor .resize-cursor { cursor: col-resize; }
      `}</style>
    </motion.div>
  );
}
