'use client';

import { useEffect } from 'react';
import useAuthStore from '@/lib/store/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { refreshAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth on app load
    refreshAuth();
  }, [refreshAuth]);

  return <>{children}</>;
}
