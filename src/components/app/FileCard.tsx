'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  Table,
  Presentation,
  Paintbrush,
  ClipboardCheck,
  Star,
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Trash2,
  Share2,
  type LucideIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/stores/file-store';
import { FileContextMenu } from './FileContextMenu';
import { cn, formatRelativeTime, getFileTypeColor, getInitials } from '@/lib/utils';
import { cardHover } from '@/lib/animation';
import type { FileItem, FileType } from '@/lib/types';

const fileTypeIcons: Record<FileType, LucideIcon> = {
  doc: FileText,
  sheet: Table,
  slide: Presentation,
  canvas: Paintbrush,
  exam: ClipboardCheck,
};

interface FileCardProps {
  file: FileItem;
}

/**
 * Card displaying file metadata with hover effects, click navigation,
 * and a three-dot context menu.
 */
export function FileCard({ file }: FileCardProps) {
  const starFile = useFileStore((s) => s.starFile);
  const unstarFile = useFileStore((s) => s.unstarFile);
  const deleteFile = useFileStore((s) => s.deleteFile);
  const router = useRouter();

  const Icon = fileTypeIcons[file.type];
  const colorClasses = getFileTypeColor(file.type);

  const ownerInitials = file.owner?.full_name
    ? getInitials(file.owner.full_name)
    : file.owner?.email?.[0]?.toUpperCase() ?? '?';

  const ownerName = file.owner?.full_name ?? 'Unknown';

  return (
    <FileContextMenu file={file}>
      <motion.div
        className={cn(
          'group relative flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4',
          'cursor-pointer transition-shadow duration-200 ease-[var(--ease-smooth)]',
          'hover:shadow-[var(--shadow-lg)] hover:border-[var(--color-border-strong)]'
        )}
        {...cardHover}
        onClick={() => router.push(`/${file.type}s/${file.id}`)}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            router.push(`/${file.type}s/${file.id}`);
          }
        }}
      >
        {/* Top row: icon + name + menu */}
        <div className="flex items-start gap-3">
          {/* File type icon */}
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              colorClasses
            )}
          >
            <Icon size={20} strokeWidth={1.5} />
          </div>

          {/* Name */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
              {file.name}
            </h3>
            <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
              {formatRelativeTime(file.updated_at)}
            </p>
          </div>

          {/* Three-dot menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                onClick={(e) => e.stopPropagation()}
                aria-label="File actions"
              >
                <MoreHorizontal size={16} strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onSelect={() => router.push(`/${file.type}s/${file.id}`)}
              >
                <ExternalLink size={16} strokeWidth={1.5} />
                Open
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() => {
                  if (file.is_starred) { unstarFile(file.id); } else { starFile(file.id); }
                }}
              >
                <Star
                  size={16}
                  strokeWidth={1.5}
                  className={file.is_starred ? 'fill-[var(--color-warning)] text-[var(--color-warning)]' : ''}
                />
                {file.is_starred ? 'Unstar' : 'Star'}
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => {/* rename placeholder */}}>
                <Pencil size={16} strokeWidth={1.5} />
                Rename
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => {/* share placeholder */}}>
                <Share2 size={16} strokeWidth={1.5} />
                Share
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onSelect={() => deleteFile(file.id)}
              >
                <Trash2 size={16} strokeWidth={1.5} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bottom row: owner */}
        <div className="mt-auto flex items-center gap-2 pt-3">
          <Avatar className="size-5">
            <AvatarFallback className="text-[9px] bg-[var(--color-bg-overlay)] text-[var(--color-text-tertiary)]">
              {ownerInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-[var(--color-text-tertiary)] truncate">
            {ownerName}
          </span>
        </div>
      </motion.div>
    </FileContextMenu>
  );
}
