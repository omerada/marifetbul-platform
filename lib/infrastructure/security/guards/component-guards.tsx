/**
 * ================================================
 * COMPONENT GUARDS (HOCs)
 * ================================================
 * 
 * Client-side guards for protecting React components.
 * Uses role-based access control for page-level protection.
 * 
 * ⚠️ NOTE: These perform client-side checks only.
 * For server-side protection, use API guards or middleware.
 * 
 * @module guards/component-guards
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint Day 2
 */

'use client';

import { redirect } from 'next/navigation';
import type { UserRole } from '../auth-utils';

// ================================================
// TYPES
// ================================================

/**
 * Component auth guard options
 */
export interface ComponentAuthGuardOptions {
  /**
   * Redirect URL if not authenticated
   */
  redirectTo?: string;

  /**
   * Redirect URL if not authorized (wrong role)
   */
  unauthorizedRedirect?: string;
}

// ================================================
// CLIENT-SIDE UTILITIES
// ================================================

/**
 * Check if user has token (client-side only)
 */
function hasAuthToken(): boolean {
  if (typeof window === 'undefined') return false;

  return document.cookie
    .split('; ')
    .some((cookie) => cookie.startsWith('marifetbul_token='));
}

/**
 * Get user role from cookie (client-side only)
 */
function getUserRoleFromCookie(): UserRole | null {
  if (typeof window === 'undefined') return null;

  const roleCookie = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('marifetbul-user-role='));

  if (!roleCookie) return null;

  return roleCookie.split('=')[1] as UserRole;
}

// ================================================
// COMPONENT GUARDS (HOCs)
// ================================================

/**
 * HOC for protecting page components
 * Redirects to login if not authenticated
 *
 * @example
 * ```tsx
 * export default withAuth(MyPage);
 * ```
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: ComponentAuthGuardOptions = {}
): React.ComponentType<P> {
  const { redirectTo = '/login' } = options;

  const ProtectedComponent = (props: P) => {
    // Client-side auth check
    if (typeof window !== 'undefined') {
      if (!hasAuthToken()) {
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
 * Redirects to login or unauthorized page based on role
 *
 * @example
 * ```tsx
 * export default withRole(AdminPage, ['ADMIN']);
 * ```
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  roles: UserRole | UserRole[],
  options: ComponentAuthGuardOptions = {}
): React.ComponentType<P> {
  const { redirectTo = '/login', unauthorizedRedirect = '/dashboard' } =
    options;

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  const ProtectedComponent = (props: P) => {
    // Client-side auth and role check
    if (typeof window !== 'undefined') {
      // Check authentication
      if (!hasAuthToken()) {
        const currentPath = window.location.pathname;
        redirect(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
        return null;
      }

      // Check role
      const userRole = getUserRoleFromCookie();
      
      if (!userRole) {
        const currentPath = window.location.pathname;
        redirect(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
        return null;
      }

      // Check if role is allowed
      if (!allowedRoles.includes(userRole)) {
        redirect(unauthorizedRedirect);
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
 *
 * @example
 * ```tsx
 * export default withAdminRole(AdminDashboard);
 * ```
 */
export function withAdminRole<P extends object>(
  Component: React.ComponentType<P>,
  options: ComponentAuthGuardOptions = {}
): React.ComponentType<P> {
  return withRole(Component, 'ADMIN', {
    redirectTo: '/admin/login',
    unauthorizedRedirect: '/dashboard',
    ...options,
  });
}

/**
 * HOC for moderator pages (moderators and admins allowed)
 *
 * @example
 * ```tsx
 * export default withModeratorRole(ModerationPanel);
 * ```
 */
export function withModeratorRole<P extends object>(
  Component: React.ComponentType<P>,
  options: ComponentAuthGuardOptions = {}
): React.ComponentType<P> {
  return withRole(Component, ['MODERATOR', 'ADMIN'], {
    redirectTo: '/login',
    unauthorizedRedirect: '/dashboard',
    ...options,
  });
}

/**
 * HOC for employer pages
 *
 * @example
 * ```tsx
 * export default withEmployerRole(EmployerDashboard);
 * ```
 */
export function withEmployerRole<P extends object>(
  Component: React.ComponentType<P>,
  options: ComponentAuthGuardOptions = {}
): React.ComponentType<P> {
  return withRole(Component, ['EMPLOYER', 'ADMIN'], options);
}

/**
 * HOC for freelancer pages
 *
 * @example
 * ```tsx
 * export default withFreelancerRole(FreelancerDashboard);
 * ```
 */
export function withFreelancerRole<P extends object>(
  Component: React.ComponentType<P>,
  options: ComponentAuthGuardOptions = {}
): React.ComponentType<P> {
  return withRole(Component, ['FREELANCER', 'ADMIN'], options);
}
