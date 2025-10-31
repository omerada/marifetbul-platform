import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { walletApi, payoutApi } from '@/lib/api';
import type {
  Wallet,
  BalanceResponse,
  Transaction,
} from '@/lib/api/validators';
import type { Payout } from '@/types/business/features/wallet';
import { PayoutStatus } from '@/types/business/features/wallet';
import { transformPayoutResponses } from '@/lib/transformers/payout.transformer';
import {
  type PayoutRequest,
  type TransactionFilters,
  type TransactionExportOptions,
  type WalletUIState,
  type PayoutEligibilityResponse,
  type PayoutLimitsResponse,
} from '@/types/business/features/wallet';

// ================================================
// STORE STATE INTERFACE
// ================================================

interface WalletStore {
  wallet: Wallet | null;
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
// INITIAL STATE
// ================================================

const initialUIState: WalletUIState = {
  isLoadingWallet: false,
  isLoadingTransactions: false,
  isLoadingPayouts: false,
  isSubmittingPayout: false,
  selectedTransaction: null,
  selectedPayout: null,
  payoutModalOpen: false,
  transactionDetailModalOpen: false,
  error: null,
};

// ================================================
// ZUSTAND STORE
// ================================================

export const useWalletStore = create<WalletStore>()(
  devtools(
    (set, get) => ({
      // State
      wallet: null,
      balance: null,
      transactions: [],
      payouts: [],
      eligibility: null,
      limits: null,
      ui: initialUIState,

      // ==================== WALLET ACTIONS ====================

      fetchWallet: async () => {
        set((state) => ({
          ui: { ...state.ui, isLoadingWallet: true, error: null },
        }));

        try {
          // Fetch wallet, balance, and recent transactions in parallel
          const [walletData, balanceData, transactionsData] = await Promise.all(
            [
              walletApi.getWallet(),
              walletApi.getBalance(),
              walletApi.getTransactions(0, 5), // Get 5 most recent transactions
            ]
          );

          set({
            wallet: walletData,
            balance: balanceData,
            transactions: transactionsData,
            ui: { ...get().ui, isLoadingWallet: false },
          });
        } catch (error) {
          set((state) => ({
            ui: {
              ...state.ui,
              isLoadingWallet: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Cüzdan bilgileri yüklenemedi',
            },
          }));
          throw error;
        }
      },

      fetchBalance: async () => {
        try {
          const balanceData = await walletApi.getBalance();
          set({ balance: balanceData });
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          throw error;
        }
      },

      // ==================== TRANSACTION ACTIONS ====================

      fetchTransactions: async (filters?: TransactionFilters, page = 0) => {
        set((state) => ({
          ui: { ...state.ui, isLoadingTransactions: true, error: null },
        }));

        try {
          // Note: filters parameter not used - backend endpoint doesn't support filtering yet
          const data = await walletApi.getTransactions(page, 20);

          set({
            transactions: data,
            ui: { ...get().ui, isLoadingTransactions: false },
          });
        } catch (error) {
          set((state) => ({
            ui: {
              ...state.ui,
              isLoadingTransactions: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'İşlem geçmişi yüklenemedi',
            },
          }));
          throw error;
        }
      },

      // ==================== PAYOUT ACTIONS ====================

      fetchPayouts: async (page = 0) => {
        set((state) => ({
          ui: { ...state.ui, isLoadingPayouts: true, error: null },
        }));

        try {
          const data = await payoutApi.getPayoutHistory(page, 10);

          // Transform backend payouts to frontend type
          const transformedPayouts = transformPayoutResponses(
            data as unknown as Record<string, unknown>[]
          );

          set({
            payouts: transformedPayouts,
            ui: { ...get().ui, isLoadingPayouts: false },
          });
        } catch (error) {
          set((state) => ({
            ui: {
              ...state.ui,
              isLoadingPayouts: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Para çekme geçmişi yüklenemedi',
            },
          }));
          throw error;
        }
      },

      fetchEligibility: async () => {
        try {
          const data = await payoutApi.checkPayoutEligibility();
          set({ eligibility: data });
        } catch (error) {
          console.error('Failed to fetch eligibility:', error);
          throw error;
        }
      },

      fetchLimits: async () => {
        try {
          // Backend'de limits endpoint'i yok, mock data kullanıyoruz
          const mockLimits: PayoutLimitsResponse = {
            minimumAmount: 100,
            maximumAmount: 50000,
            dailyLimit: 10000,
            monthlyLimit: 100000,
            remainingDailyLimit: 10000,
            remainingMonthlyLimit: 100000,
          };
          set({ limits: mockLimits });
        } catch (error) {
          console.error('Failed to fetch limits:', error);
          throw error;
        }
      },

      requestPayout: async (data: PayoutRequest): Promise<Payout> => {
        set((state) => ({
          ui: { ...state.ui, isSubmittingPayout: true, error: null },
        }));

        try {
          const responseData = await payoutApi.createPayout({
            amount: data.amount,
            method: data.method as 'BANK_TRANSFER' | 'IYZICO',
            bankAccountId: data.bankAccountId,
          });

          // Transform backend payout to frontend type
          const newPayout = transformPayoutResponses([
            responseData as unknown as Record<string, unknown>,
          ])[0];

          // Add to payouts list
          set((state) => ({
            payouts: [newPayout, ...state.payouts],
            ui: {
              ...state.ui,
              isSubmittingPayout: false,
              payoutModalOpen: false,
            },
          }));

          // Refresh balance
          await get().fetchBalance();

          return newPayout;
        } catch (error) {
          set((state) => ({
            ui: {
              ...state.ui,
              isSubmittingPayout: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Para çekme talebi oluşturulamadı',
            },
          }));
          throw error;
        }
      },

      cancelPayout: async (payoutId: string) => {
        try {
          await payoutApi.cancelPayout(payoutId);

          // Update payout status in list
          set((state) => ({
            payouts: state.payouts.map((p) =>
              p.id === payoutId ? { ...p, status: PayoutStatus.CANCELLED } : p
            ),
          }));

          // Refresh balance
          await get().fetchBalance();
        } catch (error) {
          set((state) => ({
            ui: {
              ...state.ui,
              error:
                error instanceof Error
                  ? error.message
                  : 'Para çekme talebi iptal edilemedi',
            },
          }));
          throw error;
        }
      },

      exportTransactions: async (
        options: TransactionExportOptions
      ): Promise<Blob> => {
        try {
          const format = (options.format || 'CSV').toLowerCase() as
            | 'csv'
            | 'pdf';
          return await walletApi.exportTransactions(format);
        } catch (error) {
          console.error('Failed to export transactions:', error);
          // Fallback to client-side CSV generation
          const { transactions } = get();
          const csv = generateCSV(transactions);
          return new Blob([csv], { type: 'text/csv' });
        }
      },

      // ==================== UI ACTIONS ====================

      setPayoutModalOpen: (open: boolean) => {
        set((state) => ({
          ui: { ...state.ui, payoutModalOpen: open },
        }));
      },

      setSelectedTransaction: (transaction: Transaction | null) => {
        set((state) => ({
          ...state,
          ui: {
            ...state.ui,
            selectedTransaction: transaction,
            transactionDetailModalOpen: !!transaction,
          },
        }));
      },

      setSelectedPayout: (payout: Payout | null) => {
        set((state) => ({
          ...state,
          ui: { ...state.ui, selectedPayout: payout },
        }));
      },

      clearError: () => {
        set((state) => ({
          ui: { ...state.ui, error: null },
        }));
      },

      reset: () => {
        set({
          wallet: null,
          balance: null,
          transactions: [],
          payouts: [],
          eligibility: null,
          limits: null,
          ui: initialUIState,
        });
      },
    }),
    { name: 'WalletStore' }
  )
);

// ================================================
// HELPER FUNCTIONS
// ================================================

function generateCSV(transactions: Transaction[]): string {
  const headers = ['Tarih', 'Tür', 'Tutar', 'Açıklama', 'Bakiye'];
  const rows = transactions.map((t) => [
    new Date(t.createdAt).toLocaleString('tr-TR'),
    t.type,
    t.amount.toString(),
    t.description,
    t.balanceAfter.toString(),
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

// ================================================
// SELECTORS (Hooks)
// ================================================

export const useWallet = () => useWalletStore((state) => state.wallet);
export const useBalance = () => useWalletStore((state) => state.balance);
export const useTransactions = () =>
  useWalletStore((state) => state.transactions);
export const usePayouts = () => useWalletStore((state) => state.payouts);
export const usePayoutEligibility = () =>
  useWalletStore((state) => state.eligibility);
export const usePayoutLimits = () => useWalletStore((state) => state.limits);
export const useWalletUI = () => useWalletStore((state) => state.ui);

// ================================================
// ACTIONS (Hooks)
// ================================================

export const useWalletActions = () => {
  const fetchWallet = useWalletStore((state) => state.fetchWallet);
  const fetchBalance = useWalletStore((state) => state.fetchBalance);
  const fetchTransactions = useWalletStore((state) => state.fetchTransactions);
  const fetchPayouts = useWalletStore((state) => state.fetchPayouts);
  const fetchEligibility = useWalletStore((state) => state.fetchEligibility);
  const fetchLimits = useWalletStore((state) => state.fetchLimits);
  const requestPayout = useWalletStore((state) => state.requestPayout);
  const cancelPayout = useWalletStore((state) => state.cancelPayout);
  const exportTransactions = useWalletStore(
    (state) => state.exportTransactions
  );
  const setPayoutModalOpen = useWalletStore(
    (state) => state.setPayoutModalOpen
  );
  const setSelectedTransaction = useWalletStore(
    (state) => state.setSelectedTransaction
  );
  const setSelectedPayout = useWalletStore((state) => state.setSelectedPayout);
  const clearError = useWalletStore((state) => state.clearError);
  const reset = useWalletStore((state) => state.reset);

  return {
    fetchWallet,
    fetchBalance,
    fetchTransactions,
    fetchPayouts,
    fetchEligibility,
    fetchLimits,
    requestPayout,
    cancelPayout,
    exportTransactions,
    setPayoutModalOpen,
    setSelectedTransaction,
    setSelectedPayout,
    clearError,
    reset,
  };
};
