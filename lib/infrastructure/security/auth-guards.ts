/**
 * ================================================
 * API AUTH GUARDS
 * ================================================
 * Middleware functions for protecting API routes
 *
 * Features:
 * - Role-based API protection
 * - Permission-based API protection
 * - User context injection
 * - Error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 3.1: Admin vs Moderator Permission Separation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, type UserContext } from './auth-utils';
import {
  hasPermission,
  hasAnyPermission,
  canAccessAdmin,
  canAccessModerator,
  type Permission,
} from './permissions';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// TYPES
// ================================================

/**
 * Next.js API route handler type (Next.js 16+)
 */
export type NextRouteHandler = (
  request: Request,
  context?: { params: Promise<Record<string, string | string[]>> }
) => Promise<Response>;

/**
 * Enhanced route handler with user context (Next.js 16+)
 */
export type AuthenticatedRouteHandler = (
  request: Request,
  user: UserContext,
  context?: { params: Promise<Record<string, string | string[]>> }
) => Promise<Response>;

/**
 * Auth guard options
 */
export interface AuthGuardOptions {
  /**
   * Custom error message
   */
  errorMessage?: string;

  /**
   * Custom error status code
   */
  errorStatus?: number;

  /**
   * Optional permissions to check (alternative to role check)
   */
  requiredPermissions?: Permission[];

  /**
   * Whether ALL permissions are required (default: false - ANY permission)
   */
  requireAllPermissions?: boolean;
}

// ================================================
// GUARD UTILITIES
// ================================================

/**
 * Create unauthorized response
 */
function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'UNAUTHORIZED',
    },
    { status: 401 }
  );
}

/**
 * Create forbidden response
 */
function forbiddenResponse(message = 'Forbidden'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'FORBIDDEN',
    },
    { status: 403 }
  );
}

// ================================================
// AUTH GUARDS
// ================================================

/**
 * Require authentication
 * User must be logged in
 *
 * @param handler - Route handler to protect
 * @param options - Guard options
 * @returns Protected route handler
 *
 * @example
 * ```typescript
 * export const GET = requireAuth(async (request, user) => {
 *   // user is guaranteed to be authenticated
 *   return NextResponse.json({ userId: user.id });
 * });
 * ```
 */
export function requireAuth(
  handler: AuthenticatedRouteHandler,
  options: AuthGuardOptions = {}
): NextRouteHandler {
  return async (request: Request, context) => {
    try {
      const nextRequest = request as NextRequest;
      const user = await getUserFromRequest(nextRequest);

      if (!user) {
        logger.warn('Unauthorized API access attempt', {
          url: request.url,
        });
        return unauthorizedResponse(
          options.errorMessage || 'Authentication required'
        );
      }

      // Check permissions if specified
      if (
        options.requiredPermissions &&
        options.requiredPermissions.length > 0
      ) {
        const hasRequiredPermissions = options.requireAllPermissions
          ? options.requiredPermissions.every((p) => hasPermission(user, p))
          : options.requiredPermissions.some((p) => hasPermission(user, p));

        if (!hasRequiredPermissions) {
          logger.warn('Insufficient permissions', {
            url: request.url,
            userId: user.id,
            role: user.role,
            requiredPermissions: options.requiredPermissions,
          });
          return forbiddenResponse(
            options.errorMessage || 'Insufficient permissions'
          );
        }
      }

      return handler(request, user, context);
    } catch (error) {
      logger.error(
        'Auth guard error',
        error instanceof Error ? error : new Error(String(error)),
        { url: request.url }
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Require admin role
 * User must be authenticated and have admin role
 *
 * @param handler - Route handler to protect
 * @param options - Guard options
 * @returns Protected route handler
 *
 * @example
 * ```typescript
 * export const GET = requireAdmin(async (request, user) => {
 *   // user is guaranteed to be admin
 *   return NextResponse.json({ message: 'Admin only' });
 * });
 * ```
 */
export function requireAdmin(
  handler: AuthenticatedRouteHandler,
  options: AuthGuardOptions = {}
): NextRouteHandler {
  return requireAuth(async (request, user, context) => {
    if (!canAccessAdmin(user)) {
      logger.warn('Non-admin user attempted to access admin endpoint', {
        url: request.url,
        userId: user.id,
        role: user.role,
      });
      return forbiddenResponse(options.errorMessage || 'Admin access required');
    }

    return handler(request, user, context);
  }, options);
}

/**
 * Require moderator role (or admin)
 * User must be authenticated and have moderator or admin role
 *
 * @param handler - Route handler to protect
 * @param options - Guard options
 * @returns Protected route handler
 *
 * @example
 * ```typescript
 * export const GET = requireModerator(async (request, user) => {
 *   // user is guaranteed to be moderator or admin
 *   return NextResponse.json({ message: 'Moderator access' });
 * });
 * ```
 */
export function requireModerator(
  handler: AuthenticatedRouteHandler,
  options: AuthGuardOptions = {}
): NextRouteHandler {
  return requireAuth(async (request, user, context) => {
    if (!canAccessModerator(user)) {
      logger.warn('Non-moderator user attempted to access moderator endpoint', {
        url: request.url,
        userId: user.id,
        role: user.role,
      });
      return forbiddenResponse(
        options.errorMessage || 'Moderator access required'
      );
    }

    return handler(request, user, context);
  }, options);
}

/**
 * Require specific permission
 * User must be authenticated and have the specified permission
 *
 * @param permission - Required permission
 * @param handler - Route handler to protect
 * @param options - Guard options
 * @returns Protected route handler
 *
 * @example
 * ```typescript
 * export const POST = requirePermission(
 *   PERMISSIONS.USER_BAN,
 *   async (request, user) => {
 *     // user is guaranteed to have user.ban permission
 *     return NextResponse.json({ message: 'User banned' });
 *   }
 * );
 * ```
 */
export function requirePermission(
  permission: Permission,
  handler: AuthenticatedRouteHandler,
  options: AuthGuardOptions = {}
): NextRouteHandler {
  return requireAuth(
    async (request, user, context) => {
      if (!hasPermission(user, permission)) {
        logger.warn('User lacks required permission', {
          url: request.url,
          userId: user.id,
          role: user.role,
          requiredPermission: permission,
        });
        return forbiddenResponse(
          options.errorMessage ||
            `Permission required: ${permission.replace('.', ' ')}`
        );
      }

      return handler(request, user, context);
    },
    { ...options, requiredPermissions: [permission] }
  );
}

/**
 * Require any of the specified permissions
 * User must be authenticated and have at least one of the permissions
 *
 * @param permissions - Array of permissions (user needs at least one)
 * @param handler - Route handler to protect
 * @param options - Guard options
 * @returns Protected route handler
 *
 * @example
 * ```typescript
 * export const GET = requireAnyPermission(
 *   [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_MANAGE],
 *   async (request, user) => {
 *     // user has at least one of the permissions
 *     return NextResponse.json({ users: [] });
 *   }
 * );
 * ```
 */
export function requireAnyPermission(
  permissions: Permission[],
  handler: AuthenticatedRouteHandler,
  options: AuthGuardOptions = {}
): NextRouteHandler {
  return requireAuth(
    async (request, user, context) => {
      if (!hasAnyPermission(user, permissions)) {
        logger.warn('User lacks any of the required permissions', {
          url: request.url,
          userId: user.id,
          role: user.role,
          requiredPermissions: permissions,
        });
        return forbiddenResponse(
          options.errorMessage || 'Insufficient permissions'
        );
      }

      return handler(request, user, context);
    },
    {
      ...options,
      requiredPermissions: permissions,
      requireAllPermissions: false,
    }
  );
}

/**
 * Require all of the specified permissions
 * User must be authenticated and have all permissions
 *
 * @param permissions - Array of permissions (user needs all)
 * @param handler - Route handler to protect
 * @param options - Guard options
 * @returns Protected route handler
 *
 * @example
 * ```typescript
 * export const POST = requireAllPermissions(
 *   [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_EDIT],
 *   async (request, user) => {
 *     // user has all permissions
 *     return NextResponse.json({ success: true });
 *   }
 * );
 * ```
 */
export function requireAllPermissions(
  permissions: Permission[],
  handler: AuthenticatedRouteHandler,
  options: AuthGuardOptions = {}
): NextRouteHandler {
  return requireAuth(
    async (request, user, context) => {
      const missingPermissions = permissions.filter(
        (p) => !hasPermission(user, p)
      );

      if (missingPermissions.length > 0) {
        logger.warn('User lacks required permissions', {
          url: request.url,
          userId: user.id,
          role: user.role,
          missingPermissions,
        });
        return forbiddenResponse(
          options.errorMessage || 'Insufficient permissions'
        );
      }

      return handler(request, user, context);
    },
    {
      ...options,
      requiredPermissions: permissions,
      requireAllPermissions: true,
    }
  );
}

// ================================================
// EXPORTS
// ================================================

const authGuards = {
  requireAuth,
  requireAdmin,
  requireModerator,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
};

export default authGuards;
