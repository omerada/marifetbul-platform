/**
 * Sidebar Helper Functions
 *
 * Reusable utility functions for navigation, path detection, filtering, and badges.
 */

import type {
  NavigationItem,
  NavigationSubItem,
  BadgeValue,
  BadgeVariant,
} from '../types/sidebarTypes';

// ============================================================================
// Path Detection Helpers
// ============================================================================

/**
 * Check if current path matches item href exactly
 */
export function isPathActive(pathname: string, href: string): boolean {
  return pathname === href;
}

/**
 * Check if current path matches any sub-item
 */
export function isChildPathActive(
  pathname: string,
  subItems?: NavigationSubItem[]
): boolean {
  if (!subItems || subItems.length === 0) return false;
  return subItems.some((subItem) => pathname === subItem.href);
}

/**
 * Check if item should be auto-expanded (current or child is active)
 */
export function shouldAutoExpand(
  pathname: string,
  item: NavigationItem
): boolean {
  const isItemActive = isPathActive(pathname, item.href);
  const hasActiveChild = isChildPathActive(pathname, item.subItems);
  return isItemActive || hasActiveChild;
}

// ============================================================================
// Navigation Filtering Helpers
// ============================================================================

/**
 * Filter navigation items by user permissions
 */
export function filterNavigationByPermissions(
  items: Omit<NavigationItem, 'current'>[],
  userRole?: string
): Omit<NavigationItem, 'current'>[] {
  return items.filter((item) => {
    if (!item.permissions) return true;
    if (!userRole) return false;
    return item.permissions.some(
      (permission) => userRole === permission || userRole === 'super_admin'
    );
  });
}

/**
 * Filter navigation items by search query
 */
export function filterNavigationBySearch(
  items: Omit<NavigationItem, 'current'>[],
  query: string
): Omit<NavigationItem, 'current'>[] {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter((item) => item.name.toLowerCase().includes(lowerQuery));
}

// ============================================================================
// Badge Helpers
// ============================================================================

/**
 * Format badge value for display
 */
export function formatBadgeValue(badge: BadgeValue): string {
  if (badge === null || badge === undefined) return '';
  if (badge === 'new') return 'Yeni';
  if (typeof badge === 'number') return badge.toString();
  return badge;
}

/**
 * Get badge variant based on value type
 */
export function getBadgeVariant(badge: BadgeValue): BadgeVariant {
  if (badge === 'new') return 'default';
  if (typeof badge === 'number' && badge > 0) return 'secondary';
  return 'outline';
}

// ============================================================================
// State Management Helpers
// ============================================================================

/**
 * Toggle item in array (add if not present, remove if present)
 */
export function toggleItemInArray(arr: string[], item: string): string[] {
  if (arr.includes(item)) {
    return arr.filter((i) => i !== item);
  }
  return [...arr, item];
}

/**
 * Get items that should be auto-expanded on mount
 */
export function getAutoExpandedItems(
  pathname: string,
  items: NavigationItem[]
): string[] {
  return items
    .filter((item) => shouldAutoExpand(pathname, item))
    .map((item) => item.name);
}
