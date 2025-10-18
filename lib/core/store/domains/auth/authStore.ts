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
import { logger } from '@/lib/shared/utils/logger';

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
  token?: string; // Optional - token now stored in httpOnly cookies
}

interface AuthState {
  // State
  user: User | null;
  // NOTE: token removed - now stored in httpOnly cookies managed by backend
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
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>; // Changed to async for backend logout call

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
          logger.debug('Auth Store: Login attempt', {
            email: credentials.email,
          });

          set((draft) => {
            draft.isLoading = true;
            draft.error = null;
          });

          try {
            logger.debug(
              'Auth Store: Sending login request to /api/v1/auth/login with cookies'
            );

            const response = await fetch('/api/v1/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include', // IMPORTANT: Include cookies in request
              body: JSON.stringify({
                usernameOrEmail: credentials.email, // Backend expects usernameOrEmail field
                password: credentials.password,
              }),
            });

            logger.debug('Auth Store: Response received', {
              status: response.status,
              ok: response.ok,
            });

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const result = await response.json();
            logger.debug('Auth Store: Response data received', {
              success: result.success,
              hasUser: !!result.data?.user,
            });

            if (!result.success) {
              logger.warn('Auth Store: API returned error', {
                error: result.error,
              });
              throw new Error(result.error || 'Giriş başarısız');
            }

            const { user } = result.data;
            // NOTE: Token is now in httpOnly cookie, not returned in response
            logger.debug('Auth Store: User data received', {
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

            // Set user role cookie for middleware (non-httpOnly, readable by middleware)
            if (typeof window !== 'undefined' && user.role) {
              document.cookie = `marifetbul-user-role=${user.role}; path=/; SameSite=Lax; max-age=${credentials.rememberMe ? 2592000 : 86400}`;
              logger.debug('Auth Store: User role cookie set for middleware');
            }

            set((draft) => {
              draft.user = user;
              // draft.token removed - now stored in httpOnly cookie
              draft.isAuthenticated = true;
              draft.isLoading = false;
              draft.error = null;
              draft.rememberMe = credentials.rememberMe || false;
              draft.lastActivity = now;
              draft.sessionExpiry = expiry;
            });

            logger.info(
              'Auth Store: Login successful - cookies managed by backend'
            );
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

        // Register new user
        register: async (data: RegisterData) => {
          set((draft) => {
            draft.isLoading = true;
            draft.error = null;
          });

          try {
            const response = await fetch('/api/v1/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include', // IMPORTANT: Include cookies
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

            const { user } = result.data;
            // NOTE: Token is now in httpOnly cookie
            const now = Date.now();
            const expiry = now + 24 * 60 * 60 * 1000; // 1 day

            // Set user role cookie for middleware (non-httpOnly, readable by middleware)
            if (typeof window !== 'undefined' && user.role) {
              document.cookie = `marifetbul-user-role=${user.role}; path=/; SameSite=Lax; max-age=86400`; // 1 day
              logger.debug('Auth Store: User role cookie set for middleware');
            }

            set((draft) => {
              draft.user = user;
              // draft.token removed - now in httpOnly cookie
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
        logout: async () => {
          try {
            // Call backend logout to blacklist token
            await fetch('/api/v1/auth/logout', {
              method: 'POST',
              credentials: 'include', // IMPORTANT: Send cookies to backend
            });
            logger.info('Backend logout successful - token blacklisted');
          } catch (error) {
            logger.error(
              'Backend logout failed',
              error instanceof Error ? error : new Error(String(error))
            );
            // Continue with client-side logout even if backend fails
          }

          // Clear client-side state
          // httpOnly cookies are cleared by backend, but clear any other cookies
          if (typeof window !== 'undefined') {
            // Clear any non-httpOnly cookies (if any exist)
            document.cookie =
              'marifetbul-user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
          }

          set(() => ({
            ...initialState,
          }));

          logger.info('Client-side logout complete');
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
          const { isAuthenticated } = get();

          if (!isAuthenticated) {
            return; // Don't logout if not authenticated
          }

          try {
            // Token is in httpOnly cookie, automatically sent with credentials: 'include'
            const response = await fetch('/api/v1/auth/refresh', {
              method: 'POST',
              credentials: 'include', // IMPORTANT: Send cookies
            });

            // Only logout on 401 - other errors might be temporary
            if (response.status === 401) {
              logger.warn('Token refresh: 401 Unauthorized - logging out');
              await get().logout();
              throw new Error('Token expired');
            }

            if (!response.ok) {
              // Server error or network issue - don't logout
              logger.error(
                'Token refresh failed with status:',
                response.status
              );
              throw new Error('Token yenileme başarısız');
            }

            const result = await response.json();
            const { user } = result.data;
            // New token is set in httpOnly cookie by backend

            set((draft) => {
              draft.user = user;
              // draft.token removed - now in httpOnly cookie
              draft.lastActivity = Date.now();
            });

            logger.info('Token refreshed - new cookie set by backend');
          } catch (error) {
            logger.error(
              'Token refresh failed',
              error instanceof Error ? error : new Error(String(error))
            );
            // Don't always logout - only on 401 (handled above)
            throw error;
          }
        },

        // Check auth status
        checkAuthStatus: async () => {
          const { sessionExpiry, isAuthenticated } = get();

          if (!isAuthenticated) {
            return; // Don't logout if not authenticated
          }

          // Check session expiry
          if (sessionExpiry && Date.now() > sessionExpiry) {
            await get().logout();
            return;
          }

          try {
            // Verify with backend using cookie
            const response = await fetch('/api/v1/auth/me', {
              credentials: 'include', // IMPORTANT: Send cookies
            });

            // Only logout on 401 Unauthorized - other errors might be temporary
            if (response.status === 401) {
              logger.warn('Auth check: 401 Unauthorized - logging out');
              await get().logout();
              return;
            }

            if (!response.ok) {
              // Network error or server error - don't logout, just log
              logger.error('Auth check failed with status:', response.status);
              return;
            }

            const result = await response.json();
            if (result.success && result.data) {
              set((draft) => {
                draft.user = result.data;
                draft.isAuthenticated = true;
                draft.lastActivity = Date.now();
              });
            } else {
              logger.warn('Auth check: Invalid response format');
            }
          } catch (error) {
            // Network error - don't logout, might be temporary
            logger.error(
              'Auth status check failed (network error)',
              error instanceof Error ? error : new Error(String(error))
            );
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
        // token removed - now stored ONLY in httpOnly cookies
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
