'use client';

import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Link2,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  ImageIcon,
  Minus,
  Table,
  FileCode,
  IndentIncrease,
  IndentDecrease,
  ChevronDown,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Palette,
  Highlighter,
  PanelLeft,
  FileStack,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/* ── Toolbar Button ── */

function ToolbarBtn({
  icon: Icon,
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'size-8 shrink-0',
            active && 'bg-[var(--color-bg-overlay)] text-[var(--color-text-primary)]',
          )}
          disabled={disabled}
          onClick={onClick}
          aria-label={label}
          type="button"
        >
          <Icon size={15} strokeWidth={1.75} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/* ── Divider ── */

function Divider() {
  return (
    <div className="mx-1 h-5 w-px shrink-0 bg-[var(--color-border)]" />
  );
}

/* ── Color Swatches ── */

const TEXT_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Red', value: '#EF4444' },
  { label: 'Orange', value: '#F97316' },
  { label: 'Yellow', value: '#EAB308' },
  { label: 'Green', value: '#22C55E' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Red', value: '#FF3333' },
  { label: 'Gray', value: '#6B7280' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#FEF08A' },
  { label: 'Green', value: '#BBF7D0' },
  { label: 'Blue', value: '#BFDBFE' },
  { label: 'Rose', value: '#FFE4E6' },
  { label: 'Red', value: '#FECACA' },
  { label: 'Orange', value: '#FED7AA' },
  { label: 'Gray', value: '#E5E7EB' },
  { label: 'None', value: '' },
];

/* ── Props ── */

interface EditorToolbarProps {
  editor: Editor | null;
  outlineOpen?: boolean;
  onToggleOutline?: () => void;
  onOpenTemplates?: () => void;
}

export function EditorToolbar({ editor, outlineOpen, onToggleOutline, onOpenTemplates }: EditorToolbarProps) {
  if (!editor) return null;

  const chain = () => editor.chain().focus();

  /* ── Heading / block type ── */
  const currentHeading = (() => {
    for (const level of [1, 2, 3, 4] as const) {
      if (editor.isActive('heading', { level })) return `h${level}`;
    }
    if (editor.isActive('blockquote')) return 'quote';
    if (editor.isActive('codeBlock')) return 'code';
    return 'paragraph';
  })();

  const setBlockType = (value: string) => {
    switch (value) {
      case 'h1':
        chain().toggleHeading({ level: 1 }).run();
        break;
      case 'h2':
        chain().toggleHeading({ level: 2 }).run();
        break;
      case 'h3':
        chain().toggleHeading({ level: 3 }).run();
        break;
      case 'h4':
        chain().toggleHeading({ level: 4 }).run();
        break;
      case 'quote':
        chain().toggleBlockquote().run();
        break;
      case 'code':
        chain().toggleCodeBlock().run();
        break;
      default:
        chain().setParagraph().run();
    }
  };

  /* ── Font family ── */
  const currentFont = (editor.getAttributes('textStyle').fontFamily as string) || 'Inter';

  const setFont = (font: string) => {
    if (font === 'Inter') {
      chain().unsetFontFamily().run();
    } else {
      chain().setFontFamily(font).run();
    }
  };

  /* ── Font size (applied via inline style) ── */
  const currentFontSize =
    (editor.getAttributes('textStyle').fontSize as string) || '16';

  const setFontSize = (size: string) => {
    if (size === '16') {
      chain().unsetMark('textStyle').run();
      // Re-apply other textStyle attrs if any
      const color = editor.getAttributes('textStyle').color;
      if (color) chain().setColor(color).run();
    } else {
      chain()
        .setMark('textStyle', { fontSize: `${size}px` })
        .run();
    }
  };

  /* ── Text color ── */
  const setTextColor = (color: string) => {
    if (!color) {
      chain().unsetColor().run();
    } else {
      chain().setColor(color).run();
    }
  };

  /* ── Highlight ── */
  const setHighlight = (color: string) => {
    if (!color) {
      chain().unsetHighlight().run();
    } else {
      chain().toggleHighlight({ color }).run();
    }
  };

  /* ── Link ── */
  const toggleLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    if (prev) {
      chain().unsetLink().run();
    } else {
      const url = window.prompt('Enter URL:');
      if (url) {
        chain().setLink({ href: url }).run();
      }
    }
  };

  /* ── Insert table ── */
  const insertTable = () => {
    const rows = parseInt(window.prompt('Number of rows:', '3') ?? '3', 10);
    const cols = parseInt(window.prompt('Number of columns:', '3') ?? '3', 10);
    if (rows > 0 && cols > 0) {
      chain()
        .insertTable({ rows: Math.min(rows, 20), cols: Math.min(cols, 10), withHeaderRow: true })
        .run();
    }
  };

  /* ── Insert image ── */
  const insertImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      chain().setImage({ src: url }).run();
    }
  };

  return (
    <div className="flex h-11 shrink-0 items-center gap-0.5 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 overflow-x-auto no-scrollbar">
      {/* ── Undo / Redo ── */}
      <ToolbarBtn
        icon={Undo2}
        label="Undo (⌘Z)"
        disabled={!editor.can().undo()}
        onClick={() => chain().undo().run()}
      />
      <ToolbarBtn
        icon={Redo2}
        label="Redo (⌘⇧Z)"
        disabled={!editor.can().redo()}
        onClick={() => chain().redo().run()}
      />

      <Divider />

      {/* ── Block Type Dropdown ── */}
      <Select value={currentHeading} onValueChange={setBlockType}>
        <SelectTrigger
          size="sm"
          className="h-8 w-[120px] gap-1 text-xs border-0 shadow-none hover:bg-[var(--color-bg-overlay)]"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">
            <span className="flex items-center gap-2">
              <Pilcrow size={14} /> Normal
            </span>
          </SelectItem>
          <SelectItem value="h1">
            <span className="flex items-center gap-2">
              <Heading1 size={14} /> Heading 1
            </span>
          </SelectItem>
          <SelectItem value="h2">
            <span className="flex items-center gap-2">
              <Heading2 size={14} /> Heading 2
            </span>
          </SelectItem>
          <SelectItem value="h3">
            <span className="flex items-center gap-2">
              <Heading3 size={14} /> Heading 3
            </span>
          </SelectItem>
          <SelectItem value="h4">
            <span className="flex items-center gap-2">
              <Heading4 size={14} /> Heading 4
            </span>
          </SelectItem>
          <SelectItem value="quote">
            <span className="flex items-center gap-2">
              <Quote size={14} /> Quote
            </span>
          </SelectItem>
          <SelectItem value="code">
            <span className="flex items-center gap-2">
              <Code2 size={14} /> Code Block
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* ── Font Family Dropdown ── */}
      <Select value={currentFont} onValueChange={setFont}>
        <SelectTrigger
          size="sm"
          className="h-8 w-[100px] gap-1 text-xs border-0 shadow-none hover:bg-[var(--color-bg-overlay)]"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Inter" style={{ fontFamily: 'Inter' }}>
            Inter
          </SelectItem>
          <SelectItem value="Georgia" style={{ fontFamily: 'Georgia' }}>
            Georgia
          </SelectItem>
          <SelectItem
            value="Courier New"
            style={{ fontFamily: '"Courier New"' }}
          >
            Courier New
          </SelectItem>
        </SelectContent>
      </Select>

      {/* ── Font Size Dropdown ── */}
      <Select value={currentFontSize} onValueChange={setFontSize}>
        <SelectTrigger
          size="sm"
          className="h-8 w-[72px] gap-1 text-xs border-0 shadow-none hover:bg-[var(--color-bg-overlay)]"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['12', '14', '16', '18', '20', '24', '28', '32', '36', '48'].map(
            (size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      <Divider />

      {/* ── Text Formatting ── */}
      <ToolbarBtn
        icon={Bold}
        label="Bold (⌘B)"
        active={editor.isActive('bold')}
        onClick={() => chain().toggleBold().run()}
      />
      <ToolbarBtn
        icon={Italic}
        label="Italic (⌘I)"
        active={editor.isActive('italic')}
        onClick={() => chain().toggleItalic().run()}
      />
      <ToolbarBtn
        icon={Underline}
        label="Underline (⌘U)"
        active={editor.isActive('underline')}
        onClick={() => chain().toggleUnderline().run()}
      />
      <ToolbarBtn
        icon={Strikethrough}
        label="Strikethrough (⌘⇧S)"
        active={editor.isActive('strike')}
        onClick={() => chain().toggleStrike().run()}
      />
      <ToolbarBtn
        icon={Superscript}
        label="Superscript"
        active={editor.isActive('superscript')}
        onClick={() => chain().toggleSuperscript().run()}
      />
      <ToolbarBtn
        icon={Subscript}
        label="Subscript"
        active={editor.isActive('subscript')}
        onClick={() => chain().toggleSubscript().run()}
      />

      {/* ── Text Color ── */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            type="button"
          >
            <div className="flex flex-col items-center gap-0.5">
              <Palette size={15} strokeWidth={1.75} />
              <div
                className="h-[3px] w-3.5 rounded-full"
                style={{
                  backgroundColor:
                    (editor.getAttributes('textStyle').color as string) || '#1C1B19',
                }}
              />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
            Text Color
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {TEXT_COLORS.map((color) => (
              <button
                key={color.label}
                type="button"
                className={cn(
                  'size-7 rounded-md border border-[var(--color-border)] transition-colors hover:scale-110',
                  !color.value && 'bg-[var(--color-bg-overlay)]',
                )}
                style={{
                  backgroundColor: color.value || undefined,
                }}
                title={color.label}
                onClick={() => setTextColor(color.value)}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* ── Highlight Color ── */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'size-8 shrink-0',
              editor.isActive('highlight') && 'bg-[var(--color-bg-overlay)]',
            )}
            type="button"
          >
            <Highlighter size={15} strokeWidth={1.75} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
            Highlight Color
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.label}
                type="button"
                className={cn(
                  'size-7 rounded-md border border-[var(--color-border)] transition-colors hover:scale-110',
                  !color.value && 'bg-[var(--color-bg-overlay)]',
                )}
                style={{
                  backgroundColor: color.value || undefined,
                }}
                title={color.label}
                onClick={() => setHighlight(color.value)}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Divider />

      {/* ── Link ── */}
      <ToolbarBtn
        icon={Link2}
        label="Insert Link (⌘K)"
        active={editor.isActive('link')}
        onClick={toggleLink}
      />
      {editor.isActive('link') && (
        <ToolbarBtn
          icon={Unlink}
          label="Remove Link"
          onClick={() => chain().unsetLink().run()}
        />
      )}

      <Divider />

      {/* ── Lists ── */}
      <ToolbarBtn
        icon={List}
        label="Bullet List"
        active={editor.isActive('bulletList')}
        onClick={() => chain().toggleBulletList().run()}
      />
      <ToolbarBtn
        icon={ListOrdered}
        label="Numbered List"
        active={editor.isActive('orderedList')}
        onClick={() => chain().toggleOrderedList().run()}
      />
      <ToolbarBtn
        icon={CheckSquare}
        label="Task List"
        active={editor.isActive('taskList')}
        onClick={() => chain().toggleTaskList().run()}
      />

      {/* ── Indent / Outdent ── */}
      <ToolbarBtn
        icon={IndentIncrease}
        label="Indent"
        onClick={() => chain().sinkListItem('listItem').run()}
      />
      <ToolbarBtn
        icon={IndentDecrease}
        label="Outdent"
        onClick={() => chain().liftListItem('listItem').run()}
      />

      <Divider />

      {/* ── Alignment ── */}
      <ToolbarBtn
        icon={AlignLeft}
        label="Align Left"
        active={editor.isActive({ textAlign: 'left' })}
        onClick={() => chain().setTextAlign('left').run()}
      />
      <ToolbarBtn
        icon={AlignCenter}
        label="Align Center"
        active={editor.isActive({ textAlign: 'center' })}
        onClick={() => chain().setTextAlign('center').run()}
      />
      <ToolbarBtn
        icon={AlignRight}
        label="Align Right"
        active={editor.isActive({ textAlign: 'right' })}
        onClick={() => chain().setTextAlign('right').run()}
      />
      <ToolbarBtn
        icon={AlignJustify}
        label="Justify"
        active={editor.isActive({ textAlign: 'justify' })}
        onClick={() => chain().setTextAlign('justify').run()}
      />

      <Divider />

      {/* ── Insert Menu ── */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs shrink-0"
            type="button"
          >
            Insert
            <ChevronDown size={12} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="start">
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)] transition-colors"
            onClick={() => {
              insertTable();
            }}
          >
            <Table size={15} strokeWidth={1.5} />
            Table
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)] transition-colors"
            onClick={insertImage}
          >
            <ImageIcon size={15} strokeWidth={1.5} />
            Image
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)] transition-colors"
            onClick={() => chain().setHorizontalRule().run()}
          >
            <Minus size={15} strokeWidth={1.5} />
            Divider
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)] transition-colors"
            onClick={() => chain().toggleCodeBlock().run()}
          >
            <FileCode size={15} strokeWidth={1.5} />
            Code Block
          </button>
        </PopoverContent>
      </Popover>

      <Divider />

      {/* ── Tools Section ── */}
      <ToolbarBtn
        icon={PanelLeft}
        label="Toggle Outline"
        active={outlineOpen}
        onClick={() => onToggleOutline?.()}
      />
      <ToolbarBtn
        icon={FileStack}
        label="Templates"
        onClick={() => onOpenTemplates?.()}
      />
    </div>
  );
}
