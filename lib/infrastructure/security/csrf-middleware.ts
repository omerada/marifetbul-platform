/**
 * CSRF Protection Middleware
 *
 * Provides CSRF token validation for API routes using double-submit cookie pattern.
 * Automatically validates CSRF tokens for state-changing requests (POST, PUT, PATCH, DELETE).
 *
 * Usage:
 * ```ts
 * import { withCsrfProtection } from '@/lib/infrastructure/security/csrf-middleware';
 *
 * export const POST = withCsrfProtection(async (request: Request) => {
 *   // Your handler code
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  validateCsrfToken,
  requiresCsrfProtection,
  getCsrfTokenFromCookie,
  getCsrfHeaderName,
  CsrfError,
} from './csrf';
import { Logger } from '../monitoring/logger';

const logger = new Logger({ level: 'info' });

/**
 * CSRF validation response
 */
interface CsrfValidationResult {
  valid: boolean;
  error?: string;
  token?: string;
}

/**
 * Validates CSRF token from request
 */
export function validateCsrfFromRequest(
  request: NextRequest
): CsrfValidationResult {
  try {
    // Check if method requires CSRF protection
    if (!requiresCsrfProtection(request.method)) {
      return { valid: true };
    }

    // Get token from header
    const headerName = getCsrfHeaderName();
    const headerToken = request.headers.get(headerName);

    if (!headerToken) {
      logger.warn('CSRF validation failed: No token in header', {
        method: request.method,
        url: request.url,
        headerName,
      });
      return {
        valid: false,
        error: 'CSRF token missing from request header',
      };
    }

    // Get token from cookie
    const cookieToken = getCsrfTokenFromCookie();

    if (!cookieToken) {
      logger.warn('CSRF validation failed: No token in cookie', {
        method: request.method,
        url: request.url,
      });
      return {
        valid: false,
        error: 'CSRF token missing from cookie',
      };
    }

    // Validate tokens match
    const isValid = validateCsrfToken(headerToken, cookieToken);

    if (!isValid) {
      logger.warn('CSRF validation failed: Token mismatch', {
        method: request.method,
        url: request.url,
        headerToken: headerToken.substring(0, 8) + '...',
        cookieToken: cookieToken.substring(0, 8) + '...',
      });
      return {
        valid: false,
        error: 'CSRF token validation failed',
      };
    }

    return {
      valid: true,
      token: headerToken,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('CSRF validation error', err, {
      method: request.method,
      url: request.url,
    });
    return {
      valid: false,
      error: 'CSRF validation error occurred',
    };
  }
}

/**
 * Type for Next.js API route handler
 */
type NextRouteHandler = (
  request: NextRequest,
  context?: unknown
) => Promise<Response> | Response;

/**
 * Higher-order function that adds CSRF protection to an API route handler
 */
export function withCsrfProtection(
  handler: NextRouteHandler
): NextRouteHandler {
  return async (request: NextRequest, context?: unknown) => {
    // Validate CSRF token
    const validation = validateCsrfFromRequest(request);

    if (!validation.valid) {
      logger.warn('CSRF protection blocked request', {
        method: request.method,
        url: request.url,
        error: validation.error,
      });

      return NextResponse.json(
        {
          error: 'Forbidden',
          message: validation.error || 'CSRF token validation failed',
          code: 'CSRF_VALIDATION_FAILED',
        },
        { status: 403 }
      );
    }

    // Token is valid, proceed with handler
    try {
      return await handler(request, context);
    } catch (error) {
      // Let error handlers deal with other errors
      throw error;
    }
  };
}

/**
 * Checks if request has valid CSRF token (for manual validation)
 */
export function isValidCsrfRequest(request: NextRequest): boolean {
  const validation = validateCsrfFromRequest(request);
  return validation.valid;
}

/**
 * CSRF middleware configuration options
 */
interface CsrfMiddlewareOptions {
  /**
   * Custom error message for CSRF validation failure
   */
  errorMessage?: string;

  /**
   * Custom status code for CSRF validation failure (default: 403)
   */
  statusCode?: number;

  /**
   * Skip CSRF validation for specific paths (use with caution)
   */
  skipPaths?: string[];

  /**
   * Additional methods to protect (default: POST, PUT, PATCH, DELETE)
   */
  additionalMethods?: string[];

  /**
   * Callback for successful CSRF validation
   */
  onValidationSuccess?: (request: NextRequest, token: string) => void;

  /**
   * Callback for failed CSRF validation
   */
  onValidationFailure?: (request: NextRequest, error: string) => void;
}

/**
 * Creates a configurable CSRF protection middleware
 */
export function createCsrfMiddleware(
  options: CsrfMiddlewareOptions = {}
): (handler: NextRouteHandler) => NextRouteHandler {
  const {
    errorMessage = 'CSRF token validation failed',
    statusCode = 403,
    skipPaths = [],
    onValidationSuccess,
    onValidationFailure,
  } = options;

  return (handler: NextRouteHandler) => {
    return async (request: NextRequest, context?: unknown) => {
      // Check if path should skip CSRF validation
      const url = new URL(request.url);
      if (skipPaths.some((path) => url.pathname.startsWith(path))) {
        logger.debug('CSRF validation skipped for path', {
          path: url.pathname,
        });
        return handler(request, context);
      }

      // Validate CSRF token
      const validation = validateCsrfFromRequest(request);

      if (!validation.valid) {
        logger.warn('CSRF protection blocked request (custom middleware)', {
          method: request.method,
          url: request.url,
          error: validation.error,
        });

        // Call failure callback if provided
        if (onValidationFailure) {
          onValidationFailure(request, validation.error || 'Unknown error');
        }

        return NextResponse.json(
          {
            error: 'Forbidden',
            message: errorMessage,
            code: 'CSRF_VALIDATION_FAILED',
          },
          { status: statusCode }
        );
      }

      // Call success callback if provided
      if (onValidationSuccess && validation.token) {
        onValidationSuccess(request, validation.token);
      }

      // Token is valid, proceed with handler
      return handler(request, context);
    };
  };
}

/**
 * Export CSRF error class for type checking
 */
export { CsrfError };
