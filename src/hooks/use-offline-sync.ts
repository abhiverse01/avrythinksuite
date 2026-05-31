'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/lib/offline-db';

type SyncStatus = 'idle' | 'saving' | 'synced' | 'offline' | 'error';

export function useOfflineSync(fileId: string) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => { setIsOnline(false); setSyncStatus('offline'); };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const save = useCallback(async (content: string) => {
    const now = new Date().toISOString();
    setSyncStatus('saving');

    // Save to IndexedDB first
    await db.files.put({ id: fileId, type: 'doc', ownerId: 'usr-1', name: '', content, updatedAt: now, syncStatus: 'pending' });
    await db.fileContent.put({ fileId, content, updatedAt: now });

    setLastSaved(now);

    if (isOnline) {
      // Try remote save (simulated — in production this would be Supabase)
      try {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 300));
        setSyncStatus('synced');
      } catch {
        // Queue for later
        await db.syncQueue.add({ fileId, operation: 'update', payload: content, createdAt: now, retries: 0 });
        setSyncStatus('error');
      }
    } else {
      setSyncStatus('offline');
    }
  }, [fileId, isOnline]);

  const load = useCallback(async (): Promise<{ content: string; source: 'local' | 'remote'; conflict: boolean }> => {
    // Try local first (always works offline)
    const local = await db.fileContent.get(fileId);
    if (local) {
      return { content: local.content, source: 'local', conflict: false };
    }
    return { content: '', source: 'local', conflict: false };
  }, [fileId]);

  // Auto-save debounced (800ms)
  const debouncedSave = useCallback((content: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => save(content), 800);
  }, [save]);

  // Background sync
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(async () => {
      const queue = await db.syncQueue.toArray();
      for (const item of queue.slice(0, 5)) {
        if (item.retries >= 3) {
          await db.syncQueue.delete(item.id!);
          continue;
        }
        try {
          await new Promise(r => setTimeout(r, 200)); // simulate
          await db.syncQueue.delete(item.id!);
          if (item.fileId === fileId) setSyncStatus('synced');
        } catch {
          await db.syncQueue.update(item.id!, { retries: item.retries + 1 });
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isOnline, fileId]);

  return { save: debouncedSave, saveImmediate: save, load, syncStatus, lastSaved, isOnline };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
}
