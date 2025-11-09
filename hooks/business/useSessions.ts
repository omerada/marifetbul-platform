/**
 * ============================================================================
 * USE SESSIONS HOOK - Session Management Hook
 * ============================================================================
 * React hook for managing user sessions (active devices)
 *
 * Features:
 * - Fetch all active sessions
 * - Revoke individual session
 * - Revoke all other sessions
 * - Real-time session updates
 * - Password confirmation for security
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 * @sprint Security & Settings Sprint - Story 2
 */

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { sessionsApi, type SessionInfo } from '@/lib/api/sessions';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface UseSessionsReturn {
  // State
  sessions: SessionInfo[] | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSessions: () => Promise<void>;
  revokeSession: (sessionId: string, password: string) => Promise<boolean>;
  revokeAllSessions: (password: string) => Promise<boolean>;
  refreshSessions: () => Promise<void>;

  // Computed
  currentSession: SessionInfo | null;
  otherSessions: SessionInfo[];
  sessionCount: number;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * React hook for session management
 *
 * @example
 * ```tsx
 * function SessionsPage() {
 *   const {
 *     sessions,
 *     isLoading,
 *     fetchSessions,
 *     revokeSession
 *   } = useSessions();
 *
 *   useEffect(() => {
 *     fetchSessions();
 *   }, [fetchSessions]);
 *
 *   return (
 *     <div>
 *       {sessions?.map(session => (
 *         <SessionCard
 *           key={session.id}
 *           session={session}
 *           onRevoke={(password) => revokeSession(session.id, password)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // FETCH SESSIONS
  // ============================================================================

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.debug('useSessions.fetchSessions: Fetching sessions');

      const data = await sessionsApi.getSessions();

      setSessions(data);

      logger.info('useSessions.fetchSessions: Success', {
        count: data.length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch sessions';

      logger.error('useSessions.fetchSessions: Failed', err as Error);

      setError(errorMessage);

      toast.error('Oturumlar yüklenemedi', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // REVOKE SINGLE SESSION
  // ============================================================================

  const revokeSession = useCallback(
    async (sessionId: string, password: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        logger.debug('useSessions.revokeSession: Revoking session', {
          sessionId,
        });

        await sessionsApi.revokeSession(sessionId, { password });

        // Remove from local state
        setSessions((prev) =>
          prev ? prev.filter((s) => s.id !== sessionId) : null
        );

        logger.info('useSessions.revokeSession: Success', { sessionId });

        toast.success('Oturum sonlandırıldı', {
          description: 'Cihaz başarıyla çıkış yaptırıldı',
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to revoke session';

        logger.error('useSessions.revokeSession: Failed', err as Error, {
          sessionId,
        });

        toast.error('Oturum sonlandırılamadı', {
          description: errorMessage,
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ============================================================================
  // REVOKE ALL SESSIONS
  // ============================================================================

  const revokeAllSessions = useCallback(
    async (password: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        logger.debug('useSessions.revokeAllSessions: Revoking all sessions');

        const result = await sessionsApi.revokeAllSessions({ password });

        // Keep only current session
        setSessions((prev) => (prev ? prev.filter((s) => s.isCurrent) : null));

        logger.info('useSessions.revokeAllSessions: Success', {
          revokedCount: result.revokedCount,
        });

        toast.success('Tüm oturumlar sonlandırıldı', {
          description: `${result.revokedCount || 0} cihazdan çıkış yapıldı`,
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to revoke sessions';

        logger.error('useSessions.revokeAllSessions: Failed', err as Error);

        toast.error('Oturumlar sonlandırılamadı', {
          description: errorMessage,
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ============================================================================
  // REFRESH SESSIONS
  // ============================================================================

  const refreshSessions = useCallback(async () => {
    await fetchSessions();
  }, [fetchSessions]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const currentSession = sessions?.find((s) => s.isCurrent) || null;
  const otherSessions = sessions?.filter((s) => !s.isCurrent) || [];
  const sessionCount = sessions?.length || 0;

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    sessions,
    isLoading,
    error,

    // Actions
    fetchSessions,
    revokeSession,
    revokeAllSessions,
    refreshSessions,

    // Computed
    currentSession,
    otherSessions,
    sessionCount,
  };
}
