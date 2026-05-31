'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { SheetsEditor } from '@/components/sheets/SheetsEditor';

/**
 * Spreadsheet editor page — loads file from store, renders the full SheetsEditor.
 */
export default function SheetEditorPage() {
  const params = useParams<{ sheetId: string }>();
  const sheetId = params.sheetId;

  // The sheetId can be used for persistence; for now we just pass it to the editor.
  const memoizedId = useMemo(() => sheetId, [sheetId]);

  return <SheetsEditor sheetId={memoizedId} />;
}
