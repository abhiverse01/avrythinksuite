'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  FileText,
  Table,
  Presentation,
  Paintbrush,
  ClipboardCheck,
  Clock,
  Star,
  Users,
  Building2,
  Settings,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { NavItemContextMenu } from './NavItemContextMenu';

interface NavItemConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

/** Top section — Suite apps */
const APP_ITEMS: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: LayoutGrid, href: '/home' },
  { id: 'docs', label: 'Docs', icon: FileText, href: '/docs' },
  { id: 'sheets', label: 'Sheets', icon: Table, href: '/sheets' },
  { id: 'slides', label: 'Slides', icon: Presentation, href: '/slides' },
  { id: 'canvas', label: 'Canvas', icon: Paintbrush, href: '/canvas' },
  { id: 'examiner', label: 'Examiner', icon: ClipboardCheck, href: '/examiner' },
];

/** Middle section — Personal (filter views on /home) */
const PERSONAL_ITEMS: NavItemConfig[] = [
  { id: 'recent', label: 'Recent', icon: Clock, href: '/home' },
  { id: 'starred', label: 'Starred', icon: Star, href: '/home' },
  { id: 'shared', label: 'Shared with me', icon: Users, href: '/home' },
];

/** Bottom section — System */
const SYSTEM_ITEMS: NavItemConfig[] = [
  { id: 'organization', label: 'Organization', icon: Building2, href: '/org' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  { id: 'trash', label: 'Trash', icon: Trash2, href: '/trash' },
];

interface NavLinkProps {
  item: NavItemConfig;
  collapsed: boolean;
  isActive: boolean;
}

function NavLink({ item, collapsed, isActive }: NavLinkProps) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      className={cn(
        'group relative flex items-center gap-3 text-sm font-medium transition-all duration-150',
        // Layout
        collapsed ? 'justify-center px-0 py-2' : 'rounded-r-lg px-3 py-2',
        // Active — expanded
        isActive && !collapsed && 'bg-[var(--brand-muted)] text-[#FF3333] border-l-2 border-[#FF3333]',
        // Active — collapsed (icon color, red dot added below)
        isActive && collapsed && 'text-[#FF3333]',
        // Inactive
        !isActive && 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)]',
      )}
    >
      <Icon size={18} strokeWidth={1.5} className={cn('shrink-0', isActive && 'text-[#FF3333]')} />
      {isActive && collapsed && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-[#FF3333]" />
      )}
      <span
        className={cn(
          'truncate transition-all duration-200',
          collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100',
        )}
      >
        {item.label}
      </span>
    </Link>
  );

  const content = collapsed ? (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  ) : link;

  return (
    <NavItemContextMenu href={item.href}>
      {content}
    </NavItemContextMenu>
  );
}

interface NavSectionProps {
  items: NavItemConfig[];
  collapsed: boolean;
  pathname: string;
}

function NavSection({ items, collapsed, pathname }: NavSectionProps) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/home' && pathname.startsWith(item.href));
        return (
          <li key={item.id}>
            <NavLink item={item} collapsed={collapsed} isActive={isActive} />
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Left navigation rail (64px collapsed / 240px expanded).
 * Organized into three sections: Apps, Personal, System.
 */
export function NavRail() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-surface)]',
        'transition-[width] duration-200 ease-[var(--ease-smooth)]',
      )}
      style={{ width: collapsed ? 64 : 240 }}
      aria-label="Main navigation"
    >
      {/* Toggle button */}
      <div className={cn('flex items-center px-3 py-3', collapsed && 'justify-center')}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="size-8 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} strokeWidth={1.5} />
          ) : (
            <PanelLeftClose size={18} strokeWidth={1.5} />
          )}
        </Button>
      </div>

      {/* Nav sections */}
      <nav className={cn('flex-1 overflow-y-auto overflow-x-hidden px-3', collapsed && 'px-2')}>
        <NavSection items={APP_ITEMS} collapsed={collapsed} pathname={pathname} />

        <Separator className="my-3" />

        <NavSection items={PERSONAL_ITEMS} collapsed={collapsed} pathname={pathname} />

        <div className="my-3 border-t border-[var(--color-border)]" />

        <NavSection items={SYSTEM_ITEMS} collapsed={collapsed} pathname={pathname} />
      </nav>
    </aside>
  );
}
