'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Horizontal breadcrumb with '/' separators.
 * Auto-collapses on narrow screens: shows first + last + "…" ellipsis.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  // On small screens, collapse to: [first] … [last]
  // We render all items but use CSS to hide middle ones on narrow viewports
  const isCollapsed = items.length > 3;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm', className)}
    >
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const isMiddle = !isFirst && !isLast;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1"
            >
              {/* Show separator before all but first */}
              {!isFirst && (
                <ChevronRight
                  className="text-[var(--color-text-tertiary)] shrink-0"
                  size={14}
                  strokeWidth={1.5}
                />
              )}

              {/* Middle items: hidden on small screens */}
              {isMiddle && isCollapsed ? (
                <span
                  className={cn(
                    'text-[var(--color-text-tertiary)]',
                    'max-md:hidden'
                  )}
                >
                  {/* Show ellipsis only for the first middle item on mobile */}
                  {index === 1 && (
                    <span className="md:hidden">…</span>
                  )}
                  {/* Show all on md+ */}
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="hover:text-[var(--color-accent)] transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </span>
              ) : isLast ? (
                <span
                  className="font-medium text-[var(--color-text-primary)]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href ?? '#'}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-150"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
