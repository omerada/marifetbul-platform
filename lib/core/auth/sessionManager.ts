/**
 * ============================================================================
 * SESSION MANAGER - Token & Session Management
 * ============================================================================
 * Handles automatic token refresh, session timeout, and activity tracking
 *
 * Features:
 * - Auto token refresh before expiry
 * - Session timeout detection
 * - User activity tracking
 * - Idle timeout warnings
 * - Session extension on activity
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 5, 2025
 * @sprint Sprint 1 - Session Management
 */

import logger from '@/lib/infrastructure/monitoring/logger';
import { unifiedAuthService } from './unifiedAuthService';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SESSION_CONFIG = {
  // Token refresh: 5 minutes before expiry
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes in ms

  // Session timeout: 30 minutes of inactivity
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in ms

  // Warning: Show warning 5 minutes before timeout
  TIMEOUT_WARNING_THRESHOLD: 5 * 60 * 1000, // 5 minutes in ms

  // Activity check interval
  ACTIVITY_CHECK_INTERVAL: 60 * 1000, // 1 minute

  // Token refresh retry attempts
  MAX_REFRESH_RETRIES: 3,

  // Token expiry default (from JWT)
  DEFAULT_TOKEN_EXPIRY: 60 * 60 * 1000, // 1 hour
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface SessionState {
  isActive: boolean;
  lastActivity: number;
  tokenExpiry: number | null;
  sessionExpiry: number | null;
  isRefreshing: boolean;
  warningShown: boolean;
}

export interface SessionCallbacks {
  onSessionExpired?: () => void;
  onSessionWarning?: (remainingMinutes: number) => void;
  onTokenRefreshed?: () => void;
  onTokenRefreshFailed?: (error: Error) => void;
}

// ============================================================================
// SESSION MANAGER CLASS
// ============================================================================

class SessionManager {
  private state: SessionState = {
    isActive: false,
    lastActivity: Date.now(),
    tokenExpiry: null,
    sessionExpiry: null,
    isRefreshing: false,
    warningShown: false,
  };

  private callbacks: SessionCallbacks = {};
  private activityCheckInterval: NodeJS.Timeout | null = null;
  private tokenRefreshTimeout: NodeJS.Timeout | null = null;
  private refreshRetryCount = 0;

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Initialize session manager
   * Call this after successful login
   *
   * @param tokenExpiry - Token expiry timestamp (optional, uses default if not provided)
   * @param callbacks - Session event callbacks
   */
  initialize(tokenExpiry?: number, callbacks?: SessionCallbacks): void {
    logger.info('SessionManager: Initializing', {
      tokenExpiry: tokenExpiry
        ? new Date(tokenExpiry).toISOString()
        : 'default',
    });

    this.callbacks = callbacks || {};
    this.state.isActive = true;
    this.state.lastActivity = Date.now();
    this.state.warningShown = false;

    // Set token expiry
    if (tokenExpiry) {
      this.state.tokenExpiry = tokenExpiry;
    } else {
      this.state.tokenExpiry = Date.now() + SESSION_CONFIG.DEFAULT_TOKEN_EXPIRY;
    }

    // Set session expiry
    this.state.sessionExpiry = Date.now() + SESSION_CONFIG.SESSION_TIMEOUT;

    // Start monitoring
    this.startActivityMonitoring();
    this.scheduleTokenRefresh();
  }

  /**
   * Destroy session manager
   * Call this on logout
   */
  destroy(): void {
    logger.info('SessionManager: Destroying');

    this.state.isActive = false;
    this.stopActivityMonitoring();
    this.clearTokenRefreshTimeout();
    this.callbacks = {};
  }

  /**
   * Record user activity
   * Call this on user interactions (clicks, keypresses, etc.)
   */
  recordActivity(): void {
    if (!this.state.isActive) return;

    const now = Date.now();
    this.state.lastActivity = now;

    // Extend session expiry
    this.state.sessionExpiry = now + SESSION_CONFIG.SESSION_TIMEOUT;

    // Reset warning flag if user is active
    if (this.state.warningShown) {
      this.state.warningShown = false;
    }

    logger.debug('SessionManager: Activity recorded', {
      sessionExpiry: new Date(this.state.sessionExpiry).toISOString(),
    });
  }

  /**
   * Manually extend session
   * Call this when user explicitly wants to stay logged in
   */
  extendSession(): void {
    if (!this.state.isActive) return;

    logger.info('SessionManager: Session extended manually');

    const now = Date.now();
    this.state.sessionExpiry = now + SESSION_CONFIG.SESSION_TIMEOUT;
    this.state.warningShown = false;
  }

  /**
   * Check if session is valid
   *
   * @returns True if session is valid, false if expired
   */
  isSessionValid(): boolean {
    if (!this.state.isActive) return false;
    if (!this.state.sessionExpiry) return false;

    return Date.now() < this.state.sessionExpiry;
  }

  /**
   * Get remaining session time in milliseconds
   */
  getRemainingSessionTime(): number {
    if (!this.state.sessionExpiry) return 0;
    return Math.max(0, this.state.sessionExpiry - Date.now());
  }

  /**
   * Get current session state (for debugging)
   */
  getState(): Readonly<SessionState> {
    return { ...this.state };
  }

  // ==========================================================================
  // ACTIVITY MONITORING
  // ==========================================================================

  /**
   * Start monitoring user activity
   */
  private startActivityMonitoring(): void {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
    }

    this.activityCheckInterval = setInterval(() => {
      this.checkActivity();
    }, SESSION_CONFIG.ACTIVITY_CHECK_INTERVAL);

    logger.debug('SessionManager: Activity monitoring started');
  }

  /**
   * Stop monitoring user activity
   */
  private stopActivityMonitoring(): void {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }

    logger.debug('SessionManager: Activity monitoring stopped');
  }

  /**
   * Check activity and handle session timeout
   */
  private checkActivity(): void {
    if (!this.state.isActive || !this.state.sessionExpiry) return;

    const now = Date.now();
    const remainingTime = this.state.sessionExpiry - now;

    // Session expired
    if (remainingTime <= 0) {
      logger.warn('SessionManager: Session expired');
      this.handleSessionExpired();
      return;
    }

    // Show warning if approaching timeout
    if (
      remainingTime <= SESSION_CONFIG.TIMEOUT_WARNING_THRESHOLD &&
      !this.state.warningShown
    ) {
      const remainingMinutes = Math.ceil(remainingTime / 60000);
      logger.warn('SessionManager: Session timeout warning', { remainingMinutes,  });

      this.state.warningShown = true;

      if (this.callbacks.onSessionWarning) {
        this.callbacks.onSessionWarning(remainingMinutes);
      }
    }
  }

  /**
   * Handle session expiration
   */
  private handleSessionExpired(): void {
    logger.info('SessionManager: Handling session expiration');

    this.destroy();

    if (this.callbacks.onSessionExpired) {
      this.callbacks.onSessionExpired();
    }
  }

  // ==========================================================================
  // TOKEN REFRESH
  // ==========================================================================

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(): void {
    if (!this.state.tokenExpiry) return;

    const now = Date.now();
    const timeUntilRefresh =
      this.state.tokenExpiry - now - SESSION_CONFIG.TOKEN_REFRESH_THRESHOLD;

    if (timeUntilRefresh <= 0) {
      // Token already needs refresh
      this.refreshToken();
      return;
    }

    logger.debug('SessionManager: Token refresh scheduled', {
      refreshIn: `${Math.ceil(timeUntilRefresh / 60000)} minutes`,
    });

    this.tokenRefreshTimeout = setTimeout(() => {
      this.refreshToken();
    }, timeUntilRefresh);
  }

  /**
   * Clear token refresh timeout
   */
  private clearTokenRefreshTimeout(): void {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    if (!this.state.isActive) return;
    if (this.state.isRefreshing) {
      logger.debug('SessionManager: Token refresh already in progress');
      return;
    }

    logger.info('SessionManager: Refreshing token', { attemptthisrefreshRetryCount1,  });

    this.state.isRefreshing = true;

    try {
      const response = await unifiedAuthService.refreshToken();

      if (response.success && response.data) {
        logger.info('SessionManager: Token refreshed successfully');

        // Update token expiry
        if (response.data.expiresIn) {
          this.state.tokenExpiry = Date.now() + response.data.expiresIn * 1000;
        }

        // Reset retry count
        this.refreshRetryCount = 0;

        // Schedule next refresh
        this.scheduleTokenRefresh();

        // Notify callback
        if (this.callbacks.onTokenRefreshed) {
          this.callbacks.onTokenRefreshed();
        }
      } else {
        throw new Error('Token refresh failed: Invalid response');
      }
    } catch (error) {
      logger.error('SessionManager: Token refresh failed', error as Error);

      this.refreshRetryCount++;

      if (this.refreshRetryCount < SESSION_CONFIG.MAX_REFRESH_RETRIES) {
        // Retry with exponential backoff
        const retryDelay = Math.pow(2, this.refreshRetryCount) * 1000;
        logger.info('SessionManager: Retrying token refresh', { retryInretryDelay1000seconds,  });

        setTimeout(() => {
          this.refreshToken();
        }, retryDelay);
      } else {
        // Max retries reached, notify failure
        logger.error('SessionManager: Max refresh retries reached');

        if (this.callbacks.onTokenRefreshFailed) {
          this.callbacks.onTokenRefreshFailed(error as Error);
        }

        // Session invalid, handle expiration
        this.handleSessionExpired();
      }
    } finally {
      this.state.isRefreshing = false;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Singleton instance of SessionManager
 * Use this throughout the application for session management
 */
export const sessionManager = new SessionManager();

// Default export
export default sessionManager;

// ============================================================================
// ACTIVITY TRACKER HOOK (for React components)
// ============================================================================

/**
 * Setup activity tracking in React app
 * Call this once in your app root (e.g., layout.tsx)
 */
export function setupActivityTracking(): () => void {
  const events = [
    'mousedown',
    'keydown',
    'scroll',
    'touchstart',
    'click',
  ] as const;

  const handleActivity = () => {
    sessionManager.recordActivity();
  };

  // Add event listeners
  events.forEach((event) => {
    window.addEventListener(event, handleActivity, { passive: true });
  });

  logger.debug('SessionManager: Activity tracking setup complete');

  // Return cleanup function
  return () => {
    events.forEach((event) => {
      window.removeEventListener(event, handleActivity);
    });
    logger.debug('SessionManager: Activity tracking cleaned up');
  };
}
