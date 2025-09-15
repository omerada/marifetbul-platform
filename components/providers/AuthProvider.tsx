'use client';

import { useEffect } from 'react';
import useAuthStore from '@/lib/core/store/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { refreshAuth, token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initialize auth on app load
    refreshAuth();
  }, [refreshAuth]);

  // Sync token with cookie for middleware
  useEffect(() => {
    if (isAuthenticated && token) {
      // Set cookie for middleware
      document.cookie = `marifeto-auth-token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    } else {
      // Clear cookie when not authenticated
      document.cookie =
        'marifeto-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }, [isAuthenticated, token]);

  return <>{children}</>;
}
