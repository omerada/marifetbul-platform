/**
 * ============================================================================
 * UNIFIED AUTH STORE - Clean & Production-Ready
 * ============================================================================
 * Centralized authentication state management using unified auth service
 *
 * Features:
 * - Uses unifiedAuthService for all API calls
 * - Integrated session management
 * - Clean error handling
 * - Type-safe state mutations
 * - Persisted state (user data only, not tokens)
 *
 * @version 3.0.0 - Unified Store
 * @author MarifetBul Development Team
 * @created November 5, 2025
 * @sprint Sprint 1 - Authentication System
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { User } from '@/types';
import type { UserResponse } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';
import { unifiedAuthService } from '@/lib/core/auth/unifiedAuthService';
import { sessionManager } from '@/lib/core/auth/sessionManager';
import type {
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from '@/lib/core/auth/unifiedAuthService';

// ============================================================================
// HELPER: Convert Backend UserResponse to Frontend User
// ============================================================================

function convertUserResponseToUser(userResponse: UserResponse): User {
  // Map backend UserRole to frontend userType
  const userType: 'freelancer' | 'employer' | 'admin' =
    userResponse.accountType === 'FREELANCER'
      ? 'freelancer'
      : userResponse.accountType === 'EMPLOYER'
        ? 'employer'
        : userResponse.roles.includes('ADMIN')
          ? 'admin'
          : 'freelancer';

  return {
    id: userResponse.id,
    email: userResponse.email,
    username: userResponse.username,
    firstName: userResponse.firstName,
    lastName: userResponse.lastName,
    fullName: userResponse.fullName,
    name: userResponse.fullName,
    avatar: userResponse.avatar,
    avatarUrl: userResponse.avatar,
    userType,
    role: userResponse.roles[0] as
      | 'FREELANCER'
      | 'EMPLOYER'
      | 'ADMIN'
      | 'MODERATOR',
    createdAt: userResponse.createdAt,
    updatedAt: userResponse.updatedAt,
    verificationStatus: userResponse.isEmailVerified
      ? 'verified'
      : 'unverified',
    accountStatus: 'active', // Backend doesn't provide this yet
  };
}

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AuthState {
  // User data
  user: User | null;
  isAuthenticated: boolean;

  // Loading & error states
  isLoading: boolean;
  error: string | null;

  // Session state (computed from sessionManager)
  sessionExpiry: number | null;
}

interface AuthActions {
  // Authentication
  login: (
    credentials: Omit<LoginRequest, 'usernameOrEmail'> & {
      email: string;
      twoFactorCode?: string; // Support 2FA code
    }
  ) => Promise<{
    twoFactorRequired?: boolean;
    success?: boolean;
    message?: string;
  } | void>;
  register: (
    data: Omit<RegisterRequest, 'role'> & {
      userType: 'freelancer' | 'employer';
    }
  ) => Promise<void>;
  logout: () => Promise<void>;

  // User management
  updateUser: (userData: Partial<User>) => void;
  updateProfile: (updates: UpdateProfileRequest) => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;

  // Utilities
  clearError: () => void;
  getCurrentUserId: () => string | null;
  isSessionValid: () => boolean;
  extendSession: () => void;
}

type UnifiedAuthStore = AuthState & AuthActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessionExpiry: null,
};

// ============================================================================
// UNIFIED AUTH STORE
// ============================================================================

export const useUnifiedAuthStore = create<UnifiedAuthStore>()(
  persist(
    devtools(
      immer((set, get) => ({
        ...initialState,

        // ====================================================================
        // AUTHENTICATION ACTIONS
        // ====================================================================

        /**
         * Login user
         * Returns response with twoFactorRequired flag if 2FA is needed
         */
        login: async (credentials) => {
          logger.info('AuthStore: Login attempt', { email: credentials.email });

          set((draft) => {
            draft.isLoading = true;
            draft.error = null;
          });

          try {
            const response = await unifiedAuthService.login({
              usernameOrEmail: credentials.email,
              password: credentials.password,
              rememberMe: credentials.rememberMe,
              twoFactorCode: credentials.twoFactorCode, // Pass 2FA code if provided
            });

            if (!response.success || !response.data) {
              set((draft) => {
                draft.isLoading = false;
                draft.error = response.message || 'Login failed';
              });
              return { success: false, message: response.message };
            }

            // Check if 2FA is required
            if (response.data.twoFactorRequired) {
              logger.info('AuthStore: 2FA required');
              set((draft) => {
                draft.isLoading = false;
              });
              return { twoFactorRequired: true };
            }

            // Normal login success (no 2FA or 2FA verified)
            const { user, expiresIn } = response.data;

            // Calculate token expiry
            const tokenExpiry = expiresIn
              ? Date.now() + expiresIn * 1000
              : null;

            // Convert backend UserResponse to frontend User
            const convertedUser = convertUserResponseToUser(user);

            set((draft) => {
              draft.user = convertedUser;
              draft.isAuthenticated = true;
              draft.isLoading = false;
              draft.error = null;
              draft.sessionExpiry = tokenExpiry;
            });

            // Initialize session manager
            if (tokenExpiry) {
              sessionManager.initialize(tokenExpiry, {
                onSessionExpired: () => {
                  logger.warn('AuthStore: Session expired, logging out');
                  get().logout();
                },
                onSessionWarning: (remainingMinutes) => {
                  logger.warn('AuthStore: Session expiring soon', {
                    remainingMinutes,
                  });
                  // You can show a warning modal here
                },
                onTokenRefreshed: () => {
                  logger.info('AuthStore: Token refreshed automatically');
                  get().refreshAuth();
                },
              });
            }

            logger.info('AuthStore: Login successful', { userId: user.id });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'An error occurred during login';

            set((draft) => {
              draft.isLoading = false;
              draft.error = errorMessage;
            });

            logger.error('AuthStore: Login failed', error as Error);
            throw error;
          }
        },

        /**
         * Register new user
         */
        register: async (data) => {
          logger.info('AuthStore: Registration attempt', { email: data.email });

          set((draft) => {
            draft.isLoading = true;
            draft.error = null;
          });

          try {
            const response = await unifiedAuthService.register({
              email: data.email,
              username: data.username,
              password: data.password,
              firstName: data.firstName,
              lastName: data.lastName,
              role: data.userType === 'freelancer' ? 'FREELANCER' : 'EMPLOYER',
            });

            if (!response.success || !response.data) {
              throw new Error(response.message || 'Registration failed');
            }

            const { user, expiresIn } = response.data;
            const tokenExpiry = expiresIn
              ? Date.now() + expiresIn * 1000
              : null;

            // Convert backend UserResponse to frontend User
            const convertedUser = convertUserResponseToUser(user);

            set((draft) => {
              draft.user = convertedUser;
              draft.isAuthenticated = true;
              draft.isLoading = false;
              draft.error = null;
              draft.sessionExpiry = tokenExpiry;
            });

            // Initialize session manager
            if (tokenExpiry) {
              sessionManager.initialize(tokenExpiry, {
                onSessionExpired: () => get().logout(),
                onTokenRefreshed: () => get().refreshAuth(),
              });
            }

            logger.info('AuthStore: Registration successful', {
              userId: user.id,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'An error occurred during registration';

            set((draft) => {
              draft.isLoading = false;
              draft.error = errorMessage;
            });

            logger.error('AuthStore: Registration failed', error as Error);
            throw error;
          }
        },

        /**
         * Logout user
         */
        logout: async () => {
          logger.info('AuthStore: Logout initiated');

          try {
            await unifiedAuthService.logout();
          } catch (error) {
            logger.error('AuthStore: Logout API call failed', error as Error);
            // Continue with local cleanup even if API call fails
          }

          // Destroy session manager
          sessionManager.destroy();

          // Clear state
          set(() => ({
            ...initialState,
          }));

          logger.info('AuthStore: Logout completed');
        },

        // ====================================================================
        // USER MANAGEMENT
        // ====================================================================

        /**
         * Update user data locally (optimistic update)
         */
        updateUser: (userData) => {
          set((draft) => {
            if (draft.user) {
              Object.assign(draft.user, userData);
            }
          });
        },

        /**
         * Update user profile on server
         */
        updateProfile: async (updates) => {
          logger.info('AuthStore: Updating profile');

          set((draft) => {
            draft.isLoading = true;
            draft.error = null;
          });

          try {
            const response = await unifiedAuthService.updateProfile(updates);

            if (!response.success || !response.data) {
              throw new Error(response.message || 'Profile update failed');
            }

            set((draft) => {
              draft.user = convertUserResponseToUser(response.data);
              draft.isLoading = false;
            });

            logger.info('AuthStore: Profile updated successfully');
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to update profile';

            set((draft) => {
              draft.isLoading = false;
              draft.error = errorMessage;
            });

            logger.error('AuthStore: Profile update failed', error as Error);
            throw error;
          }
        },

        /**
         * Refresh auth state from server
         */
        refreshAuth: async () => {
          logger.debug('AuthStore: Refreshing auth state');

          try {
            const response = await unifiedAuthService.getCurrentUser();

            if (response.success && response.data) {
              set((draft) => {
                draft.user = convertUserResponseToUser(response.data);
                draft.isAuthenticated = true;
              });

              logger.debug('AuthStore: Auth state refreshed');
            }
          } catch (error) {
            logger.error(
              'AuthStore: Failed to refresh auth state',
              error as Error
            );
            // Don't throw - silent refresh failure
          }
        },

        /**
         * Check authentication status
         */
        checkAuthStatus: async () => {
          logger.debug('AuthStore: Checking auth status');

          set((draft) => {
            draft.isLoading = true;
          });

          try {
            const response = await unifiedAuthService.getCurrentUser();

            if (response.success && response.data) {
              set((draft) => {
                draft.user = convertUserResponseToUser(response.data);
                draft.isAuthenticated = true;
                draft.isLoading = false;
              });

              logger.debug('AuthStore: User is authenticated');
            } else {
              set((draft) => {
                draft.user = null;
                draft.isAuthenticated = false;
                draft.isLoading = false;
              });

              logger.debug('AuthStore: User is not authenticated');
            }
          } catch (error) {
            set((draft) => {
              draft.user = null;
              draft.isAuthenticated = false;
              draft.isLoading = false;
            });

            logger.error('AuthStore: Auth check failed', error as Error);
          }
        },

        // ====================================================================
        // UTILITIES
        // ====================================================================

        /**
         * Clear error state
         */
        clearError: () => {
          set((draft) => {
            draft.error = null;
          });
        },

        /**
         * Get current user ID
         */
        getCurrentUserId: () => {
          return get().user?.id || null;
        },

        /**
         * Check if session is valid
         */
        isSessionValid: () => {
          return sessionManager.isSessionValid();
        },

        /**
         * Extend session manually
         */
        extendSession: () => {
          sessionManager.extendSession();
        },
      })),
      {
        name: 'unified-auth-store',
      }
    ),
    {
      name: 'unified-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user data, not tokens or loading states
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ============================================================================
// SELECTORS (Optimized)
// ============================================================================

export const authSelectors = {
  useUser: () => useUnifiedAuthStore((state) => state.user),
  useIsAuthenticated: () =>
    useUnifiedAuthStore((state) => state.isAuthenticated),
  useIsLoading: () => useUnifiedAuthStore((state) => state.isLoading),
  useError: () => useUnifiedAuthStore((state) => state.error),
  useUserId: () => useUnifiedAuthStore((state) => state.user?.id || null),

  useAuthStatus: () =>
    useUnifiedAuthStore((state) => ({
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
    })),

  useActions: () =>
    useUnifiedAuthStore((state) => ({
      login: state.login,
      register: state.register,
      logout: state.logout,
      updateProfile: state.updateProfile,
      refreshAuth: state.refreshAuth,
      clearError: state.clearError,
      extendSession: state.extendSession,
    })),
};

// ============================================================================
// EXPORTS
// ============================================================================

export default useUnifiedAuthStore;

// Export for backward compatibility
export { useUnifiedAuthStore as useAuthStore };
