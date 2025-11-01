/**
 * Authentication Guards
 *
 * HOCs and middleware for protecting routes based on authentication and authorization.
 * Implements role-based access control (RBAC) for different user types.
 *
 * Features:
 * - Authentication checks
 * - Role-based authorization
 * - Redirect to login if not authenticated
 * - Type-safe user context
 *
 * @example
 * ```tsx
 * import { withAuth, withRole } from '@/lib/infrastructure/security/auth-guards';
 *
 * // Protect a page component
 * export default withAuth(MyPage);
 *
 * // Protect with role check
 * export default withRole(AdminPage, ['ADMIN']);
 * ```
 */

'use client';

import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { Logger } from '../monitoring/logger';
import { UserRole, getUserFromRequest, hasRole } from './auth-utils';

const logger = new Logger({ level: 'info' });

// ============================================================================
// TYPES (Re-exported from auth-utils for convenience)
// ============================================================================

export type { UserRole, UserContext } from './auth-utils';

// Re-export utilities for backward compatibility
export { getUserFromRequest, hasRole, isAuthenticated } from './auth-utils';

/**
 * Auth guard options
 */
export interface AuthGuardOptions {
  /**
   * Allowed roles
   */
  roles?: UserRole[];

  /**
   * Redirect URL if not authenticated
   */
  redirectTo?: string;

  /**
   * Redirect URL if not authorized (wrong role)
   */
  unauthorizedRedirect?: string;

  /**
   * Skip authentication check
   */
  skip?: (request: NextRequest) => boolean | Promise<boolean>;
}

type NextRouteHandler = (
  request: NextRequest,
  context?: unknown
) => Promise<Response> | Response;

// ============================================================================
// API ROUTE GUARDS
// ============================================================================

/**
 * Require authentication for API route
 */
export function requireAuth(
  handler: NextRouteHandler,
  options: AuthGuardOptions = {}
): NextRouteHandler {
  const { redirectTo = '/login', skip } = options;

  return async (request: NextRequest, context?: unknown) => {
    try {
      // Check if should skip
      if (skip && (await skip(request))) {
        return await handler(request, context);
      }

      // Get user from request
      const user = await getUserFromRequest(request);

      if (!user) {
        logger.warn('Unauthorized API request - no user', {
          url: request.url,
          method: request.method,
        });

        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Authentication required',
            code: 'AUTH_REQUIRED',
            redirectTo,
          },
          { status: 401 }
        );
      }

      // User is authenticated, continue
      return await handler(request, context);
    } catch (error) {
      logger.error(
        'Auth guard error',
        error instanceof Error ? error : new Error(String(error)),
        {
          url: request.url,
          method: request.method,
        }
      );

      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Authentication check failed',
          code: 'AUTH_ERROR',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Require specific role for API route
 */
export function requireRole(
  handler: NextRouteHandler,
  roles: UserRole | UserRole[],
  options: AuthGuardOptions = {}
): NextRouteHandler {
  const {
    redirectTo = '/login',
    unauthorizedRedirect = '/dashboard',
    skip,
  } = options;

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return async (request: NextRequest, context?: unknown) => {
    try {
      // Check if should skip
      if (skip && (await skip(request))) {
        return await handler(request, context);
      }

      // Get user from request
      const user = await getUserFromRequest(request);

      if (!user) {
        logger.warn('Unauthorized API request - no user (role check)', {
          url: request.url,
          method: request.method,
          requiredRoles: allowedRoles,
        });

        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Authentication required',
            code: 'AUTH_REQUIRED',
            redirectTo,
          },
          { status: 401 }
        );
      }

      // Check role
      if (!hasRole(user, allowedRoles)) {
        logger.warn('Forbidden API request - insufficient role', {
          url: request.url,
          method: request.method,
          userRole: user.role,
          requiredRoles: allowedRoles,
        });

        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'Insufficient permissions',
            code: 'INSUFFICIENT_ROLE',
            redirectTo: unauthorizedRedirect,
          },
          { status: 403 }
        );
      }

      // User has required role, continue
      return await handler(request, context);
    } catch (error) {
      logger.error(
        'Role guard error',
        error instanceof Error ? error : new Error(String(error)),
        {
          url: request.url,
          method: request.method,
        }
      );

      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Authorization check failed',
          code: 'AUTH_ERROR',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Require admin role
 */
export function requireAdmin(
  handler: NextRouteHandler,
  options: AuthGuardOptions = {}
): NextRouteHandler {
  return requireRole(handler, 'ADMIN', options);
}

/**
 * Require moderator role (admins also allowed)
 */
export function requireModerator(
  handler: NextRouteHandler,
  options: AuthGuardOptions = {}
): NextRouteHandler {
  return requireRole(handler, ['MODERATOR', 'ADMIN'], options);
}

/**
 * Require employer role
 */
export function requireEmployer(
  handler: NextRouteHandler,
  options: AuthGuardOptions = {}
): NextRouteHandler {
  return requireRole(handler, ['EMPLOYER', 'ADMIN'], options);
}

/**
 * Require freelancer role
 */
export function requireFreelancer(
  handler: NextRouteHandler,
  options: AuthGuardOptions = {}
): NextRouteHandler {
  return requireRole(handler, ['FREELANCER', 'ADMIN'], options);
}

// ============================================================================
// COMPONENT GUARDS (HOCs)
// ============================================================================

/**
 * HOC for protecting page components
 *
 * Note: This checks auth on the client side and redirects if not authenticated.
 * For server-side protection, use middleware or server components.
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: AuthGuardOptions = {}
): React.ComponentType<P> {
  const { redirectTo = '/login' } = options;

  const ProtectedComponent = (props: P) => {
    // Client-side auth check
    if (typeof window !== 'undefined') {
      // Check for token cookie
      const hasToken = document.cookie
        .split('; ')
        .some((cookie) => cookie.startsWith('marifetbul_token='));

      if (!hasToken) {
        // Redirect to login
        const currentPath = window.location.pathname;
        redirect(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
        return null;
      }
    }

    return <Component {...props} />;
  };

  ProtectedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return ProtectedComponent;
}

/**
 * HOC for protecting page components with role check
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  roles: UserRole | UserRole[],
  options: AuthGuardOptions = {}
): React.ComponentType<P> {
  const { redirectTo = '/login', unauthorizedRedirect = '/dashboard' } =
    options;

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  const ProtectedComponent = (props: P) => {
    // Client-side auth and role check
    if (typeof window !== 'undefined') {
      // Check for token cookie
      const hasToken = document.cookie
        .split('; ')
        .some((cookie) => cookie.startsWith('marifetbul_token='));

      if (!hasToken) {
        // Redirect to login
        const currentPath = window.location.pathname;
        redirect(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
        return null;
      }

      // Check role cookie
      const roleCookie = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('marifetbul-user-role='));

      if (roleCookie) {
        const role = roleCookie.split('=')[1] as UserRole;

        if (!allowedRoles.includes(role)) {
          // Redirect to unauthorized page
          redirect(unauthorizedRedirect);
          return null;
        }
      } else {
        // No role cookie, redirect to login
        const currentPath = window.location.pathname;
        redirect(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
        return null;
      }
    }

    return <Component {...props} />;
  };

  ProtectedComponent.displayName = `withRole(${Component.displayName || Component.name || 'Component'})`;

  return ProtectedComponent;
}

/**
 * HOC for admin-only pages
 */
export function withAdminRole<P extends object>(
  Component: React.ComponentType<P>,
  options: AuthGuardOptions = {}
): React.ComponentType<P> {
  return withRole(Component, 'ADMIN', {
    redirectTo: '/admin/login',
    unauthorizedRedirect: '/dashboard',
    ...options,
  });
}
