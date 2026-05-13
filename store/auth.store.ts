import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setAuth: (user, token) => {
        localStorage.setItem('crm_token', token);
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),

      setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: 'crm_auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // _hasHydrated intentionally excluded — always starts false, set by onRehydrateStorage
      }),
      onRehydrateStorage: () => (state) => {
        // Called after localStorage data is loaded into store
        state?.setHasHydrated(true);
      },
    }
  )
);