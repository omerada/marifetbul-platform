/**
 * UserTable Helper Functions
 *
 * Reusable utility functions for formatting, validation, and calculations.
 */

import {
  AdminUserData,
  UserStatus,
  UserRole,
  UserActionType,
} from '../types/userTableTypes';
import {
  STATUS_COLORS,
  STATUS_DOT_COLORS,
  ROLE_COLORS,
  MAX_PAGE_BUTTONS,
} from '../constants/userTableConstants';

// ============================================================================
// Color Helpers
// ============================================================================

/**
 * Get Tailwind classes for status badge color
 */
export function getStatusColor(status?: UserStatus): string {
  if (!status) return 'bg-gray-100 text-gray-800';
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get Tailwind classes for status dot indicator
 */
export function getStatusDotColor(status?: UserStatus): string {
  if (!status) return 'bg-gray-400';
  return STATUS_DOT_COLORS[status] || 'bg-gray-400';
}

/**
 * Get Tailwind classes for role badge color
 */
export function getRoleColor(role: UserRole): string {
  return ROLE_COLORS[role] || 'bg-gray-100 text-gray-800';
}

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Format user's full name
 */
export function formatUserName(user: AdminUserData): string {
  const firstName = user.firstName || user.name || '';
  const lastName = user.lastName || '';
  return `${firstName} ${lastName}`.trim() || 'Adsız Kullanıcı';
}

/**
 * Get user's initials for avatar
 */
export function getUserInitial(user: AdminUserData): string {
  const name = user.firstName || user.name || 'U';
  return name.charAt(0).toUpperCase();
}

/**
 * Format date to localized string
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date | undefined): string {
  if (!date) return 'Hiçbir zaman';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} gün önce`;

    return formatDate(dateObj);
  } catch {
    return 'Hiçbir zaman';
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if user is active
 */
export function isUserActive(user: AdminUserData): boolean {
  return user.accountStatus === 'active';
}

/**
 * Check if user is verified
 */
export function isUserVerified(user: AdminUserData): boolean {
  return user.verificationStatus === 'verified';
}

/**
 * Check if user can perform specific action
 */
export function canPerformAction(
  user: AdminUserData,
  action: UserActionType
): boolean {
  switch (action) {
    case 'activate':
      return user.accountStatus !== 'active';
    case 'suspend':
      return user.accountStatus === 'active';
    case 'ban':
      return user.accountStatus !== 'banned';
    case 'verify':
      return user.verificationStatus !== 'verified';
    case 'delete':
      return true; // Always allowed (with confirmation)
    case 'view':
    case 'email':
      return true;
    default:
      return false;
  }
}

// ============================================================================
// Pagination Helpers
// ============================================================================

/**
 * Generate page numbers for pagination
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxButtons: number = MAX_PAGE_BUTTONS
): number[] {
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: number[] = [];
  const halfMax = Math.floor(maxButtons / 2);

  let startPage = Math.max(1, currentPage - halfMax);
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);

  // Adjust start if we're near the end
  if (endPage === totalPages) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
}

/**
 * Calculate total pages from total items and page size
 */
export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

// ============================================================================
// User Display Helpers
// ============================================================================

/**
 * Get display text for status
 */
export function getStatusDisplayText(status: UserStatus): string {
  const statusMap: Record<UserStatus, string> = {
    active: 'Aktif',
    inactive: 'İnaktif',
    suspended: 'Askıya Alınmış',
    banned: 'Yasaklanmış',
    pending_verification: 'Doğrulama Bekliyor',
  };
  return statusMap[status] || status;
}

/**
 * Get display text for role
 */
export function getRoleDisplayText(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    admin: 'Admin',
    moderator: 'Moderatör',
    employer: 'İşveren',
    freelancer: 'Serbest Çalışan',
  };
  return roleMap[role] || role;
}
