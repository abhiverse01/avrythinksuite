"use client"

import { useToastStore } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-[9999]" data-slot="toaster">
      {toasts.map(function (toast) {
        return (
          <div
            key={toast.id}
            className="group pointer-events-auto relative flex w-full max-w-sm items-center justify-between gap-4 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 shadow-[var(--shadow-lg)]"
            data-slot="toast"
          >
            <div className="grid gap-1">
              <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                {toast.title}
              </div>
              {toast.description && (
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {toast.description}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
