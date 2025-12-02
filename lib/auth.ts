/**
 * Auth Utilities - Re-export from production infrastructure
 * Use lib/infrastructure/security/auth-utils.ts for auth utilities
 * Use lib/core/store/domains/auth/unifiedAuthStore.ts for auth state
 *
 * Note: This file maintained for backward compatibility during migration
 * Prefer using proper auth infrastructure directly
 */
export const auth = {
  getToken: () => null,
  setToken: (token: string) => {},
  removeToken: () => {},
  isAuthenticated: () => false,
};

// Server-side auth handled by middleware.ts
// Admin routes are protected via middleware and role-based checks
export const getServerSession = async () => null;
