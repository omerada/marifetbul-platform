/**
 * ================================================
 * ADMIN WALLET API CLIENT
 * ================================================
 * API functions for admin wallet management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 30, 2025
 * @sprint Sprint 1 - Story 1.1
 */

import { apiClient } from '@/lib/api';
import type {
  WalletResponse,
  Payout,
  WalletStatus,
} from '@/types/business/features/wallet';

// ================================================
// TYPES
// ================================================

/**
 * Transaction response from backend (aligned with TransactionResponse.java)
 */
export interface TransactionResponse {
  id: string;
  walletId: string;
  paymentId?: string;
  type:
    | 'CREDIT'
    | 'DEBIT'
    | 'ESCROW_HOLD'
    | 'ESCROW_RELEASE'
    | 'COMMISSION'
    | 'REFUND'
    | 'WITHDRAWAL'
    | 'DEPOSIT'
    | 'PAYOUT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface WalletFilters {
  status?: WalletStatus;
  minBalance?: number;
  maxBalance?: number;
  searchQuery?: string;
  page?: number;
  size?: number;
  sortBy?: 'balance' | 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
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

export interface AdminWalletDetail {
  wallet: WalletResponse;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    avatarUrl?: string;
    role: string;
    verified: boolean;
  };
  recentTransactions: TransactionResponse[];
  recentPayouts: Payout[];
  stats: {
    totalEarned: number;
    totalPaid: number;
    completedOrders: number;
    pendingPayouts: number;
  };
}

export interface BalanceAdjustmentRequest {
  amount: number;
  type: 'ADD' | 'SUBTRACT';
  reason: string;
  description?: string;
}

export interface WalletActionRequest {
  reason: string;
}

export interface WalletStats {
  totalWallets: number;
  activeWallets: number;
  suspendedWallets: number;
  totalBalance: number;
  totalPendingBalance: number;
  averageBalance: number;
}

/**
 * Transaction filters for admin transaction listing
 */
export interface TransactionFilters {
  userId?: string;
  type?:
    | 'CREDIT'
    | 'DEBIT'
    | 'ESCROW_HOLD'
    | 'ESCROW_RELEASE'
    | 'COMMISSION'
    | 'REFUND'
    | 'WITHDRAWAL';
  startDate?: string; // ISO format
  endDate?: string; // ISO format
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'amount';
  sortDirection?: 'asc' | 'desc';
}

// ================================================
// API CLIENT
// ================================================

export const walletAdminApi = {
  /**
   * Get all wallets (paginated and filtered)
   * GET /api/v1/admin/wallets
   */
  getWallets: async (
    filters: WalletFilters = {}
  ): Promise<PageResponse<AdminWalletDetail>> => {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.minBalance)
      params.append('minBalance', filters.minBalance.toString());
    if (filters.maxBalance)
      params.append('maxBalance', filters.maxBalance.toString());
    if (filters.searchQuery) params.append('search', filters.searchQuery);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDirection)
      params.append('sortDirection', filters.sortDirection);
    params.append('page', (filters.page || 0).toString());
    params.append('size', (filters.size || 20).toString());

    const queryString = params.toString();
    return apiClient.get<PageResponse<AdminWalletDetail>>(
      `/api/v1/admin/wallets${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Get wallet details by user ID
   * GET /api/v1/admin/wallets/{userId}
   */
  getWalletByUserId: async (userId: string): Promise<AdminWalletDetail> => {
    return apiClient.get<AdminWalletDetail>(`/api/v1/admin/wallets/${userId}`);
  },

  /**
   * Get user transactions
   * GET /api/v1/admin/wallets/{userId}/transactions
   */
  getUserTransactions: async (
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<TransactionResponse>> => {
    return apiClient.get<PageResponse<TransactionResponse>>(
      `/api/v1/admin/wallets/${userId}/transactions?page=${page}&size=${size}`
    );
  },

  /**
   * Adjust wallet balance (add or subtract)
   * POST /api/v1/admin/wallets/{userId}/adjust
   */
  adjustBalance: async (
    userId: string,
    request: BalanceAdjustmentRequest
  ): Promise<WalletResponse> => {
    return apiClient.post<WalletResponse>(
      `/api/v1/admin/wallets/${userId}/adjust`,
      request
    );
  },

  /**
   * Freeze wallet (suspend)
   * POST /api/v1/admin/wallets/{userId}/freeze
   */
  freezeWallet: async (
    userId: string,
    request: WalletActionRequest
  ): Promise<WalletResponse> => {
    return apiClient.post<WalletResponse>(
      `/api/v1/admin/wallets/${userId}/freeze`,
      request
    );
  },

  /**
   * Unfreeze wallet (activate)
   * POST /api/v1/admin/wallets/{userId}/unfreeze
   */
  unfreezeWallet: async (userId: string): Promise<WalletResponse> => {
    return apiClient.post<WalletResponse>(
      `/api/v1/admin/wallets/${userId}/unfreeze`,
      {}
    );
  },

  /**
   * Get wallet statistics
   * GET /api/v1/admin/wallets/statistics
   */
  getWalletStats: async (): Promise<WalletStats> => {
    return apiClient.get<WalletStats>('/api/v1/admin/wallets/statistics');
  },

  /**
   * Get all transactions (paginated and filtered) - NEW
   * GET /api/v1/admin/wallets/transactions
   */
  getAllTransactions: async (
    filters: TransactionFilters = {}
  ): Promise<PageResponse<TransactionResponse>> => {
    const params = new URLSearchParams();

    if (filters.userId) params.append('userId', filters.userId);
    if (filters.type) params.append('type', filters.type);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.minAmount)
      params.append('minAmount', filters.minAmount.toString());
    if (filters.maxAmount)
      params.append('maxAmount', filters.maxAmount.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDirection)
      params.append('sortDirection', filters.sortDirection);
    params.append('page', (filters.page || 0).toString());
    params.append('size', (filters.size || 20).toString());

    const queryString = params.toString();
    return apiClient.get<PageResponse<TransactionResponse>>(
      `/api/v1/admin/wallets/transactions${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Get transactions by user ID - NEW
   * GET /api/v1/admin/wallets/transactions/user/{userId}
   */
  getTransactionsByUserId: async (
    userId: string,
    page: number = 0,
    size: number = 20,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<PageResponse<TransactionResponse>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);

    const queryString = params.toString();
    return apiClient.get<PageResponse<TransactionResponse>>(
      `/api/v1/admin/wallets/transactions/user/${userId}${queryString ? `?${queryString}` : ''}`
    );
  },
};

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Format currency with Turkish Lira symbol
 * 
 * @deprecated Since Sprint 3 Phase 3B (Nov 2025) - Use @/lib/shared/formatters instead
 * 
 * **Migration:**
 * ```ts
 * import { formatCurrency } from '@/lib/shared/formatters';
 * ```
 * 
 * **Timeline:** Will be removed in Sprint 4 (Dec 2025)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date in Turkish locale
 */
export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

/**
 * Format short date
 */
export const formatShortDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

/**
 * Get relative time (e.g., "2 saat önce")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return formatShortDate(dateString);
};

/**
 * Get wallet status color
 */
export const getWalletStatusColor = (status: WalletStatus): string => {
  switch (status) {
    case 'ACTIVE':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'SUSPENDED':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'CLOSED':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

/**
 * Get wallet status label
 */
export const getWalletStatusLabel = (status: WalletStatus): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Aktif';
    case 'SUSPENDED':
      return 'Askıya Alındı';
    case 'CLOSED':
      return 'Kapatıldı';
    default:
      return status;
  }
};
