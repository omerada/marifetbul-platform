'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { usePathname } from 'next/navigation';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, checkAuthStatus } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Prevent hydration mismatch and rehydrate store
  useEffect(() => {
    setIsMounted(true);
    // Rehydrate the persisted auth store from localStorage
    useAuthStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    // Only check auth status if:
    // 1. Component is mounted
    // 2. User is already authenticated (has token in localStorage)
    // 3. Not on login/register pages
    if (!isMounted) return;

    const isAuthPage =
      pathname?.includes('/login') || pathname?.includes('/register');

    // Only verify auth status if already authenticated, don't refresh on auth pages
    if (isAuthenticated && !isAuthPage) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[AuthProvider] Checking auth status for authenticated user'
        );
      }
      checkAuthStatus().catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[AuthProvider] Auth status check failed:', error);
        }
        // Don't logout on auth pages - let them try to login
      });
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AuthProvider] Skipping auth check', {
          isMounted,
          isAuthenticated,
          isAuthPage,
          pathname,
        });
      }
    }
  }, [isMounted, isAuthenticated, pathname, checkAuthStatus]);

  return <>{children}</>;
}
