'use client';

import { useMemo } from 'react';
import { CheckCircle2, CloudOff, Loader2 } from 'lucide-react';

interface EditorStatusBarProps {
  /** Current word count from the editor */
  wordCount: number;
  /** Current character count from the editor */
  charCount: number;
  /** Sync status from useOfflineSync */
  syncStatus: 'idle' | 'saving' | 'synced' | 'offline' | 'error';
}

export function EditorStatusBar({
  wordCount,
  charCount,
  syncStatus,
}: EditorStatusBarProps) {
  const readingTime = useMemo(() => {
    const minutes = Math.ceil(wordCount / 200);
    return minutes < 1 ? '< 1 min read' : `${minutes} min read`;
  }, [wordCount]);

  return (
    <>
      {/* Left: word/char/reading time */}
      <span className="flex items-center gap-3">
        <span>{wordCount.toLocaleString()} words</span>
        <span>{charCount.toLocaleString()} characters</span>
        <span>{readingTime}</span>
      </span>

      {/* Right: sync status */}
      <span className="flex items-center gap-1.5">
        {syncStatus === 'saving' && (
          <>
            <Loader2 size={12} className="animate-spin" />
            Saving…
          </>
        )}
        {syncStatus === 'synced' && (
          <>
            <CheckCircle2 size={12} />
            Saved
          </>
        )}
        {syncStatus === 'offline' && (
          <>
            <CloudOff size={12} />
            Offline — saved locally
          </>
        )}
        {syncStatus === 'error' && (
          <>
            <CloudOff size={12} />
            Save failed
          </>
        )}
        {syncStatus === 'idle' && (
          <>
            <CheckCircle2 size={12} />
            Ready
          </>
        )}
      </span>
    </>
  );
}
