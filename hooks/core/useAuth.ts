/**
 * useAuth Hook - Re-export from production infrastructure
 *
 * Production Implementation:
 * - Use @/lib/core/store/domains/auth/unifiedAuthStore for client-side auth
 * - Use middleware.ts for server-side route protection
 * - Use @/lib/infrastructure/security/auth-utils for auth utilities
 *
 * @deprecated Use useAuthStore() from @/lib/core/store/domains/auth/unifiedAuthStore
 */

import type { UserResponse } from '@/types/backend-aligned';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';

export interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

export function useAuth(): AuthState {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
    register: async () => {},
  };
}
