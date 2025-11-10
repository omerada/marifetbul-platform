import { NextRequest, NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/config/api';
import logger from '@/lib/infrastructure/monitoring/logger';
import { getUserPermissions as getRolePermissions } from '@/lib/infrastructure/security/permissions';
import type { UserContext } from '@/lib/infrastructure/security/auth-utils';

interface AdminUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'MODERATOR' | 'FREELANCER' | 'EMPLOYER';
  permissions: string[];
  isActive: boolean;
}

// ================================================
// ADMIN ROUTE PERMISSIONS
// ================================================
// Maps admin routes to required permissions from central permission system
// Using permissions from lib/infrastructure/security/permissions.ts
// ================================================

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/admin': [], // Basic admin access (checked by role)

  // User Management
  '/admin/users': ['user.view'],
  '/admin/users/create': ['user.create'],
  '/admin/users/edit': ['user.edit'],
  '/admin/users/delete': ['user.delete'],
  '/admin/users/verifications': ['user.view'],
  '/admin/users/groups': ['user.view'],
  '/admin/users/blocked': ['user.view'],

  // Analytics
  '/admin/analytics': ['analytics.view'],
  '/admin/analytics/users': ['analytics.view'],
  '/admin/analytics/financial': ['revenue.view'],
  '/admin/analytics/performance': ['analytics.view'],

  // Moderation
  '/admin/moderation': ['content.moderate'],
  '/admin/moderation/reports': ['report.view'],
  '/admin/moderation/rules': ['content.moderate'],
  '/admin/moderation/blocked': ['content.moderate'],

  // Financial
  '/admin/financial': ['payment.view'],
  '/admin/financial/payments': ['payment.view'],
  '/admin/financial/withdrawals': ['payment.view'],
  '/admin/financial/commissions': ['commission.manage'],
  '/admin/financial/invoices': ['payment.view'],

  // Content
  '/admin/content': ['content.moderate'],
  '/admin/content/jobs': ['content.moderate'],
  '/admin/content/packages': ['package.approve'],
  '/admin/content/categories': ['category.manage'],
  '/admin/content/pages': ['content.moderate'],
  '/admin/content/media': ['content.moderate'],

  // Messaging
  '/admin/messaging': ['ticket.view'],
  '/admin/messaging/reports': ['report.view'],
  '/admin/messaging/system': ['ticket.respond'],
  '/admin/messaging/blocked-words': ['content.moderate'],

  // Support
  '/admin/support': ['ticket.view'],
  '/admin/support/faq': ['content.moderate'],
  '/admin/support/knowledge-base': ['content.moderate'],
  '/admin/support/feedback': ['ticket.view'],

  // Reports
  '/admin/reports': ['analytics.view'],
  '/admin/reports/daily': ['analytics.view'],
  '/admin/reports/monthly': ['analytics.view'],
  '/admin/reports/custom': ['analytics.export'],
  '/admin/reports/performance': ['analytics.view'],

  // System
  '/admin/system': ['system.health'],
  '/admin/system/health': ['system.health'],
  '/admin/system/backup': ['system.settings'],
  '/admin/system/logs': ['system.logs'],
  '/admin/system/performance': ['system.health'],

  // Security
  '/admin/security': ['system.settings'],
  '/admin/security/2fa': ['system.settings'],
  '/admin/security/api-keys': ['system.settings'],
  '/admin/security/logs': ['system.logs'],

  // Settings
  '/admin/settings': ['system.settings'],
  '/admin/settings/email': ['system.settings'],
  '/admin/settings/notifications': ['system.settings'],
  '/admin/settings/api': ['system.settings'],
  '/admin/settings/maintenance': ['system.settings'],
};

/**
 * Check if user has required permissions for a given route
 */
export function hasPermission(
  userRole: string,
  userPermissions: string[],
  route: string
): boolean {
  // Admin has access to everything
  if (userRole === 'ADMIN') {
    return true;
  }

  // Get required permissions for the route
  const requiredPermissions = getRequiredPermissions(route);

  if (requiredPermissions.length === 0) {
    return true; // No specific permissions required
  }

  // Check if user has at least one of the required permissions
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
}

/**
 * Get required permissions for a route
 */
export function getRequiredPermissions(route: string): string[] {
  // Exact match first
  if (ROUTE_PERMISSIONS[route]) {
    return ROUTE_PERMISSIONS[route];
  }

  // Find the most specific match
  const sortedRoutes = Object.keys(ROUTE_PERMISSIONS)
    .filter((routePattern) => route.startsWith(routePattern))
    .sort((a, b) => b.length - a.length); // Sort by length desc for most specific match

  if (sortedRoutes.length > 0) {
    return ROUTE_PERMISSIONS[sortedRoutes[0]];
  }

  return [];
}

/**
 * Get user permissions based on role
 * Uses central permission system
 */
export function getUserPermissions(role: string): string[] {
  // Convert role to UserRole type and get permissions from central system
  const userContext: UserContext = {
    id: '',
    email: '',
    role: role as 'ADMIN' | 'MODERATOR' | 'EMPLOYER' | 'FREELANCER',
  };

  return getRolePermissions(userContext);
}

/**
 * Get user from cookie/session (simplified)
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<AdminUser | null> {
  try {
    const authCookie = request.cookies.get('auth-token');

    if (!authCookie) {
      return null;
    }

    // Validate JWT token with backend
    const response = await fetch(`${getBackendApiUrl()}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth-token=${authCookie.value}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      permissions: getUserPermissions(data.user.role),
      isActive: data.user.isActive,
    };
  } catch (error) {
    logger.error(
      'Error getting user from request',
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

/**
 * Admin middleware for route protection
 */
export async function adminMiddleware(request: NextRequest) {
  const user = await getUserFromRequest(request);

  // Check if user is authenticated
  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Check if user has admin role
  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Check if user account is active
  if (!user.isActive) {
    return NextResponse.redirect(new URL('/account-suspended', request.url));
  }

  const pathname = request.nextUrl.pathname;
  const userPermissions = getUserPermissions(user.role);

  // Check route permissions
  if (!hasPermission(user.role, userPermissions, pathname)) {
    return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
  }

  // Add user info to headers for use in components
  const response = NextResponse.next();
  response.headers.set(
    'x-admin-user',
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: userPermissions,
    })
  );

  return response;
}

/**
 * API middleware for admin API routes
 */
export async function adminApiMiddleware(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  if (!user.isActive) {
    return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
  }

  return NextResponse.next();
}

/**
 * Check permissions for API actions
 */
export function checkApiPermission(
  userRole: string,
  action: string,
  resource: string
): boolean {
  const permission = `${resource}.${action}`;
  const userPermissions = getUserPermissions(userRole);

  // Admin has all permissions
  if (userRole === 'ADMIN') {
    return true;
  }

  return userPermissions.includes(permission);
}

/**
 * Higher-order function to protect API routes
 */
export function withAdminAuth(
  handler: (
    req: NextRequest,
    context: { params: Record<string, string> }
  ) => Promise<Response>,
  requiredPermission?: string
) {
  return async (
    req: NextRequest,
    context: { params: Record<string, string> }
  ) => {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }

    // Check specific permission if required
    if (requiredPermission) {
      const userPermissions = getUserPermissions(user.role);
      if (
        !userPermissions.includes(requiredPermission) &&
        user.role !== 'ADMIN'
      ) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Add user to request
    (req as NextRequest & { user: AdminUser }).user = user;

    return handler(req, context);
  };
}

/**
 * Utility to get current admin user from request
 */
export async function getCurrentAdminUser(
  request: NextRequest
): Promise<AdminUser | null> {
  return getUserFromRequest(request);
}

export default adminMiddleware;
