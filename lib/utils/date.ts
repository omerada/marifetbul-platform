/**
 * Date utilities
 */

import { format, formatDistance, parseISO, isValid } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Format a date using date-fns
 */
export function formatDate(
  date: Date | string | number,
  formatStr: string = 'dd/MM/yyyy'
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) {
      return 'Geçersiz tarih';
    }

    return format(dateObj, formatStr, { locale: tr });
  } catch {
    return 'Geçersiz tarih';
  }
}

/**
 * Format relative time (e.g., "2 saat önce")
 */
export function formatRelativeTime(date: Date | string | number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) {
      return 'Bilinmiyor';
    }

    return formatDistance(dateObj, new Date(), {
      addSuffix: true,
      locale: tr,
    });
  } catch {
    return 'Bilinmiyor';
  }
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string | number): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    const today = new Date();

    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
}

/**
 * Get time ago string in Turkish
 */
export function getTimeAgo(date: Date | string | number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return 'Az önce';
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

    if (diffInDays < 30) {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} hafta önce`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ay önce`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} yıl önce`;
  } catch {
    return 'Bilinmiyor';
  }
}
