/**
 * ============================================================================
 * USE SESSION HOOK - React Integration for Session Manager
 * ============================================================================
 * Provides React components with session state and controls
 *
 * Features:
 * - Real-time session state
 * - Remaining time calculations
 * - Extend session functionality
 * - Session expiry warnings
 * - Auto-cleanup on unmount
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 5, 2025
 * @sprint Sprint 1.2 - Session Management UI
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { sessionManager } from '@/lib/core/auth/sessionManager';
import type { SessionState } from '@/lib/core/auth/sessionManager';

// ============================================================================
// TYPES
// ============================================================================

interface UseSessionReturn {
  // State
  isSessionActive: boolean;
  sessionState: SessionState;
  remainingMinutes: number | null;
  remainingSeconds: number | null;
  isExpiringSoon: boolean; // True if < 5 minutes remaining

  // Actions
  extendSession: () => void;
  getSessionInfo: () => {
    expiryTime: number | null;
    lastActivity: number | null;
    isActive: boolean;
  };

  // Status checks
  willExpireIn: (minutes: number) => boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * React hook for session management
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     isSessionActive,
 *     remainingMinutes,
 *     extendSession,
 *     isExpiringSoon
 *   } = useSession();
 *
 *   if (isExpiringSoon) {
 *     return <SessionWarning onExtend={extendSession} />;
 *   }
 * }
 * ```
 */
export function useSession(): UseSessionReturn {
  const [sessionState, setSessionState] = useState<SessionState>(
    sessionManager.getState()
  );
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Update remaining time every second
  useEffect(() => {
    const updateRemainingTime = () => {
      const state = sessionManager.getState();
      setSessionState(state);

      if (state.tokenExpiry) {
        const remaining = state.tokenExpiry - Date.now();
        setRemainingTime(remaining > 0 ? remaining : 0);
      } else {
        setRemainingTime(null);
      }
    };

    // Initial update
    updateRemainingTime();

    // Update every second for accurate countdown
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Extend session handler
  const extendSession = useCallback(() => {
    sessionManager.extendSession();
    setSessionState(sessionManager.getState());
  }, []);

  // Get detailed session info
  const getSessionInfo = useCallback(() => {
    const state = sessionManager.getState();
    return {
      expiryTime: state.tokenExpiry,
      lastActivity: state.lastActivity,
      isActive: state.isActive,
    };
  }, []);

  // Check if session will expire in X minutes
  const willExpireIn = useCallback(
    (minutes: number): boolean => {
      if (!remainingTime) return false;
      return remainingTime <= minutes * 60 * 1000;
    },
    [remainingTime]
  );

  // Calculate remaining minutes and seconds
  const remainingMinutes = remainingTime
    ? Math.floor(remainingTime / 60000)
    : null;
  const remainingSeconds = remainingTime
    ? Math.floor((remainingTime % 60000) / 1000)
    : null;
  const isExpiringSoon = remainingMinutes !== null && remainingMinutes < 5;

  return {
    isSessionActive: sessionState.isActive,
    sessionState,
    remainingMinutes,
    remainingSeconds,
    isExpiringSoon,
    extendSession,
    getSessionInfo,
    willExpireIn,
  };
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook that executes callback when session expires
 *
 * @example
 * ```tsx
 * useSessionExpired(() => {
 *   toast.error('Session expired');
 *   router.push('/login');
 * });
 * ```
 */
export function useSessionExpired(callback: () => void) {
  useEffect(() => {
    const interval = setInterval(() => {
      const state = sessionManager.getState();
      if (
        !state.isActive &&
        state.tokenExpiry &&
        Date.now() > state.tokenExpiry
      ) {
        callback();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [callback]);
}

/**
 * Hook that executes callback when session is about to expire
 *
 * @param minutesBefore - Minutes before expiry to trigger callback
 * @param callback - Function to execute
 *
 * @example
 * ```tsx
 * useSessionWarning(5, () => {
 *   toast.warning('Session expiring in 5 minutes');
 * });
 * ```
 */
export function useSessionWarning(minutesBefore: number, callback: () => void) {
  const [warned, setWarned] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const state = sessionManager.getState();

      if (state.isActive && state.tokenExpiry) {
        const remaining = state.tokenExpiry - Date.now();
        const threshold = minutesBefore * 60 * 1000;

        if (remaining <= threshold && remaining > 0 && !warned) {
          callback();
          setWarned(true);
        } else if (remaining > threshold) {
          // Reset warning flag if session was extended
          setWarned(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [minutesBefore, callback, warned]);
}

/**
 * Hook that formats remaining time as human-readable string
 *
 * @example
 * ```tsx
 * const timeString = useSessionTimeString();
 * // Returns: "5 minutes 30 seconds"
 * ```
 */
export function useSessionTimeString(): string | null {
  const { remainingMinutes, remainingSeconds } = useSession();

  if (remainingMinutes === null || remainingSeconds === null) {
    return null;
  }

  if (remainingMinutes === 0) {
    return `${remainingSeconds} saniye`;
  }

  return `${remainingMinutes} dakika ${remainingSeconds} saniye`;
}
