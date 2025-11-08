/**
 * ================================================
 * ADMIN PAYOUT API CLIENT
 * ================================================
 * API functions for admin payout management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 26, 2025
 */

import { apiClient } from '@/lib/api';
import type {
  Payout,
  PayoutStatus,
  WalletResponse,
  Transaction,
} from '@/types/business/features/wallet';

// Sprint 2: Removed unused canonical formatter import
// Use directly from @/lib/shared/formatters where needed

// ================================================
// TYPES
// ================================================

export interface PayoutFilters {
  status?: PayoutStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  userId?: string;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

export interface PayoutFailRequest {
  reason: string;
}

export interface AdminPayoutStats {
  totalPending: number;
  totalProcessing: number;
  totalCompletedToday: number;
  totalAmountPending: number;
  totalAmountCompleted: number;
}

// ================================================
// API CLIENT
// ================================================

export const payoutAdminApi = {
  /**
   * Get all payouts (paginated and filtered)
   * GET /api/v1/admin/payouts
   */
  getPayouts: async (
    filters: PayoutFilters = {}
  ): Promise<PageResponse<Payout>> => {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.minAmount)
      params.append('minAmount', filters.minAmount.toString());
    if (filters.maxAmount)
      params.append('maxAmount', filters.maxAmount.toString());
    if (filters.userId) params.append('userId', filters.userId);
    params.append('page', (filters.page || 0).toString());
    params.append('size', (filters.size || 20).toString());

    const queryString = params.toString();
    return apiClient.get<PageResponse<Payout>>(
      `/api/v1/admin/payouts${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Get pending payouts only
   * GET /api/v1/admin/payouts/pending
   */
  getPendingPayouts: async (): Promise<Payout[]> => {
    return apiClient.get<Payout[]>('/api/v1/admin/payouts/pending');
  },

  /**
   * Get payout details by ID
   * GET /api/v1/admin/payouts/{id}
   */
  getPayout: async (payoutId: string): Promise<Payout> => {
    return apiClient.get<Payout>(`/api/v1/admin/payouts/${payoutId}`);
  },

  /**
   * Process payout (approve and mark as PROCESSING)
   * POST /api/v1/admin/payouts/{id}/process
   */
  processPayout: async (payoutId: string): Promise<Payout> => {
    return apiClient.post<Payout>(`/api/v1/admin/payouts/${payoutId}/process`);
  },

  /**
   * Mark payout as completed (after bank transfer)
   * POST /api/v1/admin/payouts/{id}/complete
   */
  completePayout: async (payoutId: string): Promise<Payout> => {
    return apiClient.post<Payout>(`/api/v1/admin/payouts/${payoutId}/complete`);
  },

  /**
   * Mark payout as failed (with reason)
   * POST /api/v1/admin/payouts/{id}/fail
   */
  failPayout: async (payoutId: string, reason: string): Promise<Payout> => {
    return apiClient.post<Payout>(`/api/v1/admin/payouts/${payoutId}/fail`, {
      reason,
    });
  },

  /**
   * Cancel payout (refund to wallet)
   * POST /api/v1/admin/payouts/{id}/cancel
   */
  cancelPayout: async (payoutId: string): Promise<Payout> => {
    return apiClient.post<Payout>(`/api/v1/admin/payouts/${payoutId}/cancel`);
  },

  /**
   * Get user's payout history
   * GET /api/v1/admin/payouts/user/{userId}
   */
  getUserPayouts: async (userId: string): Promise<Payout[]> => {
    return apiClient.get<Payout[]>(`/api/v1/admin/payouts/user/${userId}`);
  },

  /**
   * Get user's wallet details
   * GET /api/v1/admin/wallets/{userId}
   */
  getUserWallet: async (userId: string): Promise<WalletResponse> => {
    return apiClient.get<WalletResponse>(`/api/v1/admin/wallets/${userId}`);
  },

  /**
   * Get user's wallet transactions
   * GET /api/v1/admin/wallets/{userId}/transactions
   */
  getUserTransactions: async (
    userId: string,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<Transaction>> => {
    return apiClient.get<PageResponse<Transaction>>(
      `/api/v1/admin/wallets/${userId}/transactions?page=${page}&size=${size}`
    );
  },

  /**
   * Get payout statistics
   * GET /api/v1/admin/payouts/stats
   */
  getPayoutStats: async (): Promise<AdminPayoutStats> => {
    return apiClient.get<AdminPayoutStats>('/api/v1/admin/payouts/stats');
  },
};

// ================================================
// HELPER FUNCTIONS
// ================================================

// Sprint 2: Removed deprecated formatCurrency wrapper
// Use formatCurrency from @/lib/shared/formatters directly

/**
 * Mask IBAN for display
 */
export const maskIBAN = (iban: string): string => {
  if (!iban || iban.length < 8) return iban;
  const prefix = iban.substring(0, 4);
  const suffix = iban.substring(iban.length - 4);
  const masked = '*'.repeat(Math.max(0, iban.length - 8));
  return `${prefix}${masked}${suffix}`;
};

/**
 * Get status color for badges
 */
export const getStatusColor = (
  status: PayoutStatus
): {
  bg: string;
  text: string;
  border: string;
} => {
  const colors = {
    PENDING: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
    },
    PROCESSING: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
    COMPLETED: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    },
    FAILED: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
    },
    CANCELLED: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
    },
  };

  return colors[status] || colors.PENDING;
};

/**
 * Get status label in Turkish
 */
export const getStatusLabel = (status: PayoutStatus): string => {
  const labels = {
    PENDING: 'Beklemede',
    PROCESSING: 'İşleniyor',
    COMPLETED: 'Tamamlandı',
    FAILED: 'Başarısız',
    CANCELLED: 'İptal Edildi',
  };

  return labels[status] || status;
};
