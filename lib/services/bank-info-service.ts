/**
 * ================================================
 * BANK INFO SERVICE - API INTEGRATED
 * ================================================
 * Centralized service for Turkish bank information via Backend API
 *
 * ⚠️ MIGRATED: Sprint 1 - Story 1.3
 * - Old version: Duplicate bank data in frontend
 * - New version: Single source of truth via /api/v1/banks
 *
 * Features:
 * - Bank information retrieval from backend
 * - Client-side caching (24h TTL)
 * - IBAN validation and parsing
 * - Bank search and filtering
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 (API-based)
 * @updated November 8, 2025
 * @sprint Sprint 1 - Story 1.3: Bank Info Consolidation
 */

import {
  validateTurkishIBAN,
  formatIBAN,
  displayIBAN,
  type IBANValidationResult,
} from '@/lib/utils/iban-validator';

// ================================================
// TYPES
// ================================================

export interface BankInfo {
  code: string;
  name: string;
  shortName: string;
  swift: string | null;
  active?: boolean;
}

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
// API CLIENT
// ================================================

const API_BASE_URL = '/api/v1/banks';

/**
 * Fetch all banks from backend
 */
async function fetchAllBanks(): Promise<BankInfo[]> {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch banks: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Fetch bank by code from backend
 */
async function fetchBankByCode(code: string): Promise<BankInfo | null> {
  const paddedCode = code.padStart(5, '0');
  const response = await fetch(`${API_BASE_URL}/${paddedCode}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch bank: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || null;
}

/**
 * Search banks via backend API
 */
async function searchBanksAPI(query: string): Promise<BankInfo[]> {
  const response = await fetch(
    `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to search banks: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Get bank from IBAN via backend API
 */
async function getBankFromIBANAPI(iban: string): Promise<BankInfo | null> {
  const cleaned = formatIBAN(iban);

  if (cleaned.length !== 26 || !cleaned.startsWith('TR')) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/iban/${cleaned}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to get bank from IBAN: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || null;
}

/**
 * Validate IBAN via backend API
 */
async function validateIBANAPI(iban: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/validate-iban`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(iban),
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json();
  return result.data === true;
}

// ================================================
// BANK INFO SERVICE CLASS (API-BASED)
// ================================================

export class BankInfoService {
  private bankCache: Map<string, BankInfo> = new Map();
  private allBanksCache: BankInfo[] | null = null;
  private cacheExpiry: number = 24 * 60 * 60 * 1000; // 24 hours
  private lastCacheTime: number = 0;

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheTime < this.cacheExpiry;
  }

  /**
   * Get all banks (with caching)
   */
  async getAllBanks(options: BankSearchOptions = {}): Promise<BankInfo[]> {
    // Use cache if valid
    if (this.allBanksCache && this.isCacheValid()) {
      return this.filterAndSort(this.allBanksCache, options);
    }

    // Fetch from API
    const banks = await fetchAllBanks();

    // Update cache
    this.allBanksCache = banks;
    this.lastCacheTime = Date.now();

    // Update individual bank cache
    banks.forEach((bank) => {
      this.bankCache.set(bank.code, bank);
    });

    return this.filterAndSort(banks, options);
  }

  /**
   * Get bank by code (with caching)
   */
  async getBankByCode(code: string): Promise<BankInfo | null> {
    const paddedCode = code.padStart(5, '0');

    // Check cache first
    if (this.bankCache.has(paddedCode) && this.isCacheValid()) {
      return this.bankCache.get(paddedCode) || null;
    }

    // Fetch from API
    const bank = await fetchBankByCode(paddedCode);

    if (bank) {
      this.bankCache.set(paddedCode, bank);
    }

    return bank;
  }

  /**
   * Get bank from IBAN
   */
  async getBankFromIBAN(iban: string): Promise<BankInfo | null> {
    return getBankFromIBANAPI(iban);
  }

  /**
   * Search banks by name or code
   */
  async searchBanks(
    query: string,
    options: BankSearchOptions = {}
  ): Promise<BankInfo[]> {
    // Try API search first
    try {
      const results = await searchBanksAPI(query);
      return this.filterAndSort(results, options);
    } catch (error) {
      // Fallback to client-side filtering if API fails
      console.warn('API search failed, using client-side filter:', error);
      const allBanks = await this.getAllBanks();
      const lowerQuery = query.toLowerCase();

      const filtered = allBanks.filter(
        (bank) =>
          bank.name.toLowerCase().includes(lowerQuery) ||
          bank.shortName.toLowerCase().includes(lowerQuery) ||
          bank.code.includes(query)
      );

      return this.filterAndSort(filtered, options);
    }
  }

  /**
   * Validate IBAN and return bank info
   */
  async validateIBANWithBank(
    iban: string,
    options: BankValidationOptions = {}
  ): Promise<IBANValidationResult & { bankDetails?: BankInfo }> {
    // First, do client-side validation
    const validation = validateTurkishIBAN(iban);

    if (!validation.isValid) {
      return validation;
    }

    // Get bank details from backend
    try {
      const bankDetails = await this.getBankFromIBAN(iban);

      // Check active status if requested
      if (options.checkActive && bankDetails && bankDetails.active === false) {
        return {
          ...validation,
          isValid: false,
          errors: [
            ...validation.errors,
            'Bu banka artık aktif değil veya birleştirilmiş olabilir',
          ],
        };
      }

      // Validate with backend API if strict validation requested
      if (options.strictValidation) {
        const isValid = await validateIBANAPI(iban);

        if (!isValid) {
          return {
            ...validation,
            isValid: false,
            errors: [...validation.errors, 'IBAN doğrulama başarısız'],
          };
        }
      }

      return {
        ...validation,
        bankDetails: bankDetails || undefined,
      };
    } catch (error) {
      console.error('Bank validation error:', error);
      return validation; // Return client-side validation on error
    }
  }

  /**
   * Format IBAN for display
   */
  formatIBAN(iban: string): string {
    return displayIBAN(iban);
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.bankCache.clear();
    this.allBanksCache = null;
    this.lastCacheTime = 0;
  }

  /**
   * Filter and sort banks based on options
   */
  private filterAndSort(
    banks: BankInfo[],
    options: BankSearchOptions
  ): BankInfo[] {
    let result = [...banks];

    // Filter active only
    if (options.activeOnly) {
      result = result.filter((b) => b.active !== false);
    }

    // Sort
    const sortBy = options.sortBy || 'name';
    const sortOrder = options.sortOrder || 'asc';

    result.sort((a, b) => {
      const compareValue =
        sortBy === 'name'
          ? a.name.localeCompare(b.name, 'tr')
          : a.code.localeCompare(b.code);

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return result;
  }

  /**
   * Get popular banks (commonly used Turkish banks)
   * Cached result for better performance
   */
  async getPopularBanks(): Promise<BankInfo[]> {
    const popularCodes = [
      '00064', // İş Bankası
      '00062', // Garanti BBVA
      '00010', // Ziraat Bankası
      '00015', // Vakıfbank
      '00012', // Halkbank
      '00067', // Yapı Kredi
      '00032', // Türkiye Finans
      '00059', // Şekerbank
      '00046', // Akbank
      '00099', // ING
    ];

    const banks = await Promise.all(
      popularCodes.map((code) => this.getBankByCode(code))
    );

    return banks.filter((bank): bank is BankInfo => bank !== null);
  }

  /**
   * Get bank count (from cache or API)
   */
  async getBankCount(): Promise<number> {
    const banks = await this.getAllBanks();
    return banks.length;
  }

  /**
   * Check if bank code exists
   */
  async hasBankCode(code: string): Promise<boolean> {
    const bank = await this.getBankByCode(code);
    return bank !== null;
  }
}

// ================================================
// SINGLETON INSTANCE
// ================================================

const bankInfoService = new BankInfoService();
export default bankInfoService;
