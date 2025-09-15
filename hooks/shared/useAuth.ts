// Authentication hooks
import { useState, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  userType: 'freelancer' | 'employer';
  role: 'freelancer' | 'employer' | 'admin';
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'freelancer' | 'employer';
}

export function useAuthState(): AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Mock login implementation
      const user: AuthUser = {
        id: '1',
        email: credentials.email,
        name: 'Test User',
        isVerified: true,
        userType: 'freelancer',
        role: 'freelancer',
      };

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Mock register implementation
      const user: AuthUser = {
        id: '1',
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        isVerified: false,
        userType: data.userType,
        role: data.userType,
      };

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const updateUser = useCallback((userData: Partial<AuthUser>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null,
    }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };
}

// Alias for convenience
export const useAuth = useAuthState;
