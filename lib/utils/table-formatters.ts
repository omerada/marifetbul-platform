/**
 * ================================================
 * TABLE FORMATTING UTILITIES
 * ================================================
 * Sprint 1 - Task 7: Table Component Consolidation
 *
 * Common formatting utilities for table components
 * Reduces duplication across 15+ table implementations
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-01-19
 */

/**
 * Format currency value to Turkish Lira format
 *
 * @param amount - Amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string,
  decimals: number = 2
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) return '₺0,00';

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format date to Turkish locale
 *
 * @param date - Date to format (Date object or ISO string)
 * @param format - Format type ('short', 'long', 'time', 'datetime')
 * @returns Formatted date string
 */
export function formatTableDate(
  date: Date | string,
  format: 'short' | 'long' | 'time' | 'datetime' = 'short'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '-';

  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(dateObj);

    case 'long':
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(dateObj);

    case 'time':
      return new Intl.DateTimeFormat('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateObj);

    case 'datetime':
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateObj);

    default:
      return dateObj.toLocaleDateString('tr-TR');
  }
}

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format percentage value
 *
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (isNaN(value)) return '0%';
  return `%${value.toFixed(decimals)}`;
}

/**
 * Format number with thousand separators (Turkish locale)
 *
 * @param value - Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  if (isNaN(value)) return '0';
  return new Intl.NumberFormat('tr-TR').format(value);
}

/**
 * Get status badge color class
 *
 * @param status - Status string
 * @returns Tailwind color classes for badge
 */
export function getStatusColor(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  const statusLower = status.toLowerCase();

  // Success states
  if (
    [
      'active',
      'completed',
      'approved',
      'paid',
      'verified',
      'delivered',
    ].includes(statusLower)
  ) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    };
  }

  // Warning states
  if (
    ['pending', 'in_progress', 'processing', 'waiting', 'review'].includes(
      statusLower
    )
  ) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
    };
  }

  // Error/Danger states
  if (
    [
      'cancelled',
      'rejected',
      'failed',
      'banned',
      'suspended',
      'refunded',
    ].includes(statusLower)
  ) {
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
    };
  }

  // Info states
  if (['draft', 'inactive', 'paused'].includes(statusLower)) {
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
    };
  }

  // Default
  return {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  };
}

/**
 * Format table cell value based on type
 *
 * @param value - Value to format
 * @param type - Type of value ('currency', 'date', 'percentage', 'number', 'text')
 * @returns Formatted value
 */
export function formatCellValue(
  value: unknown,
  type: 'currency' | 'date' | 'percentage' | 'number' | 'text' = 'text'
): string {
  if (value === null || value === undefined) return '-';

  switch (type) {
    case 'currency':
      return formatCurrency(value as number);

    case 'date':
      return formatTableDate(value as Date | string);

    case 'percentage':
      return formatPercentage(value as number);

    case 'number':
      return formatNumber(value as number);

    case 'text':
    default:
      return String(value);
  }
}

/**
 * Calculate pagination info
 *
 * @param currentPage - Current page number (0-indexed)
 * @param pageSize - Items per page
 * @param totalItems - Total number of items
 * @returns Pagination display text
 */
export function getPaginationInfo(
  currentPage: number,
  pageSize: number,
  totalItems: number
): string {
  const start = currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalItems);

  return `${start}-${end} / ${totalItems}`;
}

/**
 * Sort comparator for table columns
 *
 * @param a - First value
 * @param b - Second value
 * @param direction - Sort direction ('asc' | 'desc')
 * @returns Comparison result
 */
export function tableSort<T>(
  a: T,
  b: T,
  direction: 'asc' | 'desc' = 'asc'
): number {
  if (a === b) return 0;

  const comparison = a > b ? 1 : -1;
  return direction === 'asc' ? comparison : -comparison;
}
