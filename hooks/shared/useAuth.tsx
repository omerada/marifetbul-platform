import { useMemo, useCallback } from 'react';
import useAuthStore from '@/lib/store/auth';
import type { User } from '@/types';

// ================================================
// UNIFIED AUTH HOOKS - CLEANED AND OPTIMIZED
// ================================================

// ================================================
// PRIMARY AUTH HOOK - MOST COMMONLY USED
// ================================================

/**
 * Main authentication hook - provides both state and actions
 * Use this in most components unless you need separated concerns
 */
export function useAuth() {
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

  // Optimized actions with useCallback
  const login = useCallback(
    async (credentials: {
      email: string;
      password: string;
      rememberMe?: boolean;
    }) => {
      return store.login(credentials);
    },
    [store]
  );

  const logout = useCallback(() => {
    store.logout();
  }, [store]);

  const register = useCallback(
    async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      userType: 'employer' | 'freelancer';
    }) => {
      return store.register(userData);
    },
    [store]
  );

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      store.updateUser(updates);
      return store.user;
    },
    [store]
  );

  return {
    // Raw state from store
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,

    // Role checks (memoized)
    isEmployer,
    isFreelancer,
    isAdmin,

    // Display properties (memoized)
    displayName,
    avatarUrl,
    initials,

    // Actions (memoized callbacks)
    login,
    logout,
    register,
    updateProfile,
  };
}

// ================================================
// SEPARATED HOOKS FOR ADVANCED USE CASES
// ================================================

/**
 * Read-only auth state hook
 * Use when you only need to read auth state without actions
 */
export function useAuthState() {
  const auth = useAuth();

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    isEmployer: auth.isEmployer,
    isFreelancer: auth.isFreelancer,
    isAdmin: auth.isAdmin,
    displayName: auth.displayName,
    avatarUrl: auth.avatarUrl,
    initials: auth.initials,
  };
}

/**
 * Auth actions hook
 * Use when you only need auth actions without state
 */
export function useAuthActions() {
  const auth = useAuth();

  return {
    login: auth.login,
    logout: auth.logout,
    register: auth.register,
    updateProfile: auth.updateProfile,
  };
}

/**
 * Current user hook
 * Use when you only need the current user data
 */
export function useCurrentUser() {
  const auth = useAuth();

  return {
    data: auth.user,
    isLoading: auth.isLoading,
    error: auth.error,
    refetch: () => {
      // Could implement user data refresh here
      return Promise.resolve(auth.user);
    },
  };
}

// ================================================
// ROLE-SPECIFIC HOOKS
// ================================================

/**
 * Hook for employer-specific functionality
 */
export function useEmployer() {
  const auth = useAuth();

  if (!auth.isEmployer) {
    throw new Error('useEmployer can only be used by employers');
  }

  return auth;
}

/**
 * Hook for freelancer-specific functionality
 */
export function useFreelancer() {
  const auth = useAuth();

  if (!auth.isFreelancer) {
    throw new Error('useFreelancer can only be used by freelancers');
  }

  return auth;
}

/**
 * Hook for admin-specific functionality
 */
export function useAdmin() {
  const auth = useAuth();

  if (!auth.isAdmin) {
    throw new Error('useAdmin can only be used by admins');
  }

  return auth;
}

// ================================================
// LEGACY COMPATIBILITY
// ================================================

// Re-export main hook with different names for backward compatibility
export { useAuth as useAuthHook };
export { useAuthState as useAuthStateOnly };
export { useAuthActions as useAuthActionsOnly };

// ================================================
// DEFAULT EXPORT
// ================================================

export default useAuth;
