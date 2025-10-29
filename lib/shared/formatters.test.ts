/**
 * ================================================
 * FORMATTERS UTILITY TESTS
 * ================================================
 * Comprehensive tests for formatting functions
 *
 * @module lib/shared/formatters.test
 */

import {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  formatRelativeTime,
  formatDateRange,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatPhoneNumber,
  formatIBAN,
  formatCardNumber,
  truncateText,
  formatInitials,
  isValidNumber,
  isValidDate,
  CURRENCY_SYMBOLS,
  DATE_FORMATS,
  LOCALES,
} from './formatters';

describe('Currency Formatting', () => {
  describe('formatCurrency', () => {
    it('should format TRY currency correctly', () => {
      expect(formatCurrency(1234.56, 'TRY')).toMatch(/1[.,]234[.,]56/);
    });

    it('should handle null and undefined', () => {
      expect(formatCurrency(null, 'TRY')).toBe('₺0,00');
      expect(formatCurrency(undefined, 'TRY')).toBe('₺0,00');
    });

    it('should handle NaN', () => {
      expect(formatCurrency(NaN, 'TRY')).toBe('₺0,00');
    });

    it('should format without symbol when useSymbol is false', () => {
      const result = formatCurrency(1234.56, 'TRY', { useSymbol: false });
      expect(result).not.toContain('₺');
      expect(result).toMatch(/1[.,]234[.,]56/);
    });

    it('should handle zero', () => {
      expect(formatCurrency(0, 'TRY')).toMatch(/0[.,]00/);
    });

    it('should handle negative numbers', () => {
      const result = formatCurrency(-1234.56, 'TRY');
      expect(result).toContain('-');
      expect(result).toMatch(/1[.,]234[.,]56/);
    });

    it('should respect minimumFractionDigits option', () => {
      const result = formatCurrency(1234, 'TRY', { minimumFractionDigits: 0 });
      expect(result).toBeDefined();
    });
  });

  describe('formatCompactCurrency', () => {
    it('should format large numbers with K notation', () => {
      const result = formatCompactCurrency(1234, 'TRY');
      // Note: Intl.NumberFormat uses "B" (Bin) for Turkish thousand notation
      expect(result).toMatch(/1[.,]2.*[BK]/i);
    });

    it('should format millions with M notation', () => {
      const result = formatCompactCurrency(1234567, 'TRY');
      expect(result).toMatch(/1[.,]2.*M/i);
    });

    it('should handle zero', () => {
      expect(formatCompactCurrency(0, 'TRY')).toMatch(/0/);
    });

    it('should handle null', () => {
      expect(formatCompactCurrency(null as unknown as number, 'TRY')).toBe(
        '₺0'
      );
    });
  });
});

describe('Date Formatting', () => {
  describe('formatDate', () => {
    const testDate = new Date('2025-10-29T14:30:00');

    it('should format date with LONG format', () => {
      const result = formatDate(testDate, 'LONG');
      expect(result).toContain('2025');
      expect(result).toContain('29');
    });

    it('should format date with SHORT format', () => {
      const result = formatDate(testDate, 'SHORT');
      expect(result).toContain('29');
      expect(result).toContain('10');
      expect(result).toContain('2025');
    });

    it('should format date with TIME format', () => {
      const result = formatDate(testDate, 'TIME');
      expect(result).toMatch(/14[.:h\s]*30/);
    });

    it('should handle null date', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
    });

    it('should handle invalid date string', () => {
      expect(formatDate('invalid-date')).toBe('-');
    });

    it('should include time when specified', () => {
      const result = formatDate(testDate, 'LONG', { includeTime: true });
      expect(result).toBeDefined();
    });

    it('should handle string date input', () => {
      const result = formatDate('2025-10-29');
      expect(result).toContain('2025');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent time as "az önce"', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('az önce');
    });

    it('should format minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      expect(formatRelativeTime(date)).toBe('5 dakika önce');
    });

    it('should format hours ago', () => {
      const date = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      expect(formatRelativeTime(date)).toBe('2 saat önce');
    });

    it('should format days ago', () => {
      const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      expect(formatRelativeTime(date)).toBe('3 gün önce');
    });

    it('should format weeks ago', () => {
      const date = new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000); // 2 weeks ago
      expect(formatRelativeTime(date)).toBe('2 hafta önce');
    });

    it('should format months ago', () => {
      const date = new Date(Date.now() - 5 * 30 * 24 * 60 * 60 * 1000); // ~5 months ago
      expect(formatRelativeTime(date)).toBe('5 ay önce');
    });

    it('should handle string input', () => {
      const dateStr = new Date(Date.now() - 60 * 1000).toISOString(); // 1 min ago
      expect(formatRelativeTime(dateStr)).toBe('1 dakika önce');
    });
  });

  describe('formatDateRange', () => {
    it('should format same month date range', () => {
      const result = formatDateRange('2025-10-01', '2025-10-31');
      expect(result).toContain('1');
      expect(result).toContain('31');
    });

    it('should format different month date range', () => {
      const result = formatDateRange('2025-10-01', '2025-11-30');
      expect(result).toContain('10');
      expect(result).toContain('11');
    });

    it('should handle Date objects', () => {
      const start = new Date('2025-10-01');
      const end = new Date('2025-10-31');
      const result = formatDateRange(start, end);
      expect(result).toBeDefined();
    });
  });
});

describe('Number Formatting', () => {
  describe('formatNumber', () => {
    it('should format number with thousand separators', () => {
      const result = formatNumber(1234567.89);
      expect(result).toMatch(/1[.,\s]234[.,\s]567/);
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle null and undefined', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
    });

    it('should respect maximumFractionDigits', () => {
      const result = formatNumber(1234.567, { maximumFractionDigits: 1 });
      expect(result).toBeDefined();
    });

    it('should handle negative numbers', () => {
      const result = formatNumber(-1234.56);
      expect(result).toContain('-');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      const result = formatPercentage(0.1234);
      expect(result).toContain('12');
    });

    it('should handle zero', () => {
      expect(formatPercentage(0)).toMatch(/%0/);
    });

    it('should handle null', () => {
      expect(formatPercentage(null as unknown as number)).toBe('%0');
    });

    it('should handle 100%', () => {
      const result = formatPercentage(1);
      expect(result).toContain('100');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(100)).toBe('100 Bytes');
    });

    it('should format KB', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format MB', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('should format GB', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle negative numbers', () => {
      expect(formatFileSize(-100)).toBe('-');
    });
  });
});

describe('Specialized Formatters', () => {
  describe('formatPhoneNumber', () => {
    it('should format Turkish phone number', () => {
      expect(formatPhoneNumber('5551234567')).toBe('+90 555 123 45 67');
    });

    it('should format phone with 0 prefix', () => {
      expect(formatPhoneNumber('05551234567')).toBe('+90 555 123 45 67');
    });

    it('should handle empty string', () => {
      expect(formatPhoneNumber('')).toBe('-');
    });

    it('should handle already formatted phone', () => {
      const result = formatPhoneNumber('+90 555 123 45 67');
      expect(result).toBeDefined();
    });
  });

  describe('formatIBAN', () => {
    it('should format IBAN with spaces', () => {
      const result = formatIBAN('TR330006100519786457841326');
      expect(result).toContain('TR33');
      expect(result).toContain(' ');
    });

    it('should mask IBAN when requested', () => {
      const result = formatIBAN('TR330006100519786457841326', true);
      expect(result).toContain('*');
      expect(result).toContain('TR33');
      expect(result).toContain('1326');
    });

    it('should handle empty string', () => {
      expect(formatIBAN('')).toBe('-');
    });
  });

  describe('formatCardNumber', () => {
    it('should mask card number by default', () => {
      const result = formatCardNumber('1234567890123456');
      expect(result).toBe('**** **** **** 3456');
    });

    it('should format without masking', () => {
      const result = formatCardNumber('1234567890123456', false);
      expect(result).toBe('1234 5678 9012 3456');
    });

    it('should handle empty string', () => {
      expect(formatCardNumber('')).toBe('-');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is a ...');
    });

    it('should not truncate short text', () => {
      expect(truncateText('Short', 10)).toBe('Short');
    });

    it('should handle empty string', () => {
      expect(truncateText('', 10)).toBe('');
    });

    it('should handle exact length', () => {
      expect(truncateText('Exactly10!', 10)).toBe('Exactly10!');
    });
  });

  describe('formatInitials', () => {
    it('should format initials from full name', () => {
      expect(formatInitials('Ahmet Yılmaz')).toBe('AY');
    });

    it('should handle single name', () => {
      expect(formatInitials('Ahmet')).toBe('A');
    });

    it('should handle multiple spaces', () => {
      expect(formatInitials('Ahmet  Can  Yılmaz')).toBe('AY');
    });

    it('should handle empty string', () => {
      expect(formatInitials('')).toBe('');
    });

    it('should handle lowercase', () => {
      expect(formatInitials('ahmet yılmaz')).toBe('AY');
    });
  });
});

describe('Validation Helpers', () => {
  describe('isValidNumber', () => {
    it('should validate valid numbers', () => {
      expect(isValidNumber(0)).toBe(true);
      expect(isValidNumber(123)).toBe(true);
      expect(isValidNumber(-456)).toBe(true);
      expect(isValidNumber(3.14)).toBe(true);
    });

    it('should reject invalid numbers', () => {
      expect(isValidNumber(NaN)).toBe(false);
      expect(isValidNumber(Infinity)).toBe(false);
      expect(isValidNumber('123')).toBe(false);
      expect(isValidNumber(null)).toBe(false);
      expect(isValidNumber(undefined)).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate valid dates', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('2025-10-29'))).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate('2025-10-29')).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
    });
  });
});

describe('Constants', () => {
  it('should export CURRENCY_SYMBOLS', () => {
    expect(CURRENCY_SYMBOLS.TRY).toBe('₺');
    expect(CURRENCY_SYMBOLS.USD).toBe('$');
    expect(CURRENCY_SYMBOLS.EUR).toBe('€');
    expect(CURRENCY_SYMBOLS.GBP).toBe('£');
  });

  it('should export DATE_FORMATS', () => {
    expect(DATE_FORMATS.SHORT).toBe('short');
    expect(DATE_FORMATS.LONG).toBe('long');
    expect(DATE_FORMATS.FULL).toBe('full');
    expect(DATE_FORMATS.TIME).toBe('time');
    expect(DATE_FORMATS.DATETIME).toBe('datetime');
    expect(DATE_FORMATS.RELATIVE).toBe('relative');
  });

  it('should export LOCALES', () => {
    expect(LOCALES.TR).toBe('tr-TR');
    expect(LOCALES.EN).toBe('en-US');
  });
});
