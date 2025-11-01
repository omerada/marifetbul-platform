/**
 * ================================================
 * PERMISSION SYSTEM
 * ================================================
 * Fine-grained permission management for RBAC
 *
 * Features:
 * - Permission constants
 * - Role-based permission mapping
 * - Permission checking utilities
 * - UI-level permission gates
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 3.1: Admin vs Moderator Permission Separation
 */

import type { UserRole } from '@/types/backend-aligned';
import type { UserContext } from './auth-utils';

// ================================================
// PERMISSION DEFINITIONS
// ================================================

/**
 * System permissions
 * Organized by domain/feature area
 */
export const PERMISSIONS = {
  // User Management
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',
  USER_MANAGE: 'user.manage', // Full user management
  USER_IMPERSONATE: 'user.impersonate',
  USER_EXPORT: 'user.export',

  // Content Moderation
  CONTENT_MODERATE: 'content.moderate',
  COMMENT_VIEW: 'comment.view',
  COMMENT_APPROVE: 'comment.approve',
  COMMENT_REJECT: 'comment.reject',
  REVIEW_VIEW: 'review.view',
  REVIEW_MODERATE: 'review.moderate',
  REPORT_VIEW: 'report.view',
  REPORT_RESOLVE: 'report.resolve',

  // User Actions (Moderator level)
  USER_WARN: 'user.warn',
  USER_SUSPEND: 'user.suspend',
  USER_BAN: 'user.ban', // Admin can ban permanently, Moderator temporarily

  // System Administration
  SYSTEM_SETTINGS: 'system.settings',
  SYSTEM_HEALTH: 'system.health',
  SYSTEM_LOGS: 'system.logs',

  // Analytics & Reporting
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  REVENUE_VIEW: 'revenue.view',

  // Moderator Management (Admin only)
  MODERATOR_MANAGE: 'moderator.manage',
  MODERATOR_VIEW: 'moderator.view',

  // Payment & Financial
  PAYMENT_VIEW: 'payment.view',
  PAYMENT_MANAGE: 'payment.manage',
  REFUND_VIEW: 'refund.view',
  REFUND_APPROVE: 'refund.approve',
  COMMISSION_MANAGE: 'commission.manage',
  ESCROW_MANAGE: 'escrow.manage',

  // Disputes
  DISPUTE_VIEW: 'dispute.view',
  DISPUTE_RESOLVE: 'dispute.resolve',
  DISPUTE_ESCALATE: 'dispute.escalate',

  // Support Tickets
  TICKET_VIEW: 'ticket.view',
  TICKET_RESPOND: 'ticket.respond',
  TICKET_RESOLVE: 'ticket.resolve',
  TICKET_ASSIGN: 'ticket.assign',

  // Orders
  ORDER_VIEW_ALL: 'order.view.all',
  ORDER_CANCEL_ANY: 'order.cancel.any',
  ORDER_REFUND_ANY: 'order.refund.any',

  // Blog & Content
  BLOG_PUBLISH: 'blog.publish',
  BLOG_EDIT_ANY: 'blog.edit.any',
  BLOG_DELETE_ANY: 'blog.delete.any',

  // Categories & Marketplace
  CATEGORY_MANAGE: 'category.manage',
  PACKAGE_APPROVE: 'package.approve',
  PACKAGE_FEATURE: 'package.feature',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ================================================
// ROLE PERMISSION MAPPING
// ================================================

/**
 * Permissions assigned to each role
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  /**
   * ADMIN: Full system access
   * Can perform all operations
   */
  ADMIN: [
    // User Management (Full)
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.USER_IMPERSONATE,
    PERMISSIONS.USER_EXPORT,
    PERMISSIONS.USER_WARN,
    PERMISSIONS.USER_SUSPEND,
    PERMISSIONS.USER_BAN,

    // Content Moderation (Full - includes all moderator permissions)
    PERMISSIONS.CONTENT_MODERATE,
    PERMISSIONS.COMMENT_VIEW,
    PERMISSIONS.COMMENT_APPROVE,
    PERMISSIONS.COMMENT_REJECT,
    PERMISSIONS.REVIEW_VIEW,
    PERMISSIONS.REVIEW_MODERATE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_RESOLVE,

    // System Administration (Admin only)
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.SYSTEM_HEALTH,
    PERMISSIONS.SYSTEM_LOGS,

    // Analytics & Reporting
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.REVENUE_VIEW,

    // Moderator Management (Admin only)
    PERMISSIONS.MODERATOR_MANAGE,
    PERMISSIONS.MODERATOR_VIEW,

    // Payment & Financial (Admin only)
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_MANAGE,
    PERMISSIONS.REFUND_VIEW,
    PERMISSIONS.REFUND_APPROVE,
    PERMISSIONS.COMMISSION_MANAGE,
    PERMISSIONS.ESCROW_MANAGE,

    // Disputes
    PERMISSIONS.DISPUTE_VIEW,
    PERMISSIONS.DISPUTE_RESOLVE,
    PERMISSIONS.DISPUTE_ESCALATE,

    // Support Tickets
    PERMISSIONS.TICKET_VIEW,
    PERMISSIONS.TICKET_RESPOND,
    PERMISSIONS.TICKET_RESOLVE,
    PERMISSIONS.TICKET_ASSIGN,

    // Orders
    PERMISSIONS.ORDER_VIEW_ALL,
    PERMISSIONS.ORDER_CANCEL_ANY,
    PERMISSIONS.ORDER_REFUND_ANY,

    // Blog & Content
    PERMISSIONS.BLOG_PUBLISH,
    PERMISSIONS.BLOG_EDIT_ANY,
    PERMISSIONS.BLOG_DELETE_ANY,

    // Categories & Marketplace
    PERMISSIONS.CATEGORY_MANAGE,
    PERMISSIONS.PACKAGE_APPROVE,
    PERMISSIONS.PACKAGE_FEATURE,
  ],

  /**
   * MODERATOR: Content moderation and user actions
   * Cannot access system settings or financial operations
   */
  MODERATOR: [
    // Content Moderation
    PERMISSIONS.CONTENT_MODERATE,
    PERMISSIONS.COMMENT_VIEW,
    PERMISSIONS.COMMENT_APPROVE,
    PERMISSIONS.COMMENT_REJECT,
    PERMISSIONS.REVIEW_VIEW,
    PERMISSIONS.REVIEW_MODERATE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_RESOLVE,

    // User Actions (Limited - temporary bans only)
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_WARN,
    PERMISSIONS.USER_SUSPEND,

    // Support Tickets
    PERMISSIONS.TICKET_VIEW,
    PERMISSIONS.TICKET_RESPOND,
    PERMISSIONS.TICKET_RESOLVE,

    // Blog Content (Edit/Delete flagged content)
    PERMISSIONS.BLOG_EDIT_ANY,
    PERMISSIONS.BLOG_DELETE_ANY,

    // View-only analytics
    PERMISSIONS.ANALYTICS_VIEW,
  ],

  /**
   * EMPLOYER: Job posting and hiring
   * Regular user with employer-specific permissions
   */
  EMPLOYER: [
    // Own content management only
    // (Specific permissions handled by ownership checks)
  ],

  /**
   * FREELANCER: Service provider
   * Default user role with basic permissions
   */
  FREELANCER: [
    // Own content management only
    // (Specific permissions handled by ownership checks)
  ],
};

// ================================================
// PERMISSION CHECKING UTILITIES
// ================================================

/**
 * Check if user has a specific permission
 *
 * @param user - User context
 * @param permission - Permission to check
 * @returns True if user has the permission
 */
export function hasPermission(
  user: UserContext | null,
  permission: Permission
): boolean {
  if (!user) return false;

  const rolePermissions = ROLE_PERMISSIONS[user.role];
  return rolePermissions.includes(permission);
}

/**
 * Check if user has ANY of the specified permissions
 *
 * @param user - User context
 * @param permissions - Array of permissions to check
 * @returns True if user has at least one permission
 */
export function hasAnyPermission(
  user: UserContext | null,
  permissions: Permission[]
): boolean {
  if (!user) return false;
  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Check if user has ALL of the specified permissions
 *
 * @param user - User context
 * @param permissions - Array of permissions to check
 * @returns True if user has all permissions
 */
export function hasAllPermissions(
  user: UserContext | null,
  permissions: Permission[]
): boolean {
  if (!user) return false;
  return permissions.every((permission) => hasPermission(user, permission));
}

/**
 * Get all permissions for a user's role
 *
 * @param user - User context
 * @returns Array of permissions
 */
export function getUserPermissions(user: UserContext | null): Permission[] {
  if (!user) return [];
  return ROLE_PERMISSIONS[user.role];
}

/**
 * Check if user can access admin panel
 *
 * @param user - User context
 * @returns True if user can access admin panel
 */
export function canAccessAdmin(user: UserContext | null): boolean {
  return user?.role === 'ADMIN';
}

/**
 * Check if user can access moderator panel
 *
 * @param user - User context
 * @returns True if user can access moderator panel
 */
export function canAccessModerator(user: UserContext | null): boolean {
  if (!user) return false;
  // Admin can also access moderator panel
  return user.role === 'ADMIN' || user.role === 'MODERATOR';
}

/**
 * Check if user can manage other users
 *
 * @param user - User context
 * @returns True if user can manage users
 */
export function canManageUsers(user: UserContext | null): boolean {
  return hasPermission(user, PERMISSIONS.USER_MANAGE);
}

/**
 * Check if user can moderate content
 *
 * @param user - User context
 * @returns True if user can moderate content
 */
export function canModerateContent(user: UserContext | null): boolean {
  return hasPermission(user, PERMISSIONS.CONTENT_MODERATE);
}

/**
 * Check if user can view system settings
 *
 * @param user - User context
 * @returns True if user can view system settings
 */
export function canViewSystemSettings(user: UserContext | null): boolean {
  return hasPermission(user, PERMISSIONS.SYSTEM_SETTINGS);
}

/**
 * Check if user can manage payments
 *
 * @param user - User context
 * @returns True if user can manage payments
 */
export function canManagePayments(user: UserContext | null): boolean {
  return hasPermission(user, PERMISSIONS.PAYMENT_MANAGE);
}

/**
 * Check if user can approve refunds
 *
 * @param user - User context
 * @returns True if user can approve refunds
 */
export function canApproveRefunds(user: UserContext | null): boolean {
  return hasPermission(user, PERMISSIONS.REFUND_APPROVE);
}

/**
 * Check if user can ban other users permanently
 *
 * @param user - User context
 * @returns True if user can ban users (Admin only)
 */
export function canBanUsers(user: UserContext | null): boolean {
  // Only ADMIN can permanently ban
  // MODERATOR can only suspend temporarily
  return user?.role === 'ADMIN';
}

/**
 * Check if user can suspend other users
 *
 * @param user - User context
 * @returns True if user can suspend users
 */
export function canSuspendUsers(user: UserContext | null): boolean {
  return hasPermission(user, PERMISSIONS.USER_SUSPEND);
}

// ================================================
// UI PERMISSION GATES
// ================================================

/**
 * Permission gate for conditional rendering
 * Returns true if user has permission, false otherwise
 *
 * @example
 * ```tsx
 * {canShow(user, PERMISSIONS.USER_MANAGE) && (
 *   <Button>Manage Users</Button>
 * )}
 * ```
 */
export function canShow(
  user: UserContext | null,
  permission: Permission
): boolean {
  return hasPermission(user, permission);
}

/**
 * Multi-permission gate for conditional rendering
 * Returns true if user has ANY of the permissions
 *
 * @example
 * ```tsx
 * {canShowAny(user, [PERMISSIONS.USER_MANAGE, PERMISSIONS.MODERATOR_MANAGE]) && (
 *   <AdminSection />
 * )}
 * ```
 */
export function canShowAny(
  user: UserContext | null,
  permissions: Permission[]
): boolean {
  return hasAnyPermission(user, permissions);
}

/**
 * Multi-permission gate requiring all permissions
 * Returns true if user has ALL of the permissions
 *
 * @example
 * ```tsx
 * {canShowAll(user, [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_EDIT]) && (
 *   <EditUserButton />
 * )}
 * ```
 */
export function canShowAll(
  user: UserContext | null,
  permissions: Permission[]
): boolean {
  return hasAllPermissions(user, permissions);
}

// ================================================
// PERMISSION MATRIX DOCUMENTATION
// ================================================

/**
 * Permission Matrix
 *
 * | Feature/Action              | ADMIN | MODERATOR | EMPLOYER | FREELANCER |
 * |-----------------------------|-------|-----------|----------|------------|
 * | Access Admin Panel          | ✅    | ❌        | ❌       | ❌         |
 * | Access Moderator Panel      | ✅    | ✅        | ❌       | ❌         |
 * | View System Settings        | ✅    | ❌        | ❌       | ❌         |
 * | Manage Users                | ✅    | ❌        | ❌       | ❌         |
 * | Impersonate Users           | ✅    | ❌        | ❌       | ❌         |
 * | Moderate Content            | ✅    | ✅        | ❌       | ❌         |
 * | Approve/Reject Comments     | ✅    | ✅        | ❌       | ❌         |
 * | Moderate Reviews            | ✅    | ✅        | ❌       | ❌         |
 * | Resolve Reports             | ✅    | ✅        | ❌       | ❌         |
 * | Warn Users                  | ✅    | ✅        | ❌       | ❌         |
 * | Suspend Users               | ✅    | ✅        | ❌       | ❌         |
 * | Ban Users (Permanent)       | ✅    | ❌        | ❌       | ❌         |
 * | Manage Payments             | ✅    | ❌        | ❌       | ❌         |
 * | Approve Refunds             | ✅    | ❌        | ❌       | ❌         |
 * | Manage Commission Rates     | ✅    | ❌        | ❌       | ❌         |
 * | View Analytics              | ✅    | ✅        | ❌       | ❌         |
 * | Export Analytics            | ✅    | ❌        | ❌       | ❌         |
 * | View Revenue Data           | ✅    | ❌        | ❌       | ❌         |
 * | Respond to Tickets          | ✅    | ✅        | ❌       | ❌         |
 * | Resolve Disputes            | ✅    | ❌        | ❌       | ❌         |
 * | View All Orders             | ✅    | ❌        | ❌       | ❌         |
 * | Manage Categories           | ✅    | ❌        | ❌       | ❌         |
 * | Approve Packages            | ✅    | ❌        | ❌       | ❌         |
 * | Feature Packages            | ✅    | ❌        | ❌       | ❌         |
 */

// ================================================
// EXPORTS
// ================================================

const permissionSystem = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  canAccessAdmin,
  canAccessModerator,
  canManageUsers,
  canModerateContent,
  canViewSystemSettings,
  canManagePayments,
  canApproveRefunds,
  canBanUsers,
  canSuspendUsers,
  canShow,
  canShowAny,
  canShowAll,
};

export default permissionSystem;
