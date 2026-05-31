'use client';

import { useEffect } from 'react';

interface AnnouncerProps {
  message: string;
  /** 'polite' for non-urgent, 'assertive' for urgent */
  politeness?: 'polite' | 'assertive';
}

/**
 * Screen-reader-only live region that announces route changes or important state updates.
 */
export function Announcer({ message, politeness = 'polite' }: AnnouncerProps) {
  useEffect(() => {
    const element = document.getElementById('avry-announcer');
    if (element) {
      element.setAttribute('aria-live', politeness);
      element.textContent = message;
    }
  }, [message, politeness]);

  return (
    <div
      id="avry-announcer"
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="pointer-events-none fixed left-[-9999px] top-[-9999px] h-px w-px overflow-hidden"
    >
      {message}
    </div>
  );
}
