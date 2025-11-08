/**
 * CategoryCard Helper Functions
 *
 * Pure utility functions for formatting and data manipulation
 */

import type { LucideIcon } from 'lucide-react';
import { ICON_MAP, DEFAULT_ICON } from './categoryCardConstants';

// Sprint 1: All formatter imports removed - use @/lib/shared/formatters directly

// ============================================================================
// Formatting Helpers
// ============================================================================

// Sprint 1 Cleanup: formatPrice removed - use formatCurrency from @/lib/shared/formatters
// Sprint 1 Cleanup: formatNumber removed - use @/lib/shared/formatters
// Sprint 1 Cleanup: truncateText removed - use @/lib/shared/formatters

// ============================================================================
// Icon Helpers
// ============================================================================

/**
 * Get icon component by name
 */
export function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || DEFAULT_ICON;
}

// ============================================================================
// Style Helpers
// ============================================================================

/**
 * Get background style for icon container
 */
export function getIconBackgroundStyle(color: string): React.CSSProperties {
  return {
    backgroundColor: `${color}15`,
    color: color,
  };
}

/**
 * Get badge style with custom color
 */
export function getBadgeStyle(color: string): React.CSSProperties {
  return {
    backgroundColor: `${color}10`,
    color: color,
    borderColor: `${color}30`,
  };
}

/**
 * Get variant-specific class names
 */
export function getVariantClasses(variant: string): string {
  const baseClasses = 'group cursor-pointer';

  const variantClasses: Record<string, string> = {
    compact: '',
    featured: '',
    detailed: '',
    default: 'h-full',
  };

  return `${baseClasses} ${variantClasses[variant] || ''}`;
}

// ============================================================================
// Data Helpers
// ============================================================================

/**
 * Check if category has subcategories
 */
export function hasSubcategories(subcategories?: unknown[]): boolean {
  return Array.isArray(subcategories) && subcategories.length > 0;
}

/**
 * Check if category has services
 */
export function hasServices(services?: unknown[]): boolean {
  return Array.isArray(services) && services.length > 0;
}

/**
 * Check if category has skills
 */
export function hasSkills(skills?: unknown[]): boolean {
  return Array.isArray(skills) && skills.length > 0;
}

/**
 * Get truncated list with remaining count
 */
export function getTruncatedList<T>(
  items: T[],
  maxItems: number
): {
  displayed: T[];
  remaining: number;
} {
  const displayed = items.slice(0, maxItems);
  const remaining = Math.max(0, items.length - maxItems);

  return { displayed, remaining };
}
