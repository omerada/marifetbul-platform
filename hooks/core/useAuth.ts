/**
 * useAuth Hook - Stub Implementation
 * TODO: Implement full auth context hook
 * Currently returns minimal auth state to satisfy build requirements
 */

export function useAuth() {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
    register: async () => {},
  };
}
