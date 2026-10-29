
import { create } from 'zustand';
import type { AuthUser } from '../services/auth';

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;

  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setInitializing: (initializing: boolean) => void;
  setSession: (user: AuthUser) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setInitializing: (isInitializing) =>
    set({ isInitializing }),

  setSession: (user) =>
    set({
      user,
      isAuthenticated: true,
      isInitializing: false,
      isLoading: false,
    }),

  clearSession: () =>
    set({
      user: null,
      isAuthenticated: false,
      isInitializing: false,
      isLoading: false,
    }),
}));
