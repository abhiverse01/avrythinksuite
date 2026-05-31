import { create } from 'zustand';
import type { ThemeMode, DensityMode, FontSizeMode, Organization } from '@/lib/types';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UI STORE — sidebar, theme, command palette, active org
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const THEME_CLASSES = ['dark', 'theme-avrythink-dark', 'theme-soft-light'] as const;
const DENSITY_CLASSES = ['density-compact', 'density-spacious'] as const;

function applyThemeClasses(theme: ThemeMode) {
  const root = document.documentElement;

  // Remove all theme classes first
  THEME_CLASSES.forEach((cls) => root.classList.remove(cls));

  switch (theme) {
    case 'dark':
      root.classList.add('dark');
      break;
    case 'system': {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
      break;
    }
    case 'avrythink-dark':
      root.classList.add('theme-avrythink-dark');
      break;
    case 'soft-light':
      root.classList.add('theme-soft-light');
      break;
    // 'light' → no class needed
  }
}

function applyDensityClasses(density: DensityMode) {
  const root = document.documentElement;
  DENSITY_CLASSES.forEach((cls) => root.classList.remove(cls));

  switch (density) {
    case 'compact':
      root.classList.add('density-compact');
      break;
    case 'spacious':
      root.classList.add('density-spacious');
      break;
    // 'comfortable' → no class needed
  }
}

function applyFontSize(size: FontSizeMode) {
  const root = document.documentElement;
  const map: Record<FontSizeMode, string> = {
    small: '13px',
    default: '14px',
    large: '15px',
  };
  root.style.setProperty('--font-size-base', map[size]);
}

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('avrythink-theme');
  if (stored && ['light', 'dark', 'system', 'avrythink-dark', 'soft-light'].includes(stored)) {
    return stored as ThemeMode;
  }
  return 'light';
}

function readStoredDensity(): DensityMode {
  if (typeof window === 'undefined') return 'comfortable';
  const stored = localStorage.getItem('avrythink-density');
  if (stored && ['comfortable', 'compact', 'spacious'].includes(stored)) {
    return stored as DensityMode;
  }
  return 'comfortable';
}

function readStoredFontSize(): FontSizeMode {
  if (typeof window === 'undefined') return 'default';
  const stored = localStorage.getItem('avrythink-font-size');
  if (stored && ['small', 'default', 'large'].includes(stored)) {
    return stored as FontSizeMode;
  }
  return 'default';
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: ThemeMode;
  density: DensityMode;
  fontSize: FontSizeMode;
  reduceMotion: boolean;
  commandPaletteOpen: boolean;
  keyboardShortcutsOpen: boolean;
  activeOrg: Organization | null;
  headerScrolled: boolean;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setDensity: (density: DensityMode) => void;
  setFontSize: (size: FontSizeMode) => void;
  setReduceMotion: (reduce: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleKeyboardShortcuts: () => void;
  closeKeyboardShortcuts: () => void;
  setActiveOrg: (org: Organization | null) => void;
  setHeaderScrolled: (scrolled: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: readStoredTheme(),
  density: readStoredDensity(),
  fontSize: readStoredFontSize(),
  reduceMotion: false,
  commandPaletteOpen: false,
  keyboardShortcutsOpen: false,
  activeOrg: null,
  headerScrolled: false,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('avrythink-theme', theme);
      applyThemeClasses(theme);
    }
    set({ theme });
  },

  setDensity: (density) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('avrythink-density', density);
      applyDensityClasses(density);
    }
    set({ density });
  },

  setFontSize: (size) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('avrythink-font-size', size);
      applyFontSize(size);
    }
    set({ fontSize: size });
  },

  setReduceMotion: (reduce) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('avrythink-reduce-motion', String(reduce));
      const root = document.documentElement;
      if (reduce) {
        root.classList.add('reduce-motion');
      } else {
        root.classList.remove('reduce-motion');
      }
    }
    set({ reduceMotion: reduce });
  },

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleKeyboardShortcuts: () =>
    set((state) => ({ keyboardShortcutsOpen: !state.keyboardShortcutsOpen })),
  closeKeyboardShortcuts: () => set({ keyboardShortcutsOpen: false }),

  setActiveOrg: (org) => set({ activeOrg: org }),
  setHeaderScrolled: (scrolled) => set({ headerScrolled: scrolled }),
}));
