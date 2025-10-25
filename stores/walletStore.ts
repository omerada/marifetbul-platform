import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiClient } from '@/lib/api';
import { WALLET_ENDPOINTS } from '@/lib/api/endpoints';
import {
  PayoutStatus,
  type Transaction,
  type Payout,
  type PayoutRequest,
  type TransactionFilters,
  type TransactionExportOptions,
  type WalletUIState,
  type WalletStore,
  type WalletResponse,
  type BalanceResponse,
  type PayoutEligibilityResponse,
  type PayoutLimitsResponse,
} from '@/types/business/features/wallet';

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
          const data = await apiClient.get<{
            wallet: WalletResponse;
            balance: BalanceResponse;
            recentTransactions?: Transaction[];
          }>(WALLET_ENDPOINTS.GET_WALLET);

          set({
            wallet: data.wallet,
            balance: data.balance,
            transactions: data.recentTransactions || [],
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
          const data = await apiClient.get<BalanceResponse>(
            WALLET_ENDPOINTS.GET_BALANCE
          );
          set({ balance: data });
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
          const params = new URLSearchParams();
          params.append('page', page.toString());
          params.append('size', '20');

          if (filters?.type) params.append('type', filters.type);
          if (filters?.startDate) params.append('startDate', filters.startDate);
          if (filters?.endDate) params.append('endDate', filters.endDate);
          if (filters?.minAmount)
            params.append('minAmount', filters.minAmount.toString());
          if (filters?.maxAmount)
            params.append('maxAmount', filters.maxAmount.toString());

          const data = await apiClient.get<{
            content: Transaction[];
          }>(`${WALLET_ENDPOINTS.GET_TRANSACTIONS}?${params.toString()}`);

          set({
            transactions: data.content,
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
          const data = await apiClient.get<{ content: Payout[] }>(
            `${WALLET_ENDPOINTS.GET_PAYOUT_HISTORY}?page=${page}&size=10`
          );

          set({
            payouts: data.content,
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
          const data = await apiClient.get<PayoutEligibilityResponse>(
            WALLET_ENDPOINTS.GET_ELIGIBILITY
          );
          set({ eligibility: data });
        } catch (error) {
          console.error('Failed to fetch eligibility:', error);
          throw error;
        }
      },

      fetchLimits: async () => {
        try {
          const data = await apiClient.get<PayoutLimitsResponse>(
            WALLET_ENDPOINTS.GET_LIMITS
          );
          set({ limits: data });
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
          const responseData = await apiClient.post<{ payout: Payout }>(
            WALLET_ENDPOINTS.CREATE_PAYOUT,
            data
          );

          const newPayout = responseData.payout;

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
          await apiClient.post(WALLET_ENDPOINTS.CANCEL_PAYOUT(payoutId));

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
          // Build query string from options
          const params = new URLSearchParams();
          if (options.format) params.append('format', options.format);
          if (options.dateRange?.startDate)
            params.append('startDate', options.dateRange.startDate);
          if (options.dateRange?.endDate)
            params.append('endDate', options.dateRange.endDate);
          if (options.filters?.type)
            params.append('type', options.filters.type);

          const queryString = params.toString();
          const endpoint = `${WALLET_ENDPOINTS.EXPORT_TRANSACTIONS}${queryString ? `?${queryString}` : ''}`;

          // Use fetch directly for blob response
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
            {
              credentials: 'include',
              headers: {
                Accept: 'text/csv,application/pdf',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Export failed');
          }

          return await response.blob();
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
          ui: {
            ...state.ui,
            selectedTransaction: transaction,
            transactionDetailModalOpen: !!transaction,
          },
        }));
      },

      setSelectedPayout: (payout: Payout | null) => {
        set((state) => ({
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
