/**
 * Authentication utility functions
 * Provides helper functions for auth operations across the application
 *
 * IMPORTANT: Uses Zustand store for synchronous access to cached auth state.
 * For fresh data from backend, use lib/shared/utils/auth.ts async functions.
 */

import { useUnifiedAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';

/**
 * Get current user ID from auth store (cached state)
 * Returns null if user is not authenticated
 *
 * Note: This returns cached state. For fresh backend data, use:
 * import { getCurrentUserId } from '@/lib/shared/utils/auth'
 */
export function getCurrentUserId(): string | null {
  return useUnifiedAuthStore.getState().getCurrentUserId();
}

/**
 * Get current user from auth store
 * Returns null if user is not authenticated
 */
export function getCurrentUser() {
  return useUnifiedAuthStore.getState().user;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return useUnifiedAuthStore.getState().isAuthenticated;
}

/**
 * Helper to ensure user is authenticated, throws error if not
 */
export function requireAuth(): string {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User must be authenticated to perform this action');
  }
  return userId;
}

/**
 * Helper to check if current user has specific role
 */
export function hasRole(role: 'freelancer' | 'employer' | 'admin'): boolean {
  const user = getCurrentUser();
  return user?.userType === role;
}

/**
 * Helper to check if current user is admin
 */
export function isAdmin(): boolean {
  return hasRole('admin');
}
