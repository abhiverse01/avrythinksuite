'use client';

import { Building2, Check } from 'lucide-react';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import type { Organization } from '@/lib/types';

/** Mock org list */
const MOCK_ORGS: { org: Organization; role: string }[] = [
  {
    org: { id: 'org-personal', name: 'Personal', slug: 'personal', logo_url: null, plan: 'free', created_by: 'usr-1', created_at: '' },
    role: 'Owner',
  },
  {
    org: { id: 'org-acme', name: 'Acme Corp', slug: 'acme-corp', logo_url: null, plan: 'pro', created_by: 'usr-1', created_at: '' },
    role: 'Admin',
  },
  {
    org: { id: 'org-design', name: 'Design Team', slug: 'design-team', logo_url: null, plan: 'pro', created_by: 'usr-1', created_at: '' },
    role: 'Member',
  },
];

/**
 * Organization switcher dropdown.
 * Shows current org name (or "Personal") and lets user switch between orgs.
 */
export function OrgSwitcher() {
  const activeOrg = useUIStore((s) => s.activeOrg);
  const setActiveOrg = useUIStore((s) => s.setActiveOrg);
  const [open, setOpen] = useState(false);

  const currentName = activeOrg?.name ?? 'Personal';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <Building2 size={16} strokeWidth={1.5} />
          <span className="max-w-[120px] truncate text-sm font-medium">
            {currentName}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-56 p-0"
      >
        <div className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
          Organizations
        </div>

        <Separator />

        <ul className="py-1">
          {MOCK_ORGS.map(({ org, role }) => {
            const isActive = activeOrg?.id === org.id;
            return (
              <li key={org.id}>
                <button
                  onClick={() => {
                    setActiveOrg(org);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-3 py-2 text-sm transition-colors duration-150',
                    isActive
                      ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)]'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Building2 size={16} strokeWidth={1.5} className="shrink-0" />
                    <span className="font-medium">{org.name}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {role}
                    </Badge>
                    {isActive && (
                      <Check size={14} strokeWidth={2} className="text-[var(--color-accent)]" />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
