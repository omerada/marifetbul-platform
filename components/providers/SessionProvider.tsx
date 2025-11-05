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

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authSelectors } from '@/lib/core/auth';
import { sessionManager } from '@/lib/core/auth/sessionManager';
import { useSession } from '@/hooks/core/useSession';
import { SessionTimeoutModal } from '@/components/shared/SessionTimeoutModal';
import { logger } from '@/lib/shared/utils/logger';

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
  const { logout } = authSelectors.useActions();

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

      await logout();

      toast.info('Çıkış yapıldı', {
        description: 'Oturumunuz güvenli bir şekilde sonlandırıldı.',
      });

      router.push('/login');
    } catch (error) {
      logger.error('SessionProvider: Logout failed', error as Error);
      toast.error('Çıkış yapılırken bir hata oluştu');
    }
  }, [logout, router]);

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
    logger.warn('SessionProvider: Session expired, forcing logout');

    setShowTimeoutModal(false);

    toast.error('Oturum süresi doldu', {
      description: 'Güvenliğiniz için oturumunuz sonlandırıldı.',
      duration: 5000,
    });

    await logout();
    router.push('/login?reason=session_expired');
  }, [logout, router]);

  // ============================================================================
  // SESSION INITIALIZATION
  // ============================================================================

  /**
   * Initialize session manager callbacks when user logs in
   */
  useEffect(() => {
    if (!isAuthenticated || !isSessionActive) return;

    logger.debug('SessionProvider: Initializing session callbacks');

    // Note: sessionManager is already initialized by unifiedAuthStore
    // We just need to monitor state and show UI

    // Check for expiry periodically
    const checkInterval = setInterval(() => {
      const state = sessionManager.getState();

      if (!state.isActive) {
        handleSessionExpired();
      }
    }, 5000); // Check every 5 seconds

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
    if (remainingMinutes === 4 && !hasShown5MinWarning) {
      logger.info('SessionProvider: 5 minute warning triggered');
      setHasShown5MinWarning(true);
      setShowTimeoutModal(true);

      toast.warning('Oturum süresi dolmak üzere', {
        description: 'Oturumunuz 5 dakika içinde sona erecek.',
        duration: 5000,
      });
    }

    // 2 minute warning
    if (remainingMinutes === 1 && !hasShown2MinWarning) {
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
    remainingSeconds,
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

      {/* Session Timeout Modal */}
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
