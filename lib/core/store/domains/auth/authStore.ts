// ================================================
// AUTH STORE - DOMAIN BASED
// ================================================
// Authentication state management with BaseStore pattern

import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { User } from '@/types';

// ================================
// TYPES & INTERFACES
// ================================

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: 'freelancer' | 'employer';
}

export interface AuthUser extends User {
  token: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;

  // Session tracking
  lastActivity: number | null;
  sessionExpiry: number | null;
}

interface AuthActions {
  // Authentication
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithToken: (user: User, token: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;

  // User management
  updateUser: (userData: Partial<User>) => void;
  refreshAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;

  // Utilities
  clearError: () => void;
  getCurrentUserId: () => string | null;
  isSessionValid: () => boolean;
  extendSession: () => void;
}

type AuthStore = AuthState & AuthActions;

// ================================
// INITIAL STATE
// ================================

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  rememberMe: false,
  lastActivity: null,
  sessionExpiry: null,
};

// ================================
// AUTH STORE
// ================================

export const useAuthStore = create<AuthStore>()(
  persist(
    devtools(
      immer((set, get) => ({
        ...initialState,

        // Login with credentials
        login: async (credentials: LoginCredentials) => {
          console.log('🔐 Auth Store: Login attempt with credentials:', {
            email: credentials.email,
          });

          set((draft) => {
            draft.isLoading = true;
            draft.error = null;
          });

          try {
            console.log(
              '📡 Auth Store: Sending login request to /api/auth/login'
            );

            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials),
            });

            console.log('📨 Auth Store: Response received:', {
              status: response.status,
              ok: response.ok,
            });

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const result = await response.json();
            console.log('📋 Auth Store: Response data:', result);
            console.log('📋 Auth Store: Response success:', result.success);
            console.log('📋 Auth Store: Response error:', result.error);

            if (!result.success) {
              console.log('❌ Auth Store: API returned error:', result.error);
              throw new Error(result.error || 'Giriş başarısız');
            }

            const { user, token } = result.data;
            console.log('👤 Auth Store: User data received:', {
              userId: user.id,
              email: user.email,
              role: user.role,
            });

            const now = Date.now();
            const expiry =
              now +
              (credentials.rememberMe
                ? 30 * 24 * 60 * 60 * 1000
                : 24 * 60 * 60 * 1000); // 30 days or 1 day

            // Set cookies for middleware
            if (typeof window !== 'undefined') {
              const expiryDate = new Date(expiry);
              const cookieOptions = `expires=${expiryDate.toUTCString()}; path=/; SameSite=lax`;

              document.cookie = `marifetbul-auth-token=${token}; ${cookieOptions}`;
              document.cookie = `marifetbul-user-role=${user.role}; ${cookieOptions}`;
            }

            set((draft) => {
              draft.user = user;
              draft.token = token;
              draft.isAuthenticated = true;
              draft.isLoading = false;
              draft.error = null;
              draft.rememberMe = credentials.rememberMe || false;
              draft.lastActivity = now;
              draft.sessionExpiry = expiry;
            });
          } catch (error) {
            set((draft) => {
              draft.error =
                error instanceof Error ? error.message : 'Giriş başarısız';
              draft.isLoading = false;
              draft.isAuthenticated = false;
            });
            throw error;
          }
        },

        // Login with existing token (for auto-login)
        loginWithToken: async (user: User, token: string) => {
          set((draft) => {
            draft.isLoading = true;
            draft.error = null;
          });

          try {
            // Verify token with server
            const response = await fetch('/api/auth/verify', {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
              throw new Error('Token geçersiz');
            }

            const now = Date.now();

            set((draft) => {
              draft.user = user;
              draft.token = token;
              draft.isAuthenticated = true;
              draft.isLoading = false;
              draft.error = null;
              draft.lastActivity = now;
            });
          } catch (error) {
            // Token invalid, clear auth state
            get().logout();
            throw error;
          }
        },

        // Register new user
        register: async (data: RegisterData) => {
          set((draft) => {
            draft.isLoading = true;
            draft.error = null;
          });

          try {
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const result = await response.json();

            if (!result.success) {
              throw new Error(result.error || 'Kayıt başarısız');
            }

            const { user, token } = result.data;
            const now = Date.now();
            const expiry = now + 24 * 60 * 60 * 1000; // 1 day

            set((draft) => {
              draft.user = user;
              draft.token = token;
              draft.isAuthenticated = true;
              draft.isLoading = false;
              draft.error = null;
              draft.lastActivity = now;
              draft.sessionExpiry = expiry;
            });
          } catch (error) {
            set((draft) => {
              draft.error =
                error instanceof Error ? error.message : 'Kayıt başarısız';
              draft.isLoading = false;
            });
            throw error;
          }
        },

        // Logout
        logout: () => {
          // Clear cookies
          if (typeof window !== 'undefined') {
            document.cookie =
              'marifetbul-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie =
              'marifetbul-user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }

          set(() => ({
            ...initialState,
          }));
        },

        // Update user data
        updateUser: (userData: Partial<User>) => {
          set((draft) => {
            if (draft.user) {
              Object.assign(draft.user, userData);
            }
          });
        },

        // Refresh authentication
        refreshAuth: async () => {
          const { token } = get();

          if (!token) {
            get().logout();
            return;
          }

          try {
            const response = await fetch('/api/auth/refresh', {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
              throw new Error('Token yenileme başarısız');
            }

            const result = await response.json();
            const { user, token: newToken } = result.data;

            set((draft) => {
              draft.user = user;
              draft.token = newToken || token;
              draft.lastActivity = Date.now();
            });
          } catch (error) {
            get().logout();
            throw error;
          }
        },

        // Check auth status
        checkAuthStatus: async () => {
          const { token, sessionExpiry } = get();

          if (!token) {
            get().logout();
            return;
          }

          // Check session expiry
          if (sessionExpiry && Date.now() > sessionExpiry) {
            get().logout();
            return;
          }

          try {
            await get().refreshAuth();
          } catch (error) {
            console.error('Auth status check failed:', error);
          }
        },

        // Clear error
        clearError: () => {
          set((draft) => {
            draft.error = null;
          });
        },

        // Get current user ID
        getCurrentUserId: () => {
          const { user } = get();
          return user?.id || null;
        },

        // Check if session is valid
        isSessionValid: () => {
          const { sessionExpiry, isAuthenticated } = get();

          if (!isAuthenticated) return false;
          if (!sessionExpiry) return true; // No expiry set

          return Date.now() < sessionExpiry;
        },

        // Extend session
        extendSession: () => {
          set((draft) => {
            draft.lastActivity = Date.now();
            if (draft.rememberMe) {
              draft.sessionExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
            } else {
              draft.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000; // 1 day
            }
          });
        },
      })),
      { name: 'auth-store' }
    ),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      skipHydration: true, // Skip SSR hydration to prevent mismatches
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
        sessionExpiry: state.sessionExpiry,
      }),
    }
  )
);

// ================================
// OPTIMIZED SELECTORS
// ================================

export const authSelectors = {
  useUser: () => useAuthStore((state) => state.user),
  useIsAuthenticated: () => useAuthStore((state) => state.isAuthenticated),
  useIsLoading: () => useAuthStore((state) => state.isLoading),
  useError: () => useAuthStore((state) => state.error),
  useUserId: () => useAuthStore((state) => state.user?.id || null),

  useAuthStatus: () =>
    useAuthStore((state) => ({
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
    })),

  useActions: () =>
    useAuthStore((state) => ({
      login: state.login,
      loginWithToken: state.loginWithToken,
      register: state.register,
      logout: state.logout,
      updateUser: state.updateUser,
      refreshAuth: state.refreshAuth,
      checkAuthStatus: state.checkAuthStatus,
      clearError: state.clearError,
      getCurrentUserId: state.getCurrentUserId,
      isSessionValid: state.isSessionValid,
      extendSession: state.extendSession,
    })),
};

// ================================
// HOOKS
// ================================

// Main auth hook moved to hooks/useAuth.ts to avoid duplication

// Session management hook
export function useAuthSession() {
  const { isSessionValid, extendSession, checkAuthStatus } =
    authSelectors.useActions();

  React.useEffect(() => {
    const interval = setInterval(
      () => {
        if (!isSessionValid()) {
          checkAuthStatus();
        }
      },
      5 * 60 * 1000
    ); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [isSessionValid, checkAuthStatus]);

  return { extendSession };
}

// Export default
export default useAuthStore;
