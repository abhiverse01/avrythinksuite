'use client';

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
  progress?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${toastCounter++}`;
    const newToast = { ...toast, id };
    set((state) => {
      const toasts = [newToast, ...state.toasts].slice(0, 3);
      return { toasts };
    });
    return id;
  },
  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
  updateToast: (id, updates) => {
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },
}));

// ── Public API ──────────────────────────────────────────────

const durations: Record<ToastType, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 8000,
  loading: Infinity,
};

export function toast(
  type: ToastType,
  title: string,
  options?: {
    description?: string;
    duration?: number;
    action?: Toast['action'];
  },
) {
  const id = useToastStore.getState().addToast({
    type,
    title,
    description: options?.description,
    duration: options?.duration ?? durations[type],
    action: options?.action,
  });

  // Auto-dismiss (unless loading or custom duration was passed)
  const effectiveDuration = options?.duration ?? durations[type];
  if (effectiveDuration !== Infinity) {
    setTimeout(() => useToastStore.getState().dismissToast(id), effectiveDuration);
  }

  return id;
}

// ── Convenience methods ──────────────────────────────────────

toast.success = (title: string, options?: Parameters<typeof toast>[2]) =>
  toast('success', title, options);
toast.error = (title: string, options?: Parameters<typeof toast>[2]) =>
  toast('error', title, options);
toast.warning = (title: string, options?: Parameters<typeof toast>[2]) =>
  toast('warning', title, options);
toast.info = (title: string, options?: Parameters<typeof toast>[2]) =>
  toast('info', title, options);
toast.loading = (title: string, options?: Parameters<typeof toast>[2]) =>
  toast('loading', title, options);
toast.dismiss = (id: string) => useToastStore.getState().dismissToast(id);

toast.promise = async <T,>(
  promise: Promise<T>,
  opts: { loading: string; success: string; error: string },
) => {
  const id = toast.loading(opts.loading);
  try {
    const result = await promise;
    useToastStore.getState().updateToast(id, { type: 'success', title: opts.success });
    setTimeout(() => useToastStore.getState().dismissToast(id), 4000);
    return result;
  } catch (e) {
    useToastStore.getState().updateToast(id, { type: 'error', title: opts.error });
    setTimeout(() => useToastStore.getState().dismissToast(id), 8000);
    throw e;
  }
};

export default toast;
