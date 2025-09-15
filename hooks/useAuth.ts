/**
 * Authentication hook
 * Provides authentication state and methods
 */

'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth';

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

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
  } = useAuthStore();

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        clearError();
        await login(credentials);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Login failed',
        };
      }
    },
    [login, clearError]
  );

  const handleRegister = useCallback(
    async (data: RegisterData) => {
      try {
        clearError();
        await register(data);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Registration failed',
        };
      }
    },
    [register, clearError]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }, [logout]);

  const handleRefreshToken = useCallback(async () => {
    try {
      await refreshAuth();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      };
    }
  }, [refreshAuth]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    clearError,

    // Computed values
    isGuest: !isAuthenticated,
    isAdmin: user?.role === 'admin',
    isFreelancer: user?.role === 'freelancer',
    isEmployer: user?.role === 'employer',
  };
}

export default useAuth;
