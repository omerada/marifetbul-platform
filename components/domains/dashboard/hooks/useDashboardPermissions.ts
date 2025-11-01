/**
 * ================================================
 * USE DASHBOARD PERMISSIONS HOOK
 * ================================================
 * Sprint 1 - Day 5: Permission management for dashboard features
 *
 * Features:
 * - Role-based permission checks
 * - Feature access control
 * - Action authorization
 * - Type-safe permission helpers
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import type { UserRole } from './useDashboard';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Dashboard feature permissions
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
  role: UserRole | null;
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
// PERMISSION MATRIX
// ============================================================================

/**
 * Permission matrix by role
 */
const PERMISSION_MATRIX: Record<UserRole, DashboardPermissions> = {
  admin: {
    // View permissions
    canViewStats: true,
    canViewCharts: true,
    canViewActivity: true,
    canViewFinancials: true,
    canViewSystemHealth: true,
    canViewAnalytics: true,

    // Action permissions
    canRefreshData: true,
    canExportData: true,
    canChangePeriod: true,
    canCustomizeLayout: true,

    // Management permissions
    canManageUsers: true,
    canModerateContent: true,
    canAccessAdminPanel: true,
    canViewAllOrders: true,

    // Feature flags
    canUseQuickActions: true,
    canAccessBulkActions: true,
    canSetNotifications: true,
  },

  moderator: {
    // View permissions
    canViewStats: true,
    canViewCharts: true,
    canViewActivity: true,
    canViewFinancials: false,
    canViewSystemHealth: false,
    canViewAnalytics: true,

    // Action permissions
    canRefreshData: true,
    canExportData: true,
    canChangePeriod: true,
    canCustomizeLayout: true,

    // Management permissions
    canManageUsers: false,
    canModerateContent: true,
    canAccessAdminPanel: false,
    canViewAllOrders: true,

    // Feature flags
    canUseQuickActions: true,
    canAccessBulkActions: true,
    canSetNotifications: true,
  },

  freelancer: {
    // View permissions
    canViewStats: true,
    canViewCharts: true,
    canViewActivity: true,
    canViewFinancials: true,
    canViewSystemHealth: false,
    canViewAnalytics: true,

    // Action permissions
    canRefreshData: true,
    canExportData: true,
    canChangePeriod: true,
    canCustomizeLayout: false,

    // Management permissions
    canManageUsers: false,
    canModerateContent: false,
    canAccessAdminPanel: false,
    canViewAllOrders: false,

    // Feature flags
    canUseQuickActions: true,
    canAccessBulkActions: false,
    canSetNotifications: true,
  },

  employer: {
    // View permissions
    canViewStats: true,
    canViewCharts: true,
    canViewActivity: true,
    canViewFinancials: true,
    canViewSystemHealth: false,
    canViewAnalytics: true,

    // Action permissions
    canRefreshData: true,
    canExportData: true,
    canChangePeriod: true,
    canCustomizeLayout: false,

    // Management permissions
    canManageUsers: false,
    canModerateContent: false,
    canAccessAdminPanel: false,
    canViewAllOrders: false,

    // Feature flags
    canUseQuickActions: true,
    canAccessBulkActions: false,
    canSetNotifications: true,
  },
};

/**
 * Default permissions for unauthenticated users
 */
const DEFAULT_PERMISSIONS: DashboardPermissions = {
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

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Dashboard permissions hook
 *
 * Provides role-based permission checks for dashboard features.
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
  const role = user?.userType ?? null;

  // Get permissions for current role
  const permissions = useMemo<DashboardPermissions>(() => {
    if (!isAuthenticated || !role) {
      return DEFAULT_PERMISSIONS;
    }

    return PERMISSION_MATRIX[role] || DEFAULT_PERMISSIONS;
  }, [isAuthenticated, role]);

  // Role flags
  const isAdmin = role === 'admin';
  const isModerator = false; // Moderator role not currently used
  const isFreelancer = role === 'freelancer';
  const isEmployer = role === 'employer';

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
        } else if (role === 'freelancer' || role === 'employer') {
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
    [permissions, isAuthenticated, role]
  );

  // Helper: Check any of multiple permissions
  const hasAnyPermission = useMemo(
    () =>
      (features: Array<keyof DashboardPermissions>): boolean => {
        return features.some((feature) => permissions[feature]);
      },
    [permissions]
  );

  // Helper: Check all of multiple permissions
  const hasAllPermissions = useMemo(
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
    role,
    isAdmin,
    isModerator,
    isFreelancer,
    isEmployer,

    // Helper methods
    canAccess,
    checkPermission,
    hasAnyPermission,
    hasAllPermissions,
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
  const { canAccess } = useDashboardPermissions();
  return canAccess(feature);
}
