'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { refreshAuth, isAuthenticated } = useAuthStore();
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

    // Note: Token management is now handled by httpOnly cookies on the backend
    // No need to manually manage cookies on the frontend
  }, [isAuthenticated, isMounted]);

  return <>{children}</>;
}
