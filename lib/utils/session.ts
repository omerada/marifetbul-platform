/**
 * Session Management Utilities
 * Handles client-side session ID generation and persistence
 */

import logger from '@/lib/infrastructure/monitoring/logger';

const SESSION_KEY = 'marifetbul_session_id';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface SessionData {
  id: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create session ID
 * Returns existing session if valid, creates new one if expired or missing
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering: return temporary ID
    return `ssr-${generateSessionId()}`;
  }

  try {
    const stored = localStorage.getItem(SESSION_KEY);

    if (stored) {
      const session: SessionData = JSON.parse(stored);
      const now = Date.now();

      // Check if session is still valid
      if (now < session.expiresAt) {
        return session.id;
      }
    }
  } catch (error) {
    // Invalid JSON or localStorage error, create new session
    logger.warn('Failed to parse session data', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Create new session
  const now = Date.now();
  const sessionId = generateSessionId();
  const sessionData: SessionData = {
    id: sessionId,
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  } catch (error) {
    // LocalStorage full or disabled, continue with session ID in memory
    logger.warn('Failed to persist session', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return sessionId;
}

/**
 * Clear current session
 * Useful for logout or privacy cleanup
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    logger.warn('Failed to clear session', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Check if current session is valid
 */
export function hasValidSession(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return false;

    const session: SessionData = JSON.parse(stored);
    return Date.now() < session.expiresAt;
  } catch {
    return false;
  }
}
