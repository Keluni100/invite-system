import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '@/types';
import { authApi, handleApiError } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authApi.login(credentials);
          
          // Store tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('refresh_token', response.refresh_token);
          }
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          const apiError = handleApiError(error);
          set({
            isLoading: false,
            error: apiError.message,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authApi.register(userData);
          
          // Store tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('refresh_token', response.refresh_token);
          }
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          const apiError = handleApiError(error);
          set({
            isLoading: false,
            error: apiError.message,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      logout: () => {
        // Clear tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        
        // Call logout API (fire and forget)
        authApi.logout().catch(() => {
          // Ignore errors on logout
        });
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      },

      refreshUser: async () => {
        if (!get().isAuthenticated) return;
        
        set({ isLoading: true });
        try {
          const user = await authApi.getCurrentUser();
          set({
            user: user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch {
          // If refresh fails, logout
          get().logout();
          set({ isLoading: false });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);