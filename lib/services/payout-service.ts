/**
 * ================================================
 * PAYOUT SERVICE
 * ================================================
 * Business logic for payout operations
 *
 * Features:
 * - Eligibility checks
 * - Fee calculations
 * - Minimum/maximum amount validation
 * - Available balance calculation
 * - Payout request preparation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * @sprint Sprint 1 - Week 1 - Day 3-4: Payout Request Flow
 */

import logger from '@/lib/infrastructure/monitoring/logger';
import { getPayoutLimits as fetchPayoutLimitsFromAPI } from '@/lib/api/payouts';
import type { BankAccountResponse } from '@/lib/api/bank-accounts';
import { BankAccountStatus } from '@/lib/api/bank-accounts';

// ================================================
// CONSTANTS
// ================================================

/**
 * Payout configuration constants
 * These should ideally come from backend config
 */
export const PAYOUT_CONFIG = {
  // Minimum payout amount in TRY
  MINIMUM_AMOUNT: 100,

  // Maximum payout amount in TRY (per request)
  MAXIMUM_AMOUNT: 50000,

  // Platform fee percentage (e.g., 2% = 0.02)
  PLATFORM_FEE_PERCENTAGE: 0.02,

  // Fixed processing fee in TRY
  FIXED_PROCESSING_FEE: 5,

  // Minimum balance to keep in wallet (reserved amount)
  MINIMUM_WALLET_BALANCE: 10,

  // Daily payout limit
  DAILY_LIMIT: 100000,

  // Monthly payout limit
  MONTHLY_LIMIT: 500000,

  // Currency
  CURRENCY: 'TRY',
} as const;

// ================================================
// TYPES
// ================================================

export interface PayoutEligibility {
  eligible: boolean;
  reasons: string[];
  availableBalance: number;
  minimumAmount: number;
  maximumAmount: number;
  hasVerifiedBankAccount: boolean;
  verifiedBankAccountCount: number;
}

export interface PayoutFeeCalculation {
  requestedAmount: number;
  platformFee: number;
  processingFee: number;
  totalFees: number;
  netAmount: number;
  totalDeduction: number;
}

export interface PayoutRequestValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PayoutLimits {
  minimumAmount: number;
  maximumAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  remainingDailyLimit: number;
  remainingMonthlyLimit: number;
  currency: string;
}

// ================================================
// PAYOUT SERVICE CLASS
// ================================================

export class PayoutService {
  /**
   * Check if user is eligible for payout
   */
  checkEligibility(
    availableBalance: number,
    bankAccounts: BankAccountResponse[]
  ): PayoutEligibility {
    const reasons: string[] = [];

    // Check verified bank accounts
    const verifiedAccounts = bankAccounts.filter(
      (account) => account.status === BankAccountStatus.VERIFIED
    );

    const hasVerifiedBankAccount = verifiedAccounts.length > 0;

    if (!hasVerifiedBankAccount) {
      reasons.push('En az bir doğrulanmış banka hesabınız olmalıdır');
    }

    // Check minimum balance
    const minBalanceRequired =
      PAYOUT_CONFIG.MINIMUM_AMOUNT + PAYOUT_CONFIG.MINIMUM_WALLET_BALANCE;

    if (availableBalance < minBalanceRequired) {
      reasons.push(
        `Minimum bakiye gereksinimi: ${minBalanceRequired} TL (${PAYOUT_CONFIG.MINIMUM_AMOUNT} TL ödeme + ${PAYOUT_CONFIG.MINIMUM_WALLET_BALANCE} TL rezerv)`
      );
    }

    const eligible = reasons.length === 0;

    return {
      eligible,
      reasons,
      availableBalance,
      minimumAmount: PAYOUT_CONFIG.MINIMUM_AMOUNT,
      maximumAmount: Math.min(
        PAYOUT_CONFIG.MAXIMUM_AMOUNT,
        availableBalance - PAYOUT_CONFIG.MINIMUM_WALLET_BALANCE
      ),
      hasVerifiedBankAccount,
      verifiedBankAccountCount: verifiedAccounts.length,
    };
  }

  /**
   * Calculate payout fees
   */
  calculateFees(requestedAmount: number): PayoutFeeCalculation {
    // Platform fee (percentage)
    const platformFee = Math.round(
      requestedAmount * PAYOUT_CONFIG.PLATFORM_FEE_PERCENTAGE
    );

    // Fixed processing fee
    const processingFee = PAYOUT_CONFIG.FIXED_PROCESSING_FEE;

    // Total fees
    const totalFees = platformFee + processingFee;

    // Net amount user receives
    const netAmount = requestedAmount - totalFees;

    // Total deduction from wallet
    const totalDeduction = requestedAmount;

    return {
      requestedAmount,
      platformFee,
      processingFee,
      totalFees,
      netAmount,
      totalDeduction,
    };
  }

  /**
   * Validate payout request
   */
  validatePayoutRequest(
    amount: number,
    bankAccountId: string | undefined,
    availableBalance: number,
    bankAccounts: BankAccountResponse[]
  ): PayoutRequestValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Amount validations
    if (!amount || amount <= 0) {
      errors.push('Ödeme tutarı belirtilmelidir');
    } else {
      if (amount < PAYOUT_CONFIG.MINIMUM_AMOUNT) {
        errors.push(
          `Minimum ödeme tutarı ${PAYOUT_CONFIG.MINIMUM_AMOUNT} TL olmalıdır`
        );
      }

      if (amount > PAYOUT_CONFIG.MAXIMUM_AMOUNT) {
        errors.push(
          `Maximum ödeme tutarı ${PAYOUT_CONFIG.MAXIMUM_AMOUNT} TL olmalıdır`
        );
      }

      // Check available balance (including reserve)
      const maxWithdrawable =
        availableBalance - PAYOUT_CONFIG.MINIMUM_WALLET_BALANCE;

      if (amount > maxWithdrawable) {
        errors.push(
          `Kullanılabilir bakiye yetersiz. Maksimum çekilebilir: ${maxWithdrawable} TL`
        );
      }

      // Warning for high amounts
      if (amount > 10000) {
        warnings.push('Yüksek tutarlar için işlem süresi uzayabilir');
      }
    }

    // Bank account validations
    if (!bankAccountId) {
      errors.push('Banka hesabı seçilmelidir');
    } else {
      const selectedAccount = bankAccounts.find((a) => a.id === bankAccountId);

      if (!selectedAccount) {
        errors.push('Seçilen banka hesabı bulunamadı');
      } else if (selectedAccount.status !== BankAccountStatus.VERIFIED) {
        errors.push('Seçilen banka hesabı henüz doğrulanmadı');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get maximum withdrawable amount
   */
  getMaxWithdrawableAmount(availableBalance: number): number {
    return Math.max(
      0,
      Math.min(
        PAYOUT_CONFIG.MAXIMUM_AMOUNT,
        availableBalance - PAYOUT_CONFIG.MINIMUM_WALLET_BALANCE
      )
    );
  }

  /**
   * Calculate net payout after fees
   */
  calculateNetPayout(grossAmount: number): number {
    const fees = this.calculateFees(grossAmount);
    return fees.netAmount;
  }

  /**
   * Format payout amount for display
   */
  formatAmount(amount: number, currency: string = 'TRY'): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Get payout limits from backend API
   * Falls back to config values on error
   */
  async getPayoutLimits(): Promise<PayoutLimits> {
    try {
      // Fetch limits from backend API
      const limits = await fetchPayoutLimitsFromAPI();

      return {
        minimumAmount: limits.minimumAmount ?? PAYOUT_CONFIG.MINIMUM_AMOUNT,
        maximumAmount: limits.maximumAmount ?? PAYOUT_CONFIG.MAXIMUM_AMOUNT,
        dailyLimit: limits.dailyLimit ?? PAYOUT_CONFIG.DAILY_LIMIT,
        monthlyLimit: limits.monthlyLimit ?? PAYOUT_CONFIG.MONTHLY_LIMIT,
        remainingDailyLimit:
          limits.remainingDailyLimit ?? PAYOUT_CONFIG.DAILY_LIMIT,
        remainingMonthlyLimit:
          limits.remainingMonthlyLimit ?? PAYOUT_CONFIG.MONTHLY_LIMIT,
        currency: limits.currency ?? PAYOUT_CONFIG.CURRENCY,
      };
    } catch (error) {
      // Fallback to config values if API call fails
      logger.warn('Failed to fetch payout limits from API, { usingconfigvalues, errorerrorinstanceofErrorerrormessageUnknownerror,  });

      return {
        minimumAmount: PAYOUT_CONFIG.MINIMUM_AMOUNT,
        maximumAmount: PAYOUT_CONFIG.MAXIMUM_AMOUNT,
        dailyLimit: PAYOUT_CONFIG.DAILY_LIMIT,
        monthlyLimit: PAYOUT_CONFIG.MONTHLY_LIMIT,
        remainingDailyLimit: PAYOUT_CONFIG.DAILY_LIMIT,
        remainingMonthlyLimit: PAYOUT_CONFIG.MONTHLY_LIMIT,
        currency: PAYOUT_CONFIG.CURRENCY,
      };
    }
  }

  /**
   * Get payout limits synchronously (deprecated - use getPayoutLimits instead)
   * @deprecated Use async getPayoutLimits() instead
   */
  getPayoutLimitsSync(
    dailyUsed: number = 0,
    monthlyUsed: number = 0
  ): PayoutLimits {
    return {
      minimumAmount: PAYOUT_CONFIG.MINIMUM_AMOUNT,
      maximumAmount: PAYOUT_CONFIG.MAXIMUM_AMOUNT,
      dailyLimit: PAYOUT_CONFIG.DAILY_LIMIT,
      monthlyLimit: PAYOUT_CONFIG.MONTHLY_LIMIT,
      remainingDailyLimit: Math.max(0, PAYOUT_CONFIG.DAILY_LIMIT - dailyUsed),
      remainingMonthlyLimit: Math.max(
        0,
        PAYOUT_CONFIG.MONTHLY_LIMIT - monthlyUsed
      ),
      currency: PAYOUT_CONFIG.CURRENCY,
    };
  }

  /**
   * Estimate processing time based on amount
   */
  estimateProcessingTime(amount: number): string {
    if (amount < 1000) {
      return '1-2 iş günü';
    } else if (amount < 10000) {
      return '2-3 iş günü';
    } else {
      return '3-5 iş günü';
    }
  }

  /**
   * Get payout status color for UI
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'yellow';
      case 'APPROVED':
        return 'blue';
      case 'PROCESSING':
        return 'purple';
      case 'COMPLETED':
        return 'green';
      case 'FAILED':
      case 'CANCELED':
        return 'red';
      default:
        return 'gray';
    }
  }

  /**
   * Get payout status label in Turkish
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Beklemede',
      APPROVED: 'Onaylandı',
      PROCESSING: 'İşleniyor',
      COMPLETED: 'Tamamlandı',
      FAILED: 'Başarısız',
      CANCELED: 'İptal Edildi',
    };
    return labels[status] || status;
  }

  /**
   * Log payout action for audit
   */
  logPayoutAction(action: string, data: Record<string, unknown>): void {
    logger.info(`Payout action: ${action}`, data);
  }
}

// ================================================
// SINGLETON INSTANCE
// ================================================

export const payoutService = new PayoutService();

// ================================================
// EXPORTS
// ================================================

export default payoutService;
