/**
 * Rate Limiter
 *
 * Implements sliding window rate limiting to prevent brute force attacks and API abuse.
 * Supports per-IP, per-user, and per-endpoint rate limiting with configurable limits.
 *
 * Features:
 * - Sliding window algorithm for accurate rate limiting
 * - Multiple limit tiers (strict, moderate, lenient)
 * - Per-IP and per-user tracking
 * - Endpoint-specific limits
 * - Memory-efficient cleanup
 * - Redis-ready architecture
 *
 * @example
 * ```ts
 * const limiter = new RateLimiter({ max: 10, window: 60000 });
 * const result = limiter.checkLimit('192.168.1.1');
 * if (!result.allowed) {
 *   throw new Error(`Rate limit exceeded. Retry after ${result.retryAfter}ms`);
 * }
 * ```
 */

import { Logger } from '../monitoring/logger';

const logger = new Logger({ level: 'info' });

// ============================================================================
// TYPES
// ============================================================================

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  max: number;

  /**
   * Time window in milliseconds
   */
  window: number;

  /**
   * Optional message to return when limit is exceeded
   */
  message?: string;

  /**
   * Skip rate limiting for specific identifiers (e.g., internal IPs)
   */
  skipList?: string[];
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;

  /**
   * Current request count in the window
   */
  count: number;

  /**
   * Maximum allowed requests
   */
  limit: number;

  /**
   * Time until the rate limit resets (in milliseconds)
   */
  resetAfter: number;

  /**
   * Time to wait before retrying (in milliseconds)
   */
  retryAfter?: number;

  /**
   * Remaining requests in the window
   */
  remaining: number;
}

/**
 * Request record for sliding window
 */
interface RequestRecord {
  timestamps: number[];
  lastCleanup: number;
}

// ============================================================================
// RATE LIMIT PRESETS
// ============================================================================

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  /**
   * Very strict limits for sensitive operations (login, password reset)
   * 5 requests per 15 minutes
   */
  STRICT: {
    max: 5,
    window: 15 * 60 * 1000, // 15 minutes
  },

  /**
   * Strict limits for authentication endpoints
   * 10 requests per 5 minutes
   */
  AUTH: {
    max: 10,
    window: 5 * 60 * 1000, // 5 minutes
  },

  /**
   * Moderate limits for API mutations
   * 30 requests per minute
   */
  MODERATE: {
    max: 30,
    window: 60 * 1000, // 1 minute
  },

  /**
   * Lenient limits for read operations
   * 100 requests per minute
   */
  LENIENT: {
    max: 100,
    window: 60 * 1000, // 1 minute
  },

  /**
   * Very lenient limits for public endpoints
   * 200 requests per minute
   */
  PUBLIC: {
    max: 200,
    window: 60 * 1000, // 1 minute
  },
} as const;

// ============================================================================
// RATE LIMITER CLASS
// ============================================================================

/**
 * Rate limiter with sliding window algorithm
 */
export class RateLimiter {
  private config: Required<RateLimitConfig>;
  private records: Map<string, RequestRecord>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Rate limit exceeded',
      skipList: [],
      ...config,
    };
    this.records = new Map();

    // Start cleanup interval (every 5 minutes)
    this.startCleanup();
  }

  /**
   * Check if request should be allowed
   */
  checkLimit(identifier: string): RateLimitResult {
    // Skip rate limiting for whitelisted identifiers
    if (this.config.skipList.includes(identifier)) {
      return {
        allowed: true,
        count: 0,
        limit: this.config.max,
        resetAfter: 0,
        remaining: this.config.max,
      };
    }

    const now = Date.now();
    const windowStart = now - this.config.window;

    // Get or create record
    let record = this.records.get(identifier);
    if (!record) {
      record = { timestamps: [], lastCleanup: now };
      this.records.set(identifier, record);
    }

    // Remove timestamps outside the current window (sliding window)
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    // Check if limit is exceeded
    const count = record.timestamps.length;
    const allowed = count < this.config.max;

    if (allowed) {
      // Add current timestamp
      record.timestamps.push(now);
      record.lastCleanup = now;
    }

    // Calculate reset time (when the oldest timestamp expires)
    const oldestTimestamp = record.timestamps[0] || now;
    const resetAfter = Math.max(0, oldestTimestamp + this.config.window - now);

    // Calculate retry time (for exceeded limits)
    const retryAfter = allowed ? undefined : resetAfter;

    const remaining = Math.max(0, this.config.max - count - (allowed ? 1 : 0));

    // Log rate limit check
    if (!allowed) {
      logger.warn('Rate limit exceeded', {
        identifier,
        count: count + 1,
        limit: this.config.max,
        window: this.config.window,
        resetAfter,
      });
    }

    return {
      allowed,
      count: count + (allowed ? 1 : 0),
      limit: this.config.max,
      resetAfter,
      retryAfter,
      remaining,
    };
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    this.records.delete(identifier);
    logger.debug('Rate limit reset', { identifier });
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.records.clear();
    logger.debug('All rate limits reset');
  }

  /**
   * Get current count for an identifier
   */
  getCount(identifier: string): number {
    const record = this.records.get(identifier);
    if (!record) return 0;

    const now = Date.now();
    const windowStart = now - this.config.window;
    return record.timestamps.filter((ts) => ts > windowStart).length;
  }

  /**
   * Start automatic cleanup of old records
   */
  private startCleanup(): void {
    if (typeof window !== 'undefined') {
      // Don't run cleanup in browser
      return;
    }

    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  /**
   * Clean up old records
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [identifier, record] of this.records.entries()) {
      // Remove records that haven't been used in 2x the window time
      if (now - record.lastCleanup > this.config.window * 2) {
        this.records.delete(identifier);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Rate limiter cleanup', {
        cleaned,
        remaining: this.records.size,
      });
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalRecords: number;
    totalRequests: number;
    config: RateLimitConfig;
  } {
    let totalRequests = 0;
    for (const record of this.records.values()) {
      totalRequests += record.timestamps.length;
    }

    return {
      totalRecords: this.records.size,
      totalRequests,
      config: {
        max: this.config.max,
        window: this.config.window,
        message: this.config.message,
      },
    };
  }
}

// ============================================================================
// GLOBAL RATE LIMITERS
// ============================================================================

/**
 * Shared rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Strict rate limiter for sensitive operations
   */
  strict: new RateLimiter(RateLimitPresets.STRICT),

  /**
   * Auth rate limiter for authentication endpoints
   */
  auth: new RateLimiter(RateLimitPresets.AUTH),

  /**
   * Moderate rate limiter for API mutations
   */
  moderate: new RateLimiter(RateLimitPresets.MODERATE),

  /**
   * Lenient rate limiter for read operations
   */
  lenient: new RateLimiter(RateLimitPresets.LENIENT),

  /**
   * Public rate limiter for public endpoints
   */
  public: new RateLimiter(RateLimitPresets.PUBLIC),
};

/**
 * Custom error for rate limit exceeded
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly result: RateLimitResult
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Helper to create rate limit error
 */
export function createRateLimitError(result: RateLimitResult): RateLimitError {
  return new RateLimitError(
    `Rate limit exceeded. Try again in ${Math.ceil(result.retryAfter! / 1000)} seconds.`,
    result
  );
}
