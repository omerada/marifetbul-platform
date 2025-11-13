/**
 * ================================================
 * USE DASHBOARD PERMISSIONS HOOK (UNIFIED)
 * ================================================
 * Sprint 1: Permission System Unification
 * 
 * Uses central permission system from lib/infrastructure/security/permissions.ts
 * No duplicate permission logic - single source of truth
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Unified with central permission system
 */

'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import {
  canAccessAdmin,
  canManageUsers,
  canModerateContent,
  hasPermission,
  PERMISSIONS,
} from '@/lib/infrastructure/security/permissions';
import type { UserContext } from '@/lib/infrastructure/security/auth-utils';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Dashboard feature permissions
 * Mapped from central permission system
 */
export interface DashboardPermissions {
  // View permissions
  canViewStats: boolean;
  canViewCharts: boolean;
  canViewActivity: boolean;
  canViewFinancials: boolean;
  canViewSystemHealth: boolean;
  canViewAnalytics: boolean;

  // Action permissions
  canRefreshData: boolean;
  canExportData: boolean;
  canChangePeriod: boolean;
  canCustomizeLayout: boolean;

  // Management permissions
  canManageUsers: boolean;
  canModerateContent: boolean;
  canAccessAdminPanel: boolean;
  canViewAllOrders: boolean;

  // Feature flags
  canUseQuickActions: boolean;
  canAccessBulkActions: boolean;
  canSetNotifications: boolean;
}

/**
 * Permission check result
 */
export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

/**
 * Hook return value
 */
export interface UseDashboardPermissionsReturn extends DashboardPermissions {
  // Role info
  role: string | null;
  isAdmin: boolean;
  isModerator: boolean;
  isFreelancer: boolean;
  isEmployer: boolean;

  // Helper methods
  canAccess: (feature: keyof DashboardPermissions) => boolean;
  checkPermission: (feature: keyof DashboardPermissions) => PermissionCheck;
  hasAnyPermission: (features: Array<keyof DashboardPermissions>) => boolean;
  hasAllPermissions: (features: Array<keyof DashboardPermissions>) => boolean;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Dashboard permissions hook using central permission system
 *
 * @example
 * ```tsx
 * function DashboardComponent() {
 *   const {
 *     canViewFinancials,
 *     canExportData,
 *     isAdmin,
 *     checkPermission
 *   } = useDashboardPermissions();
 *
 *   if (!canViewFinancials) {
 *     return <PermissionDenied />;
 *   }
 *
 *   return (
 *     <>
 *       <FinancialStats />
 *       {canExportData && <ExportButton />}
 *     </>
 *   );
 * }
 * ```
 */
export function useDashboardPermissions(): UseDashboardPermissionsReturn {
  // Auth state
  const { user, isAuthenticated } = useAuthStore();

  // Create UserContext for permission checks
  const userContext = useMemo<UserContext | null>(() => {
    if (!isAuthenticated || !user) return null;
    
    return {
      id: user.id,
      email: user.email,
      role: user.userType as 'ADMIN' | 'MODERATOR' | 'EMPLOYER' | 'FREELANCER',
      name: user.name,
      username: user.username,
    };
  }, [isAuthenticated, user]);

  // Get permissions using central system
  const permissions = useMemo<DashboardPermissions>(() => {
    if (!userContext) {
      // Not authenticated - no permissions
      return {
        canViewStats: false,
        canViewCharts: false,
        canViewActivity: false,
        canViewFinancials: false,
        canViewSystemHealth: false,
        canViewAnalytics: false,
        canRefreshData: false,
        canExportData: false,
        canChangePeriod: false,
        canCustomizeLayout: false,
        canManageUsers: false,
        canModerateContent: false,
        canAccessAdminPanel: false,
        canViewAllOrders: false,
        canUseQuickActions: false,
        canAccessBulkActions: false,
        canSetNotifications: false,
      };
    }

    // Map central permissions to dashboard features
    return {
      // View permissions
      canViewStats: true, // All authenticated users can view their stats
      canViewCharts: true, // All authenticated users
      canViewActivity: true, // All authenticated users
      canViewFinancials: hasPermission(userContext, PERMISSIONS.PAYMENT_VIEW),
      canViewSystemHealth: hasPermission(userContext, PERMISSIONS.SYSTEM_HEALTH),
      canViewAnalytics: hasPermission(userContext, PERMISSIONS.ANALYTICS_VIEW),

      // Action permissions
      canRefreshData: true, // All authenticated users
      canExportData: hasPermission(userContext, PERMISSIONS.ANALYTICS_EXPORT),
      canChangePeriod: true, // All authenticated users
      canCustomizeLayout: userContext.role === 'ADMIN', // Admin only

      // Management permissions
      canManageUsers: canManageUsers(userContext),
      canModerateContent: canModerateContent(userContext),
      canAccessAdminPanel: canAccessAdmin(userContext),
      canViewAllOrders: hasPermission(userContext, PERMISSIONS.ORDER_VIEW_ALL),

      // Feature flags
      canUseQuickActions: true, // All authenticated users
      canAccessBulkActions: userContext.role === 'ADMIN', // Admin only
      canSetNotifications: true, // All authenticated users
    };
  }, [userContext]);

  // Role flags
  const isAdmin = userContext?.role === 'ADMIN';
  const isModerator = userContext?.role === 'MODERATOR';
  const isFreelancer = userContext?.role === 'FREELANCER';
  const isEmployer = userContext?.role === 'EMPLOYER';

  // Helper: Check single permission
  const canAccess = useMemo(
    () =>
      (feature: keyof DashboardPermissions): boolean => {
        return permissions[feature];
      },
    [permissions]
  );

  // Helper: Check with reason
  const checkPermission = useMemo(
    () =>
      (feature: keyof DashboardPermissions): PermissionCheck => {
        const allowed = permissions[feature];

        if (allowed) {
          return { allowed: true };
        }

        // Provide reason based on role
        let reason = 'You do not have permission to access this feature';

        if (!isAuthenticated) {
          reason = 'You must be logged in to access this feature';
        } else if (userContext?.role === 'FREELANCER' || userContext?.role === 'EMPLOYER') {
          if (
            feature === 'canManageUsers' ||
            feature === 'canModerateContent'
          ) {
            reason = 'This feature is only available to administrators';
          } else if (feature === 'canViewSystemHealth') {
            reason = 'System health is only visible to administrators';
          }
        }

        return { allowed: false, reason };
      },
    [permissions, isAuthenticated, userContext?.role]
  );

  // Helper: Check any of multiple permissions
  const hasAnyPermissionHelper = useMemo(
    () =>
      (features: Array<keyof DashboardPermissions>): boolean => {
        return features.some((feature) => permissions[feature]);
      },
    [permissions]
  );

  // Helper: Check all of multiple permissions
  const hasAllPermissionsHelper = useMemo(
    () =>
      (features: Array<keyof DashboardPermissions>): boolean => {
        return features.every((feature) => permissions[feature]);
      },
    [permissions]
  );

  return {
    // Spread all permissions
    ...permissions,

    // Role info
    role: userContext?.role ?? null,
    isAdmin,
    isModerator,
    isFreelancer,
    isEmployer,

    // Helper methods
    canAccess,
    checkPermission,
    hasAnyPermission: hasAnyPermissionHelper,
    hasAllPermissions: hasAllPermissionsHelper,
  };
}

/**
 * Simple permission check hook for specific feature
 *
 * @example
 * ```tsx
 * function ExportButton() {
 *   const canExport = usePermission('canExportData');
 *
 *   if (!canExport) return null;
 *
 *   return <button>Export</button>;
 * }
 * ```
 */
export function usePermission(feature: keyof DashboardPermissions): boolean {
  const permissions = useDashboardPermissions();
  return permissions[feature];
}
