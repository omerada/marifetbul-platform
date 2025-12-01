/**
 * useAuth Hook - Stub Implementation
 * TODO: Implement full auth context hook
 * Currently returns minimal auth state to satisfy build requirements
 */

import type { UserResponse } from '@/types/backend-aligned';

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
