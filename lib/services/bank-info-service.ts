/**
 * ================================================
 * BANK INFO SERVICE
 * ================================================
 * Centralized service for Turkish bank information and IBAN operations
 *
 * Features:
 * - Bank information retrieval
 * - IBAN validation and parsing
 * - Bank search and filtering
 * - Bank code to name mapping
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * @sprint Sprint 1 - Week 1 - Day 1: Bank Account Management
 */

import turkishBanksData from '@/lib/data/turkish-banks.json';
import {
  validateTurkishIBAN,
  formatIBAN,
  displayIBAN,
  type BankInfo,
  type IBANValidationResult,
} from '@/lib/utils/iban-validator';

// Re-export BankInfo type for convenience
export type { BankInfo };

// ================================================
// TYPES
// ================================================

export interface BankSearchOptions {
  query?: string;
  activeOnly?: boolean;
  sortBy?: 'name' | 'code';
  sortOrder?: 'asc' | 'desc';
}

export interface BankValidationOptions {
  checkActive?: boolean;
  strictValidation?: boolean;
}

// ================================================
// BANK INFO SERVICE CLASS
// ================================================

export class BankInfoService {
  private banks: typeof turkishBanksData.banks;
  private bankMap: Map<string, BankInfo>;

  constructor() {
    this.banks = turkishBanksData.banks;
    this.bankMap = new Map();
    this.initializeBankMap();
  }

  /**
   * Initialize bank map for quick lookups
   */
  private initializeBankMap(): void {
    this.banks.forEach((bank) => {
      const paddedCode = bank.code.padStart(5, '0');
      this.bankMap.set(paddedCode, {
        code: paddedCode,
        name: bank.name,
        shortName: bank.shortName,
        swift: bank.swift,
      });
    });
  }

  /**
   * Get bank by code
   */
  getBankByCode(code: string): BankInfo | null {
    const paddedCode = code.padStart(5, '0');
    return this.bankMap.get(paddedCode) || null;
  }

  /**
   * Get bank from IBAN
   */
  getBankFromIBAN(iban: string): BankInfo | null {
    const cleaned = formatIBAN(iban);

    if (cleaned.length < 9 || !cleaned.startsWith('TR')) {
      return null;
    }

    // Extract bank code (positions 4-8, 5 digits)
    const bankCode = cleaned.substring(4, 9);
    return this.getBankByCode(bankCode);
  }

  /**
   * Get all banks
   */
  getAllBanks(options: BankSearchOptions = {}): BankInfo[] {
    let banks = Array.from(this.bankMap.values());

    // Filter active only
    if (options.activeOnly) {
      const activeCodes = this.banks
        .filter((b) => b.active)
        .map((b) => b.code.padStart(5, '0'));
      banks = banks.filter((b) => activeCodes.includes(b.code));
    }

    // Sort
    const sortBy = options.sortBy || 'name';
    const sortOrder = options.sortOrder || 'asc';

    banks.sort((a, b) => {
      const compareValue =
        sortBy === 'name'
          ? a.name.localeCompare(b.name, 'tr')
          : a.code.localeCompare(b.code);

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return banks;
  }

  /**
   * Search banks by name or code
   */
  searchBanks(query: string, options: BankSearchOptions = {}): BankInfo[] {
    if (!query) {
      return this.getAllBanks(options);
    }

    const lowerQuery = query.toLowerCase();
    const allBanks = this.getAllBanks(options);

    return allBanks.filter((bank) => {
      const nameMatch = bank.name.toLowerCase().includes(lowerQuery);
      const shortNameMatch =
        bank.shortName?.toLowerCase().includes(lowerQuery) || false;
      const codeMatch = bank.code.includes(query);
      const swiftMatch =
        bank.swift?.toLowerCase().includes(lowerQuery) || false;

      return nameMatch || shortNameMatch || codeMatch || swiftMatch;
    });
  }

  /**
   * Validate IBAN and return bank info
   */
  validateIBANWithBank(
    iban: string,
    options: BankValidationOptions = {}
  ): IBANValidationResult & { bankDetails?: BankInfo } {
    const validation = validateTurkishIBAN(iban);

    if (!validation.isValid) {
      return validation;
    }

    // Get additional bank details
    const bankDetails = validation.bankCode
      ? this.getBankByCode(validation.bankCode)
      : null;

    // Check if bank is active (if requested)
    if (options.checkActive && bankDetails) {
      const bankData = this.banks.find(
        (b) => b.code.padStart(5, '0') === bankDetails.code
      );

      if (bankData && !bankData.active) {
        return {
          ...validation,
          isValid: false,
          errors: [
            ...validation.errors,
            'Bu banka artık aktif değil veya birleştirilmiş olabilir',
          ],
        };
      }
    }

    return {
      ...validation,
      bankDetails: bankDetails || undefined,
    };
  }

  /**
   * Format IBAN for display
   */
  formatIBANForDisplay(iban: string): string {
    return displayIBAN(iban);
  }

  /**
   * Mask IBAN for security (show only first 4 and last 4 characters)
   */
  maskIBAN(iban: string): string {
    const cleaned = formatIBAN(iban);

    if (cleaned.length !== 26) {
      return iban;
    }

    // TR + check digits + show 2 digits + mask middle + show last 4
    const start = cleaned.substring(0, 6); // TR0000
    const end = cleaned.substring(22); // Last 4 digits
    const masked = '**** **** **** ****';

    return `${start.substring(0, 2)} ${start.substring(2, 4)} ${masked} ${end.substring(0, 2)} ${end.substring(2)}`;
  }

  /**
   * Check if bank code exists
   */
  isBankCodeValid(code: string): boolean {
    return this.bankMap.has(code.padStart(5, '0'));
  }

  /**
   * Get bank statistics
   */
  getBankStatistics(): {
    totalBanks: number;
    activeBanks: number;
    inactiveBanks: number;
    participationBanks: number;
    commercialBanks: number;
  } {
    const totalBanks = this.banks.length;
    const activeBanks = this.banks.filter((b) => b.active).length;
    const inactiveBanks = totalBanks - activeBanks;

    // Participation banks typically have codes starting with 02
    const participationBanks = this.banks.filter(
      (b) => b.active && b.code.startsWith('02')
    ).length;
    const commercialBanks = activeBanks - participationBanks;

    return {
      totalBanks,
      activeBanks,
      inactiveBanks,
      participationBanks,
      commercialBanks,
    };
  }

  /**
   * Generate sample IBAN for testing (with valid check digits)
   */
  generateSampleIBAN(bankCode: string): string | null {
    if (!this.isBankCodeValid(bankCode)) {
      return null;
    }

    const paddedCode = bankCode.padStart(5, '0');

    // Generate random account number (16 digits)
    const accountNumber = Math.floor(Math.random() * 10000000000000000)
      .toString()
      .padStart(16, '0');

    // Create IBAN without check digits
    const ibanWithoutCheck = `TR00${paddedCode}${accountNumber}`;

    // Calculate check digits
    const checkDigits = this.calculateIBANCheckDigits(ibanWithoutCheck);

    // Replace check digits
    const finalIBAN = `TR${checkDigits}${paddedCode}${accountNumber}`;

    return displayIBAN(finalIBAN);
  }

  /**
   * Calculate IBAN check digits using mod-97 algorithm
   */
  private calculateIBANCheckDigits(iban: string): string {
    // Move first 4 characters to end
    const rearranged = iban.substring(4) + iban.substring(0, 4);

    // Convert letters to numbers (A=10, B=11, ..., Z=35)
    const numericString = rearranged
      .split('')
      .map((char) => {
        const code = char.charCodeAt(0);
        return code >= 65 && code <= 90 ? (code - 55).toString() : char;
      })
      .join('');

    // Calculate mod 97
    let remainder = 0;
    for (let i = 0; i < numericString.length; i++) {
      remainder = (remainder * 10 + parseInt(numericString[i], 10)) % 97;
    }

    // Check digit = 98 - remainder
    const checkDigit = 98 - remainder;
    return checkDigit.toString().padStart(2, '0');
  }
}

// ================================================
// SINGLETON INSTANCE
// ================================================

export const bankInfoService = new BankInfoService();

// ================================================
// CONVENIENCE EXPORTS
// ================================================

export const {
  getBankByCode,
  getBankFromIBAN,
  getAllBanks,
  searchBanks,
  validateIBANWithBank,
  formatIBANForDisplay,
  maskIBAN,
  isBankCodeValid,
  getBankStatistics,
  generateSampleIBAN,
} = bankInfoService;

// ================================================
// DEFAULT EXPORT
// ================================================

export default bankInfoService;
