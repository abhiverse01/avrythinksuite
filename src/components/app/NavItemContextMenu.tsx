'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavItemContextMenuProps {
  children: React.ReactNode;
  href: string;
}

export function NavItemContextMenu({ children, href }: NavItemContextMenuProps) {
  const router = useRouter();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onSelect={() => router.push(href)}>
          <ExternalLink size={14} /> Open
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => {
          window.open(href, '_blank');
        }}>
          <ExternalLink size={14} /> Open in new tab
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
