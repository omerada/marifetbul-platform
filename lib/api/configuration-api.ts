/**
 * ================================================
 * CONFIGURATION API CLIENT
 * ================================================
 * API client for system configuration and platform settings
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 11, 2025
 */

import { apiClient } from '@/lib/infrastructure/api/client';

// ================================================
// TYPES
// ================================================

export interface BankAccountConfiguration {
  iban: string;
  accountHolder: string;
  bankName: string;
  branchCode?: string;
  accountNumber?: string;
  currency: 'TRY';
  isActive: boolean;
}

export interface WalletConfiguration {
  minPayoutAmount: number;
  maxPayoutAmount: number;
  dailyPayoutLimit: number;
  monthlyPayoutCountLimit: number;
  processingTimeHours: number;
  autoProcessEnabled: boolean;
  transactionFeePercentage: number;
  fixedTransactionFee: number;
  instantPayoutFeePercentage: number;
  maxWalletBalance: number;
  minWalletBalance: number;
  supportedCurrencies: string[];
  defaultCurrency: 'TRY';
}

export interface SystemConfiguration {
  key: string;
  value: string;
  category: string;
  description?: string;
  dataType: 'STRING' | 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'JSON';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ================================================
// API FUNCTIONS
// ================================================

/**
 * Get platform bank account information for IBAN transfers
 * 
 * This returns the platform's bank account where users should
 * transfer money for manual payments.
 */
export async function getPlatformBankAccount(): Promise<BankAccountConfiguration> {
  // For now, we use a configuration key to fetch IBAN
  // Backend should have a dedicated endpoint or configuration entry
  const config = await apiClient.get<SystemConfiguration>('/api/v1/config/platform.bank.iban');
  
  // Parse the JSON value
  const bankAccount: BankAccountConfiguration = JSON.parse(config.value);
  return bankAccount;
}

/**
 * Get wallet configuration (public endpoint)
 */
export async function getWalletConfiguration(): Promise<WalletConfiguration> {
  return apiClient.get('/api/v1/config/wallet');
}

/**
 * Get system configuration by key (admin only)
 */
export async function getConfigurationByKey(key: string): Promise<SystemConfiguration> {
  return apiClient.get(`/api/v1/admin/config/${key}`);
}

/**
 * Get configurations by category (admin only)
 */
export async function getConfigurationsByCategory(
  category: string
): Promise<SystemConfiguration[]> {
  return apiClient.get(`/api/v1/admin/config/category/${category}`);
}

/**
 * Get all configurations (admin only)
 */
export async function getAllConfigurations(
  includeInactive = false
): Promise<SystemConfiguration[]> {
  const params = new URLSearchParams();
  if (includeInactive) {
    params.append('includeInactive', 'true');
  }
  return apiClient.get(`/api/v1/admin/config?${params.toString()}`);
}

/**
 * Update configuration value (admin only)
 */
export async function updateConfiguration(
  key: string,
  value: string
): Promise<SystemConfiguration> {
  return apiClient.put(`/api/v1/admin/config/${key}`, { value });
}

/**
 * Batch update configurations (admin only)
 */
export async function batchUpdateConfigurations(
  updates: Record<string, string>
): Promise<SystemConfiguration[]> {
  return apiClient.post('/api/v1/admin/config/batch', updates);
}

/**
 * Reset configuration to default (admin only)
 */
export async function resetConfiguration(key: string): Promise<SystemConfiguration> {
  return apiClient.post(`/api/v1/admin/config/${key}/reset`);
}

/**
 * Refresh configuration cache (admin only)
 */
export async function refreshConfigurationCache(): Promise<void> {
  return apiClient.post('/api/v1/admin/config/refresh');
}

// ================================================
// DEFAULT EXPORT
// ================================================

export default {
  getPlatformBankAccount,
  getWalletConfiguration,
  getConfigurationByKey,
  getConfigurationsByCategory,
  getAllConfigurations,
  updateConfiguration,
  batchUpdateConfigurations,
  resetConfiguration,
  refreshConfigurationCache,
};
