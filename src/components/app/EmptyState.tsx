'use client';

import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  /** Lucide icon component to display as the illustration */
  icon: LucideIcon;
  /** Primary title text */
  title: string;
  /** Secondary description text */
  description: string;
  /** Label for the CTA button */
  actionLabel: string;
  /** Callback when the CTA button is clicked */
  onAction: () => void;
  className?: string;
}

/**
 * Centered empty state component with illustration slot, title, description, and CTA.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className ?? ''}`}
    >
      {/* Illustration slot */}
      <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
        <Icon size={32} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-1.5 max-w-sm text-sm text-[var(--color-text-secondary)]">
        {description}
      </p>

      {/* CTA */}
      <Button
        onClick={onAction}
        className="mt-6"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
