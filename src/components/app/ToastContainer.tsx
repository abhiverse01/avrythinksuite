'use client';

import { useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from 'lucide-react';
import { useToastStore, type ToastType, type Toast } from '@/hooks/use-toast';
import { toastEnter } from '@/lib/animation';

// ── Icon mapping ─────────────────────────────────────────────

const iconMap: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

// ── Color mapping ────────────────────────────────────────────

const colorMap: Record<ToastType, string> = {
  success: 'var(--color-success)',
  error: 'var(--color-danger)',
  warning: 'var(--color-warning)',
  info: 'var(--color-accent)',
  loading: 'var(--color-accent)',
};

// ── Single Toast Card ────────────────────────────────────────

interface ToastCardProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}

function ToastCard({ toast: t, onDismiss, onPause, onResume }: ToastCardProps) {
  const Icon = iconMap[t.type];
  const color = colorMap[t.type];
  const isDismissing = useRef(false);

  const handleMouseEnter = useCallback(() => {
    onPause(t.id);
  }, [t.id, onPause]);

  const handleMouseLeave = useCallback(() => {
    onResume(t.id);
  }, [t.id, onResume]);

  const handleClose = useCallback(() => {
    if (isDismissing.current) return;
    isDismissing.current = true;
    onDismiss(t.id);
  }, [t.id, onDismiss]);

  return (
    <motion.div
      layout
      variants={toastEnter}
      initial="initial"
      animate="animate"
      exit="exit"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative w-[360px] overflow-hidden rounded-lg border border-[var(--color-border)]
                 bg-[var(--color-bg-surface)] shadow-[var(--shadow-lg)]"
      role="alert"
      aria-live="assertive"
    >
      {/* Content row */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Icon */}
        <Icon
          className={`mt-0.5 size-5 shrink-0 ${t.type === 'loading' ? 'animate-spin' : ''}`}
          style={{ color }}
        />

        {/* Text + action */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {t.title}
          </p>
          {t.description && (
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              {t.description}
            </p>
          )}
          {t.action && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                t.action!.onClick();
              }}
              className="mt-1.5 text-xs font-medium underline decoration-current underline-offset-2 transition-colors hover:opacity-80"
              style={{ color }}
            >
              {t.action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 rounded-md p-0.5 text-[var(--color-text-tertiary)]
                     transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
          aria-label="Dismiss notification"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      {t.duration && t.duration !== Infinity && (
        <div className="h-px bg-[var(--color-border)]">
          <div
            className="h-full transition-none group-hover:[animation-play-state:paused]"
            style={{
              backgroundColor: color,
              width: '100%',
              animation: `toast-drain ${t.duration}ms linear forwards`,
              opacity: 0.5,
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

// ── Container ────────────────────────────────────────────────

/** Per-toast timer bookkeeping */
interface TimerEntry {
  endTime: number; // absolute timestamp when the timer fires
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Global toast notification container.
 * Renders a fixed stack of up to 3 toasts in the top-right corner.
 */
export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  // Per-toast auto-dismiss timers with hover-pause support
  const timersRef = useRef<Map<string, TimerEntry>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const entry = timersRef.current.get(id);
    if (entry) {
      clearTimeout(entry.timer);
      timersRef.current.delete(id);
    }
  }, []);

  /** Start (or restart) a timer for the given toast. */
  const startTimer = useCallback(
    (id: string, durationMs: number, fromRemaining?: number) => {
      clearTimer(id);
      const remaining = fromRemaining ?? durationMs;
      const endTime = Date.now() + remaining;
      const timer = setTimeout(() => {
        dismissToast(id);
        timersRef.current.delete(id);
      }, remaining);
      timersRef.current.set(id, { endTime, timer });
    },
    [dismissToast, clearTimer],
  );

  /** Pause the timer on hover — compute remaining time from the end timestamp. */
  const handlePause = useCallback((id: string) => {
    const entry = timersRef.current.get(id);
    if (entry) {
      clearTimeout(entry.timer);
      // Update endTime so resume knows the true remaining budget
      entry.endTime = Math.max(entry.endTime, Date.now());
    }
  }, []);

  /** Resume the timer — use time left until endTime. */
  const handleResume = useCallback(
    (id: string) => {
      const entry = timersRef.current.get(id);
      if (entry) {
        const remaining = Math.max(entry.endTime - Date.now(), 500); // at least 500ms
        entry.timer = setTimeout(() => {
          dismissToast(id);
          timersRef.current.delete(id);
        }, remaining);
      }
    },
    [dismissToast],
  );

  // Start timers for new toasts; clean up timers for removed toasts
  useEffect(() => {
    for (const t of toasts) {
      if (t.duration && t.duration !== Infinity && !timersRef.current.has(t.id)) {
        startTimer(t.id, t.duration);
      }
    }

    // Clean up timers for toasts that no longer exist
    for (const id of timersRef.current.keys()) {
      if (!toasts.find((t) => t.id === id)) {
        clearTimer(id);
      }
    }
  }, [toasts, startTimer, clearTimer]);

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[9999] flex flex-col gap-2"
      aria-label="Notifications"
    >
      {/* CSS animation for progress bar drain */}
      <style>{`
        @keyframes toast-drain {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard
              toast={t}
              onDismiss={dismissToast}
              onPause={handlePause}
              onResume={handleResume}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
