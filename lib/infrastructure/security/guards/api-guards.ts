/**
 * ================================================
 * API ROUTE GUARDS
 * ================================================
 *
 * Server-side guards for protecting API routes.
 * Uses permission-based access control for fine-grained authorization.
 *
 * @module guards/api-guards
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint Day 2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, type UserContext } from '../auth-utils';
import {
  hasPermission,
  hasAnyPermission,
  canAccessAdmin,
  canAccessModerator,
  type Permission,
} from '../permissions';
import logger from '@/lib/infrastructure/monitoring/logger';

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
 * API Auth guard options
 */
export interface ApiAuthGuardOptions {
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
// RESPONSE UTILITIES
// ================================================

/**
 * Create unauthorized response (401)
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
 * Create forbidden response (403)
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
 *   return NextResponse.json({ userId: user.id });
 * });
 * ```
 */
export function requireAuth(
  handler: AuthenticatedRouteHandler,
  options: ApiAuthGuardOptions = {}
): NextRouteHandler {
  return async (request: Request, context) => {
    try {
      const nextRequest = request as NextRequest;
      const user = await getUserFromRequest(nextRequest);

      if (!user) {
        logger.warn('Unauthorized API access attempt', { urlrequesturl,  });
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
          logger.warn('Insufficient permissions', { urlrequesturl, userIduserid, roleuserrole, requiredPermissionsoptionsrequiredPermissions,  });
          return forbiddenResponse(
            options.errorMessage || 'Insufficient permissions'
          );
        }
      }

      return handler(request, user, context);
    } catch (error) {
      logger.error(
        'Auth guard error',
        error,
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
 *
 * @example
 * ```typescript
 * export const GET = requireAdmin(async (request, user) => {
 *   return NextResponse.json({ message: 'Admin only' });
 * });
 * ```
 */
export function requireAdmin(
  handler: AuthenticatedRouteHandler,
  options: ApiAuthGuardOptions = {}
): NextRouteHandler {
  return requireAuth(async (request, user, context) => {
    if (!canAccessAdmin(user)) {
      logger.warn('Non-admin user attempted to access admin endpoint', { urlrequesturl, userIduserid, roleuserrole,  });
      return forbiddenResponse(options.errorMessage || 'Admin access required');
    }

    return handler(request, user, context);
  }, options);
}

/**
 * Require moderator role (or admin)
 *
 * @example
 * ```typescript
 * export const GET = requireModerator(async (request, user) => {
 *   return NextResponse.json({ message: 'Moderator access' });
 * });
 * ```
 */
export function requireModerator(
  handler: AuthenticatedRouteHandler,
  options: ApiAuthGuardOptions = {}
): NextRouteHandler {
  return requireAuth(async (request, user, context) => {
    if (!canAccessModerator(user)) {
      logger.warn('Non-moderator user attempted to access moderator endpoint', { urlrequesturl, userIduserid, roleuserrole,  });
      return forbiddenResponse(
        options.errorMessage || 'Moderator access required'
      );
    }

    return handler(request, user, context);
  }, options);
}

/**
 * Require specific permission
 *
 * @example
 * ```typescript
 * export const POST = requirePermission(
 *   PERMISSIONS.USER_BAN,
 *   async (request, user) => {
 *     return NextResponse.json({ message: 'User banned' });
 *   }
 * );
 * ```
 */
export function requirePermission(
  permission: Permission,
  handler: AuthenticatedRouteHandler,
  options: ApiAuthGuardOptions = {}
): NextRouteHandler {
  return requireAuth(
    async (request, user, context) => {
      if (!hasPermission(user, permission)) {
        logger.warn('User lacks required permission', { urlrequesturl, userIduserid, roleuserrole, requiredPermissionpermission,  });
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
 *
 * @example
 * ```typescript
 * export const GET = requireAnyPermission(
 *   [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_MANAGE],
 *   async (request, user) => {
 *     return NextResponse.json({ users: [] });
 *   }
 * );
 * ```
 */
export function requireAnyPermission(
  permissions: Permission[],
  handler: AuthenticatedRouteHandler,
  options: ApiAuthGuardOptions = {}
): NextRouteHandler {
  return requireAuth(
    async (request, user, context) => {
      if (!hasAnyPermission(user, permissions)) {
        logger.warn('User lacks any of the required permissions', { urlrequesturl, userIduserid, roleuserrole, requiredPermissionspermissions,  });
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
 *
 * @example
 * ```typescript
 * export const POST = requireAllPermissions(
 *   [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_EDIT],
 *   async (request, user) => {
 *     return NextResponse.json({ success: true });
 *   }
 * );
 * ```
 */
export function requireAllPermissions(
  permissions: Permission[],
  handler: AuthenticatedRouteHandler,
  options: ApiAuthGuardOptions = {}
): NextRouteHandler {
  return requireAuth(
    async (request, user, context) => {
      const missingPermissions = permissions.filter(
        (p) => !hasPermission(user, p)
      );

      if (missingPermissions.length > 0) {
        logger.warn('User lacks required permissions', { urlrequesturl, userIduserid, roleuserrole, missingPermissions,  });
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
