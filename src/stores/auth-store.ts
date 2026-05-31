import { create } from 'zustand';
import type { User } from '@/lib/types';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AUTH STORE — Credential-based auth with admin account
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/** Hardcoded valid credentials for local dev */
const VALID_CREDENTIALS: Record<string, { password: string; user: User }> = {
  'admin@admina.com': {
    password: 'admin123',
    user: {
      id: 'usr-admin-001',
      email: 'admin@admina.com',
      full_name: 'Admin',
      avatar_url: null,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
    },
  },
};

interface AuthState {
  user: User | null;
  session: { access_token: string; expires_at: number } | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setSession: (session: { access_token: string; expires_at: number } | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),

  hydrate: () => {
    // Check for persisted session on mount
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('avry-session');
        if (saved) {
          const { user, expires_at } = JSON.parse(saved) as {
            user: User;
            expires_at: number;
          };
          if (expires_at > Date.now()) {
            set({
              user,
              session: { access_token: 'local-token', expires_at },
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
          localStorage.removeItem('avry-session');
        }
      } catch {
        localStorage.removeItem('avry-session');
      }
    }
    set({ isLoading: false });
  },

  signIn: async (email, password) => {
    set({ isLoading: true });

    // Simulate network delay for realism
    await new Promise((r) => setTimeout(r, 400));

    const lowerEmail = email.toLowerCase().trim();
    const cred = VALID_CREDENTIALS[lowerEmail];

    if (!cred || cred.password !== password) {
      set({ isLoading: false });
      throw new Error('Invalid email or password');
    }

    const session = {
      access_token: 'tok-' + Date.now(),
      expires_at: Date.now() + 24 * 3600000, // 24 hours
    };

    // Persist session
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'avry-session',
        JSON.stringify({ user: cred.user, expires_at: session.expires_at }),
      );
    }

    set({
      user: cred.user,
      session,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  signUp: async (email, password, fullName) => {
    set({ isLoading: true });

    await new Promise((r) => setTimeout(r, 400));

    // For now, sign-up creates a new local session (no stored credential)
    const newUser: User = {
      id: 'usr-' + Date.now(),
      email: email.toLowerCase().trim(),
      full_name: fullName.trim(),
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const session = {
      access_token: 'tok-' + Date.now(),
      expires_at: Date.now() + 24 * 3600000,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'avry-session',
        JSON.stringify({ user: newUser, expires_at: session.expires_at }),
      );
      // Also register the credential so they can sign in later
      VALID_CREDENTIALS[newUser.email] = { password, user: newUser };
    }

    set({
      user: newUser,
      session,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  signOut: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('avry-session');
    }
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  updateProfile: (updates) => {
    const { user } = get();
    if (user) {
      const updated = { ...user, ...updates };
      set({ user: updated });
      // Update persisted session
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('avry-session');
        if (saved) {
          const parsed = JSON.parse(saved);
          localStorage.setItem(
            'avry-session',
            JSON.stringify({ ...parsed, user: updated }),
          );
        }
      }
    }
  },
}));
