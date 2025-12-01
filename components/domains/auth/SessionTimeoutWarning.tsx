/**
 * ================================================
 * SESSION TIMEOUT WARNING COMPONENT
 * ================================================
 * Sprint 1: Security & Compliance - Story 3
 *
 * Monitors user inactivity and shows warning before auto-logout.
 *
 * Features:
 * - Tracks mouse/keyboard activity
 * - Shows countdown modal before timeout
 * - Auto-logout after inactivity period
 * - Configurable timeout duration
 * - Extends session on user activity
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-26
 */

'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Alert, AlertDescription } from '@/components/ui';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { Clock, AlertTriangle, Activity } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Inactivity timeout in milliseconds (30 minutes)
  INACTIVITY_TIMEOUT: 30 * 60 * 1000,

  // Warning time before logout (5 minutes)
  WARNING_TIME: 5 * 60 * 1000,

  // Countdown interval for modal (1 second)
  COUNTDOWN_INTERVAL: 1000,

  // Events to track for activity
  ACTIVITY_EVENTS: ['mousedown', 'keydown', 'scroll', 'touchstart'] as const,
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface SessionTimeoutWarningProps {
  /** Callback when user is logged out due to inactivity */
  onTimeout?: () => void;

  /** Inactivity timeout in milliseconds (default: 30 min) */
  timeoutMs?: number;

  /** Warning time in milliseconds (default: 5 min) */
  warningMs?: number;

  /** Disable the timeout warning (useful for development) */
  disabled?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format remaining time as MM:SS
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SessionTimeoutWarning Component
 *
 * Tracks user activity and shows warning before automatic logout.
 *
 * @example
 * ```tsx
 * // In app layout
 * <SessionTimeoutWarning
 *   timeoutMs={30 * 60 * 1000}
 *   warningMs={5 * 60 * 1000}
 * />
 * ```
 */
export function SessionTimeoutWarning({
  onTimeout,
  timeoutMs = CONFIG.INACTIVITY_TIMEOUT,
  warningMs = CONFIG.WARNING_TIME,
  disabled = false,
}: SessionTimeoutWarningProps) {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(warningMs);

  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Reset activity timer
   */
  const resetActivityTimer = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;

    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Hide warning if showing
    if (showWarning) {
      setShowWarning(false);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }

    // Set warning timer (timeout - warning time)
    const timeUntilWarning = timeoutMs - warningMs;
    warningTimerRef.current = setTimeout(() => {
      logger.warn('[SessionTimeout] Showing inactivity warning');
      setShowWarning(true);
      setTimeRemaining(warningMs);

      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - CONFIG.COUNTDOWN_INTERVAL;
          if (newTime <= 0) {
            handleLogout('timeout');
            return 0;
          }
          return newTime;
        });
      }, CONFIG.COUNTDOWN_INTERVAL);
    }, timeUntilWarning);

    logger.debug('[SessionTimeout] Activity detected, timer reset', {
      timeUntilWarning: timeUntilWarning / 1000 / 60,
    });
  }, [showWarning, timeoutMs, warningMs]);

  /**
   * Handle logout (manual or automatic)
   */
  const handleLogout = useCallback(
    async (reason: 'timeout' | 'manual') => {
      logger.info('[SessionTimeout] Logging out user', { reason });

      // Clear all timers
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);

      setShowWarning(false);

      // Call custom timeout handler
      if (reason === 'timeout' && onTimeout) {
        onTimeout();
      }

      // Perform logout
      await logout();
      router.push('/login?reason=session_timeout');
    },
    [logout, router, onTimeout]
  );

  /**
   * Extend session (user clicked "Stay Logged In")
   */
  const handleExtendSession = useCallback(() => {
    logger.info('[SessionTimeout] User extended session');
    resetActivityTimer();
  }, [resetActivityTimer]);

  /**
   * Setup activity listeners
   */
  useEffect(() => {
    if (disabled || !isAuthenticated) {
      return;
    }

    logger.info('[SessionTimeout] Starting inactivity monitor', {
      timeoutMinutes: timeoutMs / 1000 / 60,
      warningMinutes: warningMs / 1000 / 60,
    });

    // Initialize timer
    resetActivityTimer();

    // Add activity event listeners
    const handleActivity = () => {
      if (!showWarning) {
        resetActivityTimer();
      }
    };

    CONFIG.ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      CONFIG.ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);

      logger.info('[SessionTimeout] Inactivity monitor stopped');
    };
  }, [
    disabled,
    isAuthenticated,
    resetActivityTimer,
    showWarning,
    timeoutMs,
    warningMs,
  ]);

  // Don't render if disabled or not authenticated
  if (disabled || !isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            Oturum Zaman Aşımı Uyarısı
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Message */}
          <Alert variant="warning" className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Hesabınız uzun süredir aktif değil. Güvenlik nedeniyle oturumunuz
              otomatik olarak kapatılacak.
            </AlertDescription>
          </Alert>

          {/* Countdown Timer */}
          <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6 text-center">
            <p className="mb-2 text-sm font-medium text-yellow-900">
              Kalan Süre
            </p>
            <div className="text-4xl font-bold text-yellow-700">
              {formatTime(timeRemaining)}
            </div>
            <p className="mt-2 text-xs text-yellow-700">
              Oturumunuzu sürdürmek için bir işlem yapın
            </p>
          </div>

          {/* Activity Indicator */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 shrink-0 text-blue-600" />
              <div className="text-sm text-blue-900">
                <p className="font-medium">Oturumunuzu nasıl sürdürürsünüz?</p>
                <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-blue-700">
                  <li>
                    Aşağıdaki &quot;Oturumu Sürdür&quot; düğmesine tıklayın
                  </li>
                  <li>Veya sayfada herhangi bir işlem yapın</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleLogout('manual')}
              className="flex-1"
            >
              Çıkış Yap
            </Button>
            <Button onClick={handleExtendSession} className="flex-1">
              Oturumu Sürdür
            </Button>
          </div>

          {/* Info Text */}
          <p className="text-center text-xs text-gray-500">
            Güvenliğiniz için {timeoutMs / 1000 / 60} dakika hareketsizlik
            sonrası otomatik çıkış yapılır.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SessionTimeoutWarning;
