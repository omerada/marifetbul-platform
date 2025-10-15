/**
 * Auth utilities for cookie-based JWT authentication
 *
 * The backend uses httpOnly cookies for secure token storage.
 * Tokens are automatically sent with requests via credentials: 'include'.
 *
 * For getting user data, call the /api/v1/auth/me endpoint instead of
 * decoding the JWT client-side (tokens are in httpOnly cookies).
 */
import { logger } from '@/lib/shared/utils/logger';

/**
 * Get cookie value by name
 * Note: httpOnly cookies are NOT accessible via JavaScript for security.
 * This function only works for non-httpOnly cookies.
 */
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const matches = document.cookie.match(
    new RegExp(
      '(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'
    )
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

/**
 * Get current user ID
 *
 * Since JWT tokens are in httpOnly cookies, we cannot decode them client-side.
 * Instead, call the /api/v1/auth/me endpoint to get user data.
 *
 * This is a helper function that should be used with authentication state management.
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    // Call backend to get current user (JWT is in httpOnly cookie)
    const response = await fetch('/api/v1/auth/me', {
      method: 'GET',
      credentials: 'include', // Include httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data?.id || null;
  } catch (error) {
    logger.error(
      'Error getting current user ID',
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
};

/**
 * Check if user is authenticated
 *
 * Since tokens are in httpOnly cookies, we check authentication by
 * calling the backend /api/v1/auth/me endpoint.
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/v1/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    logger.error(
      'Error checking authentication',
      error instanceof Error ? error : new Error(String(error))
    );
    return false;
  }
};

/**
 * Logout user
 * Calls the backend logout endpoint which clears the httpOnly cookies.
 */
export const logout = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};
