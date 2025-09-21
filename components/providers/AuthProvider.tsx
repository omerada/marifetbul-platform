'use client';

import { useEffect, useState } from 'react';
import useAuthStore from '@/lib/core/store/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { refreshAuth, token, isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Initialize auth on app load only after mounted
    if (isMounted) {
      refreshAuth();
    }
  }, [refreshAuth, isMounted]);

  // Sync token with cookie for middleware
  useEffect(() => {
    if (!isMounted) return;

    if (isAuthenticated && token) {
      // Set cookie for middleware
      document.cookie = `marifetbul-auth-token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax; Secure=${location.protocol === 'https:'}`;
    } else {
      // Clear cookie when not authenticated
      document.cookie =
        'marifetbul-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }, [isAuthenticated, token, isMounted]);

  return <>{children}</>;
}
