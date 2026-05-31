import { create } from 'zustand';
import type { FileItem, FileType } from '@/lib/types';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FILE STORE — recent, starred, CRUD operations
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface FileState {
  recentFiles: FileItem[];
  starredFiles: FileItem[];
  isLoading: boolean;

  setFiles: (files: FileItem[]) => void;
  setLoading: (loading: boolean) => void;
  createFile: (file: Omit<FileItem, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'is_starred' | 'content'>) => FileItem;
  renameFile: (id: string, name: string) => void;
  deleteFile: (id: string) => void;
  restoreFile: (id: string) => void;
  starFile: (id: string) => void;
  unstarFile: (id: string) => void;
  updateFileContent: (id: string, content: Record<string, unknown>) => void;
}

function createMockFile(type: FileType, name: string, orgId: string | null = null): FileItem {
  const now = new Date().toISOString();
  return {
    id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    type,
    content: {},
    owner_id: 'usr-1',
    org_id: orgId,
    parent_id: null,
    is_deleted: false,
    is_starred: false,
    created_at: now,
    updated_at: now,
  };
}

// Seed data for realistic demo
const seedFiles: FileItem[] = [
  createMockFile('doc', 'Q3 Product Roadmap'),
  createMockFile('sheet', 'Marketing Budget 2025'),
  createMockFile('slide', 'Team Standup Deck'),
  createMockFile('doc', 'Technical Architecture Notes'),
  createMockFile('exam', 'Frontend Developer Assessment'),
  createMockFile('canvas', 'User Flow Wireframe'),
  createMockFile('sheet', 'User Analytics Dashboard'),
  createMockFile('doc', 'Onboarding Guide v2'),
  createMockFile('slide', 'Investor Pitch'),
  createMockFile('canvas', 'Brand Mood Board'),
  createMockFile('sheet', 'Sprint Velocity Tracker'),
  createMockFile('doc', 'API Documentation Draft'),
];

// Stagger the timestamps
seedFiles.forEach((file, i) => {
  const hoursAgo = i * 3 + Math.random() * 5;
  const date = new Date(Date.now() - hoursAgo * 3600000);
  file.created_at = date.toISOString();
  file.updated_at = date.toISOString();
  if (i < 3) file.is_starred = true;
});

export const useFileStore = create<FileState>((set, get) => ({
  recentFiles: seedFiles,
  starredFiles: seedFiles.filter((f) => f.is_starred),
  isLoading: false,

  setFiles: (files) =>
    set({
      recentFiles: files,
      starredFiles: files.filter((f) => f.is_starred),
    }),

  setLoading: (isLoading) => set({ isLoading }),

  createFile: (partial) => {
    const newFile = createMockFile(partial.type, partial.name, partial.org_id);
    set((state) => ({
      recentFiles: [newFile, ...state.recentFiles],
    }));
    return newFile;
  },

  renameFile: (id, name) =>
    set((state) => ({
      recentFiles: state.recentFiles.map((f) =>
        f.id === id ? { ...f, name, updated_at: new Date().toISOString() } : f,
      ),
    })),

  deleteFile: (id) =>
    set((state) => ({
      recentFiles: state.recentFiles.map((f) =>
        f.id === id ? { ...f, is_deleted: true } : f,
      ).filter((f) => !f.is_deleted),
    })),

  restoreFile: (id) =>
    set((state) => ({
      recentFiles: state.recentFiles.map((f) =>
        f.id === id ? { ...f, is_deleted: false } : f,
      ),
    })),

  starFile: (id) =>
    set((state) => ({
      recentFiles: state.recentFiles.map((f) =>
        f.id === id ? { ...f, is_starred: true } : f,
      ),
      starredFiles: [
        ...state.recentFiles.find((f) => f.id === id && f.is_starred)
          ? state.starredFiles
          : state.starredFiles,
        ...(state.recentFiles.find((f) => f.id === id)
          ? [state.recentFiles.find((f) => f.id === id)!]
          : []),
      ],
    })),

  unstarFile: (id) =>
    set((state) => ({
      recentFiles: state.recentFiles.map((f) =>
        f.id === id ? { ...f, is_starred: false } : f,
      ),
      starredFiles: state.starredFiles.filter((f) => f.id !== id),
    })),

  updateFileContent: (id, content) =>
    set((state) => ({
      recentFiles: state.recentFiles.map((f) =>
        f.id === id
          ? { ...f, content, updated_at: new Date().toISOString() }
          : f,
      ),
    })),
}));
