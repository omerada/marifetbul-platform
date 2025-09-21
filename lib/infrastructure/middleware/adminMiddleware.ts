import { NextRequest, NextResponse } from 'next/server';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin' | 'user';
  permissions: string[];
  isActive: boolean;
}

// Define role-based permissions
const ROLE_PERMISSIONS = {
  super_admin: [
    'admin:dashboard:view',
    'admin:users:read',
    'admin:users:write',
    'admin:users:delete',
    'admin:moderation:read',
    'admin:moderation:write',
    'admin:financial:read',
    'admin:financial:write',
    'admin:content:read',
    'admin:content:write',
    'admin:content:delete',
    'admin:messaging:read',
    'admin:messaging:write',
    'admin:analytics:read',
    'admin:reports:read',
    'admin:reports:write',
    'admin:system:read',
    'admin:system:write',
    'admin:security:read',
    'admin:security:write',
    'admin:settings:read',
    'admin:settings:write',
  ],
  admin: [
    'admin:dashboard:view',
    'admin:users:read',
    'admin:users:write',
    'admin:moderation:read',
    'admin:moderation:write',
    'admin:financial:read',
    'admin:content:read',
    'admin:content:write',
    'admin:messaging:read',
    'admin:analytics:read',
    'admin:reports:read',
    'admin:settings:read',
  ],
  user: [],
};

// Define route permissions
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/admin': ['admin:dashboard:view'],
  '/admin/users': ['admin:users:read'],
  '/admin/users/create': ['admin:users:write'],
  '/admin/users/edit': ['admin:users:write'],
  '/admin/users/delete': ['admin:users:delete'],
  '/admin/users/verifications': ['admin:users:read'],
  '/admin/users/groups': ['admin:users:read'],
  '/admin/users/blocked': ['admin:users:read'],

  '/admin/analytics': ['admin:analytics:read'],
  '/admin/analytics/users': ['admin:analytics:read'],
  '/admin/analytics/financial': ['admin:analytics:read'],
  '/admin/analytics/performance': ['admin:analytics:read'],

  '/admin/moderation': ['admin:moderation:read'],
  '/admin/moderation/reports': ['admin:moderation:read'],
  '/admin/moderation/rules': ['admin:moderation:write'],
  '/admin/moderation/blocked': ['admin:moderation:read'],

  '/admin/financial': ['admin:financial:read'],
  '/admin/financial/payments': ['admin:financial:read'],
  '/admin/financial/withdrawals': ['admin:financial:read'],
  '/admin/financial/commissions': ['admin:financial:read'],
  '/admin/financial/invoices': ['admin:financial:read'],

  '/admin/content': ['admin:content:read'],
  '/admin/content/jobs': ['admin:content:read'],
  '/admin/content/packages': ['admin:content:read'],
  '/admin/content/categories': ['admin:content:read'],
  '/admin/content/pages': ['admin:content:read'],
  '/admin/content/media': ['admin:content:read'],

  '/admin/messaging': ['admin:messaging:read'],
  '/admin/messaging/reports': ['admin:messaging:read'],
  '/admin/messaging/system': ['admin:messaging:write'],
  '/admin/messaging/blocked-words': ['admin:messaging:write'],

  '/admin/support': ['admin:messaging:read'],
  '/admin/support/faq': ['admin:content:read'],
  '/admin/support/knowledge-base': ['admin:content:read'],
  '/admin/support/feedback': ['admin:messaging:read'],

  '/admin/reports': ['admin:reports:read'],
  '/admin/reports/daily': ['admin:reports:read'],
  '/admin/reports/monthly': ['admin:reports:read'],
  '/admin/reports/custom': ['admin:reports:write'],
  '/admin/reports/performance': ['admin:reports:read'],

  '/admin/system': ['admin:system:read'],
  '/admin/system/health': ['admin:system:read'],
  '/admin/system/backup': ['admin:system:write'],
  '/admin/system/logs': ['admin:system:read'],
  '/admin/system/performance': ['admin:system:read'],

  '/admin/security': ['admin:security:read'],
  '/admin/security/2fa': ['admin:security:write'],
  '/admin/security/api-keys': ['admin:security:write'],
  '/admin/security/logs': ['admin:security:read'],

  '/admin/settings': ['admin:settings:read'],
  '/admin/settings/email': ['admin:settings:write'],
  '/admin/settings/notifications': ['admin:settings:write'],
  '/admin/settings/api': ['admin:settings:write'],
  '/admin/settings/maintenance': ['admin:settings:write'],
};

/**
 * Check if user has required permissions for a given route
 */
export function hasPermission(
  userRole: string,
  userPermissions: string[],
  route: string
): boolean {
  // Super admin has access to everything
  if (userRole === 'super_admin') {
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
 */
export function getUserPermissions(role: string): string[] {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
}

/**
 * Get user from cookie/session (simplified)
 */
export function getUserFromRequest(request: NextRequest): AdminUser | null {
  try {
    // In a real app, you would validate JWT token from cookies
    const authCookie = request.cookies.get('auth-token');

    if (!authCookie) {
      return null;
    }

    // For demo purposes, return a mock admin user
    // In production, decode and validate JWT token here
    return {
      id: '1',
      email: 'admin@marifetbul.com',
      role: 'super_admin',
      permissions: getUserPermissions('super_admin'),
      isActive: true,
    };
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

/**
 * Admin middleware for route protection
 */
export async function adminMiddleware(request: NextRequest) {
  const user = getUserFromRequest(request);

  // Check if user is authenticated
  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Check if user has admin role
  if (!['admin', 'super_admin'].includes(user.role)) {
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
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  if (!['admin', 'super_admin'].includes(user.role)) {
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
  const permission = `admin:${resource}:${action}`;
  const userPermissions = getUserPermissions(userRole);

  if (userRole === 'super_admin') {
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
    const user = getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['admin', 'super_admin'].includes(user.role)) {
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
        user.role !== 'super_admin'
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
