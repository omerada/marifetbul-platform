/**
 * ================================================
 * CURRENCY API CLIENT
 * ================================================
 * API functions for currency conversion and exchange rate operations
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Story 3.1: Multi-Currency Wallet Support
 */

import { apiClient } from '@/lib/infrastructure/api/client';

// ============================================================================
// TYPES
// ============================================================================

export type CurrencyCode = 'TRY' | 'USD' | 'EUR';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  nameTr: string;
  nameEn: string;
  decimalPlaces: number;
  isDefault: boolean;
}

export interface ExchangeRatesResponse {
  baseCurrency: CurrencyCode;
  rates: Record<string, number>;
  lastUpdate: string;
}

export interface ConversionResponse {
  amount: number;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: number;
  convertedAmount: number;
  timestamp: string;
}

export interface ExchangeRateResponse {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: number;
  lastUpdate: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get list of supported currencies
 * GET /api/v1/currency/supported
 */
export async function getSupportedCurrencies(): Promise<CurrencyInfo[]> {
  return apiClient.get<CurrencyInfo[]>('/currency/supported');
}

/**
 * Get all exchange rates
 * GET /api/v1/currency/rates
 *
 * @param baseCurrency Base currency for rates (default: TRY)
 */
export async function getExchangeRates(
  baseCurrency: CurrencyCode = 'TRY'
): Promise<ExchangeRatesResponse> {
  return apiClient.get<ExchangeRatesResponse>('/currency/rates', {
    baseCurrency,
  });
}

/**
 * Convert amount between currencies
 * GET /api/v1/currency/convert
 *
 * @param amount Amount to convert
 * @param from Source currency
 * @param to Target currency
 */
export async function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): Promise<ConversionResponse> {
  return apiClient.get<ConversionResponse>('/currency/convert', {
    amount: amount.toString(),
    from,
    to,
  });
}

/**
 * Get specific exchange rate
 * GET /api/v1/currency/rate
 *
 * @param from Source currency
 * @param to Target currency
 */
export async function getExchangeRate(
  from: CurrencyCode,
  to: CurrencyCode
): Promise<ExchangeRateResponse> {
  return apiClient.get<ExchangeRateResponse>('/currency/rate', {
    from,
    to,
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format amount with currency symbol
 */
export function formatCurrencyAmount(
  amount: number,
  currency: CurrencyCode,
  locale: string = 'tr-TR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  const symbols: Record<CurrencyCode, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
  };
  return symbols[currency] || currency;
}

/**
 * Get currency name (Turkish)
 */
export function getCurrencyNameTr(currency: CurrencyCode): string {
  const names: Record<CurrencyCode, string> = {
    TRY: 'Türk Lirası',
    USD: 'Amerikan Doları',
    EUR: 'Euro',
  };
  return names[currency] || currency;
}

// ============================================================================
// EXPORT API OBJECT
// ============================================================================

export const currencyApi = {
  getSupportedCurrencies,
  getExchangeRates,
  convertCurrency,
  getExchangeRate,
  formatCurrencyAmount,
  getCurrencySymbol,
  getCurrencyNameTr,
};

export default currencyApi;
