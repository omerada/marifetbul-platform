import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;

  // Actions
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: 'freelancer' | 'employer';
}

interface LoginResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,

      // Login action
      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, rememberMe }),
          });

          const data: LoginResponse = await response.json();

          if (data.success && data.data) {
            // Set cookie for middleware with appropriate expiration
            const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
            document.cookie = `marifeto-auth-token=${data.data.token}; path=/; max-age=${maxAge}; SameSite=Lax`;

            set({
              user: data.data.user,
              token: data.data.token,
              isAuthenticated: true,
              rememberMe,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              error: data.error || 'Giriş başarısız',
              isLoading: false,
            });
          }
        } catch {
          set({
            error: 'Bağlantı hatası',
            isLoading: false,
          });
        }
      },

      // Register action
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const result: LoginResponse = await response.json();

          if (result.success && result.data) {
            // Set cookie for middleware
            document.cookie = `marifeto-auth-token=${result.data.token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;

            set({
              user: result.data.user,
              token: result.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              error: result.error || 'Kayıt başarısız',
              isLoading: false,
            });
          }
        } catch {
          set({
            error: 'Bağlantı hatası',
            isLoading: false,
          });
        }
      },

      // Logout action
      logout: () => {
        // Clear cookie
        document.cookie =
          'marifeto-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          rememberMe: false,
          error: null,
        });
      },

      // Clear error action
      clearError: () => {
        set({ error: null });
      },

      // Update user action
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      // Refresh auth from token
      refreshAuth: async () => {
        const token = get().token;
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });

        try {
          const response = await fetch('/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (data.success && data.data) {
            set({
              user: data.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token invalid, logout
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              rememberMe: false,
              isLoading: false,
            });
          }
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            rememberMe: false,
            isLoading: false,
          });
        }
      },

      // Check auth status on app load
      checkAuthStatus: async () => {
        const { token, refreshAuth } = get();
        if (token) {
          await refreshAuth();
        }
      },
    }),
    {
      name: 'marifeto-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
);

export default useAuthStore;
