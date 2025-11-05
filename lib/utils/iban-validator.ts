/**
 * ================================================
 * IBAN VALIDATOR UTILITY
 * ================================================
 * Turkish IBAN validation and bank detection
 *
 * Features:
 * - IBAN format validation (TR + 24 digits)
 * - Check digit verification
 * - Bank code detection
 * - Turkish bank identification
 * - Real-time validation
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @created October 30, 2025
 * @updated November 5, 2025
 * @sprint Sprint 1 - Week 1 - Day 1: Bank Account Management
 */

import * as React from 'react';
import turkishBanksData from '@/lib/data/turkish-banks.json';

// ================================================
// TYPES
// ================================================

export interface BankInfo {
  code: string;
  name: string;
  shortName?: string;
  swift?: string;
  logo?: string;
}

export interface IBANValidationResult {
  isValid: boolean;
  formatted?: string;
  bankCode?: string;
  bankInfo?: BankInfo;
  errors: string[];
}

// ================================================
// TURKISH BANKS DATABASE
// ================================================

// Transform JSON data to match BankInfo interface
const TURKISH_BANKS_MAP: Record<string, BankInfo> = {};

turkishBanksData.banks.forEach((bank) => {
  if (bank.active) {
    TURKISH_BANKS_MAP[bank.code.padStart(5, '0')] = {
      code: bank.code.padStart(5, '0'),
      name: bank.name,
      shortName: bank.shortName,
      swift: bank.swift,
    };
  }
});

export const TURKISH_BANKS: Record<string, BankInfo> = TURKISH_BANKS_MAP;

// ================================================
// VALIDATION FUNCTIONS
// ================================================

/**
 * Format IBAN string by removing spaces and converting to uppercase
 */
export function formatIBAN(iban: string): string {
  return iban.replace(/\s/g, '').toUpperCase();
}

/**
 * Add spaces to IBAN for display (TR00 0000 0000 0000 0000 0000 00)
 */
export function displayIBAN(iban: string): string {
  const cleaned = formatIBAN(iban);
  if (cleaned.length <= 2) return cleaned;

  const countryCode = cleaned.substring(0, 2);
  const rest = cleaned.substring(2);
  const chunks = rest.match(/.{1,4}/g) || [];

  return [countryCode, ...chunks].join(' ');
}

/**
 * Validate Turkish IBAN format
 */
export function validateTurkishIBAN(iban: string): IBANValidationResult {
  const errors: string[] = [];
  const cleaned = formatIBAN(iban);

  // Check if empty
  if (!cleaned) {
    errors.push('IBAN numarası girilmeli');
    return { isValid: false, errors };
  }

  // Check length
  if (cleaned.length !== 26) {
    errors.push('Türk IBAN numarası 26 karakter olmalıdır (TR + 24 rakam)');
  }

  // Check country code
  if (!cleaned.startsWith('TR')) {
    errors.push('IBAN numarası TR ile başlamalıdır');
  }

  // Check if rest is numeric
  const numericPart = cleaned.substring(2);
  if (!/^\d{24}$/.test(numericPart)) {
    errors.push('IBAN numarasının TR sonrası 24 rakam olmalıdır');
  }

  // If basic format is wrong, return early
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Validate check digits using mod-97 algorithm
  const rearranged = cleaned.substring(4) + cleaned.substring(0, 4);
  const numericString = rearranged
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      // Convert letters to numbers (A=10, B=11, ..., Z=35)
      return code >= 65 && code <= 90 ? code - 55 : char;
    })
    .join('');

  // Calculate mod 97
  let remainder = 0;
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString[i], 10)) % 97;
  }

  if (remainder !== 1) {
    errors.push('Geçersiz IBAN kontrol hanesi');
  }

  // Extract bank code (5 digits after TR and 2-digit check)
  const bankCode = cleaned.substring(4, 9);
  const bankInfo = TURKISH_BANKS[bankCode];

  if (!bankInfo) {
    errors.push('Banka kodu tanınmıyor');
  }

  return {
    isValid: errors.length === 0,
    formatted: displayIBAN(cleaned),
    bankCode,
    bankInfo,
    errors,
  };
}

/**
 * Get bank info from IBAN
 */
export function getBankFromIBAN(iban: string): BankInfo | null {
  const cleaned = formatIBAN(iban);
  if (cleaned.length < 9) return null;

  const bankCode = cleaned.substring(4, 9);
  return TURKISH_BANKS[bankCode] || null;
}

/**
 * Get all Turkish banks as array
 */
export function getAllBanks(): BankInfo[] {
  return Object.values(TURKISH_BANKS).sort((a, b) =>
    a.name.localeCompare(b.name, 'tr')
  );
}

/**
 * Search banks by name
 */
export function searchBanks(query: string): BankInfo[] {
  const lowerQuery = query.toLowerCase();
  return getAllBanks().filter((bank) =>
    bank.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Generate sample IBAN for a bank (for testing/demo purposes)
 */
export function generateSampleIBAN(bankCode: string): string {
  // This is a simplified version that doesn't calculate correct check digits
  // For production, implement proper check digit calculation
  const randomAccountNumber = Math.random()
    .toString()
    .substring(2, 18)
    .padEnd(16, '0');
  const iban = `TR00${bankCode}${randomAccountNumber}`;
  return displayIBAN(iban);
}

// ================================================
// REACT HOOK FOR REAL-TIME VALIDATION
// ================================================

export interface UseIBANValidationResult {
  value: string;
  formatted: string;
  isValid: boolean;
  errors: string[];
  bankInfo: BankInfo | null;
  setValue: (value: string) => void;
  validate: () => IBANValidationResult;
  reset: () => void;
}

/**
 * Custom hook for IBAN validation with real-time feedback
 * Usage in components:
 *
 * const iban = useIBANValidation();
 * <input value={iban.value} onChange={(e) => iban.setValue(e.target.value)} />
 */
export function useIBANValidation(initialValue = ''): UseIBANValidationResult {
  const [value, setValue] = React.useState(initialValue);
  const [validationResult, setValidationResult] =
    React.useState<IBANValidationResult>(validateTurkishIBAN(initialValue));

  const handleSetValue = React.useCallback((newValue: string) => {
    setValue(newValue);
    const result = validateTurkishIBAN(newValue);
    setValidationResult(result);
  }, []);

  const handleValidate = React.useCallback(() => {
    const result = validateTurkishIBAN(value);
    setValidationResult(result);
    return result;
  }, [value]);

  const handleReset = React.useCallback(() => {
    setValue('');
    setValidationResult({ isValid: false, errors: [] });
  }, []);

  return {
    value,
    formatted: validationResult.formatted || '',
    isValid: validationResult.isValid,
    errors: validationResult.errors,
    bankInfo: validationResult.bankInfo || null,
    setValue: handleSetValue,
    validate: handleValidate,
    reset: handleReset,
  };
}
