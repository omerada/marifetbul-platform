/**
 * ================================================
 * USE IBAN FORMAT HOOK
 * ================================================
 * IBAN formatting and masking utilities
 *
 * Features:
 * - Format IBAN with spaces (TR33 0006 1005...)
 * - Mask IBAN for security
 * - Validate IBAN format
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 - Duplicate Cleanup
 */

import { useMemo } from 'react';
import { formatIBAN } from '@/lib/shared/formatters';

// ================================================
// TYPES
// ================================================

interface UseIBANFormatOptions {
  /**
   * Whether to mask the IBAN
   * @default false
   */
  masked?: boolean;

  /**
   * Format with spaces for readability
   * @default true
   */
  formatted?: boolean;
}

interface UseIBANFormatReturn {
  /**
   * Formatted/masked IBAN
   */
  formatted: string;

  /**
   * Raw IBAN (no spaces)
   */
  raw: string;

  /**
   * Whether IBAN is valid
   */
  isValid: boolean;

  /**
   * Format IBAN with options
   */
  format: (iban: string, options?: UseIBANFormatOptions) => string;
}

// ================================================
// HELPERS
// ================================================

/**
 * Basic IBAN validation
 * TR IBAN format: TR + 2 check digits + 24 digits = 26 characters
 */
function validateIBAN(iban: string): boolean {
  if (!iban) return false;

  const cleaned = iban.replace(/\s/g, '').toUpperCase();

  // Turkish IBAN: TR + 26 characters
  if (cleaned.startsWith('TR')) {
    return /^TR\d{24}$/.test(cleaned);
  }

  // Basic format check for other countries
  return /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned) && cleaned.length >= 15;
}

// ================================================
// HOOK
// ================================================

/**
 * Hook for IBAN formatting
 *
 * @example
 * ```tsx
 * const { formatted, raw, format } = useIBANFormat('TR330006100519786457841326');
 *
 * // formatted: "TR33 0006 1005 1978 6457 8413 26"
 * // raw: "TR330006100519786457841326"
 *
 * // Custom formatting
 * const masked = format(iban, { masked: true });
 * // "TR33 **** **** **** **** **** 26"
 * ```
 */
export function useIBANFormat(
  iban: string,
  options: UseIBANFormatOptions = {}
): UseIBANFormatReturn {
  const { masked = false, formatted = true } = options;

  const raw = useMemo(() => {
    return iban.replace(/\s/g, '').toUpperCase();
  }, [iban]);

  const isValid = useMemo(() => {
    return validateIBAN(raw);
  }, [raw]);

  const formattedIBAN = useMemo(() => {
    if (!formatted) return raw;
    return formatIBAN(iban, masked);
  }, [iban, formatted, masked, raw]);

  const format = (
    ibanToFormat: string,
    formatOptions?: UseIBANFormatOptions
  ): string => {
    const shouldMask = formatOptions?.masked ?? false;
    const shouldFormat = formatOptions?.formatted ?? true;

    if (!shouldFormat) {
      return ibanToFormat.replace(/\s/g, '').toUpperCase();
    }

    return formatIBAN(ibanToFormat, shouldMask);
  };

  return {
    formatted: formattedIBAN,
    raw,
    isValid,
    format,
  };
}
