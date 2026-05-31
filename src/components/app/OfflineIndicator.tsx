'use client';
import { useOnlineStatus } from '@/hooks/use-offline-sync';
import { WifiOff, Loader2, AlertCircle } from 'lucide-react';

export function OfflineIndicator({ syncStatus }: { syncStatus?: string }) {
  const isOnline = useOnlineStatus();

  if (isOnline && (!syncStatus || syncStatus === 'synced' || syncStatus === 'idle')) return null;

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-warning)]">
        <WifiOff size={12} strokeWidth={2} />
        <span>Offline</span>
      </div>
    );
  }

  if (syncStatus === 'saving' || syncStatus === 'syncing') {
    return (
      <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-tertiary)]">
        <Loader2 size={12} strokeWidth={2} className="animate-spin" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (syncStatus === 'error') {
    return (
      <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-danger)]">
        <AlertCircle size={12} strokeWidth={2} />
        <span>Sync error</span>
      </div>
    );
  }

  return null;
}
