/**
 * ================================================
 * SHARED FORMATTERS UTILITY
 * ================================================
 * Centralized formatting functions for consistency
 * across the application.
 *
 * @module lib/shared/formatters
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Story 3.1
 */

// ================================================
// CONSTANTS
// ================================================

export const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const DATE_FORMATS = {
  SHORT: 'short', // 29.10.2025
  LONG: 'long', // 29 Ekim 2025
  FULL: 'full', // 29 Ekim 2025 Çarşamba
  TIME: 'time', // 14:30
  DATETIME: 'datetime', // 29.10.2025 14:30
  RELATIVE: 'relative', // 2 saat önce
} as const;

export const LOCALES = {
  TR: 'tr-TR',
  EN: 'en-US',
} as const;

// ================================================
// CURRENCY FORMATTING
// ================================================

export interface CurrencyFormatOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useSymbol?: boolean;
}

/**
 * Format a number as currency
 *
 * @example
 * formatCurrency(1234.56, 'TRY') // "₺1.234,56"
 * formatCurrency(1234.56, 'USD', { locale: 'en-US' }) // "$1,234.56"
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'TRY',
  options: CurrencyFormatOptions = {}
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₺0,00';
  }

  const {
    locale = LOCALES.TR,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    useSymbol = true,
  } = options;

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);

    // If useSymbol is false, remove the currency symbol
    if (!useSymbol) {
      return formatted.replace(/[₺$€£]/g, '').trim();
    }

    return formatted;
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${CURRENCY_SYMBOLS[currency] || ''}${amount.toFixed(2)}`;
  }
}

/**
 * Format currency with compact notation (K, M, B)
 *
 * @example
 * formatCompactCurrency(1234) // "₺1,2K"
 * formatCompactCurrency(1234567) // "₺1,2M"
 */
export function formatCompactCurrency(
  amount: number,
  currency: string = 'TRY',
  locale: string = LOCALES.TR
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₺0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount);
  } catch (error) {
    console.error('Compact currency formatting error:', error);
    return formatCurrency(amount, currency, { maximumFractionDigits: 0 });
  }
}

// ================================================
// DATE FORMATTING
// ================================================

export interface DateFormatOptions {
  locale?: string;
  includeTime?: boolean;
  includeSeconds?: boolean;
  shortMonth?: boolean;
}

/**
 * Format a date string or Date object
 *
 * @example
 * formatDate('2025-10-29') // "29 Ekim 2025"
 * formatDate(new Date(), { includeTime: true }) // "29 Ekim 2025, 14:30"
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: keyof typeof DATE_FORMATS = 'LONG',
  options: DateFormatOptions = {}
): string {
  if (!date) return '-';

  const {
    locale = LOCALES.TR,
    includeTime = false,
    includeSeconds = false,
    shortMonth = false,
  } = options;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    if (format === 'RELATIVE') {
      return formatRelativeTime(dateObj, locale);
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: shortMonth ? 'short' : 'long',
      year: 'numeric',
    };

    if (format === 'SHORT') {
      dateOptions.month = 'numeric';
    } else if (format === 'FULL') {
      dateOptions.weekday = 'long';
    }

    if (includeTime || format === 'TIME' || format === 'DATETIME') {
      dateOptions.hour = '2-digit';
      dateOptions.minute = '2-digit';
      if (includeSeconds) {
        dateOptions.second = '2-digit';
      }
    }

    if (format === 'TIME') {
      delete dateOptions.day;
      delete dateOptions.month;
      delete dateOptions.year;
    }

    return new Intl.DateTimeFormat(locale, dateOptions).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "1 saat önce"
 * formatRelativeTime('2025-10-28') // "1 gün önce"
 */
export function formatRelativeTime(
  date: string | Date,
  _locale: string = LOCALES.TR
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'az önce';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} saat önce`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} gün önce`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} hafta önce`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ay önce`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} yıl önce`;
}

/**
 * Format date range
 *
 * @example
 * formatDateRange('2025-10-01', '2025-10-31') // "1 - 31 Ekim 2025"
 */
export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date,
  _locale: string = LOCALES.TR
): string {
  try {
    const start =
      typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    const sameMonth = start.getMonth() === end.getMonth();
    const sameYear = start.getFullYear() === end.getFullYear();

    if (sameMonth && sameYear) {
      return `${start.getDate()} - ${end.getDate()} ${formatDate(start, 'LONG').split(' ').slice(1).join(' ')}`;
    }

    return `${formatDate(start, 'SHORT')} - ${formatDate(end, 'SHORT')}`;
  } catch (error) {
    console.error('Date range formatting error:', error);
    return '-';
  }
}

// ================================================
// NUMBER FORMATTING
// ================================================

export interface NumberFormatOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
}

/**
 * Format a number with locale-specific thousands separators
 *
 * @example
 * formatNumber(1234567.89) // "1.234.567,89"
 * formatNumber(1234567.89, { maximumFractionDigits: 0 }) // "1.234.568"
 */
export function formatNumber(
  num: number | null | undefined,
  options: NumberFormatOptions = {}
): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const {
    locale = LOCALES.TR,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useGrouping = true,
  } = options;

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping,
    }).format(num);
  } catch (error) {
    console.error('Number formatting error:', error);
    return num.toString();
  }
}

/**
 * Format number as percentage
 *
 * @example
 * formatPercentage(0.1234) // "%12,34"
 * formatPercentage(0.1234, { minimumFractionDigits: 0 }) // "%12"
 */
export function formatPercentage(
  value: number,
  options: Omit<NumberFormatOptions, 'useGrouping'> = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '%0';
  }

  const {
    locale = LOCALES.TR,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value);
  } catch (error) {
    console.error('Percentage formatting error:', error);
    return `%${(value * 100).toFixed(maximumFractionDigits)}`;
  }
}

/**
 * Format file size in human-readable format
 *
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1536) // "1.5 KB"
 * formatFileSize(1048576) // "1 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  if (bytes < 0) return '-';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ================================================
// SPECIALIZED FORMATTERS
// ================================================

/**
 * Format phone number (Turkish format)
 *
 * @example
 * formatPhoneNumber('5551234567') // "+90 555 123 45 67"
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '-';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Turkish phone number format
  if (cleaned.length === 10 && cleaned.startsWith('5')) {
    return `+90 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('05')) {
    return `+90 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }

  return phone;
}

/**
 * Format IBAN (mask for privacy)
 *
 * @example
 * formatIBAN('TR330006100519786457841326', true) // "TR33 **** **** **** **** **1326"
 */
export function formatIBAN(iban: string, mask: boolean = false): string {
  if (!iban) return '-';

  const cleaned = iban.replace(/\s/g, '');

  if (mask) {
    // Show first 4 and last 4 characters
    const visible = 4;
    const start = cleaned.slice(0, visible);
    const end = cleaned.slice(-visible);
    const masked = '*'.repeat(Math.max(0, cleaned.length - 2 * visible));

    return `${start} ${masked.match(/.{1,4}/g)?.join(' ') || ''} ${end}`.trim();
  }

  // Format with spaces every 4 characters
  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
}

/**
 * Format credit card number (with masking)
 *
 * @example
 * formatCardNumber('1234567890123456', true) // "**** **** **** 3456"
 */
export function formatCardNumber(
  cardNumber: string,
  mask: boolean = true
): string {
  if (!cardNumber) return '-';

  const cleaned = cardNumber.replace(/\s/g, '');

  if (mask) {
    const lastFour = cleaned.slice(-4);
    return `**** **** **** ${lastFour}`;
  }

  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
}

/**
 * Truncate text with ellipsis
 *
 * @example
 * truncateText('Long text here', 10) // "Long text..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Format initials from name
 *
 * @example
 * formatInitials('Ahmet Yılmaz') // "AY"
 */
export function formatInitials(name: string): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ================================================
// VALIDATION HELPERS
// ================================================

/**
 * Check if a value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

// ================================================
// EXPORTS
// ================================================

const formatters = {
  // Currency
  formatCurrency,
  formatCompactCurrency,

  // Date & Time
  formatDate,
  formatRelativeTime,
  formatDateRange,

  // Numbers
  formatNumber,
  formatPercentage,
  formatFileSize,

  // Specialized
  formatPhoneNumber,
  formatIBAN,
  formatCardNumber,
  truncateText,
  formatInitials,

  // Validation
  isValidNumber,
  isValidDate,

  // Constants
  CURRENCY_SYMBOLS,
  DATE_FORMATS,
  LOCALES,
};

export default formatters;
