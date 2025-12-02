'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { usePathname } from 'next/navigation';
import logger from '@/lib/infrastructure/monitoring/logger';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, user, checkAuthStatus } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
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
    // 2. Haven't checked yet (prevent infinite loop)
    // 3. User is authenticated in store (has persisted state)
    // 4. Not on auth pages (login/register)
    if (!isMounted || hasChecked) return;

    const isAuthPage =
      pathname?.includes('/login') || pathname?.includes('/register');

    // Skip auth check on auth pages
    if (isAuthPage) {
      logger.debug('[AuthProvider] Skipping auth check on auth page', {
        pathname,
      });
      setHasChecked(true);
      return;
    }

    // Only verify auth if user is authenticated in store (has persisted session)
    if (isAuthenticated && user) {
      logger.debug('[AuthProvider] Verifying persisted session');
      setHasChecked(true);

      checkAuthStatus().catch((error) => {
        logger.warn('[AuthProvider] Session verification failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        // Session is invalid, user will be logged out by the store
      });
    } else {
      logger.debug('[AuthProvider] No persisted session to verify');
      setHasChecked(true);
    }
    // checkAuthStatus is stable from zustand, no need to include in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, isAuthenticated, user, pathname]);

  return <>{children}</>;
}
