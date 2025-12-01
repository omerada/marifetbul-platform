'use client';

/**
 * ============================================================================
 * SESSION PROVIDER - Centralized Session Management for App
 * ============================================================================
 * Wraps app with session management logic, handles all UI interactions
 *
 * Features:
 * - Automatic session monitoring
 * - Session timeout modal display
 * - Toast notifications for warnings
 * - Auto-logout on expiry
 * - Activity tracking integration
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 5, 2025
 * @sprint Sprint 1.2 - Session Management UI
 */

'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authSelectors } from '@/lib/core/auth';
import { useUnifiedAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { sessionManager } from '@/lib/core/auth/sessionManager';
import { useSession } from '@/hooks/core/useSession';
import { SessionTimeoutModal } from '@/components/shared/SessionTimeoutModal';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

interface SessionProviderProps {
  children: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Session Provider - Manages session UI across the app
 *
 * Add this to your app layout after authentication:
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AuthProvider>
 *           <SessionProvider>
 *             {children}
 *           </SessionProvider>
 *         </AuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}) => {
  const router = useRouter();
  const isAuthenticated = authSelectors.useIsAuthenticated();

  // ⚠️ CRITICAL FIX: Use direct store access instead of useActions selector
  // useActions creates new object on every render, causing infinite loop
  const logoutRef = useRef(useUnifiedAuthStore.getState().logout);
  const routerRef = useRef(router);

  // Update refs when values change (but don't trigger re-renders)
  useEffect(() => {
    routerRef.current = router;
    logoutRef.current = useUnifiedAuthStore.getState().logout;
  }, [router]);

  const { isSessionActive, remainingMinutes, remainingSeconds, extendSession } =
    useSession();

  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [hasShown5MinWarning, setHasShown5MinWarning] = useState(false);
  const [hasShown2MinWarning, setHasShown2MinWarning] = useState(false);
  const [hasShown1MinWarning, setHasShown1MinWarning] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle logout
   */
  const handleLogout = useCallback(async () => {
    try {
      logger.info('SessionProvider: User initiated logout from timeout modal');
      setShowTimeoutModal(false);

      await logoutRef.current();

      toast.info('Çıkış yapıldı', {
        description: 'Oturumunuz güvenli bir şekilde sonlandırıldı.',
      });

      routerRef.current.push('/login');
    } catch (error) {
      logger.error('SessionProvider: Logout failed', error as Error);
      toast.error('Çıkış yapılırken bir hata oluştu');
    }
  }, []);

  /**
   * Handle session extension
   */
  const handleExtendSession = useCallback(() => {
    logger.info('SessionProvider: User extended session');

    extendSession();
    setShowTimeoutModal(false);

    // Reset warning flags
    setHasShown5MinWarning(false);
    setHasShown2MinWarning(false);
    setHasShown1MinWarning(false);

    toast.success('Oturum uzatıldı', {
      description: 'Oturumunuz başarıyla uzatıldı.',
      duration: 3000,
    });
  }, [extendSession]);

  /**
   * Handle session expiry (auto-logout)
   */
  const handleSessionExpired = useCallback(async () => {
    logger.warn('SessionProvider: Session expired, initiating logout');

    setShowTimeoutModal(false);

    toast.error('Oturum süresi doldu', {
      description: 'Güvenliğiniz için oturumunuz sonlandırıldı.',
      duration: 5000,
    });

    try {
      await logoutRef.current();
    } catch (error) {
      logger.error('SessionProvider: Logout on expiry failed', error as Error);
    }

    // Redirect after logout completes
    routerRef.current.push('/login?reason=session_expired');
  }, []);

  // ============================================================================
  // SESSION INITIALIZATION
  // ============================================================================

  /**
   * Initialize session manager callbacks when user logs in
   */
  useEffect(() => {
    // Only run if authenticated and session is active
    if (!isAuthenticated || !isSessionActive) {
      return;
    }

    logger.debug('SessionProvider: Initializing session monitoring');

    let hasExpired = false;

    // Check for expiry periodically
    const checkInterval = setInterval(() => {
      const state = sessionManager.getState();

      if (!state.isActive && !hasExpired) {
        hasExpired = true;
        logger.warn('SessionProvider: Session detected as expired');
        handleSessionExpired();
      }
    }, 10000); // Check every 10 seconds (less aggressive)

    return () => {
      clearInterval(checkInterval);
    };
  }, [isAuthenticated, isSessionActive, handleSessionExpired]);

  // ============================================================================
  // WARNING TOASTS
  // ============================================================================

  /**
   * Show warning toasts at specific intervals
   */
  useEffect(() => {
    if (!isAuthenticated || !isSessionActive || remainingMinutes === null) {
      return;
    }

    // 5 minute warning - Show modal
    if (remainingMinutes <= 4 && remainingMinutes > 3 && !hasShown5MinWarning) {
      logger.info('SessionProvider: 5 minute warning triggered');
      setHasShown5MinWarning(true);
      setShowTimeoutModal(true);

      toast.warning('Oturum süresi dolmak üzere', {
        description: 'Oturumunuz 5 dakika içinde sona erecek.',
        duration: 5000,
      });
    }

    // 2 minute warning
    if (remainingMinutes <= 1 && remainingMinutes > 0 && !hasShown2MinWarning) {
      logger.info('SessionProvider: 2 minute warning triggered');
      setHasShown2MinWarning(true);

      toast.warning('Oturum süresi dolmak üzere', {
        description: 'Oturumunuz 2 dakika içinde sona erecek.',
        duration: 4000,
      });
    }

    // 1 minute warning - Critical
    if (
      remainingMinutes === 0 &&
      remainingSeconds !== null &&
      remainingSeconds <= 60 &&
      remainingSeconds > 30 &&
      !hasShown1MinWarning
    ) {
      logger.warn('SessionProvider: 1 minute warning triggered');
      setHasShown1MinWarning(true);

      toast.error('Oturum süresi dolmak üzere!', {
        description: 'Oturumunuz 1 dakika içinde sona erecek!',
        duration: 60000, // Keep visible
      });
    }
  }, [
    isAuthenticated,
    isSessionActive,
    remainingMinutes,
    hasShown5MinWarning,
    hasShown2MinWarning,
    hasShown1MinWarning,
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  // Only show session UI if user is authenticated
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {/* Session Timeout Modal - Only show when authenticated */}
      {isSessionActive && remainingSeconds !== null && (
        <SessionTimeoutModal
          isOpen={showTimeoutModal}
          remainingSeconds={remainingSeconds}
          onExtend={handleExtendSession}
          onLogout={handleLogout}
          onClose={() => setShowTimeoutModal(false)}
        />
      )}
    </>
  );
};

// ============================================================================
// COMPONENT DISPLAY NAME
// ============================================================================

SessionProvider.displayName = 'SessionProvider';

// ============================================================================
// EXPORTS
// ============================================================================

export default SessionProvider;
