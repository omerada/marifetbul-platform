/**
 * Authentication utility functions
 * Provides helper functions for auth operations across the application
 */

import useAuthStore from '@/lib/store/auth';

/**
 * Get current user ID from auth store
 * Returns null if user is not authenticated
 */
export function getCurrentUserId(): string | null {
  return useAuthStore.getState().getCurrentUserId();
}

/**
 * Get current user from auth store
 * Returns null if user is not authenticated
 */
export function getCurrentUser() {
  return useAuthStore.getState().user;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated;
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
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
