/**
 * ================================================
 * AUTH UTILITIES
 * ================================================
 * Shared authentication utilities for middleware and guards
 *
 * Features:
 * - Token validation
 * - User extraction from cookies
 * - Role checking
 * - Route classification
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1.5: Auth System Cleanup
 */

import { NextRequest } from 'next/server';
import { getBackendApiUrl } from '@/lib/config/api';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// TYPES
// ================================================

/**
 * User roles in the system
 */
export type UserRole = 'ADMIN' | 'EMPLOYER' | 'FREELANCER' | 'USER';

/**
 * User context extracted from authentication
 */
export interface UserContext {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  username?: string;
}

/**
 * Token validation response from backend
 */
interface TokenValidationResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    name?: string;
    username?: string;
  };
  userId?: string;
  email?: string;
  role?: string;
  name?: string;
}

// ================================================
// ROUTE CONFIGURATION
// ================================================

/**
 * Route definitions for different access levels
 */
export const ROUTE_CONFIG = {
  /**
   * Routes that require authentication
   */
  protected: [
    '/dashboard',
    '/profile/edit',
    '/messages',
    '/my-jobs',
    '/my-packages',
    '/proposals',
    '/orders',
    '/freelancers',
    '/projects',
    '/notifications',
    '/wallet',
  ],

  /**
   * Routes that require admin role
   */
  admin: ['/admin'],

  /**
   * Authentication pages (redirect if already authenticated)
   */
  auth: ['/login', '/register', '/forgot-password', '/reset-password'],

  /**
   * Public routes (accessible to everyone)
   */
  public: [
    '/',
    '/marketplace',
    '/categories',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/blog',
    '/help',
    '/support',
    '/legal',
    '/info',
    '/search',
  ],

  /**
   * Admin login page (separate from regular auth)
   */
  adminLogin: '/admin/login',
} as const;

// ================================================
// COOKIE NAMES
// ================================================

/**
 * Cookie names used by the authentication system
 */
export const AUTH_COOKIES = {
  /**
   * JWT token (httpOnly, secure)
   */
  token: 'marifetbul_token',

  /**
   * User role (non-httpOnly for client access)
   */
  role: 'marifetbul-user-role',

  /**
   * User ID (non-httpOnly for client access)
   */
  userId: 'marifetbul-user-id',
} as const;

// ================================================
// TOKEN VALIDATION
// ================================================

/**
 * Validate token with backend API
 *
 * @param token - JWT token to validate
 * @returns User context if valid, null if invalid
 */
export async function validateToken(
  token: string
): Promise<UserContext | null> {
  try {
    const backendUrl = getBackendApiUrl();
    const response = await fetch(`${backendUrl}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${AUTH_COOKIES.token}=${token}`,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      logger.warn('Token validation failed', {
        status: response.status,
      });
      return null;
    }

    const data: TokenValidationResponse = await response.json();

    if (!data.valid && !data.user) {
      return null;
    }

    // Extract user info from validated response
    return {
      id: data.user?.id || data.userId || '',
      email: data.user?.email || data.email || '',
      role: normalizeRole(data.user?.role || data.role || 'USER'),
      name: data.user?.name || data.name,
      username: data.user?.username,
    };
  } catch (error) {
    logger.error(
      'Token validation error',
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

/**
 * Extract user context from Next.js request
 *
 * @param request - Next.js request object
 * @returns User context if authenticated, null otherwise
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<UserContext | null> {
  try {
    const token = request.cookies.get(AUTH_COOKIES.token)?.value;
    if (!token) {
      return null;
    }

    return await validateToken(token);
  } catch (error) {
    logger.error(
      'Failed to extract user from request',
      error instanceof Error ? error : new Error(String(error)),
      { url: request.url }
    );
    return null;
  }
}

/**
 * Extract user context from browser cookies (client-side)
 *
 * @returns User context if authenticated, null otherwise
 */
export function getUserFromCookies(): Partial<UserContext> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split('; ');
  const hasToken = cookies.some((cookie) =>
    cookie.startsWith(`${AUTH_COOKIES.token}=`)
  );

  if (!hasToken) {
    return null;
  }

  const roleCookie = cookies.find((cookie) =>
    cookie.startsWith(`${AUTH_COOKIES.role}=`)
  );
  const userIdCookie = cookies.find((cookie) =>
    cookie.startsWith(`${AUTH_COOKIES.userId}=`)
  );

  return {
    id: userIdCookie?.split('=')[1],
    role: roleCookie?.split('=')[1] as UserRole | undefined,
  };
}

// ================================================
// ROLE UTILITIES
// ================================================

/**
 * Normalize role to standard format
 *
 * @param role - Raw role string from backend
 * @returns Normalized UserRole
 */
export function normalizeRole(role: string): UserRole {
  const normalized = role.toUpperCase() as UserRole;

  // Validate against allowed roles
  if (['ADMIN', 'EMPLOYER', 'FREELANCER', 'USER'].includes(normalized)) {
    return normalized;
  }

  // Default to USER for unknown roles
  logger.warn('Unknown role, defaulting to USER', { role });
  return 'USER';
}

/**
 * Check if user has required role
 *
 * @param user - User context
 * @param allowedRoles - Array of allowed roles
 * @returns True if user has one of the allowed roles
 */
export function hasRole(
  user: UserContext | null,
  allowedRoles: UserRole[]
): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Check if user is authenticated
 *
 * @param user - User context
 * @returns True if user is authenticated
 */
export function isAuthenticated(user: UserContext | null): boolean {
  return user !== null;
}

/**
 * Check if user is admin
 *
 * @param user - User context
 * @returns True if user has admin role
 */
export function isAdmin(user: UserContext | null): boolean {
  return user?.role === 'ADMIN';
}

/**
 * Check if user is employer
 *
 * @param user - User context
 * @returns True if user has employer role
 */
export function isEmployer(user: UserContext | null): boolean {
  return user?.role === 'EMPLOYER';
}

/**
 * Check if user is freelancer
 *
 * @param user - User context
 * @returns True if user has freelancer role
 */
export function isFreelancer(user: UserContext | null): boolean {
  return user?.role === 'FREELANCER';
}

// ================================================
// ROUTE CLASSIFICATION
// ================================================

/**
 * Check if pathname matches a protected route
 *
 * @param pathname - URL pathname
 * @returns True if route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  return ROUTE_CONFIG.protected.some((route) => pathname.startsWith(route));
}

/**
 * Check if pathname matches an admin route
 *
 * @param pathname - URL pathname
 * @returns True if route requires admin role
 */
export function isAdminRoute(pathname: string): boolean {
  return (
    ROUTE_CONFIG.admin.some((route) => pathname.startsWith(route)) &&
    pathname !== ROUTE_CONFIG.adminLogin
  );
}

/**
 * Check if pathname is admin login page
 *
 * @param pathname - URL pathname
 * @returns True if pathname is admin login page
 */
export function isAdminLoginPage(pathname: string): boolean {
  return pathname === ROUTE_CONFIG.adminLogin;
}

/**
 * Check if pathname matches an auth route
 *
 * @param pathname - URL pathname
 * @returns True if route is an authentication page
 */
export function isAuthRoute(pathname: string): boolean {
  return ROUTE_CONFIG.auth.some((route) => pathname.startsWith(route));
}

/**
 * Check if pathname matches a public route
 *
 * @param pathname - URL pathname
 * @returns True if route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return ROUTE_CONFIG.public.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if pathname is a profile view (public)
 *
 * @param pathname - URL pathname
 * @returns True if pathname is a profile view page
 */
export function isProfileViewRoute(pathname: string): boolean {
  return pathname.startsWith('/profile/') && !pathname.includes('/edit');
}

// ================================================
// REDIRECT UTILITIES
// ================================================

/**
 * Get login redirect URL with return path
 *
 * @param currentPath - Current pathname to return to after login
 * @param isAdminPath - Whether to redirect to admin login
 * @returns Full redirect URL
 */
export function getLoginRedirectUrl(
  currentPath: string,
  isAdminPath = false
): string {
  const loginPath = isAdminPath ? ROUTE_CONFIG.adminLogin : '/login';
  return `${loginPath}?redirect=${encodeURIComponent(currentPath)}`;
}

/**
 * Get dashboard URL based on user role
 *
 * @param role - User role
 * @returns Dashboard URL for the role
 */
export function getDashboardUrl(role: UserRole): string {
  return role === 'ADMIN' ? '/admin' : '/dashboard';
}
