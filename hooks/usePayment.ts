import { useState, useEffect, useCallback } from 'react';
import { usePaymentStore } from '@/lib/store/payment';
import {
  CreatePaymentRequest,
  Payment,
  PaymentFilters,
  InvoiceDetails as Invoice,
} from '@/types';
import {
  createPaymentRequestSchema,
  paymentFiltersSchema,
  paymentCardSchema,
} from '@/lib/validations/payment';
import { useToast } from '@/hooks/ui';
import { ZodError } from 'zod';

type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';
type EscrowStatus = 'held' | 'released' | 'disputed';

interface UsePaymentReturn {
  // State
  payments: Payment[];
  paymentHistory: Payment[];
  invoices: Invoice[];
  loading: boolean;
  error: string | null;

  // Payment operations
  createPayment: (request: CreatePaymentRequest) => Promise<boolean>;
  refundPayment: (
    paymentId: string,
    amount: number,
    reason: string
  ) => Promise<boolean>;
  releaseEscrow: (
    paymentId: string,
    amount?: number,
    reason?: string
  ) => Promise<boolean>;
  generateInvoice: (
    orderId: string,
    paymentId: string
  ) => Promise<Invoice | null>;

  // Data fetching
  fetchPaymentHistory: (filters?: PaymentFilters) => Promise<void>;
  fetchPaymentById: (paymentId: string) => Promise<Payment | null>;

  // Form helpers
  validatePaymentForm: (data: Record<string, unknown>) => {
    isValid: boolean;
    errors: Record<string, string>;
  };
  validateCardDetails: (cardData: Record<string, unknown>) => {
    isValid: boolean;
    errors: Record<string, string>;
  };

  // UI helpers
  formatPaymentAmount: (amount: number, currency?: string) => string;
  getPaymentStatusColor: (status: PaymentStatus) => string;
  getEscrowStatusText: (status: EscrowStatus) => string;
  getPaymentMethodIcon: (method: string) => string;

  // Filters and search
  applyFilters: (filters: PaymentFilters) => void;
  clearFilters: () => void;
  searchPayments: (query: string) => Payment[];
}

export const usePayment = (): UsePaymentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { error: toastError, success } = useToast();

  const {
    payments,
    paymentHistory,
    invoices,
    createPayment: storeCreatePayment,
    fetchPaymentHistory: storeFetchPaymentHistory,
    fetchPaymentById: storeFetchPaymentById,
    requestRefund: storeRequestRefund,
    releaseEscrow: storeReleaseEscrow,
    generateInvoice: storeGenerateInvoice,
    setFilters,
    clearFilters: storeClearFilters,
  } = usePaymentStore();

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleError = useCallback(
    (error: Error | unknown, defaultMessage: string) => {
      console.error('Payment operation error:', error);
      const message = error instanceof Error ? error.message : defaultMessage;
      setError(message);
      toastError('Hata', message);
    },
    [toastError]
  );

  const createPayment = useCallback(
    async (request: CreatePaymentRequest): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await storeCreatePayment(request);
        success('Başarılı', 'Ödeme işleminiz başarıyla tamamlandı.');
        return true;
      } catch (error) {
        handleError(error, 'Ödeme oluşturulurken bir hata oluştu');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [storeCreatePayment, handleError, success]
  );

  const refundPayment = useCallback(
    async (
      paymentId: string,
      amount: number,
      reason: string
    ): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await storeRequestRefund(paymentId, amount, reason);
        success('Başarılı', 'Ödeme iadesi başarıyla işleme alındı.');
        return true;
      } catch (error) {
        handleError(error, 'İade işlemi sırasında bir hata oluştu');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [storeRequestRefund, handleError, success]
  );

  const releaseEscrow = useCallback(
    async (
      paymentId: string,
      amount?: number,
      reason?: string
    ): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await storeReleaseEscrow(paymentId, amount, reason);
        success('Başarılı', 'Escrow tutarı başarıyla serbest bırakıldı.');
        return true;
      } catch (error) {
        handleError(error, 'Escrow serbest bırakma işlemi başarısız');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [storeReleaseEscrow, handleError, success]
  );

  const generateInvoice = useCallback(
    async (orderId: string, paymentId: string): Promise<Invoice | null> => {
      try {
        setLoading(true);
        setError(null);

        const invoice = await storeGenerateInvoice(orderId, paymentId);
        success('Başarılı', 'Faturanız başarıyla oluşturuldu.');
        return invoice;
      } catch (error) {
        handleError(error, 'Fatura oluşturulurken bir hata oluştu');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [storeGenerateInvoice, handleError, success]
  );

  const fetchPaymentHistory = useCallback(
    async (filters?: PaymentFilters): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        await storeFetchPaymentHistory(filters);
      } catch (error) {
        handleError(error, 'Ödeme geçmişi yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    },
    [storeFetchPaymentHistory, handleError]
  );

  const fetchPaymentById = useCallback(
    async (paymentId: string): Promise<Payment | null> => {
      try {
        setLoading(true);
        setError(null);

        return await storeFetchPaymentById(paymentId);
      } catch (error) {
        handleError(error, 'Ödeme bilgileri yüklenirken bir hata oluştu');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [storeFetchPaymentById, handleError]
  );

  const validatePaymentForm = useCallback(
    (
      data: Record<string, unknown>
    ): { isValid: boolean; errors: Record<string, string> } => {
      try {
        createPaymentRequestSchema.parse(data);
        return { isValid: true, errors: {} };
      } catch (error) {
        if (error instanceof ZodError) {
          const errors: Record<string, string> = {};
          error.issues.forEach((issue) => {
            const path = issue.path.join('.');
            errors[path] = issue.message;
          });
          return { isValid: false, errors };
        }
        return {
          isValid: false,
          errors: { general: 'Doğrulama hatası oluştu' },
        };
      }
    },
    []
  );

  const validateCardDetails = useCallback(
    (
      cardData: Record<string, unknown>
    ): { isValid: boolean; errors: Record<string, string> } => {
      try {
        paymentCardSchema.parse(cardData);
        return { isValid: true, errors: {} };
      } catch (error) {
        if (error instanceof ZodError) {
          const errors: Record<string, string> = {};
          error.issues.forEach((issue) => {
            const path = issue.path.join('.');
            errors[path] = issue.message;
          });
          return { isValid: false, errors };
        }
        return {
          isValid: false,
          errors: { general: 'Kart bilgileri doğrulama hatası' },
        };
      }
    },
    []
  );

  const formatPaymentAmount = useCallback(
    (amount: number, currency: string = 'TRY'): string => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    },
    []
  );

  const getPaymentStatusColor = useCallback((status: PaymentStatus): string => {
    const statusColors: Record<PaymentStatus, string> = {
      pending: 'text-yellow-600 bg-yellow-50',
      processing: 'text-blue-600 bg-blue-50',
      completed: 'text-green-600 bg-green-50',
      failed: 'text-red-600 bg-red-50',
      cancelled: 'text-gray-600 bg-gray-50',
      refunded: 'text-purple-600 bg-purple-50',
    };
    return statusColors[status] || 'text-gray-600 bg-gray-50';
  }, []);

  const getEscrowStatusText = useCallback((status: EscrowStatus): string => {
    const statusTexts: Record<EscrowStatus, string> = {
      held: 'Emanette',
      released: 'Serbest Bırakıldı',
      disputed: 'Anlaşmazlık',
    };
    return statusTexts[status] || 'Bilinmiyor';
  }, []);

  const getPaymentMethodIcon = useCallback((method: string): string => {
    const methodIcons: Record<string, string> = {
      credit_card: '💳',
      bank_transfer: '🏦',
      digital_wallet: '📱',
      crypto: '₿',
    };
    return methodIcons[method] || '💳';
  }, []);

  const applyFilters = useCallback(
    (filters: PaymentFilters): void => {
      try {
        const validFilters = paymentFiltersSchema.parse(filters);
        setFilters(validFilters);
        fetchPaymentHistory(validFilters);
      } catch (error) {
        handleError(error, 'Filtre uygulanırken bir hata oluştu');
      }
    },
    [setFilters, fetchPaymentHistory, handleError]
  );

  const clearFilters = useCallback((): void => {
    storeClearFilters();
    fetchPaymentHistory();
  }, [storeClearFilters, fetchPaymentHistory]);

  const searchPayments = useCallback(
    (query: string): Payment[] => {
      if (!query.trim()) return payments;

      const lowerQuery = query.toLowerCase();
      return payments.filter(
        (payment) =>
          payment.id.toLowerCase().includes(lowerQuery) ||
          payment.orderId.toLowerCase().includes(lowerQuery) ||
          payment.paymentId?.toLowerCase().includes(lowerQuery) ||
          payment.method?.toLowerCase().includes(lowerQuery)
      );
    },
    [payments]
  );

  // Get array of payments from paymentHistory
  const paymentHistoryArray = paymentHistory?.payments || [];

  return {
    // State
    payments,
    paymentHistory: paymentHistoryArray,
    invoices,
    loading,
    error,

    // Payment operations
    createPayment,
    refundPayment,
    releaseEscrow,
    generateInvoice,

    // Data fetching
    fetchPaymentHistory,
    fetchPaymentById,

    // Form helpers
    validatePaymentForm,
    validateCardDetails,

    // UI helpers
    formatPaymentAmount,
    getPaymentStatusColor,
    getEscrowStatusText,
    getPaymentMethodIcon,

    // Filters and search
    applyFilters,
    clearFilters,
    searchPayments,
  };
};

export default usePayment;
