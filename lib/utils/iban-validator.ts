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
 * @version 1.0.0
 * @created October 30, 2025
 * @sprint Sprint 1 - Story 1.3 - Task 1 (1 story point)
 */

// ================================================
// TYPES
// ================================================

export interface BankInfo {
  code: string;
  name: string;
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

export const TURKISH_BANKS: Record<string, BankInfo> = {
  '00001': { code: '00001', name: 'Türkiye Cumhuriyet Merkez Bankası' },
  '00012': { code: '00012', name: 'Ziraat Bankası' },
  '00015': { code: '00015', name: 'Vakıfbank' },
  '00017': { code: '00017', name: 'Iller Bankası' },
  '00029': { code: '00029', name: 'Birleşik Fon Bankası' },
  '00032': { code: '00032', name: 'Türk Ekonomi Bankası' },
  '00046': { code: '00046', name: 'Akbank' },
  '00059': { code: '00059', name: 'Şekerbank' },
  '00062': { code: '00062', name: 'Garanti BBVA' },
  '00064': { code: '00064', name: 'İş Bankası' },
  '00067': { code: '00067', name: 'Yapı Kredi Bankası' },
  '00091': { code: '00091', name: 'Türkiye Finans' },
  '00092': { code: '00092', name: 'Türk Eximbank' },
  '00096': { code: '00096', name: 'Turkish Bank' },
  '00098': { code: '00098', name: 'Kuveyt Türk' },
  '00099': { code: '00099', name: 'ING Bank' },
  '00103': { code: '00103', name: 'Fibabanka' },
  '00108': { code: '00108', name: 'Türkiye Kalkınma ve Yatırım Bankası' },
  '00109': { code: '00109', name: 'Aktif Yatırım Bankası' },
  '00111': { code: '00111', name: 'QNB Finansbank' },
  '00115': { code: '00115', name: 'Alternatifbank' },
  '00121': { code: '00121', name: 'Burgan Bank' },
  '00123': { code: '00123', name: 'HSBC' },
  '00124': { code: '00124', name: 'Aktif Bank' },
  '00125': { code: '00125', name: 'Anadolubank' },
  '00132': { code: '00132', name: 'Citibank' },
  '00134': { code: '00134', name: 'Denizbank' },
  '00135': { code: '00135', name: 'Arap Türk Bankası' },
  '00142': { code: '00142', name: 'Nurol Yatırım Bankası' },
  '00143': { code: '00143', name: 'Odea Bank' },
  '00146': { code: '00146', name: 'Bank of Tokyo-Mitsubishi UFJ Turkey' },
  '00147': { code: '00147', name: 'Standard Chartered Yatırım Bankası' },
  '00148': { code: '00148', name: 'Westlb' },
  '00203': { code: '00203', name: 'Albaraka Türk' },
  '00205': { code: '00205', name: 'Vakıf Katılım Bankası' },
  '00206': { code: '00206', name: 'Ziraat Katılım Bankası' },
  '00209': { code: '00209', name: 'Türkiye Emlak Katılım Bankası' },
};

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

// Required React import for the hook
import * as React from 'react';
