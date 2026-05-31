'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidesEditor } from '@/components/slides/SlidesEditor';
import { useFileStore } from '@/stores/file-store';

const editorVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export default function SlidesEditorPage() {
  const params = useParams<{ slideId: string }>();
  const slideId = params.slideId;
  const { recentFiles } = useFileStore();
  const file = recentFiles.find((f) => f.id === slideId);

  return (
    <motion.div
      variants={editorVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full"
    >
      {/* ── Editor fills remaining space (no extra header — AppShell provides it) ── */}
      <div className="flex-1 min-h-0">
        <SlidesEditor fileId={slideId} fileName={file?.name} />
      </div>
    </motion.div>
  );
}
