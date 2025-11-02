// ================================================
// WALLET & PAYOUT TYPES
// ================================================
// Created: October 25, 2025
// Sprint: Wallet & Payout System Integration

import type { Transaction as BackendTransaction } from '@/lib/api/validators';

// ================================================
// BASE TYPES (Backend-aligned)
// ================================================

// Transaction Type Enum
export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  ESCROW_HOLD = 'ESCROW_HOLD',
  ESCROW_RELEASE = 'ESCROW_RELEASE',
  PAYOUT = 'PAYOUT',
  REFUND = 'REFUND',
  FEE = 'FEE',
}

// Payout Status Enum
export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

// Payout Method Enum
export enum PayoutMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  IYZICO_PAYOUT = 'IYZICO_PAYOUT',
  WALLET_TRANSFER = 'WALLET_TRANSFER',
}

// PayoutMethodEnum - REMOVED (Sprint 1.4: Legacy Cleanup)
// Use PayoutMethod instead

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

// ================================================
// WALLET TYPES
// ================================================

export interface Wallet {
  id: string;
  userId: string;
  balance: number; // Available balance (withdrawable)
  pendingBalance: number; // Funds in escrow
  totalEarned: number; // Lifetime earnings
  currency: string;
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
  activeOrdersCount?: number; // Number of active orders with pending escrow
}

export interface WalletBalance {
  availableBalance: number;
  pendingBalance: number;
  totalBalance: number;
  totalEarnings: number;
  pendingPayouts: number;
  currency: string;
}

// ================================================
// ESCROW PAYMENT TYPES
// ================================================

export interface EscrowPaymentDetails {
  id: string;
  orderId: string;
  orderTitle: string;
  amount: number;
  currency: string;
  status:
    | 'HELD'
    | 'FROZEN'
    | 'RELEASED'
    | 'REFUNDED'
    | 'PARTIALLY_REFUNDED'
    | 'PENDING_RELEASE';
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  createdAt: string;
  autoReleaseDate?: string;
  disputeId?: string;
  canRelease: boolean;
  canDispute: boolean;
  history: Array<{
    id: string;
    type:
      | 'PAYMENT_HELD'
      | 'DISPUTE_RAISED'
      | 'PAYMENT_FROZEN'
      | 'DISPUTE_RESOLVED'
      | 'PAYMENT_UNFROZEN'
      | 'PAYMENT_RELEASED'
      | 'REFUND_ISSUED'
      | 'AUTO_RELEASE_SCHEDULED'
      | 'ORDER_COMPLETED'
      | 'ORDER_DELIVERED';
    timestamp: string;
    actor?: {
      id: string;
      name: string;
      role: 'BUYER' | 'SELLER' | 'ADMIN' | 'SYSTEM';
    };
    metadata?: Record<string, unknown>;
  }>;
}

// ================================================
// TRANSACTION TYPES
// ================================================

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  relatedEntityType?: 'ORDER' | 'PAYMENT' | 'PAYOUT';
  relatedEntityId?: string;
  balanceAfter: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionFilters {
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  relatedEntityType?: string;
}

export interface TransactionListResponse {
  content: Transaction[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ================================================
// PAYOUT TYPES
// ================================================

export interface BankAccountInfo {
  bankName: string;
  iban: string;
  accountHolder: string;
  branchCode?: string;
  accountNumber?: string;
}

export interface PayoutRequest {
  amount: number;
  method: PayoutMethod;
  bankAccountId?: string; // Payment method ID for bank transfer
  bankAccountInfo?: BankAccountInfo; // Legacy: direct bank info
  notes?: string;
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: PayoutMethod;
  status: PayoutStatus;
  bankAccountInfo?: BankAccountInfo;
  iyzicoPayoutId?: string;
  description: string;
  failureReason?: string;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  estimatedArrival?: string;
  metadata?: Record<string, unknown>;
}

export interface PayoutLimits {
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  currency: string;
}

export interface PayoutEligibility {
  canRequestPayout: boolean;
  reason?: string;
  availableBalance: number;
  pendingPayouts: number;
  minimumBalance: number;
  lastPayoutDate?: string;
  nextEligibleDate?: string;
}

export interface PayoutListResponse {
  content: Payout[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ================================================
// ANALYTICS TYPES
// ================================================

export interface EarningsData {
  date: string;
  amount: number;
  orderCount: number;
}

export interface EarningsAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  platformFee: number;
  netEarnings: number;
  earningsOverTime: EarningsData[];
  topPackages: Array<{
    packageId: string;
    packageTitle: string;
    revenue: number;
    orderCount: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface RevenueBreakdown {
  byPackage: Array<{
    packageId: string;
    packageTitle: string;
    revenue: number;
    percentage: number;
  }>;
  byMonth: Array<{
    month: string;
    revenue: number;
    orderCount: number;
  }>;
  byCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
}

// ================================================
// ADMIN TYPES
// ================================================

export interface AdminPayoutDetail extends Payout {
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    avatarUrl?: string;
  };
  wallet: {
    balance: number;
    pendingBalance: number;
    totalEarned: number;
  };
  recentTransactions: Transaction[];
  orderStats: {
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
  };
  waitingTime: number; // in minutes
}

export interface PayoutAdminFilters {
  status?: PayoutStatus;
  method?: PayoutMethod;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
  waitingTimeMin?: number; // in hours
}

export interface PayoutModerateRequest {
  payoutId: string;
  action: 'APPROVE' | 'REJECT' | 'COMPLETE' | 'FAIL';
  reason?: string;
  adminNotes?: string;
}

// ================================================
// RESPONSE TYPES
// ================================================

export interface WalletResponse {
  wallet: Wallet;
  balance: WalletBalance;
  recentTransactions: Transaction[];
}

export interface CreatePayoutResponse {
  payout: Payout;
  message: string;
  estimatedArrival: string;
}

export interface CancelPayoutResponse {
  success: boolean;
  message: string;
  refundedAmount: number;
}

// ================================================
// FORM TYPES
// ================================================

export interface PayoutFormData {
  amount: string;
  method: PayoutMethod;
  bankName: string;
  iban: string;
  accountHolder: string;
  confirmIban: boolean;
  acceptTerms: boolean;
}

export interface TransactionExportOptions {
  format: 'CSV' | 'PDF' | 'EXCEL';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters?: TransactionFilters;
  includeMetadata?: boolean;
}

// ================================================
// UI STATE TYPES
// ================================================

export interface WalletUIState {
  isLoadingWallet: boolean;
  isLoadingTransactions: boolean;
  isLoadingPayouts: boolean;
  isSubmittingPayout: boolean;
  selectedTransaction: BackendTransaction | null; // Use backend Transaction type (from validators)
  selectedPayout: Payout | null;
  payoutModalOpen: boolean;
  transactionDetailModalOpen: boolean;
  error: string | null;
}

// ================================================
// API RESPONSE TYPES
// ================================================

export interface WalletResponse {
  id: string;
  userId: string;
  currentBalance: number;
  pendingBalance: number;
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceResponse {
  balance: number;
  pendingBalance: number;
  availableForPayout: number;
  totalEarnings: number;
  totalPayouts: number;
}

export interface PayoutEligibilityResponse {
  eligible: boolean;
  reason?: string;
  minimumAmount: number;
  availableBalance: number;
  pendingPayouts: number;
}

export interface PayoutLimitsResponse {
  minimumAmount: number;
  maximumAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  remainingDailyLimit: number;
  remainingMonthlyLimit: number;
}

// ================================================
// STORE TYPES
// ================================================

export interface WalletStore {
  wallet: WalletResponse | null;
  balance: BalanceResponse | null;
  transactions: Transaction[];
  payouts: Payout[];
  eligibility: PayoutEligibilityResponse | null;
  limits: PayoutLimitsResponse | null;
  ui: WalletUIState;

  // Actions
  fetchWallet: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  fetchTransactions: (
    filters?: TransactionFilters,
    page?: number
  ) => Promise<void>;
  fetchPayouts: (page?: number) => Promise<void>;
  fetchEligibility: () => Promise<void>;
  fetchLimits: () => Promise<void>;
  requestPayout: (data: PayoutRequest) => Promise<Payout>;
  cancelPayout: (payoutId: string) => Promise<void>;
  exportTransactions: (options: TransactionExportOptions) => Promise<Blob>;

  // UI Actions
  setPayoutModalOpen: (open: boolean) => void;
  setSelectedTransaction: (transaction: Transaction | null) => void;
  setSelectedPayout: (payout: Payout | null) => void;
  clearError: () => void;
  reset: () => void;
}

// ================================================
// HELPER TYPES
// ================================================

export type TransactionDirection = 'IN' | 'OUT';

export interface TransactionWithDirection extends Transaction {
  direction: TransactionDirection;
  isPositive: boolean;
}

export interface PayoutStatusInfo {
  label: string;
  color: string;
  icon: string;
  description: string;
}

export interface TransactionTypeInfo {
  label: string;
  icon: string;
  color: string;
  description: string;
}

// ================================================
// CONSTANTS
// ================================================

export const PAYOUT_STATUS_INFO: Record<PayoutStatus, PayoutStatusInfo> = {
  [PayoutStatus.PENDING]: {
    label: 'İnceleniyor',
    color: 'yellow',
    icon: '⏳',
    description: 'Para çekme talebiniz inceleniyor',
  },
  [PayoutStatus.PROCESSING]: {
    label: 'İşleme Alındı',
    color: 'blue',
    icon: '🔄',
    description: 'Ödeme işleniyor',
  },
  [PayoutStatus.COMPLETED]: {
    label: 'Tamamlandı',
    color: 'green',
    icon: '✅',
    description: 'Hesabınıza aktarıldı',
  },
  [PayoutStatus.FAILED]: {
    label: 'Başarısız',
    color: 'red',
    icon: '❌',
    description: 'İşlem başarısız oldu',
  },
  [PayoutStatus.CANCELLED]: {
    label: 'İptal Edildi',
    color: 'gray',
    icon: '🚫',
    description: 'Talep iptal edildi',
  },
};

export const TRANSACTION_TYPE_INFO: Record<
  TransactionType,
  TransactionTypeInfo
> = {
  [TransactionType.CREDIT]: {
    label: 'Gelen Ödeme',
    icon: '↗️',
    color: 'green',
    description: 'Hesaba para girişi',
  },
  [TransactionType.DEBIT]: {
    label: 'Giden Ödeme',
    icon: '↘️',
    color: 'red',
    description: 'Hesaptan para çıkışı',
  },
  [TransactionType.ESCROW_HOLD]: {
    label: 'Ödeme Tutuldu',
    icon: '⏸️',
    color: 'yellow',
    description: "Ödeme escrow'da tutuluyor",
  },
  [TransactionType.ESCROW_RELEASE]: {
    label: 'Escrow Serbest',
    icon: '✅',
    color: 'green',
    description: 'Tutulan ödeme serbest bırakıldı',
  },
  [TransactionType.PAYOUT]: {
    label: 'Para Çekme',
    icon: '💸',
    color: 'blue',
    description: 'Para çekme işlemi',
  },
  [TransactionType.REFUND]: {
    label: 'İade',
    icon: '↩️',
    color: 'orange',
    description: 'İade ödemesi',
  },
  [TransactionType.FEE]: {
    label: 'Komisyon',
    icon: '💰',
    color: 'purple',
    description: 'Platform komisyonu',
  },
};

// ================================================
// VALIDATION SCHEMAS (for Zod)
// ================================================

export const TURKISH_BANKS = [
  'Ziraat Bankası',
  'İş Bankası',
  'Garanti BBVA',
  'Akbank',
  'Yapı Kredi',
  'Halkbank',
  'Vakıfbank',
  'Denizbank',
  'QNB Finansbank',
  'TEB',
  'ING',
  'Kuveyt Türk',
  'Albaraka Türk',
  'Türkiye Finans',
  'Ziraat Katılım',
  'Vakıf Katılım',
  'Fibabanka',
  'Odeabank',
  'Şekerbank',
  'HSBC',
  'Alternatif Bank',
] as const;

export type TurkishBank = (typeof TURKISH_BANKS)[number];

// ================================================
// UTILITY FUNCTIONS (type helpers)
// ================================================

export function isPositiveTransaction(type: TransactionType): boolean {
  return [
    TransactionType.CREDIT,
    TransactionType.ESCROW_RELEASE,
    TransactionType.REFUND,
  ].includes(type);
}

export function isNegativeTransaction(type: TransactionType): boolean {
  return [
    TransactionType.DEBIT,
    TransactionType.PAYOUT,
    TransactionType.FEE,
    TransactionType.ESCROW_HOLD,
  ].includes(type);
}

export function canCancelPayout(payout: Payout): boolean {
  return [PayoutStatus.PENDING, PayoutStatus.PROCESSING].includes(
    payout.status
  );
}

export function formatCurrency(
  amount: number,
  currency: string = 'TRY'
): string {
  const symbols: Record<string, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = symbols[currency] || currency;
  const formatted = amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formatted}`;
}

export function maskIBAN(iban: string): string {
  if (iban.length < 8) return iban;
  const first = iban.substring(0, 4);
  const last = iban.substring(iban.length - 4);
  const masked = '**** **** **** ****';
  return `${first} ${masked} ${last}`;
}
