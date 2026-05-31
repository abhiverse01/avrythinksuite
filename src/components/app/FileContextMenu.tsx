'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { ExternalLink, Star, Copy, Pencil, Trash2, Share2, Download } from 'lucide-react';
import { useFileStore } from '@/stores/file-store';
import { useRouter } from 'next/navigation';
import type { FileItem } from '@/lib/types';

export function FileContextMenu({ children, file }: { children: React.ReactNode; file: FileItem }) {
  const router = useRouter();
  const { starFile, unstarFile, deleteFile } = useFileStore();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onSelect={() => router.push(`/${file.type}s/${file.id}`)}>
          <ExternalLink size={14} /> Open
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => {
          window.open(`/${file.type}s/${file.id}`, '_blank');
        }}>
          <ExternalLink size={14} /> Open in new tab
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => {/* rename placeholder */}}>
          <Pencil size={14} /> Rename
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => {/* duplicate placeholder */}}>
          <Copy size={14} /> Duplicate
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => file.is_starred ? unstarFile(file.id) : starFile(file.id)}>
          <Star
            size={14}
            className={file.is_starred ? 'fill-[var(--color-warning)] text-[var(--color-warning)]' : ''}
          />
          {file.is_starred ? 'Unstar' : 'Star'}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => {/* share placeholder */}}>
          <Share2 size={14} /> Share
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => {/* download placeholder */}}>
          <Download size={14} /> Download
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={() => deleteFile(file.id)}>
          <Trash2 size={14} /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
