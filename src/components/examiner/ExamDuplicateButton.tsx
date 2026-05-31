'use client';

import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/stores/file-store';
import { toast } from 'sonner';

interface ExamDuplicateButtonProps {
  exam: {
    id: string;
    title: string;
    type: string;
    owner_id: string;
    org_id: string | null;
    parent_id: string | null;
  };
  onDuplicate?: () => void;
}

export function ExamDuplicateButton({ exam, onDuplicate }: ExamDuplicateButtonProps) {
  const router = useRouter();
  const { createFile, updateFileContent } = useFileStore();

  const handleDuplicate = () => {
    const newFile = createFile({
      name: `${exam.title} (Copy)`,
      type: exam.type as 'exam',
      owner_id: exam.owner_id,
      org_id: exam.org_id,
      parent_id: exam.parent_id,
    });

    // Copy the content from the original exam to the duplicate
    const sourceFile = useFileStore.getState().recentFiles.find((f) => f.id === exam.id);
    if (sourceFile?.content) {
      updateFileContent(newFile.id, {
        ...sourceFile.content,
        title: `${exam.title} (Copy)`,
        share_token: Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18),
      });
    }

    toast.success('Exam duplicated');
    if (onDuplicate) onDuplicate();
    router.push(`/examiner/${newFile.id}`);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        handleDuplicate();
      }}
      className="h-8 px-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
    >
      <Copy size={14} className="mr-1.5" />
      Duplicate
    </Button>
  );
}
