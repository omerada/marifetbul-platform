/**
 * ============================================================================
 * SESSIONS API - Session Management API Client
 * ============================================================================
 * Handles user session management, active device tracking, and logout
 *
 * Features:
 * - List all active sessions
 * - Get session details (device, location, last activity)
 * - Revoke individual session
 * - Revoke all other sessions
 * - Current session identification
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 * @sprint Security & Settings Sprint - Story 2
 */

'use client';

import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Session information with device and location details
 */
export interface SessionInfo {
  id: string;
  userId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  deviceName: string; // e.g., "Chrome on Windows 10"
  browser: string; // e.g., "Chrome 120.0"
  os: string; // e.g., "Windows 10"
  ipAddress: string;
  location: {
    city?: string;
    country?: string;
    countryCode?: string;
  };
  createdAt: string; // ISO timestamp
  lastActivityAt: string; // ISO timestamp
  isCurrent: boolean; // True if this is the current session
}

/**
 * Request payload for revoking sessions
 */
export interface RevokeSessionRequest {
  password: string; // Require password confirmation for security
}

/**
 * Response from session operations
 */
export interface SessionOperationResponse {
  success: boolean;
  message?: string;
  revokedCount?: number; // Number of sessions revoked (for bulk operations)
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all active sessions for current user
 *
 * @returns Promise<SessionInfo[]> - List of active sessions
 * @throws Error if request fails
 *
 * @example
 * ```ts
 * const sessions = await getSessions();
 * console.log(`You have ${sessions.length} active sessions`);
 * ```
 */
export async function getSessions(): Promise<SessionInfo[]> {
  try {
    logger.debug('sessions.getSessions: Fetching all sessions');

    const data = await apiClient.get<SessionInfo[]>('/auth/sessions');

    logger.info('sessions.getSessions: Success', {
      count: data.length,
    });

    return data;
  } catch (error) {
    logger.error('sessions.getSessions: Failed', error as Error);
    throw error;
  }
}

/**
 * Get details for a specific session
 *
 * @param sessionId - ID of the session to retrieve
 * @returns Promise<SessionInfo> - Session details
 * @throws Error if request fails or session not found
 *
 * @example
 * ```ts
 * const session = await getSessionById('session-123');
 * console.log(`Last active: ${session.lastActivityAt}`);
 * ```
 */
export async function getSessionById(sessionId: string): Promise<SessionInfo> {
  try {
    logger.debug('sessions.getSessionById: Fetching session', { sessionId });

    const data = await apiClient.get<SessionInfo>(
      `/auth/sessions/${sessionId}`
    );

    logger.info('sessions.getSessionById: Success', { sessionId });

    return data;
  } catch (error) {
    logger.error('sessions.getSessionById: Failed', error as Error, {
      sessionId,
    });
    throw error;
  }
}

/**
 * Revoke a specific session (log out from that device)
 *
 * @param sessionId - ID of the session to revoke
 * @param request - Password confirmation for security
 * @returns Promise<SessionOperationResponse> - Result of operation
 * @throws Error if request fails or password incorrect
 *
 * @example
 * ```ts
 * await revokeSession('session-123', { password: 'myPassword' });
 * ```
 */
export async function revokeSession(
  sessionId: string,
  request: RevokeSessionRequest
): Promise<SessionOperationResponse> {
  try {
    logger.debug('sessions.revokeSession: Revoking session', { sessionId });

    const data = await apiClient.delete<SessionOperationResponse>(
      `/auth/sessions/${sessionId}`,
      {
        body: JSON.stringify(request),
      }
    );

    logger.info('sessions.revokeSession: Success', { sessionId });

    return data;
  } catch (error) {
    logger.error('sessions.revokeSession: Failed', error as Error, {
      sessionId,
    });
    throw error;
  }
}

/**
 * Revoke all sessions except current one (log out from all other devices)
 *
 * @param request - Password confirmation for security
 * @returns Promise<SessionOperationResponse> - Result with count of revoked sessions
 * @throws Error if request fails or password incorrect
 *
 * @example
 * ```ts
 * const result = await revokeAllSessions({ password: 'myPassword' });
 * console.log(`Logged out from ${result.revokedCount} devices`);
 * ```
 */
export async function revokeAllSessions(
  request: RevokeSessionRequest
): Promise<SessionOperationResponse> {
  try {
    logger.debug('sessions.revokeAllSessions: Revoking all sessions');

    const data = await apiClient.delete<SessionOperationResponse>(
      '/auth/sessions/all',
      {
        body: JSON.stringify(request),
      }
    );

    logger.info('sessions.revokeAllSessions: Success', {
      revokedCount: data.revokedCount,
    });

    return data;
  } catch (error) {
    logger.error('sessions.revokeAllSessions: Failed', error as Error);
    throw error;
  }
}

/**
 * Get current session info
 * Convenience method to get just the current session details
 *
 * @returns Promise<SessionInfo> - Current session details
 * @throws Error if request fails
 *
 * @example
 * ```ts
 * const currentSession = await getCurrentSession();
 * console.log(`Your IP: ${currentSession.ipAddress}`);
 * ```
 */
export async function getCurrentSession(): Promise<SessionInfo> {
  try {
    logger.debug('sessions.getCurrentSession: Fetching current session');

    const data = await apiClient.get<SessionInfo>('/auth/sessions/current');

    logger.info('sessions.getCurrentSession: Success');

    return data;
  } catch (error) {
    logger.error('sessions.getCurrentSession: Failed', error as Error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format device name from session info
 *
 * @param session - Session info object
 * @returns Formatted device name string
 *
 * @example
 * ```ts
 * const deviceName = formatDeviceName(session);
 * // Returns: "Chrome on Windows 10"
 * ```
 */
export function formatDeviceName(session: SessionInfo): string {
  const browser = session.browser.split(' ')[0]; // Extract browser name
  return `${browser} on ${session.os}`;
}

/**
 * Format location from session info
 *
 * @param session - Session info object
 * @returns Formatted location string
 *
 * @example
 * ```ts
 * const location = formatLocation(session);
 * // Returns: "Istanbul, Turkey" or "Turkey" or "Unknown"
 * ```
 */
export function formatLocation(session: SessionInfo): string {
  const { city, country } = session.location;

  if (city && country) {
    return `${city}, ${country}`;
  }

  if (country) {
    return country;
  }

  return 'Unknown Location';
}

/**
 * Get device icon name based on device type
 *
 * @param deviceType - Type of device
 * @returns Icon name for UI libraries (lucide-react)
 *
 * @example
 * ```ts
 * const icon = getDeviceIcon(session.deviceType);
 * // Returns: "Monitor", "Smartphone", "Tablet", or "HelpCircle"
 * ```
 */
export function getDeviceIcon(deviceType: SessionInfo['deviceType']): string {
  const iconMap: Record<SessionInfo['deviceType'], string> = {
    desktop: 'Monitor',
    mobile: 'Smartphone',
    tablet: 'Tablet',
    unknown: 'HelpCircle',
  };

  return iconMap[deviceType];
}

/**
 * Calculate time since last activity
 *
 * @param lastActivityAt - ISO timestamp of last activity
 * @returns Human-readable time difference
 *
 * @example
 * ```ts
 * const timeSince = getTimeSinceActivity(session.lastActivityAt);
 * // Returns: "2 minutes ago", "1 hour ago", etc.
 * ```
 */
export function getTimeSinceActivity(lastActivityAt: string): string {
  const now = new Date();
  const lastActivity = new Date(lastActivityAt);
  const diffMs = now.getTime() - lastActivity.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const sessionsApi = {
  getSessions,
  getSessionById,
  revokeSession,
  revokeAllSessions,
  getCurrentSession,
  formatDeviceName,
  formatLocation,
  getDeviceIcon,
  getTimeSinceActivity,
};

export default sessionsApi;
