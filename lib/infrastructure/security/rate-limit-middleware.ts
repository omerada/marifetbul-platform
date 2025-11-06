/**
 * Rate Limiting Middleware
 *
 * Provides rate limiting for API routes to prevent brute force attacks and API abuse.
 * Uses sliding window algorithm with support for per-IP and per-user limits.
 *
 * Usage:
 * ```ts
 * import { withRateLimit, RateLimitPresets } from '@/lib/infrastructure/security/rate-limit-middleware';
 *
 * export const POST = withRateLimit(
 *   async (request: Request) => {
 *     // Your handler code
 *   },
 *   { preset: 'AUTH' }
 * );
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  RateLimiter,
  RateLimitPresets,
  RateLimitConfig,
  RateLimitResult,
} from './rate-limiter';
import { Logger } from '../monitoring/logger';
import { getBackendApiUrl } from '@/lib/config/api';

const logger = new Logger({ level: 'info' });

// ============================================================================
// TYPES
// ============================================================================

/**
 * Rate limit middleware options
 */
export interface RateLimitOptions {
  /**
   * Use a preset configuration
   */
  preset?: keyof typeof RateLimitPresets;

  /**
   * Custom rate limit configuration
   */
  config?: RateLimitConfig;

  /**
   * Identifier strategy: 'ip', 'user', or custom function
   */
  identifierStrategy?:
    | 'ip'
    | 'user'
    | ((request: NextRequest) => string | Promise<string>);

  /**
   * Include rate limit headers in response
   */
  includeHeaders?: boolean;

  /**
   * Custom error message
   */
  errorMessage?: string;

  /**
   * Custom status code (default: 429)
   */
  statusCode?: number;

  /**
   * Skip rate limiting for specific conditions
   */
  skip?: (request: NextRequest) => boolean | Promise<boolean>;

  /**
   * Callback for rate limit exceeded
   */
  onRateLimitExceeded?: (request: NextRequest, result: RateLimitResult) => void;

  /**
   * Callback for successful rate limit check
   */
  onRateLimitSuccess?: (request: NextRequest, result: RateLimitResult) => void;
}

type NextRouteHandler = (
  request: NextRequest,
  context?: unknown
) => Promise<Response> | Response;

// ============================================================================
// IDENTIFIER EXTRACTION
// ============================================================================

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  // Check various headers for IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a default IP for development
  return '127.0.0.1';
}

/**
 * Get user identifier from request using JWT token validation
 */
async function getUserIdentifier(request: NextRequest): Promise<string> {
  try {
    // Get JWT token from httpOnly cookie
    const token = request.cookies.get('marifetbul_token')?.value;

    if (!token) {
      // No token, fallback to IP
      return `ip:${getClientIp(request)}`;
    }

    // Validate token with backend (lightweight validation endpoint)
    const backendUrl = getBackendApiUrl();
    const response = await fetch(`${backendUrl}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `marifetbul_token=${token}`,
      },
      credentials: 'include',
      cache: 'no-store',
      // Short timeout for rate limiting to not slow down requests
      signal: AbortSignal.timeout(2000),
    });

    if (response.ok) {
      const data = await response.json();
      const userId = data.user?.id || data.userId;

      if (userId) {
        return `user:${userId}`;
      }
    }

    // Token validation failed or no userId, fallback to IP
    return `ip:${getClientIp(request)}`;
  } catch (error) {
    // On error (timeout, network issue), fallback to IP-based limiting
    logger.warn('Failed to get user identifier, { fallingbacktoIP, errorerrorinstanceofErrorerrormessageStringerror }),
    });
    return `ip:${getClientIp(request)}`;
  }
}

/**
 * Get identifier for rate limiting
 */
async function getIdentifier(
  request: NextRequest,
  strategy: RateLimitOptions['identifierStrategy'] = 'ip'
): Promise<string> {
  if (typeof strategy === 'function') {
    return await strategy(request);
  }

  if (strategy === 'user') {
    return await getUserIdentifier(request);
  }

  // Default: IP-based
  return `ip:${getClientIp(request)}`;
}

// ============================================================================
// RATE LIMIT HEADERS
// ============================================================================

/**
 * Add rate limit headers to response
 */
function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const headers = new Headers(response.headers);

  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set(
    'X-RateLimit-Reset',
    new Date(Date.now() + result.resetAfter).toISOString()
  );

  if (!result.allowed && result.retryAfter) {
    headers.set('Retry-After', Math.ceil(result.retryAfter / 1000).toString());
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Higher-order function that adds rate limiting to an API route handler
 */
export function withRateLimit(
  handler: NextRouteHandler,
  options: RateLimitOptions = {}
): NextRouteHandler {
  const {
    preset = 'MODERATE',
    config,
    identifierStrategy = 'ip',
    includeHeaders = true,
    errorMessage = 'Too many requests',
    statusCode = 429,
    skip,
    onRateLimitExceeded,
    onRateLimitSuccess,
  } = options;

  // Create rate limiter
  const limiterConfig = config || RateLimitPresets[preset];
  const limiter = new RateLimiter(limiterConfig);

  return async (request: NextRequest, context?: unknown) => {
    try {
      // Check if should skip
      if (skip && (await skip(request))) {
        logger.debug('Rate limiting skipped', { urlrequesturl, methodrequestmethod,  });
        return await handler(request, context);
      }

      // Get identifier
      const identifier = await getIdentifier(request, identifierStrategy);

      // Check rate limit
      const result = limiter.checkLimit(identifier);

      if (!result.allowed) {
        logger.warn('Rate limit exceeded', { identifier, urlrequesturl, methodrequestmethod, countresultcount, limitresultlimit, resetAfterresultresetAfter,  });

        // Call exceeded callback
        if (onRateLimitExceeded) {
          onRateLimitExceeded(request, result);
        }

        // Create error response
        const response = NextResponse.json(
          {
            error: 'Too Many Requests',
            message: errorMessage,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: result.retryAfter,
            limit: result.limit,
            resetAt: new Date(Date.now() + result.resetAfter).toISOString(),
          },
          { status: statusCode }
        );

        return includeHeaders
          ? addRateLimitHeaders(response, result)
          : response;
      }

      // Call success callback
      if (onRateLimitSuccess) {
        onRateLimitSuccess(request, result);
      }

      // Rate limit passed, execute handler
      const response = await handler(request, context);

      // Add rate limit headers if enabled
      return includeHeaders ? addRateLimitHeaders(response, result) : response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Rate limit middleware error', err, {
        url: request.url,
        method: request.method,
      });

      // Re-throw to let error handlers deal with it
      throw error;
    }
  };
}

/**
 * Create a configurable rate limit middleware factory
 */
export function createRateLimitMiddleware(
  defaultOptions: RateLimitOptions = {}
): (handler: NextRouteHandler, options?: RateLimitOptions) => NextRouteHandler {
  return (handler: NextRouteHandler, options: RateLimitOptions = {}) => {
    const mergedOptions = { ...defaultOptions, ...options };
    return withRateLimit(handler, mergedOptions);
  };
}

// ============================================================================
// PRESET MIDDLEWARES
// ============================================================================

/**
 * Strict rate limiting for sensitive operations
 */
export const withStrictRateLimit = (
  handler: NextRouteHandler
): NextRouteHandler => withRateLimit(handler, { preset: 'STRICT' });

/**
 * Auth rate limiting for authentication endpoints
 */
export const withAuthRateLimit = (
  handler: NextRouteHandler
): NextRouteHandler => withRateLimit(handler, { preset: 'AUTH' });

/**
 * Moderate rate limiting for API mutations
 */
export const withModerateRateLimit = (
  handler: NextRouteHandler
): NextRouteHandler => withRateLimit(handler, { preset: 'MODERATE' });

/**
 * Lenient rate limiting for read operations
 */
export const withLenientRateLimit = (
  handler: NextRouteHandler
): NextRouteHandler => withRateLimit(handler, { preset: 'LENIENT' });

/**
 * Public rate limiting for public endpoints
 */
export const withPublicRateLimit = (
  handler: NextRouteHandler
): NextRouteHandler => withRateLimit(handler, { preset: 'PUBLIC' });

// Export presets for convenience
export { RateLimitPresets };
