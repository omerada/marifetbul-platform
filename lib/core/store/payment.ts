import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Payment,
  PaymentHistory,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentFilters,
  InvoiceDetails,
  EscrowDetails,
  PaymentError,
  PaymentMethod,
} from '@/types';

interface PaymentState {
  // Payment data
  payments: Payment[];
  paymentHistory: PaymentHistory | null;
  currentPayment: Payment | null;

  // Invoice data
  invoices: InvoiceDetails[];
  currentInvoice: InvoiceDetails | null;

  // Escrow data
  escrowDetails: EscrowDetails[];

  // Payment methods
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod | null;

  // Loading states
  isLoading: boolean;
  isCreatingPayment: boolean;
  isFetchingHistory: boolean;
  isFetchingInvoices: boolean;
  isProcessingRefund: boolean;
  isReleasingEscrow: boolean;

  // Error states
  error: PaymentError | null;
  lastError: string | null;

  // Filters and pagination
  filters: PaymentFilters;
  currentPage: number;
  totalPages: number;

  // Form states
  selectedPaymentMethod: string | null;
  isFormSubmitting: boolean;
}

interface PaymentActions {
  // Payment operations
  createPayment: (data: CreatePaymentRequest) => Promise<CreatePaymentResponse>;
  fetchPaymentHistory: (filters?: PaymentFilters) => Promise<void>;
  fetchPaymentById: (paymentId: string) => Promise<Payment | null>;

  // Payment methods
  fetchPaymentMethods: () => Promise<void>;
  addPaymentMethod: (
    method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  removePaymentMethod: (methodId: string) => Promise<void>;
  setDefaultPaymentMethod: (methodId: string) => Promise<void>;

  // Invoice operations
  fetchInvoices: (filters?: {
    orderId?: string;
    paymentId?: string;
  }) => Promise<void>;
  generateInvoice: (
    orderId: string,
    paymentId: string
  ) => Promise<InvoiceDetails>;
  downloadInvoice: (
    invoiceId: string,
    format?: 'pdf' | 'xml'
  ) => Promise<string>;

  // Escrow operations
  fetchEscrowDetails: (paymentId: string) => Promise<EscrowDetails | null>;
  releaseEscrow: (
    paymentId: string,
    amount?: number,
    reason?: string
  ) => Promise<void>;

  // Refund operations
  requestRefund: (
    paymentId: string,
    amount: number,
    reason: string
  ) => Promise<void>;

  // Filter and pagination
  setFilters: (filters: Partial<PaymentFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;

  // Form operations
  setSelectedPaymentMethod: (methodId: string | null) => void;

  // State management
  clearError: () => void;
  clearCurrentPayment: () => void;
  clearCurrentInvoice: () => void;
  reset: () => void;
}

type PaymentStore = PaymentState & PaymentActions;

const initialState: PaymentState = {
  // Payment data
  payments: [],
  paymentHistory: null,
  currentPayment: null,

  // Invoice data
  invoices: [],
  currentInvoice: null,

  // Escrow data
  escrowDetails: [],

  // Payment methods
  paymentMethods: [],
  defaultPaymentMethod: null,

  // Loading states
  isLoading: false,
  isCreatingPayment: false,
  isFetchingHistory: false,
  isFetchingInvoices: false,
  isProcessingRefund: false,
  isReleasingEscrow: false,

  // Error states
  error: null,
  lastError: null,

  // Filters and pagination
  filters: {},
  currentPage: 1,
  totalPages: 1,

  // Form states
  selectedPaymentMethod: null,
  isFormSubmitting: false,
};

export const usePaymentStore = create<PaymentStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Payment operations
      createPayment: async (
        data: CreatePaymentRequest
      ): Promise<CreatePaymentResponse> => {
        set({ isCreatingPayment: true, error: null });

        try {
          const response = await fetch('/api/v1/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const result: CreatePaymentResponse = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Ödeme oluşturulamadı');
          }

          // Refresh payment history after successful payment
          if (result.success && result.data?.status === 'completed') {
            get().fetchPaymentHistory();
          }

          return result;
        } catch (error) {
          const paymentError: PaymentError = {
            code: 'PAYMENT_CREATION_FAILED',
            message: error instanceof Error ? error.message : 'Bilinmeyen hata',
            retryable: true,
            userMessage: 'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.',
          };

          set({ error: paymentError, lastError: paymentError.message });
          throw paymentError;
        } finally {
          set({ isCreatingPayment: false });
        }
      },

      fetchPaymentHistory: async (filters?: PaymentFilters): Promise<void> => {
        set({ isFetchingHistory: true, error: null });

        try {
          const queryParams = new URLSearchParams();
          const currentFilters = { ...get().filters, ...filters };

          // Build query parameters
          Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                value.forEach((v) => queryParams.append(key, v.toString()));
              } else {
                queryParams.append(key, value.toString());
              }
            }
          });

          const response = await fetch(
            `/api/v1/payments/history?${queryParams.toString()}`
          );
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Ödeme geçmişi alınamadı');
          }

          set({
            paymentHistory: result.data,
            payments: result.data.payments,
            filters: currentFilters,
            totalPages: result.data.pagination?.totalPages || 1,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Ödeme geçmişi yüklenemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isFetchingHistory: false });
        }
      },

      fetchPaymentById: async (paymentId: string): Promise<Payment | null> => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/v1/payments/${paymentId}`);
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Ödeme bilgisi alınamadı');
          }

          set({ currentPayment: result.data });
          return result.data;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Ödeme bilgisi yüklenemedi';
          set({ lastError: errorMessage });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      // Payment methods
      fetchPaymentMethods: async (): Promise<void> => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/v1/payment-methods');
          const result = await response.json();

          if (result.success) {
            const defaultMethod = result.data.find(
              (method: PaymentMethod) => method.isDefault
            );
            set({
              paymentMethods: result.data,
              defaultPaymentMethod: defaultMethod || null,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Ödeme yöntemleri yüklenemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      addPaymentMethod: async (
        method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>
      ): Promise<void> => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/v1/payment-methods', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(method),
          });

          const result = await response.json();

          if (result.success) {
            await get().fetchPaymentMethods();
          } else {
            throw new Error(result.error || 'Ödeme yöntemi eklenemedi');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Ödeme yöntemi eklenemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      removePaymentMethod: async (methodId: string): Promise<void> => {
        set({ isLoading: true });

        try {
          const response = await fetch(`/api/v1/payment-methods/${methodId}`, {
            method: 'DELETE',
          });

          const result = await response.json();

          if (result.success) {
            await get().fetchPaymentMethods();
          } else {
            throw new Error(result.error || 'Ödeme yöntemi silinemedi');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Ödeme yöntemi silinemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      setDefaultPaymentMethod: async (methodId: string): Promise<void> => {
        set({ isLoading: true });

        try {
          const response = await fetch(
            `/api/v1/payment-methods/${methodId}/default`,
            {
              method: 'PUT',
            }
          );

          const result = await response.json();

          if (result.success) {
            await get().fetchPaymentMethods();
          } else {
            throw new Error(
              result.error || 'Varsayılan ödeme yöntemi ayarlanamadı'
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Varsayılan ödeme yöntemi ayarlanamadı';
          set({ lastError: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      // Invoice operations
      fetchInvoices: async (filters?: {
        orderId?: string;
        paymentId?: string;
      }): Promise<void> => {
        set({ isFetchingInvoices: true });

        try {
          const queryParams = new URLSearchParams();
          if (filters?.orderId) queryParams.append('orderId', filters.orderId);
          if (filters?.paymentId)
            queryParams.append('paymentId', filters.paymentId);

          const response = await fetch(
            `/api/v1/invoices?${queryParams.toString()}`
          );
          const result = await response.json();

          if (result.success) {
            set({ invoices: result.data });
          } else {
            throw new Error(result.error || 'Faturalar alınamadı');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Faturalar yüklenemedi';
          set({ lastError: errorMessage });
        } finally {
          set({ isFetchingInvoices: false });
        }
      },

      generateInvoice: async (
        orderId: string,
        paymentId: string
      ): Promise<InvoiceDetails> => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/v1/invoices/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, paymentId }),
          });

          const result = await response.json();

          if (result.success) {
            set({ currentInvoice: result.data });
            return result.data;
          } else {
            throw new Error(result.error || 'Fatura oluşturulamadı');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Fatura oluşturulamadı';
          set({ lastError: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      downloadInvoice: async (
        invoiceId: string,
        format: 'pdf' | 'xml' = 'pdf'
      ): Promise<string> => {
        try {
          const response = await fetch(
            `/api/v1/invoices/${invoiceId}/download?format=${format}`
          );
          const result = await response.json();

          if (result.success) {
            return result.data.downloadUrl;
          } else {
            throw new Error(result.error || 'Fatura indirilemedi');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Fatura indirilemedi';
          set({ lastError: errorMessage });
          throw error;
        }
      },

      // Escrow operations
      fetchEscrowDetails: async (
        paymentId: string
      ): Promise<EscrowDetails | null> => {
        set({ isLoading: true });

        try {
          const response = await fetch(`/api/v1/payments/${paymentId}/escrow`);
          const result = await response.json();

          if (result.success && result.data) {
            const escrowDetails = result.data;
            set((state) => ({
              escrowDetails: [
                ...state.escrowDetails.filter((e) => e.paymentId !== paymentId),
                escrowDetails,
              ],
            }));
            return escrowDetails;
          }
          return null;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Escrow bilgileri alınamadı';
          set({ lastError: errorMessage });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      releaseEscrow: async (
        paymentId: string,
        amount?: number,
        reason?: string
      ): Promise<void> => {
        set({ isReleasingEscrow: true });

        try {
          const response = await fetch(
            `/api/v1/payments/${paymentId}/escrow/release`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount, reason }),
            }
          );

          const result = await response.json();

          if (result.success) {
            // Refresh escrow details and payment info
            await get().fetchEscrowDetails(paymentId);
            await get().fetchPaymentById(paymentId);
          } else {
            throw new Error(result.error || 'Escrow serbest bırakılamadı');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Escrow serbest bırakılamadı';
          set({ lastError: errorMessage });
        } finally {
          set({ isReleasingEscrow: false });
        }
      },

      // Refund operations
      requestRefund: async (
        paymentId: string,
        amount: number,
        reason: string
      ): Promise<void> => {
        set({ isProcessingRefund: true });

        try {
          const response = await fetch(`/api/v1/payments/${paymentId}/refund`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, reason }),
          });

          const result = await response.json();

          if (result.success) {
            // Refresh payment history
            await get().fetchPaymentHistory();
          } else {
            throw new Error(result.error || 'İade işlemi başlatılamadı');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'İade işlemi başlatılamadı';
          set({ lastError: errorMessage });
        } finally {
          set({ isProcessingRefund: false });
        }
      },

      // Filter and pagination
      setFilters: (filters: Partial<PaymentFilters>): void => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          currentPage: 1, // Reset to first page when filters change
        }));
      },

      clearFilters: (): void => {
        set({ filters: {}, currentPage: 1 });
      },

      setPage: (page: number): void => {
        set({ currentPage: page });
      },

      // Form operations
      setSelectedPaymentMethod: (methodId: string | null): void => {
        set({ selectedPaymentMethod: methodId });
      },

      // State management
      clearError: (): void => {
        set({ error: null, lastError: null });
      },

      clearCurrentPayment: (): void => {
        set({ currentPayment: null });
      },

      clearCurrentInvoice: (): void => {
        set({ currentInvoice: null });
      },

      reset: (): void => {
        set(initialState);
      },
    }),
    {
      name: 'payment-store',
    }
  )
);

// Selectors for easy access to computed values
export const usePaymentSelectors = () => {
  const store = usePaymentStore();

  return {
    // Computed values
    hasPayments: store.payments.length > 0,
    hasInvoices: store.invoices.length > 0,
    totalPaymentAmount: store.paymentHistory?.summary?.totalAmount || 0,
    successfulPaymentsCount:
      store.paymentHistory?.summary?.successfulPayments || 0,
    failedPaymentsCount: store.paymentHistory?.summary?.failedPayments || 0,
    hasActiveEscrow: store.escrowDetails.some((e) => e.status === 'held'),

    // Loading states
    isAnyLoading:
      store.isLoading ||
      store.isCreatingPayment ||
      store.isFetchingHistory ||
      store.isFetchingInvoices,

    // Error states
    hasError: !!store.error || !!store.lastError,
    errorMessage: store.error?.userMessage || store.lastError,

    // Filters
    hasActiveFilters: Object.keys(store.filters).length > 0,

    // Pagination
    isFirstPage: store.currentPage === 1,
    isLastPage: store.currentPage >= store.totalPages,
  };
};
