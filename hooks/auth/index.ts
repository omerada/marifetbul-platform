// ================================================
// REFACTORED AUTH HOOKS - RESPONSIBILITY SEPARATION
// ================================================
// Separated concerns for authentication functionality

import { useMemo, useCallback } from 'react';
import useAuthStore from '@/lib/store/auth';
import { createDataHook, createMutationHook } from '../base/patterns';
import { apiClient } from '@/lib/api/UnifiedApiClient';
import type { User } from '@/types';

// ================================================
// AUTHENTICATION TYPES
// ================================================

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'employer' | 'freelancer';
}

// ================================================
// AUTHENTICATION STATE HOOK - READ ONLY
// ================================================

/**
 * Hook for accessing authentication state (read-only)
 * Responsibility: Provide current auth state without mutations
 */
export function useAuthState() {
  const store = useAuthStore();

  // Computed values for user roles
  const isEmployer = useMemo(
    () => store.user?.userType === 'employer',
    [store.user]
  );

  const isFreelancer = useMemo(
    () => store.user?.userType === 'freelancer',
    [store.user]
  );

  const isAdmin = useMemo(() => store.user?.role === 'admin', [store.user]);

  // User display properties
  const displayName = useMemo(() => {
    if (!store.user) return '';
    return `${store.user.firstName} ${store.user.lastName}`.trim();
  }, [store.user]);

  const avatarUrl = useMemo(() => {
    if (store.user?.avatar) return store.user.avatar;
    const userType = store.user?.userType || 'user';
    return `/avatars/default-${userType}.svg`;
  }, [store.user]);

  const initials = useMemo(() => {
    if (!store.user) return '';
    const first = store.user.firstName?.[0] || '';
    const last = store.user.lastName?.[0] || '';
    return (first + last).toUpperCase();
  }, [store.user]);

  return {
    // Raw state
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,

    // Role checks
    isEmployer,
    isFreelancer,
    isAdmin,

    // Display properties
    displayName,
    avatarUrl,
    initials,
  };
}

// ================================================
// AUTHENTICATION ACTIONS HOOK - MUTATIONS ONLY
// ================================================

/**
 * Hook for authentication actions (mutations)
 * Responsibility: Handle auth mutations (login, logout, register)
 */
export function useAuthActions() {
  const store = useAuthStore();

  const loginMutation = createMutationHook(
    async (credentials: LoginCredentials) => {
      const response = await apiClient.post<{ user: User; token: string }>(
        '/auth/login',
        credentials
      );

      // Update auth store
      store.loginWithToken(response.user, response.token);

      return response;
    },
    {
      onSuccess: (data: { user: User; token: string }) => {
        console.log('Login successful:', data.user.email);
      },
      onError: (error: Error) => {
        console.error('Login failed:', error.message);
      },
    }
  );

  const registerMutation = createMutationHook(
    async (credentials: RegisterCredentials) => {
      const response = await apiClient.post<{ user: User; token: string }>(
        '/auth/register',
        credentials
      );

      // Update auth store
      store.loginWithToken(response.user, response.token);

      return response;
    },
    {
      onSuccess: (data: { user: User; token: string }) => {
        console.log('Registration successful:', data.user.email);
      },
      onError: (error: Error) => {
        console.error('Registration failed:', error.message);
      },
    }
  );

  const logoutMutation = createMutationHook(
    async () => {
      await apiClient.post('/auth/logout');

      // Clear auth store
      store.logout();

      return true;
    },
    {
      onSuccess: () => {
        console.log('Logout successful');
      },
      onError: (error: Error) => {
        console.error('Logout failed:', error.message);
        // Even if logout fails on server, clear local state
        store.logout();
      },
    }
  );

  const refreshTokenMutation = createMutationHook(
    async () => {
      const response = await apiClient.post<{ user: User; token: string }>(
        '/auth/refresh'
      );

      // Update auth store
      store.loginWithToken(response.user, response.token);

      return response;
    },
    {
      onError: (error: Error) => {
        console.error('Token refresh failed:', error.message);
        // If refresh fails, logout user
        store.logout();
      },
    }
  );

  return {
    login: loginMutation(),
    register: registerMutation(),
    logout: logoutMutation(),
    refreshToken: refreshTokenMutation(),
  };
}

// ================================================
// CURRENT USER DATA HOOK - DATA FETCHING
// ================================================

/**
 * Hook for fetching current user profile data
 * Responsibility: Fetch and cache user profile information
 */
export function useCurrentUser() {
  const { user, isAuthenticated } = useAuthState();

  const currentUserData = createDataHook(
    async () => {
      if (!user?.id) throw new Error('User not authenticated');

      return await apiClient.get<User>(`/users/${user.id}`);
    },
    {
      enabled: isAuthenticated && !!user?.id,
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    }
  );

  return currentUserData();
}

// ================================================
// PERMISSIONS HOOK - BUSINESS LOGIC
// ================================================

/**
 * Hook for checking user permissions
 * Responsibility: Handle permission and role-based access logic
 */
export function usePermissions() {
  const { user, isAuthenticated, isEmployer, isFreelancer, isAdmin } =
    useAuthState();

  const hasRole = useCallback(
    (role: User['role']) => {
      return isAuthenticated && user?.role === role;
    },
    [isAuthenticated, user?.role]
  );

  const hasUserType = useCallback(
    (userType: User['userType']) => {
      return isAuthenticated && user?.userType === userType;
    },
    [isAuthenticated, user?.userType]
  );

  const canAccess = useCallback(
    (permission: string) => {
      if (!isAuthenticated) return false;

      switch (permission) {
        case 'admin':
          return isAdmin;
        case 'create_job':
          return isEmployer || isAdmin;
        case 'create_package':
          return isFreelancer || isAdmin;
        case 'view_analytics':
          return isAdmin;
        case 'manage_users':
          return isAdmin;
        case 'moderate_content':
          return isAdmin;
        case 'edit_profile':
          return isAuthenticated;
        case 'send_messages':
          return isAuthenticated;
        default:
          return false;
      }
    },
    [isAuthenticated, isEmployer, isFreelancer, isAdmin]
  );

  const isOwnProfile = useCallback(
    (profileUserId: string) => {
      return isAuthenticated && user?.id === profileUserId;
    },
    [isAuthenticated, user?.id]
  );

  return {
    hasRole,
    hasUserType,
    canAccess,
    isOwnProfile,

    // Convenience computed values
    canCreateJob: canAccess('create_job'),
    canCreatePackage: canAccess('create_package'),
    canModerate: canAccess('moderate_content'),
    canManageUsers: canAccess('manage_users'),
  };
}

// ================================================
// LEGACY COMPATIBILITY HOOK
// ================================================

/**
 * Legacy useAuth hook for backward compatibility
 * Combines all auth functionality for existing components
 */
export function useAuth() {
  const authState = useAuthState();
  const authActions = useAuthActions();
  const permissions = usePermissions();

  return {
    // State (legacy compatibility)
    ...authState,

    // Actions (legacy compatibility)
    login: authActions.login.mutate,
    register: authActions.register.mutate,
    logout: authActions.logout.mutate,
    refreshToken: authActions.refreshToken.mutate,

    // Loading states
    isLoggingIn: authActions.login.isLoading,
    isRegistering: authActions.register.isLoading,
    isLoggingOut: authActions.logout.isLoading,

    // Permissions (legacy compatibility)
    ...permissions,
  };
}

// ================================================
// HOOK EXPORTS WITH CLEAR RESPONSIBILITIES
// ================================================

export const AuthHooks = {
  // State management
  useAuthState,

  // Actions/Mutations
  useAuthActions,

  // Data fetching
  useCurrentUser,

  // Business logic
  usePermissions,

  // Legacy compatibility
  useAuth,
};

export default AuthHooks;
