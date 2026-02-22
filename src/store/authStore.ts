'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Family, User } from '@/types';

interface AuthState {
  user: User | null;
  family: Family | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setSession: (session: { user: User; family: Family; access_token: string }) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
  updateFamily: (updates: Partial<Family>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      family: null,
      accessToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setSession: ({ user, family, access_token }) =>
        set({ user, family, accessToken: access_token, isAuthenticated: true }),
      clearSession: () =>
        set({ user: null, family: null, accessToken: null, isAuthenticated: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      updateFamily: (updates) =>
        set((state) => ({
          family: state.family ? { ...state.family, ...updates } : null,
        })),
    }),
    {
      name: 'rawdah-adults-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
