/**
 * CSRF Protection Utilities
 *
 * Provides Cross-Site Request Forgery protection for all mutation requests.
 * Implements double-submit cookie pattern for stateless CSRF protection.
 *
 * Features:
 * - Token generation with crypto
 * - Token validation
 * - Cookie management
 * - Automatic token refresh
 * - Request interceptor integration
 *
 * @see https://owasp.org/www-community/attacks/csrf
 */

import { logger } from '@/lib/infrastructure/monitoring';

// CSRF Configuration
const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const TOKEN_LENGTH = 32;

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
  if (typeof window === 'undefined') {
    // Server-side: use Node.js crypto
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
  }

  // Client-side: use Web Crypto API
  const array = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

/**
 * Store CSRF token in cookie
 */
export function setCsrfTokenCookie(token: string): void {
  if (typeof document === 'undefined') return;

  const secure = process.env.NODE_ENV === 'production';
  const sameSite = process.env.NODE_ENV === 'production' ? 'strict' : 'lax';

  document.cookie = `${CSRF_TOKEN_NAME}=${token}; path=/; ${secure ? 'secure;' : ''} SameSite=${sameSite}; max-age=${60 * 60 * 24}`; // 24 hours
}

/**
 * Get CSRF token from cookie
 */
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_TOKEN_NAME) {
      return value;
    }
  }
  return null;
}

/**
 * Get or create CSRF token
 * Creates a new token if one doesn't exist
 */
export function getOrCreateCsrfToken(): string {
  let token = getCsrfTokenFromCookie();

  if (!token) {
    token = generateCsrfToken();
    setCsrfTokenCookie(token);
    logger.debug('CSRF token generated', {
      token: token.substring(0, 8) + '...',
    });
  }

  return token;
}

/**
 * Validate CSRF token
 * Compares token from header with token from cookie
 */
export function validateCsrfToken(
  headerToken: string | null,
  cookieToken: string | null
): boolean {
  if (!headerToken || !cookieToken) {
    logger.warn('CSRF validation failed: missing token', {
      hasHeader: !!headerToken,
      hasCookie: !!cookieToken,
    });
    return false;
  }

  const isValid = headerToken === cookieToken;

  if (!isValid) {
    logger.warn('CSRF validation failed: token mismatch', {
      headerToken: headerToken.substring(0, 8) + '...',
      cookieToken: cookieToken.substring(0, 8) + '...',
    });
  }

  return isValid;
}

/**
 * Add CSRF token to request headers
 */
export function addCsrfTokenToHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getOrCreateCsrfToken();

  return {
    ...headers,
    [CSRF_HEADER_NAME]: token,
  };
}

/**
 * Check if request method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return protectedMethods.includes(method.toUpperCase());
}

/**
 * Refresh CSRF token
 * Generates and stores a new token
 */
export function refreshCsrfToken(): string {
  const token = generateCsrfToken();
  setCsrfTokenCookie(token);
  logger.debug('CSRF token refreshed');
  return token;
}

/**
 * Clear CSRF token
 */
export function clearCsrfToken(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${CSRF_TOKEN_NAME}=; path=/; max-age=0`;
  logger.debug('CSRF token cleared');
}

/**
 * CSRF Error class
 */
export class CsrfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CsrfError';
  }
}

/**
 * Get CSRF header name (for API routes)
 */
export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME;
}

/**
 * Get CSRF cookie name (for API routes)
 */
export function getCsrfCookieName(): string {
  return CSRF_TOKEN_NAME;
}

const csrfProtection = {
  generateCsrfToken,
  setCsrfTokenCookie,
  getCsrfTokenFromCookie,
  getOrCreateCsrfToken,
  validateCsrfToken,
  addCsrfTokenToHeaders,
  requiresCsrfProtection,
  refreshCsrfToken,
  clearCsrfToken,
  getCsrfHeaderName,
  getCsrfCookieName,
  CsrfError,
};

export default csrfProtection;
