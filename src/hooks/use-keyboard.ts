'use client';
import { useEffect, useRef } from 'react';
import hotkeys from 'hotkeys-js';
import { keyboardRegistry } from '@/lib/keyboard-registry';

export function useKeyboardShortcuts() {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const listeners = keyboardRegistry.getListeners();
    for (const { keys, handler } of listeners) {
      hotkeys(keys, handler);
    }

    return () => {
      for (const { keys } of listeners) {
        hotkeys.unbind(keys);
      }
      mountedRef.current = false;
    };
  }, []);

  return keyboardRegistry;
}

// Simple shortcut hook for components
export function useHotkey(keys: string, callback: () => void, deps: any[] = []) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    hotkeys(keys, (e: KeyboardEvent) => {
      e.preventDefault();
      callbackRef.current();
    });
    return () => { hotkeys.unbind(keys); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
